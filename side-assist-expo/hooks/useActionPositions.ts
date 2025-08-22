import { useState, useCallback } from "react";
import { actions as defaultActions } from "../constants/actions";
import {
  ActionPositionStorageService,
  ActionPosition,
} from "../services/ActionPositionStorageService";

interface UseActionPositionsReturn {
  positions: ActionPosition[];
  isLoading: boolean;
  updatePosition: (id: string, x: number, y: number) => void;
  resetToDefault: (
    containerWidth: number,
    containerHeight: number,
  ) => Promise<void>;
  savePositions: (
    containerWidth: number,
    containerHeight: number,
  ) => Promise<void>;
  initializePositions: (
    containerWidth: number,
    containerHeight: number,
  ) => Promise<void>;
}

export const useActionPositions = (): UseActionPositionsReturn => {
  const [positions, setPositions] = useState<ActionPosition[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 位置を更新
  const updatePosition = useCallback((id: string, x: number, y: number) => {
    console.log("🎯 [useActionPositions] Updating position:", { id, x, y });

    setPositions(prevPositions =>
      prevPositions.map(pos => (pos.id === id ? { ...pos, x, y } : pos)),
    );
  }, []);

  // 位置を保存
  const savePositions = useCallback(
    async (containerWidth: number, containerHeight: number) => {
      console.log("🎯 [useActionPositions] Saving positions to storage");

      try {
        // 境界内に制限してから保存
        const constrainedPositions = positions.map(pos =>
          ActionPositionStorageService.constrainPosition(
            pos,
            containerWidth,
            containerHeight,
          ),
        );

        await ActionPositionStorageService.saveActionPositions(
          constrainedPositions,
          containerWidth,
          containerHeight,
        );

        console.log("🎯 [useActionPositions] Positions saved successfully");
      } catch (error) {
        console.error(
          "❌ [useActionPositions] Failed to save positions:",
          error,
        );
      }
    },
    [positions],
  );

  // デフォルト位置にリセット
  const resetToDefault = useCallback(
    async (containerWidth: number, containerHeight: number) => {
      console.log("🎯 [useActionPositions] Resetting to default positions");

      try {
        await ActionPositionStorageService.clearActionPositions();

        const defaultPositions =
          ActionPositionStorageService.getDefaultPositions(
            containerWidth,
            containerHeight,
            defaultActions,
          );

        setPositions(defaultPositions);
        console.log(
          "🎯 [useActionPositions] Reset to default positions completed",
        );
      } catch (error) {
        console.error(
          "❌ [useActionPositions] Failed to reset to default:",
          error,
        );
      }
    },
    [],
  );

  // 位置を初期化（保存済みまたはデフォルト）
  const initializePositions = useCallback(
    async (containerWidth: number, containerHeight: number) => {
      console.log("🎯 [useActionPositions] Initializing positions...", {
        containerWidth,
        containerHeight,
      });
      setIsLoading(true);

      try {
        const storedData =
          await ActionPositionStorageService.loadActionPositions();

        if (
          storedData &&
          storedData.positions.length === defaultActions.length &&
          storedData.containerWidth === containerWidth &&
          storedData.containerHeight === containerHeight
        ) {
          // 保存されたデータがあり、コンテナサイズも一致する場合
          console.log("🎯 [useActionPositions] Using stored positions");
          setPositions(storedData.positions);
        } else if (
          storedData &&
          storedData.positions.length === defaultActions.length
        ) {
          // 保存されたデータがあるが、コンテナサイズが異なる場合
          console.log(
            "🎯 [useActionPositions] Scaling stored positions for new container size",
          );

          const scaleX = containerWidth / storedData.containerWidth;
          const scaleY = containerHeight / storedData.containerHeight;

          const scaledPositions = storedData.positions.map(pos => {
            const scaledPos = {
              ...pos,
              x: pos.x * scaleX,
              y: pos.y * scaleY,
            };

            // 境界内に制限
            return ActionPositionStorageService.constrainPosition(
              scaledPos,
              containerWidth,
              containerHeight,
            );
          });

          setPositions(scaledPositions);
        } else {
          // 保存されたデータがないか不完全な場合はデフォルト位置を使用
          console.log("🎯 [useActionPositions] Using default positions");

          const defaultPositions =
            ActionPositionStorageService.getDefaultPositions(
              containerWidth,
              containerHeight,
              defaultActions,
            );

          setPositions(defaultPositions);
        }
      } catch (error) {
        console.error(
          "❌ [useActionPositions] Error initializing positions:",
          error,
        );

        // エラー時はデフォルト位置を使用
        const defaultPositions =
          ActionPositionStorageService.getDefaultPositions(
            containerWidth,
            containerHeight,
            defaultActions,
          );

        setPositions(defaultPositions);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return {
    positions,
    isLoading,
    updatePosition,
    resetToDefault,
    savePositions,
    initializePositions,
  };
};
