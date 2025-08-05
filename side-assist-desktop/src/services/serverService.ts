import { invoke } from "@tauri-apps/api/core";

export interface ServerStatusType {
  running: boolean;
  connected_clients: number;
  port: number;
}

export const serverService = {
  async getStatus(): Promise<ServerStatusType> {
    return await invoke<ServerStatusType>("get_server_status");
  },

  async start(): Promise<string> {
    return await invoke<string>("start_server");
  },

  async stop(): Promise<string> {
    return await invoke<string>("stop_server");
  },

  async setPort(port: number): Promise<string> {
    return await invoke<string>("set_port", { port });
  },

  async changePort(newPort: number): Promise<string> {
    try {
      // サーバーを停止
      await this.stop();
      
      // 新しいポートを設定
      await this.setPort(newPort);
      
      // サーバーを再開（リトライ付き）
      let retries = 3;
      let lastError: unknown;
      
      for (let i = 0; i < retries; i++) {
        try {
          return await this.start();
        } catch (error) {
          lastError = error;
          console.log(`Server start attempt ${i + 1} failed, retrying...`);
          
          if (i < retries - 1) {
            // 少し待機してからリトライ
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }
      
      throw lastError;
    } catch (error) {
      throw new Error(`ポート変更に失敗しました: ${error}`);
    }
  }
};