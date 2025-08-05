import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, Badge, StatusDot, Icon } from './ui';

interface ServerStatusProps {
  status: {
    running: boolean;
    connected_clients: number;
    port: number;
  };
}

export const ServerStatus: React.FC<ServerStatusProps> = ({ status }) => {
  const getStatusVariant = () => {
    if (!status.running) return 'error';
    return status.connected_clients > 0 ? 'success' : 'warning';
  };

  const getStatusText = () => {
    if (!status.running) return 'Offline';
    return status.connected_clients > 0 ? 'Connected' : 'Waiting for connections';
  };

  const getStatusDot = () => {
    if (!status.running) return 'offline';
    return status.connected_clients > 0 ? 'online' : 'connecting';
  };

  return (
    <Card variant="elevated">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Icon name="server" size="lg" />
          <CardTitle>Server Status</CardTitle>
          <StatusDot status={getStatusDot()} />
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Port:</span>
            <Badge variant="default">{status.port}</Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Status:</span>
            <Badge variant={getStatusVariant()}>
              {getStatusText()}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Connected Clients:</span>
            <Badge variant={status.connected_clients > 0 ? 'success' : 'default'}>
              {status.connected_clients}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};