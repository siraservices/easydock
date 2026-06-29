export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  readingTime: number;
  category: 'marina-owners' | 'boat-owners' | 'news';
  content: string;
}

export const posts: BlogPost[] = [
  {
    slug: 'how-easydock-works-for-marina-owners',
    title: 'How EasyDock Works for Marina Owners',
    description:
      'A step-by-step look at how marina operators in South Florida are listing their slips, managing bookings, and getting paid through EasyDock.',
    date: '2026-06-20',
    readingTime: 5,
    category: 'marina-owners',
    content: `
Marina owners across South Florida are sitting on one of the most underutilized assets in boating: empty slips. EasyDock was built to fix that — and the setup takes less than 30 minutes.

## The Problem We Solve

Traditional marina slip management runs on phone calls, paper ledgers, and word-of-mouth referrals. Waitlists stretch years. Pricing is inconsistent. When a regular tenant cancels last-minute, that revenue evaporates because there's no system to fill the slip quickly.

EasyDock gives your marina a digital storefront that works around the clock.

## Getting Started: Claim Your Marina

If you own or operate a marina in South Florida, your marina is already in our database — imported from public records and industry directories. The first step is claiming your listing:

1. Visit [EasyDock.com/claim](/claim)
2. Search for your marina by name or address
3. Verify ownership (we'll prompt you to sign in or create an account)
4. Your marina is now yours to manage

Claiming takes about two minutes.

## Setting Up Your Slips

Once your marina is claimed, you can add individual slip listings from your dashboard:

- **Dimensions** — length, beam, and draft limits
- **Amenities** — shore power (30A/50A/100A), water hookup, pump-out, Wi-Fi
- **Pricing** — daily, weekly, or monthly rates
- **Availability** — block out dates for permanent tenants or maintenance

Each slip gets its own detail page on EasyDock with photos, specs, and a live booking calendar.

## How Bookings Work

Boat owners browse your listings, select their dates, enter vessel information, and pay through Stripe — all online. Here's what happens on your end:

1. You receive a booking request notification by email
2. Review the booking in your dashboard inbox
3. Approve or decline within 48 hours
4. If approved, payment is released to your Stripe account on your plan's payout schedule

You always approve before any money moves. No surprises.

## Pricing for Marina Owners

EasyDock offers a 90-day free trial on every plan — no credit card required. After your trial:

- **Starter** — $99/month + 12% commission, up to 10 slip listings
- **Standard** — $199/month + 10% commission, up to 20 listings, boosted search placement
- **Premium** — $249/month + 6% commission, unlimited listings, featured placement, verified badge

The higher the plan, the lower the commission rate. For high-volume marinas, the math usually favors Standard or Premium within the first month of active bookings.

## What Boat Owners Pay

Boat owners pay a 5% service fee at checkout — on top of your listed slip rate. Your advertised rate is what you receive (minus the commission on your plan). EasyDock does not mark up your pricing on the marina owner side.

## Why Marina Owners Choose EasyDock

- **Zero risk**: 90 days free, cancel anytime
- **You stay in control**: approve or decline every booking
- **Automated payments**: Stripe Connect handles payouts directly to your bank
- **Real visibility**: your marina shows up in search results for boat owners actively looking for slips in your area

## Ready to List?

Head to [EasyDock.com/claim](/claim) to find and claim your marina, or [sign up as a marina owner](/signup) if you'd like to add a new listing from scratch.

Questions? Email us at hello@easydock.com — we reply within one business day.
    `.trim(),
  },
  {
    slug: 'why-south-florida-marinas-are-going-digital',
    title: 'Why South Florida Marinas Are Going Digital',
    description:
      "Paper-based slip management costs marinas real revenue. Here's why digital booking is no longer optional for South Florida operators.",
    date: '2026-06-25',
    readingTime: 4,
    category: 'marina-owners',
    content: `
South Florida is home to more registered vessels than almost anywhere else in the country. Miami-Dade, Broward, and Palm Beach counties together account for over 100,000 registered boats — and demand for slip space is outpacing supply by a wide margin.

Yet most marinas still manage availability through spreadsheets, phone calls, and waiting lists that stretch years.

## The Revenue Cost of Analog Operations

When a boat owner calls to inquire about slip availability, the answer is often "let me check and call you back." That callback may happen — or it may not. Meanwhile, the boat owner has already called two other marinas.

**Missed calls = missed revenue.** A single unfilled slip at $75/day represents $27,375 per year in lost income. For a marina with 50 slips, the math gets uncomfortable quickly.

## Boaters Expect Online Booking

The customers marinas compete for — boat owners in the 35–65 demographic with household incomes above $150,000 — book their hotels, flights, and vacation rentals online. They expect the same experience when looking for slip space.

Phone-only marinas are invisible to this audience. If you're not bookable online, you don't exist for an increasing share of the market.

## The Rise of Short-Term Slip Demand

Historically, marina revenue came from annual contracts with local boat owners. That model is shifting. More boaters are:

- **Cruising the ICW and East Coast** and needing transient slips for 1–7 nights
- **Seasonally relocating** between South Florida and the Northeast
- **Renting boats** through charter services that need flexible slip access

This demand for short-term, flexible bookings cannot be efficiently captured with a phone-first operation.

## What Going Digital Actually Means

Going digital doesn't mean replacing your harbormaster with an algorithm. It means:

1. **Listing your available slips** with accurate specs, amenities, and pricing
2. **Letting boat owners discover and book online** — you still approve every booking
3. **Getting paid automatically** through Stripe without chasing checks

The harbormaster still manages the dock. They just don't have to answer phones at 7am on a Saturday to take a reservation.

## The Competitive Reality

Marinas that list on platforms like EasyDock appear in search results when boat owners look for available slips. Marinas that don't are invisible online.

With South Florida's boating market growing, early adopters of digital booking will capture demand that others miss. Those who wait will cede ground to competitors who got there first.

## Getting Started

EasyDock is designed for marina operators — not tech companies. If you can use email, you can use EasyDock. The 90-day free trial gives you time to test the platform, fill some slips, and see the payout before committing to a subscription.

Start at [easydock.com/claim](/claim).
    `.trim(),
  },
  {
    slug: 'finding-a-boat-slip-in-south-florida',
    title: 'The Complete Guide to Finding a Boat Slip in South Florida',
    description:
      "Waitlists, hidden fees, and phone tag — here's everything you need to know about finding and booking a marina slip in Miami, Fort Lauderdale, and the Keys.",
    date: '2026-06-28',
    readingTime: 6,
    category: 'boat-owners',
    content: `
Finding a permanent or transient slip in South Florida used to mean joining a waitlist and waiting years. The market is still tight — but it's changing. Here's what you need to know.

## The State of Slip Availability in South Florida

South Florida has over 100,000 registered vessels and limited marina infrastructure. Popular marinas in Coconut Grove, Fort Lauderdale, and Key West routinely have 3-to-6 year waitlists for permanent slips.

**The good news:** not every slip is occupied, and new platforms are making available inventory visible for the first time.

## Types of Slip Arrangements

Before you start looking, know what you're looking for:

### Permanent (Annual) Slips
Month-to-month or annual contracts with one marina. Best for boat owners who keep their vessel in one location year-round. The most competitive and hardest to find.

### Transient Slips
Short-term, often nightly or weekly. Ideal for cruising, snowbirds, and charter vessels. Availability is better but prices are higher per night. Most online marina booking platforms focus on transient inventory.

### Dry Storage
For trailerable or smaller vessels. Less glamorous than a wet slip but significantly cheaper and more available. Many boaters use dry storage as a bridge while waiting for a permanent slip.

## Where to Look

### Marinas with Online Booking
The most efficient option. Platforms like EasyDock list available slips with real-time availability, pricing, and specs. You can search by location, boat dimensions, and amenities without making a single phone call.

Search [EasyDock's marina map](/search) to see available slips near you filtered to your vessel dimensions.

### Direct to Marina
Call the dockmaster. Annoying but still necessary for many marinas that haven't listed online. Ask specifically about:
- Current waitlist length
- Monthly rates
- Minimum contract length
- Amenities (shore power, water, pump-out)

### Boating Facebook Groups
South Florida boating groups on Facebook often surface leads before they hit official channels. Search "Miami boating," "Fort Lauderdale marina," and "Keys slip available" on Facebook and join the relevant groups.

### Live-Aboard Networks
If you're live-aboard or plan to be, connect with liveaboard communities — they circulate slip openings within their networks before the general public hears about them.

## What to Ask Before You Book

Once you find a potential slip, dig into the details before committing:

**Boat dimensions**
Confirm the slip accommodates your vessel's length overall (LOA), beam, and draft. Don't assume "30-foot slip" means your 30-foot boat fits — measure the beam too.

**Shore power**
What's available — 30A, 50A, 100A? Does the marina charge extra for electricity or is it included? Does the slip have a dedicated pedestal or shared?

**Access and security**
What are the access hours? Is there gate access? Night security?

**Guest policies**
Can guests use marina facilities? Is there a guest fee?

**Liveaboard policy**
If you intend to live aboard, confirm the marina allows it. Many South Florida marinas have restricted liveaboard permits.

## Understanding Marina Pricing

Pricing in South Florida varies by location, amenities, and demand. Rough ranges as of 2026:

| Type | Location | Price Range |
|------|----------|-------------|
| Transient | Miami/Fort Lauderdale | $3–$6/ft/night |
| Monthly | Coconut Grove | $25–$45/ft/month |
| Monthly | Fort Lauderdale | $20–$40/ft/month |
| Monthly | Keys | $15–$30/ft/month |
| Annual | Popular marinas | $18–$35/ft/month |

Watch for add-on fees: electricity, pump-out, dinghy storage, and parking can add 20–40% to the listed rate.

## When Online Booking Isn't Available

For marinas that aren't online yet, the process is:

1. Call the dockmaster during business hours (typically 8am–5pm)
2. Ask about availability for your dates and vessel size
3. Get pricing and a written quote by email
4. Ask about the deposit and cancellation policy
5. Confirm in writing before showing up

## EasyDock Makes It Easier

EasyDock is building the online booking layer for South Florida marinas — the platform that lets you find, compare, and book slips the same way you'd book a hotel.

If your target marina isn't listed yet, you can [request that we add it](/search) and we'll reach out to the marina owner on your behalf.

Ready to search? [Browse available slips →](/search)
    `.trim(),
  },
];

export function getPost(slug: string): BlogPost | undefined {
  return posts.find((p) => p.slug === slug);
}

export function getAllPosts(): BlogPost[] {
  return [...posts].sort((a, b) => (a.date > b.date ? -1 : 1));
}
