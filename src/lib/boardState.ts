/**
 * BoardState を更新する純粋関数（カード追加・更新・移動・削除など）
 * テスト・Undo との整合性のため、不変更新で実装
 */

import type { BoardState, Card, CardId } from "@/types/board";

export function addCardToState(state: BoardState, card: Card): BoardState {
  return {
    ...state,
    cards: [...state.cards, card],
  };
}

export function updateCardInState(
  state: BoardState,
  id: CardId,
  patch: Partial<Card>
): BoardState {
  return {
    ...state,
    cards: state.cards.map((c) =>
      c.id === id ? { ...c, ...patch, updatedAt: new Date().toISOString() } : c
    ),
  };
}

export function moveCardInState(
  state: BoardState,
  id: CardId,
  x: number,
  y: number
): BoardState {
  return updateCardInState(state, id, { x, y });
}

export function deleteCardFromState(state: BoardState, id: CardId): BoardState {
  return {
    ...state,
    cards: state.cards.filter((c) => c.id !== id),
  };
}

export function setZoomInState(state: BoardState, zoom: number): BoardState {
  return { ...state, zoom };
}

export function setOffsetInState(
  state: BoardState,
  offsetX: number,
  offsetY: number
): BoardState {
  return { ...state, offsetX, offsetY };
}
