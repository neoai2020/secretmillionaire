# Supabase dashboard steps (Secret Millionaire Society)

Use a **dedicated** Supabase project for SMS. Do not reuse another app's project or credentials.

## Environment variables

In `.env.local` (local) and your production host:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-sms-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
SUPABASE_SERVICE_ROLE_KEY=<service_role key>   # server only; required for DEV_BYPASS_AUTH DB writes
```

See `DATABASE-SETUP.md` for migrations and table overview.

## Redirect URLs

**Authentication → URL Configuration → Redirect URLs**

Add:

```
https://<your-production-domain>/**
http://localhost:3000/**
http://localhost:3001/**
```

## Reset Password email template

**Authentication → Email Templates → Reset Password**

Use `{{ .ConfirmationURL }}` so each environment's `redirectTo` controls the domain:

```html
<h2>Reset Password</h2>
<p>Follow this link to reset the password for your account:</p>
<p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>
```

SMS calls `resetPasswordForEmail` with `{NEXT_PUBLIC_APP_URL}/auth/callback?next=/reset-password`.

## Confirm signup (if enabled)

Prefer `{{ .ConfirmationURL }}` in the confirm template as well.
