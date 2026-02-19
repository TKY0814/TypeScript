/**
 * ボード画面全体のコンテナ（design.md 2-1）
 * Toolbar と Board をレイアウト。テーマに応じて CSS 変数を切り替え。
 */

import { useEffect } from "react";
import { Toolbar } from "@/components/Toolbar";
import { Board } from "@/components/Board";
import { useBoardStore } from "@/store/boardStore";

function useThemeEffect() {
  const theme = useBoardStore((s) => s.theme);
  useEffect(() => {
    const root = document.documentElement;
    let effective: "light" | "dark" = "light";
    if (theme === "dark") effective = "dark";
    if (theme === "system") {
      effective = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    root.setAttribute("data-theme", effective);
  }, [theme]);
}

export function BoardPage() {
  const loadFromStorage = useBoardStore((s) => s.loadFromStorage);
  useThemeEffect();

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  return (
    <div
      className="board-page"
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100%",
      }}
    >
      <Toolbar />
      <Board />
    </div>
  );
}
