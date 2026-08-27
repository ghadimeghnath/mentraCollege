import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuthRoute = req.nextUrl.pathname.includes("/login") || req.nextUrl.pathname.includes("/reset-password");
    const isLoggedIn = !!token;

    if (isAuthRoute) {
      if (isLoggedIn) {
        return NextResponse.redirect(new URL(`/${(token.role as string).toLowerCase()}/`, req.nextUrl));
      }
      return NextResponse.next();
    }

    if (!isLoggedIn) {
      // Find the intended role from the path if they are trying to access e.g., /teacher/something
      const pathParts = req.nextUrl.pathname.split('/');
      const role = pathParts[1];
      if (['admin', 'teacher', 'mentor', 'student', 'parent'].includes(role)) {
        return NextResponse.redirect(new URL(`/${role}/login`, req.nextUrl));
      }
      // If none of those, redirect to student login as a safe fallback
      return NextResponse.redirect(new URL(`/student/login`, req.nextUrl));
    }

    // RBAC: If the user is logged in, prevent them from accessing other roles' dashboards
    const userRole = (token.role as string).toLowerCase();
    const pathParts = req.nextUrl.pathname.split('/');
    const section = pathParts[1];
    const allowedSections = ['admin', 'teacher', 'mentor', 'student', 'parent'];

    if (allowedSections.includes(section) && section !== userRole) {
      // Redirect them to their own dashboard if they try to access another role's area
      return NextResponse.redirect(new URL(`/${userRole}/`, req.nextUrl));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: () => true, // We handle the authorization logic inside the middleware function
    },
  }
);

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
