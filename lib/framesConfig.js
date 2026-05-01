/**
 * Single source of truth for scroll-sequence frame URLs.
 *
 * - FRAME_COUNT: must match how many WebPs you exported (names 0001 … N).
 * - framePath(i): 1-based index → URL (frame_0001.webp …).
 *
 * CDN / R2 / CloudFront: set NEXT_PUBLIC_FRAMES_BASE to the folder URL with no
 * trailing slash (e.g. https://assets.example.com/video/frames). Preloads,
 * fetch warm-up, and Image.src all use this.
 *
 * FFmpeg naming:
 *   ffmpeg -i input.mp4 -vf "fps=30,scale=1920:-1" -c:v libwebp \
 *     -quality 88 -compression_level 6 frame_%04d.webp
 * Copy into public/frames/ as frame_0001.webp … or serve the same names from CDN.
 */

const FRAMES_BASE =
  (typeof process !== "undefined" &&
    process.env.NEXT_PUBLIC_FRAMES_BASE?.replace(/\/$/, "")) ||
  "";

/** ► Total frames (last file = frame_${COUNT}.webp with 4-digit pad). */
export const FRAME_COUNT = 91;

/** ► How many leading frames to `<link rel="preload">` in app/layout.jsx. */
export const PRELOAD_FIRST_FRAMES = 5;

export function framePath(index1Based) {
  const file = `frame_${String(index1Based).padStart(4, "0")}.webp`;
  return FRAMES_BASE ? `${FRAMES_BASE}/${file}` : `/frames/${file}`;
}
