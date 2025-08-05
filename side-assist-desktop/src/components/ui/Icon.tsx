import React from 'react';
import {
  Link,
  QrCode,
  Server,
  Smartphone,
  Keyboard,
  Settings,
  BarChart3,
  Lock,
  RotateCcw,
  Play,
  AlertTriangle,
  Clock,
  Shield,
  Activity,
  X,
  type LucideIcon
} from 'lucide-react';

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
  const sizeMap = {
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
    '2xl': 40,
  };

  const iconSize = sizeMap[size];

  const iconMap: Record<string, LucideIcon> = {
    connect: Link,
    qr: QrCode,
    server: Server,
    mobile: Smartphone,
    keyboard: Keyboard,
    settings: Settings,
    activity: BarChart3,
    lock: Lock,
    refresh: RotateCcw,
    play: Play,
    warning: AlertTriangle,
    clock: Clock,
    shield: Shield,
    loading: Activity,
    close: X,
  };

  const IconComponent = iconMap[name] || AlertTriangle;

  return (
    <IconComponent 
      size={iconSize} 
      className={className}
    />
  );
};