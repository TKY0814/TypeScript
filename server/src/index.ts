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
app.get("/api/board", async (req, res) => {
  try {
    const state = await getBoardState();
    if (!state) {
      // 初回アクセス時は空の状態を返す
      return res.json({
        cards: [],
        zoom: 1,
        offsetX: 0,
        offsetY: 0,
      } satisfies BoardState);
    }
    res.json(state);
  } catch (error) {
    console.error("Error fetching board state:", error);
    res.status(500).json({ error: "Failed to fetch board state" });
  }
});

// PUT /api/board - ボード状態を保存
app.put("/api/board", async (req, res) => {
  try {
    const state = req.body as BoardState;
    // 簡易バリデーション
    if (!state || typeof state !== "object" || !Array.isArray(state.cards)) {
      return res.status(400).json({ error: "Invalid board state" });
    }
    await saveBoardState(state);
    res.json({ success: true });
  } catch (error) {
    console.error("Error saving board state:", error);
    res.status(500).json({ error: "Failed to save board state" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
