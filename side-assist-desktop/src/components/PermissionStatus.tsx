import React from 'react';
import { PermissionConfig } from '../config/permissions';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardActions,
  Button,
  Icon,
  Badge,
} from './ui';

interface PermissionStatusProps {
  config: PermissionConfig;
  hasAccessibilityPermission: boolean | null;
  isLoading: boolean;
  onOpenSystemPreferences: () => Promise<void>;
}

export const PermissionStatus: React.FC<PermissionStatusProps> = ({
  config,
  hasAccessibilityPermission,
  isLoading,
  onOpenSystemPreferences,
}) => {
  // 権限機能が無効の場合は何も表示しない
  if (!config.enabled) {
    return null;
  }

  const getStatusText = () => {
    if (hasAccessibilityPermission === null) return 'Checking...';
    return hasAccessibilityPermission ? 'Granted' : 'Required';
  };

  const getStatusVariant = () => {
    if (hasAccessibilityPermission === null) return 'warning';
    return hasAccessibilityPermission ? 'success' : 'error';
  };

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center gap-3'>
          <Icon name='settings' size='lg' />
          <CardTitle>System Permissions</CardTitle>
          <Badge variant={getStatusVariant()}>{getStatusText()}</Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className='space-y-4'>
          <div className='bg-stone-900/30 rounded-lg p-4'>
            <div className='flex items-start gap-3'>
              <Icon name='shield' className='text-stone-400 mt-1' />
              <div>
                <h4 className='font-medium text-stone-200 mb-1'>
                  Accessibility Permission
                </h4>
                <p className='text-sm text-stone-400 mb-3'>
                  Required for keyboard input simulation on macOS
                </p>

                {hasAccessibilityPermission === false && (
                  <div className='bg-amber-500/20 border border-amber-400/30 rounded-lg p-3'>
                    <div className='flex items-start gap-2'>
                      <Icon name='warning' className='text-amber-400 mt-0.5' />
                      <div className='text-sm text-amber-300'>
                        <p className='font-medium mb-1'>Permission Required</p>
                        <p>
                          System Preferences → Security & Privacy →
                          Accessibility
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      {hasAccessibilityPermission !== true && (
        <CardActions>
          <Button
            variant='primary'
            onClick={onOpenSystemPreferences}
            disabled={isLoading}
          >
            <Icon name='settings' className='mr-2' />
            Open System Preferences
          </Button>
        </CardActions>
      )}
    </Card>
  );
};
