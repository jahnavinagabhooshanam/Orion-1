import React from 'react';

export default function Logo({ className = "w-8 h-8" }) {
  return (
    <div className={`relative ${className}`}>
      <svg 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Fractal Neural Iris - High Complexity Static Mark */}
        
        {/* Layer 1: Outer Structural Shards */}
        <path d="M50 5 L65 15 L85 15 L95 35 L85 55 L95 75 L85 85 L65 85 L50 95 L35 85 L15 85 L5 75 L15 55 L5 35 L15 15 L35 15 Z" fill="currentColor" className="text-primary opacity-20" />
        
        {/* Layer 2: Interlocking Arcs */}
        <path d="M50 15 A35 35 0 0 1 85 50 L75 50 A25 25 0 0 0 50 25 Z" fill="currentColor" className="text-primary opacity-80" />
        <path d="M15 50 A35 35 0 0 1 50 15 L50 25 A25 25 0 0 0 25 50 Z" fill="currentColor" className="text-primary opacity-60" />
        <path d="M50 85 A35 35 0 0 1 15 50 L25 50 A25 25 0 0 0 50 75 Z" fill="currentColor" className="text-primary opacity-40" />
        <path d="M85 50 A35 35 0 0 1 50 85 L50 75 A25 25 0 0 0 75 50 Z" fill="currentColor" className="text-primary opacity-70" />

        {/* Layer 3: Neural Pathways (Internal Geometry) */}
        <path d="M50 25 L65 35 L75 50 L65 65 L50 75 L35 65 L25 50 L35 35 Z" stroke="white" strokeWidth="0.5" opacity="0.3" />
        <path d="M50 25 L50 75" stroke="white" strokeWidth="0.5" opacity="0.2" />
        <path d="M25 50 L75 50" stroke="white" strokeWidth="0.5" opacity="0.2" />

        {/* Layer 4: The Central Singularity Core */}
        <rect x="42" y="42" width="16" height="16" rx="2" fill="currentColor" transform="rotate(45 50 50)" className="text-primary" />
        <circle cx="50" cy="50" r="4" fill="white" />
        
        {/* Accents: Perimeter Data Points */}
        <circle cx="50" cy="15" r="1.5" fill="currentColor" className="text-primary" />
        <circle cx="85" cy="50" r="1.5" fill="currentColor" className="text-primary" />
        <circle cx="50" cy="85" r="1.5" fill="currentColor" className="text-primary" />
        <circle cx="15" cy="50" r="1.5" fill="currentColor" className="text-primary" />
      </svg>
    </div>
  );
}
