// Shared by any component that wants an image's ambient edge color (à la TV
// "Ambilight") — currently ProductAdBanner's halo and HeroBanner's product
// image halo/grid tint. An image's ambient color never changes, so results
// are cached per URL across every caller.
const haloColorCache = new Map<string, string>();

// Backend-served files under /storage/** don't send
// Access-Control-Allow-Origin, so reading their pixels directly into a
// canvas would throw ("tainted canvas"). Routed through Next's own image
// optimizer instead — it fetches the real bytes server-side (no browser
// CORS involved) and serves them back from this page's own origin. That
// alone isn't quite enough, though: Next serves /_next/image responses
// with Content-Disposition: attachment (a deliberate hardening measure),
// and some browsers still taint a canvas drawn from an <img> pointed
// straight at such a response even though it's same-origin. Fetching the
// bytes manually and drawing from a blob: URL sidesteps that entirely —
// the image is now a plain local object, no HTTP response headers
// involved at draw time. A tiny 32px version is plenty for an average
// color and keeps this cheap.
export async function sampleEdgeColor(imageUrl: string): Promise<string | null> {
  const cached = haloColorCache.get(imageUrl);
  if (cached) return cached;

  let objectUrl: string | null = null;

  try {
    // 32/75 are the smallest width and the only quality Next's image
    // optimizer accepts by default (images.imageSizes / images.qualities)
    // — both required, and any value outside those lists (this started as
    // w=24&q=40) is rejected outright with a 400, not silently rounded.
    const proxiedUrl = `/_next/image?url=${encodeURIComponent(imageUrl)}&w=32&q=75`;
    const response = await fetch(proxiedUrl);
    if (!response.ok) return null;

    objectUrl = URL.createObjectURL(await response.blob());
    const img = new Image();
    img.src = objectUrl;
    await img.decode();

    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx || canvas.width === 0 || canvas.height === 0) return null;

    ctx.drawImage(img, 0, 0);
    const { width, height } = canvas;
    const pixels = ctx.getImageData(0, 0, width, height).data;

    // Ambient/edge sampling rather than a whole-image average — the halo
    // should feel like light escaping the image's own border, not a
    // generic tint of everything inside it.
    let r = 0;
    let g = 0;
    let b = 0;
    let count = 0;
    const sample = (x: number, y: number) => {
      const i = (y * width + x) * 4;
      r += pixels[i];
      g += pixels[i + 1];
      b += pixels[i + 2];
      count++;
    };
    for (let x = 0; x < width; x++) {
      sample(x, 0);
      sample(x, height - 1);
    }
    for (let y = 0; y < height; y++) {
      sample(0, y);
      sample(width - 1, y);
    }

    const color = `rgb(${Math.round(r / count)}, ${Math.round(g / count)}, ${Math.round(b / count)})`;
    haloColorCache.set(imageUrl, color);
    return color;
  } catch {
    // Cross-origin/decoding failures degrade to the caller's own fallback,
    // never to a broken image — the image itself renders regardless.
    return null;
  } finally {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
  }
}
