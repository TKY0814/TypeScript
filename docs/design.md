# ボード型TODOアプリ 設計メモ（design.md）

## 1. ドメインモデル設計（型レベル）

### 1-1. 基本型

```ts
export type CardId = string;

export type Priority = "low" | "medium" | "high";
1-2. Card 型（付箋）
ts
export type Card = {
  id: CardId;
  title: string;
  detail: string;
  color: string;      // 例: "#ffcc00" など
  priority: Priority;
  x: number;          // ボード上の位置（px）
  y: number;
  width: number;      // カードサイズ（可変）
  height: number;
  createdAt: string;  // ISO文字列
  updatedAt: string;
};
1-3. BoardState（ボードの状態）
ts
export type BoardState = {
  cards: Card[];
  zoom: number;       // 1.0 が等倍
  offsetX: number;    // パン位置（px）
  offsetY: number;
};
1-4. UiState（UIの一時状態）
ts
export type UiState = {
  selectedCardId: CardId | null;
  editingCardId: CardId | null;
  theme: "light" | "dark" | "system";
};
1-5. HistoryState（Undo/Redo用）
ts
export type HistoryState = {
  past: BoardState[];    // 古い順に状態を積む
  present: BoardState;   // 現在の状態
  future: BoardState[];  // Undo後にRedo可能な状態
};
1-6. Zustand ストアの全体像（ドラフト）
ts
export type StoreState = HistoryState &
  UiState & {
    // カード操作
    addCard: (partial?: Partial<Card>) => void;
    updateCard: (id: CardId, patch: Partial<Card>) => void;
    moveCard: (id: CardId, x: number, y: number) => void;
    deleteCard: (id: CardId) => void;

    // ボード操作
    setZoom: (zoom: number) => void;
    setOffset: (x: number, y: number) => void;

    // 履歴操作
    undo: () => void;
    redo: () => void;

    // 永続化
    loadFromStorage: () => void;
    saveToStorage: () => void;

    // UI操作
    setTheme: (theme: UiState["theme"]) => void;
    setSelectedCard: (id: CardId | null) => void;
    setEditingCard: (id: CardId | null) => void;
  };
2. 画面構成・コンポーネント設計
2-1. ページ構成
BoardPage

役割：

ボード画面全体のコンテナ

Toolbar と Board をレイアウト

将来的にルーティングの /board ページ相当になる想定

tsx
// pages/BoardPage.tsx（イメージ）
export const BoardPage = () => {
  return (
    <div className="board-page">
      <Toolbar />
      <Board />
    </div>
  );
};
2-2. Board コンポーネント（カンバン風ボード）
役割：

ズーム・パンを反映したボード領域の描画

cards を map して Card コンポーネントを絶対配置

dnd-kit のコンテキスト（DndContext 等）を持つ

tsx
// components/Board.tsx（イメージ）
export const Board = () => {
  // store から cards, zoom, offsetX, offsetY を取得
  // dnd-kit の DndContext / useDroppable などを使用

  return (
    <div className="board">
      {/* ボード上に Card を position: absolute で配置 */}
    </div>
  );
};
2-3. Card コンポーネント（付箋）
役割：

1つのカードの表示とインライン編集

dnd-kit のドラッグ対象

クリックで選択、ダブルクリックで編集開始など

tsx
// components/Card.tsx（イメージ）
type CardProps = {
  card: Card;
};

export const CardComponent = ({ card }: CardProps) => {
  // dnd-kit の useDraggable などを利用
  return (
    <div
      style={{
        position: "absolute",
        left: card.x,
        top: card.y,
        width: card.width,
        height: card.height,
        backgroundColor: card.color,
      }}
    >
      {/* タイトル・詳細のインライン編集 UI を配置 */}
    </div>
  );
};
2-4. Toolbar コンポーネント（ツールバー）
役割：

カード追加ボタン

Undo / Redo ボタン

ズームイン／ズームアウト

テーマ切り替え など

tsx
// components/Toolbar.tsx（イメージ）
export const Toolbar = () => {
  const addCard = useBoardStore((s) => s.addCard);
  const undo = useBoardStore((s) => s.undo);
  const redo = useBoardStore((s) => s.redo);
  const setZoom = useBoardStore((s) => s.setZoom);

  return (
    <div className="toolbar">
      <button onClick={() => addCard()}>カード追加</button>
      <button onClick={() => undo()}>Undo</button>
      <button onClick={() => redo()}>Redo</button>
      {/* ズームボタンやテーマ切り替えなど */}
    </div>
  );
};
3. 実装方針メモ（Cursor 向け指示用）
状態管理：

Zustand を使用し、上記 StoreState 型に沿ってストアを実装する。

Undo/Redo は past/present/future を用いた典型的な履歴管理で実装する。

DnD：

dnd-kit を使用し、カードのドラッグ終了時（onDragEnd）に moveCard(cardId, newX, newY) を呼び出す。

永続化：

saveToStorage / loadFromStorage でローカルストレージへ present の BoardState を保存・復元する。

レイアウト：

ボード上のカードは position: absolute で配置し、zoom と offsetX/offsetY を transform で反映する。