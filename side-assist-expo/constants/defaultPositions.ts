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
  const padding = 0;
  const verticalSpacing = 10 + containerHeight * 0;

  // 利用可能な領域
  const usableWidth = containerWidth - padding * 2;

  // 列の間隔を計算
  const colSpacing = usableWidth / cols;

  // 全体の高さ（2行のボタン + 1つの間隔）

  // 垂直方向の中央配置のための開始Y位置
  const startY = 20;

  // 各列の中央配置のための開始X位置
  const offsetX = (colSpacing - buttonSize) / 2;

  return [
    // 上段（row 0）
    {
      id: "ultradeepthink", // 左上
      x: padding + offsetX,
      y: startY,
      width: buttonSize,
      height: buttonSize,
    },
    {
      id: "copy", // 中央上
      x: padding + offsetX + colSpacing,
      y: startY,
      width: buttonSize,
      height: buttonSize,
    },
    {
      id: "paste", // 右上
      x: padding + offsetX + colSpacing * 2,
      y: startY,
      width: buttonSize,
      height: buttonSize,
    },
    // 下段（row 1）
    {
      id: "action4", // 左下
      x: padding + offsetX,
      y: startY + buttonSize + verticalSpacing,
      width: buttonSize,
      height: buttonSize,
    },
    {
      id: "action5", // 中央下
      x: padding + offsetX + colSpacing,
      y: startY + buttonSize + verticalSpacing,
      width: buttonSize,
      height: buttonSize,
    },
    {
      id: "action6", // 右下
      x: padding + offsetX + colSpacing * 2,
      y: startY + buttonSize + verticalSpacing,
      width: buttonSize,
      height: buttonSize,
    },
  ];
};
