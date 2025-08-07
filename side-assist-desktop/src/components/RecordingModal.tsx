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
  start_time?: number;
  recorded_keys: Array<{
    key: string;
    event_type: string;
    timestamp: number;
  }>;
}

export const RecordingModal: React.FC = () => {
  const [modalInfo, setModalInfo] = useState<RecordingModalInfo | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);

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
      await invoke('start_actual_recording');
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

        {!modalInfo.is_recording ? (
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
              <Text variant='small' className='text-red-600'>
                録画されたキー: {modalInfo.recorded_keys.length}個
              </Text>
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
