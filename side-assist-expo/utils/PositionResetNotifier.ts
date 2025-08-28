/**
 * 位置リセットのグローバル通知システム
 * 設定画面からのリセットをFreeformActionGridに通知する
 */

class PositionResetNotifier {
  private listeners: (() => Promise<void>)[] = [];

  /**
   * リスナーを登録
   */
  addListener(callback: () => Promise<void>) {
    this.listeners.push(callback);
  }

  /**
   * リスナーを削除
   */
  removeListener(callback: () => Promise<void>) {
    const index = this.listeners.indexOf(callback);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  /**
   * 全てのリスナーに位置リセット通知を送信
   */
  async notifyReset() {
    const promises = this.listeners.map(async (callback, index) => {
      try {
        await callback();
      } catch (error) {
        console.error(
          `❌ [PositionResetNotifier] Listener ${index + 1} failed:`,
          error,
        );
      }
    });

    await Promise.all(promises);
  }
}

// グローバルシングルトンインスタンス
export const positionResetNotifier = new PositionResetNotifier();
