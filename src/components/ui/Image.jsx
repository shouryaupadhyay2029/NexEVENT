import React, { useState } from 'react';
import { cn } from '../../utils/cn';

export const Image = ({
  src,
  alt = 'Image',
  className,
  fallback,
  aspectRatio = 'aspect-video',
  ...props
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleLoad = () => {
    setLoading(false);
  };

  const handleError = () => {
    setError(true);
    setLoading(false);
  };

  // Inline premium SVG fallback with NexEvent editorial style
  const defaultFallback = (
    <div className="w-full h-full bg-[#111] flex flex-col items-center justify-center p-4 border border-white/5 relative">
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none animate-fadeIn"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }}
      />
      <span className="text-[8px] font-technical uppercase tracking-[0.25em] text-white/20 select-none">
        No Image Available
      </span>
      <span className="text-[6px] font-technical text-accent uppercase tracking-widest mt-1 select-none">
        Nex_Event // Archive
      </span>
    </div>
  );

  return (
    <div className={cn("relative overflow-hidden shrink-0", aspectRatio, className)}>
      {/* Loading Skeleton */}
      {loading && (
        <div className="absolute inset-0 bg-white/[0.03] animate-pulse z-10 flex items-center justify-center">
          <div className="w-4 h-4 border border-white/10 border-t-accent rounded-full animate-spin" />
        </div>
      )}

      {/* Render Image */}
      {(!src || error) ? (
        fallback || defaultFallback
      ) : (
        <img
          src={src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
          className={cn(
            "w-full h-full object-cover transition-opacity duration-300",
            loading ? "opacity-0" : "opacity-100"
          )}
          {...props}
        />
      )}
    </div>
  );
};
