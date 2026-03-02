# Changelog

## [Unreleased]

### Removed – Updates feature replaced by Community/Discord CTA

- **What changed**
  - The in-app "Updates" feed (mentor posts, markdown, image uploads) has been fully removed.
  - The route `/updates` now shows a **Community** page with a short explanation and a single CTA: "Join de Discord", linking to the free Discord invite. Auth is still required to view `/updates`.
  - Navigation no longer shows "Updates"; the same route appears as **Community** (sidebar and mobile nav).
  - Removed: `src/lib/updates.ts`, `src/components/MarkdownRenderer.tsx`. Removed dependencies: `marked`, `dompurify`, `@types/dompurify`.
  - Database: tables `updates` and `update_reads` are dropped via the migration in `supabase/migrations/`.

- **Supabase Storage – manual step**
  - The bucket `update-images` is no longer referenced in code. To remove it in Supabase:
    1. Open **Supabase Dashboard** → **Storage** → **Buckets**.
    2. Find the bucket **update-images**.
    3. Open the **…** menu for that bucket → **Delete bucket** (or equivalent). Confirm deletion.
