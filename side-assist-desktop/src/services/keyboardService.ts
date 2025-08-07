import { invoke } from '@tauri-apps/api/core';

export const keyboardService = {
  async simulateTyping(text: string): Promise<string> {
    return await invoke<string>('simulate_typing', { text });
  },
};
