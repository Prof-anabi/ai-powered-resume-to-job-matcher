import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  // Create a Supabase client configured to use cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => request.cookies.get(name)?.value,
        set: (name, value, options) => {
          // This is used for setting cookies in the response
          const response = NextResponse.next();
          response.cookies.set(name, value, options);
          return response;
        },
        remove: (name, options) => {
          // This is used for removing cookies in the response
          const response = NextResponse.next();
          response.cookies.delete(name, options);
          return response;
        },
      },
    }
  );

  // Refresh session if expired - required for Server Components
  // https://supabase.com/docs/guides/auth/auth-helpers/nextjs#managing-session-with-middleware
  const { data: { session } } = await supabase.auth.getSession();

  // If the user is not signed in and the route is protected, redirect to login
  if (!session && isProtectedRoute(request.nextUrl.pathname)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/login';
    redirectUrl.searchParams.set('redirectedFrom', request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // If user is signed in and trying to access auth pages, redirect to dashboard
  if (session && isAuthRoute(request.nextUrl.pathname)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/dashboard';
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

// Define protected routes that require authentication
function isProtectedRoute(pathname: string): boolean {
  const protectedRoutes = [
    '/dashboard',
    '/dashboard/resumes',
    '/dashboard/jobs',
    '/dashboard/applications',
    '/dashboard/matches',
    '/dashboard/profile',
  ];

  return protectedRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
}

// Routes for authentication (login/register)
function isAuthRoute(pathname: string): boolean {
  const authRoutes = ['/login', '/register'];
  return authRoutes.includes(pathname);
}

export const config = {
  // Matcher for routes that should run the middleware
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};