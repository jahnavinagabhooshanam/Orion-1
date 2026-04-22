import React from 'react';

export default function MetricCard({ title, value, subtext, icon: Icon, color, isAlert }) {
  return (
    <div className={`glass-panel p-5 relative overflow-hidden ${isAlert ? 'border-red-500/50 bg-red-950/20' : ''}`}>
      {isAlert && (
        <div className="absolute top-0 right-0 w-16 h-16 bg-red-500 rounded-full blur-2xl opacity-20 pointer-events-none"></div>
      )}
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">{title}</p>
          <h3 className={`text-3xl font-bold mt-2 ${color || 'text-white'}`}>{value}</h3>
          {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
        </div>
        {Icon && (
          <div className={`p-3 rounded-lg ${isAlert ? 'bg-red-500/20 text-red-400' : 'bg-gray-800 text-gray-400'}`}>
            <Icon size={24} />
          </div>
        )}
      </div>
    </div>
  );
}
