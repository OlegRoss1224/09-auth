import { NextResponse, type NextRequest } from 'next/server';
import { checkSession } from '@/lib/api/serverApi';

interface CookieOptions {
  path?: string;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'lax' | 'strict' | 'none';
  maxAge?: number;
  expires?: Date;
}

const publicRoutes = ['/sign-in', '/sign-up'];
const privateRoutes = ['/profile', '/notes'];

function isMatchingRoute(pathname: string, routes: string[]): boolean {
  return routes.some(
    route => pathname === route || pathname.startsWith(`${route}/`)
  );
}

function parseSetCookieHeader(cookieStr: string) {
  const parts = cookieStr.split(';').map(p => p.trim());
  const [nameValue, ...attributes] = parts;

  const equalsIndex = nameValue.indexOf('=');
  if (equalsIndex === -1) return null;

  const name = nameValue.substring(0, equalsIndex).trim();
  const value = nameValue.substring(equalsIndex + 1).trim();

  const options: CookieOptions = {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  };

  attributes.forEach(attr => {
    const [attrName, attrValue] = attr.split('=').map(s => s.trim());
    const lowerName = attrName.toLowerCase();

    if (lowerName === 'path') options.path = attrValue || '/';
    if (lowerName === 'httponly') options.httpOnly = true;
    if (lowerName === 'secure') options.secure = true;
    if (lowerName === 'samesite') {
      const lowerVal = attrValue?.toLowerCase();
      if (lowerVal === 'lax' || lowerVal === 'strict' || lowerVal === 'none') {
        options.sameSite = lowerVal;
      }
    }
    if (lowerName === 'max-age') options.maxAge = Number(attrValue);
    if (lowerName === 'expires') options.expires = new Date(attrValue);
  });

  return { name, value, options };
}
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const accessToken = request.cookies.get('accessToken')?.value;
  const refreshToken = request.cookies.get('refreshToken')?.value;

  let isAuthenticated = Boolean(accessToken);
  const response = NextResponse.next();

  if (!accessToken && refreshToken) {
    try {
      const sessionResponse = await checkSession();

      if (sessionResponse.status === 200) {
        isAuthenticated = true;

        const setCookieHeader = sessionResponse.headers['set-cookie'];

        if (setCookieHeader) {
          const cookieStrings = Array.isArray(setCookieHeader)
            ? setCookieHeader
            : [setCookieHeader];

          cookieStrings.forEach(cookieStr => {
            const parsed = parseSetCookieHeader(cookieStr);
            if (parsed) {
              response.cookies.set(parsed.name, parsed.value, parsed.options);
            }
          });
        }
      }
    } catch (error) {
      console.error('Помилка оновлення сесії у middleware:', error);
      isAuthenticated = false;
    }
  }

  const isPublicRoute = isMatchingRoute(pathname, publicRoutes);
  const isPrivateRoute = isMatchingRoute(pathname, privateRoutes);

  if (isPublicRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (isPrivateRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/profile/:path*', '/notes/:path*', '/sign-in', '/sign-up'],
};
