/**
 * Undo/Redo 用の純粋関数（テストしやすいようにストアから切り出し）
 * design.md: past / present / future による履歴管理
 */

import type { BoardState } from "@/types/board";

const MAX_HISTORY = 50;

/** 現在の present を past に積み、新しい present をセットする */
export function pushHistory(
  history: { past: BoardState[]; present: BoardState; future: BoardState[] },
  nextPresent: BoardState
): { past: BoardState[]; present: BoardState; future: BoardState[] } {
  const past = [...history.past, history.present];
  if (past.length > MAX_HISTORY) past.shift();
  return {
    past,
    present: nextPresent,
    future: [], // 新しい変更で future はクリア
  };
}

/** Undo: present を future に積み、past の最後を present に */
export function undo(
  history: { past: BoardState[]; present: BoardState; future: BoardState[] }
): { past: BoardState[]; present: BoardState; future: BoardState[] } | null {
  if (history.past.length === 0) return null;
  const past = [...history.past];
  const present = past.pop()!;
  const future = [history.present, ...history.future];
  return { past, present, future };
}

/** Redo: present を past に積み、future の先頭を present に */
export function redo(
  history: { past: BoardState[]; present: BoardState; future: BoardState[] }
): { past: BoardState[]; present: BoardState; future: BoardState[] } | null {
  if (history.future.length === 0) return null;
  const past = [...history.past, history.present];
  const future = [...history.future];
  const present = future.shift()!;
  return { past, present, future };
}

export function canUndo(history: { past: BoardState[] }): boolean {
  return history.past.length > 0;
}

export function canRedo(history: { future: BoardState[] }): boolean {
  return history.future.length > 0;
}
