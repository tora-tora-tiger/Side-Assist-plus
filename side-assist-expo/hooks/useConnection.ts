import { useState, useCallback, useRef, useEffect } from "react";
import { NetworkService, CustomAction } from "../services/NetworkService";
import { DeepLinkService, ConnectionParams } from "../services/DeepLinkService";
import AlertManager from "../utils/AlertManager";

export const useConnection = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [macIP, setMacIP] = useState<string>("");
  const [macPort, setMacPort] = useState<string>("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState<string>("");
  const [customActions, setCustomActions] = useState<CustomAction[]>([]);
  const [recordingStatus, setRecordingStatus] = useState<
    "idle" | "recording" | "completed"
  >("idle");
  // recordingStatusを使用してログに出力
  console.log("Current recording status:", recordingStatus);
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

  // DeepLink処理のハンドラー
  const handleDeepLink = useCallback(async (params: ConnectionParams) => {
    console.log("🔗 [useConnection] handleDeepLink START - params:", params);
    console.log(
      "🚨 [useConnection] This function should be called ONLY ONCE per QR scan!",
    );

    // まず接続をテスト
    console.log("🔗 [useConnection] Calling NetworkService.testConnection...");
    const connected = await NetworkService.testConnection(
      params.ip,
      params.port,
    );
    if (!connected) {
      console.log(
        "❌ [useConnection] Cannot reach server at:",
        `${params.ip}:${params.port}`,
      );
      return;
    }

    // 接続成功時にステートを更新
    console.log("🔗 [useConnection] Setting connection state...");
    setMacIP(params.ip);
    setMacPort(params.port);
    setIsConnected(true);

    console.log(
      "✅ [useConnection] Connected to server:",
      `${params.ip}:${params.port}`,
    );

    // パスワードで認証を試行
    console.log(
      "🔗 [useConnection] Calling NetworkService.authenticateWithPassword...",
    );
    const authSuccess = await NetworkService.authenticateWithPassword(
      params.ip,
      params.port,
      params.password,
    );
    if (authSuccess) {
      setIsAuthenticated(true);
      setPassword(params.password);
      console.log(
        "🎉 [useConnection] QR code connection and authentication successful!",
      );
    } else {
      console.log(
        "❌ [useConnection] Authentication failed with provided password",
      );
    }
    console.log("🔗 [useConnection] handleDeepLink END");
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
      console.log("⚠️ Cannot load custom actions - missing connection info:", {
        macIP: !!macIP,
        macPort: !!macPort,
        isConnected,
        isAuthenticated,
      });
      return;
    }

    try {
      console.log(`📋 Loading custom actions from ${macIP}:${macPort}...`);
      const actions = await NetworkService.getCustomActions(macIP, macPort);
      console.log(
        `📦 Received ${actions.length} custom actions:`,
        actions.map(a => ({
          id: a.id,
          name: a.name,
          keys: a.key_sequence.length,
        })),
      );
      setCustomActions(actions);
    } catch (error) {
      console.error("Failed to load custom actions:", error);
      setCustomActions([]);
    }
  }, [macIP, macPort, isConnected, isAuthenticated]);

  const resetRecordingState = useCallback(() => {
    console.log("🔄 Resetting recording UI state for next recording");
    // ExecutionScreenのグローバル関数を呼び出してリセット
    if (
      typeof (window as { resetExecutionScreenRecordingState?: () => void })
        .resetExecutionScreenRecordingState === "function"
    ) {
      console.log("🎯 Calling ExecutionScreen reset function...");
      (window as { resetExecutionScreenRecordingState?: () => void })
        .resetExecutionScreenRecordingState!();
    } else {
      console.log("⚠️ ExecutionScreen reset function not found");
    }
  }, []);

  const stopRecordingMonitoring = useCallback(() => {
    if (recordingMonitorRef.current) {
      clearInterval(recordingMonitorRef.current);
      recordingMonitorRef.current = null;
      console.log("🎥 Recording status monitoring stopped");
    }
  }, []);

  // 認証成功時にカスタムアクションを読み込み
  useEffect(() => {
    if (isAuthenticated && macIP && macPort) {
      console.log("🔐 Authentication successful, loading custom actions...");
      loadCustomActions();
    } else {
      // 認証失敗時はカスタムアクションをクリア
      setCustomActions([]);
    }
  }, [isAuthenticated, macIP, macPort, loadCustomActions]);

  const startConnectionMonitoring = useCallback(() => {
    console.log(
      "🔍 [useConnection] startConnectionMonitoring called with IP:",
      macIP,
      "Port:",
      macPort,
    );

    // 既存のタイマーをクリア
    if (connectionMonitorRef.current) {
      console.log("🔍 [useConnection] Clearing existing monitor interval");
      clearInterval(connectionMonitorRef.current);
      connectionMonitorRef.current = null;
    }
    if (monitoringTimeoutRef.current) {
      console.log("🔍 [useConnection] Clearing existing monitor timeout");
      clearTimeout(monitoringTimeoutRef.current);
      monitoringTimeoutRef.current = null;
    }

    // 現在のIP/Portを保存（クロージャー対策）
    const currentIP = macIP;
    const currentPort = macPort;

    if (!currentIP || !currentPort) {
      console.log(
        "❌ [useConnection] Cannot start monitoring - missing IP or Port",
      );
      return;
    }

    // 初期接続直後は10秒待ってから監視開始（重複health checkを避ける）
    console.log(
      "🔍 [useConnection] Delaying monitoring start by 10 seconds to avoid duplicate health checks...",
    );

    monitoringTimeoutRef.current = setTimeout(() => {
      const checkConnection = async () => {
        console.log(
          "🔍 [useConnection] Periodic health check - calling testConnection...",
        );
        const connected = await NetworkService.testConnection(
          currentIP,
          currentPort,
        );
        setIsConnected(connected);

        if (!connected) {
          console.log("🔌 [useConnection] Connection lost");
          setIsConnected(false);
          setIsAuthenticated(false);
          setPassword("");
        }
      };

      connectionMonitorRef.current = setInterval(checkConnection, 10000); // 10秒間隔に延長
      console.log(
        "🔍 [useConnection] Connection monitoring started with 10s interval (after delay)",
      );
    }, 10000);
  }, [macIP, macPort]);

  const stopConnectionMonitoring = useCallback(() => {
    console.log("🛑 [useConnection] Stopping connection monitoring...");

    if (connectionMonitorRef.current) {
      clearInterval(connectionMonitorRef.current);
      connectionMonitorRef.current = null;
      console.log("🛑 [useConnection] Cleared monitoring interval");
    }

    if (monitoringTimeoutRef.current) {
      clearTimeout(monitoringTimeoutRef.current);
      monitoringTimeoutRef.current = null;
      console.log("🛑 [useConnection] Cleared monitoring timeout");
    }

    console.log("🛑 [useConnection] Connection monitoring stopped");
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
        console.log("✅ Authentication successful");
      } else {
        setIsAuthenticated(false);
        setPassword("");
        console.log("❌ Authentication failed");
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
        console.log(
          "❌ [useConnection] sendGesture failed - not connected/authenticated",
        );
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
    async (actionId: string, name: string, icon?: string): Promise<boolean> => {
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
      );

      if (result) {
        // 録画準備成功時に録画状態監視を開始
        startRecordingMonitoring();
      }

      return result;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [macIP, macPort, isConnected, isAuthenticated, password],
  );

  const startRecordingMonitoring = useCallback(() => {
    if (recordingMonitorRef.current) {
      clearInterval(recordingMonitorRef.current);
    }

    console.log("🎥 Starting recording status monitoring...");

    recordingMonitorRef.current = setInterval(async () => {
      if (!macIP || !macPort) return;

      try {
        const status = await NetworkService.getRecordingStatus(macIP, macPort);
        console.log("🎥 Recording status check:", status);

        // サーバーレスポンスの形式に合わせて判定を修正
        const isCurrentlyRecording =
          status.isRecording || status.status === "recording";
        const isCompleted = status.status === "completed";

        // 録画完了状態を検出した場合は、録画していたとみなしてアラートを表示
        // action_id が存在し、かつ未処理の場合のみアラート表示
        if (
          isCompleted &&
          status.actionId &&
          typeof status.actionId === "string"
        ) {
          // 同じ action_id のアラートを重複表示しないようにチェック
          if (!processedCompletedActionIds.current.has(status.actionId)) {
            console.log(
              "🎉 Recording completed for new action:",
              status.actionId,
            );

            // この action_id を処理済みとしてマーク
            processedCompletedActionIds.current.add(status.actionId);

            hasStartedRecording.current = false;
            setRecordingStatus("completed");

            const message = status.message || "録画が完了しました";
            AlertManager.showAlert("録画完了", message, [
              {
                text: "OK",
                onPress: async () => {
                  console.log("✅ User acknowledged recording completion");
                  resetRecordingState();
                },
              },
            ]);

            // 完了確認を送信
            console.log("✅ Sending acknowledgment...");
            await NetworkService.acknowledgeRecording(macIP, macPort);

            // カスタムアクションを再読み込み（新しく保存されたアクションを反映）
            console.log(
              "🔄 Reloading custom actions after recording completion...",
            );
            await loadCustomActions();
          } else {
            console.log(
              "🔄 Already processed completion for action:",
              status.actionId,
            );
          }
        } else if (isCurrentlyRecording && !hasStartedRecording.current) {
          console.log("🔴 Recording started!");
          hasStartedRecording.current = true;
          setRecordingStatus("recording");
        } else if (isCurrentlyRecording) {
          console.log("🔴 Still recording...");
        } else {
          console.log("⚪ Recording idle");
        }
      } catch (error) {
        console.error("Recording status monitoring error:", error);
      }
    }, 1000); // 1秒ごとにチェック
  }, [macIP, macPort, loadCustomActions, resetRecordingState]);

  const connectManually = useCallback(
    async (ip: string, port: string, password: string): Promise<boolean> => {
      try {
        console.log("🔗 [useConnection] connectManually START with IP:", ip);
        console.log(
          "🔗 [useConnection] Current state - isConnected:",
          isConnected,
          "isAuthenticated:",
          isAuthenticated,
        );

        // すでに接続済みの場合は重複処理を防ぐ
        if (isConnected && isAuthenticated && macIP === ip) {
          console.log(
            "⚠️ [useConnection] Already connected and authenticated to this IP, skipping",
          );
          return true;
        }

        const connected = await NetworkService.testConnection(ip, port);
        if (!connected) {
          console.log("❌ [useConnection] Cannot reach server");
          return false;
        }

        const authSuccess = await NetworkService.authenticateWithPassword(
          ip,
          port,
          password,
        );
        if (authSuccess) {
          console.log("✅ [useConnection] Setting connection state...");
          setMacIP(ip);
          setMacPort(port);
          setPassword(password);
          setIsConnected(true);
          setIsAuthenticated(true);
          console.log("✅ [useConnection] Manual connection successful");
          return true;
        } else {
          console.log("❌ [useConnection] Authentication failed");
          return false;
        }
      } catch (error) {
        console.error("[useConnection] Manual connection error:", error);
        return false;
      }
    },
    [isConnected, isAuthenticated, macIP],
  );

  const disconnect = useCallback(() => {
    console.log("🔌 [useConnection] disconnect START");

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
    setRecordingStatus("idle");

    console.log("🔌 [useConnection] Connection disconnected and state reset");
    console.log("🔌 [useConnection] disconnect END");
  }, [stopConnectionMonitoring, stopRecordingMonitoring]);

  return {
    isConnected,
    macIP,
    macPort,
    isAuthenticated,
    password,
    customActions,
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
  };
};
