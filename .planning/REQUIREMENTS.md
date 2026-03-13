# Requirements: EasyDock

**Defined:** 2026-03-13
**Core Value:** A yacht owner can find an available slip, book it, and pay — and a marina owner receives that booking and gets paid.

## v1.1 Requirements

Requirements for Vercel deployment migration. Each maps to roadmap phases.

### Hosting Migration

- [ ] **HOST-01**: Netlify configuration removed (netlify.toml deleted)
- [ ] **HOST-02**: next.config.ts cleaned of Netlify-specific settings
- [ ] **HOST-03**: Security headers (X-Frame-Options, XSS protection, etc.) preserved via Next.js config
- [ ] **HOST-04**: App builds and deploys successfully on Vercel
- [ ] **HOST-05**: Vercel Analytics installed and `<Analytics />` component added to root layout

## Future Requirements

None — focused migration milestone.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Edge runtime conversion | Not needed — standard Node.js runtime works on Vercel |
| Preview deployments config | Vercel provides this by default |
| CI/CD pipeline changes | Vercel auto-deploys from GitHub |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| HOST-01 | Phase 6 | Pending |
| HOST-02 | Phase 6 | Pending |
| HOST-03 | Phase 6 | Pending |
| HOST-04 | Phase 6 | Pending |
| HOST-05 | Phase 6 | Pending |

**Coverage:**
- v1.1 requirements: 5 total
- Mapped to phases: 5
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-13*
*Last updated: 2026-03-13 after Phase 6 roadmap created*
