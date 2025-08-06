export class NetworkService {
  private static readonly TIMEOUT = 2500;
  private static clientId: string = 'mobile-app-' + Date.now(); // 一度だけ生成
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
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'x-client-id': this.clientId,
        },
      });

      clearTimeout(timeoutId);

      console.log(
        `📊 [NetworkService] Response status: ${response.status} ${response.statusText}`,
      );

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ [NetworkService] Health check response:`, data);
        const isHealthy = data.status === 'ok';
        console.log(
          `🏥 [NetworkService] Server health: ${
            isHealthy ? 'HEALTHY' : 'UNHEALTHY'
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
      if (error instanceof Error && error.name === 'AbortError') {
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
    try {
      const response = await fetch(`http://${ip}:${port}/input`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, password }),
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to send text:', error);
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
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
      console.error('💥 [NetworkService] Authentication error:', error);
      return false;
    }
  }

  static async sendCopyCommand(
    ip: string,
    port: string,
    password?: string,
  ): Promise<boolean> {
    console.log(`📋 [NetworkService] Sending copy command to ${ip}:${port}`);

    try {
      const response = await fetch(`http://${ip}:${port}/copy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        console.log(`✅ [NetworkService] Copy command sent successfully`);
        return true;
      } else {
        console.log(
          `❌ [NetworkService] Copy command failed: ${response.status}`,
        );
        return false;
      }
    } catch (error) {
      console.error('💥 [NetworkService] Copy command error:', error);
      return false;
    }
  }

  static async sendPasteCommand(
    ip: string,
    port: string,
    password?: string,
  ): Promise<boolean> {
    console.log(`📋 [NetworkService] Sending paste command to ${ip}:${port}`);

    try {
      const response = await fetch(`http://${ip}:${port}/paste`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        console.log(`✅ [NetworkService] Paste command sent successfully`);
        return true;
      } else {
        console.log(
          `❌ [NetworkService] Paste command failed: ${response.status}`,
        );
        return false;
      }
    } catch (error) {
      console.error('💥 [NetworkService] Paste command error:', error);
      return false;
    }
  }
}