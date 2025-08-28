import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Heading, Text } from './ui/Typography';
import { Icon } from './ui/Icon';

interface RecordingModalInfo {
  action_id: string;
  name: string;
  icon?: string;
  is_visible: boolean;
  is_recording: boolean;
  is_completed: boolean; // 録画完了フラグ
  start_time?: number;
  recorded_keys: Array<{
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
  shortcut_type: 'Normal' | 'Sequential'; // ショートカットタイプ
}

export const RecordingModal: React.FC = () => {
  const [modalInfo, setModalInfo] = useState<RecordingModalInfo | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [selectedShortcutType, setSelectedShortcutType] = useState<
    'normal' | 'sequential'
  >('normal');
  const [editableName, setEditableName] = useState('');

  // modalInfoが変更されたときにeditableNameを同期（初回のみ）
  useEffect(() => {
    if (modalInfo && editableName === '') {
      setEditableName(modalInfo.name);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalInfo]);

  // 名前更新ハンドラー（フロントエンドのみ）
  const handleNameChange = (newName: string) => {
    if (!newName.trim()) {
      // 空文字の場合は元の名前に戻す
      setEditableName(modalInfo?.name || '');
      return;
    }
    // 単純にeditableNameを更新（録画停止時に使用される）
    setEditableName(newName.trim());
  };

  // ポーリングで録画モーダル情報を監視
  useEffect(() => {
    const checkModalInfo = async () => {
      try {
        const info = await invoke<RecordingModalInfo | null>(
          'get_recording_modal_info'
        );
        setModalInfo(info);
      } catch (error) {
        console.error('Failed to get recording modal info:', error);
      }
    };

    // 初回チェック
    checkModalInfo();

    // 500msごとにポーリング
    const interval = setInterval(checkModalInfo, 500);

    return () => clearInterval(interval);
  }, []);

  const handleStartRecording = async () => {
    if (!modalInfo) return;

    setIsStarting(true);
    try {
      await invoke('start_actual_recording', {
        shortcutType:
          selectedShortcutType === 'sequential' ? 'Sequential' : 'Normal',
      });
    } catch (error) {
      console.error('Failed to start recording:', error);
      alert(`録画開始エラー: ${error}`);
    }
    setIsStarting(false);
  };

  const handleStopRecording = async () => {
    if (!modalInfo) return;

    setIsStopping(true);
    try {
      const result = await invoke<string>('stop_actual_recording', {
        customName: editableName.trim() || modalInfo.name,
      });
      alert(`録画完了: ${result}`);
    } catch (error) {
      console.error('Failed to stop recording:', error);
      alert(`録画停止エラー: ${error}`);
    }
    setIsStopping(false);
  };

  const handleCancel = async () => {
    try {
      await invoke('clear_recording_modal');
    } catch (error) {
      console.error('Failed to cancel recording modal:', error);
    }
  };

  if (!modalInfo?.is_visible) return null;

  return (
    <Modal isOpen={true} onClose={handleCancel} title='録画'>
      <div className='p-3'>
        <Card className='mb-3'>
          <div className='flex items-center space-x-3 p-3'>
            <div className='flex-shrink-0'>
              <div className='w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center'>
                <Icon
                  name={modalInfo.icon || 'keyboard'}
                  className='w-4 h-4 text-blue-600'
                />
              </div>
            </div>
            <div className='flex-1'>
              <input
                type='text'
                value={editableName}
                onChange={e => setEditableName(e.target.value)}
                onBlur={e => {
                  handleNameChange(e.target.value);
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.currentTarget.blur();
                  }
                }}
                className='font-semibold text-white bg-transparent border-none outline-none focus:bg-gray-800/30 focus:px-2 focus:py-1 focus:rounded transition-all w-full text-lg'
                placeholder='アクション名を入力...'
              />
              <Text variant='small' className='text-gray-300'>
                ID: {modalInfo.action_id}
              </Text>
            </div>
          </div>
        </Card>

        {modalInfo.is_completed ? (
          // 録画完了状態
          <div className='text-center space-y-4'>
            <div className='p-3 bg-green-50 rounded-lg border border-green-200 text-center'>
              <Icon
                name='check'
                className='w-5 h-5 text-green-600 mx-auto mb-1'
              />
              <Heading level={3} className='text-green-800 mb-2'>
                録画完了！
              </Heading>
              <Text variant='small' className='text-green-700 mb-3'>
                「{editableName}」保存済み
              </Text>
              <div className='space-y-1'>
                <Text variant='small' className='text-green-600'>
                  録画されたキー: {modalInfo.recorded_keys.length}個
                </Text>
                <Text variant='small' className='text-green-600'>
                  タイプ:{' '}
                  {modalInfo.shortcut_type === 'Sequential'
                    ? 'シーケンシャルモード'
                    : '通常モード'}
                </Text>
              </div>
            </div>

            <Button
              variant='primary'
              size='lg'
              onClick={handleCancel}
              className='w-full'
            >
              <Icon name='check' className='w-4 h-4 mr-2' />
              完了
            </Button>
          </div>
        ) : !modalInfo.is_recording ? (
          <div className='text-center space-y-4'>
            <div className='p-3 bg-amber-50 rounded-lg border border-amber-200 text-center'>
              <Icon
                name='info'
                className='w-5 h-5 text-amber-600 mx-auto mb-1'
              />
              <Text variant='small' className='text-amber-800 mb-1'>
                準備完了
              </Text>
              <Text variant='caption' className='text-amber-700'>
                録画開始後、キー操作を行ってください
              </Text>
            </div>

            {/* ショートカットタイプ選択 */}
            <div className='p-3 bg-gray-800/30 rounded-lg border border-gray-700/50'>
              <Heading
                level={4}
                className='text-white text-sm mb-2 text-center'
              >
                ショートカットタイプ
              </Heading>
              <div className='grid grid-cols-2 gap-3'>
                <label className='flex flex-col items-center space-y-1 cursor-pointer p-2 rounded hover:bg-gray-700/20'>
                  <input
                    type='radio'
                    name='shortcutType'
                    value='normal'
                    checked={selectedShortcutType === 'normal'}
                    onChange={e =>
                      setSelectedShortcutType(
                        e.target.value as 'normal' | 'sequential'
                      )
                    }
                    className='w-3 h-3 text-blue-400'
                  />
                  <div className='text-center'>
                    <Text variant='small' className='font-medium text-white'>
                      通常
                    </Text>
                    <Text variant='caption' className='text-gray-400'>
                      Ctrl+C等
                    </Text>
                  </div>
                </label>
                <label className='flex flex-col items-center space-y-1 cursor-pointer p-2 rounded hover:bg-gray-700/20'>
                  <input
                    type='radio'
                    name='shortcutType'
                    value='sequential'
                    checked={selectedShortcutType === 'sequential'}
                    onChange={e =>
                      setSelectedShortcutType(
                        e.target.value as 'normal' | 'sequential'
                      )
                    }
                    className='w-3 h-3 text-blue-400'
                  />
                  <div className='text-center'>
                    <Text variant='small' className='font-medium text-white'>
                      連続
                    </Text>
                    <Text variant='caption' className='text-gray-400'>
                      Alt→H→A
                    </Text>
                  </div>
                </label>
              </div>
            </div>

            <div className='flex space-x-2'>
              <Button
                variant='primary'
                size='lg'
                onClick={handleStartRecording}
                disabled={isStarting}
                className='flex-1'
              >
                {isStarting ? (
                  <>
                    <Icon
                      name='loading'
                      className='w-4 h-4 mr-2 animate-spin'
                    />
                    開始中...
                  </>
                ) : (
                  <>
                    <Icon name='play' className='w-4 h-4 mr-2' />
                    録画開始
                  </>
                )}
              </Button>

              <Button
                variant='secondary'
                size='lg'
                onClick={handleCancel}
                disabled={isStarting}
                className='flex-1'
              >
                <Icon name='x' className='w-4 h-4 mr-2' />
                キャンセル
              </Button>
            </div>
          </div>
        ) : (
          <div className='text-center space-y-4'>
            <div className='p-3 bg-red-50 rounded-lg border border-red-200 text-center'>
              <div className='flex items-center justify-center mb-3'>
                <div className='w-4 h-4 bg-red-500 rounded-full animate-pulse mr-2'></div>
                <Icon name='record' className='w-5 h-5 text-red-600' />
              </div>
              <Heading level={3} className='text-red-800 mb-2'>
                録画中...
              </Heading>
              <Text variant='caption' className='text-red-700 mb-2'>
                キー操作してください
              </Text>
              <div className='space-y-1'>
                <Text variant='small' className='text-red-600'>
                  録画されたキー: {modalInfo.recorded_keys.length}個
                </Text>
                <Text variant='small' className='text-red-500'>
                  タイプ:{' '}
                  {modalInfo.shortcut_type === 'Sequential'
                    ? 'シーケンシャルモード'
                    : '通常モード'}
                </Text>
                {modalInfo.recorded_keys.length > 0 && (
                  <div className='space-y-1'>
                    <Text variant='small' className='text-red-500'>
                      最新:{' '}
                      {
                        modalInfo.recorded_keys[
                          modalInfo.recorded_keys.length - 1
                        ].key
                      }{' '}
                      (
                      {
                        modalInfo.recorded_keys[
                          modalInfo.recorded_keys.length - 1
                        ].event_type
                      }
                      )
                      {modalInfo.recorded_keys[
                        modalInfo.recorded_keys.length - 1
                      ].modifiers.alt && ' +Alt'}
                      {modalInfo.recorded_keys[
                        modalInfo.recorded_keys.length - 1
                      ].modifiers.ctrl && ' +Ctrl'}
                      {modalInfo.recorded_keys[
                        modalInfo.recorded_keys.length - 1
                      ].modifiers.shift && ' +Shift'}
                      {modalInfo.recorded_keys[
                        modalInfo.recorded_keys.length - 1
                      ].modifiers.meta && ' +Meta'}
                    </Text>
                    {modalInfo.shortcut_type === 'Sequential' && (
                      <Text variant='small' className='text-red-400'>
                        イベント詳細: press/release両方を記録中
                      </Text>
                    )}
                  </div>
                )}
              </div>
            </div>

            <Button
              variant='danger'
              size='lg'
              onClick={handleStopRecording}
              disabled={isStopping}
              className='w-full'
            >
              {isStopping ? (
                <>
                  <Icon name='loading' className='w-4 h-4 mr-2 animate-spin' />
                  停止中...
                </>
              ) : (
                <>
                  <Icon name='stop' className='w-4 h-4 mr-2' />
                  録画停止
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
};
