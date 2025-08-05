import React from 'react';

interface IconProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
  };

  const classes = `${sizeClasses[size]} ${className}`;

  const icons: Record<string, string> = {
    // Connection & Network
    connect: '🤝',
    qr: '📷',
    scan: '🔍',
    wifi: '📶',
    server: '🖥️',
    mobile: '📱',
    
    // Status
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
    loading: '⏳',
    
    // Actions
    play: '▶️',
    pause: '⏸️',
    stop: '⏹️',
    refresh: '🔄',
    settings: '⚙️',
    edit: '✏️',
    delete: '🗑️',
    copy: '📋',
    
    // UI Elements
    chevron_right: '›',
    chevron_down: '⌄',
    close: '✕',
    check: '✓',
    plus: '+',
    minus: '-',
    
    // Specific to app
    keyboard: '⌨️',
    password: '🔐',
    shield: '🛡️',
    lock: '🔒',
    unlock: '🔓',
  };

  return (
    <span className={classes} role="img" aria-label={name}>
      {icons[name] || '❓'}
    </span>
  );
};