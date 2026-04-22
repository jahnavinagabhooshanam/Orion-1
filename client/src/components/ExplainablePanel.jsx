import React from 'react';
import { X, Network, Target, BrainCircuit, ShieldAlert, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ExplainablePanel({ transaction, onClose }) {
  const { currentUser } = useAuth();
  if (!transaction) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-darker w-full max-w-2xl border border-gray-800 rounded-xl shadow-2xl overflow-hidden flex flex-col animate-slide-in max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-5 border-b border-gray-800 flex justify-between items-center bg-dark/80">
          <h2 className="font-bold flex items-center gap-2 text-lg">
            <BrainCircuit className="text-accent" />
            AI Explanation Matrix
          </h2>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          {/* Header summary */}
          <div className="p-5 rounded-xl border border-gray-800 bg-dark/50 shadow-inner">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-sm text-gray-400 mb-1">Transaction ID</div>
                <div className="font-mono text-xl text-white break-all tracking-wide">{transaction.transaction_id}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400 mb-1">Amount</div>
                <div className="font-bold text-xl text-white">${transaction.amount?.toFixed(2)}</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-darker p-4 rounded-lg border border-gray-800">
                <div className="text-xs text-gray-500 uppercase tracking-widest mb-1 flex items-center gap-2">
                  <Target size={14} /> Risk Score
                </div>
                <div className={`text-3xl font-black ${transaction.risk_score >= 70 ? 'text-danger' : transaction.risk_score >= 40 ? 'text-warning' : 'text-success'}`}>
                  {transaction.risk_score?.toFixed(1)}<span className="text-lg text-gray-500 font-normal">/100</span>
                </div>
              </div>
              <div className="bg-darker p-4 rounded-lg border border-gray-800">
                <div className="text-xs text-gray-500 uppercase tracking-widest mb-1 flex items-center gap-2">
                  <BrainCircuit size={14} /> AI Confidence
                </div>
                <div className="text-3xl font-black text-accent">
                  {transaction.confidence || transaction.confidence_level}<span className="text-lg text-gray-500 font-normal">%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Taken */}
          <div>
            <h3 className="text-sm uppercase tracking-widest text-gray-500 mb-3 flex items-center gap-2">
              <ShieldAlert size={16} /> Autonomous Action
            </h3>
            <div className={`p-4 rounded-lg border font-black text-center tracking-widest text-lg ${
              transaction.status === 'BLOCK TRANSACTION' || (transaction.risk_score > 70) ? 'bg-red-500/20 border-red-500/50 text-red-400 animate-pulse' :
              transaction.status === 'FLAG FOR REVIEW' ? 'bg-orange-500/20 border-orange-500/50 text-orange-400' :
              'bg-green-500/20 border-green-500/50 text-green-400'
            }`}>
              {transaction.risk_score > 70 ? 'BLOCK TRANSACTION' : transaction.status}
            </div>
          </div>

          {/* Reason */}
          <div>
            <h3 className="text-sm uppercase tracking-widest text-gray-500 mb-3 flex items-center gap-2">
              <Network size={16} /> Anomaly Reasoning
            </h3>
            <div className="space-y-3">
              {transaction.ai_reasons ? (
                transaction.ai_reasons.map((reason, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-gray-800/40 p-4 rounded-lg border border-gray-700/50">
                    <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
                    <span className="text-gray-300 text-sm font-medium">{reason}</span>
                  </div>
                ))
              ) : (
                <div className="text-gray-300 bg-gray-800/30 p-5 rounded-lg border border-gray-700 leading-relaxed text-md italic">
                  "{transaction.anomaly_reason || 'Standard pattern detected. No significant anomalies.'}"
                </div>
              )}
            </div>
          </div>

          {/* Feature Contribution */}
          {(transaction.features_contribution || transaction.ai_reasons) && (
            <div>
              <h3 className="text-sm uppercase tracking-widest text-gray-500 mb-3 flex items-center gap-2">
                <Activity size={16} /> Intelligence Insights
              </h3>
              <div className="space-y-4 bg-dark/50 p-5 rounded-xl border border-gray-800">
                {transaction.features_contribution ? Object.entries(transaction.features_contribution)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 3)
                  .map(([feature, impact]) => (
                  <div key={feature}>
                    <div className="flex justify-between text-sm mb-2 font-medium">
                      <span className="text-gray-300 capitalize tracking-wide">{feature}</span>
                      <span className="text-gray-400 font-mono">{Number(impact).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-900 rounded-full h-2.5 flex overflow-hidden border border-gray-800">
                      <div 
                        className={`h-full ${impact > 50 ? 'bg-danger' : impact > 20 ? 'bg-warning' : 'bg-primary'} transition-all duration-1000 ease-out`}
                        style={{ width: `${impact}%` }}
                      ></div>
                    </div>
                  </div>
                )) : (
                  <div className="text-gray-500 text-xs text-center py-4 italic">
                    Neural weights optimized for maximum precision.
                  </div>
                )}
              </div>
            </div>
          )}
          {/* Manual Override Section */}
          <div className="pt-6 border-t border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm uppercase tracking-widest text-gray-500 flex items-center gap-2">
                  <ShieldAlert size={16} /> Decision Override
                </h3>
                <p className="text-[10px] text-gray-500 mt-1 italic">Human-in-the-loop validation protocol</p>
              </div>
              
              {(currentUser?.role === 'Admin' || currentUser?.role === 'Operator') ? (
                <div className="flex gap-3">
                  <button 
                    onClick={() => {
                      alert('SENTINEL: Manual Override Sequence Initiated. Transaction whitelist updated.');
                      onClose();
                    }}
                    className="px-6 py-2 bg-primary hover:bg-blue-600 text-white text-xs font-black uppercase tracking-widest rounded-lg transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                  >
                    Override & Allow
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 px-4 py-2 rounded-lg">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
                  <span className="text-red-400 text-[10px] font-black uppercase tracking-widest">
                    Clearance Level 2 Required to Override
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
