import React from 'react';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  children,
  onClick,
  className = '',
  type = 'button',
}) => {
  const baseClasses = [
    'inline-flex',
    'items-center',
    'justify-center',
    'font-medium',
    'rounded-lg',
    'transition-all',
    'duration-200',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-offset-2',
    'focus:ring-offset-gray-950',
    'disabled:opacity-50',
    'disabled:cursor-not-allowed',
    'shadow-lg',
    'hover:shadow-xl',
    'active:scale-95',
  ];

  const sizeClasses = {
    sm: ['px-3', 'py-1.5', 'text-sm'],
    md: ['px-4', 'py-2', 'text-sm'],
    lg: ['px-6', 'py-3', 'text-base'],
  };

  const variantClasses = {
    primary: [
      'bg-gradient-to-r',
      'from-emerald-500',
      'to-cyan-500',
      'text-black',
      'hover:from-emerald-400',
      'hover:to-cyan-400',
      'focus:ring-emerald-400',
      'shadow-emerald-500/30',
      'font-semibold',
    ],
    secondary: [
      'bg-gray-800/60',
      'text-gray-200',
      'hover:bg-gray-800/80',
      'focus:ring-gray-400',
      'border',
      'border-gray-700/50',
      'backdrop-blur-sm',
    ],
    danger: [
      'bg-gradient-to-r',
      'from-red-500',
      'to-pink-500',
      'text-white',
      'hover:from-red-400',
      'hover:to-pink-400',
      'focus:ring-red-400',
      'shadow-red-500/30',
    ],
    success: [
      'bg-gradient-to-r',
      'from-emerald-500',
      'to-green-500',
      'text-black',
      'hover:from-emerald-400',
      'hover:to-green-400',
      'focus:ring-emerald-400',
      'shadow-emerald-500/30',
      'font-semibold',
    ],
    warning: [
      'bg-gradient-to-r',
      'from-amber-500',
      'to-yellow-500',
      'text-black',
      'hover:from-amber-400',
      'hover:to-yellow-400',
      'focus:ring-amber-400',
      'shadow-amber-500/30',
      'font-semibold',
    ],
  };

  const classes = [
    ...baseClasses,
    ...sizeClasses[size],
    ...variantClasses[variant],
    className,
  ].join(' ');

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
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
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      {children}
    </button>
  );
};