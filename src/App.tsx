import { Routes, Route, useLocation } from "react-router-dom";
import { HomePage } from "@/pages/HomePage";
import { BoardPage } from "@/pages/BoardPage";
import { useBoardStore } from "@/store/boardStore";
import { useEffect } from "react";

function useKeyboardShortcuts() {
  const location = useLocation();
  const addCard = useBoardStore((s) => s.addCard);
  const deleteCard = useBoardStore((s) => s.deleteCard);
  const selectedCardId = useBoardStore((s) => s.selectedCardId);

  useEffect(() => {
    if (location.pathname !== "/board") return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const target = e.target as HTMLElement;
        if (target.tagName === "TEXTAREA" || target.tagName === "INPUT") return;
        e.preventDefault();
        addCard();
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        const target = e.target as HTMLElement;
        if (target.tagName === "TEXTAREA" || target.tagName === "INPUT") return;
        if (selectedCardId) {
          e.preventDefault();
          deleteCard(selectedCardId);
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [location.pathname, addCard, deleteCard, selectedCardId]);
}

export default function App() {
  useKeyboardShortcuts();
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/board" element={<BoardPage />} />
    </Routes>
  );
}
