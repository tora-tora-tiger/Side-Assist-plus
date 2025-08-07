import React from 'react';
import { PermissionConfig } from '../config/permissions';

interface PermissionBannerProps {
  config: PermissionConfig;
  hasAccessibilityPermission: boolean | null;
  isLoading: boolean;
  onRequestPermissions: () => Promise<boolean>;
  onOpenSystemPreferences: () => Promise<void>;
}

export const PermissionBanner: React.FC<PermissionBannerProps> = ({
  config,
  hasAccessibilityPermission,
  isLoading,
  onRequestPermissions,
  onOpenSystemPreferences,
}) => {
  // 権限機能が無効、またはバナー表示が無効の場合は何も表示しない
  if (!config.enabled || !config.showStatusBanner) {
    return null;
  }

  // 権限が許可されている、または未チェックの場合は表示しない
  if (hasAccessibilityPermission !== false) {
    return null;
  }

  return (
    <div className='bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6'>
      <h2 className='text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2'>
        ⚠️ システム権限が必要
      </h2>
      <p className='text-yellow-700 dark:text-yellow-300 text-sm mb-4'>
        キーボード入力を有効にするため、アクセシビリティ権限が必要です。
        システム環境設定でSide Assistにアクセシビリティ権限を許可してください。
      </p>
      {config.showRequestButton && (
        <div className='flex space-x-2'>
          <button
            onClick={onOpenSystemPreferences}
            disabled={isLoading}
            className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50'
          >
            システム環境設定を開く
          </button>
          <button
            onClick={onRequestPermissions}
            disabled={isLoading}
            className='px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 focus:ring-2 focus:ring-yellow-500 focus:outline-none disabled:opacity-50'
          >
            {isLoading ? '権限要求中...' : '自動許可を試行'}
          </button>
        </div>
      )}
    </div>
  );
};
