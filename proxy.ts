import { NextResponse, type NextRequest } from 'next/server';
import { checkSession } from '@/lib/api/serverApi';

const publicRoutes = ['/sign-in', '/sign-up'];
const privateRoutes = ['/profile', '/notes'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const accessToken = request.cookies.get('accessToken')?.value;
  const refreshToken = request.cookies.get('refreshToken')?.value;

  let isAuthenticated = Boolean(accessToken);
  let response = NextResponse.next();

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

          const requestHeaders = new Headers(request.headers);

          cookieStrings.forEach(cookieStr => {
            response.headers.append('set-cookie', cookieStr);
          });

          const currentCookies = request.headers.get('cookie') || '';
          const newCookies = response.cookies
            .getAll()
            .map(c => `${c.name}=${c.value}`)
            .join('; ');

          const combinedCookies = [currentCookies, newCookies]
            .filter(Boolean)
            .join('; ');

          requestHeaders.set('cookie', combinedCookies);

          const nextResponse = NextResponse.next({
            request: {
              headers: requestHeaders,
            },
          });

          cookieStrings.forEach(cookieStr => {
            nextResponse.headers.append('set-cookie', cookieStr);
          });

          response = nextResponse;
        }
      }
    } catch (error) {
      console.error('Помилка оновлення сесії у middleware:', error);
      isAuthenticated = false;
    }
  }

  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  const isPrivateRoute = privateRoutes.some(route =>
    pathname.startsWith(route)
  );

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
