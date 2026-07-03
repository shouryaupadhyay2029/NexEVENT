import React from "react";

export const AxisMarker = ({ index, label }) => {
  return (
    <div className="relative w-full flex items-center mb-32 h-[1px]">
      {/* The horizontal notch extending from the axis */}
      <div className="w-12 h-[1px] bg-border" />
      
      {/* The Space Mono label resting exactly on the notch */}
      <div className="flex items-center gap-4 pl-4 text-micro">
        <span className="text-primary font-medium">[{index}]</span>
        <span className="opacity-30">·</span>
        <span>{label}</span>
      </div>
    </div>
  );
};
