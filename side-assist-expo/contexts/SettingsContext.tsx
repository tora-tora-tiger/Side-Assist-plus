import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { NetworkService, AppSettings } from "../services/NetworkService";

interface SettingsContextType {
  settings: AppSettings | null;
  isLoading: boolean;
  updateSetting: <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K],
  ) => Promise<boolean>;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined,
);

interface SettingsProviderProps {
  children: ReactNode;
  ip: string | null;
  port: string;
  password?: string;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({
  children,
  ip,
  port,
  password,
}) => {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 設定を取得する
  const loadSettings = async () => {
    if (!ip) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const serverSettings = await NetworkService.getSettings(ip, port);

      if (serverSettings) {
        setSettings(serverSettings);
      } else {
        const defaultSettings: AppSettings = {
          hapticsEnabled: true,
        };
        setSettings(defaultSettings);
      }
    } catch (error) {
      console.error("❌ [SettingsContext] Error loading settings:", error);
      const defaultSettings: AppSettings = {
        hapticsEnabled: true,
      };
      setSettings(defaultSettings);
    } finally {
      setIsLoading(false);
    }
  };

  // 設定を更新する
  const updateSetting = async <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K],
  ): Promise<boolean> => {
    if (!ip || !settings) {
      console.error(
        "❌ [SettingsContext] Cannot update setting - no IP or settings",
      );
      return false;
    }

    try {
      const updatedSettings = { ...settings, [key]: value };
      const success = await NetworkService.updateSettings(
        ip,
        port,
        { [key]: value },
        password,
      );

      if (success) {
        setSettings(updatedSettings);

        return true;
      } else {
        console.error(
          `❌ [SettingsContext] Failed to update setting on server`,
        );
        return false;
      }
    } catch (error) {
      console.error(`❌ [SettingsContext] Error updating setting:`, error);
      return false;
    }
  };

  // 設定を再取得する
  const refreshSettings = async () => {
    await loadSettings();
  };

  // 初期化時と接続情報が変わった時に設定を読み込む
  useEffect(() => {
    loadSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ip, port]);

  // 設定状態変更をログ出力
  useEffect(() => {}, [settings]);

  const value: SettingsContextType = {
    settings,
    isLoading,
    updateSetting,
    refreshSettings,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

// カスタムフック
export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
