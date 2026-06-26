import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
    if (typeof window === 'undefined') {
        console.error('CRITICAL: Missing Supabase environment variables on server side')
    }
}

// createBrowserClient is used here, but it's safe to use on server as well for basic interactions
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)
