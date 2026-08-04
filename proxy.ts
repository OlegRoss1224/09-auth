import { NextResponse, type NextRequest } from 'next/server';
import { checkSession } from '@/lib/api/serverApi';

const publicRoutes = ['/sign-in', '/sign-up'];

const privateRoutes = ['/profile', '/notes'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const accessToken = request.cookies.get('accessToken')?.value;
  const refreshToken = request.cookies.get('refreshToken')?.value;

  let isAuthenticated = Boolean(accessToken);
  const response = NextResponse.next();

  if (!accessToken && refreshToken) {
    try {
      const sessionResponse = await checkSession();
      const sessionData = sessionResponse.data;
      const setCookieHeader = sessionResponse.headers['set-cookie'];

      if (sessionResponse.status === 200 && sessionData) {
        isAuthenticated = true;

        if (setCookieHeader) {
          if (Array.isArray(setCookieHeader)) {
            setCookieHeader.forEach(cookie => {
              response.headers.append('set-cookie', cookie);
            });
          } else {
            response.headers.set('set-cookie', setCookieHeader);
          }
        }
      }
    } catch (error) {
      console.error('Помилка перевірки сесії:', error);
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
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
