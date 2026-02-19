/**
 * ツールバー（design.md 2-4）：ホームに戻る、カード追加、Undo/Redo、ズーム、テーマ
 */

import { Link } from "react-router-dom";
import { useBoardStore } from "@/store/boardStore";
import { canUndo, canRedo } from "@/lib/history";

const ZOOM_MIN = 0.25;
const ZOOM_MAX = 2;
const ZOOM_STEP = 0.25;

export function Toolbar() {
  const {
    addCard,
    undo,
    redo,
    present,
    setZoom,
    setOffset,
    theme,
    setTheme,
    past,
    future,
    lastSaveStatus,
    lastSaveError,
  } = useBoardStore();

  const zoom = present.zoom;
  const handleZoomIn = () =>
    setZoom(Math.min(ZOOM_MAX, zoom + ZOOM_STEP));
  const handleZoomOut = () =>
    setZoom(Math.max(ZOOM_MIN, zoom - ZOOM_STEP));
  const handleResetView = () => {
    setZoom(1);
    setOffset(0, 0);
  };

  return (
    <div
      className="toolbar"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 12px",
        background: "var(--toolbar-bg, #f5f5f5)",
        borderBottom: "1px solid var(--border, #ddd)",
        flexWrap: "wrap",
      }}
    >
      <Link
        to="/"
        style={{
          padding: "6px 12px",
          borderRadius: 6,
          background: "rgba(255, 255, 255, 0.94)",
          color: "var(--text)",
          textDecoration: "none",
          fontSize: "inherit",
          border: "1px solid var(--border)",
          transition: "background 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(255, 255, 255, 0.79)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(255, 255, 255, 0.74)";
        }}
        title="ホームに戻る"
      >
        ホームに戻る
      </Link>
      <span style={{ marginLeft: 8, color: "var(--text-muted)" }}>|</span>
      <button type="button" onClick={() => addCard()} title="カード追加 (Enter)">
        カード追加
      </button>
      <button
        type="button"
        onClick={() => undo()}
        disabled={!canUndo({ past })}
        title="元に戻す"
      >
        Undo
      </button>
      <button
        type="button"
        onClick={() => redo()}
        disabled={!canRedo({ future })}
        title="やり直し"
      >
        Redo
      </button>
      <span style={{ marginLeft: 8, color: "var(--text-muted)" }}>|</span>
      <button type="button" onClick={handleZoomOut} title="縮小">
        −
      </button>
      <span style={{ minWidth: 48, textAlign: "center" }}>
        {Math.round(zoom * 100)}%
      </span>
      <button type="button" onClick={handleZoomIn} title="拡大">
        +
      </button>
      <button type="button" onClick={handleResetView} title="表示をリセット">
        100%
      </button>
      <span style={{ marginLeft: 8, color: "var(--text-muted)" }}>|</span>
      <select
        value={theme}
        onChange={(e) =>
          setTheme(e.target.value as "light" | "dark" | "system")
        }
        title="テーマ"
      >
        <option value="light">ライト</option>
        <option value="dark">ダーク</option>
        <option value="system">システム</option>
      </select>
      <span style={{ marginLeft: "auto", color: "var(--text-muted)" }}>
        {lastSaveStatus === "saving" && "⏳ 保存中..."}
        {lastSaveStatus === "success" && (
          <span style={{ color: "green" }}>✓ 保存しました</span>
        )}
        {lastSaveStatus === "error" && (
          <span style={{ color: "red" }} title={lastSaveError || ""}>
            ✗ 保存失敗: {lastSaveError}
          </span>
        )}
      </span>
    </div>
  );
}
