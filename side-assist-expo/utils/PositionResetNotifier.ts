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
    console.log(
      "🔔 [PositionResetNotifier] Listener added, total:",
      this.listeners.length,
    );
  }

  /**
   * リスナーを削除
   */
  removeListener(callback: () => Promise<void>) {
    const index = this.listeners.indexOf(callback);
    if (index > -1) {
      this.listeners.splice(index, 1);
      console.log(
        "🔔 [PositionResetNotifier] Listener removed, total:",
        this.listeners.length,
      );
    }
  }

  /**
   * 全てのリスナーに位置リセット通知を送信
   */
  async notifyReset() {
    console.log(
      "📢 [PositionResetNotifier] Notifying position reset to",
      this.listeners.length,
      "listeners",
    );

    const promises = this.listeners.map(async (callback, index) => {
      try {
        await callback();
        console.log(
          `✅ [PositionResetNotifier] Listener ${index + 1} completed successfully`,
        );
      } catch (error) {
        console.error(
          `❌ [PositionResetNotifier] Listener ${index + 1} failed:`,
          error,
        );
      }
    });

    await Promise.all(promises);
    console.log("📢 [PositionResetNotifier] All listeners notified");
  }
}

// グローバルシングルトンインスタンス
export const positionResetNotifier = new PositionResetNotifier();
