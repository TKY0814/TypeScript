/**
 * ボード状態の永続化（PostgreSQL）
 */

import { pool } from "./db.js";
import type { BoardState } from "./types.js";

const DEFAULT_USER_ID = "default"; // 要件定義: 1ユーザー1ボード（当面は固定）

/**
 * ボード状態を取得
 */
export async function getBoardState(): Promise<BoardState | null> {
  const result = await pool.query<{ board_state: BoardState }>(
    "SELECT board_state FROM boards WHERE user_id = $1",
    [DEFAULT_USER_ID]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0].board_state;
}

/**
 * ボード状態を保存（UPSERT）
 */
export async function saveBoardState(state: BoardState): Promise<void> {
  await pool.query(
    `INSERT INTO boards (user_id, board_state)
     VALUES ($1, $2::jsonb)
     ON CONFLICT (user_id)
     DO UPDATE SET board_state = $2::jsonb`,
    [DEFAULT_USER_ID, JSON.stringify(state)]
  );
}
