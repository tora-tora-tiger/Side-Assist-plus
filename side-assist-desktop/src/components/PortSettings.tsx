import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Icon } from './ui';

interface PortSettingsProps {
  currentPort: number;
  onPortChange: (port: number) => void;
  isLoading?: boolean;
}

export const PortSettings: React.FC<PortSettingsProps> = ({
  currentPort,
  onPortChange,
  isLoading = false,
}) => {
  const [portInput, setPortInput] = useState(currentPort.toString());
  const [isEditingPort, setIsEditingPort] = useState(false);

  useEffect(() => {
    setPortInput(currentPort.toString());
  }, [currentPort]);

  const handlePortSave = () => {
    const port = parseInt(portInput, 10);
    if (port >= 1024 && port <= 65535) {
      onPortChange(port);
      setIsEditingPort(false);
    }
  };

  const handlePortCancel = () => {
    setPortInput(currentPort.toString());
    setIsEditingPort(false);
  };

  const isValidPort =
    portInput &&
    parseInt(portInput, 10) >= 1024 &&
    parseInt(portInput, 10) <= 65535;

  return (
    <Card variant='elevated'>
      <CardHeader className='pb-2'>
        <div className='flex items-center gap-2'>
          <Icon name='server' className='text-stone-400' />
          <CardTitle className='text-stone-200'>Server Port</CardTitle>
        </div>
      </CardHeader>

      <CardContent className='p-3'>
        <div className='space-y-3'>
          <p className='text-sm text-stone-400'>
            Network port for iPad connections (1024-65535)
          </p>

          <div className='flex items-center gap-2'>
            {isEditingPort ? (
              <>
                <input
                  type='number'
                  min='1024'
                  max='65535'
                  value={portInput}
                  onChange={e => setPortInput(e.target.value)}
                  className='bg-stone-800/50 border border-stone-600/50 rounded-lg px-3 py-2 text-stone-200 w-28 text-sm focus:outline-none focus:border-stone-500 focus:ring-1 focus:ring-stone-500'
                  autoFocus
                  disabled={isLoading}
                />
                <Button
                  variant='primary'
                  size='sm'
                  onClick={handlePortSave}
                  disabled={!isValidPort || isLoading}
                  loading={isLoading}
                >
                  Save
                </Button>
                <Button
                  variant='secondary'
                  size='sm'
                  onClick={handlePortCancel}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <div className='flex items-center gap-2'>
                  <span className='text-stone-300 font-mono text-base bg-stone-800/30 px-3 py-2 rounded-lg border border-stone-700/30'>
                    {currentPort}
                  </span>
                  <Button
                    variant='secondary'
                    size='sm'
                    onClick={() => setIsEditingPort(true)}
                    disabled={isLoading}
                  >
                    <Icon name='settings' className='w-3 h-3 mr-1' />
                    Change
                  </Button>
                </div>
              </>
            )}
          </div>

          {isEditingPort && !isValidPort && portInput && (
            <p className='text-xs text-amber-400'>
              Port must be between 1024 and 65535
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
