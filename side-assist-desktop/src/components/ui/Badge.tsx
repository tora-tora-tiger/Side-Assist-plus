import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}) => {
  const baseClasses = [
    'inline-flex',
    'items-center',
    'font-medium',
    'rounded-full',
    'border',
  ];

  const sizeClasses = {
    sm: ['px-2', 'py-0.5', 'text-xs'],
    md: ['px-2.5', 'py-1', 'text-sm'],
    lg: ['px-3', 'py-1.5', 'text-base'],
  };

  const variantClasses = {
    default: [
      'bg-stone-700/50',
      'text-stone-300',
      'border-stone-600/50',
    ],
    success: [
      'bg-stone-600/50',
      'text-stone-200',
      'border-stone-500/50',
    ],
    warning: [
      'bg-stone-600/50',
      'text-stone-300',
      'border-stone-500/50',
    ],
    error: [
      'bg-stone-700/50',
      'text-stone-400',
      'border-stone-600/50',
    ],
    info: [
      'bg-stone-600/50',
      'text-stone-200',
      'border-stone-500/50',
    ],
  };

  const classes = [
    ...baseClasses,
    ...sizeClasses[size],
    ...variantClasses[variant],
    className,
  ].join(' ');

  return <span className={classes}>{children}</span>;
};

interface StatusDotProps {
  status: 'online' | 'offline' | 'connecting' | 'error';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const StatusDot: React.FC<StatusDotProps> = ({
  status,
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  const statusClasses = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    connecting: 'bg-yellow-500 animate-pulse',
    error: 'bg-red-500',
  };

  const classes = `rounded-full ${sizeClasses[size]} ${statusClasses[status]} ${className}`;

  return <div className={classes}></div>;
};