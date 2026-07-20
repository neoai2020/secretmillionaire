# Secret Millionaire Society — Mobile Guide

## Shell
- Viewport: `viewportFit: cover`, `themeColor: #070D0D`
- PWA: `app/manifest.ts`, `appleWebApp` in root layout
- Body: `min-h-dvh`, `overscroll-behavior-y: none`, inputs ≥16px on mobile

## Navigation
- Desktop: collapsible sidebar (`localStorage` key `sms_sidebar_collapsed`)
- Mobile: slim top bar (logo only) + `BottomNav` (Home, Topic, Links, Training, More)
- More sheet: remaining pages, Society Access, exclusive offers from sidebar config, Sign out
- Content clearance: `pb-24` on mobile main canvas

## Z-order
- Bottom nav `z-50`
- More sheet `z-[70]`
- Video overlay `z-[120]`

## Rules
- No floating fake toasts on mobile
- Generation banners contextual to CTAs only
- Brand wordmark: `whitespace-nowrap` on logo text
