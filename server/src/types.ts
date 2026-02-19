/**
 * サーバー側の型定義（フロントの types/board.ts と一致させる）
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
