import React from 'react';

export default function Loader({ size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-16 h-16 border-4',
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div className="relative">
        {/* Outer Pulsing Glow */}
        <div className="absolute inset-0 rounded-full bg-orange-500/20 blur-md animate-ping" />
        
        {/* Spinning Ring */}
        <div
          className={`rounded-full border-t-orange-500 border-r-orange-200 border-b-orange-200 border-l-orange-200 animate-spin ${sizeClasses[size]}`}
          style={{ borderStyle: 'solid' }}
        />
      </div>
      <span className="text-sm font-semibold text-slate-500 tracking-wide animate-pulse">
        Preparing Delicious goodness...
      </span>
    </div>
  );
}
