import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, Badge, Icon } from './ui';

interface LogEntry {
  time: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface ActivityLogProps {
  logs: LogEntry[];
}

export const ActivityLog: React.FC<ActivityLogProps> = ({ logs }) => {
  const getLogIcon = (type: LogEntry['type']) => {
    switch (type) {
      case 'success': return 'success';
      case 'warning': return 'warning';
      case 'error': return 'error';
      default: return 'info';
    }
  };

  const getLogVariant = (type: LogEntry['type']) => {
    switch (type) {
      case 'success': return 'success';
      case 'warning': return 'warning';
      case 'error': return 'error';
      default: return 'info';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Icon name="info" size="lg" />
          <CardTitle>Activity Log</CardTitle>
          <Badge variant="default" size="sm">
            {logs.length} entries
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {logs.length === 0 ? (
            <div className="text-center py-8">
              <Icon name="info" size="2xl" className="text-gray-300 mb-2" />
              <p className="text-gray-500">No activity yet</p>
            </div>
          ) : (
            logs.map((log, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-shrink-0 mt-0.5">
                  <Icon name={getLogIcon(log.type)} className="text-sm" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm text-gray-900 break-words">
                      {log.message}
                    </p>
                    <Badge variant={getLogVariant(log.type)} size="sm">
                      {log.type}
                    </Badge>
                  </div>
                  
                  <p className="text-xs text-gray-500 mt-1 font-mono">
                    {log.time}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};