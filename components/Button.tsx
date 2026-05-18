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
    const baseStyles = 'font-medium rounded-pill focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-[transform,box-shadow,background-color,color,border-color,opacity] duration-150 ease-out active:translate-y-px';

    const variantStyles = {
      primary:
        'bg-lilac-600 text-white shadow-sm shadow-lilac-600/15 hover:bg-lilac-700 hover:shadow-md hover:shadow-lilac-600/20 focus:ring-lilac-500',
      secondary:
        'bg-white text-gray-900 border border-gray-200 shadow-sm hover:bg-gray-50 hover:border-gray-300 hover:shadow-md focus:ring-gray-400',
      tertiary:
        'bg-transparent text-lilac-600 hover:bg-lilac-50 focus:ring-lilac-500',
      danger:
        'bg-red-500 text-white shadow-sm shadow-red-500/15 hover:bg-red-600 hover:shadow-md hover:shadow-red-500/20 focus:ring-red-500',
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
