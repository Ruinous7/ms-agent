import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export const updateSession = async (request: NextRequest) => {
  // This `try/catch` block is only here for the interactive tutorial.
  // Feel free to remove once you have Supabase connected.
  try {
    // Create an unmodified response
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value),
            );
            response = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options),
            );
          },
        },
      },
    );

    // This will refresh session if expired - required for Server Components
    // https://supabase.com/docs/guides/auth/server-side/nextjs
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    // protected routes
    if (request.nextUrl.pathname.startsWith("/protected") && userError) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    // Check if user has completed the questionnaire for protected routes
    // Skip this check for the questionnaire page itself
    if (
      request.nextUrl.pathname.startsWith("/protected") && 
      !request.nextUrl.pathname.startsWith("/protected/questionnaire") && 
      user
    ) {
      // Fetch the user's profile with business diagnosis
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('business_diagnosis')
        .eq('id', user.id)
        .single();

      // If profile doesn't exist or no business diagnosis, redirect to questionnaire
      if (profileError || !profile?.business_diagnosis) {
        return NextResponse.redirect(new URL("/protected/questionnaire", request.url));
      }
    }

    if (request.nextUrl.pathname === "/" && !userError) {
      return NextResponse.redirect(new URL("/protected", request.url));
    }

    return response;
  } catch (e) {
    // If you are here, a Supabase client could not be created!
    // This is likely because you have not set up environment variables.
    // Check out http://localhost:3000 for Next Steps.
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
  }
};