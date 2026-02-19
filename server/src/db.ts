/**
 * SQLite 接続管理
 */

import Database from "better-sqlite3";

const dbPath = process.env.DATABASE_URL || "./board_todo.db";

let db: Database.Database;

try {
  db = new Database(dbPath);
  console.log(`✓ Connected to SQLite: ${dbPath}`);

  // WALモードを有効化（パフォーマンス向上）
  db.pragma("journal_mode = WAL");

  // テーブル初期化
  db.exec(`
    CREATE TABLE IF NOT EXISTS boards (
      user_id TEXT PRIMARY KEY,
      board_state TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log("✓ Database tables initialized");
} catch (error) {
  const errorMsg = error instanceof Error ? error.message : String(error);
  console.error(`✗ Database initialization failed: ${errorMsg}`);
  process.exit(1);
}

export { db };
