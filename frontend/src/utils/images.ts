/**
 * Realistic photography helper.
 *
 * We build keyword-based image URLs (LoremFlickr) so every product/farm shows a
 * relevant real photo. The <ProductImage> / <Photo> components layer a branded
 * emoji-or-icon fallback underneath, so the UI still looks intentional if an
 * image is slow or fails to load (offline, blocked, etc.).
 *
 * To switch to Cloudinary/S3 later, only this file needs to change.
 */

/** Stable pseudo-random lock from a string, so a given keyword always returns the same photo. */
function hashLock(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h << 5) - h + seed.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h) % 1000;
}

export interface PhotoOpts {
  width?: number;
  height?: number;
  /** Extra seed so two cards using the same keyword can still differ. */
  seed?: string;
}

export function photoUrl(keyword: string, opts: PhotoOpts = {}): string {
  const w = opts.width ?? 600;
  const h = opts.height ?? 400;
  const kw = encodeURIComponent(keyword.trim() || 'agriculture,farm');
  const lock = hashLock(`${keyword}${opts.seed ?? ''}`);
  return `https://loremflickr.com/${w}/${h}/${kw}?lock=${lock}`;
}
