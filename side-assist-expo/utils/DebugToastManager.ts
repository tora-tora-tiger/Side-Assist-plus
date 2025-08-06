class DebugToastManager {
  private static listeners: Array<(message: string) => void> = [];

  static subscribe(listener: (message: string) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  static show(message: string) {
    console.log('🐛 [DebugToast]', message);
    this.listeners.forEach(listener => listener(message));
  }

  static showTouchEvent(componentName: string, eventType: string = 'Press') {
    const timestamp = new Date().toLocaleTimeString();
    this.show(`${componentName} ${eventType} detected at ${timestamp}`);
  }
}

export default DebugToastManager;