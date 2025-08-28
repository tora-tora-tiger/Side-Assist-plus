import AsyncStorage from "@react-native-async-storage/async-storage";
import { ActionType } from "../constants/actions";
import { calculateDefaultPositions } from "../constants/defaultPositions";

const ACTION_POSITIONS_KEY = "@side_assist_action_positions";

export interface ActionPosition {
  id: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
}

export interface StoredActionPositions {
  positions: ActionPosition[];
  containerWidth: number;
  containerHeight: number;
  lastUpdated: number;
}

export class ActionPositionStorageService {
  // デフォルトの位置を計算（2x3グリッド - 前のActionGrid.tsxレイアウトを再現）
  static getDefaultPositions(
    containerWidth: number,
    containerHeight: number,
    actions: ActionType[],
  ): ActionPosition[] {
    console.log(
      "🎯 [ActionPositionStorage] Generating default positions for grid layout",
    );

    // 新しいグリッド配置計算関数を使用
    const positions = calculateDefaultPositions(
      containerWidth,
      containerHeight,
    );

    // アクションの順序に合わせて位置を調整
    const actionPositions = actions.map(action => {
      const defaultPos = positions.find(pos => pos.id === action.id);
      if (defaultPos) {
        return defaultPos;
      }

      // フォールバック: アクションが見つからない場合は適当な位置に配置
      console.warn(
        `⚠️ [ActionPositionStorage] Position not found for action: ${action.id}`,
      );
      return {
        id: action.id,
        x: 40,
        y: 40,
        width: 75,
        height: 75,
      };
    });

    console.log(
      "🎯 [ActionPositionStorage] Generated positions:",
      actionPositions.length,
      "items",
    );
    return actionPositions;
  }

  /**
   * アクションの位置を保存
   */
  static async saveActionPositions(
    positions: ActionPosition[],
    containerWidth: number,
    containerHeight: number,
  ): Promise<void> {
    try {
      const storageData: StoredActionPositions = {
        positions,
        containerWidth,
        containerHeight,
        lastUpdated: Date.now(),
      };

      await AsyncStorage.setItem(
        ACTION_POSITIONS_KEY,
        JSON.stringify(storageData),
      );
      console.log(
        "🎯 [ActionPositionStorage] Action positions saved:",
        positions.length,
        "items",
      );
    } catch (error) {
      console.error(
        "❌ [ActionPositionStorage] Failed to save action positions:",
        error,
      );
      throw error;
    }
  }

  /**
   * 保存されたアクションの位置を読み込み
   */
  static async loadActionPositions(): Promise<StoredActionPositions | null> {
    try {
      const storedData = await AsyncStorage.getItem(ACTION_POSITIONS_KEY);
      if (!storedData) {
        console.log(
          "🎯 [ActionPositionStorage] No stored action positions found",
        );
        return null;
      }

      const parsedData: StoredActionPositions = JSON.parse(storedData);
      console.log(
        "🎯 [ActionPositionStorage] Action positions loaded:",
        parsedData.positions.length,
        "items",
      );

      return parsedData;
    } catch (error) {
      console.error(
        "❌ [ActionPositionStorage] Failed to load action positions:",
        error,
      );
      return null;
    }
  }

  /**
   * 保存された位置データを削除（デフォルト位置に戻す）
   */
  static async clearActionPositions(): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(ACTION_POSITIONS_KEY);

      return true;
    } catch (error) {
      console.error(
        "❌ [ActionPositionStorage] Failed to clear action positions:",
        error,
      );
      return false;
    }
  }

  /**
   * 保存された位置データが存在するかチェック
   */
  static async hasStoredActionPositions(): Promise<boolean> {
    try {
      const storedData = await AsyncStorage.getItem(ACTION_POSITIONS_KEY);
      return storedData !== null;
    } catch (error) {
      console.error(
        "❌ [ActionPositionStorage] Failed to check stored action positions:",
        error,
      );
      return false;
    }
  }

  /**
   * 位置を境界内に制限
   */
  static constrainPosition(
    position: ActionPosition,
    containerWidth: number,
    containerHeight: number,
  ): ActionPosition {
    const buttonWidth = position.width || 75;
    const buttonHeight = position.height || 75;
    const padding = 10;

    return {
      ...position,
      x: Math.max(
        padding,
        Math.min(position.x, containerWidth - buttonWidth - padding),
      ),
      y: Math.max(
        padding,
        Math.min(position.y, containerHeight - buttonHeight - padding),
      ),
    };
  }

  /**
   * グリッドスナップ機能（オプション）
   */
  static snapToGrid(
    position: ActionPosition,
    gridSize: number = 10,
  ): ActionPosition {
    return {
      ...position,
      x: Math.round(position.x / gridSize) * gridSize,
      y: Math.round(position.y / gridSize) * gridSize,
    };
  }

  /**
   * 重複チェック（ボタン同士の重なりを検出）
   */
  static checkCollision(
    position1: ActionPosition,
    position2: ActionPosition,
  ): boolean {
    const width1 = position1.width || 75;
    const height1 = position1.height || 75;
    const width2 = position2.width || 75;
    const height2 = position2.height || 75;

    return !(
      position1.x + width1 < position2.x ||
      position2.x + width2 < position1.x ||
      position1.y + height1 < position2.y ||
      position2.y + height2 < position1.y
    );
  }
}
