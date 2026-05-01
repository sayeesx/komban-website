"use client";

import Image from "next/image";
import { useState } from "react";

export default function KombanLogo() {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <div className="flex items-center gap-2">
      {!imgFailed && (
        <div className="relative h-9 w-32 flex-shrink-0">
          <Image
            src="/komban.png"
            alt="Komban"
            fill
            className="object-contain object-left"
            onError={() => setImgFailed(true)}
          />
        </div>
      )}
      {/* text fallback shown only when image fails */}
      {imgFailed && (
        <span className="font-display text-xl tracking-wide text-white">KOMBAN</span>
      )}
    </div>
  );
}
