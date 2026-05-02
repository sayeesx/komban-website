"use client";

import Image from "next/image";
import { useState } from "react";

const INSTAGRAM_URL = "https://www.instagram.com/komban_holidays_official/";

export default function GalleryGrid({ images }) {
  const [loaded, setLoaded] = useState({});

  const markDone = (index) => {
    setLoaded((prev) => (prev[index] ? prev : { ...prev, [index]: true }));
  };

  return (
    <>
      {/* Match Why Komban cards: glass, rounded-2xl, padding, hover accent border */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6 mt-8 md:mt-10">
        {images.map((src, index) => {
          const isLoaded = !!loaded[index];
          return (
            <div
              key={`${src}-${index}`}
              className="glass rounded-xl md:rounded-2xl p-2 md:p-5 flex flex-col hover:border-accent/25 transition-colors"
            >
              <div className="relative w-full aspect-[1280/984] rounded-lg md:rounded-xl overflow-hidden bg-black/40">
                {!isLoaded && (
                  <div
                    className="absolute inset-0 z-10 gallery-image-skeleton rounded-lg md:rounded-xl"
                    aria-hidden
                  />
                )}
                <Image
                  src={src}
                  alt={`Komban gallery image ${index + 1}`}
                  fill
                  className={`object-cover transition-opacity duration-500 ${
                    isLoaded ? "opacity-100" : "opacity-0"
                  }`}
                  sizes="(max-width: 768px) 45vw, 30vw"
                  onLoadingComplete={() => markDone(index)}
                  onError={() => markDone(index)}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-10 flex justify-center">
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full border-2 border-accent bg-transparent text-white text-[11px] font-body font-medium uppercase tracking-[0.22em] hover:bg-accent/15 hover:shadow-[0_0_24px_rgba(225,6,0,0.18)] transition-all"
        >
          View more
        </a>
      </div>
    </>
  );
}
