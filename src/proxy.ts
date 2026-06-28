import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { resolveOnboardingGate } from '@/lib/onboarding-gate'
import { isDevAuthBypassEnabled } from '@/lib/dev-bypass'

export async function proxy(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()

    const { pathname } = request.nextUrl

    const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/signup') || pathname.startsWith('/forgot-password') || pathname.startsWith('/reset-password') || pathname.startsWith('/auth/callback')
    const isStaticAsset = /\.(?:png|jpe?g|gif|svg|webp|ico|woff2?|ttf|otf|mp4|txt|xml)$/i.test(pathname)
    const isPublicBlogRoute = pathname.startsWith('/sites/')
    const isPublicRoute =
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname === '/favicon.ico' ||
        pathname === '/robots.txt' ||
        pathname === '/sitemap.xml' ||
        isStaticAsset ||
        isPublicBlogRoute
    const isOnboardingRoute = pathname === '/onboarding' || pathname.startsWith('/onboarding/')

    if (isDevAuthBypassEnabled()) {
        if (isAuthRoute && !pathname.startsWith('/auth/callback')) {
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }
        return response
    }

    if (pathname.startsWith('/api')) {
        return response
    }

    if (!user && !isAuthRoute && !isPublicRoute) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    if (user && isAuthRoute) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    if (user && !isPublicRoute) {
        const gate = await resolveOnboardingGate(
            supabase,
            user.id,
            (user.user_metadata ?? null) as Record<string, unknown> | null
        )

        if (gate.isComplete && isOnboardingRoute) {
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }

        if (!gate.isComplete && !isOnboardingRoute) {
            return NextResponse.redirect(new URL('/onboarding', request.url))
        }
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
}
