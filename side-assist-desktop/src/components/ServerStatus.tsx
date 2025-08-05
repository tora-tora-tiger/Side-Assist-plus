import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardActions, Badge, StatusDot, Icon, Button } from './ui';

interface ServerStatusProps {
  status: {
    running: boolean;
    connected_clients: number;
    port: number;
  };
  isGeneratingPassword: boolean;
  onGeneratePassword: () => void;
}

export const ServerStatus: React.FC<ServerStatusProps> = ({ 
  status, 
  isGeneratingPassword, 
  onGeneratePassword
}) => {
  const getStatusVariant = () => {
    if (!status.running) return 'error';
    return status.connected_clients > 0 ? 'success' : 'info';
  };

  const getStatusText = () => {
    if (!status.running) return 'Offline';
    return status.connected_clients > 0 ? 'Connected' : 'Ready';
  };

  const getStatusDot = () => {
    if (!status.running) return 'offline';
    return status.connected_clients > 0 ? 'online' : 'connecting';
  };

  return (
    <Card variant="elevated" className="h-full flex flex-col">
      <CardHeader className="pb-2 shrink-0">
        <div className="flex items-center gap-2">
          <Icon name="server" className="text-stone-400" />
          <CardTitle className="text-stone-200">Server Status</CardTitle>
          <StatusDot status={getStatusDot()} />
        </div>
      </CardHeader>
      
      <CardContent className="p-3 flex-1">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-400">Port</span>
            <Badge variant="default">{status.port}</Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-400">Status</span>
            <Badge variant={getStatusVariant()}>
              {getStatusText()}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-400">Clients</span>
            <Badge variant={status.connected_clients > 0 ? 'default' : 'default'}>
              {status.connected_clients}
            </Badge>
          </div>
          
          {status.running && (
            <div className="pt-2 mt-2 border-t border-gray-700/50">
              <p className="text-xs text-stone-400 mb-1">Network</p>
              <div className="bg-gray-900/50 border border-gray-600/30 rounded-lg p-2 font-mono text-xs text-stone-300">
                localhost:{status.port}
              </div>
            </div>
          )}
        </div>
      </CardContent>

      <CardActions className="pt-2 shrink-0">
        <Button
          variant="primary"
          size="sm"
          onClick={onGeneratePassword}
          loading={isGeneratingPassword}
          disabled={isGeneratingPassword}
          className="w-full"
        >
          <Icon name="refresh" className="mr-1" />
          {isGeneratingPassword ? 'Generating...' : 'Generate New'}
        </Button>
      </CardActions>
    </Card>
  );
};