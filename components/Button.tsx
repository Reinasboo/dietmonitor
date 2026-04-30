'use client';

import React from 'react';
import clsx from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', isLoading = false, className, children, ...props }, ref) => {
    const baseStyles = 'font-medium transition-all duration-200 rounded-pill focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2';

    const variantStyles = {
      primary:
        'bg-lilac-600 text-white hover:bg-lilac-700 focus:ring-lilac-500 active:scale-95',
      secondary:
        'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-400 active:scale-95',
      tertiary:
        'bg-transparent text-lilac-600 hover:bg-lilac-50 focus:ring-lilac-500',
      danger:
        'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500 active:scale-95',
    };

    const sizeStyles = {
      sm: 'px-md py-sm text-xs',
      md: 'px-lg py-md text-sm',
      lg: 'px-2xl py-lg text-base',
    };

    return (
      <button
        ref={ref}
        className={clsx(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
