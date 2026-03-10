# Coding Conventions

**Analysis Date:** 2025-03-09

## Naming Patterns

**Files:**
- Components: PascalCase with .tsx extension (e.g., `navbar.tsx`, `slip-card.tsx`)
- Pages: Lowercase with hyphens for multi-word names (e.g., `page.tsx` in route segments)
- Utility modules: kebab-case with .ts extension (e.g., `format.ts`, `client.ts`)
- Type/interface modules: filename.ts (e.g., `database.ts` for all database types)

**Functions:**
- Component functions: PascalCase, default export (e.g., `export default function Navbar()`)
- Utility functions: camelCase (e.g., `formatPrice()`, `formatDate()`, `calculateNights()`)
- Event handlers: camelCase prefixed with `handle` (e.g., `handleSubmit()`, `handlePhotoUpload()`, `handleSignOut()`)
- Async utility functions: camelCase with async keyword (e.g., `async function uploadMarinaPhoto()`)

**Variables:**
- State variables: camelCase, short descriptive names (e.g., `const [email, setEmail]`, `const [loading, setLoading]`)
- Boolean variables: camelCase, prefixed with is/has/needs (e.g., `isSubmitting`, `hasPhotos`, `needsConfirmation`)
- Local constants: camelCase in function scope, SCREAMING_SNAKE_CASE in module scope (see AMENITIES in `constants.ts`)
- Generic types: capitalize first letter (e.g., `Profile`, `Marina`, `Slip`, `SlipWithMarina`)

**Types:**
- Database row types: PascalCase, mapped from database tables (e.g., `Profile`, `Marina`, `Slip`, `Booking`)
- Type aliases: PascalCase with descriptive names (e.g., `SlipWithMarina`, `SignUpResult`, `SignInResult`)
- Interface names: PascalCase, often used for component props (e.g., `MarinaFormProps`, `SlipCardProps`)
- Enum-like constants: SCREAMING_SNAKE_CASE in module scope (e.g., `AMENITIES`, `VESSEL_TYPES`, `DEFAULT_CITY`)

## Code Style

**Formatting:**
- No explicit formatter configured; ESLint is present in devDependencies (v9.19.0)
- Indentation: 2 spaces (observed across all files)
- Line length: No hard limit observed; pragmatic wrapping
- Trailing commas: Used in multi-line arrays and objects
- Quotes: Double quotes for strings

**Linting:**
- ESLint enabled: `eslint: ^9.19.0`, `eslint-config-next: ^15.1.6`
- Run via `npm run lint`
- Default Next.js ESLint rules (config provided by Next.js)
- Notable rule in use: `@typescript-eslint/no-explicit-any` (see `src/lib/supabase/storage.ts:1`)
- Type annotations required for function parameters and return types

## Import Organization

**Order:**
1. React/Next.js built-ins (`import { useState } from "react"`, `import Link from "next/link"`)
2. Next.js utilities (`import { useRouter } from "next/navigation"`)
3. Third-party packages (`import Stripe from "stripe"`, `import { createBrowserClient } from "@supabase/ssr"`)
4. Absolute imports from project (`import { useAuth } from "@/lib/auth-context"`)
5. Type imports (always `import type { ... }`)

**Path Aliases:**
- `@/*` resolves to `./src/*` (configured in `tsconfig.json`)
- Used consistently: `@/components/`, `@/lib/`, `@/types/`
- No relative imports observed in the codebase (always use absolute `@/` paths)

**Example from `src/components/marina-form.tsx`:**
```typescript
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { uploadMarinaPhoto, deleteMarinaPhoto } from "@/lib/supabase/storage";
import { useAuth } from "@/lib/auth-context";
import { AMENITIES } from "@/lib/constants";
import type { Database } from "@/types/database";
```

## Error Handling

**Patterns:**
- Try-catch blocks for async operations (see `src/app/api/checkout/route.ts:108-139`)
- Error objects logged with `console.error()` including context (e.g., "Checkout error:", err)
- Form errors stored in state as nullable strings: `const [error, setError] = useState<string | null>(null)`
- Error display in UI as banner above form with red background and border
- Type narrowing for caught errors: `err instanceof Error ? err.message : "fallback message"`
- Database/API operations return error in response tuple: `const { data, error } = await supabase.from(...)`
- Auth result types include error field: `interface SignUpResult { error: string | null; ... }`
- HTTP errors returned as `NextResponse.json({ error: "message" }, { status: code })`

