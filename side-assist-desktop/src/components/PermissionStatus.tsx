import React from 'react';
import { PermissionConfig } from '../config/permissions';

interface PermissionStatusProps {
  config: PermissionConfig;
  hasAccessibilityPermission: boolean | null;
  isLoading: boolean;
  onCheckPermissions: () => Promise<boolean>;
  onRequestPermissions: () => Promise<boolean>;
  onOpenSystemPreferences: () => Promise<void>;
}

export const PermissionStatus: React.FC<PermissionStatusProps> = ({
  config,
  hasAccessibilityPermission,
  isLoading,
  onCheckPermissions,
  onRequestPermissions,
  onOpenSystemPreferences,
}) => {
  // 権限機能が無効の場合は何も表示しない
  if (!config.enabled) {
    return null;
  }

  const getStatusIcon = () => {
    if (hasAccessibilityPermission === null) return '⏳';
    return hasAccessibilityPermission ? '✅' : '❌';
  };

  const getStatusText = () => {
    if (hasAccessibilityPermission === null) return 'チェック中...';
    return hasAccessibilityPermission ? '許可済み' : '未許可';
  };

  const getStatusColor = () => {
    if (hasAccessibilityPermission === null) return 'text-gray-600';
    return hasAccessibilityPermission ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        システム権限
      </h2>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500 dark:text-gray-400">アクセシビリティ:</span>
          <span className={`font-medium ${getStatusColor()}`}>
            {getStatusIcon()} {getStatusText()}
          </span>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={onCheckPermissions}
            disabled={isLoading}
            className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
          >
            再チェック
          </button>
          
          {config.showRequestButton && hasAccessibilityPermission === false && (
            <>
              <button
                onClick={onOpenSystemPreferences}
                disabled={isLoading}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                環境設定を開く
              </button>
              <button
                onClick={onRequestPermissions}
                disabled={isLoading}
                className="px-3 py-1 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50"
              >
                {isLoading ? '要求中...' : '自動許可を試行'}
              </button>
            </>
          )}
        </div>
        
        <p className="text-xs text-gray-500 dark:text-gray-400">
          macOS でキーボード入力を行うために必要です
        </p>
      </div>
    </div>
  );
};