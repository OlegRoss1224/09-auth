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

          const tempRes = new NextResponse();
          cookieStrings.forEach(c => tempRes.headers.append('set-cookie', c));

          const requestHeaders = new Headers(request.headers);

          tempRes.cookies.getAll().forEach(c => {
            response.cookies.set(c.name, c.value, {
              path: c.path ?? '/',
              httpOnly: c.httpOnly ?? true,
              secure: c.secure ?? process.env.NODE_ENV === 'production',
              expires: c.expires,
              maxAge: c.maxAge,
            });
          });

          const updatedCookies = response.cookies
            .getAll()
            .map(c => `${c.name}=${c.value}`)
            .join('; ');

          requestHeaders.set('cookie', updatedCookies);

          const nextResponse = NextResponse.next({
            request: {
              headers: requestHeaders,
            },
          });

          response.cookies.getAll().forEach(c => {
            nextResponse.cookies.set(c.name, c.value, {
              path: c.path ?? '/',
              httpOnly: c.httpOnly ?? true,
              secure: c.secure ?? process.env.NODE_ENV === 'production',

              expires: c.expires,
              maxAge: c.maxAge,
            });
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
