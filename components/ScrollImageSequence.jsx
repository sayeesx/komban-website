"use client";

import {
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";

import { FRAME_COUNT, framePath } from "@/lib/framesConfig";

/* ═══════════════════════════════════════════════════════════════════════════════
 * CONFIGURATION — pipeline
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * • Frame count + URL pattern (+ optional CDN):  lib/framesConfig.js
 * • Preload hints (first N):                     PRELOAD_FIRST_FRAMES + app/layout.jsx
 * • Long-lived cache for /frames/*:              next.config.mjs → headers
 *
 * BUFFER_RADIUS — only indices [current − R, current + R] stay decoded in RAM.
 *
 * INITIAL_FRAMES — “Loading experience…” until frames 0 … INITIAL_FRAMES−1 decode.
 * ═══════════════════════════════════════════════════════════════════════════════ */

const BUFFER_RADIUS = 5;

const INITIAL_FRAMES = 10;

/**
 * ScrollImageSequence — sticky, scroll-scrubbed canvas sequence (WebP, buffered).
 * Rendering is 100 % canvas (object-contain math), no <img> swapping in the DOM.
 */
export default function ScrollImageSequence({
  scrollHeight = "300vh",
  endHold = 0.2,
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  /** index (0-based) → decoded HTMLImageElement */
  const cacheRef = useRef(new Map());
  /** indices (0-based) currently being decoded */
  const inflightRef = useRef(new Set());
  /** playhead used to reject late loads outside the buffer window */
  const targetIndexRef = useRef(0);

  const currentFrameRef = useRef(0);
  const rafRef = useRef(null);

  const [experienceReady, setExperienceReady] = useState(false);
  const [bootLoaded, setBootLoaded] = useState(0);
  const [atEnd, setAtEnd] = useState(false);

  // Cache the 2D context once so getContext() is not called on every draw.
  const ctxRef = useRef(null);

  const drawFrameImpl = useCallback((frameIndex) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // alpha:false lets the browser skip per-pixel alpha compositing —
    // cleaner pixels and a small GPU perf gain for opaque frames.
    if (!ctxRef.current) {
      ctxRef.current = canvas.getContext("2d", { alpha: false });
    }
    const ctx = ctxRef.current;
    const img = cacheRef.current.get(frameIndex);
    if (!img?.complete || img.naturalWidth === 0) return;

    const cw = canvas.width;
    const ch = canvas.height;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    const scale = Math.min(cw / iw, ch / ih);
    const w = iw * scale;
    const h = ih * scale;
    const x = (cw - w) / 2;
    const y = (ch - h) / 2;

    // "high" uses bi-cubic / Lanczos filtering when downscaling to the canvas.
    // Default is "low" (nearest-neighbour) which causes the blurry/pixelated look.
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    // Fill black first (alpha:false background) then draw the frame.
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, cw, ch);
    ctx.drawImage(img, x, y, w, h);
  }, []);

  /** Drop decoded images outside [center − R, center + R] to cap memory. */
  const pruneBuffer = useCallback((center0) => {
    const cache = cacheRef.current;
    for (const idx of [...cache.keys()]) {
      if (Math.abs(idx - center0) > BUFFER_RADIUS) {
        const im = cache.get(idx);
        im.removeAttribute("src");
        cache.delete(idx);
      }
    }
  }, []);

  /** Start a decode for one 0-based index; idempotent while in flight. */
  const loadFrame = useCallback((index0) => {
    if (index0 < 0 || index0 >= FRAME_COUNT) return;

    if (cacheRef.current.has(index0)) return;
    if (inflightRef.current.has(index0)) return;

    inflightRef.current.add(index0);

    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      inflightRef.current.delete(index0);
      // Late completion — if user scrolled away, discard to honour ±R budget.
      if (Math.abs(index0 - targetIndexRef.current) > BUFFER_RADIUS) {
        img.removeAttribute("src");
        return;
      }
      cacheRef.current.set(index0, img);
      if (index0 === currentFrameRef.current) {
        requestAnimationFrame(() => drawFrameImpl(index0));
      }
    };
    img.onerror = () => {
      inflightRef.current.delete(index0);
    };
    img.src = framePath(index0 + 1);
  }, [drawFrameImpl]);

  /** Ensure the sliding window around `center0` is loading / loaded. */
  const syncBuffer = useCallback(
    (center0) => {
      targetIndexRef.current = center0;
      pruneBuffer(center0);
      const lo = Math.max(0, center0 - BUFFER_RADIUS);
      const hi = Math.min(FRAME_COUNT - 1, center0 + BUFFER_RADIUS);
      for (let i = lo; i <= hi; i++) loadFrame(i);
    },
    [loadFrame, pruneBuffer]
  );

  /** Ref avoids re-running the boot effect when `syncBuffer` identity changes. */
  const syncBufferRef = useRef(syncBuffer);
  syncBufferRef.current = syncBuffer;

  /* ── 1.  Boot: decode frames 0 … INITIAL_FRAMES−1 before showing canvas ───── */
  useEffect(() => {
    let cancelled = false;
    setBootLoaded(0);

    const run = async () => {
      await Promise.all(
        Array.from({ length: INITIAL_FRAMES }, (_, i) => {
          const img = new Image();
          img.decoding = "async";
          return new Promise((resolve) => {
            img.onload = () => {
              if (!cancelled) {
                cacheRef.current.set(i, img);
                setBootLoaded((n) => n + 1);
              }
              resolve();
            };
            img.onerror = () => {
              if (!cancelled && process.env.NODE_ENV === "development") {
                // eslint-disable-next-line no-console
                console.error(
                  "[ScrollImageSequence] Boot frame missing or corrupt:",
                  framePath(i + 1)
                );
              }
              resolve();
            };
            img.src = framePath(i + 1);
          });
        })
      );
      if (cancelled) return;

      // Require every leading frame — otherwise the first scroll scrub fails.
      let missing = false;
      for (let i = 0; i < INITIAL_FRAMES; i++) {
        const im = cacheRef.current.get(i);
        if (!im?.complete || im.naturalWidth === 0) {
          missing = true;
          break;
        }
      }
      if (missing) return;

      targetIndexRef.current = 0;
      currentFrameRef.current = 0;
      // Populate ±R around frame 0; prune drops anything outside the window
      // (some of the boot frames may be evicted — that is OK; disk cache stays warm).
      syncBufferRef.current(0);
      setExperienceReady(true);
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, []);

  /* ── 2.  DPR-aware canvas sizing — no layout thrash: only `canvas` backing-store changes */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      // Use the real device pixel ratio (no cap) so every display —
      // including 3× mobile screens — gets a full-resolution backing store.
      const dpr = window.devicePixelRatio || 1;
      const { clientWidth, clientHeight } = canvas;
      canvas.width = Math.floor(clientWidth * dpr);
      canvas.height = Math.floor(clientHeight * dpr);
      // Reset the context reference so getContext is re-acquired after resize.
      ctxRef.current = null;
      drawFrameImpl(currentFrameRef.current);
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [drawFrameImpl, experienceReady]);

  /* ── 3.  Low-priority HTTP warm-up for frames not yet decoded (network cache only) */
  useEffect(() => {
    if (!experienceReady || typeof requestIdleCallback === "undefined") return;

    let cancelled = false;
    let cursor = 0;
    const step = (deadline) => {
      while (!cancelled && cursor < FRAME_COUNT && deadline.timeRemaining() > 1) {
        try {
          void fetch(framePath(cursor + 1), { cache: "force-cache" });
        } catch {
          /* ignore */
        }
        cursor += 1;
      }
      if (!cancelled && cursor < FRAME_COUNT) {
        idleId = requestIdleCallback(step);
      }
    };

    let idleId = requestIdleCallback(step);
    return () => {
      cancelled = true;
      cancelIdleCallback(idleId);
    };
  }, [experienceReady]);

  /* ── 4.  Sticky guard (dev only) ─────────────────────────────────────────── */
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    const el = containerRef.current;
    if (!el) return;
    const bad = ["hidden", "scroll", "auto"];
    let node = el.parentElement;
    while (node && node !== document.body) {
      const s = getComputedStyle(node);
      if (bad.includes(s.overflow) || bad.includes(s.overflowY)) {
        // eslint-disable-next-line no-console
        console.warn(
          "[ScrollImageSequence] An ancestor has sticky-breaking overflow. Offending node:",
          node
        );
        break;
      }
      node = node.parentElement;
    }
  }, []);

  /* ── 5.  Scroll → frame index (rAF-coalesced, same math as before) ───────── */
  useEffect(() => {
    if (!experienceReady) return;

    const update = () => {
      rafRef.current = null;
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const scrollable = container.offsetHeight - window.innerHeight;
      const progress = Math.min(
        Math.max(-rect.top / Math.max(scrollable, 1), 0),
        1
      );

      const animSpan = Math.max(1 - endHold, 0.0001);
      const animProgress = Math.min(progress / animSpan, 1);

      const frameIndex = Math.min(
        FRAME_COUNT - 1,
        Math.floor(animProgress * FRAME_COUNT)
      );

      syncBuffer(frameIndex);

      if (frameIndex !== currentFrameRef.current) {
        currentFrameRef.current = frameIndex;
      }

      drawFrameImpl(frameIndex);

      const reachedEnd = frameIndex >= FRAME_COUNT - 1;
      setAtEnd((prev) => (prev === reachedEnd ? prev : reachedEnd));
    };

    const onScroll = () => {
      if (rafRef.current != null) return;
      rafRef.current = requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [experienceReady, drawFrameImpl, endHold, syncBuffer]);

  const bootPct = Math.round((bootLoaded / INITIAL_FRAMES) * 100);

  return (
    <section
      ref={containerRef}
      className="relative w-full bg-black"
      style={{ height: scrollHeight }}
      aria-label="Dark Raptor 360 scroll experience"
    >
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.85) 100%)",
          }}
        />

        <canvas
          ref={canvasRef}
          className="relative z-10 w-full h-full"
          style={{
            opacity: experienceReady ? 1 : 0,
            transition: "opacity 600ms ease-out",
          }}
        />

        {experienceReady && (
          <div className="pointer-events-none absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3 text-[10px] uppercase tracking-[0.4em] text-white/50 transition-opacity duration-300">
            <span className="h-px w-8 bg-white/30" />
            {atEnd ? "Continue ↓" : "Keep scrolling"}
            <span className="h-px w-8 bg-white/30" />
          </div>
        )}

        {!experienceReady && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black">
            <div className="mb-6 text-[10px] uppercase tracking-[0.4em] text-white/50">
              Loading experience...
            </div>
            <div className="font-extralight tabular-nums text-5xl sm:text-6xl">
              {bootPct}
              <span className="text-accent">%</span>
            </div>
            <div className="mt-8 h-px w-56 overflow-hidden bg-white/10">
              <div
                className="h-full bg-accent transition-[width] duration-150 ease-out"
                style={{ width: `${bootPct}%` }}
              />
            </div>
            <div className="mt-4 text-[10px] uppercase tracking-[0.3em] text-white/30">
              {bootLoaded} / {INITIAL_FRAMES} frames
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
