"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AudioWaveform, simulatedLevels } from "@/components/AudioWaveform";

export const POST_AUDIO_TOGGLE = "poilian-post-audio-toggle";
export const POST_AUDIO_STATE = "poilian-post-audio-state";
export const POST_AUDIO_LEVELS = "poilian-post-audio-levels";

export function togglePostAudio() {
  window.dispatchEvent(new Event(POST_AUDIO_TOGGLE));
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const rest = Math.floor(seconds % 60);
  return `${minutes}:${String(rest).padStart(2, "0")}`;
}

function emitState(playing: boolean) {
  window.dispatchEvent(new CustomEvent(POST_AUDIO_STATE, { detail: { playing } }));
}

function emitLevels(levels: number[]) {
  window.dispatchEvent(new CustomEvent(POST_AUDIO_LEVELS, { detail: { levels } }));
}

export function PostListen({ src, title }: { src: string; title: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const frame = useRef(0);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [notice, setNotice] = useState("");
  const [levels, setLevels] = useState<number[]>(() => simulatedLevels(0, 42).map((value) => value * 0.35));
  const source = src.trim();

  const setPlayback = useCallback((next: boolean) => {
    setPlaying(next);
    emitState(next);
  }, []);

  const playPause = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !source) {
      setNotice("No audio file is attached to this post.");
      setPlayback(false);
      return;
    }

    if (!audio.paused) {
      audio.pause();
      setPlayback(false);
      return;
    }

    setNotice("");
    if (audio.error) {
      const currentSrc = audio.getAttribute("src") || source;
      audio.removeAttribute("src");
      audio.load();
      audio.src = currentSrc;
      audio.load();
    }

    try {
      await audio.play();
      setPlayback(true);
    } catch {
      setNotice("Tap play again or check that the audio file URL is valid.");
      setPlayback(false);
    }
  }, [source, setPlayback]);

  useEffect(() => {
    const onToggle = () => {
      void playPause();
      audioRef.current?.closest(".post-listen")?.scrollIntoView({ behavior: "smooth", block: "center" });
    };
    window.addEventListener(POST_AUDIO_TOGGLE, onToggle);
    return () => {
      window.removeEventListener(POST_AUDIO_TOGGLE, onToggle);
      const audio = audioRef.current;
      if (audio) {
        audio.pause();
        audio.removeAttribute("src");
        audio.load();
      }
      emitState(false);
    };
  }, [playPause]);

  useEffect(() => {
    setCurrent(0);
    setDuration(0);
    setNotice("");
    setPlayback(false);
    const audio = audioRef.current;
    if (audio && source) {
      audio.src = source;
      audio.load();
    }
  }, [source, setPlayback]);

  useEffect(() => {
    if (!playing) {
      cancelAnimationFrame(frame.current);
      const quiet = simulatedLevels(0, 42).map((value) => value * 0.28);
      setLevels(quiet);
      emitLevels(quiet);
      return;
    }

    const tick = (time: number) => {
      const values = simulatedLevels(time, 42);
      setLevels(values);
      emitLevels(values);
      frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [playing]);

  const progress = duration > 0 ? Math.min(current / duration, 1) : 0;

  if (!source) return null;

  return (
    <div className="post-listen" id="post-listen">
      <audio
        ref={audioRef}
        src={source}
        preload="metadata"
        playsInline
        onLoadedMetadata={(event) => {
          const length = event.currentTarget.duration;
          setDuration(Number.isFinite(length) ? length : 0);
          setNotice("");
        }}
        onDurationChange={(event) => {
          const length = event.currentTarget.duration;
          if (Number.isFinite(length) && length > 0) setDuration(length);
        }}
        onError={() => setNotice("This audio file could not be loaded. Check the URL or try again.")}
        onTimeUpdate={(event) => setCurrent(event.currentTarget.currentTime || 0)}
        onPlay={() => setPlayback(true)}
        onPause={() => setPlayback(false)}
        onEnded={() => {
          setPlayback(false);
          setCurrent(0);
        }}
      />
      <button type="button" onClick={() => void playPause()} aria-label={playing ? "Pause article audio" : "Listen to this article"}>
        {playing ? (
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h3.5v14H7V5Zm6.5 0H17v14h-3.5V5Z" fill="currentColor" /></svg>
        ) : (
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5-11-6.5Z" fill="currentColor" /></svg>
        )}
      </button>
      <div className="post-listen-copy">
        <strong>{playing ? "Playing article audio" : notice || "Listen to this article"}</strong>
        <span>{title}</span>
        <div className="post-listen-progress">
          <AudioWaveform
            playing={playing}
            levels={levels}
            progress={progress}
            onSeek={(ratio) => {
              const audio = audioRef.current;
              if (!audio || !duration) return;
              const wasPlaying = playing && !audio.paused;
              audio.currentTime = ratio * duration;
              setCurrent(ratio * duration);
              if (wasPlaying) {
                audio.play().catch(() => undefined);
              }
            }}
          />
          <small>{formatTime(current)} / {formatTime(duration)}</small>
        </div>
      </div>
    </div>
  );
}
