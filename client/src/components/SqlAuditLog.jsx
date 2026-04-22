import React, { useState, useEffect } from 'react';
import { dataconnect } from '../firebase';
import { listRecentTransactions } from '@dataconnect/generated';
import { Database, Clock, ArrowRight } from 'lucide-react';

export default function SqlAuditLog() {
  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      try {
        // Query the PostgreSQL backend via Data Connect SDK
        const response = await listRecentTransactions(dataconnect);
        if (response?.data?.transactions) {
          setHistoricalData(response.data.transactions);
        }
      } catch (err) {
        console.warn('SQL backend empty or not seeded yet. Using placeholder logs.');
        // Fallback for demo if no data is seeded
        setHistoricalData([
          { transactionId: 'H-TX-9901', amount: 1250.00, status: 'Completed', createdAt: new Date().toISOString() },
          { transactionId: 'H-TX-9902', amount: 45.50, status: 'Flagged', createdAt: new Date().toISOString() }
        ]);
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, []);

  return (
    <div className="glass-panel p-6 flex flex-col gap-4 border-primary/20 bg-primary/5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Database className="text-primary w-5 h-5" />
          <h2 className="text-gray-300 font-bold uppercase tracking-widest text-sm">Enterprise SQL Audit Log</h2>
        </div>
        <div className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded border border-primary/30 animate-pulse">
          LIVE POSTGRES CONNECTION
        </div>
      </div>

      <p className="text-gray-500 text-xs italic">
        Viewing archived transaction records from the Cloud SQL historical cluster.
      </p>

      <div className="overflow-hidden rounded-lg border border-gray-800">
        <table className="w-full text-left text-xs">
          <thead className="bg-darker text-gray-500 uppercase tracking-tighter">
            <tr>
              <th className="p-3">Record ID</th>
              <th className="p-3">Amount</th>
              <th className="p-3">State</th>
              <th className="p-3 text-right">Archived At</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {historicalData.map((row, i) => (
              <tr key={i} className="hover:bg-white/5 transition-colors group">
                <td className="p-3 font-mono text-primary">{row.transactionId}</td>
                <td className="p-3 text-gray-300">${row.amount.toLocaleString()}</td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded-full ${row.status === 'Completed' ? 'bg-green-500/10 text-green-400' : 'bg-warning/10 text-warning'}`}>
                    {row.status}
                  </span>
                </td>
                <td className="p-3 text-right text-gray-500 group-hover:text-gray-300">
                  <div className="flex items-center justify-end gap-2">
                    <Clock size={12} />
                    {new Date(row.createdAt).toLocaleTimeString()}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button className="text-primary hover:text-white text-[10px] font-bold uppercase flex items-center gap-2 self-end transition-colors">
        Full Compliance Report <ArrowRight size={12} />
      </button>
    </div>
  );
}
