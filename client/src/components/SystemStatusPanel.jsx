import React, { useMemo } from 'react';
import { Server, Database, Activity, ShieldAlert } from 'lucide-react';

export default function SystemStatusPanel({ globalScore, anomalies }) {
  // Derive system status from props or use mocked high-level metrics
  const threatLevel = globalScore >= 60 ? 'CRITICAL' : globalScore >= 30 ? 'ELEVATED' : 'NOMINAL';
  const threatColor = globalScore >= 60 ? 'text-danger' : globalScore >= 30 ? 'text-warning' : 'text-success';
  
  // Simulated data quality based on anomaly count (too many anomalies might imply bad data or attacks)
  const dataQuality = Math.max(40, 99.8 - (anomalies * 0.1));

  return (
    <div className="glass-panel p-5 flex flex-col h-full">
      <h2 className="font-semibold flex items-center gap-2 mb-4 uppercase tracking-wider text-sm text-gray-400">
        <Server className="text-primary w-4 h-4" />
        System Diagnostics
      </h2>

      <div className="flex flex-col gap-4 flex-1 justify-center">
        {/* Global Threat Level */}
        <div className="bg-darker p-4 rounded-lg border border-gray-800 flex items-center justify-between group">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded bg-gray-900 ${threatColor}`}>
              <ShieldAlert size={20} className={globalScore >= 60 ? 'animate-pulse' : ''} />
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-widest">Global Threat Level</div>
              <div className={`font-black text-lg tracking-wider ${threatColor}`}>{threatLevel}</div>
            </div>
          </div>
        </div>

        {/* AI Model Status */}
        <div className="bg-darker p-4 rounded-lg border border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-gray-900 text-accent">
              <Activity size={20} />
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-widest">AI Engine Status</div>
              <div className="font-bold text-gray-200 tracking-wider">ACTIVE & ONLINE</div>
            </div>
          </div>
          <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]"></div>
        </div>

        {/* Data Quality Score */}
        <div className="bg-darker p-4 rounded-lg border border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-gray-900 text-blue-400">
              <Database size={20} />
            </div>
            <div className="flex-1 w-full min-w-[120px]">
              <div className="flex justify-between items-center mb-1">
                <div className="text-xs text-gray-500 uppercase tracking-widest">Data Quality</div>
                <div className="text-xs font-mono text-blue-400">{dataQuality.toFixed(1)}%</div>
              </div>
              <div className="w-full bg-gray-900 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-blue-500 h-full rounded-full" 
                  style={{ width: `${dataQuality}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
