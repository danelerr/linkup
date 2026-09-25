"use client";
import { MorphIcon } from "morphicons/react";
import {
  Bookmark,
  BookmarkCheck,
  Check,
  Send,
  SlidersHorizontal,
  X,
  Bell,
  BellRing,
} from "lucide";
const icons = {
  bookmark: Bookmark,
  saved: BookmarkCheck,
  check: Check,
  send: Send,
  filters: SlidersHorizontal,
  close: X,
  bell: Bell,
  alert: BellRing,
};
export function StateIcon({
  state,
  size = 18,
}: {
  state: keyof typeof icons;
  size?: number;
}) {
  return (
    <MorphIcon
      icon={icons[state]}
      size={size}
      strokeWidth={1.8}
      spring="snappy"
      reducedMotion="user"
      aria-hidden="true"
    />
  );
}
