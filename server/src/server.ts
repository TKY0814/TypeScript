/**
 * Express サーバー（TypeScript + SQLite）
 * GET /api/board - ボード状態を取得
 * PUT /api/board - ボード状態を保存
 * GET /api/test - SQLite接続テスト
 */

import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 3001;
const DB_PATH = path.join(__dirname, "..", "board.db");

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

// SQLiteデータベース接続
let db: Database.Database;

function initializeDatabase(): void {
  try {
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    console.log(`[SQLite] ✓ Connected to ${DB_PATH}`);

    // cardsテーブルを作成
    db.exec(`
      CREATE TABLE IF NOT EXISTS cards (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        detail TEXT,
        color TEXT,
        x INTEGER DEFAULT 0,
        y INTEGER DEFAULT 0,
        width INTEGER DEFAULT 220,
        height INTEGER DEFAULT 140,
        createdAt TEXT,
        updatedAt TEXT
      );

      CREATE TABLE IF NOT EXISTS board_config (
        id TEXT PRIMARY KEY,
        zoom REAL DEFAULT 1.0,
        offsetX REAL DEFAULT 0,
        offsetY REAL DEFAULT 0,
        updatedAt TEXT
      );
    `);

    // board_configの初期データを確保
    const config = db.prepare("SELECT * FROM board_config WHERE id = 'default'").get();
    if (!config) {
      db.prepare(`
        INSERT INTO board_config (id, zoom, offsetX, offsetY, updatedAt)
        VALUES ('default', 1.0, 0, 0, ?)
      `).run(new Date().toISOString());
    }

    console.log("[SQLite] ✓ Database initialized");
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`[SQLite] ✗ Initialization failed: ${msg}`);
    throw error;
  }
}

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

// SQLiteからボード状態を読み込む
function loadBoardState(): BoardState {
  try {
    const cards = db.prepare("SELECT * FROM cards").all() as Array<any>;
    const config = db.prepare("SELECT * FROM board_config WHERE id = 'default'").get() as any;

    return {
      cards,
      zoom: config?.zoom || 1,
      offsetX: config?.offsetX || 0,
      offsetY: config?.offsetY || 0,
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`[loadBoardState] ✗ Error: ${msg}`);
    throw new Error(`Failed to load board state: ${msg}`);
  }
}

// SQLiteにボード状態を保存
function saveBoardState(state: BoardState): void {
  try {
    // トランザクション開始
    const transaction = db.transaction(() => {
      // 既存カードを削除
      db.prepare("DELETE FROM cards").run();

      // 新しいカードを挿入
      const insert = db.prepare(`
        INSERT INTO cards (id, title, detail, color, x, y, width, height, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const card of state.cards) {
        insert.run(
          card.id,
          card.title,
          card.detail || null,
          card.color || "#ffeb3b",
          card.x || 0,
          card.y || 0,
          card.width || 220,
          card.height || 140,
          card.createdAt,
          card.updatedAt
        );
      }

      // configを更新
      db.prepare(`
        UPDATE board_config
        SET zoom = ?, offsetX = ?, offsetY = ?, updatedAt = ?
        WHERE id = 'default'
      `).run(state.zoom, state.offsetX, state.offsetY, new Date().toISOString());
    });

    transaction();
    console.log(`[saveBoardState] ✓ Saved board (${state.cards.length} cards)`);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`[saveBoardState] ✗ Error: ${msg}`);
    throw new Error(`Failed to save board state: ${msg}`);
  }
}

// GET /api/test - SQLite接続テスト
app.get("/api/test", (req, res) => {
  try {
    console.log("[GET /api/test] SQLite connection test request");
    
    // SQLiteに簡単なクエリを実行
    const testResult = db.prepare("SELECT COUNT(*) as count FROM cards").get() as any;
    const boardConfig = db.prepare("SELECT * FROM board_config WHERE id = 'default'").get();
    const uptime = process.uptime();

    const response = {
      status: "ok",
      timestamp: new Date().toISOString(),
      server: {
        running: true,
        uptime: `${Math.floor(uptime)}s`,
        nodeVersion: process.version,
      },
      database: {
        type: "SQLite",
        file: DB_PATH,
        connected: true,
        version: db.prepare("SELECT sqlite_version()").get() as any,
        tables: {
          cards: testResult?.count || 0,
          config: boardConfig ? "ok" : "missing",
        },
      },
    };

    console.log("[GET /api/test] ✓ Connection test passed");
    res.json(response);
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error(`[GET /api/test] ✗ Error: ${msg}`);
    res.status(500).json({ status: "error", message: msg });
  }
});

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

// サーバー起動
initializeDatabase();

app.listen(PORT, () => {
  console.log(`✓ Server running on http://localhost:${PORT}`);
  console.log(`✓ CORS: allow all origins (development mode)`);
  console.log(`✓ SQLite database: ${DB_PATH}`);
});
