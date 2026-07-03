import React from 'react';

export const AuthDivider = ({ text = "or continue with" }) => {
  return (
    <div className="relative my-6 flex items-center justify-center">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-white/5"></div>
      </div>
      <div className="relative flex justify-center">
        <span className="bg-[#171717] px-4 text-metadata text-muted uppercase tracking-widest">
          {text}
        </span>
      </div>
    </div>
  );
};
