import { Link } from "react-router-dom";

export function HomePage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        textAlign: "center",
        background: "var(--board-bg, #e0e0e0)",
        color: "var(--text)",
      }}
    >
      <h1 style={{ marginBottom: 16, fontSize: "1.75rem" }}>
        ボード型TODO
      </h1>
      <p style={{ marginBottom: 24, maxWidth: 360, lineHeight: 1.6 }}>
        アイデアメモやタスクを付箋のように自由に配置できるボードです。
        カードの追加・編集・ドラッグ、ズーム・パン、Undo/Redoに対応しています。
      </p>
      <Link
        to="/board"
        style={{
          display: "inline-block",
          padding: "12px 24px",
          background: "#1976d2",
          color: "#fff",
          borderRadius: 8,
          textDecoration: "none",
          fontWeight: "bold",
        }}
      >
        ボードを開く
      </Link>
    </div>
  );
}
