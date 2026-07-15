import React from "react";

export const PremiumEmptyState = ({ title = "NO EVENTS AVAILABLE", subtitle = "The campus directory is currently vacant." }) => {
  return (
    <div className="w-full border border-white/5 py-24 px-8 flex flex-col items-center justify-center text-center relative select-none bg-[#0a0a0a] overflow-hidden">
      {/* Subtle architectural grid */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />
      
      {/* Large technical illustration */}
      <div className="relative z-10 w-24 h-24 mb-8 text-white/10">
        <svg viewBox="0 0 100 100" className="w-full h-full stroke-current" fill="none" strokeWidth="0.75" strokeLinecap="square">
          {/* Outer box */}
          <rect x="10" y="10" width="80" height="80" />
          {/* Diagonals */}
          <line x1="10" y1="10" x2="90" y2="90" />
          <line x1="90" y1="10" x2="10" y2="90" />
          {/* Crosshair markers */}
          <circle cx="50" cy="50" r="12" strokeDasharray="3 3" />
          <line x1="50" y1="5" x2="50" y2="95" />
          <line x1="5" y1="50" x2="95" y2="50" />
          {/* Tech corner tickmarks */}
          <path d="M 8,10 L 12,10 M 10,8 L 10,12" />
          <path d="M 88,10 L 92,10 M 90,8 L 90,12" />
          <path d="M 8,90 L 12,90 M 10,88 L 10,92" />
          <path d="M 88,90 L 92,90 M 90,88 L 90,92" />
        </svg>
      </div>

      <span className="text-[0.62rem] font-technical text-accent uppercase tracking-[0.25em] mb-4">
        Discovery Engine // vac.00
      </span>
      <h3 className="text-display-m text-primary mb-4 font-light uppercase tracking-tight">
        {title}
      </h3>
      <p className="text-body-s text-secondary max-w-sm font-light">
        {subtitle}
      </p>
    </div>
  );
};
