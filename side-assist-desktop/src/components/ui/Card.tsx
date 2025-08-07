import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'elevated' | 'outlined';
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'md',
  variant = 'default',
}) => {
  const baseClasses = [
    'rounded-xl',
    'transition-all',
    'duration-200',
    'backdrop-blur-sm',
  ];

  const paddingClasses = {
    none: [],
    sm: ['p-4'],
    md: ['p-6'],
    lg: ['p-8'],
  };

  const variantClasses = {
    default: [
      'bg-gray-900/40',
      'border',
      'border-gray-800/30',
      'shadow-2xl',
      'hover:shadow-3xl',
      'hover:bg-gray-900/50',
      'backdrop-blur-xl',
    ],
    elevated: [
      'bg-gray-900/60',
      'border',
      'border-gray-700/40',
      'shadow-3xl',
      'hover:shadow-4xl',
      'hover:bg-gray-900/70',
      'backdrop-blur-xl',
    ],
    outlined: [
      'bg-gray-950/30',
      'border-2',
      'border-gray-700/50',
      'shadow-2xl',
      'hover:border-gray-600/60',
      'hover:bg-gray-950/40',
      'backdrop-blur-xl',
    ],
  };

  const classes = [
    ...baseClasses,
    ...paddingClasses[padding],
    ...variantClasses[variant],
    className,
  ].join(' ');

  return <div className={classes}>{children}</div>;
};

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  className = '',
}) => {
  return <div className={`mb-6 ${className}`}>{children}</div>;
};

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
  level?: 1 | 2 | 3;
}

export const CardTitle: React.FC<CardTitleProps> = ({
  children,
  className = '',
  level = 2,
}) => {
  const baseClasses = 'font-semibold text-white leading-tight';

  const levelClasses = {
    1: 'text-2xl',
    2: 'text-xl',
    3: 'text-lg',
  };

  const classes = `${baseClasses} ${levelClasses[level]} ${className}`;

  const Tag = `h${level}` as keyof React.JSX.IntrinsicElements;

  return <Tag className={classes}>{children}</Tag>;
};

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`text-gray-300 leading-relaxed ${className}`}>
      {children}
    </div>
  );
};

interface CardActionsProps {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right' | 'between';
}

export const CardActions: React.FC<CardActionsProps> = ({
  children,
  className = '',
  align = 'right',
}) => {
  const alignClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
    between: 'justify-between',
  };

  const classes = `flex items-center gap-3 mt-6 ${alignClasses[align]} ${className}`;

  return <div className={classes}>{children}</div>;
};
