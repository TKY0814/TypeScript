# ボード型TODOアプリ

要件定義（要件定義.md）・設計（design.md）に基づく MVP 実装です。

## 技術スタック

### フロントエンド
- React 18 + TypeScript
- Zustand（状態管理）
- @dnd-kit（ドラッグ＆ドロップ）
- Vite
- react-router-dom

### バックエンド
- Node.js + TypeScript
- Express
- PostgreSQL

## セットアップ・起動

### 1. PostgreSQL のセットアップ

PostgreSQL をインストールし、データベースを作成します：

```bash
# PostgreSQL に接続
psql -U postgres

# データベース作成
CREATE DATABASE board_todo_db;

# マイグレーション実行
\c board_todo_db
\i server/migrations/001_create_boards.sql
```

### 2. バックエンドサーバーの起動

```bash
cd server
npm install

# .env ファイルを作成（.env.example をコピー）
cp .env.example .env
# .env を編集して DATABASE_URL を設定

npm run dev
```

サーバーは `http://localhost:3001` で起動します。

### 3. フロントエンドの起動

```bash
# プロジェクトルートで
npm install
npm run dev
```

フロントエンドは `http://localhost:5173` で起動します。

### 環境変数

**server/.env**
```
DATABASE_URL=postgres://user:password@localhost:5432/board_todo_db
PORT=3001
CORS_ORIGIN=http://localhost:5173
```

**フロントエンド（.env.local または vite.config.ts）**
```
VITE_API_URL=http://localhost:3001
```

## 実装内容

- **ストア** `src/store/boardStore.ts` … StoreState（履歴・UI・永続化）
- **履歴** `src/lib/history.ts` … Undo/Redo 用純粋関数（テスト用に分離）
- **BoardState 更新** `src/lib/boardState.ts` … カード追加・更新・移動・削除の不変更新
- **DnD 座標** `src/lib/dnd.ts` … ドラッグ終了時の新位置計算（zoom 考慮）
- **コンポーネント**
  - `BoardPage` … Toolbar + Board、テーマ・永続化の初期化
  - `Toolbar` … カード追加 / Undo / Redo / ズーム / テーマ
  - `Board` … DndContext、パン・ズーム、ボード上ダブルクリックでカード追加
  - `Card` … ドラッグ、インライン編集、削除ボタン

## 操作

- **カード追加**: ツールバー「カード追加」またはボード上ダブルクリック / Enter
- **編集**: カードをダブルクリック
- **削除**: カードのゴミ箱アイコンまたは選択中に Delete
- **ドラッグ**: カードをドラッグして位置変更
- **パン**: ボードの空白部分をドラッグ
- **ズーム**: ツールバーの − / + / 100%
- **永続化**: 操作のたびに PostgreSQL（API経由）に自動保存
