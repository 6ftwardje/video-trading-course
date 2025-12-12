import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Skip middleware entirely for non-protected routes
  // The protected layout lives at /(protected)/*
  // Route groups don't appear in URLs, so the actual URL structure is:
  // /dashboard, /module, /lesson, etc.
  const protectedPaths = [
    "/dashboard",
    "/module",
    "/lesson",
    "/exam",
    "/praktijk",
    "/mentorship",
    "/course-material",
    "/account",
  ];

  const isProtected = protectedPaths.some((p) =>
    req.nextUrl.pathname.startsWith(p)
  );

  // Always allow auth callback
  if (req.nextUrl.pathname === "/auth/callback") {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      const supabase = createServerClient(supabaseUrl, supabaseKey, {
        cookies: {
          getAll() {
            return req.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              res.cookies.set(name, value, options);
            });
          },
        },
      });
      // Refresh the session to handle code exchange from email confirmation
      await supabase.auth.getSession();
    }
    return res;
  }

  if (!isProtected) {
    return res; // Public route → no auth check
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res;
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return req.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          res.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    const redirectUrl = new URL("/login", req.url);
    redirectUrl.searchParams.set("redirectedFrom", req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/module/:path*",
    "/lesson/:path*",
    "/exam/:path*",
    "/praktijk/:path*",
    "/mentorship/:path*",
    "/course-material/:path*",
    "/account/:path*",
    "/auth/callback",
  ],
};

