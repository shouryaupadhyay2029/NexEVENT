import React from "react";

export const AxisMarker = ({ index, label }) => {
  return (
    <div className="relative w-full flex items-center mb-32 h-[1px]">
      {/* The horizontal notch extending from the axis */}
      <div className="w-12 h-[1px] bg-border" />
      
      {/* The JetBrains Mono label resting exactly on the notch */}
      <div className="flex items-center gap-4 pl-4 text-[0.65rem] font-technical tracking-[0.2em] text-muted">
        <span>[{index}]</span>
        <span>·</span>
        <span className="uppercase">{label}</span>
      </div>
    </div>
  );
};
