import React from 'react';
import { Badge, StatusDot, Icon } from './ui';

interface AppHeaderProps {
  serverStatus: {
    running: boolean;
    connected_clients: number;
    port: number;
  };
  currentLanguage: string;
  onLanguageChange: (language: string) => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  serverStatus,
  currentLanguage,
  onLanguageChange,
}) => {
  const getStatusText = () => {
    if (!serverStatus.running) return 'Offline';
    return serverStatus.connected_clients > 0 ? 'Connected' : 'Waiting';
  };

  const getStatusDot = () => {
    if (!serverStatus.running) return 'offline';
    return serverStatus.connected_clients > 0 ? 'online' : 'connecting';
  };

  const getStatusVariant = () => {
    if (!serverStatus.running) return 'error';
    return serverStatus.connected_clients > 0 ? 'success' : 'warning';
  };

  return (
    <header className='bg-white border-b border-gray-200 shadow-sm'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center py-4'>
          {/* Logo & Title */}
          <div className='flex items-center gap-4'>
            <div className='flex items-center gap-3'>
              <Icon name='connect' size='2xl' />
              <div>
                <h1 className='text-2xl font-bold text-gray-900'>
                  Side Assist
                </h1>
                <p className='text-sm text-gray-500'>iPad Keyboard Bridge</p>
              </div>
            </div>
          </div>

          {/* Status & Controls */}
          <div className='flex items-center gap-6'>
            {/* Language Selector */}
            <div className='flex items-center gap-2'>
              <Icon name='settings' className='text-gray-400' />
              <select
                value={currentLanguage}
                onChange={e => onLanguageChange(e.target.value)}
                className='px-3 py-1 bg-gray-50 border border-gray-300 rounded-md text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              >
                <option value='en'>English</option>
                <option value='ja'>日本語</option>
              </select>
            </div>

            {/* Server Status */}
            <div className='flex items-center gap-3'>
              <StatusDot status={getStatusDot()} size='md' />
              <div className='text-right'>
                <Badge variant={getStatusVariant()} size='sm'>
                  {getStatusText()}
                </Badge>
                <p className='text-xs text-gray-500 mt-1'>
                  Port {serverStatus.port}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
