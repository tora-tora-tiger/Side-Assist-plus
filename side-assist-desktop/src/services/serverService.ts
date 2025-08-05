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

  async stop(): Promise<void> {
    await invoke("stop_server");
  },

  async setPort(port: number): Promise<void> {
    await invoke("set_server_port", { port });
  },

  async changePort(newPort: number): Promise<string> {
    // サーバーを停止
    await this.stop();
    
    // 新しいポートを設定
    await this.setPort(newPort);
    
    // サーバーを再開
    return await this.start();
  }
};