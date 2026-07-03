import React from 'react';
import { cn } from '../../../utils/cn';

export const DatePicker = ({ label, value, onChange, error, min, type = "date" }) => {
  return (
    <div className="flex flex-col gap-3 w-full">
      <label className="text-micro text-primary">{label}</label>
      <input
        type={type}
        value={value}
        min={min}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "w-full bg-[#111] border border-white/10 px-4 py-3 text-sm text-white/80 focus:outline-none focus:border-accent font-ui rounded-none transition-colors",
          "scheme-dark" // Forces browser datepicker UI to display in dark mode natively
        )}
      />
      {error && <span className="text-[0.7rem] text-red-400 font-technical uppercase tracking-wide">{error}</span>}
    </div>
  );
};
