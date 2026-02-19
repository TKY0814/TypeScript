/**
 * Zustand ストア（design.md 1-6 StoreState 準拠）
 * 永続化は present の BoardState を localStorage へ保存。
 * 履歴に積むのはカード操作（add/update/move/delete）のみ。zoom/offset は履歴に積まず view のみ更新。
 */

import { create } from "zustand";
import type { BoardState, CardId } from "@/types/board";
import * as history from "@/lib/history";
import * as boardState from "@/lib/boardState";
import { createCard } from "@/lib/cardFactory";

const STORAGE_KEY = "board-todo-app-state";

const initialBoardState: BoardState = {
  cards: [],
  zoom: 1,
  offsetX: 0,
  offsetY: 0,
};

export type StoreState = {
  past: BoardState[];
  present: BoardState;
  future: BoardState[];
  selectedCardId: CardId | null;
  editingCardId: CardId | null;
  theme: "light" | "dark" | "system";
  addCard: (partial?: Partial<import("@/types/board").Card>) => void;
  updateCard: (id: CardId, patch: Partial<import("@/types/board").Card>) => void;
  moveCard: (id: CardId, x: number, y: number) => void;
  deleteCard: (id: CardId) => void;
  setZoom: (zoom: number) => void;
  setOffset: (x: number, y: number) => void;
  undo: () => void;
  redo: () => void;
  loadFromStorage: () => void;
  saveToStorage: () => void;
  setTheme: (theme: "light" | "dark" | "system") => void;
  setSelectedCard: (id: CardId | null) => void;
  setEditingCard: (id: CardId | null) => void;
};

export const useBoardStore = create<StoreState>((set, get) => ({
  past: [],
  present: initialBoardState,
  future: [],
  selectedCardId: null,
  editingCardId: null,
  theme: "system",

  addCard: (partial) => {
    const card = createCard(partial);
    const next = boardState.addCardToState(get().present, card);
    set(history.pushHistory(get(), next));
    get().saveToStorage();
  },

  updateCard: (id, patch) => {
    const next = boardState.updateCardInState(get().present, id, patch);
    set(history.pushHistory(get(), next));
    get().saveToStorage();
  },

  moveCard: (id, x, y) => {
    const next = boardState.moveCardInState(get().present, id, x, y);
    set(history.pushHistory(get(), next));
    get().saveToStorage();
  },

  deleteCard: (id) => {
    const next = boardState.deleteCardFromState(get().present, id);
    set(history.pushHistory(get(), next));
    set({ selectedCardId: get().selectedCardId === id ? null : get().selectedCardId, editingCardId: get().editingCardId === id ? null : get().editingCardId });
    get().saveToStorage();
  },

  setZoom: (zoom) => {
    set({ present: boardState.setZoomInState(get().present, zoom) });
    get().saveToStorage();
  },

  setOffset: (x, y) => {
    set({ present: boardState.setOffsetInState(get().present, x, y) });
    get().saveToStorage();
  },

  undo: () => {
    const next = history.undo(get());
    if (next) set(next);
    get().saveToStorage();
  },

  redo: () => {
    const next = history.redo(get());
    if (next) set(next);
    get().saveToStorage();
  },

  loadFromStorage: () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as BoardState;
      if (parsed?.cards && Array.isArray(parsed.cards)) {
        set({
          past: [],
          present: {
            cards: parsed.cards,
            zoom: typeof parsed.zoom === "number" ? parsed.zoom : 1,
            offsetX: typeof parsed.offsetX === "number" ? parsed.offsetX : 0,
            offsetY: typeof parsed.offsetY === "number" ? parsed.offsetY : 0,
          },
          future: [],
        });
      }
    } catch {
      // ignore invalid storage
    }
  },

  saveToStorage: () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(get().present));
    } catch {
      // ignore quota etc.
    }
  },

  setTheme: (theme) => set({ theme }),
  setSelectedCard: (id) => set({ selectedCardId: id }),
  setEditingCard: (id) => set({ editingCardId: id }),
}));