**Example from `src/components/marina-form.tsx` (lines 82-124):**
```typescript
async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  if (!user) return;
  setError(null);
  setIsSubmitting(true);

  try {
    if (initialData) {
      const { error: updateError } = await supabase
        .from("marinas")
        .update(marinaData as never)
        .eq("id", initialData.id);

      if (updateError) throw updateError;
      router.push(`/dashboard/marinas/${initialData.id}`);
    } else {
      const { data, error: insertError } = (await supabase
        .from("marinas")
        .insert({ ...marinaData, owner_id: user.id } as never)
        .select()
        .single()) as unknown as { data: { id: string } | null; error: Error | null };

      if (insertError) throw insertError;
      router.push(`/dashboard/marinas/${data!.id}`);
    }
  } catch (err) {
    setError(err instanceof Error ? err.message : "Failed to save marina.");
    setIsSubmitting(false);
  }
}
```

## Logging

**Framework:** `console` object (no specialized logging library)

**Patterns:**
- `console.error()` used for exceptions and validation failures
- Error logging includes context prefix: `"Error fetching profile:"`, `"Checkout error:"`, `"Webhook signature verification failed:"`
- No info/debug/warn calls observed
- Errors logged immediately at catch point (see `src/lib/auth-context.tsx:60`, `src/app/api/checkout/route.ts:134`)
- Should add logging context rather than silent failures

## Comments

**When to Comment:**
- Comments above complex logic blocks (e.g., "// Check for date conflicts" in `src/app/api/checkout/route.ts:64`)
- Inline comments for non-obvious state transitions (e.g., "// Email confirmation required" in `src/lib/auth-context.tsx:114`)
- ESLint disable comments used when suppressing valid warnings (e.g., `// eslint-disable-next-line @typescript-eslint/no-explicit-any`)
- Minimal comments observed; code structure and naming primarily convey intent

**JSDoc/TSDoc:**
- Not currently used in the codebase
- TypeScript types provide documentation through type signatures
- Function return types always explicit (no implicit `any`)

## Function Design

**Size:**
- Component functions: typically 150-370 lines (largest is `src/components/marina-form.tsx` at 371 lines)
- Helper functions: 5-20 lines (utilities in `src/lib/utils/format.ts` are concise)
- Event handlers: 10-50 lines, extracted inline handlers for clarity
- API route handlers: 100-140 lines with clear separation of concerns

**Parameters:**
- Props destructured in function signature: `function SlipCard({ slip, checkIn, checkOut }: SlipCardProps)`
- Database client and router passed via context/hooks, not props
- Optional parameters use `?:` in interfaces
- Callback functions passed as optional props (e.g., `onClick`, `onChange`)

**Return Values:**
- React components return JSX.Element (implicit)
- Utility functions have explicit return type annotations
- Async functions return Promise (always annotated)
- No implicit returns of `undefined`; functions explicitly return or throw

## Module Design

**Exports:**
- Components always export as default: `export default function ComponentName()`
- Utilities exported as named exports: `export function utilityName()`
- Types exported as `export type` or `export interface`
- Multiple utilities in one file: each gets named export (see `src/lib/utils/format.ts` with 3 exports)
- Database client creators exported as named functions: `export function createClient()`

**Barrel Files:**
- Not used in the codebase
- Each component imported from its own file
- No index.ts re-exports observed

## React-Specific Conventions

**Component Organization:**
- "use client" directive at top of client components (e.g., `src/components/marina-form.tsx:1`)
- Hooks imported and used at component top level
- State initialization before any JSX
- Event handlers defined after state setup, before return

**Hook Usage:**
- `useState` for component state: `const [email, setEmail] = useState("")`
- `useEffect` for initialization and subscriptions with explicit dependency arrays
- `useMemo` for memoized client instances: `const supabase = useMemo(() => createClient(), [])`
- `useCallback` for memoized callbacks used in search: `const search = useCallback(async () => {...}, [deps])`
- Custom hooks for context: `const { user, profile } = useAuth()`
- Context consumer hook throws error if used outside provider: `throw new Error("useAuth must be used within an AuthProvider")`

**Conditional Rendering:**
- Ternary operators for simple conditions: `user ? <Dashboard /> : <NotLoggedIn />`
- Multi-condition with early returns: guard clauses in effect hooks
- Fragment `<>...</>` for grouping without wrapper elements
- Empty state UI with emoji placeholders (e.g., `<div className="text-navy-300 text-4xl">&#9875;</div>`)

---

*Convention analysis: 2025-03-09*
