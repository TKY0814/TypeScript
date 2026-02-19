/**
 * ドメインモデル（design.md 1-1 〜 1-5 準拠）
 * 実装の都合で変更した場合はファイル先頭のコメントに記載する。
 */

export type CardId = string;

export type Priority = "low" | "medium" | "high";

export type Card = {
  id: CardId;
  title: string;
  detail: string;
  color: string;
  priority: Priority;
  x: number;
  y: number;
  width: number;
  height: number;
  createdAt: string;
  updatedAt: string;
};

export type BoardState = {
  cards: Card[];
  zoom: number;
  offsetX: number;
  offsetY: number;
};

export type UiState = {
  selectedCardId: CardId | null;
  editingCardId: CardId | null;
  theme: "light" | "dark" | "system";
};

export type HistoryState = {
  past: BoardState[];
  present: BoardState;
  future: BoardState[];
};
