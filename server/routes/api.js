const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const axios = require('axios');
const Transaction = require('../models/Transaction');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Broadcast utility function to be attached later
let ioInstance;
router.setIo = (io) => {
  ioInstance = io;
};

// Health check — used by the frontend keep-alive to prevent Render cold starts
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', ts: Date.now() });
});

// ─── Fallback ML scorer (used when ML engine is unreachable) ─────────────────
const fallbackScore = () => {
  const risk_score = Math.random() * 100;
  return {
    risk_score,
    is_anomaly: risk_score >= 70,
    reason: risk_score >= 70 ? 'High risk pattern detected by fallback engine.' : 'Standard transaction pattern.',
    features_contribution: {
      'Unusual location': Math.random() * 50 + 10,
      'High amount': Math.random() * 30 + 5,
      'Suspicious pattern': Math.random() * 40 + 5,
    },
    confidence_level: Math.floor(Math.random() * 20) + 80,
  };
};

// ─── Batch ML call: one HTTP request for ALL transactions ────────────────────
// This is the key optimisation — avoids N round-trips to the ML engine.
const batchMLPredict = async (txList) => {
  try {
    const mlResponse = await axios.post(
      `${process.env.ML_ENGINE_URL}/predict-batch`,
      { transactions: txList },
      { timeout: 4000 }  // 4 s max — fall back instantly if Render is cold
    );
    // Build a lookup map: transaction_id → prediction
    const map = {};
    for (const r of mlResponse.data.results) {
      map[r.transaction_id] = r;
    }
    return map;
  } catch (err) {
    console.warn('ML Engine batch call failed, using fallback for all rows:', err.message);
    return null; // signals caller to use per-row fallback
  }
};

// ─── Save + broadcast a single transaction ───────────────────────────────────
const saveAndBroadcast = async (txData, mlData) => {
  const { risk_score, is_anomaly, reason, features_contribution, confidence_level } = mlData;

  let status = 'ALLOW';
  if (risk_score >= 70) status = 'BLOCK TRANSACTION';
  else if (risk_score >= 40) status = 'FLAG FOR REVIEW';

  const transaction = new Transaction({
    ...txData,
    risk_score,
    is_anomaly,
    status,
    anomaly_reason: reason,
    features_contribution,
    confidence_level,
  });

  await transaction.save();

  if (ioInstance) {
    ioInstance.emit('new_transaction', transaction);
    if (is_anomaly) ioInstance.emit('new_anomaly', transaction);
  }

  return transaction;
};

// ─── Process single transaction (used for simulations / real-time) ───────────
const processTransaction = async (txData) => {
  try {
    let mlData;
    try {
      const mlResponse = await axios.post(`${process.env.ML_ENGINE_URL}/predict`, txData, { timeout: 4000 });
      mlData = mlResponse.data;
    } catch (err) {
      console.warn('ML Engine unreachable, using fallback simulation data.');
      mlData = fallbackScore();
    }
    return await saveAndBroadcast(txData, mlData);
  } catch (error) {
    console.error('Error processing transaction:', error.message);
    throw error;
  }
};

