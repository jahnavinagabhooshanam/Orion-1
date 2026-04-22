import React from 'react';
import { AlertTriangle, Clock, ShieldAlert, Activity } from 'lucide-react';

export default function LiveStream({ transactions, onSelectTransaction }) {
  return (
    <div className="glass-panel flex flex-col h-full">
      <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-dark/50 rounded-t-xl">
        <h2 className="font-semibold text-lg flex items-center gap-2">
          <Activity className="text-primary w-5 h-5 animate-pulse" />
          Live Threat Stream
        </h2>
        <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full border border-primary/30">
          Listening...
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 space-y-2 max-h-[400px]">
        {transactions.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-500">
            <Clock className="w-8 h-8 mb-2 opacity-50" />
            <p>Waiting for real-time events</p>
          </div>
        ) : (
          transactions.map((tx) => (
            <div 
              key={tx.transaction_id}
              onClick={() => onSelectTransaction(tx)}
              className={`p-3 rounded-lg border cursor-pointer transition-all hover:scale-[1.01] flex justify-between items-center animate-slide-in ${
                tx.is_anomaly 
                  ? 'bg-red-500/10 border-red-500/30 hover:border-red-500/60' 
                  : 'bg-darker border-gray-800 hover:border-gray-600'
              }`}
            >
              <div className="flex items-center gap-3">
                {tx.is_anomaly ? (
                  <ShieldAlert className="text-danger w-5 h-5 flex-shrink-0" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-gray-600 flex-shrink-0"></div>
                )}
                <div>
                  <div className="font-bold text-sm text-gray-200 tracking-tight">{tx.transaction_id}</div>
                  <div className="text-[10px] text-gray-500 font-mono mb-1">{new Date(tx.timestamp).toLocaleTimeString()} • ${tx.amount?.toFixed(2)}</div>
                  {tx.ai_reasons && (
                    <div className="flex items-center gap-1.5">
                      <div className="w-1 h-1 rounded-full bg-accent animate-pulse"></div>
                      <div className="text-[9px] text-accent font-black uppercase tracking-tighter">
                        {tx.ai_reasons[0]}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right flex flex-col items-end gap-1">
                <div className="flex items-center gap-2">
                  <div className={`text-sm font-black ${
                    tx.risk_score >= 70 ? 'text-danger' : tx.risk_score >= 40 ? 'text-warning' : 'text-success'
                  }`}>
                    {tx.risk_score.toFixed(0)} <span className="text-[10px] opacity-50 font-normal">RS</span>
                  </div>
                  <div className="text-[9px] text-white font-black bg-primary/40 border border-primary/30 px-1.5 py-0.5 rounded shadow-lg" title="AI Confidence">
                    {tx.confidence || tx.confidence_level}%
                  </div>
                </div>
                <div className={`text-[10px] font-black uppercase tracking-[0.1em] px-2 py-0.5 rounded ${
                  tx.status === 'BLOCK TRANSACTION' || tx.risk_score > 70 ? 'bg-red-500 text-white' : 
                  tx.status === 'FLAG FOR REVIEW' ? 'bg-orange-500/20 text-orange-500' : 
                  'bg-green-500/20 text-green-500'
                }`}>
                  {tx.risk_score > 70 ? 'BLOCKED' : tx.status === 'ALLOW TRANSACTION' ? 'ALLOW' : 'FLAGGED'}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
