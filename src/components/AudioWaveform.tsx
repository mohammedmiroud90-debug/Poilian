"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function AudioWaveform({
  levels,
  playing,
  compact = false,
  progress = 0,
  onSeek,
}: {
  levels?: number[];
  playing: boolean;
  compact?: boolean;
  progress?: number;
  onSeek?: (ratio: number) => void;
}) {
  const track = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [dragRatio, setDragRatio] = useState<number | null>(null);
  const count = compact ? 16 : 42;

  const ratioFromEvent = useCallback((clientX: number) => {
    const el = track.current;
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    return Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
  }, []);

  useEffect(() => {
    if (!dragging || !onSeek) return;
    const seek = onSeek;
    function onMove(event: PointerEvent) {
      const ratio = ratioFromEvent(event.clientX);
      setDragRatio(ratio);
      seek(ratio);
    }
    function onUp() {
      setDragging(false);
      setDragRatio(null);
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [dragging, onSeek, ratioFromEvent]);

  const activeProgress = dragRatio ?? progress;

  const bars = Array.from({ length: count }, (_, index) => {
    const sample = levels?.[index % (levels.length || 1)] ?? (playing ? 0.22 : 0.14);
    const idle = 0.12 + (index % 5) * 0.03;
    const value = Math.min(1, Math.max(idle, playing ? sample : idle * 0.85));
    const played = index / count <= activeProgress;
    return { value, played, index };
  });

  return (
    <div
      ref={track}
      className={`audio-waveform${compact ? " is-compact" : ""}${playing ? " is-playing" : ""}${dragging ? " is-dragging" : ""}`}
      role={onSeek ? "slider" : "img"}
      aria-label={onSeek ? "Audio progress" : "Audio waveform"}
      aria-valuemin={onSeek ? 0 : undefined}
      aria-valuemax={onSeek ? 100 : undefined}
      aria-valuenow={onSeek ? Math.round(activeProgress * 100) : undefined}
      onPointerDown={(event) => {
        if (!onSeek) return;
        event.preventDefault();
        const ratio = ratioFromEvent(event.clientX);
        setDragging(true);
        setDragRatio(ratio);
        onSeek(ratio);
      }}
    >
      {bars.map((bar) => (
        <i
          key={bar.index}
          className={bar.played ? "is-played" : ""}
          style={{ height: `${18 + bar.value * 82}%` }}
        />
      ))}
    </div>
  );
}

export function simulatedLevels(timeMs: number, count = 42) {
  return Array.from({ length: count }, (_, index) => {
    const wave = Math.sin(timeMs / 140 + index * 0.38) * 0.5 + 0.5;
    const pulse = Math.sin(timeMs / 90 + index * 0.9) * 0.5 + 0.5;
    return 0.18 + wave * 0.55 + pulse * 0.25;
  });
}
