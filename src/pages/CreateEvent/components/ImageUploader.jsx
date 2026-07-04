import React from 'react';
import { cn } from '../../../utils/cn';

const presetImages = [
  { name: "Tech Stage", url: "https://images.unsplash.com/photo-1591115765373-5207764f72e7?q=80&w=600&auto=format&fit=crop" },
  { name: "AI/Code", url: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?q=80&w=600&auto=format&fit=crop" },
  { name: "Exhibition", url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=600&auto=format&fit=crop" }
];

export const ImageUploader = ({ value, onChange, error }) => {
  return (
    <div className="flex flex-col gap-3">
      <label className="text-micro text-primary">Event Image</label>
      
      {/* Tab bar */}
      <div className="flex gap-6 border-b border-white/5 pb-2">
        <button
          type="button"
          className="text-micro focus:outline-none pb-1 border-b border-accent text-accent"
        >
          Image URL
        </button>
        
        {/* Disabled File Upload tab with premium badge & tooltip */}
        <div className="relative group/tab">
          <button
            type="button"
            disabled={true}
            className="text-micro text-white/20 cursor-not-allowed focus:outline-none pb-1 flex items-center gap-2 transition-colors duration-200"
          >
            <span>File Upload</span>
            <span className="text-[0.48rem] font-technical uppercase px-1.5 py-0.5 border border-white/10 bg-white/5 text-white/30 tracking-wider">
              Requires Cloud Storage
            </span>
          </button>
          
          {/* Premium Tooltip */}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/tab:block z-50 pointer-events-none">
            <div className="bg-[#111] border border-white/10 text-white/50 text-[0.55rem] font-technical uppercase tracking-wider px-3 py-2 shadow-2xl relative whitespace-nowrap">
              Local image uploads will be enabled after Cloud Storage is activated.
              {/* Tooltip arrow */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-white/10" />
              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[2px] w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-[#111]" />
            </div>
          </div>
        </div>
      </div>

      {/* URL Input and Presets Content */}
      <div className="flex flex-col gap-3">
        <input
          type="url"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://images.unsplash.com/..."
          className="w-full bg-[#111] border border-white/10 px-4 py-3 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-accent font-ui rounded-none transition-colors"
        />
        <div className="flex items-center gap-3">
          <span className="text-[0.65rem] text-white/30 font-technical uppercase">Presets:</span>
          <div className="flex gap-2">
            {presetImages.map((img) => (
              <button
                key={img.name}
                type="button"
                onClick={() => onChange(img.url)}
                className="px-2.5 py-1 border border-white/5 hover:border-white/20 text-[0.6rem] font-technical text-white/40 hover:text-white uppercase transition-colors"
              >
                {img.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Image Preview */}
      {value && (
        <div className="mt-2 w-full max-w-[320px] aspect-[16/10] border border-white/10 overflow-hidden relative group">
          <img
            src={value}
            alt="Upload Preview"
            className="w-full h-full object-cover grayscale transition-all duration-500 group-hover:grayscale-0"
          />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-sm border border-white/10 text-[0.6rem] font-technical text-white/80 hover:text-white uppercase focus:outline-none"
          >
            Remove
          </button>
        </div>
      )}

      {error && <span className="text-[0.7rem] text-red-400 font-technical uppercase tracking-wide">{error}</span>}
    </div>
  );
};
