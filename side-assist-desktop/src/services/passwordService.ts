import { invoke } from '@tauri-apps/api/core';

export const passwordService = {
  async generate(): Promise<string> {
    return await invoke<string>('generate_one_time_password');
  },

  async getCurrent(): Promise<string | null> {
    return await invoke<string | null>('get_current_password');
  },

  async generateQR(): Promise<string> {
    return await invoke<string>('generate_qr_code');
  },
};
