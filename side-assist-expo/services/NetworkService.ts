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
        // Request was aborted
      } else {
        // Other error types
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

  static async sendGesture(
    ip: string,
    port: string,
    fingers: number,
    direction: string,
    action: string,
    actionData?: string,
    password?: string,
  ): Promise<boolean> {
    console.log(
      `🤏 [NetworkService] Sending gesture: ${fingers} fingers ${direction} -> ${action}`,
    );
    return this.sendAction(
      ip,
      port,
      {
        type: "gesture",
        fingers,
        direction,
        action,
        action_data: actionData,
      },
      password,
    );
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
    try {
      const url = `http://${ip}:${port}/auth`;

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
    shortcutType?: "normal" | "sequential", // 新規追加
  ): Promise<boolean> {
    console.log(
      `🎥 [NetworkService] Preparing recording for action: ${name} (${actionId}) - Type: ${shortcutType || "normal"}`,
    );
    return this.sendAction(
      ip,
      port,
      {
        type: "prepare_recording",
        action_id: actionId,
        name,
        icon,
        shortcut_type: shortcutType || "normal", // 新規追加
      },
      password,
    );
  }

  static async getRecordingStatus(
    ip: string,
    port: string,
  ): Promise<{
    isRecording: boolean;
    actionId?: string;
    status?: string;
    message?: string;
  }> {
    try {
      const url = `http://${ip}:${port}/recording/status`;
      //

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        //
        return data;
      } else {
        console.error(
          `❌ [NetworkService] Recording status failed: ${response.status}`,
        );
        return { isRecording: false };
      }
    } catch (error) {
      console.error("Failed to get recording status:", error);
      return { isRecording: false };
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

  // Settings methods
  static async getSettings(
    ip: string,
    port: string,
  ): Promise<AppSettings | null> {
    try {
      const url = `http://${ip}:${port}/settings`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log(
        `📊 [NetworkService] Settings response status: ${response.status} ${response.statusText}`,
      );

      if (response.ok) {
        const settings = await response.json();

        return settings;
      } else {
        const errorText = await response.text();
        console.error(
          `❌ [NetworkService] Failed to get settings: ${response.status} - ${errorText}`,
        );
        return null;
      }
    } catch (error) {
      console.error("❌ [NetworkService] Failed to get settings:", error);
      return null;
    }
  }

  static async updateSettings(
    ip: string,
    port: string,
    settings: Partial<AppSettings>,
    password?: string,
  ): Promise<boolean> {
    try {
      const url = `http://${ip}:${port}/settings`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ settings, password }),
      });

      console.log(
        `📊 [NetworkService] Update settings response: ${response.status} ${response.statusText}`,
      );

      if (response.ok) {
        return true;
      } else {
        const errorText = await response.text();
        console.error(
          `❌ [NetworkService] Failed to update settings: ${response.status} - ${errorText}`,
        );
        return false;
      }
    } catch (error) {
      console.error("❌ [NetworkService] Failed to update settings:", error);
      return false;
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

// アプリ設定型定義
export interface AppSettings {
  hapticsEnabled: boolean;
}
