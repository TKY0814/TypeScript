import type { Card, Priority } from "@/types/board";

const DEFAULT_COLORS = ["#ffeb3b", "#c8e6c9", "#bbdefb", "#f8bbd0"];
let colorIndex = 0;

export function createCard(partial?: Partial<Card>): Card {
  const now = new Date().toISOString();
  const id =
    partial?.id ?? `card-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  return {
    id,
    title: partial?.title ?? "",
    detail: partial?.detail ?? "",
    color: partial?.color ?? DEFAULT_COLORS[colorIndex++ % DEFAULT_COLORS.length],
    priority: (partial?.priority ?? "medium") as Priority,
    x: partial?.x ?? 0,
    y: partial?.y ?? 0,
    width: partial?.width ?? 220,
    height: partial?.height ?? 140,
    createdAt: partial?.createdAt ?? now,
    updatedAt: partial?.updatedAt ?? now,
  };
}
