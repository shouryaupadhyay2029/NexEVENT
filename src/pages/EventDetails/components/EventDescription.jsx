import React from 'react';

export const EventDescription = ({ category, title, description }) => {
  return (
    <div className="flex flex-col text-left max-w-[650px] w-full gap-4">
      <span className="text-micro text-secondary tracking-[0.18em] uppercase font-technical">
        {category}
      </span>
      <h1 className="text-display-l text-primary mb-2 font-light leading-tight">
        {title}
      </h1>
      <p className="text-body-l text-secondary leading-relaxed mt-4">
        {description}
      </p>
    </div>
  );
};
