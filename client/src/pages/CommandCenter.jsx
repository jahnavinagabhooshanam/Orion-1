import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldAlert, Crosshair, Cpu, CheckCircle, XCircle, Search, Filter } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const socketUrl = rawApiUrl.endsWith('/') ? rawApiUrl.slice(0, -1) : rawApiUrl;

export default function CommandCenter() {
  const { currentUser } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [systemStatus, setSystemStatus] = useState('ARMED');
  const [toast, setToast] = useState(null);

  const fetchTransactions = () => {
    axios.get(`${socketUrl}/api/transactions`).then(res => {
      // Deduplicate by transaction_id, keeping the last (most recent) occurrence
      const seen = new Map();
      res.data.forEach(t => seen.set(t.transaction_id, t));
      const unique = Array.from(seen.values()).filter(t => t.risk_score >= 20);
      setTransactions(unique);
    }).catch(console.error);
  };

  useEffect(() => {
    fetchTransactions();
    const interval = setInterval(fetchTransactions, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleOverride = async (id, action) => {
    const newStatus = action === 'block' ? 'MANUALLY BLOCKED' : 'MANUALLY ALLOWED';

    // Show toast
    setToast('Override accepted');
    setTimeout(() => {
      setToast(action === 'block' ? 'Transaction blocked' : 'Transaction released');
      setTimeout(() => setToast(null), 2000);
    }, 600);

    // Optimistic UI update for override
    setTransactions(prev => prev.map(tx => {
      if (tx.transaction_id === id) {
        return { 
          ...tx, 
          status: newStatus
        };
      }
      return tx;
    }));

    // Persist to backend database
    try {
      await axios.put(`${socketUrl}/api/transactions/${id}/status`, { status: newStatus });
    } catch (err) {
      console.error('Failed to override transaction status in backend:', err);
      // We could revert the UI state here, but for this demo, logging is sufficient.
    }
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [decisionFilter, setDecisionFilter] = useState('ALL');

  const filteredTransactions = transactions.filter(tx => {
    // Search filter
    const s = searchTerm.toLowerCase();
    const matchesSearch = !s ||
      (tx.transaction_id || '').toLowerCase().includes(s) ||
      (tx.user_id || '').toLowerCase().includes(s) ||
      (tx.account_id || '').toLowerCase().includes(s);

    // Risk filter
    let matchesRisk = true;
    const score = Number(tx.risk_score);
    if (riskFilter === 'LOW')    matchesRisk = score < 40;
    else if (riskFilter === 'MEDIUM') matchesRisk = score >= 40 && score < 70;
    else if (riskFilter === 'HIGH')   matchesRisk = score >= 70;

    // Decision filter — use strict keyword matching
    let matchesDecision = true;
    if (decisionFilter !== 'ALL') {
      const status = (tx.status || '').toUpperCase().trim();
      if (decisionFilter === 'BLOCKED') {
        // matches 'BLOCK TRANSACTION' and 'MANUALLY BLOCKED'
        matchesDecision = status.includes('BLOCK');
      } else if (decisionFilter === 'FLAGGED') {
        // matches 'FLAG FOR REVIEW'
        matchesDecision = status.includes('FLAG');
      } else if (decisionFilter === 'ALLOWED') {
        // matches 'ALLOW' and 'MANUALLY ALLOWED'
        matchesDecision = status.includes('ALLOW');
      }
    }

    return matchesSearch && matchesRisk && matchesDecision;
  });

  return (
    <div className="flex-1 p-6 lg:p-8 flex flex-col gap-6 relative overflow-x-hidden">
      
      {/* Toast Notification */}
      {toast && (
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-50 animate-slide-in">
          <div className="bg-darker border border-primary/50 shadow-[0_0_15px_rgba(59,130,246,0.3)] px-6 py-3 rounded-full flex items-center gap-3">
            <CheckCircle className="text-primary w-5 h-5" />
            <span className="font-mono text-sm tracking-widest uppercase text-white">{toast}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-end border-b border-gray-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-widest flex items-center gap-3">
            <Crosshair className="text-danger w-8 h-8" />
            AI COMMAND CENTER
          </h1>
          <p className="text-gray-400 mt-2 tracking-wide uppercase text-sm">Central Node • Autonomous Override Panel</p>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">System Status</div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-danger animate-pulse"></span>
            <span className="font-mono text-danger font-bold tracking-widest">{systemStatus}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="glass-panel p-1 rounded-xl flex-1 flex flex-col overflow-hidden">
        <div className="bg-dark/80 px-4 py-3 border-b border-gray-800 flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4 text-warning" />
            Active Threats Matrix
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-darker px-2 py-1 rounded-lg border border-gray-800">
              <Filter className="w-4 h-4 text-gray-500" />
              <select 
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
                className="bg-transparent text-sm text-gray-300 focus:outline-none"
              >
                <option value="ALL">All Risks</option>
                <option value="HIGH">High (&ge; 70)</option>
                <option value="MEDIUM">Medium (40-69)</option>
                <option value="LOW">Low (&lt; 40)</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2 bg-darker px-2 py-1 rounded-lg border border-gray-800">
              <select 
                value={decisionFilter}
                onChange={(e) => setDecisionFilter(e.target.value)}
                className="bg-transparent text-sm text-gray-300 focus:outline-none uppercase"
              >
                <option value="ALL">All Decisions</option>
                <option value="BLOCKED">Blocked</option>
                <option value="FLAGGED">Flagged</option>
                <option value="ALLOWED">Allowed</option>
              </select>
            </div>

            <div className="relative ml-2">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <input 
                type="text" 
                placeholder="Query TXN ID..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-dark border border-gray-800 rounded-lg pl-9 pr-4 py-1.5 text-sm focus:outline-none focus:border-primary text-white w-48"
              />
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-darker sticky top-0 z-10 text-xs uppercase tracking-wider text-gray-500">
              <tr>
                <th className="p-4 border-b border-gray-800">Transaction ID</th>
                <th className="p-4 border-b border-gray-800">Target</th>
                <th className="p-4 border-b border-gray-800">Risk Profile</th>
                <th className="p-4 border-b border-gray-800">Autonomous Decision</th>
                <th className="p-4 border-b border-gray-800 text-right">Manual Override</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">
                    <Cpu className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    No threats found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map(tx => (
                  <tr key={tx.transaction_id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="p-4 font-mono text-sm">{tx.transaction_id}</td>
                    <td className="p-4">
                      <div className="text-sm font-semibold">{tx.user_id}</div>
                      <div className="text-xs text-gray-500">{tx.account_id}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-10 text-center font-bold text-sm ${
                          tx.risk_score >= 70 ? 'text-danger' : tx.risk_score >= 40 ? 'text-warning' : 'text-success'
                        }`}>
                          {tx.risk_score.toFixed(0)}
                        </div>
                        <div className="w-24 bg-gray-800 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${tx.risk_score >= 70 ? 'bg-danger' : tx.risk_score >= 40 ? 'bg-warning' : 'bg-success'}`}
                            style={{ width: `${Math.min(100, tx.risk_score)}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded border ${
                        tx.status.includes('BLOCK') ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                        tx.status.includes('FLAG') ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                        'bg-green-500/20 text-green-400 border-green-500/30'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {(currentUser?.role === 'Admin' || currentUser?.role === 'Operator') ? (
                        <div className="flex justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleOverride(tx.transaction_id, 'allow')}
                            className="p-1.5 rounded bg-gray-800 hover:bg-green-500/20 hover:text-green-400 text-gray-400 transition-colors tooltip-trigger"
                            title="Force Allow"
                          >
                            <CheckCircle size={18} />
                          </button>
                          <button 
                            onClick={() => handleOverride(tx.transaction_id, 'block')}
                            className="p-1.5 rounded bg-gray-800 hover:bg-red-500/20 hover:text-red-400 text-gray-400 transition-colors tooltip-trigger"
                            title="Force Block"
                          >
                            <XCircle size={18} />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-600 font-mono">READ ONLY</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
