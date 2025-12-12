# Public Landing Pages

This folder is reserved for future public marketing pages.

## Current Status

⚠️ **DORMANT - NOT ACTIVE IN ROUTING**

This folder structure is currently dormant and does not affect routing. The root route (`/`) still redirects to `/dashboard` as configured in `src/app/page.tsx`.

## Purpose

This folder will be used in a future feature step to:
- Host public marketing/landing pages
- Provide public-facing content that doesn't require authentication
- Separate public routes from authenticated dashboard routes

## Migration Plan

The root routing will be migrated in a later feature step. At that time:
- The current redirect in `src/app/page.tsx` will be replaced
- Public routes will be activated
- Authentication middleware will be updated to exclude public routes

## Notes

- The `(public)` route group syntax in Next.js App Router allows organizing routes without affecting the URL structure
- This folder does not interfere with existing authentication or routing logic
- All existing protected routes remain unchanged






