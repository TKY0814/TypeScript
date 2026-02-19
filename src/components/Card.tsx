/**
 * 1枚のカード表示とインライン編集（design.md 2-3）
 * クリックで選択、ダブルクリックで編集開始。dnd-kit の useDraggable でドラッグ可能。
 */

import { useRef, useEffect } from "react";
import { useDraggable } from "@dnd-kit/core";
import type { Card as CardType } from "@/types/board";
import { useBoardStore } from "@/store/boardStore";

type CardProps = {
  card: CardType;
};

export function Card({ card }: CardProps) {
  const {
    selectedCardId,
    editingCardId,
    setSelectedCard,
    setEditingCard,
    updateCard,
    deleteCard,
  } = useBoardStore();

  const isSelected = selectedCardId === card.id;
  const isEditing = editingCardId === card.id;
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const detailRef = useRef<HTMLTextAreaElement>(null);

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: card.id,
      data: { card },
    });

  useEffect(() => {
    if (isEditing && titleRef.current) titleRef.current.focus();
  }, [isEditing]);

  const style: React.CSSProperties = {
    position: "absolute",
    left: card.x,
    top: card.y,
    width: card.width,
    minHeight: card.height,
    backgroundColor: card.color,
    border: isSelected ? "2px solid #1976d2" : "1px solid rgba(0,0,0,0.2)",
    borderRadius: 8,
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
    padding: 10,
    cursor: isDragging ? "grabbing" : "grab",
    opacity: isDragging ? 0.6 : 1,
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    zIndex: isDragging ? 1000 : isSelected ? 10 : 1,
  };

  const handleDoubleClick = () => {
    setEditingCard(card.id);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedCard(card.id);
  };

  const handleTitleChange = (value: string) => {
    updateCard(card.id, { title: value });
  };

  const handleDetailChange = (value: string) => {
    updateCard(card.id, { detail: value });
  };

  // タイトル・詳細のどちらかからフォーカスが外れたとき、
  // まだカード内の別要素にフォーカスがあるなら編集モードを維持する
  const editAreaRef = useRef<HTMLDivElement>(null);
  const handleBlur = () => {
    setTimeout(() => {
      if (editAreaRef.current?.contains(document.activeElement)) return;
      setEditingCard(null);
    }, 0);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteCard(card.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent, field: "title" | "detail") => {
    if (e.key === "Delete" && !isEditing) {
      deleteCard(card.id);
      return;
    }
    if (e.key === "Enter" && !e.shiftKey && field === "title") {
      e.preventDefault();
      detailRef.current?.focus();
    }
  };

  return (
    <div
      ref={setNodeRef}
      data-draggable
      style={style}
      {...(!isEditing ? listeners : {})}
      {...attributes}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => handleKeyDown(e, "title")}
    >
      {/* 編集中はドラッグをハンドルのみに限定（テキスト選択と競合しない） */}
      {isEditing && (
        <div style={{ cursor: "grab", marginBottom: 4, fontSize: 14 }} {...listeners}>
          ⋮⋮
        </div>
      )}
      {isEditing ? (
        <div ref={editAreaRef} onBlur={handleBlur}>
          <textarea
            ref={titleRef}
            value={card.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") handleBlur();
            }}
            placeholder="タイトル"
            style={{
              width: "100%",
              minHeight: 28,
              resize: "none",
              border: "none",
              background: "transparent",
              fontSize: "1rem",
              fontWeight: "bold",
            }}
            onClick={(e) => e.stopPropagation()}
          />
          <textarea
            ref={detailRef}
            value={card.detail}
            onChange={(e) => handleDetailChange(e.target.value)}
            placeholder="詳細"
            style={{
              width: "100%",
              minHeight: 60,
              resize: "none",
              border: "none",
              background: "transparent",
              fontSize: "0.9rem",
              marginTop: 4,
            }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      ) : (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <span style={{ fontWeight: "bold", flex: 1, wordBreak: "break-word" }}>
              {card.title || "無題"}
            </span>
            <button
              type="button"
              onClick={handleDelete}
              title="削除"
              style={{
                border: "none",
                background: "rgba(0,0,0,0.1)",
                borderRadius: 4,
                cursor: "pointer",
                padding: "2px 6px",
                fontSize: 12,
              }}
              aria-label="削除"
            >
              🗑
            </button>
          </div>
          {card.detail && (
            <div style={{ marginTop: 4, fontSize: "0.9rem", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
              {card.detail}
            </div>
          )}
        </>
      )}
    </div>
  );
}
