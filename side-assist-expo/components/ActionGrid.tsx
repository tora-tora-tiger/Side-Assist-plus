import React from "react";
import { View, Animated } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { ActionButton } from "./ui";
import { actions, ActionType } from "../constants/actions";

interface ActionGridProps {
  onActionPress: (action: ActionType) => Promise<void>;
  buttonScales: {
    ultradeepthink: Animated.Value;
    copy: Animated.Value;
    paste: Animated.Value;
    action4: Animated.Value;
    action5: Animated.Value;
    action6: Animated.Value;
    recordButton: Animated.Value;
  };
}

export const ActionGrid: React.FC<ActionGridProps> = ({
  onActionPress,
  buttonScales,
}) => {
  return (
    <View className="flex-1 px-6 py-4">
      <View className="bg-white rounded-3xl p-6 shadow-soft">
        {/* 2x3 グリッド */}
        <View className="flex-row justify-between">
          {/* 左列 */}
          <View className="flex-1 items-center">
            <View className="space-y-6">
              <ActionButton
                icon={
                  <MaterialIcons
                    name={actions[0].iconName}
                    size={32}
                    color="#ffffff"
                  />
                }
                onPress={() => onActionPress(actions[0])}
                animatedValue={buttonScales.ultradeepthink}
                backgroundColor={actions[0].backgroundColor}
              />
              <ActionButton
                icon={
                  <MaterialIcons
                    name={actions[3].iconName}
                    size={32}
                    color="#ffffff"
                  />
                }
                onPress={() => onActionPress(actions[3])}
                animatedValue={buttonScales.action4}
                backgroundColor={actions[3].backgroundColor}
              />
            </View>
          </View>

          {/* 中央列 */}
          <View className="flex-1 items-center">
            <View className="space-y-6">
              <ActionButton
                icon={
                  <MaterialIcons
                    name={actions[1].iconName}
                    size={32}
                    color="#ffffff"
                  />
                }
                onPress={() => onActionPress(actions[1])}
                animatedValue={buttonScales.copy}
                backgroundColor={actions[1].backgroundColor}
              />
              <ActionButton
                icon={
                  <MaterialIcons
                    name={actions[4].iconName}
                    size={32}
                    color="#ffffff"
                  />
                }
                onPress={() => onActionPress(actions[4])}
                animatedValue={buttonScales.action5}
                backgroundColor={actions[4].backgroundColor}
              />
            </View>
          </View>

          {/* 右列 */}
          <View className="flex-1 items-center">
            <View className="space-y-6">
              <ActionButton
                icon={
                  <MaterialIcons
                    name={actions[2].iconName}
                    size={32}
                    color="#ffffff"
                  />
                }
                onPress={() => onActionPress(actions[2])}
                animatedValue={buttonScales.paste}
                backgroundColor={actions[2].backgroundColor}
              />
              <ActionButton
                icon={
                  <MaterialIcons
                    name={actions[5].iconName}
                    size={32}
                    color="#ffffff"
                  />
                }
                onPress={() => onActionPress(actions[5])}
                animatedValue={buttonScales.action6}
                backgroundColor={actions[5].backgroundColor}
              />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};