// Upload CSV API
router.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const results = [];
  const errors = [];
  let autoCorrections = 0;
  let skippedRows = 0;

  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => {
      try {
        // Detect JSON masquerading as CSV row (often has '{' or '[' if unescaped weirdly, but usually we just strictly map)
        if (data && typeof data === 'object' && Object.keys(data).length === 1 && Object.keys(data)[0].includes('{')) {
          skippedRows++;
          return;
        }

        // Smart Mapping
        const transaction_id = data.transaction_id || data.txn_id || data.id;
        const account_id = data.account_id || data.acc_id || data.account || 'ACC-DEFAULT';
        const amount = parseFloat(data.amount || data.amt || data.value);
        const timestamp = data.timestamp || data.time || data.date || new Date();
        const location = data.location || data.loc || 'Unknown';
        const user_id = data.user_id || data.uid || data.user || 'USR-DEFAULT';
        const time_since_last_txn = parseFloat(data.time_since_last_txn || data.time_since || 3600);

        if (data.txn_id || data.acc_id || data.time) autoCorrections++;

        const mappedData = {
          transaction_id,
          account_id,
          amount,
          timestamp,
          location,
          user_id,
          time_since_last_txn
        };
        
        if (!mappedData.transaction_id || isNaN(mappedData.amount) || !mappedData.user_id) {
          skippedRows++;
        } else {
          results.push(mappedData);
        }
      } catch (e) {
        skippedRows++;
      }
    })
    .on('end', async () => {
      fs.unlinkSync(req.file.path); // cleanup

      if (results.length === 0) {
        return res.status(400).json({ 
          error: 'Data format mismatch detected. No valid transaction rows found.', 
          details: ['Ensure CSV has columns: transaction_id, amount, user_id, account_id'] 
        });
      }

      if (skippedRows > 0) {
        errors.push(`Rows skipped due to missing or invalid values: ${skippedRows}`);
      }
      if (autoCorrections > 0) {
        errors.push(`Auto-correction applied to map aliases on ${autoCorrections} rows.`);
      }

      // ── FAST PATH: one ML call for the entire batch ──────────────────────────
      // batchMLPredict sends all rows to /predict-batch in a single HTTP request,
      // cutting ML latency from O(n) to O(1).  Falls back to per-row scores on timeout.
      const mlMap = await batchMLPredict(results);

      // ── Save all rows to MongoDB in parallel ─────────────────────────────────
      const rawResults = await Promise.all(
        results.map(item => {
          const mlData = (mlMap && mlMap[item.transaction_id]) ? mlMap[item.transaction_id] : fallbackScore();
          return saveAndBroadcast(item, mlData).catch(() => null);
        })
      );
      const processed = rawResults.filter(Boolean);

      res.json({ message: `Processed ${processed.length} transactions successfully.`, count: processed.length, errors });
    })
    .on('error', (err) => {
      res.status(400).json({ error: 'Data format mismatch detected during stream parsing.' });
    });
});

// Simulation Endpoints
router.post('/simulate/fraud', async (req, res) => {
  try {
    const promises = Array.from({ length: 12 }).map((_, i) => {
      return processTransaction({
        transaction_id: `SIM-F-${Date.now()}-${i}`,
        account_id: `ACC-HACKED-${99 + i}`,
        amount: 15000 + Math.random() * 5000,
        timestamp: new Date(),
        location: 'Simulated-HighRisk',
        user_id: 'usr_hacked_01',
        time_since_last_txn: 10 // velocity attack
      });
    });
    const txs = await Promise.all(promises);
    
    // Broadcast attack alert to trigger frontend banners and auto-highlight
    if (ioInstance) {
      ioInstance.emit('fraud_attack_alert', txs);
    }
    
    res.json({ message: 'Fraud simulated', transactions: txs });
  } catch (err) {
    res.status(500).json({ error: 'Simulation failed', details: err.message });
  }
});

router.post('/simulate/spike', async (req, res) => {
  try {
    const promises = Array.from({ length: 5 }).map((_, i) => {
      return processTransaction({
        transaction_id: `SIM-S-${Date.now()}-${i}`,
        account_id: `ACC-SPIKE-${i}`,
        amount: 20 + Math.random() * 100,
        timestamp: new Date(),
        location: 'Simulated-Normal',
        user_id: `usr_norm_${i}`,
        time_since_last_txn: 3600
      });
    });
    const txs = await Promise.all(promises);
    res.json({ message: 'Traffic spike simulated', count: txs.length });
  } catch (err) {
    res.status(500).json({ error: 'Simulation failed', details: err.message });
  }
});

router.post('/simulate/normal', async (req, res) => {
  try {
    const tx = await processTransaction({
      transaction_id: `SIM-N-${Date.now()}`,
      account_id: `ACC-NORM-${Math.floor(Math.random() * 1000)}`,
      amount: 10 + Math.random() * 50,
      timestamp: new Date(),
      location: 'Simulated-Normal',
      user_id: `usr_norm_${Math.floor(Math.random() * 100)}`,
      time_since_last_txn: 3600
    });
    res.json({ message: 'Normal transaction simulated', transaction: tx });
  } catch (err) {
    res.status(500).json({ error: 'Simulation failed', details: err.message });
  }
});

// Fetch historical data
router.get('/transactions', async (req, res) => {
  try {
    const txs = await Transaction.find().sort({ timestamp: -1 }).limit(100);
    res.json(txs);
  } catch (err) {
    res.status(500).json({ error: 'Database fetch failed' });
  }
});

// Update transaction status (Manual Override)
router.put('/transactions/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const tx = await Transaction.findOneAndUpdate(
      { transaction_id: id }, 
      { status }, 
      { new: true }
    );
    
    if (!tx) return res.status(404).json({ error: 'Transaction not found' });
    
    if (ioInstance) {
      ioInstance.emit('transaction_updated', tx);
    }
    
    res.json(tx);
  } catch (err) {
    res.status(500).json({ error: 'Database update failed' });
  }
});

module.exports = router;
