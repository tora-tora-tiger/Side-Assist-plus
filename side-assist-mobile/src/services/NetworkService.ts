export class NetworkService {
  private static readonly TIMEOUT = 2500;

  static async getNetworkSubnet(): Promise<string> {
    // Mock network subnet for React Native
    // In production, you'd use react-native-network-info or similar
    return '192.168.1';
  }

  static async testConnection(ip: string): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT);

      const response = await fetch(`http://${ip}:8080/health`, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        return data.status === 'ok';
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  static async sendText(ip: string, text: string): Promise<boolean> {
    try {
      const response = await fetch(`http://${ip}:8080/input`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to send text:', error);
      return false;
    }
  }

  static async scanForServer(): Promise<string | null> {
    const subnet = await this.getNetworkSubnet();
    console.log('🔍 Scanning subnet:', subnet);

    const promises = [];
    for (let i = 1; i <= 254; i++) {
      const testIP = `${subnet}.${i}`;
      promises.push(this.testConnection(testIP));
    }

    const results = await Promise.allSettled(promises);
    const successfulIPs = results
      .map((result, index) => ({
        ip: `${subnet}.${index + 1}`,
        success: result.status === 'fulfilled' && result.value,
      }))
      .filter(result => result.success)
      .map(result => result.ip);

    return successfulIPs.length > 0 ? successfulIPs[0] : null;
  }
}
