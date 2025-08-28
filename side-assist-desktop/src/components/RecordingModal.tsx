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
        shortcut_type:
          selectedShortcutType === 'sequential' ? 'Sequential' : 'Normal',
      });
      console.log('🔴 Recording started successfully');
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
      const result = await invoke<string>('stop_actual_recording');
      console.log('⏹️ Recording stopped:', result);
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
      console.log('🗑️ Recording modal cancelled');
    } catch (error) {
      console.error('Failed to cancel recording modal:', error);
    }
  };

  if (!modalInfo?.is_visible) return null;

  return (
    <Modal isOpen={true} onClose={handleCancel} title='カスタムアクション録画'>
      <div className='p-6'>
        <Card className='mb-6'>
          <div className='flex items-center space-x-4 p-4'>
            <div className='flex-shrink-0'>
              <div className='w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center'>
                <Icon
                  name={modalInfo.icon || 'keyboard'}
                  className='w-6 h-6 text-blue-600'
                />
              </div>
            </div>
            <div className='flex-1'>
              <Heading level={3} className='font-semibold text-gray-900'>
                {modalInfo.name}
              </Heading>
              <Text variant='small' className='text-gray-600'>
                ID: {modalInfo.action_id}
              </Text>
            </div>
          </div>
        </Card>

        {modalInfo.is_completed ? (
          // 録画完了状態
          <div className='text-center space-y-4'>
            <div className='p-6 bg-green-50 rounded-lg border border-green-200'>
              <Icon
                name='check'
                className='w-8 h-8 text-green-600 mx-auto mb-2'
              />
              <Heading level={3} className='text-green-800 mb-2'>
                録画完了！
              </Heading>
              <Text variant='small' className='text-green-700 mb-3'>
                カスタムアクション「{modalInfo.name}」が正常に保存されました
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
            <div className='p-6 bg-amber-50 rounded-lg border border-amber-200'>
              <Icon
                name='info'
                className='w-8 h-8 text-amber-600 mx-auto mb-2'
              />
              <Text variant='body' className='text-amber-800 mb-2'>
                キーボード操作を録画する準備ができました
              </Text>
              <Text variant='small' className='text-amber-700'>
                「録画開始」をクリックした後、録画したいキーボード操作を行ってください
              </Text>
            </div>

            {/* ショートカットタイプ選択 */}
            <div className='p-4 bg-gray-50 rounded-lg border'>
              <Heading level={4} className='text-gray-900 mb-3 text-left'>
                ショートカットタイプ
              </Heading>
              <div className='space-y-3'>
                <label className='flex items-center space-x-3 cursor-pointer'>
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
                    className='w-4 h-4 text-blue-600'
                  />
                  <div>
                    <Text variant='body' className='font-medium text-gray-900'>
                      通常モード
                    </Text>
                    <Text variant='small' className='text-gray-600'>
                      通常のキーシーケンスを記録（例：Ctrl+C, Ctrl+V）
                    </Text>
                  </div>
                </label>
                <label className='flex items-center space-x-3 cursor-pointer'>
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
                    className='w-4 h-4 text-blue-600'
                  />
                  <div>
                    <Text variant='body' className='font-medium text-gray-900'>
                      シーケンシャルモード
                    </Text>
                    <Text variant='small' className='text-gray-600'>
                      修飾キーを保持したシーケンス（例：Alt → H → B → A）
                    </Text>
                  </div>
                </label>
              </div>
            </div>

            <div className='flex space-x-3'>
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
            <div className='p-6 bg-red-50 rounded-lg border border-red-200'>
              <div className='flex items-center justify-center mb-3'>
                <div className='w-4 h-4 bg-red-500 rounded-full animate-pulse mr-2'></div>
                <Icon name='record' className='w-8 h-8 text-red-600' />
              </div>
              <Heading level={3} className='text-red-800 mb-2'>
                録画中...
              </Heading>
              <Text variant='small' className='text-red-700 mb-3'>
                キーボード操作を行ってください
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
