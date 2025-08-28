import React, { useState, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Heading, Text } from './ui/Typography';
import { Icon } from './ui/Icon';
import { Modal } from './ui/Modal';

interface CustomAction {
  id: string;
  name: string;
  icon?: string;
  created_at: number;
  key_sequence: Array<{
    key: string;
    event_type: string;
    timestamp: number;
    modifiers: {
      alt: boolean;
      ctrl: boolean;
      shift: boolean;
      meta: boolean;
    };
  }>;
  shortcut_type: string;
}

interface CustomActionsProps {
  onLog: (
    message: string,
    type: 'info' | 'success' | 'warning' | 'error'
  ) => void;
}

export const CustomActions: React.FC<CustomActionsProps> = ({ onLog }) => {
  const [customActions, setCustomActions] = useState<CustomAction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingAction, setEditingAction] = useState<CustomAction | null>(null);
  const [newName, setNewName] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const loadCustomActions = useCallback(async () => {
    setIsLoading(true);
    try {
      const actions = await invoke<CustomAction[]>('get_all_custom_actions');
      setCustomActions(actions);
      onLog(`Loaded ${actions.length} custom actions`, 'success');
    } catch (error) {
      console.error('Failed to load custom actions:', error);
      onLog(`Failed to load custom actions: ${error}`, 'error');
    }
    setIsLoading(false);
  }, [onLog]);

  const handleEditClick = (action: CustomAction) => {
    setEditingAction(action);
    setNewName(action.name);
  };

  const handleUpdateName = async () => {
    if (!editingAction || !newName.trim()) return;

    setIsUpdating(true);
    try {
      await invoke('update_custom_action_name', {
        actionId: editingAction.id,
        newName: newName.trim(),
      });

      onLog(`Custom action renamed to: ${newName.trim()}`, 'success');
      setEditingAction(null);
      setNewName('');
      await loadCustomActions(); // Reload the list
    } catch (error) {
      console.error('Failed to update custom action:', error);
      onLog(`Failed to update custom action: ${error}`, 'error');
    }
    setIsUpdating(false);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleTimeString();
  };

  const formatShortcutType = (type: string) => {
    return type === 'Sequential' ? 'シーケンシャル' : '通常';
  };

  useEffect(() => {
    loadCustomActions();
  }, [loadCustomActions]);

  return (
    <>
      <Card>
        <div className='p-4'>
          <div className='flex items-center justify-between mb-4'>
            <div>
              <Heading level={2} className='text-white'>
                カスタムアクション
              </Heading>
              <Text variant='small' className='text-gray-400'>
                録画したキーボード操作を管理できます
              </Text>
            </div>
            <Button
              variant='secondary'
              size='sm'
              onClick={loadCustomActions}
              disabled={isLoading}
            >
              <Icon name='refresh' className='w-4 h-4 mr-2' />
              {isLoading ? '読み込み中...' : '更新'}
            </Button>
          </div>

          {isLoading ? (
            <div className='text-center py-8'>
              <div className='inline-flex items-center gap-2 text-gray-400'>
                <Icon name='loading' className='w-4 h-4 animate-spin' />
                読み込み中...
              </div>
            </div>
          ) : customActions.length === 0 ? (
            <div className='text-center py-8'>
              <Icon
                name='keyboard'
                className='w-8 h-8 text-gray-600 mx-auto mb-2'
              />
              <Text className='text-gray-400'>
                カスタムアクションがありません
              </Text>
              <Text variant='small' className='text-gray-500 mt-1'>
                モバイルアプリから録画を開始してカスタムアクションを作成してください
              </Text>
            </div>
          ) : (
            <div className='space-y-3'>
              {customActions.map(action => (
                <div
                  key={action.id}
                  className='bg-gray-800/30 rounded-lg p-3 border border-gray-700/50'
                >
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                      <div className='w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center'>
                        <Icon
                          name={action.icon || 'keyboard'}
                          className='w-4 h-4 text-blue-600'
                        />
                      </div>
                      <div>
                        <Text className='font-medium text-white'>
                          {action.name}
                        </Text>
                        <div className='flex items-center gap-2 mt-1'>
                          <Text variant='small' className='text-gray-400'>
                            {action.key_sequence.length}個のキー
                          </Text>
                          <Text variant='small' className='text-gray-500'>
                            •
                          </Text>
                          <Text variant='small' className='text-gray-400'>
                            {formatShortcutType(action.shortcut_type)}
                          </Text>
                          <Text variant='small' className='text-gray-500'>
                            •
                          </Text>
                          <Text variant='small' className='text-gray-400'>
                            {formatDate(action.created_at)}
                          </Text>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant='secondary'
                      size='sm'
                      onClick={() => handleEditClick(action)}
                    >
                      <Icon name='edit' className='w-4 h-4 mr-1' />
                      編集
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Edit Modal */}
      <Modal
        isOpen={editingAction !== null}
        onClose={() => {
          setEditingAction(null);
          setNewName('');
        }}
        title='カスタムアクション名を編集'
      >
        <div className='space-y-4'>
          <div>
            <label
              htmlFor='actionName'
              className='block text-sm font-medium text-white mb-2'
            >
              アクション名
            </label>
            <input
              id='actionName'
              type='text'
              value={newName}
              onChange={e => setNewName(e.target.value)}
              className='w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              placeholder='アクション名を入力...'
            />
          </div>

          {editingAction && (
            <div className='bg-gray-800/50 rounded-lg p-3'>
              <Text variant='small' className='text-gray-400 mb-2'>
                アクション詳細
              </Text>
              <div className='space-y-1'>
                <Text variant='small' className='text-gray-300'>
                  ID: {editingAction.id}
                </Text>
                <Text variant='small' className='text-gray-300'>
                  キー数: {editingAction.key_sequence.length}個
                </Text>
                <Text variant='small' className='text-gray-300'>
                  タイプ: {formatShortcutType(editingAction.shortcut_type)}
                </Text>
                <Text variant='small' className='text-gray-300'>
                  作成日時: {formatDate(editingAction.created_at)}
                </Text>
              </div>
            </div>
          )}

          <div className='flex gap-2 pt-4'>
            <Button
              variant='secondary'
              className='flex-1'
              onClick={() => {
                setEditingAction(null);
                setNewName('');
              }}
              disabled={isUpdating}
            >
              キャンセル
            </Button>
            <Button
              variant='primary'
              className='flex-1'
              onClick={handleUpdateName}
              disabled={isUpdating || !newName.trim()}
            >
              {isUpdating ? (
                <>
                  <Icon name='loading' className='w-4 h-4 mr-2 animate-spin' />
                  更新中...
                </>
              ) : (
                <>
                  <Icon name='check' className='w-4 h-4 mr-2' />
                  保存
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
