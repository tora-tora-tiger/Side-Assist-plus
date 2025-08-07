export class NetworkService {
  private static readonly TIMEOUT = 2500;
  private static clientId: string = "mobile-app-" + Date.now(); // 一度だけ生成
  private static testConnectionCallCount = 0; // デバッグ用カウンター

  static async testConnection(ip: string, port: string): Promise<boolean> {
    this.testConnectionCallCount++;
    console.log(
      `🔗 [NetworkService] Testing connection to ${ip}:${port} - Call #${this.testConnectionCallCount}`,
    );

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log(
          `⏰ [NetworkService] Connection timeout after ${this.TIMEOUT}ms`,
        );
        controller.abort();
      }, this.TIMEOUT);

      const url = `http://${ip}:${port}/health`;
      console.log(`📡 [NetworkService] Fetching: ${url}`);

      const response = await fetch(url, {
        method: "GET",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          "x-client-id": this.clientId,
        },
      });

      clearTimeout(timeoutId);

      console.log(
        `📊 [NetworkService] Response status: ${response.status} ${response.statusText}`,
      );

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ [NetworkService] Health check response:`, data);
        const isHealthy = data.status === "ok";
        console.log(
          `🏥 [NetworkService] Server health: ${
            isHealthy ? "HEALTHY" : "UNHEALTHY"
          }`,
        );
        return isHealthy;
      } else {
        console.log(
          `❌ [NetworkService] HTTP error: ${response.status} ${response.statusText}`,
        );
        return false;
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.name === "AbortError") {
        console.log(`⏱️ [NetworkService] Connection aborted (timeout)`);
      } else {
        console.log(`💥 [NetworkService] Connection error:`, error);
      }
      return false;
    }
  }

  static async sendText(
    ip: string,
    port: string,
    text: string,
    password?: string,
  ): Promise<boolean> {
    return this.sendAction(ip, port, { type: "text", text }, password);
  }

  // Unified action endpoint
  static async sendAction(
    ip: string,
    port: string,
    action: { type: string; [key: string]: unknown },
    password?: string,
  ): Promise<boolean> {
    try {
      const response = await fetch(`http://${ip}:${port}/input`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action, password }),
      });

      return response.ok;
    } catch (error) {
      console.error("Failed to send action:", error);
      return false;
    }
  }

  static async authenticateWithPassword(
    ip: string,
    port: string,
    password: string,
  ): Promise<boolean> {
    console.log(`🔐 [NetworkService] Authenticating with ${ip}:${port}`);

    try {
      const url = `http://${ip}:${port}/auth`;
      console.log(`📡 [NetworkService] Auth request to: ${url}`);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      console.log(
        `📊 [NetworkService] Auth response: ${response.status} ${response.statusText}`,
      );

      if (response.ok) {
        console.log(`✅ [NetworkService] Authentication successful`);
        return true;
      } else {
        console.log(
          `❌ [NetworkService] Authentication failed: ${response.status}`,
        );
        return false;
      }
    } catch (error) {
      console.error("💥 [NetworkService] Authentication error:", error);
      return false;
    }
  }

  // Custom action methods
  static async executeCustomAction(
    ip: string,
    port: string,
    actionId: string,
    password?: string,
  ): Promise<boolean> {
    console.log(`🎭 [NetworkService] Executing custom action: ${actionId}`);
    return this.sendAction(
      ip,
      port,
      { type: "custom", action_id: actionId },
      password,
    );
  }

  static async prepareRecording(
    ip: string,
    port: string,
    actionId: string,
    name: string,
    icon?: string,
    password?: string,
  ): Promise<boolean> {
    console.log(
      `🎥 [NetworkService] Preparing recording for action: ${name} (${actionId})`,
    );
    return this.sendAction(
      ip,
      port,
      {
        type: "prepare_recording",
        action_id: actionId,
        name,
        icon,
      },
      password,
    );
  }

  static async getRecordingStatus(
    ip: string,
    port: string,
  ): Promise<{ isRecording: boolean; actionId?: string }> {
    try {
      const url = `http://${ip}:${port}/recording/status`;
      // console.log(`📡 [NetworkService] Getting recording status from: ${url}`);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        // console.log(`📊 [NetworkService] Recording status response:`, data);
        return data;
      } else {
        console.error(
          `❌ [NetworkService] Recording status failed: ${response.status}`,
        );
        return null;
      }
    } catch (error) {
      console.error("Failed to get recording status:", error);
      return null;
    }
  }

  static async acknowledgeRecording(
    ip: string,
    port: string,
  ): Promise<boolean> {
    try {
      const response = await fetch(
        `http://${ip}:${port}/recording/acknowledge`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      return response.ok;
    } catch (error) {
      console.error("Failed to acknowledge recording:", error);
      return false;
    }
  }

  static async getCustomActions(
    ip: string,
    port: string,
  ): Promise<CustomAction[]> {
    try {
      const url = `http://${ip}:${port}/custom_actions`;
      console.log(`📡 [NetworkService] Fetching custom actions from: ${url}`);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log(
        `📊 [NetworkService] Custom actions response status: ${response.status} ${response.statusText}`,
      );

      if (response.ok) {
        const actions = await response.json();
        console.log(
          `📋 [NetworkService] Retrieved ${actions.length} custom actions from server`,
        );
        console.log(
          `📦 [NetworkService] Actions details:`,
          actions.map(
            (a: { id: string; name: string; key_sequence?: unknown[] }) => ({
              id: a.id,
              name: a.name,
              keys: a.key_sequence?.length || 0,
            }),
          ),
        );
        return actions;
      } else {
        const errorText = await response.text();
        console.error(
          `❌ [NetworkService] Failed to get custom actions: ${response.status} - ${errorText}`,
        );
        return [];
      }
    } catch (error) {
      console.error("❌ [NetworkService] Failed to get custom actions:", error);
      return [];
    }
  }
}

// カスタムアクション型定義
export interface CustomAction {
  id: string;
  name: string;
  icon?: string;
  key_sequence: RecordedKey[];
  created_at: number;
}

export interface RecordedKey {
  key: string;
  event_type: string;
  timestamp: number;
}
