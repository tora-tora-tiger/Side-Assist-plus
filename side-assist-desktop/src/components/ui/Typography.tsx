import React from 'react';
import { cn } from '../../utils/cn';

interface HeadingProps {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: React.ReactNode;
  className?: string;
}

export const Heading: React.FC<HeadingProps> = ({ level, children, className }) => {
  const baseClasses = 'font-semibold text-gray-900 tracking-tight';
  
  const levelClasses = {
    1: 'text-4xl lg:text-5xl',
    2: 'text-3xl lg:text-4xl',
    3: 'text-2xl lg:text-3xl',
    4: 'text-xl lg:text-2xl',
    5: 'text-lg lg:text-xl',
    6: 'text-base lg:text-lg',
  };

  const Component = `h${level}` as keyof React.JSX.IntrinsicElements;

  return (
    <Component className={cn(baseClasses, levelClasses[level], className)}>
      {children}
    </Component>
  );
};

interface TextProps {
  variant?: 'body' | 'small' | 'caption' | 'muted';
  children: React.ReactNode;
  className?: string;
  as?: 'p' | 'span' | 'div';
}

export const Text: React.FC<TextProps> = ({
  variant = 'body',
  children,
  className,
  as: Component = 'p',
}) => {
  const variantClasses = {
    body: 'text-base text-gray-700 leading-relaxed',
    small: 'text-sm text-gray-600 leading-normal',
    caption: 'text-xs text-gray-500 leading-tight',
    muted: 'text-sm text-gray-500 leading-normal',
  };

  return (
    <Component className={cn(variantClasses[variant], className)}>
      {children}
    </Component>
  );
};

interface CodeProps {
  children: React.ReactNode;
  className?: string;
  block?: boolean;
}

export const Code: React.FC<CodeProps> = ({ children, className, block = false }) => {
  const baseClasses = 'font-mono bg-gray-100 text-gray-800 border border-gray-200';
  
  if (block) {
    return (
      <pre className={cn(baseClasses, 'p-4 rounded-lg overflow-x-auto', className)}>
        <code>{children}</code>
      </pre>
    );
  }

  return (
    <code className={cn(baseClasses, 'px-1.5 py-0.5 rounded text-sm', className)}>
      {children}
    </code>
  );
};