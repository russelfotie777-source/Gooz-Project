import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

// Called by the Laravel admin panel (see backend's RevalidateFrontendCache
// job) right after something a shopper sees changes — a product toggled
// active/inactive, a category/brand edited, a banner or homepage section
// updated, etc. Exists because self-hosted ISR (no CDN in front, just
// `next start` behind Nginx) doesn't reliably background-revalidate a
// stale page on its own: confirmed live when deactivating a product left
// it showing on the homepage well past its 60s revalidate window, and the
// only fix at the time was a full rebuild. This lets the admin side push
// an immediate, targeted cache bust instead.
//
// Auth is a single shared secret (REVALIDATE_SECRET, same value in this
// app's env and the backend's .env) sent as a bearer token — there's no
// user session to check here, this is server-to-server. Comparable to
// ENKAP_WEBHOOK_TOKEN's role on the backend side: not cryptographically
// signed, just a long random value only the two servers know.
export async function POST(request: NextRequest): Promise<NextResponse> {
  const secret = process.env.REVALIDATE_SECRET;
  const provided = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

  if (!secret || provided !== secret) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  let body: { tags?: unknown; paths?: unknown };
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const tags = Array.isArray(body.tags) ? body.tags.filter((t): t is string => typeof t === "string") : [];
  const paths = Array.isArray(body.paths) ? body.paths.filter((p): p is string => typeof p === "string") : [];

  for (const tag of tags) {
    revalidateTag(tag);
  }

  for (const path of paths) {
    revalidatePath(path);
  }

  // Always bust the homepage shell itself — it's the one page almost every
  // tag above can affect (products, categories, brands, banners, homepage
  // sections all render there), and it's cheap to also refresh when the
  // caller only meant to invalidate e.g. a single product page.
  if (tags.length > 0 || paths.length === 0) {
    revalidatePath("/[lang]", "page");
  }

  return NextResponse.json({ revalidated: true, tags, paths });
}
