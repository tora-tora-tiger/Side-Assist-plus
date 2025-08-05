import React from 'react';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
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
    'rounded-xl',
    'transition-all',
    'duration-200',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-offset-2',
    'disabled:opacity-50',
    'disabled:cursor-not-allowed',
    'shadow-sm',
    'hover:shadow-md',
  ];

  const sizeClasses = {
    sm: ['px-3', 'py-1.5', 'text-sm'],
    md: ['px-4', 'py-2', 'text-sm'],
    lg: ['px-6', 'py-3', 'text-base'],
  };

  const variantClasses = {
    primary: [
      'bg-blue-600',
      'text-white',
      'hover:bg-blue-700',
      'focus:ring-blue-500',
      'shadow-blue-200',
    ],
    secondary: [
      'bg-gray-100',
      'text-gray-700',
      'hover:bg-gray-200',
      'focus:ring-gray-500',
      'border',
      'border-gray-300',
    ],
    danger: [
      'bg-red-600',
      'text-white',
      'hover:bg-red-700',
      'focus:ring-red-500',
      'shadow-red-200',
    ],
    success: [
      'bg-green-600',
      'text-white',
      'hover:bg-green-700',
      'focus:ring-green-500',
      'shadow-green-200',
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