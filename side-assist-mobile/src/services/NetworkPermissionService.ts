import { Platform } from 'react-native';

export class NetworkPermissionService {
  /**
   * ネットワーク権限が許可されているかチェック
   * iOS: 最小限のリクエストで権限チェック
   * Android: 常にtrue（権限不要）
   */
  static async checkNetworkPermission(): Promise<boolean> {
    if (Platform.OS !== 'ios') {
      return true; // Android は権限不要
    }

    try {
      // 単一の軽量なリクエストで権限チェック
      // ルーターへの軽いHEADリクエスト（通常は192.168.1.1）
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);

      await fetch('http://192.168.1.1:80', {
        method: 'HEAD',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log('Network permission check passed');
      return true;
    } catch (error: any) {
      console.log('Network permission check - no access to router, checking common gateway');

      // ルーターに失敗した場合、別の一般的なゲートウェイをチェック
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1500);

        await fetch('http://192.168.0.1:80', {
          method: 'HEAD',
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        console.log('Network permission check passed (alternative gateway)');
        return true;
      } catch (secondError: any) {
        // 両方失敗した場合は権限なしと判定
        console.log('Network permission denied - no access to local network');
        return false;
      }
    }
  }

  /**
   * ネットワークスキャンを実行して、サーバーが発見できるかテスト
   * 権限チェック後にのみ実行される軽量なテスト
   */
  static async testServerDiscovery(): Promise<boolean> {
    try {
      // 権限が確認済みの場合のみ、最小限のサーバー発見テストを実行
      const subnets = ['192.168.1', '192.168.0']; // 最も一般的な2つのサブネットのみ

      for (const subnet of subnets) {
        for (let i = 2; i <= 5; i++) {
          // 一般的なサーバーIPの範囲のみテスト（1はルーター、6以降は少ない）
          try {
            const testIP = `${subnet}.${i}`;
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 800);

            await fetch(`http://${testIP}:8080/health`, {
              method: 'GET',
              signal: controller.signal,
            });

            clearTimeout(timeoutId);
            return true; // サーバー発見成功
          } catch {
            // 個別のIPテスト失敗は継続
          }
        }
      }

      return false; // サーバー発見失敗
    } catch (error) {
      console.error('Server discovery test failed:', error);
      return false;
    }
  }

  /**
   * 権限チェックと説明表示の判定
   * サーバー発見に失敗し、かつ権限チェックも失敗した場合にガイドを表示
   */
  static async shouldShowPermissionGuide(): Promise<boolean> {
    if (Platform.OS !== 'ios') {
      return false; // iOS以外では表示しない
    }

    const hasPermission = await this.checkNetworkPermission();
    const canDiscoverServer = await this.testServerDiscovery();

    // 権限がなく、サーバーも発見できない場合にガイド表示
    return !hasPermission && !canDiscoverServer;
  }
}
