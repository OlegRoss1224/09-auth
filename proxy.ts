import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { parseSetCookie } from 'cookie';
import { checkSession } from '@/lib/api/serverApi';

const publicRoutes = ['/sign-in', '/sign-up'];
const privateRoutes = ['/profile', '/notes'];

function isMatchingRoute(pathname: string, routes: string[]): boolean {
  return routes.some(
    route => pathname === route || pathname.startsWith(`${route}/`)
  );
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;
  const refreshToken = cookieStore.get('refreshToken')?.value;

  let isAuthenticated = Boolean(accessToken);

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
            const parsed = parseSetCookie(cookieStr);

            if (parsed && parsed.name && parsed.value !== undefined) {
              cookieStore.set(parsed.name, parsed.value, {
                path: parsed.path ?? '/',
                httpOnly: parsed.httpOnly ?? true,
                secure: parsed.secure ?? process.env.NODE_ENV === 'production',

                expires: parsed.expires,
                maxAge: parsed.maxAge,
              });
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

  return NextResponse.next();
}

export const config = {
  matcher: ['/profile/:path*', '/notes/:path*', '/sign-in', '/sign-up'],
};
