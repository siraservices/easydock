---
phase: 02-landing-page-and-marina-onboarding
plan: "02"
subsystem: marina-onboarding
tags: [photo-upload, drag-and-drop, geocoding, mapbox, marina-form]
dependency_graph:
  requires: []
  provides: [PhotoDropZone, geocode-api, geocode-backfill]
  affects: [marina-form, phase-3-map]
tech_stack:
  added: []
  patterns: [drag-and-drop-file-upload, server-side-geocoding, tdd-vitest]
key_files:
  created:
    - src/components/photo-drop-zone.tsx
    - src/app/api/marinas/geocode/route.ts
    - scripts/geocode-backfill.ts
    - src/__tests__/photo-drop-zone.test.ts
    - src/__tests__/geocode-api.test.ts
  modified:
    - src/components/marina-form.tsx
    - src/app/api/leads/route.ts
decisions:
  - "PhotoDropZone uses pointer-events-none on children to prevent drag-leave flicker on child element boundaries"
  - "Geocoding runs AFTER marina save so the record persists even if Mapbox fails"
  - "Geocode failure shows a yellow warning banner rather than blocking the form submit"
  - "Mapbox v6 geometry.coordinates is [lng, lat] order — not [lat, lng]"
  - "Backfill script uses service role key directly; does not use createAdminClient helper"
metrics:
  duration: 5 min
  completed_date: "2026-03-10"
  tasks_completed: 2
  files_changed: 7
---

# Phase 2 Plan 2: Photo Drop Zone and Geocoding Summary

**One-liner:** Drag-and-drop photo upload with Airbnb-style hero+thumbnail display, plus server-side Mapbox v6 geocoding that auto-fires after marina save with graceful failure handling.

## Tasks Completed

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | PhotoDropZone component, geocode API route, tests | 47dbeed | photo-drop-zone.tsx, geocode/route.ts, 2 test files |
| 2 | Marina form integration and backfill script | 7c953cd | marina-form.tsx, geocode-backfill.ts |

## What Was Built

**PhotoDropZone component** (`src/components/photo-drop-zone.tsx`):
- Drag-and-drop target with `onDragOver`/`onDragLeave`/`onDrop` handlers
- Filters `dataTransfer.files` to image/* only
- Teal border + background highlight during drag-over; dashed gray border at rest
- Click-to-browse fallback via hidden `<input type="file">` triggered by `inputRef.current?.click()`
- `pointer-events-none` on all children to prevent drag-leave flicker when hovering child elements
- Disabled state (opacity-50, cursor-not-allowed) blocks all interactions
- Shows current count vs max count

**Geocode API route** (`src/app/api/marinas/geocode/route.ts`):
- POST handler accepting `{address: string}`
- Reads `MAPBOX_ACCESS_TOKEN` from server-side `process.env`
- Calls Mapbox Geocoding v6: `api.mapbox.com/search/geocode/v6/forward`
- Returns `{lat, lng}` on success; `{lat: null, lng: null}` on no results or any error
- Returns 400 for missing/empty address or missing token
- Does not use Supabase admin client — no DB access at this layer

**Marina form updates** (`src/components/marina-form.tsx`):
- `handlePhotoUpload` replaced with `handleDroppedFiles(files: File[])`
- `<input type="file">` replaced with `<PhotoDropZone>`
- Airbnb-style photo display: first photo renders large (w-full h-64 object-cover), remaining as 24x24 thumbnails
- `geocodeAndUpdate(marinaId, fullAddress)` called after every successful save
- Yellow warning banner displayed when geocoding returns null or throws
- Marina is always persisted regardless of geocoding outcome

**Geocode backfill script** (`scripts/geocode-backfill.ts`):
- Queries all marinas where `lat IS NULL AND address IS NOT NULL`
- Constructs full address from address + city + state + zip
- Calls Mapbox v6 geocode for each, updates lat/lng on success
- 200ms delay between requests to respect Mapbox rate limits
- Progress logging: "Geocoded: {name} -> {lat}, {lng}" or "Failed: {name}"
- Summary line: "{N} geocoded, {M} failed, {K} skipped"
- Run with: `SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... MAPBOX_ACCESS_TOKEN=... npx tsx scripts/geocode-backfill.ts`

## Tests

14 tests across 2 test files — all passing:
- `src/__tests__/photo-drop-zone.test.ts` (8 tests): image file filtering, drag state logic, onFiles callback
- `src/__tests__/geocode-api.test.ts` (6 tests): input validation, successful geocoding, Mapbox error handling

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed pre-existing TypeScript type error in leads API route**
- **Found during:** Task 2 build verification
- **Issue:** `src/app/api/leads/route.ts` line 43 passed `user_type: string` to Supabase insert that expected `"marina_owner" | "yacht_owner"`, causing a build-blocking type error
- **Fix:** Added type narrowing — `rawUserType` checked against valid enum values before assignment; insert uses `as 'yacht_owner' | 'marina_owner'` cast with validation already done upstream
- **Files modified:** `src/app/api/leads/route.ts`
- **Commit:** 7c953cd (bundled with Task 2)

## Self-Check: PASSED

All created files exist on disk. Both task commits (47dbeed, 7c953cd) verified in git log. 14/14 tests passing.
