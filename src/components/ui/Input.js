import React from 'react';

const Input = React.forwardRef(({
  label,
  error,
  icon: Icon,
  type = 'text',
  className = '',
  id,
  ...props
}, ref) => {
  const inputId = id || props.name || Math.random().toString(36).substring(2, 9);
  
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label 
          htmlFor={inputId} 
          className="block text-sm font-semibold text-slate-700 mb-1.5 transition-colors duration-200"
        >
          {label}
        </label>
      )}
      <div className="relative rounded-xl shadow-sm">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Icon className="h-5 w-5 transition-colors duration-200" aria-hidden="true" />
          </div>
        )}
        <input
          id={inputId}
          ref={ref}
          type={type}
          className={`block w-full rounded-xl border bg-white py-3 transition-all duration-200 outline-none
            ${Icon ? 'pl-11' : 'pl-4'} pr-4
            ${error 
              ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' 
              : 'border-slate-200 text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10'
            }
            disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:cursor-not-allowed text-sm
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1.5 text-xs font-medium text-red-600 animate-slide-down" id={`${inputId}-error`}>
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
