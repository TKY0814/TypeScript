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
- SQLite（better-sqlite3）

## セットアップ・起動

### 1. SQLite（自動初期化）

SQLiteは初回起動時に自動的に `server/board.db` ファイルを作成します。
- `cards` テーブル：カード情報
- `board_config` テーブル：ボード設定（ズーム・オフセット）

### 2. バックエンドサーバーの起動

```bash
cd server
npm install
npm run dev
```

サーバーは `http://localhost:3001` で起動します。

### 3. フロントエンドの起動

```bash
# プロジェクトルートで
npm install
npm run dev
```

フロントエンドはViteが割り当てたポートで起動します。コンソールにURLが表示されます。

## 実装内容

### API エンドポイント
- `GET /api/board` … ボード状態取得（カード一覧・ズーム・オフセット）
- `PUT /api/board` … ボード状態保存
- `GET /api/test` … SQLite接続テスト（ステータス確認用）

### CORS設定
開発環境ではすべてのオリジンを許可しています。`localhost` の任意のポートからのリクエストを受け入れます。

### ファイル構成
- **ストア** `src/store/boardStore.ts` … StoreState（履歴・UI・永続化）
- **履歴** `src/lib/history.ts` … Undo/Redo 用純粋関数（テスト用に分離）
- **BoardState 更新** `src/lib/boardState.ts` … カード追加・更新・移動・削除の不変更新
- **DnD 座標** `src/lib/dnd.ts` … ドラッグ終了時の新位置計算（zoom 考慮）
- **コンポーネント**
  - `BoardPage` … Toolbar + Board、テーマ・永続化の初期化
  - `Toolbar` … カード追加 / Undo / Redo / ズーム / テーマ
  - `Board` … DndContext、パン・ズーム、ボード上ダブルクリックでカード追加
  - `Card` … ドラッグ、インライン編集、削除ボタン
  - `TestPage` … SQLite接続テスト、簡易CRUD操作（テスト用）

## 操作

- **カード追加**: ツールバー「カード追加」またはボード上ダブルクリック / Enter
- **編集**: カードをダブルクリック
- **削除**: カードのゴミ箱アイコンまたは選択中に Delete
- **ドラッグ**: カードをドラッグして位置変更
- **パン**: ボードの空白部分をドラッグ
- **ズーム**: ツールバーの − / + / 100%
- **永続化**: 操作のたびに PostgreSQL（API経由）に自動保存
