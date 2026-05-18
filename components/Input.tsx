'use client';

import React from 'react';
import clsx from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id || props.name || label?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || undefined;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-900 mb-md">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={clsx(
            'w-full px-lg py-md text-sm font-medium rounded-pill border-2 transition-colors',
            'placeholder:text-gray-400',
            'focus:outline-none focus:ring-2 focus:ring-lilac-500 focus:border-lilac-500',
            error
              ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
              : 'border-gray-200 hover:border-gray-300',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-600 mt-md">{error}</p>}
        {hint && !error && <p className="text-xs text-gray-500 mt-md">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
