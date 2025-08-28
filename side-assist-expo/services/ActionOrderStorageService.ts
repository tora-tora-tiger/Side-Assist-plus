import AsyncStorage from "@react-native-async-storage/async-storage";
import { ActionType } from "../constants/actions";

const ACTION_ORDER_KEY = "@side_assist_action_order";

export interface StoredActionOrder {
  actionIds: string[];
  lastUpdated: number;
}

export class ActionOrderStorageService {
  /**
   * アクションの順序を保存
   */
  static async saveActionOrder(actions: ActionType[]): Promise<void> {
    try {
      const actionIds = actions.map(action => action.id);
      const storageData: StoredActionOrder = {
        actionIds,
        lastUpdated: Date.now(),
      };

      await AsyncStorage.setItem(ACTION_ORDER_KEY, JSON.stringify(storageData));
    } catch (error) {
      console.error(
        "❌ [ActionOrderStorage] Failed to save action order:",
        error,
      );
      throw error;
    }
  }

  /**
   * 保存されたアクションの順序を読み込み
   */
  static async loadActionOrder(): Promise<StoredActionOrder | null> {
    try {
      const storedData = await AsyncStorage.getItem(ACTION_ORDER_KEY);
      if (!storedData) {
        return null;
      }

      const parsedData: StoredActionOrder = JSON.parse(storedData);
      console.log(
        "🎯 [ActionOrderStorage] Action order loaded:",
        parsedData.actionIds,
      );

      return parsedData;
    } catch (error) {
      console.error(
        "❌ [ActionOrderStorage] Failed to load action order:",
        error,
      );
      return null;
    }
  }

  /**
   * 保存されたアクション順序を削除（デフォルト順序に戻す）
   */
  static async clearActionOrder(): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(ACTION_ORDER_KEY);

      return true;
    } catch (error) {
      console.error(
        "❌ [ActionOrderStorage] Failed to clear action order:",
        error,
      );
      return false;
    }
  }

  /**
   * 保存されたアクション順序が存在するかチェック
   */
  static async hasStoredActionOrder(): Promise<boolean> {
    try {
      const storedData = await AsyncStorage.getItem(ACTION_ORDER_KEY);
      return storedData !== null;
    } catch (error) {
      console.error(
        "❌ [ActionOrderStorage] Failed to check stored action order:",
        error,
      );
      return false;
    }
  }
}
