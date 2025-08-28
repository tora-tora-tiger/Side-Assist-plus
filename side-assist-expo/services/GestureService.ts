import {
  GestureDirection,
  GestureDirections,
  GestureEvent,
  GestureMapping,
  GestureResult,
  DefaultGestureMappings,
  GestureConfig,
  GestureState,
  GestureStates,
} from "../constants/gestures";

// タッチポイントの情報
interface TouchPoint {
  id: string | number;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  startTime: number;
}

export class GestureService {
  private activeTouches: Map<string | number, TouchPoint> = new Map();
  private gestureMappings: GestureMapping[] = [...DefaultGestureMappings];
  private currentState: GestureState = GestureStates.IDLE;
  private lastGestureTime: number = 0;
  private gestureStartTime: number = 0;

  // ジェスチャーマッピングの管理
  public getGestureMappings(): GestureMapping[] {
    return this.gestureMappings.filter(mapping => mapping.enabled);
  }

  public updateGestureMapping(mapping: GestureMapping): void {
    const index = this.gestureMappings.findIndex(m => m.id === mapping.id);
    if (index !== -1) {
      this.gestureMappings[index] = mapping;
    } else {
      this.gestureMappings.push(mapping);
    }
  }

  // タッチイベントの処理
  public onTouchStart(
    touches: { identifier: string | number; pageX: number; pageY: number }[],
  ): void {
    const now = Date.now();

    // デバウンス処理
    if (now - this.lastGestureTime < GestureConfig.DEBOUNCE_TIME) {
      return;
    }

    // 新しいジェスチャー開始
    if (this.activeTouches.size === 0) {
      this.currentState = GestureStates.DETECTING;
      this.gestureStartTime = now;
    }

    // タッチポイントを記録
    touches.forEach(touch => {
      if (!this.activeTouches.has(touch.identifier)) {
        this.activeTouches.set(touch.identifier, {
          id: touch.identifier,
          startX: touch.pageX,
          startY: touch.pageY,
          currentX: touch.pageX,
          currentY: touch.pageY,
          startTime: now,
        });
      }
    });
  }

  public onTouchMove(
    touches: { identifier: string | number; pageX: number; pageY: number }[],
  ): void {
    if (this.currentState !== GestureStates.DETECTING) {
      return;
    }

    // タッチポイントの位置を更新
    touches.forEach(touch => {
      const touchPoint = this.activeTouches.get(touch.identifier);
      if (touchPoint) {
        touchPoint.currentX = touch.pageX;
        touchPoint.currentY = touch.pageY;
      }
    });
  }

  public onTouchEnd(remainingTouchCount: number): GestureResult {
    if (this.currentState !== GestureStates.DETECTING) {
      return { detected: false };
    }

    // 全ての指が離れたらジェスチャーを評価
    if (remainingTouchCount === 0) {
      const result = this.evaluateGesture();
      this.resetGesture();
      return result;
    }

    return { detected: false };
  }

  // ジェスチャーの評価
  private evaluateGesture(): GestureResult {
    const now = Date.now();
    const gestureDuration = now - this.gestureStartTime;

    // 時間的制約チェック
    if (
      gestureDuration < GestureConfig.MIN_GESTURE_TIME ||
      gestureDuration > GestureConfig.MAX_GESTURE_TIME
    ) {
      return { detected: false, error: "Gesture duration out of range" };
    }

    const fingerCount = this.activeTouches.size;
    const direction = this.calculateDirection();
    const distance = this.calculateDistance();

    // 距離チェック
    if (distance < GestureConfig.MIN_SWIPE_DISTANCE) {
      return { detected: false, error: "Swipe distance too short" };
    }

    // マッピングを検索
    const mapping = this.findMatchingMapping(fingerCount, direction);
    if (!mapping) {
      return { detected: false, error: "No matching gesture mapping" };
    }

    // ジェスチャーイベントを作成
    const gestureEvent: GestureEvent = {
      id: `gesture_${now}`,
      fingers: fingerCount,
      direction,
      startTime: this.gestureStartTime,
      endTime: now,
      distance,
      velocity: distance / gestureDuration,
      confidence: this.calculateConfidence(fingerCount, direction, distance),
    };

    this.lastGestureTime = now;
    return {
      detected: true,
      mapping,
      event: gestureEvent,
    };
  }

  // 方向の計算
  private calculateDirection(): GestureDirection {
    if (this.activeTouches.size === 0) {
      return GestureDirections.UP; // デフォルト
    }

    let totalDx = 0;
    let totalDy = 0;

    this.activeTouches.forEach(touch => {
      totalDx += touch.currentX - touch.startX;
      totalDy += touch.currentY - touch.startY;
    });

    const avgDx = totalDx / this.activeTouches.size;
    const avgDy = totalDy / this.activeTouches.size;

    // 主要な方向を決定
    if (Math.abs(avgDx) > Math.abs(avgDy)) {
      return avgDx > 0 ? GestureDirections.RIGHT : GestureDirections.LEFT;
    } else {
      return avgDy > 0 ? GestureDirections.DOWN : GestureDirections.UP;
    }
  }

  // 距離の計算
  private calculateDistance(): number {
    if (this.activeTouches.size === 0) {
      return 0;
    }

    let totalDistance = 0;

    this.activeTouches.forEach(touch => {
      const dx = touch.currentX - touch.startX;
      const dy = touch.currentY - touch.startY;
      totalDistance += Math.sqrt(dx * dx + dy * dy);
    });

    return totalDistance / this.activeTouches.size;
  }

  // 信頼度の計算
  private calculateConfidence(
    fingers: number,
    direction: GestureDirection,
    distance: number,
  ): number {
    let confidence = 0.5; // ベース信頼度

    // 指の本数による信頼度調整
    if (fingers >= 2 && fingers <= 4) {
      confidence += 0.2;
    }

    // 距離による信頼度調整
    if (distance > GestureConfig.MIN_SWIPE_DISTANCE * 2) {
      confidence += 0.2;
    }

    // 方向の一貫性による信頼度調整（すべての指が同方向に動いているか）
    const directionConsistency = this.calculateDirectionConsistency(direction);
    confidence += directionConsistency * 0.1;

    return Math.min(1.0, confidence);
  }

  // 方向の一貫性を計算
  private calculateDirectionConsistency(
    expectedDirection: GestureDirection,
  ): number {
    let consistentTouches = 0;

    this.activeTouches.forEach(touch => {
      const dx = touch.currentX - touch.startX;
      const dy = touch.currentY - touch.startY;

      const touchDirection =
        Math.abs(dx) > Math.abs(dy)
          ? dx > 0
            ? GestureDirections.RIGHT
            : GestureDirections.LEFT
          : dy > 0
            ? GestureDirections.DOWN
            : GestureDirections.UP;

      if (touchDirection === expectedDirection) {
        consistentTouches++;
      }
    });

    return consistentTouches / this.activeTouches.size;
  }

  // マッチするマッピングを検索
  private findMatchingMapping(
    fingers: number,
    direction: GestureDirection,
  ): GestureMapping | null {
    return (
      this.gestureMappings.find(
        mapping =>
          mapping.enabled &&
          mapping.fingers === fingers &&
          mapping.direction === direction,
      ) || null
    );
  }

  // ジェスチャー状態のリセット
  private resetGesture(): void {
    this.activeTouches.clear();
    this.currentState = GestureStates.IDLE;
  }

  // 現在の状態を取得
  public getCurrentState(): GestureState {
    return this.currentState;
  }

  // 強制リセット
  public forceReset(): void {
    this.resetGesture();
    this.lastGestureTime = 0;
  }
}
