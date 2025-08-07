import { MaterialIcons } from "@expo/vector-icons";

export const actions = [
  {
    id: "ultradeepthink",
    iconName: "psychology" as keyof typeof MaterialIcons.glyphMap,
    text: "ultradeepthink",
    backgroundColor: "#6366f1", // Indigo
    type: "text" as const,
  },
  {
    id: "copy",
    iconName: "content-copy" as keyof typeof MaterialIcons.glyphMap,
    text: "copy",
    backgroundColor: "#f59e0b", // Amber
    type: "clipboard" as const,
  },
  {
    id: "paste",
    iconName: "content-paste" as keyof typeof MaterialIcons.glyphMap,
    text: "paste",
    backgroundColor: "#10b981", // Emerald
    type: "clipboard" as const,
  },
  {
    id: "action4",
    iconName: "rocket-launch" as keyof typeof MaterialIcons.glyphMap,
    text: "action4",
    backgroundColor: "#ef4444", // Red
    type: "text" as const,
  },
  {
    id: "action5",
    iconName: "build" as keyof typeof MaterialIcons.glyphMap,
    text: "action5",
    backgroundColor: "#8b5cf6", // Violet
    type: "text" as const,
  },
  {
    id: "action6",
    iconName: "bar-chart" as keyof typeof MaterialIcons.glyphMap,
    text: "action6",
    backgroundColor: "#06b6d4", // Cyan
    type: "text" as const,
  },
];

export type ActionType = (typeof actions)[0];
