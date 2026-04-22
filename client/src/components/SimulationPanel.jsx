import React, { useState } from 'react';
import axios from 'axios';
import { Zap, AlertTriangle, Activity } from 'lucide-react';

export default function SimulationPanel() {
  const [loading, setLoading] = useState('');

  const [statusMessage, setStatusMessage] = useState('');

  const handleSimulate = async (type) => {
    try {
      setLoading(type);
      setStatusMessage('Analyzing transaction...');
      
      // 1000-2000ms delay as requested for dramatic effect
      await new Promise(r => setTimeout(r, Math.floor(Math.random() * 1000) + 1000));
      
      if (type === 'fraud') {
        setStatusMessage('Anomaly detected');
      } else {
        setStatusMessage('Processing pattern...');
      }
      
      await new Promise(r => setTimeout(r, 400));
      
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      await axios.post(`${apiUrl}/api/simulate/${type}`);
      
      setStatusMessage('Decision executed');
      await new Promise(r => setTimeout(r, 600));
    } catch (err) {
      console.error('Simulation failed', err);
    } finally {
      setLoading('');
      setStatusMessage('');
    }
  };

  return (
    <div className="glass-panel p-5">
      <h2 className="font-semibold flex items-center gap-2 mb-4">
        <Zap className="text-accent" />
        Simulation Engine
      </h2>
      <p className="text-xs text-gray-400 mb-4">Inject synthetic patterns into the pipeline to test the detection agents.</p>
      
      {statusMessage && (
        <div className="mb-4 text-xs font-mono text-accent animate-pulse uppercase tracking-widest bg-accent/10 py-1.5 px-3 rounded inline-block">
          {statusMessage}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={() => handleSimulate('fraud')}
          disabled={loading !== ''}
          className="relative overflow-hidden group btn-danger flex items-center justify-center gap-2 py-3"
        >
          <div className="absolute inset-0 w-full h-full bg-white/20 group-hover:scale-x-100 scale-x-0 origin-left transition-transform duration-300"></div>
          <AlertTriangle size={18} className="relative z-10" />
          <span className="relative z-10">{loading === 'fraud' ? 'Injecting...' : 'Fraud Attack'}</span>
        </button>
        
        <button
          onClick={() => handleSimulate('spike')}
          disabled={loading !== ''}
          className="relative overflow-hidden group btn-accent flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-500"
        >
          <div className="absolute inset-0 w-full h-full bg-white/20 group-hover:scale-x-100 scale-x-0 origin-left transition-transform duration-300"></div>
          <Activity size={18} className="relative z-10" />
          <span className="relative z-10">{loading === 'spike' ? 'Generating...' : 'Traffic Spike'}</span>
        </button>
      </div>
    </div>
  );
}
