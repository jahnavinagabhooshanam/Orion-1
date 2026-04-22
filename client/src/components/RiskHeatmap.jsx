import React, { useMemo } from 'react';
import { Map } from 'lucide-react';

export default function RiskHeatmap({ transactions }) {
  const locationData = useMemo(() => {
    const locMap = {};
    transactions.forEach(tx => {
      const loc = tx.location || 'Unknown';
      if (!locMap[loc]) {
        locMap[loc] = { count: 0, totalRisk: 0, highestRisk: 0 };
      }
      locMap[loc].count += 1;
      locMap[loc].totalRisk += tx.risk_score;
      if (tx.risk_score > locMap[loc].highestRisk) {
        locMap[loc].highestRisk = tx.risk_score;
      }
    });

    return Object.entries(locMap)
      .map(([location, data]) => ({
        location,
        avgRisk: data.totalRisk / data.count,
        count: data.count,
        highestRisk: data.highestRisk
      }))
      .sort((a, b) => b.avgRisk - a.avgRisk)
      .slice(0, 6); // Top 6 locations
  }, [transactions]);

  return (
    <div className="glass-panel p-5 flex flex-col h-full">
      <h2 className="font-semibold flex items-center gap-2 mb-4 uppercase tracking-wider text-sm text-gray-400">
        <Map className="text-primary w-4 h-4" />
        Regional Risk Heatmap
      </h2>
      
      <div className="flex-1 overflow-y-auto pr-2 space-y-3">
        {locationData.length === 0 ? (
          <div className="text-gray-500 text-sm text-center py-4">Awaiting location data...</div>
        ) : (
          locationData.map(loc => {
            const isHigh = loc.avgRisk >= 70;
            const isMedium = loc.avgRisk >= 40 && loc.avgRisk < 70;
            
            return (
              <div key={loc.location} className="bg-darker p-3 rounded-lg border border-gray-800 flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-gray-200">{loc.location}</div>
                  <div className="text-xs text-gray-500">{loc.count} active signals</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className={`text-sm font-black ${isHigh ? 'text-danger' : isMedium ? 'text-warning' : 'text-success'}`}>
                      {loc.avgRisk.toFixed(1)}
                    </div>
                    <div className="text-[10px] uppercase text-gray-500">AVG RISK</div>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${isHigh ? 'bg-danger shadow-[0_0_8px_rgba(239,68,68,0.6)] animate-pulse' : isMedium ? 'bg-warning' : 'bg-success'}`}></div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
