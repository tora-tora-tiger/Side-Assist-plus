import { Platform } from 'react-native';

export class NetworkPermissionService {
  /**
   * ネットワーク権限が許可されているかチェック
   * iOS: 実際のネットワークスキャンを試行して判定
   * Android: 常にtrue（権限不要）
   */
  static async checkNetworkPermission(): Promise<boolean> {
    if (Platform.OS !== 'ios') {
      return true; // Android は権限不要
    }

    try {
      // ローカルネットワークスキャンを試行
      // 192.168.1.1 へのテスト接続で権限チェック
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const response = await fetch('http://192.168.1.1:80', {
        method: 'HEAD',
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error('Network request failed');
      }

      // スキャン成功なら権限あり
      console.log('Network permission check passed');

      clearTimeout(timeoutId);

      // 接続成功/失敗に関わらず、エラーが出なければ権限あり
      return true;
    } catch (error: any) {
      console.log('Network permission check error:', error);

      // iOS でローカルネットワーク権限がない場合の特定エラー
      if (
        error.message?.includes('Network request failed') ||
        error.name === 'AbortError'
      ) {
        // 権限がない可能性が高い
        return false;
      }

      // その他のエラーは権限ありと判定
      return true;
    }
  }

  /**
   * ネットワークスキャンを実行して、サーバーが発見できるかテスト
   */
  static async testServerDiscovery(): Promise<boolean> {
    try {
      // 一般的なローカルIPレンジをテスト
      const subnets = ['192.168.1', '192.168.0', '10.0.0', '172.16.0'];

      for (const subnet of subnets) {
        for (let i = 1; i <= 10; i++) {
          // 最初の10個のIPのみテスト
          try {
            const testIP = `${subnet}.${i}`;
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 1000);

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
