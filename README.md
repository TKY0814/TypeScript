# ボード型TODOアプリ（フロントエンド）

要件定義（要件定義.md）・設計（design.md）に基づく MVP 実装です。

## 技術スタック

- React 18 + TypeScript
- Zustand（状態管理）
- @dnd-kit（ドラッグ＆ドロップ）
- Vite

## セットアップ・起動
Node.js が未インストールの場合は、公式サイトから LTS 版をインストールしてください：
https://nodejs.org/

```bash
npm install
npm run dev
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
- **永続化**: 操作のたびに localStorage に自動保存
