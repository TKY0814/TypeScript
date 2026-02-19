-- ボード状態を保存するテーブル
-- 要件定義: 1ユーザー1ボード（当面）
CREATE TABLE IF NOT EXISTS boards (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL UNIQUE, -- 将来的にユーザー管理に対応（今は固定値でも可）
  board_state JSONB NOT NULL DEFAULT '{"cards": [], "zoom": 1, "offsetX": 0, "offsetY": 0}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- updated_at を自動更新するトリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_boards_updated_at
  BEFORE UPDATE ON boards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- インデックス（user_id で検索するため）
CREATE INDEX IF NOT EXISTS idx_boards_user_id ON boards(user_id);
