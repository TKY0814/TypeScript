import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

interface Card {
  id: string;
  title: string;
  detail: string;
  color: string;
  [key: string]: any;
}

interface BoardState {
  cards: Card[];
  zoom: number;
  offsetX: number;
  offsetY: number;
}

export function TestPage() {
  const [testResult, setTestResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [boardData, setBoardData] = useState<BoardState | null>(null);
  const [newCardTitle, setNewCardTitle] = useState("");
  const [newCardDetail, setNewCardDetail] = useState("");

  // ボードデータを読み込む
  const loadBoardData = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/board");
      if (!response.ok) throw new Error("Failed to load board");
      const data = await response.json();
      setBoardData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  };

  // 初期ロード
  useEffect(() => {
    loadBoardData();
  }, []);

  const handleTestConnection = async () => {
    setLoading(true);
    setError(null);
    setTestResult(null);

    try {
      const response = await fetch("http://localhost:3001/api/test");
      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      const data = await response.json();
      setTestResult(JSON.stringify(data, null, 2));
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // カード追加
  const handleAddCard = async () => {
    if (!newCardTitle.trim()) {
      setError("タイトルを入力してください");
      return;
    }

    if (!boardData) return;

    const newCard: Card = {
      id: `card-${Date.now()}`,
      title: newCardTitle,
      detail: newCardDetail,
      color: "#ffeb3b",
      x: 0,
      y: 0,
      width: 220,
      height: 140,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = {
      ...boardData,
      cards: [...boardData.cards, newCard],
    };

    try {
      const response = await fetch("http://localhost:3001/api/board", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });

      if (!response.ok) throw new Error("Failed to add card");

      setBoardData(updated);
      setNewCardTitle("");
      setNewCardDetail("");
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  };

  // カード削除
  const handleDeleteCard = async (cardId: string) => {
    if (!boardData) return;
    if (!window.confirm("このカードを削除しますか？")) return;

    const updated = {
      ...boardData,
      cards: boardData.cards.filter((c) => c.id !== cardId),
    };

    try {
      const response = await fetch("http://localhost:3001/api/board", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });

      if (!response.ok) throw new Error("Failed to delete card");

      setBoardData(updated);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        padding: 24,
        background: "var(--board-bg, #e0e0e0)",
        color: "var(--text)",
      }}
    >
      <header style={{ marginBottom: 24 }}>
        <Link
          to="/"
          style={{
            display: "inline-block",
            padding: "8px 16px",
            background: "#666",
            color: "#fff",
            borderRadius: 4,
            textDecoration: "none",
            marginBottom: 16,
          }}
        >
          ← ホームに戻る
        </Link>
        <h1>SQLite 接続テスト</h1>
      </header>

      <div
        style={{
          maxWidth: 900,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 24,
        }}
      >
        {/* 左側：接続確認 */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.9)",
            padding: 24,
            borderRadius: 8,
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          }}
        >
          <h2 style={{ marginBottom: 16, fontSize: "1.2rem" }}>
            SQLite 接続確認
          </h2>

          <button
            onClick={handleTestConnection}
            disabled={loading}
            style={{
              padding: "10px 20px",
              background: loading ? "#ccc" : "#1976d2",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "1rem",
              fontWeight: "bold",
              marginBottom: 24,
              width: "100%",
            }}
          >
            {loading ? "テスト中..." : "接続テストを実行"}
          </button>

          {testResult && (
            <div
              style={{
                background: "#e8f5e9",
                color: "#2e7d32",
                padding: 12,
                borderRadius: 4,
                marginBottom: 16,
                borderLeft: "4px solid #2e7d32",
              }}
            >
              <pre
                style={{
                  margin: 0,
                  padding: 8,
                  background: "#f5f5f5",
                  color: "#333",
                  borderRadius: 4,
                  overflowX: "auto",
                  fontSize: "0.8rem",
                }}
              >
                {testResult}
              </pre>
            </div>
          )}
        </div>

        {/* 右側：カード操作 */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.9)",
            padding: 24,
            borderRadius: 8,
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          }}
        >
          <h2 style={{ marginBottom: 16, fontSize: "1.2rem" }}>
            カード追加（CREATE）
          </h2>

          <input
            type="text"
            placeholder="タイトル"
            value={newCardTitle}
            onChange={(e) => setNewCardTitle(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px",
              marginBottom: 8,
              border: "1px solid #ddd",
              borderRadius: 4,
              boxSizing: "border-box",
            }}
          />

          <textarea
            placeholder="詳細（オプション）"
            value={newCardDetail}
            onChange={(e) => setNewCardDetail(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px",
              marginBottom: 12,
              border: "1px solid #ddd",
              borderRadius: 4,
              boxSizing: "border-box",
              minHeight: 60,
              fontFamily: "inherit",
            }}
          />

          <button
            onClick={handleAddCard}
            style={{
              padding: "10px 20px",
              background: "#4caf50",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
              fontSize: "1rem",
              fontWeight: "bold",
              width: "100%",
            }}
          >
            カードを追加
          </button>
        </div>
      </div>

      {/* エラー表示 */}
      {error && (
        <div
          style={{
            marginTop: 24,
            background: "#ffebee",
            color: "#c62828",
            padding: 16,
            borderRadius: 4,
            borderLeft: "4px solid #c62828",
          }}
        >
          <strong>⚠ エラー:</strong> {error}
        </div>
      )}

      {/* カード一覧（READ） */}
      {boardData && boardData.cards.length > 0 && (
        <div
          style={{
            marginTop: 24,
            background: "rgba(255, 255, 255, 0.9)",
            padding: 24,
            borderRadius: 8,
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          }}
        >
          <h2 style={{ marginBottom: 16, fontSize: "1.2rem" }}>
            カード一覧（READ / DELETE）
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
              gap: 16,
            }}
          >
            {boardData.cards.map((card) => (
              <div
                key={card.id}
                style={{
                  background: card.color || "#f5f5f5",
                  padding: 12,
                  borderRadius: 8,
                  border: "1px solid rgba(0,0,0,0.2)",
                }}
              >
                <h3 style={{ margin: "0 0 8px 0", fontSize: "0.95rem" }}>
                  {card.title || "（無題）"}
                </h3>
                <p
                  style={{
                    margin: "0 0 12px 0",
                    fontSize: "0.85rem",
                    color: "#666",
                    wordBreak: "break-word",
                  }}
                >
                  {card.detail}
                </p>
                <button
                  onClick={() => handleDeleteCard(card.id)}
                  style={{
                    padding: "6px 12px",
                    background: "#f44336",
                    color: "#fff",
                    border: "none",
                    borderRadius: 4,
                    cursor: "pointer",
                    fontSize: "0.85rem",
                    width: "100%",
                  }}
                >
                  削除
                </button>
              </div>
            ))}
          </div>

          <p style={{ marginTop: 16, fontSize: "0.9rem", color: "#666" }}>
            合計: {boardData.cards.length} 件
          </p>
        </div>
      )}

      {boardData && boardData.cards.length === 0 && (
        <div
          style={{
            marginTop: 24,
            background: "rgba(255, 255, 255, 0.9)",
            padding: 24,
            borderRadius: 8,
            textAlign: "center",
            color: "#999",
          }}
        >
          <p>カードはまだありません。上から追加してください。</p>
        </div>
      )}
    </div>
  );
}
