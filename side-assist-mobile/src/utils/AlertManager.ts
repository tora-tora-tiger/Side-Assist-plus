import { Alert } from 'react-native';

class AlertManager {
  private static isAlertVisible = false;
  private static alertQueue: Array<{
    title: string;
    message: string;
    buttons?: any[];
  }> = [];
  private static currentAlert: { title: string; message: string } | null = null;
  private static recentAlerts: Map<string, number> = new Map(); // title -> timestamp
  private static DEBOUNCE_TIME = 1000; // 1秒以内の同じアラートは無視

  static showAlert(title: string, message: string, buttons?: any[]): void {
    console.log('📱 [AlertManager] Request to show alert:', title);

    const now = Date.now();
    const alertKey = `${title}:${message}`;

    // デバウンス: 短時間内の同じアラートは無視
    const lastTime = this.recentAlerts.get(alertKey);
    if (lastTime && now - lastTime < this.DEBOUNCE_TIME) {
      console.log(
        '📱 [AlertManager] Ignoring alert due to debounce:',
        title,
        'last shown:',
        now - lastTime,
        'ms ago',
      );
      return;
    }

    // 現在表示中のアラートと同じ場合は無視
    if (
      this.currentAlert &&
      this.currentAlert.title === title &&
      this.currentAlert.message === message
    ) {
      console.log(
        '📱 [AlertManager] Ignoring duplicate alert (currently showing):',
        title,
      );
      return;
    }

    // キューに同じアラートが既にある場合は追加しない
    const isDuplicate = this.alertQueue.some(
      alert => alert.title === title && alert.message === message,
    );

    if (isDuplicate) {
      console.log(
        '📱 [AlertManager] Ignoring duplicate alert (in queue):',
        title,
      );
      return;
    }

    // アラートが表示中の場合、現在のアラートと新しいアラートが同じカテゴリか確認
    if (this.isAlertVisible && this.currentAlert) {
      // 同じエラータイプ（接続失敗、認証失敗など）の場合は置き換える
      const currentIsError = this.isErrorAlert(this.currentAlert.title);
      const newIsError = this.isErrorAlert(title);

      if (currentIsError && newIsError) {
        console.log(
          '📱 [AlertManager] Replacing current error alert with new one',
        );
        // 現在のアラートをクリアして新しいアラートを表示
        this.clearQueue();
        this.alertQueue.push({ title, message, buttons });
        return;
      }
    }

    console.log('📱 [AlertManager] Adding to queue:', title);
    // アラートをキューに追加
    this.alertQueue.push({ title, message, buttons });

    // タイムスタンプを記録
    this.recentAlerts.set(alertKey, now);

    // 現在アラートが表示されていない場合のみ処理
    if (!this.isAlertVisible) {
      this.processQueue();
    }
  }

  private static isErrorAlert(title: string): boolean {
    const errorTitles = [
      '接続失敗',
      '認証失敗',
      'エラー',
      '送信失敗',
      'QRコードエラー',
    ];
    return errorTitles.includes(title);
  }

  private static processQueue(): void {
    if (this.alertQueue.length === 0) {
      this.currentAlert = null;
      return;
    }

    const alertItem = this.alertQueue.shift();
    if (!alertItem) {
      this.currentAlert = null;
      return;
    }

    this.isAlertVisible = true;
    this.currentAlert = { title: alertItem.title, message: alertItem.message };

    // ボタンにonPressを追加してアラート状態を管理
    const processedButtons = alertItem.buttons?.map(button => ({
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

    Alert.alert(alertItem.title, alertItem.message, processedButtons);
  }

  private static onAlertDismissed(): void {
    this.isAlertVisible = false;
    this.currentAlert = null;

    // 次のアラートがあれば処理
    setTimeout(() => {
      this.processQueue();
    }, 100);
  }

  static clearQueue(): void {
    this.alertQueue = [];
    this.isAlertVisible = false;
    this.currentAlert = null;
    // 古いタイムスタンプをクリア
    this.recentAlerts.clear();
  }

  static isShowing(): boolean {
    return this.isAlertVisible;
  }

  static getQueueStatus(): {
    queueLength: number;
    currentAlert: string | null;
    isVisible: boolean;
  } {
    return {
      queueLength: this.alertQueue.length,
      currentAlert: this.currentAlert
        ? `${this.currentAlert.title}: ${this.currentAlert.message}`
        : null,
      isVisible: this.isAlertVisible,
    };
  }

  static logStatus(): void {
    const status = this.getQueueStatus();
    console.log('📱 [AlertManager] Current status:', status);
  }
}

export default AlertManager;
