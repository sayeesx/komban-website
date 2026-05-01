"use client";

import { useEffect, useRef, useState } from "react";

export default function AnimatedCount({ to }) {
  const [value, setValue] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    let rafId = null;
    let started = false;

    const run = () => {
      if (started) return;
      started = true;
      const start = performance.now();
      const duration = 850;
      const step = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - (1 - progress) * (1 - progress);
        setValue(Math.round(to * eased));
        if (progress < 1) rafId = requestAnimationFrame(step);
      };
      rafId = requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) run();
      },
      { threshold: 0.35 }
    );
    observer.observe(node);

    return () => {
      observer.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [to]);

  return (
    <span ref={ref} className="inline-block w-[2ch] tabular-nums text-right">
      {String(value).padStart(2, "0")}
    </span>
  );
}
