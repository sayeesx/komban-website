"use client";

import { useEffect, useLayoutEffect, useRef, useState, useCallback } from "react";
import { FRAME_COUNT, framePath } from "@/lib/framesConfig";
import KombanLogo from "@/components/KombanLogo";

/* ─── how many leading frames to load before revealing the canvas ─── */
const BOOT_FRAMES   = 18;
const BUFFER_RADIUS = 6;
/** Cap canvas backing store scale for smoother scroll-driven draws on hi-DPI screens */
const MAX_CANVAS_DPR = 1.75;

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
  const lastSyncedIdxRef = useRef(-1);
  const lastDrawnIdxRef = useRef(-1);
  const lastRawProgressRef = useRef(0);
  /** After the hero sequence completes once, freeze on the last frame and stop scroll-driven work */
  const heroSequenceDoneRef = useRef(false);
  const rafRef         = useRef(null);
  const smoothProgressRef = useRef(0);
  const targetProgressRef = useRef(0);
  const isMobileRef = useRef(false);
  const [isMobile, setIsMobile] = useState(false);
  const [experienceReady, setExperienceReady] = useState(false);
  const [showFirstLoadGate, setShowFirstLoadGate] = useState(true);
  /** Mobile: sequence reached last frame (scroll hook removed) */
  const [mobilePlaybackFinished, setMobilePlaybackFinished] = useState(false);
  /** Mobile: hero shortened to 100svh after user scrolls back near top — avoids 190vh “dead track” on next pass */
  const [mobileHeroCompact, setMobileHeroCompact] = useState(false);
  const preCompactHeroPxRef = useRef(0);
  const preCompactScrollYRef = useRef(0);

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    /* Desktop only: forcing scroll(0) on mobile fights Safari’s viewport chrome and looks like a mini “refresh” */
    if (typeof window !== "undefined" && !window.matchMedia("(max-width: 767px)").matches) {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }

    try {
      const alreadyWarmed = window.localStorage.getItem("komban_frames_warmed") === "1";
      if (alreadyWarmed) setShowFirstLoadGate(false);
    } catch {
      // ignore localStorage issues and keep gate enabled
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(max-width: 767px)");
    const updateMobile = () => {
      isMobileRef.current = media.matches;
      setIsMobile(media.matches);
    };
    updateMobile();
    media.addEventListener("change", updateMobile);
    return () => media.removeEventListener("change", updateMobile);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(max-width: 767px)").matches) return;

    let targetY = window.scrollY;
    let currentY = window.scrollY;
    let rafId = null;
    let smoothing = false;

    const clampY = (value) => {
      const maxY = Math.max(
        0,
        document.documentElement.scrollHeight - window.innerHeight
      );
      return Math.min(Math.max(value, 0), maxY);
    };

    const tick = () => {
      currentY += (targetY - currentY) * 0.06;
      if (Math.abs(targetY - currentY) < 0.35) {
        currentY = targetY;
        smoothing = false;
        window.scrollTo(0, currentY);
        rafId = null;
        return;
      }
      window.scrollTo(0, currentY);
      rafId = requestAnimationFrame(tick);
    };

    const onWheel = (e) => {
      e.preventDefault();
      let nextTarget = clampY(targetY + e.deltaY * 0.75);
      targetY = nextTarget;
      if (!smoothing) {
        smoothing = true;
        if (!rafId) rafId = requestAnimationFrame(tick);
      }
    };

    const onNativeScroll = () => {
      if (smoothing) return;
      currentY = window.scrollY;
      targetY = window.scrollY;
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("scroll", onNativeScroll, { passive: true });
    window.addEventListener("resize", onNativeScroll);

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("scroll", onNativeScroll);
      window.removeEventListener("resize", onNativeScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
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
    ctx.imageSmoothingQuality  = "medium";
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

  const drawFrameRef = useRef(drawFrame);
  drawFrameRef.current = drawFrame;

  /* ── 1. boot: load first BOOT_FRAMES before revealing canvas ──── */
  useEffect(() => {
    let cancelled = false;
    let readyTimeout = null;
    Promise.all(
      Array.from({ length: BOOT_FRAMES }, (_, i) =>
        new Promise((res) => {
          const img = new Image();
          img.decoding = "async";
          img.onload = () => {
            if (!cancelled) {
              cacheRef.current.set(i, img);
            }
            res();
          };
          img.onerror = () => {
            res();
          };
          img.src = framePath(i + 1);
        })
      )
    ).then(() => {
      if (cancelled) return;
      let firstValidIdx = -1;
      for (let i = 0; i < BOOT_FRAMES; i++) {
        const im = cacheRef.current.get(i);
        if (im?.complete && im.naturalWidth > 0) {
          firstValidIdx = i;
          break;
        }
      }
      if (firstValidIdx < 0) {
        setShowFirstLoadGate(false);
        return;
      }
      // Always start from frame 1 when the hero becomes ready.
      currentIdxRef.current = firstValidIdx;
      lastSyncedIdxRef.current = firstValidIdx;
      lastDrawnIdxRef.current = firstValidIdx;
      heroSequenceDoneRef.current = false;
      setMobilePlaybackFinished(false);
      setMobileHeroCompact(false);
      syncBufferRef.current(firstValidIdx);
      drawFrame(firstValidIdx);
      readyTimeout = window.setTimeout(() => {
        if (!cancelled) setExperienceReady(true);
      }, 180);
      try {
        window.localStorage.setItem("komban_frames_warmed", "1");
      } catch {
        // ignore localStorage issues
      }
    });
    return () => {
      cancelled = true;
      if (readyTimeout) window.clearTimeout(readyTimeout);
    };
  }, []);

  /* ── 2. DPR-aware canvas sizing ───────────────────────────────── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_CANVAS_DPR);
      canvas.width  = Math.floor(canvas.clientWidth  * dpr);
      canvas.height = Math.floor(canvas.clientHeight * dpr);
      ctxRef.current = null;
      drawFrame(currentIdxRef.current);
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [drawFrame, experienceReady]);

  /* ── 3. idle fetch warm-up (stops once hero sequence finished — avoids decode contention on mobile) ─ */
  useEffect(() => {
    if (!experienceReady || typeof requestIdleCallback === "undefined") return;
    let cancelled = false, cursor = 0;
    let id = requestIdleCallback(function step(dl) {
      if (heroSequenceDoneRef.current) {
        cancelled = true;
        return;
      }
      while (!cancelled && cursor < FRAME_COUNT && dl.timeRemaining() > 1) {
        void fetch(framePath(cursor + 1), { cache: "force-cache" }).catch(() => {});
        cursor++;
      }
      if (!cancelled && cursor < FRAME_COUNT) id = requestIdleCallback(step);
    });
    return () => { cancelled = true; cancelIdleCallback(id); };
  }, [experienceReady]);

  /* ── 4. scroll → frame. Desktop: lerped. Mobile: snap to scroll (no chase RAF when reversing scroll). ─ */
  useEffect(() => {
    if (!experienceReady) return;

    let onScroll = () => {};

    const finalizeSequence = (maxPlayableFrame) => {
      if (heroSequenceDoneRef.current) return;
      heroSequenceDoneRef.current = true;
      smoothProgressRef.current = 1;
      targetProgressRef.current = 1;
      currentIdxRef.current = maxPlayableFrame;
      syncBufferRef.current(maxPlayableFrame);
      lastSyncedIdxRef.current = maxPlayableFrame;
      drawFrameRef.current(maxPlayableFrame);
      lastDrawnIdxRef.current = maxPlayableFrame;
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;

      if (isMobileRef.current) setMobilePlaybackFinished(true);
    };

    const render = () => {
      rafRef.current = null;
      if (heroSequenceDoneRef.current) return;

      const el = containerRef.current;
      if (!el) return;
      const maxPlayableFrame = Math.max(0, FRAME_COUNT - 6);
      const rect = el.getBoundingClientRect();
      const scrollRange = el.offsetHeight - window.innerHeight;
      const rawProgress = Math.min(Math.max(-rect.top / Math.max(scrollRange, 1), 0), 1);
      lastRawProgressRef.current = rawProgress;

      targetProgressRef.current = rawProgress;

      if (isMobileRef.current) {
        /* No lerp on mobile — avoids multi-second RAF “catch-up” when scrolling back up through the hero */
        smoothProgressRef.current = rawProgress;
      } else {
        const current = smoothProgressRef.current;
        const target = targetProgressRef.current;
        const lerp = 0.2;
        const next = current + (target - current) * lerp;
        smoothProgressRef.current = Math.abs(target - next) < 0.0005 ? target : next;
      }

      const anim = Math.min(
        smoothProgressRef.current / Math.max(1 - endHold, 0.0001),
        1
      );
      const computedIdx = Math.min(maxPlayableFrame, Math.floor(anim * maxPlayableFrame));

      /* Mobile: snap progress makes computedIdx track scroll exactly; allow finish at second-to-last playable frame so dynamic browser chrome never blocks completion */
      const reachedEnd = isMobileRef.current
        ? computedIdx >= maxPlayableFrame - 1 || rawProgress >= 0.997
        : computedIdx >= maxPlayableFrame || rawProgress >= 0.998;

      /* Mobile: lock on last frame and detach scroll handler. Desktop: keep scrolling — reverse frames when scrolling back up */
      if (reachedEnd && isMobileRef.current) {
        finalizeSequence(maxPlayableFrame);
        return;
      }

      const idx = computedIdx;

      if (idx !== lastSyncedIdxRef.current) {
        syncBufferRef.current(idx);
        lastSyncedIdxRef.current = idx;
      }
      if (idx !== lastDrawnIdxRef.current) {
        currentIdxRef.current = idx;
        drawFrameRef.current(idx);
        lastDrawnIdxRef.current = idx;
      }

      if (
        !isMobileRef.current &&
        Math.abs(targetProgressRef.current - smoothProgressRef.current) > 0.0005
      ) {
        rafRef.current = requestAnimationFrame(render);
      }
    };

    onScroll = () => {
      if (heroSequenceDoneRef.current) return;
      if (rafRef.current != null) return;
      rafRef.current = requestAnimationFrame(render);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [experienceReady, endHold]);

  /* Mobile: when playback is done, wait until user is near the top, then shrink hero (no jump mid-animation) */
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!mobilePlaybackFinished || mobileHeroCompact || !isMobile) return;

    const NEAR_TOP = 108;

    const tryCompact = () => {
      if (window.scrollY > NEAR_TOP) return;
      const el = containerRef.current;
      if (!el) return;
      preCompactHeroPxRef.current = el.offsetHeight;
      preCompactScrollYRef.current = window.scrollY;
      setMobileHeroCompact(true);
    };

    window.addEventListener("scroll", tryCompact, { passive: true });
    tryCompact();
    return () => window.removeEventListener("scroll", tryCompact);
  }, [mobilePlaybackFinished, mobileHeroCompact, isMobile]);

  useLayoutEffect(() => {
    if (!mobileHeroCompact || typeof window === "undefined") return;
    const el = containerRef.current;
    const oldH = preCompactHeroPxRef.current;
    if (!el || oldH <= 0) return;
    const newH = el.offsetHeight;
    const delta = oldH - newH;
    if (delta <= 1) return;
    const y = preCompactScrollYRef.current;
    window.scrollTo({ top: Math.max(0, y - delta), left: 0, behavior: "auto" });
  }, [mobileHeroCompact]);

  return (
    <>
      {showFirstLoadGate && !experienceReady && (
        <div className="fixed inset-0 z-[80] bg-black flex items-center justify-center px-6">
          <div className="w-full max-w-sm text-center">
            <img
              src="/komban.png"
              alt="Komban"
              className="w-20 h-20 mx-auto mb-4 object-contain"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/android-chrome-512x512.png";
              }}
            />
            <p className="text-[10px] uppercase tracking-[0.35em] text-white/50 font-body mb-4">
              Loading Komban Experience
            </p>
            <div className="relative h-px w-full bg-white/15 overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 w-2/5 bg-accent animate-loader-slide"
              />
            </div>
          </div>
        </div>
      )}
      <section
        ref={containerRef}
        className="relative w-full bg-black"
        style={{
          height: isMobile ? (mobileHeroCompact ? "100svh" : "190vh") : scrollHeight,
        }}
        aria-label="Komban hero"
      >
        {/* ── sticky two-column stage ──────────────────────────────── */}
        <div className="sticky top-0 h-screen w-full flex flex-col bg-black">

        {/* ── NAV ────────────────────────────────────────────────── */}
        <nav className="relative z-30 w-full px-4 md:px-12 pt-4 md:pt-6 flex items-center justify-between flex-shrink-0 gap-4">
          <KombanLogo />

          <div className="ml-auto" />
          <a
            href="#fleet"
            className="px-3.5 md:px-5 py-1.5 md:py-2.5 bg-accent rounded-full text-[10px] md:text-[11px] uppercase tracking-[0.18em] md:tracking-[0.2em] font-body font-medium hover:bg-accent-dark transition-colors"
          >
            Book
          </a>
        </nav>

        {/* ── main two-column body ────────────────────────────────── */}
        {/* Desktop: left 2fr (copy) + right 6fr (larger canvas). Mobile: copy top, canvas below */}
        <div className="relative z-10 flex-1 grid grid-cols-1 md:[grid-template-columns:2fr_6fr] items-center gap-1.5 md:gap-0 px-4 md:px-12 pt-12 md:pt-0 pb-5 md:pb-8">

          {/* ── LEFT: brand copy ─────────────────────────────────── */}
          {/* Mobile order-1 = on top. Desktop order stays natural (left col). */}
          <div className="flex flex-col justify-center gap-4 md:gap-5 md:pr-8 order-1 text-center md:text-left mt-6 md:mt-0 md:-mt-4">
            {/* label */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 text-[10px] uppercase tracking-[0.35em] text-white/50 font-body self-center md:self-start">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-soft" />
              keralas top bus fleet
            </div>
            <p className="text-[10px] text-white/75 font-body tracking-[0.04em] whitespace-nowrap self-center md:self-start">
              ᴋᴇʀᴀʟᴀ: 7594 007 005 · ᴋᴀʀɴᴀᴛᴀᴋᴀ: 7594 007 004
            </p>

            <h1 className="font-display text-[3.1rem] sm:text-[3.6rem] lg:text-6xl xl:text-7xl leading-[1.0] tracking-wide hero-title-gradient">
              one team<br />one fight
            </h1>

            <p className="font-body text-[10px] sm:text-[11px] text-white/55 max-w-sm md:max-w-md leading-relaxed self-center md:self-start">
              High-impact buses with custom design and premium interiors. Book now.
            </p>

            {/* scroll helper removed by request */}
          </div>

          {/* ── RIGHT: canvas animation ──────────────────────────── */}
          {/* Mobile order-2 = below text. Desktop occupies the wider right column. */}
          <div className="relative flex items-center justify-center order-2 h-[52vh] md:h-[88vh]">
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
              className="relative z-10 w-full h-full transform-gpu"
              style={{
                opacity: 1,
                maxHeight: "100%",
              }}
            />
          </div>
        </div>

        {/* bottom scroll arrow */}
        <div className="hidden md:flex relative z-10 justify-center pb-5 flex-shrink-0">
          <span className="w-px h-10 bg-gradient-to-b from-white/25 to-transparent" />
        </div>
        </div>
      </section>
    </>
  );
}
