/**
 * Express サーバー（TypeScript）
 * GET /api/board - ボード状態を取得
 * PUT /api/board - ボード状態を保存
 */

import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_FILE = path.join(__dirname, "..", "board_state.json");

// CORS 設定：開発環境では全許可
app.use(
  cors({
    origin: (origin, callback) => {
      // ローカル開発中は全許可
      callback(null, true);
    },
    credentials: true,
  })
);
app.use(express.json());

// リクエストログ
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  if (req.method === "PUT" || req.method === "POST") {
    console.log("  Body:", JSON.stringify(req.body).substring(0, 200));
  }
  next();
});

interface BoardState {
  cards: Array<{ id: string; [key: string]: any }>;
  zoom: number;
  offsetX: number;
  offsetY: number;
}

// JSONファイルからボード状態を読み込む
function loadBoardState(): BoardState | null {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, "utf-8");
      const state: BoardState = JSON.parse(data);
      console.log(`  [loadBoardState] ✓ Loaded board (${state.cards.length} cards)`);
      return state;
    }
    console.log("  [loadBoardState] No board file found");
    return null;
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`  [loadBoardState] ✗ Error: ${msg}`);
    throw new Error(`Failed to load board state: ${msg}`);
  }
}

// JSONファイルにボード状態を保存
function saveBoardState(state: BoardState): void {
  try {
    if (!state || typeof state !== "object" || !Array.isArray(state.cards)) {
      throw new Error("Invalid board state structure");
    }

    fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2), "utf-8");
    console.log(`  [saveBoardState] ✓ Saved board (${state.cards.length} cards)`);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`  [saveBoardState] ✗ Error: ${msg}`);
    throw new Error(`Failed to save board state: ${msg}`);
  }
}

// GET /api/board
app.get("/api/board", (req, res) => {
  try {
    console.log("[GET /api/board] Request received");
    const state = loadBoardState();
    if (!state) {
      console.log("[GET /api/board] Returning empty state");
      return res.json({
        cards: [],
        zoom: 1,
        offsetX: 0,
        offsetY: 0,
      } as BoardState);
    }
    console.log("[GET /api/board] ✓ Returned board state");
    res.json(state);
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error(`[GET /api/board] ✗ Error: ${msg}`);
    res.status(500).json({ error: msg });
  }
});

// PUT /api/board
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
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error(`[PUT /api/board] ✗ Error: ${msg}`);
    res.status(500).json({ error: msg });
  }
});

// エラーハンドラー
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("[Unhandled Error]", err);
  res.status(500).json({ error: "Internal server error", details: err.message });
});

app.listen(PORT, () => {
  console.log(`✓ Server running on http://localhost:${PORT}`);
  console.log(`✓ CORS: allow all origins (development mode)`);
  console.log(`✓ Data file: ${DATA_FILE}`);
});
