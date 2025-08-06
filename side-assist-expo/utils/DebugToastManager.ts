import { isDebugModeEnabled } from './DeviceConfig';

class DebugToastManager {
  private static listeners: Array<(message: string) => void> = [];

  static subscribe(listener: (message: string) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  static show(message: string) {
    // デバッグモードが無効の場合は何もしない
    if (!isDebugModeEnabled() && !__DEV__) {
      return;
    }
    
    console.log('🐛 [DebugToast]', message);
    this.listeners.forEach(listener => listener(message));
  }

  static showTouchEvent(componentName: string, eventType: string = 'Press') {
    const timestamp = new Date().toLocaleTimeString();
    this.show(`${componentName} ${eventType} detected at ${timestamp}`);
  }
}

export default DebugToastManager;