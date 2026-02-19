/**
 * dnd-kit のドラッグ終了時に、新しいカード位置を計算するロジック（テストしやすいように切り出し）
 * ボードに scale(zoom) がかかっているため、transform の delta を zoom で割ってボード座標にする
 */

export function getNewPositionAfterDrag(
  currentX: number,
  currentY: number,
  deltaX: number,
  deltaY: number,
  zoom: number
): { x: number; y: number } {
  return {
    x: Math.round(currentX + deltaX / zoom),
    y: Math.round(currentY + deltaY / zoom),
  };
}
