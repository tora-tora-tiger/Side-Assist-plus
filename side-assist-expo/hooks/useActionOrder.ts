import { useState, useEffect, useCallback } from "react";
import { actions as defaultActions, ActionType } from "../constants/actions";
import { ActionOrderStorageService } from "../services/ActionOrderStorageService";

interface UseActionOrderReturn {
  actions: ActionType[];
  isLoading: boolean;
  reorderActions: (startIndex: number, endIndex: number) => void;
  reorderActionsByIds: (activeId: string, overId: string) => void;
  resetToDefault: () => Promise<void>;
}

export const useActionOrder = (): UseActionOrderReturn => {
  const [actions, setActions] = useState<ActionType[]>(defaultActions);
  const [isLoading, setIsLoading] = useState(true);

  // 初期化時に保存された順序を読み込み
  useEffect(() => {
    const initializeActions = async () => {
      setIsLoading(true);

      try {
        const storedOrder = await ActionOrderStorageService.loadActionOrder();

        if (
          storedOrder &&
          storedOrder.actionIds.length === defaultActions.length
        ) {
          // 保存された順序に基づいてアクションを並べ替え
          const orderedActions = storedOrder.actionIds
            .map(id => defaultActions.find(action => action.id === id))
            .filter((action): action is ActionType => action !== undefined);

          // すべてのアクションが見つかった場合のみ適用
          if (orderedActions.length === defaultActions.length) {
            setActions(orderedActions);
          } else {
            console.warn(
              "🎯 [useActionOrder] Stored order incomplete, using default",
            );
            setActions(defaultActions);
          }
        } else {
          setActions(defaultActions);
        }
      } catch (error) {
        console.error("❌ [useActionOrder] Error loading action order:", error);
        setActions(defaultActions);
      } finally {
        setIsLoading(false);
      }
    };

    initializeActions();
  }, []);

  // インデックスベースでの並び替え
  const reorderActions = useCallback((startIndex: number, endIndex: number) => {
    setActions(prevActions => {
      const newActions = [...prevActions];
      const [movedAction] = newActions.splice(startIndex, 1);
      newActions.splice(endIndex, 0, movedAction);

      // 並び替え後の順序を保存
      ActionOrderStorageService.saveActionOrder(newActions).catch(error => {
        console.error(
          "❌ [useActionOrder] Failed to save reordered actions:",
          error,
        );
      });

      return newActions;
    });
  }, []);

  // IDベースでの並び替え（react-native-dnd用）
  const reorderActionsByIds = useCallback(
    (activeId: string, overId: string) => {
      setActions(prevActions => {
        const activeIndex = prevActions.findIndex(
          action => action.id === activeId,
        );
        const overIndex = prevActions.findIndex(action => action.id === overId);

        if (activeIndex === -1 || overIndex === -1) {
          console.warn("🎯 [useActionOrder] Invalid action IDs for reordering");
          return prevActions;
        }

        const newActions = [...prevActions];
        const [movedAction] = newActions.splice(activeIndex, 1);
        newActions.splice(overIndex, 0, movedAction);

        // 並び替え後の順序を保存
        ActionOrderStorageService.saveActionOrder(newActions).catch(error => {
          console.error(
            "❌ [useActionOrder] Failed to save reordered actions:",
            error,
          );
        });

        return newActions;
      });
    },
    [],
  );

  // デフォルト順序にリセット
  const resetToDefault = useCallback(async () => {
    try {
      await ActionOrderStorageService.clearActionOrder();
      setActions(defaultActions);
    } catch (error) {
      console.error(
        "❌ [useActionOrder] Failed to reset to default order:",
        error,
      );
    }
  }, []);

  return {
    actions,
    isLoading,
    reorderActions,
    reorderActionsByIds,
    resetToDefault,
  };
};
