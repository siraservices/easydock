# Testing Patterns

**Analysis Date:** 2025-03-09

## Test Framework

**Runner:**
- No test runner configured (Jest, Vitest, or Playwright not in devDependencies)
- Testing not currently implemented in the MVP

**Assertion Library:**
- Not applicable - no test framework integrated

**Run Commands:**
```bash
npm run dev              # Development server only
npm run build            # Production build
npm run lint             # ESLint validation
npm run start            # Production server
```

## Test File Organization

**Current State:**
- No test files in project (`src/`) - no `.test.ts`, `.test.tsx`, `.spec.ts` files present
- Test infrastructure not yet established
- Node modules contain test definitions for dependencies (e.g., @supabase/ssr) but no project tests

## Testing Coverage

**Current Coverage:** 0%

**Requirements:** None enforced

**Gap Analysis:**
Critical areas lacking test coverage:
- `src/lib/auth-context.tsx` (175 lines) - Auth context, signup, signin, signOut logic
- `src/app/api/checkout/route.ts` (140 lines) - Stripe checkout session creation, validation
- `src/app/api/webhooks/stripe/route.ts` (66 lines) - Webhook event handling
- `src/lib/supabase/storage.ts` (34 lines) - File upload/deletion logic
- `src/lib/utils/format.ts` (20 lines) - Date/price formatting
- All components (booking-widget, marina-form, search-filters, slip-form-modal, etc.)
- All page components (search, bookings, dashboard, signup, login)

## Recommended Testing Strategy

**For Next Phase Implementation:**

### Test Framework Setup
Recommend **Vitest** over Jest for faster performance with TypeScript:
```bash
npm install -D vitest @vitest/ui jsdom @testing-library/react @testing-library/jest-dom
```

Create `vitest.config.ts`:
```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: ["node_modules/", "src/test/"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

### Test Structure Recommendation

**Location:**
- Co-locate tests with source files: `component.tsx` + `component.test.tsx` in same directory
- Or create `src/__tests__/` directory for integration/e2e tests

**File Naming:**
- Unit tests: `*.test.ts`, `*.test.tsx`
- Integration tests: `*.integration.test.ts`
- E2E tests: `*.e2e.test.ts`

### Priority Testing Areas

**Tier 1 (Critical):**
1. `src/lib/auth-context.tsx` - Auth state, signup/signin
   - Mock Supabase client
   - Test user state transitions
   - Test profile fetching
   - Test error handling (network errors, validation)

2. `src/app/api/checkout/route.ts` - Payment flow
   - Mock Stripe client
   - Mock Supabase queries
   - Test validation (missing fields, date conflicts)
   - Test booking creation
   - Test error responses (401, 400, 409, 500)

3. `src/lib/supabase/storage.ts` - File operations
   - Mock Supabase storage
   - Test upload with UUID generation
   - Test deletion with path extraction
   - Test error handling

**Tier 2 (Important):**
4. Form components: `marina-form.tsx`, `slip-form-modal.tsx`
   - Test input changes update state
   - Test form validation
   - Test submission (success/error cases)
   - Test photo upload integration

5. Context consumers: `navbar.tsx`, `protected-route.tsx`
   - Test rendering based on auth state
   - Test conditional link display
   - Test loading states

**Tier 3 (Enhanced):**
6. Utility functions: `format.ts`
   - Price formatting: USD currency, decimals
   - Date formatting: correct locale
   - Night calculation: date math

7. Pages: `search/page.tsx`, `bookings/page.tsx`, `slips/[id]/page.tsx`
   - Test data fetching
   - Test filter application
   - Test error states

### Testing Patterns (When Implemented)

**Unit Test Example (Utility):**
```typescript
import { describe, it, expect } from "vitest";
import { formatPrice, formatDate, calculateNights } from "@/lib/utils/format";

describe("format utilities", () => {
  it("should format price as USD currency", () => {
    expect(formatPrice(99.99)).toBe("$99.99");
    expect(formatPrice(1500)).toBe("$1,500.00");
  });

  it("should format date correctly", () => {
    expect(formatDate("2025-03-15")).toBe("Mar 15, 2025");
  });

  it("should calculate nights between dates", () => {
    expect(calculateNights("2025-03-15", "2025-03-18")).toBe(3);
    expect(calculateNights("2025-03-15", "2025-03-15")).toBe(1);
  });
});
```

**Component Test Example (With Mocks):**
```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Navbar from "@/components/navbar";
import * as authContext from "@/lib/auth-context";

describe("Navbar", () => {
  beforeEach(() => {
    vi.spyOn(authContext, "useAuth").mockReturnValue({
      user: null,
      profile: null,
      loading: false,
      signUp: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn(),
    });
  });

  it("should show login and signup links when not authenticated", () => {
    render(<Navbar />);
    expect(screen.getByText("Log In")).toBeInTheDocument();
    expect(screen.getByText("Sign Up")).toBeInTheDocument();
  });

  it("should show dashboard and logout when marina owner authenticated", () => {
    vi.spyOn(authContext, "useAuth").mockReturnValue({
      user: { id: "user-123" } as any,
      profile: { role: "marina_owner" } as any,
      loading: false,
      signUp: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn(),
    });

    render(<Navbar />);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });
});
```

**API Route Test Example:**
```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/checkout/route";

describe("POST /api/checkout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 when user not authenticated", async () => {
    const request = new Request("http://localhost/api/checkout", {
      method: "POST",
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    expect(response.status).toBe(401);
  });

  it("should return 400 when required fields missing", async () => {
    // Mock user from Supabase
    // Send incomplete body
    // Assert 400 response with error message
  });
});
```

**Mocking Patterns:**

Supabase client mock:
```typescript
vi.mock("@/lib/supabase/client", () => ({
  createClient: vi.fn(() => ({
    from: vi.fn((table) => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: {}, error: null }),
    })),
    auth: {
      signUp: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn(),
    },
  })),
}));
```

Stripe mock:
```typescript
vi.mock("stripe", () => ({
  default: vi.fn(() => ({
    checkout: {
      sessions: {
        create: vi.fn().mockResolvedValue({ url: "https://stripe.com/pay" }),
      },
    },
    webhooks: {
      constructEvent: vi.fn(),
    },
  })),
}));
```

### Coverage Targets

For MVP launch, prioritize:
- API routes: 80% coverage minimum (payment, webhooks, auth)
- Utilities: 100% coverage (small, pure functions)
- Context: 70% coverage (complex state, hard to test fully)
- Components: 50% coverage (focus on user interactions, conditional rendering)

### E2E Testing (Future)

When needed for regression prevention, add Playwright:
```bash
npm install -D @playwright/test
```

Key E2E flows:
1. User signup → email confirmation → login
2. Marina owner creates marina + slips
3. Boat owner searches slips → books slip → completes Stripe payment
4. Marina owner approves/confirms booking

---

*Testing analysis: 2025-03-09*
