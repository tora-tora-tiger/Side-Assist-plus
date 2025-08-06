import { Alert } from 'react-native';

class AlertManager {
  private static isAlertVisible = false;

  static showAlert(title: string, message: string, buttons?: any[]): void {
    console.log('📱 [AlertManager] Showing alert:', title);

    // 既にアラートが表示中の場合は無視
    if (this.isAlertVisible) {
      console.log('📱 [AlertManager] Alert already visible, ignoring');
      return;
    }

    this.isAlertVisible = true;

    const processedButtons = buttons?.map(button => ({
      ...button,
      onPress: () => {
        if (button.onPress) {
          button.onPress();
        }
        this.onAlertDismissed();
      },
    })) || [
      {
        text: 'OK',
        onPress: () => this.onAlertDismissed(),
      },
    ];

    Alert.alert(title, message, processedButtons);
  }

  private static onAlertDismissed(): void {
    console.log('📱 [AlertManager] Alert dismissed');
    this.isAlertVisible = false;
  }

  static clearQueue(): void {
    console.log('📱 [AlertManager] Clearing state');
    this.isAlertVisible = false;
  }

  static isShowing(): boolean {
    return this.isAlertVisible;
  }
}

export default AlertManager;