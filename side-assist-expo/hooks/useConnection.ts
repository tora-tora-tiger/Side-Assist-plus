import { useState, useCallback, useRef, useEffect } from "react";
import { NetworkService, CustomAction } from "../services/NetworkService";
import { DeepLinkService, ConnectionParams } from "../services/DeepLinkService";
import {
  ConnectionStorageService,
  StoredConnectionInfo,
} from "../services/ConnectionStorageService";
import AlertManager from "../utils/AlertManager";

export const useConnection = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [macIP, setMacIP] = useState<string>("");
  const [macPort, setMacPort] = useState<string>("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState<string>("");
  const [customActions, setCustomActions] = useState<CustomAction[]>([]);
  const [isAutoReconnecting, setIsAutoReconnecting] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  // recordingStatusを使用してログに出力

  const hasStartedRecording = useRef(false);
  const processedCompletedActionIds = useRef<Set<string>>(new Set());
  const connectionMonitorRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  const monitoringTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const recordingMonitorRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );

  // 初期化の重複実行防止用フラグ
  const initializationRef = useRef({
    isInitializing: false,
    hasInitialized: false,
    initializationId: 0,
  });

  // DeepLink処理のハンドラー
  const handleDeepLink = useCallback(async (params: ConnectionParams) => {
    // まず接続をテスト

    const connected = await NetworkService.testConnection(
      params.ip,
      params.port,
    );
    if (!connected) {
      return;
    }

    // 接続成功時にステートを更新

    setMacIP(params.ip);
    setMacPort(params.port);
    setIsConnected(true);

    // パスワードで認証を試行

    const authSuccess = await NetworkService.authenticateWithPassword(
      params.ip,
      params.port,
      params.password,
    );
    if (authSuccess) {
      setIsAuthenticated(true);
      setPassword(params.password);

      // 接続情報を保存
      await saveConnectionInfo(params.ip, params.port, params.password);
    }
  }, []);

  // DeepLink処理のセットアップ
  useEffect(() => {
    const subscription = DeepLinkService.initialize();
    DeepLinkService.addListener(handleDeepLink);

    return () => {
      DeepLinkService.removeListener(handleDeepLink);
      DeepLinkService.cleanup();
      subscription?.remove();
    };
  }, [handleDeepLink]);

  const loadCustomActions = useCallback(async (): Promise<void> => {
    if (!macIP || !macPort || !isConnected || !isAuthenticated) {
      return;
    }

    try {
      const actions = await NetworkService.getCustomActions(macIP, macPort);
      setCustomActions(actions);
    } catch (error) {
      console.error("Failed to load custom actions:", error);
      setCustomActions([]);
    }
  }, [macIP, macPort, isConnected, isAuthenticated]);

  const resetRecordingState = useCallback(() => {
    // ExecutionScreenのグローバル関数を呼び出してリセット
    if (
      typeof (window as { resetExecutionScreenRecordingState?: () => void })
        .resetExecutionScreenRecordingState === "function"
    ) {
      (window as { resetExecutionScreenRecordingState?: () => void })
        .resetExecutionScreenRecordingState!();
    } else {
      // No action needed when executionScreenRef is not available
    }
  }, []);

  const startRecordingMonitoring = useCallback(() => {
    if (recordingMonitorRef.current) {
      clearInterval(recordingMonitorRef.current);
    }

    recordingMonitorRef.current = setInterval(async () => {
      if (!macIP || !macPort) return;

      try {
        const status = await NetworkService.getRecordingStatus(macIP, macPort);

        // サーバーレスポンスの形式に合わせて判定を修正
        const isCurrentlyRecording =
          status.isRecording || status.status === "recording";
        const isCompleted = status.status === "completed";
        const isCancelled = status.status === "cancelled";

        // 録画完了状態を検出した場合は、録画していたとみなしてアラートを表示
        // action_id が存在し、かつ未処理の場合のみアラート表示
        if (
          isCompleted &&
          status.actionId &&
          typeof status.actionId === "string"
        ) {
          // 同じ action_id のアラートを重複表示しないようにチェック
          if (!processedCompletedActionIds.current.has(status.actionId)) {
            // この action_id を処理済みとしてマーク
            processedCompletedActionIds.current.add(status.actionId);

            hasStartedRecording.current = false;

            const message = status.message || "録画が完了しました";
            AlertManager.showAlert("録画完了", message, [
              {
                text: "OK",
                onPress: async () => {
                  resetRecordingState();
                },
              },
            ]);

            // 完了確認を送信

            await NetworkService.acknowledgeRecording(macIP, macPort);

            // デスクトップ側の保存処理完了を待機してからカスタムアクションを再読み込み
            setTimeout(async () => {
              await loadCustomActions();
            }, 1000); // 1秒待機
          }
        } else if (
          isCancelled &&
          status.actionId &&
          typeof status.actionId === "string"
        ) {
          // キャンセル状態を検出した場合
          if (!processedCompletedActionIds.current.has(status.actionId)) {
            // この action_id を処理済みとしてマーク
            processedCompletedActionIds.current.add(status.actionId);

            hasStartedRecording.current = false;

            // 完了確認を送信
            await NetworkService.acknowledgeRecording(macIP, macPort);
          }
        } else if (isCurrentlyRecording && !hasStartedRecording.current) {
          hasStartedRecording.current = true;
        } else if (isCurrentlyRecording) {
          // Handle recording state
        } else {
          // Handle idle state
        }
      } catch (error) {
        console.error("Recording status monitoring error:", error);
      }
    }, 1000); // 1秒ごとにチェック
  }, [macIP, macPort, loadCustomActions, resetRecordingState]);

  // 接続情報を保存
  const saveConnectionInfo = useCallback(
    async (ip: string, port: string, password: string): Promise<void> => {
      const connectionInfo: StoredConnectionInfo = {
        ip,
        port,
        password,
        lastConnectedAt: Date.now(),
        autoReconnect: true,
      };

      await ConnectionStorageService.saveConnectionInfo(connectionInfo);
    },
    [],
  );

  const stopRecordingMonitoring = useCallback(() => {
    if (recordingMonitorRef.current) {
      clearInterval(recordingMonitorRef.current);
      recordingMonitorRef.current = null;
    }
  }, []);

  // 認証成功時にカスタムアクションを読み込み
  useEffect(() => {
    if (isAuthenticated && macIP && macPort) {
      loadCustomActions();
    } else {
      // 認証失敗時はカスタムアクションをクリア
      setCustomActions([]);
    }
  }, [isAuthenticated, macIP, macPort, loadCustomActions]);

  // 初期化時の自動接続 - 重複実行防止機能付き
  useEffect(() => {
    // 重複実行防止チェック
    if (
      initializationRef.current.isInitializing ||
      initializationRef.current.hasInitialized
    ) {
      return;
    }

    // 初期化開始をマーク
    const currentInitId = ++initializationRef.current.initializationId;
    initializationRef.current.isInitializing = true;

    let isCancelled = false;

    const initializeConnection = async () => {
      try {
        const storedInfo = await ConnectionStorageService.loadConnectionInfo();

        // キャンセルチェック
        if (
          isCancelled ||
          initializationRef.current.initializationId !== currentInitId
        ) {
          return;
        }

        if (!storedInfo) {
          if (!isCancelled) {
            setIsInitialized(true);
            initializationRef.current.hasInitialized = true;
          }
          return;
        }

        if (!storedInfo.autoReconnect) {
          if (!isCancelled) {
            setIsInitialized(true);
            initializationRef.current.hasInitialized = true;
          }
          return;
        }

        // キャンセルチェック
        if (
          isCancelled ||
          initializationRef.current.initializationId !== currentInitId
        ) {
          return;
        }

        setIsAutoReconnecting(true);

        const connected = await NetworkService.testConnection(
          storedInfo.ip,
          storedInfo.port,
        );

        // キャンセルチェック
        if (
          isCancelled ||
          initializationRef.current.initializationId !== currentInitId
        ) {
          return;
        }

        if (!connected) {
          if (!isCancelled) {
            setIsAutoReconnecting(false);
            setIsInitialized(true);
            initializationRef.current.hasInitialized = true;
          }
          return;
        }
        const authSuccess = await NetworkService.authenticateWithPassword(
          storedInfo.ip,
          storedInfo.port,
          storedInfo.password,
        );

        // 最終キャンセルチェック
        if (
          isCancelled ||
          initializationRef.current.initializationId !== currentInitId
        ) {
          return;
        }

        if (authSuccess) {
          setMacIP(storedInfo.ip);
          setMacPort(storedInfo.port);
          setPassword(storedInfo.password);
          setIsConnected(true);
          setIsAuthenticated(true);

          // 最終接続時刻を更新
          await ConnectionStorageService.updateLastConnectedTime();
        }

        setIsAutoReconnecting(false);
        setIsInitialized(true);
        initializationRef.current.hasInitialized = true;
      } catch (error) {
        console.error(
          `💥 [useConnection] Initialization error (init #${currentInitId}):`,
          error,
        );
        if (
          !isCancelled &&
          initializationRef.current.initializationId === currentInitId
        ) {
          setIsAutoReconnecting(false);
          setIsInitialized(true);
          initializationRef.current.hasInitialized = true;
        }
      } finally {
        // 初期化完了をマーク
        if (initializationRef.current.initializationId === currentInitId) {
          initializationRef.current.isInitializing = false;
        }
      }
    };

    initializeConnection();

    return () => {
      isCancelled = true;
      // 進行中の初期化をキャンセル（ただし完了したものはリセットしない）
      if (
        initializationRef.current.initializationId === currentInitId &&
        initializationRef.current.isInitializing &&
        !initializationRef.current.hasInitialized
      ) {
        initializationRef.current.isInitializing = false;
      }
    };
  }, []);

  const startConnectionMonitoring = useCallback(() => {
    // 既存のタイマーをクリア
    if (connectionMonitorRef.current) {
      clearInterval(connectionMonitorRef.current);
      connectionMonitorRef.current = null;
    }
    if (monitoringTimeoutRef.current) {
      clearTimeout(monitoringTimeoutRef.current);
      monitoringTimeoutRef.current = null;
    }

    // 現在のIP/Portを保存（クロージャー対策）
    const currentIP = macIP;
    const currentPort = macPort;

    if (!currentIP || !currentPort) {
      return;
    }

    // 初期接続直後は10秒待ってから監視開始（重複health checkを避ける）

    monitoringTimeoutRef.current = setTimeout(() => {
      const checkConnection = async () => {
        const connected = await NetworkService.testConnection(
          currentIP,
          currentPort,
        );
        setIsConnected(connected);

        if (!connected) {
          setIsConnected(false);
          setIsAuthenticated(false);
          setPassword("");
        }
      };

      connectionMonitorRef.current = setInterval(checkConnection, 10000); // 10秒間隔に延長
    }, 10000);
  }, [macIP, macPort]);

  const stopConnectionMonitoring = useCallback(() => {
    if (connectionMonitorRef.current) {
      clearInterval(connectionMonitorRef.current);
      connectionMonitorRef.current = null;
    }

    if (monitoringTimeoutRef.current) {
      clearTimeout(monitoringTimeoutRef.current);
      monitoringTimeoutRef.current = null;
    }
  }, []);

  const authenticateWithPassword = useCallback(
    async (inputPassword: string): Promise<boolean> => {
      if (!macIP || !macPort || !isConnected) {
        return false;
      }

      const success = await NetworkService.authenticateWithPassword(
        macIP,
        macPort,
        inputPassword,
      );
      if (success) {
        setIsAuthenticated(true);
        setPassword(inputPassword);
      } else {
        setIsAuthenticated(false);
        setPassword("");
      }
      return success;
    },
    [macIP, macPort, isConnected],
  );

  const sendText = useCallback(
    async (text: string): Promise<boolean> => {
      if (!macIP || !macPort || !isConnected || !isAuthenticated) {
        return false;
      }

      return await NetworkService.sendText(macIP, macPort, text, password);
    },
    [macIP, macPort, isConnected, isAuthenticated, password],
  );

  const sendCopy = useCallback(async (): Promise<boolean> => {
    if (!macIP || !macPort || !isConnected || !isAuthenticated) {
      return false;
    }

    return await NetworkService.sendAction(
      macIP,
      macPort,
      { type: "copy" },
      password,
    );
  }, [macIP, macPort, isConnected, isAuthenticated, password]);

  const sendPaste = useCallback(async (): Promise<boolean> => {
    if (!macIP || !macPort || !isConnected || !isAuthenticated) {
      return false;
    }

    return await NetworkService.sendAction(
      macIP,
      macPort,
      { type: "paste" },
      password,
    );
  }, [macIP, macPort, isConnected, isAuthenticated, password]);

  const sendGesture = useCallback(
    async (
      fingers: number,
      direction: string,
      action: string,
      actionData?: string,
    ): Promise<boolean> => {
      if (!macIP || !macPort || !isConnected || !isAuthenticated) {
        return false;
      }

      return await NetworkService.sendGesture(
        macIP,
        macPort,
        fingers,
        direction,
        action,
        actionData,
        password,
      );
    },
    [macIP, macPort, isConnected, isAuthenticated, password],
  );

  const executeCustomAction = useCallback(
    async (actionId: string): Promise<boolean> => {
      if (!macIP || !macPort || !isConnected || !isAuthenticated) {
        return false;
      }

      return await NetworkService.executeCustomAction(
        macIP,
        macPort,
        actionId,
        password,
      );
    },
    [macIP, macPort, isConnected, isAuthenticated, password],
  );

  const prepareRecording = useCallback(
    async (
      actionId: string,
      name: string,
      icon?: string,
      shortcutType?: "normal" | "sequential",
    ): Promise<boolean> => {
      if (!macIP || !macPort || !isConnected || !isAuthenticated) {
        return false;
      }

      const result = await NetworkService.prepareRecording(
        macIP,
        macPort,
        actionId,
        name,
        icon,
        password,
        shortcutType,
      );

      if (result) {
        // 録画準備成功時に録画状態監視を開始
        startRecordingMonitoring();
      }

      return result;
    },
    [
      macIP,
      macPort,
      isConnected,
      isAuthenticated,
      password,
      startRecordingMonitoring,
    ],
  );

  const connectManually = useCallback(
    async (ip: string, port: string, password: string): Promise<boolean> => {
      try {
        // すでに接続済みの場合は重複処理を防ぐ
        if (isConnected && isAuthenticated && macIP === ip) {
          return true;
        }

        const connected = await NetworkService.testConnection(ip, port);
        if (!connected) {
          return false;
        }

        const authSuccess = await NetworkService.authenticateWithPassword(
          ip,
          port,
          password,
        );
        if (authSuccess) {
          setMacIP(ip);
          setMacPort(port);
          setPassword(password);
          setIsConnected(true);
          setIsAuthenticated(true);

          // 接続情報を保存
          await saveConnectionInfo(ip, port, password);

          return true;
        } else {
          return false;
        }
      } catch (error) {
        console.error("[useConnection] Manual connection error:", error);
        return false;
      }
    },
    [isConnected, isAuthenticated, macIP, saveConnectionInfo],
  );

  const disconnect = useCallback(
    async (
      clearStoredInfo: boolean = false,
      resetInitialization: boolean = false,
    ) => {
      // 全ての監視を停止
      stopConnectionMonitoring();
      stopRecordingMonitoring();

      // 接続状態をリセット
      setIsConnected(false);
      setIsAuthenticated(false);
      setMacIP("");
      setMacPort("");
      setPassword("");

      // 録画関連の状態もリセット
      hasStartedRecording.current = false;
      processedCompletedActionIds.current.clear();

      // 初期化状態のリセット（手動切断時など）
      if (resetInitialization) {
        initializationRef.current.isInitializing = false;
        initializationRef.current.hasInitialized = false;
        initializationRef.current.initializationId++;
        setIsInitialized(false);
        setIsAutoReconnecting(false);
      }

      // オプションで保存された接続情報をクリア
      if (clearStoredInfo) {
        await ConnectionStorageService.clearConnectionInfo();
      }
    },
    [stopConnectionMonitoring, stopRecordingMonitoring],
  );

  return {
    isConnected,
    macIP,
    macPort,
    isAuthenticated,
    password,
    customActions,
    isAutoReconnecting,
    isInitialized,
    startConnectionMonitoring,
    stopConnectionMonitoring,
    sendText,
    sendCopy,
    sendPaste,
    sendGesture,
    executeCustomAction,
    prepareRecording,
    resetRecordingState,
    loadCustomActions,
    authenticateWithPassword,
    connectManually,
    disconnect,
    clearStoredConnection: () => ConnectionStorageService.clearConnectionInfo(),
    // 開発用：初期化状態をリセットして再接続を試行
    resetAndRetryConnection: useCallback(async () => {
      // 初期化状態をリセット
      initializationRef.current.isInitializing = false;
      initializationRef.current.hasInitialized = false;
      initializationRef.current.initializationId++;

      // 状態をリセット
      setIsInitialized(false);
      setIsAutoReconnecting(false);

      // 少し待ってから自動接続を再試行
      setTimeout(async () => {
        try {
          const storedInfo =
            await ConnectionStorageService.loadConnectionInfo();
          if (storedInfo && storedInfo.autoReconnect) {
            // useEffectが再実行されるように状態を更新
            setIsInitialized(false);
          }
        } catch (error) {
          console.error("❌ [useConnection] Retry connection error:", error);
        }
      }, 100);
    }, []),
  };
};
