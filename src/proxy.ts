import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const url = new URL(request.url);
  const headers = new Headers(request.headers);
  
  // Inject the pathname into the headers so Server Components (like RootLayout) can read it
  headers.set('x-pathname', url.pathname);
  
  return NextResponse.next({
    request: {
      headers
    }
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/settings/backup|api/upload).*)',
  ],
};
