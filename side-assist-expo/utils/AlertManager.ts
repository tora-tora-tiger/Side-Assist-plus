interface Button {
  text: string;
  onPress?: () => void;
  style?: "default" | "cancel" | "destructive";
}

class AlertManager {
  private static listeners: Array<(alert: AlertData | null) => void> = [];
  private static currentAlert: AlertData | null = null;

  static subscribe(listener: (alert: AlertData | null) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  static showAlert(title: string, message: string, buttons?: Button[]): void {
    const alertData: AlertData = {
      title,
      message,
      buttons: buttons || [{ text: "OK" }],
    };

    this.currentAlert = alertData;
    this.notifyListeners();
  }

  static hideAlert(): void {
    this.currentAlert = null;
    this.notifyListeners();
  }

  private static notifyListeners(): void {
    this.listeners.forEach(listener => {
      listener(this.currentAlert);
    });
  }

  static getCurrentAlert(): AlertData | null {
    return this.currentAlert;
  }

  static clearQueue(): void {
    this.currentAlert = null;
    this.notifyListeners();
  }

  static isShowing(): boolean {
    return this.currentAlert !== null;
  }
}

interface AlertData {
  title: string;
  message: string;
  buttons: Button[];
}

export default AlertManager;
