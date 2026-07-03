import React from 'react';

export const CapacityInput = ({ value, onChange, error }) => {
  return (
    <div className="flex flex-col gap-3 w-full">
      <label className="text-micro text-primary">Event Capacity</label>
      <input
        type="number"
        value={value}
        min="1"
        onChange={(e) => {
          const val = parseInt(e.target.value, 10);
          onChange(isNaN(val) ? '' : val);
        }}
        placeholder="e.g. 100"
        className="w-full bg-[#111] border border-white/10 px-4 py-3 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-accent font-ui rounded-none transition-colors"
      />
      {error && <span className="text-[0.7rem] text-red-400 font-technical uppercase tracking-wide">{error}</span>}
    </div>
  );
};
