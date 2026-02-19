/**
 * Zustand ストア（design.md 1-6 StoreState 準拠）
 * 永続化は present の BoardState を PostgreSQL（API経由）へ保存。
 * 履歴に積むのはカード操作（add/update/move/delete）のみ。zoom/offset は履歴に積まず view のみ更新。
 *
 * 追加要件: きらきらエフェクト用に UiState を拡張
 * - newCardIds: CardId[] … 追加直後のカードID一覧。Card で isNew 判定に使用し、約0.8秒後に clearNewCard で解除。
 */

import { create } from "zustand";
import type { BoardState, CardId } from "@/types/board";
import * as history from "@/lib/history";
import * as boardState from "@/lib/boardState";
import { createCard } from "@/lib/cardFactory";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

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
  newCardIds: CardId[];
  clearNewCard: (id: CardId) => void;
  lastSaveStatus: "idle" | "saving" | "success" | "error";
  lastSaveError: string | null;
};

export const useBoardStore = create<StoreState>((set, get) => ({
  past: [],
  present: initialBoardState,
  future: [],
  selectedCardId: null,
  editingCardId: null,
  theme: "system",
  newCardIds: [],
  lastSaveStatus: "idle",
  lastSaveError: null,

  addCard: (partial) => {
    const card = createCard(partial);
    const next = boardState.addCardToState(get().present, card);
    set(history.pushHistory(get(), next));
    set({ newCardIds: [...get().newCardIds, card.id] });
    void get().saveToStorage(); // Promise チェーンを無視
  },

  clearNewCard: (id) => {
    set({ newCardIds: get().newCardIds.filter((x) => x !== id) });
  },

  updateCard: (id, patch) => {
    const next = boardState.updateCardInState(get().present, id, patch);
    set(history.pushHistory(get(), next));
    void get().saveToStorage();
  },

  moveCard: (id, x, y) => {
    const next = boardState.moveCardInState(get().present, id, x, y);
    set(history.pushHistory(get(), next));
    void get().saveToStorage();
  },

  deleteCard: (id) => {
    const next = boardState.deleteCardFromState(get().present, id);
    set(history.pushHistory(get(), next));
    set({
      selectedCardId: get().selectedCardId === id ? null : get().selectedCardId,
      editingCardId: get().editingCardId === id ? null : get().editingCardId,
      newCardIds: get().newCardIds.filter((x) => x !== id),
    });
    void get().saveToStorage();
  },

  setZoom: (zoom) => {
    set({ present: boardState.setZoomInState(get().present, zoom) });
    void get().saveToStorage();
  },

  setOffset: (x, y) => {
    set({ present: boardState.setOffsetInState(get().present, x, y) });
    void get().saveToStorage();
  },

  undo: () => {
    const next = history.undo(get());
    if (next) set(next);
    void get().saveToStorage();
  },

  redo: () => {
    const next = history.redo(get());
    if (next) set(next);
    void get().saveToStorage();
  },

  loadFromStorage: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/board`);
      if (!response.ok) {
        console.error("Failed to load board state:", response.statusText);
        return;
      }
      const parsed = (await response.json()) as BoardState;
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
    } catch (error) {
      console.error("Error loading board state:", error);
    }
  },

  saveToStorage: async () => {
    try {
      set({ lastSaveStatus: "saving", lastSaveError: null });
      console.log("[saveToStorage] API_BASE_URL:", API_BASE_URL);
      console.log("[saveToStorage] Sending PUT request to:", `${API_BASE_URL}/api/board`);
      const body = JSON.stringify(get().present);
      console.log("[saveToStorage] Request body size:", body.length);
      
      const response = await fetch(`${API_BASE_URL}/api/board`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body,
      });
      
      console.log("[saveToStorage] Response status:", response.status);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }
      const result = await response.json();
      console.log("[saveToStorage] Server response:", result);
      
      set({ lastSaveStatus: "success", lastSaveError: null });
      console.log("[saveToStorage] ✓ Save successful");
      // 2秒後に idle に戻す
      setTimeout(() => set({ lastSaveStatus: "idle" }), 2000);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`[saveToStorage] ✗ Error: ${errorMsg}`);
      console.error("[saveToStorage] Full error:", error);
      set({ lastSaveStatus: "error", lastSaveError: errorMsg });
      // 5秒後に idle に戻す
      setTimeout(() => set({ lastSaveStatus: "idle" }), 5000);
    }
  },

  setTheme: (theme) => set({ theme }),
  setSelectedCard: (id) => set({ selectedCardId: id }),
  setEditingCard: (id) => set({ editingCardId: id }),
}));
