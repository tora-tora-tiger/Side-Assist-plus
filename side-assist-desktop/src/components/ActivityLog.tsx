import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, Badge, Icon, Stack, Inline, Text } from './ui';

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
      case 'success': return 'play';
      case 'warning': return 'warning';
      case 'error': return 'warning';
      default: return 'activity';
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <Inline gap="sm" align="center">
          <Icon name="activity" className="text-stone-400" />
          <CardTitle className="text-stone-200">Activity Log</CardTitle>
          <Badge variant="default" size="sm">
            {logs.length} entries
          </Badge>
        </Inline>
      </CardHeader>
      
      <CardContent>
        <Stack gap="sm" className="h-full max-h-[300px] overflow-y-auto">
          {logs.length === 0 ? (
            <Stack gap="sm" align="center" className="py-8">
              <Icon name="activity" size="xl" className="text-stone-500" />
              <Text variant="muted" className="text-stone-400">No activity yet</Text>
            </Stack>
          ) : (
            logs.map((log, index) => (
              <div
                key={index}
                className="flex items-start gap-2 p-2 bg-gray-900/30 rounded-lg hover:bg-gray-900/40 transition-colors"
              >
                <Icon name={getLogIcon(log.type)} className="text-stone-400 mt-0.5" size="sm" />
                
                <Stack gap="xs" className="flex-1 min-w-0">
                  <Inline justify="between" align="start" className="gap-2">
                    <Text variant="small" className="text-stone-300 break-words">
                      {log.message}
                    </Text>
                    <Badge variant="default" size="sm">
                      {log.type}
                    </Badge>
                  </Inline>
                  
                  <Text variant="caption" className="text-stone-500 font-mono">
                    {log.time}
                  </Text>
                </Stack>
              </div>
            ))
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};