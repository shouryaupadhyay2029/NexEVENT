import React from 'react';
import { cn } from '../../../utils/cn';

const categories = [
  "Technical", "Hackathons", "Workshops", "Sports", "Cultural", "Seminars", "Competitions", "Networking", "Guest Lectures"
];

export const CategorySelector = ({ value, onChange, error }) => {
  return (
    <div className="flex flex-col gap-3">
      <label className="text-micro text-primary">Category</label>
      <div className="flex flex-wrap gap-2.5">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => onChange(cat)}
            className={cn(
              "px-4 py-2 border text-xs tracking-wider font-technical uppercase transition-all duration-300 rounded-none focus:outline-none",
              value === cat
                ? "border-accent text-accent bg-accent/5"
                : "border-white/10 text-white/50 hover:border-white/20 hover:text-white"
            )}
          >
            {cat}
          </button>
        ))}
      </div>
      {error && <span className="text-[0.7rem] text-red-400 font-technical uppercase tracking-wide">{error}</span>}
    </div>
  );
};
