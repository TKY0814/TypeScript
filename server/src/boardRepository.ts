/**
 * ボード状態の永続化（SQLite）
 */

import { db } from "./db.js";
import type { BoardState } from "./types.js";

const DEFAULT_USER_ID = "default"; // 要件定義: 1ユーザー1ボード（当面は固定）

/**
 * ボード状態を取得
 */
export function getBoardState(): BoardState | null {
  try {
    const stmt = db.prepare("SELECT board_state FROM boards WHERE user_id = ?");
    const row = stmt.get(DEFAULT_USER_ID) as { board_state: string } | undefined;

    if (!row) {
      console.log("  [getBoardState] No board found for user, returning null");
      return null;
    }

    const parsed = JSON.parse(row.board_state) as BoardState;
    console.log(`  [getBoardState] ✓ Loaded board (${parsed.cards.length} cards)`);
    return parsed;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`  [getBoardState] ✗ Error: ${errorMsg}`);
    throw new Error(`Failed to get board state: ${errorMsg}`);
  }
}

/**
 * ボード状態を保存（UPSERT）
 */
export function saveBoardState(state: BoardState): void {
  try {
    if (!state || typeof state !== "object" || !Array.isArray(state.cards)) {
      throw new Error("Invalid board state structure");
    }

    const stmt = db.prepare(`
      INSERT INTO boards (user_id, board_state, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(user_id)
      DO UPDATE SET board_state = ?, updated_at = CURRENT_TIMESTAMP
    `);

    stmt.run(DEFAULT_USER_ID, JSON.stringify(state), JSON.stringify(state));
    console.log(`  [saveBoardState] ✓ Saved board (${state.cards.length} cards)`);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`  [saveBoardState] ✗ Error: ${errorMsg}`);
    throw new Error(`Failed to save board state: ${errorMsg}`);
  }
}
