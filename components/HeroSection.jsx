"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { FRAME_COUNT, framePath } from "@/lib/framesConfig";
import KombanLogo from "@/components/KombanLogo";

/* ─── how many leading frames to load before revealing the canvas ─── */
const BOOT_FRAMES   = 10;
const BUFFER_RADIUS = 6;

/* ────────────────────────────────────────────────────────────────────
 * HeroSection
 * Two-column hero that is also the scroll-driven animation container.
 *   Left  – sticky brand copy, headline, CTAs
 *   Right – sticky canvas playing the WebP frame sequence as the user
 *           scrolls through the section's height (scrollHeight prop).
 * ─────────────────────────────────────────────────────────────────── */
export default function HeroSection({ scrollHeight = "500vh", endHold = 0 }) {
  const containerRef   = useRef(null);
  const canvasRef      = useRef(null);
  const ctxRef         = useRef(null);
  const cacheRef       = useRef(new Map());
  const inflightRef    = useRef(new Set());
  const targetIdxRef   = useRef(0);
  const currentIdxRef  = useRef(0);
  const rafRef         = useRef(null);
  // Once true, the hero stays on the final frame even when scrolling back up.
  const endLockedRef   = useRef(false);

  const [experienceReady, setExperienceReady] = useState(false);
  const [atEnd, setAtEnd]                   = useState(false);

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  /* ── draw one frame (object-contain) ──────────────────────────── */
  const drawFrame = useCallback((idx) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!ctxRef.current) {
      ctxRef.current = canvas.getContext("2d", { alpha: true });
    }
    const ctx = ctxRef.current;
    const img = cacheRef.current.get(idx);
    if (!img?.complete || img.naturalWidth === 0) return;

    const cw = canvas.width, ch = canvas.height;
    const iw = img.naturalWidth, ih = img.naturalHeight;
    const scale = Math.min(cw / iw, ch / ih);
    const w = iw * scale, h = ih * scale;
    const x = (cw - w) / 2, y = (ch - h) / 2;

    ctx.imageSmoothingEnabled  = true;
    ctx.imageSmoothingQuality  = "high";
    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, x, y, w, h);
  }, []);

  /* ── prune cache outside ±BUFFER_RADIUS ───────────────────────── */
  const pruneBuffer = useCallback((center) => {
    for (const idx of [...cacheRef.current.keys()]) {
      if (Math.abs(idx - center) > BUFFER_RADIUS) {
        cacheRef.current.get(idx)?.removeAttribute?.("src");
        cacheRef.current.delete(idx);
      }
    }
  }, []);

  /* ── load one frame by 0-based index ──────────────────────────── */
  const loadFrame = useCallback((idx) => {
    if (idx < 0 || idx >= FRAME_COUNT) return;
    if (cacheRef.current.has(idx) || inflightRef.current.has(idx)) return;
    inflightRef.current.add(idx);
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      inflightRef.current.delete(idx);
      if (Math.abs(idx - targetIdxRef.current) > BUFFER_RADIUS) {
        img.removeAttribute("src");
        return;
      }
      cacheRef.current.set(idx, img);
      if (idx === currentIdxRef.current) requestAnimationFrame(() => drawFrame(idx));
    };
    img.onerror = () => inflightRef.current.delete(idx);
    img.src = framePath(idx + 1);
  }, [drawFrame]);

  /* ── keep ±BUFFER_RADIUS loaded around a centre index ─────────── */
  const syncBuffer = useCallback((center) => {
    targetIdxRef.current = center;
    pruneBuffer(center);
    for (let i = Math.max(0, center - BUFFER_RADIUS);
         i <= Math.min(FRAME_COUNT - 1, center + BUFFER_RADIUS); i++) {
      loadFrame(i);
    }
  }, [loadFrame, pruneBuffer]);

  const syncBufferRef = useRef(syncBuffer);
  syncBufferRef.current = syncBuffer;

  /* ── 1. boot: load first BOOT_FRAMES before revealing canvas ──── */
  useEffect(() => {
    let cancelled = false;
    Promise.all(
      Array.from({ length: BOOT_FRAMES }, (_, i) =>
        new Promise((res) => {
          const img = new Image();
          img.decoding = "async";
          img.onload = () => {
            if (!cancelled) { cacheRef.current.set(i, img); }
            res();
          };
          img.onerror = res;
          img.src = framePath(i + 1);
        })
      )
    ).then(() => {
      if (cancelled) return;
      let ok = true;
      for (let i = 0; i < BOOT_FRAMES; i++) {
        const im = cacheRef.current.get(i);
        if (!im?.complete || im.naturalWidth === 0) { ok = false; break; }
      }
      if (!ok) return;
      // Always start from frame 1 when the hero becomes ready.
      endLockedRef.current = false;
      currentIdxRef.current = 0;
      syncBufferRef.current(0);
      drawFrame(0);
      setExperienceReady(true);
    });
    return () => { cancelled = true; };
  }, []);

  /* ── 2. DPR-aware canvas sizing ───────────────────────────────── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width  = Math.floor(canvas.clientWidth  * dpr);
      canvas.height = Math.floor(canvas.clientHeight * dpr);
      ctxRef.current = null;
      drawFrame(currentIdxRef.current);
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [drawFrame, experienceReady]);

  /* ── 3. idle fetch warm-up ────────────────────────────────────── */
  useEffect(() => {
    if (!experienceReady || typeof requestIdleCallback === "undefined") return;
    let cancelled = false, cursor = 0;
    let id = requestIdleCallback(function step(dl) {
      while (!cancelled && cursor < FRAME_COUNT && dl.timeRemaining() > 1) {
        void fetch(framePath(cursor + 1), { cache: "force-cache" }).catch(() => {});
        cursor++;
      }
      if (!cancelled && cursor < FRAME_COUNT) id = requestIdleCallback(step);
    });
    return () => { cancelled = true; cancelIdleCallback(id); };
  }, [experienceReady]);

  /* ── 4. scroll → frame (rAF-coalesced) ───────────────────────── */
  useEffect(() => {
    if (!experienceReady) return;
    const update = () => {
      rafRef.current = null;
      const el = containerRef.current;
      if (!el) return;
      const rect   = el.getBoundingClientRect();
      const scroll = el.offsetHeight - window.innerHeight;
      const prog   = Math.min(Math.max(-rect.top / Math.max(scroll, 1), 0), 1);
      const anim   = Math.min(prog / Math.max(1 - endHold, 0.0001), 1);
      const rawIdx = Math.min(FRAME_COUNT - 1, Math.floor(anim * FRAME_COUNT));

      // Hard reset near the top so the sequence always starts from frame 1.
      if (prog <= 0.01) endLockedRef.current = false;
      // Lock at the end to avoid reverse playback on small upward scroll.
      if (rawIdx >= FRAME_COUNT - 1) endLockedRef.current = true;
      const idx = endLockedRef.current ? FRAME_COUNT - 1 : rawIdx;

      syncBuffer(idx);
      currentIdxRef.current = idx;
      drawFrame(idx);
      setAtEnd((p) => p === (idx >= FRAME_COUNT - 1) ? p : idx >= FRAME_COUNT - 1);
    };
    const onScroll = () => {
      if (rafRef.current != null) return;
      rafRef.current = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [experienceReady, drawFrame, endHold, syncBuffer]);

  return (
    <section
      ref={containerRef}
      className="relative w-full bg-transparent"
      style={{ height: scrollHeight }}
      aria-label="Komban hero"
    >
      {/* ── sticky two-column stage ──────────────────────────────── */}
      <div className="sticky top-0 h-screen w-full flex flex-col">

        {/* red top glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[55vh]"
          style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(225,6,0,0.22) 0%, transparent 65%)" }}
        />

        {/* ── NAV ────────────────────────────────────────────────── */}
        <nav className="relative z-30 w-full px-6 md:px-12 pt-6 flex items-center justify-between flex-shrink-0">
          <KombanLogo />

          <div className="hidden md:flex items-center gap-8 text-[11px] uppercase tracking-[0.25em] text-white/55 font-body ml-auto">
            <a href="#fleet"   className="hover:text-white transition-colors">Fleet</a>
            <a href="#about"   className="hover:text-white transition-colors">About</a>
            <a href="#gallery" className="hover:text-white transition-colors">Gallery</a>
            <a href="#contact" className="hover:text-white transition-colors">Contact</a>
          </div>
        </nav>

        {/* ── main two-column body ────────────────────────────────── */}
        {/* Desktop: left 2fr (copy) + right 6fr (larger canvas). Mobile: copy top, canvas below */}
        <div className="relative z-10 flex-1 grid grid-cols-1 md:[grid-template-columns:2fr_6fr] items-center gap-0 px-6 md:px-12 pb-8">

          {/* ── LEFT: brand copy ─────────────────────────────────── */}
          {/* Mobile order-1 = on top. Desktop order stays natural (left col). */}
          <div className="flex flex-col justify-center gap-5 md:pr-8 order-1 text-center md:text-left">
            {/* label */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 text-[10px] uppercase tracking-[0.35em] text-white/50 font-body self-center md:self-start">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-soft" />
              Komban Bus Agency · Kerala
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl leading-[1.0] tracking-wide shimmer-text">
              one team<br />one fight
            </h1>

            <p className="font-body text-sm sm:text-base text-white/55 max-w-md leading-relaxed self-center md:self-start">
              High-impact buses from Kerala with custom design, premium interiors,
              and strong road presence. Book for tours, events, and long routes.
            </p>

            {/* scroll progress indicator (visible once frames load) */}
            {experienceReady && (
              <p className="font-body text-[10px] uppercase tracking-[0.35em] text-white/30 self-center md:self-start">
                {atEnd ? "Keep scrolling ↓" : "Scroll to explore"}
              </p>
            )}
          </div>

          {/* ── RIGHT: canvas animation ──────────────────────────── */}
          {/* Mobile order-2 = below text. Desktop occupies the wider right column. */}
          <div className="relative flex items-center justify-center order-2 h-[58vh] md:h-[88vh]">
            {!experienceReady && (
              <img
                src={framePath(1)}
                alt="Komban hero frame"
                className="absolute inset-0 z-0 w-full h-full object-contain"
                loading="eager"
              />
            )}

            <canvas
              ref={canvasRef}
              className="relative z-10 w-full h-full"
              style={{
                opacity: 1,
                maxHeight: "100%",
              }}
            />
          </div>
        </div>

        {/* bottom scroll arrow */}
        <div className="relative z-10 flex justify-center pb-5 flex-shrink-0">
          <span className="w-px h-10 bg-gradient-to-b from-white/25 to-transparent" />
        </div>
      </div>
    </section>
  );
}
