/**
 * ズーム・パンを反映したボード領域。cards を map して Card を絶対配置。
 * dnd-kit の DndContext を設置し、onDragEnd で moveCard を呼ぶ。
 * ボード上ダブルクリックで空カード追加（要件定義 4）
 */

import { useCallback, useRef, useState } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { useBoardStore } from "@/store/boardStore";
import { getNewPositionAfterDrag } from "@/lib/dnd";
import { Card } from "./Card";

export function Board() {
  const {
    present,
    moveCard,
    addCard,
    setOffset,
    setSelectedCard,
  } = useBoardStore();
  const { cards, zoom, offsetX, offsetY } = present;

  const boardRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0, offsetX: 0, offsetY: 0 });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, delta } = event;
      const id = active.id as string;
      const card = cards.find((c) => c.id === id);
      if (!card) return;
      const { x, y } = getNewPositionAfterDrag(
        card.x,
        card.y,
        delta.x,
        delta.y,
        zoom
      );
      moveCard(id, x, y);
    },
    [cards, zoom, moveCard]
  );

  const handleBoardClick = () => setSelectedCard(null);

  const handleBoardDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const x = (e.clientX - rect.left - offsetX) / zoom - 110;
    const y = (e.clientY - rect.top - offsetY) / zoom - 70;
    addCard({ x: Math.max(0, x), y: Math.max(0, y) });
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).closest("[data-draggable]")) return;
    setIsPanning(true);
    setPanStart({ x: e.clientX, y: e.clientY, offsetX, offsetY });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isPanning) return;
    setOffset(
      panStart.offsetX + (e.clientX - panStart.x),
      panStart.offsetY + (e.clientY - panStart.y)
    );
  };

  const handlePointerUp = () => setIsPanning(false);

  return (
    <DndContext
      sensors={sensors}
      onDragEnd={handleDragEnd}
    >
      <div
        ref={boardRef}
        className="board"
        style={{
          flex: 1,
          overflow: "hidden",
          position: "relative",
          cursor: isPanning ? "grabbing" : "default",
          background: "var(--board-bg, #e0e0e0)",
        }}
        onClick={handleBoardClick}
        onDoubleClick={handleBoardDoubleClick}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            transform: `translate(${offsetX}px, ${offsetY}px) scale(${zoom})`,
            transformOrigin: "0 0",
            width: "100%",
            height: "100%",
            minWidth: "200%",
            minHeight: "200%",
          }}
        >
          {cards.map((card) => (
            <Card key={card.id} card={card} />
          ))}
        </div>
      </div>
    </DndContext>
  );
}
