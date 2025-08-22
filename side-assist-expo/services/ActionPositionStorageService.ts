import AsyncStorage from "@react-native-async-storage/async-storage";
import { ActionType } from "../constants/actions";

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
  // デフォルトの位置を計算（3x2グリッド）
  static getDefaultPositions(
    containerWidth: number,
    containerHeight: number,
    actions: ActionType[],
  ): ActionPosition[] {
    const buttonSize = 75; // ActionButtonのデフォルトサイズ
    const padding = 20;
    const availableWidth = containerWidth - padding * 2;
    const availableHeight = containerHeight - padding * 2;

    // 3列で配置
    const cols = 3;
    const rows = Math.ceil(actions.length / cols);
    const spacing = Math.max(
      (availableWidth - cols * buttonSize) / (cols - 1),
      20,
    );
    const verticalSpacing = Math.max(
      (availableHeight - rows * buttonSize) / (rows + 1),
      20,
    );

    return actions.map((action, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;

      return {
        id: action.id,
        x: padding + col * (buttonSize + spacing),
        y: padding + verticalSpacing + row * (buttonSize + verticalSpacing),
        width: buttonSize,
        height: buttonSize,
      };
    });
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
      console.log("🎯 [ActionPositionStorage] Action positions cleared");
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
