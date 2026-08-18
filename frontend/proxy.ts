import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { defaultLocale, isLocale, locales } from "@/lib/i18n/config";

// Next.js 16 renamed middleware.ts -> proxy.ts (see
// node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md).
// Every request without a /fr or /en prefix gets redirected to one, chosen
// from the Accept-Language header when possible, falling back to French.
function getLocale(request: NextRequest): string {
  const cookieLocale = request.cookies.get("shopitech-locale")?.value;
  if (cookieLocale && isLocale(cookieLocale)) return cookieLocale;

  const acceptLanguage = request.headers.get("accept-language");
  if (acceptLanguage) {
    const preferred = acceptLanguage.split(",").map((part) => part.split(";")[0].trim().slice(0, 2));
    const match = preferred.find((code) => isLocale(code));
    if (match) return match;
  }

  return defaultLocale;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const pathnameHasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );
  if (pathnameHasLocale) return NextResponse.next();

  const locale = getLocale(request);
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    // Skip _next, api routes, and files with an extension (icons, images,
    // manifest, etc.) served from public/.
    "/((?!_next|api|.*\\..*).*)",
  ],
};
