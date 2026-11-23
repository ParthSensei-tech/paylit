import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const host = req.headers.get("host") || "";
  const url = req.nextUrl.clone();

  // Security and indexing response headers
  const response = NextResponse.next();

  // Allow indexing and ensure search bots index canonical versions
  response.headers.set("X-Robots-Tag", "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Canonical Domain Normalization:
  // If production domain is paylit.compliance, normalize www.paylit.compliance -> paylit.compliance
  if (host.startsWith("www.paylit.compliance")) {
    url.host = "paylit.compliance";
    url.port = "";
    return NextResponse.redirect(url, 301);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, images, robots.txt, sitemap.xml
     */
    "/((?!_next/static|_next/image|favicon.ico|images/|robots.txt|sitemap.xml).*)",
  ],
};
