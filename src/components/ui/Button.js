import React from 'react';

export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  isLoading = false,
  disabled = false,
  className = '',
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm px-5 py-3 shadow-md active:scale-[0.98]';
  
  const variants = {
    primary: 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white focus:ring-orange-500/20 shadow-orange-500/10 hover:shadow-lg hover:shadow-orange-500/20',
    secondary: 'bg-slate-900 hover:bg-slate-800 text-white focus:ring-slate-900/20',
    outline: 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 focus:ring-slate-500/10',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
}
