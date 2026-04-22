const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  transaction_id: { type: String, required: true },
  account_id: { type: String, required: true },
  amount: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
  location: { type: String },
  user_id: { type: String, required: true },
  time_since_last_txn: { type: Number, default: 0 },
  risk_score: { type: Number, default: 0 },
  is_anomaly: { type: Boolean, default: false },
  status: { type: String, default: 'ALLOW' },
  anomaly_reason: { type: String },
  features_contribution: { type: Object },
  confidence_level: { type: Number }
});

module.exports = mongoose.model('Transaction', transactionSchema);
