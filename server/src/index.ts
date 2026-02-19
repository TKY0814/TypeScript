/**
 * Express API サーバー
 * GET /api/board - ボード状態を取得
 * PUT /api/board - ボード状態を保存
 */

import express from "express";
import cors from "cors";
import { getBoardState, saveBoardState } from "./boardRepository.js";
import type { BoardState } from "./types.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:5173" }));
app.use(express.json());

// GET /api/board - ボード状態を取得
app.get("/api/board", (req, res) => {
  try {
    console.log("[GET /api/board] Request received");
    const state = getBoardState();
    if (!state) {
      // 初回アクセス時は空の状態を返す
      console.log("[GET /api/board] Returning empty state (first access)");
      return res.json({
        cards: [],
        zoom: 1,
        offsetX: 0,
        offsetY: 0,
      } satisfies BoardState);
    }
    console.log("[GET /api/board] ✓ Returned board state");
    res.json(state);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`[GET /api/board] ✗ Error: ${errorMsg}`);
    res.status(500).json({ error: errorMsg || "Failed to fetch board state" });
  }
});

// PUT /api/board - ボード状態を保存
app.put("/api/board", (req, res) => {
  try {
    console.log("[PUT /api/board] Request received");
    const state = req.body as BoardState;

    // バリデーション
    if (!state || typeof state !== "object") {
      console.warn("[PUT /api/board] ✗ Validation error: state is not an object");
      return res.status(400).json({ error: "Board state must be an object" });
    }
    if (!Array.isArray(state.cards)) {
      console.warn("[PUT /api/board] ✗ Validation error: state.cards is not an array");
      return res.status(400).json({ error: "state.cards must be an array" });
    }
    if (typeof state.zoom !== "number" || typeof state.offsetX !== "number" || typeof state.offsetY !== "number") {
      console.warn("[PUT /api/board] ✗ Validation error: zoom/offsetX/offsetY must be numbers");
      return res.status(400).json({ error: "zoom, offsetX, offsetY must be numbers" });
    }

    saveBoardState(state);
    console.log(`[PUT /api/board] ✓ Successfully saved board (${state.cards.length} cards)`);
    res.json({ success: true });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`[PUT /api/board] ✗ Error: ${errorMsg}`);
    res.status(500).json({ error: errorMsg || "Failed to save board state" });
  }
});

app.use((err: any, req: any, res: any, next: any) => {
  console.error("[Unhandled Error]", err);
  res.status(500).json({ error: "Internal server error", details: err.message });
});

app.listen(PORT, () => {
  console.log(`✓ Server running on http://localhost:${PORT}`);
  console.log(`✓ CORS enabled for: ${process.env.CORS_ORIGIN || "http://localhost:5173"}`);
});
