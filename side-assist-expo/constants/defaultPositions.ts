import { ActionPosition } from "../services/ActionPositionStorageService";

/**
 * 初期のグリッド配置位置（2x3グリッド）
 * 前のコミット（fd838d0）のActionGrid.tsxレイアウトを再現
 */
export const DEFAULT_GRID_POSITIONS: ActionPosition[] = [
  // 左列
  {
    id: "ultradeepthink",
    x: 40, // 左列の中央
    y: 40, // 上段
    width: 75,
    height: 75,
  },
  {
    id: "action4",
    x: 40, // 左列の中央
    y: 140, // 下段（上段 + ボタンサイズ + 間隔）
    width: 75,
    height: 75,
  },
  // 中央列
  {
    id: "copy",
    x: 140, // 中央列の中央
    y: 40, // 上段
    width: 75,
    height: 75,
  },
  {
    id: "action5",
    x: 140, // 中央列の中央
    y: 140, // 下段
    width: 75,
    height: 75,
  },
  // 右列
  {
    id: "paste",
    x: 240, // 右列の中央
    y: 40, // 上段
    width: 75,
    height: 75,
  },
  {
    id: "action6",
    x: 240, // 右列の中央
    y: 140, // 下段
    width: 75,
    height: 75,
  },
];

/**
 * コンテナサイズに応じてデフォルト位置を計算
 */
export const calculateDefaultPositions = (
  containerWidth: number,
  containerHeight: number,
): ActionPosition[] => {
  // 基本パラメータ
  const buttonSize = 75;
  const cols = 3;
  const rows = 2;

  // 利用可能な領域（パディングを考慮）
  const usableWidth = containerWidth - 80; // 左右パディング
  const usableHeight = containerHeight - 80; // 上下パディング

  // グリッドの間隔を計算
  const colSpacing = usableWidth / cols;
  const rowSpacing = usableHeight / rows;

  // 各ボタンの中央に配置するためのオフセット
  const offsetX = (colSpacing - buttonSize) / 2;
  const offsetY = (rowSpacing - buttonSize) / 2;

  return [
    // 左列（col 0）
    {
      id: "ultradeepthink",
      x: 40 + offsetX,
      y: 40 + offsetY,
      width: buttonSize,
      height: buttonSize,
    },
    {
      id: "action4",
      x: 40 + offsetX,
      y: 40 + offsetY + rowSpacing,
      width: buttonSize,
      height: buttonSize,
    },
    // 中央列（col 1）
    {
      id: "copy",
      x: 40 + offsetX + colSpacing,
      y: 40 + offsetY,
      width: buttonSize,
      height: buttonSize,
    },
    {
      id: "action5",
      x: 40 + offsetX + colSpacing,
      y: 40 + offsetY + rowSpacing,
      width: buttonSize,
      height: buttonSize,
    },
    // 右列（col 2）
    {
      id: "paste",
      x: 40 + offsetX + colSpacing * 2,
      y: 40 + offsetY,
      width: buttonSize,
      height: buttonSize,
    },
    {
      id: "action6",
      x: 40 + offsetX + colSpacing * 2,
      y: 40 + offsetY + rowSpacing,
      width: buttonSize,
      height: buttonSize,
    },
  ];
};
