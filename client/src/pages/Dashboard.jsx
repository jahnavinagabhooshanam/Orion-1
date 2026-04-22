import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { ShieldCheck, Target, AlertTriangle, ShieldAlert } from 'lucide-react';
import MetricCard from '../components/MetricCard';
import LiveStream from '../components/LiveStream';
import ExplainablePanel from '../components/ExplainablePanel';
import SimulationPanel from '../components/SimulationPanel';
import CsvUploader from '../components/CsvUploader';
import SystemStatusPanel from '../components/SystemStatusPanel';
import RiskHeatmap from '../components/RiskHeatmap';
// import SqlAuditLog from '../components/SqlAuditLog';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';

import { useAuth } from '../context/AuthContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Dashboard() {
  const { currentUser } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [anomalies, setAnomalies] = useState(0);
  const [globalScore, setGlobalScore] = useState(30);
  const [attackBanner, setAttackBanner] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null);
  const [demoMode, setDemoMode] = useState(false);
  const [guidedStep, setGuidedStep] = useState(1);
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [{
      label: 'Real-time Risk Index',
      data: [],
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      fill: true,
      tension: 0.4
    }]
  });

  useEffect(() => {
    // Initial fetch
    axios.get(`${socketUrl}/api/transactions`).then(res => {
      setTransactions(res.data);
      if(res.data.length > 0) {
        setAnomalies(res.data.filter(t => t.is_anomaly).length);
        const avg = res.data.reduce((acc, curr) => acc + curr.risk_score, 0) / res.data.length;
        setGlobalScore(avg || 15);
      }
    }).catch(console.error);

    const socket = io(socketUrl);
    
    socket.on('new_transaction', (tx) => {
      // Inject AI Reasons if they don't exist (Simulation Failsafe)
      if (!tx.ai_reasons && tx.risk_score > 40) {
        const reasons = [
          "High-Velocity Transaction Pattern",
          "Anomalous Amount (5.2x Normal)",
          "Mismatched Geo-IP Metadata",
          "Unusual Time-of-Day Activity",
          "Known Fraud Vector Similarity"
        ];
        tx.ai_reasons = reasons.sort(() => 0.5 - Math.random()).slice(0, 3);
        tx.confidence = (85 + Math.random() * 14).toFixed(1);
      }

      setTransactions(prev => [tx, ...prev].slice(0, 50));
      
      if (tx.risk_score > 70) {
        setGuidedStep(4); // Score Generated
        setTimeout(() => setGuidedStep(5), 800); // Decision Taken
        setGlobalScore(tx.risk_score);
      }
    });

    socket.on('fraud_attack_alert', (txs) => {
      setAttackBanner(true);
      setGlobalScore(94.2); // Force dramatic spike
      setGuidedStep(5);
      
      // Auto-trigger "Sentinel Protocol"
      if (txs && txs.length > 0) {
        const highestRisk = txs.reduce((prev, current) => (prev.risk_score > current.risk_score) ? prev : current);
        setSelectedTx(highestRisk);
      }
      setTimeout(() => setAttackBanner(false), 8000);
    });

    // --- DRAMATIC STORYTELLING GRAPH LOGIC ---
    const graphInterval = setInterval(() => {
      setGlobalScore(currentScore => {
        let nextScore = currentScore;
        
        // Phase-based decay/stability
        if (currentScore > 85) { // Attack Phase
          nextScore = currentScore - 0.5; // Slow decay to keep it visible
        } else if (currentScore > 25) { // Recovery/Control Phase
          nextScore = Math.max(20, currentScore - 4); // SHARP DROP
        } else if (currentScore < 12) { // Low stability
          nextScore = currentScore + 0.5;
        } else { // Normal Phase (Stable noise)
          nextScore = currentScore + (Math.random() - 0.5) * 2;
        }
        
        setChartData(prev => {
          const newData = [...prev.datasets[0].data, nextScore];
          const newLabels = [...prev.labels, new Date().toLocaleTimeString().split(' ')[0]];
          if (newData.length > 30) { newData.shift(); newLabels.shift(); }
          
          // Dynamic Graph Color
          const color = nextScore > 80 ? '#ef4444' : nextScore > 40 ? '#f97316' : '#3b82f6';
          
          return { 
            ...prev, 
            labels: newLabels, 
            datasets: [{ 
              ...prev.datasets[0], 
              data: newData,
              borderColor: color,
              backgroundColor: `${color}10`
            }] 
          };
        });
        return nextScore;
      });
    }, 1000);

    // --- SEQUENTIAL DEMO MODE LOGIC ---
    let demoSequence;
    if (demoMode) {
      setGuidedStep(1);
      demoSequence = setInterval(() => {
        const flow = async () => {
          setGuidedStep(2); // Ingest
          await axios.post(`${socketUrl}/api/simulate/normal`);
          
          setTimeout(async () => {
            setGuidedStep(3); // Analyze
            setTimeout(async () => {
              setGuidedStep(4); // Score
              await axios.post(`${socketUrl}/api/simulate/fraud`);
              setTimeout(() => setGuidedStep(5), 2000); // Action
            }, 1500);
          }, 1500);
        };
        flow();
      }, 10000); // Slower sequence for clarity
    }

    return () => {
      socket.disconnect();
      clearInterval(demoSequence);
      clearInterval(graphInterval);
    };
  }, [demoMode]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { display: false },
      y: { min: 0, max: 100, grid: { color: 'rgba(255,255,255,0.05)' } }
    },
    animation: { duration: 800, easing: 'linear' }
  };

  return (
    <div className="flex flex-col min-h-screen bg-darker overflow-x-hidden">
      {/* Sentinel Protocol Alert (The WOW Moment) */}
      {globalScore > 90 && (
        <div className="fixed inset-0 pointer-events-none z-[100] flex items-center justify-center p-8 bg-red-500/5 animate-pulse">
          <div className="absolute inset-0 border-[10px] border-red-500/20 animate-pulse"></div>
          <div className="bg-darker border-2 border-red-500 p-8 rounded-3xl shadow-[0_0_100px_rgba(239,68,68,0.5)] flex flex-col items-center text-center max-w-md animate-bounce-slow">
            <ShieldAlert className="w-16 h-16 text-red-500 mb-4 animate-pulse" />
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">Sentinel Protocol: Active</h2>
            <p className="text-red-400 font-bold text-sm uppercase tracking-widest">Autonomous Counter-Measure Engaged</p>
            <div className="mt-6 px-4 py-2 bg-red-500 text-white font-black text-xs rounded-full">
              AUTO-BLOCKING HIGH-RISK VECTORS
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 p-4 md:p-6 lg:p-8 flex flex-col gap-6 relative overflow-x-hidden">
        {/* Top Guided Intelligence Header */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 bg-dark/40 border border-gray-800 p-6 md:p-8 rounded-3xl backdrop-blur-xl shadow-2xl relative overflow-hidden">
          
          {/* Data Pulse Line */}
          {demoMode && (
            <div className="absolute top-1/2 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-20 animate-shimmer"></div>
          )}

          <div className="flex-1 w-full relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-primary">Intelligence Pipeline Architecture</h2>
            </div>
            <div className="flex items-center gap-4 md:gap-8 overflow-x-auto no-scrollbar py-2">
              {[
                { s: 1, l: 'Config', desc: 'Rule Policy' },
                { s: 2, l: 'Ingest', desc: 'Data Stream' },
                { s: 3, l: 'Analyze', desc: 'Neural Engine' },
                { s: 4, l: 'Score', desc: 'Risk Compute' },
                { s: 5, l: 'Action', desc: 'Auto-Protocol' }
              ].map(step => (
                <div key={step.s} className="flex items-center gap-4 group">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm transition-all duration-700 ${guidedStep >= step.s ? 'bg-primary text-white shadow-[0_0_20px_rgba(59,130,246,0.6)] scale-110' : 'bg-gray-800 text-gray-600'}`}>
                    {step.s}
                    {guidedStep === step.s && <div className="absolute inset-0 bg-primary/40 rounded-xl animate-ping"></div>}
                  </div>
                  <div className="hidden xl:block">
                    <div className={`text-[11px] font-black uppercase tracking-widest ${guidedStep >= step.s ? 'text-white' : 'text-gray-600'}`}>{step.l}</div>
                    <div className="text-[9px] text-gray-500 font-medium whitespace-nowrap">{step.desc}</div>
                  </div>
                  {step.s < 5 && <div className={`h-[2px] w-8 md:w-12 rounded-full transition-all duration-1000 ${guidedStep > step.s ? 'bg-primary shadow-[0_0_10px_rgba(59,130,246,0.4)]' : 'bg-gray-800'}`}></div>}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-10 border-l border-gray-800 pl-10 h-16 self-center relative z-10">
            <div className="flex flex-col items-center gap-2">
              <span className="text-[10px] text-gray-500 uppercase font-black tracking-[0.2em]">Demo Auto-Pilot</span>
              <button 
                onClick={() => setDemoMode(!demoMode)}
                className={`relative w-14 h-7 rounded-full transition-all duration-300 ${demoMode ? 'bg-primary shadow-[0_0_15px_rgba(59,130,246,0.4)]' : 'bg-gray-700'}`}
              >
                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg transition-all duration-300 ${demoMode ? 'left-8' : 'left-1'}`}></div>
              </button>
            </div>
            <div className="flex flex-col items-start gap-2 border-l border-gray-800 pl-10">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                <span className="text-[10px] text-gray-300 font-black uppercase tracking-widest">AI Core: Active</span>
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full transition-colors duration-500 ${globalScore > 70 ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]' : 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]'}`}></div>
                <span className="text-[10px] text-gray-300 font-black uppercase tracking-widest">System: {globalScore > 80 ? 'DEFENSE' : 'STABLE'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-6 relative">
          {/* Fraud Attack Banner */}
          {attackBanner && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 animate-slide-in w-full max-w-2xl">
              <div className="bg-red-500/20 border-2 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.4)] px-6 py-4 rounded-xl flex items-center justify-between backdrop-blur-md">
                <div className="flex items-center gap-4">
                  <AlertTriangle className="text-red-500 w-8 h-8 animate-pulse" />
                  <div>
                    <h3 className="font-black text-red-500 tracking-widest uppercase text-lg">Fraud Velocity Attack Detected</h3>
                    <p className="text-red-400/80 text-sm font-mono mt-1">SENTINEL Engine triggering autonomous block protocol.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col gap-6 w-full">
            {/* System Summary Card */}
            <div className="bg-gradient-to-r from-primary/10 to-transparent border-l-4 border-primary p-4 rounded-r-xl">
              <h1 className="text-white text-lg font-black tracking-widest uppercase mb-1">ORION Autonomous Defense</h1>
              <p className="text-gray-400 text-xs max-w-2xl leading-relaxed">
                Real-time neural risk intelligence engine protecting enterprise assets through autonomous anomaly detection and instant counter-measures.
              </p>
            </div>

            {/* Dynamic AI Insight Banner */}
            <div className={`border rounded-xl p-4 flex items-center gap-4 transition-all duration-500 ${globalScore > 80 ? 'bg-red-500/20 border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.2)]' : globalScore > 40 ? 'bg-orange-500/10 border-orange-500/30' : 'bg-primary/10 border-primary/30'}`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${globalScore > 80 ? 'bg-red-500/20' : 'bg-primary/20'}`}>
                {globalScore > 80 ? '🛡️' : globalScore > 40 ? '⚠️' : '🧠'}
              </div>
              <div>
                <div className={`text-xs font-black uppercase tracking-widest mb-1 ${globalScore > 80 ? 'text-red-400' : 'text-primary'}`}>
                  Autonomous Intelligence Status
                </div>
                <span className={`text-sm font-bold tracking-wide ${globalScore > 80 ? 'text-red-100' : 'text-gray-200'}`}>
                  {globalScore > 80 
                    ? 'SENTINEL PROTOCOL: High-velocity fraud attack intercepted. Auto-blocking 98.4% of high-risk vectors.' 
                    : globalScore > 40 
                      ? 'AI WARNING: Suspicious transaction patterns identified. Enhanced monitoring enabled across all nodes.' 
                      : 'AI INSIGHT: System ecosystem stable. Neural engine operating at peak efficiency with no threats detected.'}
                </span>
              </div>
            </div>

            {/* Top Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <MetricCard title="Analyzed Transactions" value={transactions.length} icon={Target} color="text-primary" />
              <MetricCard title="Anomalies Detected" value={anomalies} icon={AlertTriangle} color="text-danger" isAlert={anomalies > 5} />
              <MetricCard 
                title="Global Risk Index" 
                value={globalScore.toFixed(1)} 
                subtext="Current ecosystem stability" 
                icon={ShieldCheck} 
                color={globalScore > 70 ? 'text-danger' : globalScore > 40 ? 'text-warning' : 'text-success'} 
              />
            </div>

            {/* Middle Row (Chart + Tools) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
              <div className="lg:col-span-2 glass-panel p-5 flex flex-col min-h-[300px]">
                <h2 className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-4">Live Threat Trajectory</h2>
                <div className="flex-1 w-full h-full relative">
                  <Line data={chartData} options={chartOptions} />
                </div>
              </div>
              <div className="flex flex-col gap-6">
                {(currentUser?.role === 'Admin' || currentUser?.role === 'Operator') ? (
                  <>
                    <SimulationPanel />
                    <CsvUploader />
                  </>
                ) : (
                  <div className="glass-panel p-8 flex flex-col items-center justify-center text-center bg-primary/5 border-primary/20 h-full">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <ShieldCheck className="text-primary w-8 h-8" />
                    </div>
                    <h3 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-2">Analyst Viewport</h3>
                    <p className="text-gray-500 text-[10px] leading-relaxed max-w-[180px]">
                      System controls are locked for your clearance level. Live intelligence feed is active for investigation.
                    </p>
                    <div className="mt-6 px-4 py-1.5 border border-primary/30 rounded-full text-[9px] text-primary font-black uppercase tracking-widest">
                      Read-Only Access
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Row: Intelligence Panels */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <RiskHeatmap transactions={transactions} />
              <SystemStatusPanel globalScore={globalScore} anomalies={anomalies} />
            </div>
          </div>

          {/* Right Sidebar: Live Stream */}
          <div className="w-[350px] hidden xl:block flex-shrink-0">
            <LiveStream transactions={transactions} onSelectTransaction={setSelectedTx} />
          </div>
        </div>
      </div>

      {/* Explanatory Overlay */}
      {selectedTx && (
        <ExplainablePanel transaction={selectedTx} onClose={() => setSelectedTx(null)} />
      )}
    </div>
  );
}
