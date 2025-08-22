import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { GestureService } from "../services/GestureService";
import { GestureResult, GestureMapping } from "../constants/gestures";
import { useSettings } from "../contexts/SettingsContext";

interface GesturesTabProps {
  onGestureDetected?: (gesture: {
    fingers: number;
    direction: string;
    action: string;
    mapping: GestureMapping;
  }) => Promise<void>;
}

export const GesturesTab: React.FC<GesturesTabProps> = ({
  onGestureDetected,
}) => {
  const [isGestureMode, setIsGestureMode] = useState(false);
  const [lastGesture, setLastGesture] = useState<string | null>(null);
  const [gestureService] = useState(() => new GestureService());
  const [gestureMappings, setGestureMappings] = useState<GestureMapping[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // 設定フック（ハプティクス制御用）
  const { settings } = useSettings();

  // 設定変更をログ出力（デバッグ用）
  useEffect(() => {
    console.log(`🎛️ [GesturesTab] Settings changed:`, settings);
    console.log(
      `🎛️ [GesturesTab] Haptics enabled: ${settings?.hapticsEnabled}`,
    );
    console.log(`🎛️ [GesturesTab] Settings object reference:`, Date.now());
  }, [settings]);

  // 実際の設定値を確実に使用するため、settingsが変更された時点での値を記録
  const currentHapticsEnabled = settings?.hapticsEnabled ?? true;
  console.log(
    `🔍 [GesturesTab] Current haptics state in render: ${currentHapticsEnabled}`,
  );

  // ジェスチャーサービスの初期化
  useEffect(() => {
    const mappings = gestureService.getGestureMappings();
    setGestureMappings(mappings);
  }, [gestureService]);

  const toggleGestureMode = async () => {
    console.log(`🔄 [GesturesTab] Toggling gesture mode: ${!isGestureMode}`);

    if (!isGestureMode) {
      // ジェスチャーモード開始時の触覚フィードバック（設定に応じて）
      const hapticsEnabled = settings?.hapticsEnabled ?? true;
      console.log(
        `🎛️ [GesturesTab] Haptics check - enabled: ${hapticsEnabled} (settings: ${JSON.stringify(settings)})`,
      );
      if (hapticsEnabled) {
        console.log(`📳 [GesturesTab] Executing haptics: gesture mode start`);
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } else {
        console.log(
          `🔇 [GesturesTab] Haptics disabled - skipping gesture mode start`,
        );
      }
      console.log(`✅ [GesturesTab] Gesture mode ENABLED`);
    } else {
      console.log(`❌ [GesturesTab] Gesture mode DISABLED`);
    }

    setIsGestureMode(!isGestureMode);
    if (!isGestureMode) {
      setLastGesture(null);
      setIsProcessing(false);
      gestureService.forceReset();
    }
  };

  // ジェスチャー検出の処理
  const handleGestureResult = async (result: GestureResult) => {
    if (result.detected && result.mapping && onGestureDetected) {
      setIsProcessing(true);

      // ジェスチャー認識成功の触覚フィードバック（2段階）（設定に応じて）
      const hapticsEnabled = settings?.hapticsEnabled ?? true;
      console.log(
        `🎛️ [GesturesTab] Haptics check - enabled: ${hapticsEnabled} (settings: ${JSON.stringify(settings)})`,
      );
      if (hapticsEnabled) {
        console.log(
          `📳 [GesturesTab] Executing haptics: gesture recognition success`,
        );
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setTimeout(async () => {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        }, 100);
      } else {
        console.log(
          `🔇 [GesturesTab] Haptics disabled - skipping gesture recognition feedback`,
        );
      }

      const gestureDescription = `${result.mapping.fingers}本指 ${getDirectionDisplayName(result.event?.direction || "unknown")}スワイプ → ${result.mapping.displayName}`;
      setLastGesture(gestureDescription);

      try {
        await onGestureDetected({
          fingers: result.mapping.fingers,
          direction: result.event?.direction || "unknown",
          action: result.mapping.action,
          mapping: result.mapping,
        });

        // アクション実行成功の触覚フィードバック（長い振動）（設定に応じて）
        if (settings?.hapticsEnabled) {
          await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success,
          );
        }
      } catch (error) {
        console.error("🚨 [GesturesTab] Gesture execution error:", error);
        // エラーの触覚フィードバック（警告パターン）（設定に応じて）
        if (settings?.hapticsEnabled) {
          await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Error,
          );
        }
      }

      setIsProcessing(false);
    } else if (result.error) {
      // ジェスチャー認識失敗の触覚フィードバック（弱い振動）（設定に応じて）
      if (settings?.hapticsEnabled) {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      console.log(`❌ [GesturesTab] Gesture not recognized: ${result.error}`);
    }
  };

  return (
    <View className="flex-1 bg-neutral-50">
      {/* ジェスチャーモード切り替え */}
      <View className="px-6 py-4">
        <TouchableOpacity
          className={`flex-row items-center justify-center py-4 px-6 rounded-xl ${
            isGestureMode ? "bg-green-500" : "bg-blue-500"
          }`}
          onPress={toggleGestureMode}
          activeOpacity={0.8}
        >
          <MaterialIcons
            name={isGestureMode ? "stop" : "touch-app"}
            size={24}
            color="white"
          />
          <Text className="text-white font-semibold text-lg ml-3">
            {isGestureMode
              ? "ジェスチャーモード終了"
              : "ジェスチャーモード開始"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ジェスチャー検出エリア */}
      {isGestureMode ? (
        <View
          className="flex-1 mx-6 mb-6 bg-white rounded-xl border-2 border-dashed border-gray-300 items-center justify-center"
          onTouchStart={event => {
            console.log(
              `🟢 [GesturesTab] onTouchStart: ${event.nativeEvent.touches.length} touches`,
            );

            const touches = Array.from(event.nativeEvent.touches).map(
              touch => ({
                identifier: touch.identifier,
                pageX: touch.pageX,
                pageY: touch.pageY,
              }),
            );

            gestureService.onTouchStart(touches);
          }}
          onTouchMove={event => {
            console.log(
              `🟡 [GesturesTab] onTouchMove: ${event.nativeEvent.touches.length} touches`,
            );

            const touches = Array.from(event.nativeEvent.touches).map(
              touch => ({
                identifier: touch.identifier,
                pageX: touch.pageX,
                pageY: touch.pageY,
              }),
            );

            gestureService.onTouchMove(touches);
          }}
          onTouchEnd={event => {
            console.log(
              `🔴 [GesturesTab] onTouchEnd: ${event.nativeEvent.touches.length} remaining touches`,
            );

            const result = gestureService.onTouchEnd(
              event.nativeEvent.touches.length,
            );
            console.log(
              `📊 [GesturesTab] Direct touch gesture result:`,
              result,
            );
            handleGestureResult(result);
          }}
        >
          <MaterialIcons
            name={isProcessing ? "hourglass-empty" : "pan-tool"}
            size={64}
            color={isProcessing ? "#f59e0b" : "#6b7280"}
          />
          <Text
            className={`text-lg font-medium mt-4 ${isProcessing ? "text-amber-600" : "text-gray-600"}`}
          >
            {isProcessing
              ? "ジェスチャーを処理中..."
              : "ここでジェスチャーを実行してください"}
          </Text>
          <Text className="text-gray-400 text-sm mt-2 text-center px-8">
            指の本数とスワイプ方向を組み合わせて{"\n"}
            PCを操作できます
          </Text>

          {/* 現在の状態表示 */}
          <View className="mt-4 px-4 py-2 bg-green-50 rounded-lg">
            <Text className="text-green-600 text-sm font-medium">
              👆 {gestureService.getCurrentState()}
            </Text>
          </View>

          {lastGesture && (
            <View className="mt-6 px-6 py-3 bg-blue-50 rounded-lg">
              <Text className="text-blue-600 font-medium text-center">
                最後のジェスチャー:
              </Text>
              <Text className="text-blue-700 text-sm mt-1 text-center">
                {lastGesture}
              </Text>
            </View>
          )}
        </View>
      ) : (
        <View className="flex-1 px-6">
          {/* ジェスチャー説明セクション */}
          <View className="bg-white rounded-xl p-6 mb-6">
            <Text className="text-xl font-bold text-gray-800 mb-4">
              ジェスチャー操作について
            </Text>
            <Text className="text-gray-600 leading-6">
              指の本数とスワイプ方向を組み合わせて、PCを直感的に操作できます。
              画面を見なくても操作可能な設計になっています。
            </Text>
          </View>

          {/* 利用可能なジェスチャー一覧 */}
          <View className="bg-white rounded-xl p-6">
            <Text className="text-lg font-semibold text-gray-800 mb-4">
              利用可能なジェスチャー ({gestureMappings.length}個)
            </Text>

            <View className="space-y-4">
              {gestureMappings.map(mapping => (
                <GestureItem
                  key={mapping.id}
                  fingers={mapping.fingers}
                  direction={getDirectionDisplayName(mapping.direction)}
                  action={mapping.displayName}
                  icon={mapping.icon}
                  description={mapping.description}
                />
              ))}
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

// 方向の表示名を取得するヘルパー関数
const getDirectionDisplayName = (direction: string): string => {
  const directionMap: Record<string, string> = {
    up: "上",
    down: "下",
    left: "左",
    right: "右",
  };
  return directionMap[direction] || direction;
};

interface GestureItemProps {
  fingers: number;
  direction: string;
  action: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  description?: string;
}

const GestureItem: React.FC<GestureItemProps> = ({
  fingers,
  direction,
  action,
  icon,
  description,
}) => {
  return (
    <View className="flex-row items-center py-3 px-2 rounded-lg">
      <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mr-4">
        <MaterialIcons name={icon} size={20} color="#3b82f6" />
      </View>
      <View className="flex-1">
        <Text className="text-gray-800 font-medium">
          {fingers}本指で{direction}スワイプ
        </Text>
        <Text className="text-gray-500 text-sm">→ {action}</Text>
        {description && (
          <Text className="text-gray-400 text-xs mt-1">{description}</Text>
        )}
      </View>
    </View>
  );
};
