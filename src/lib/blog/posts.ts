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
  {
    slug: 'how-to-fill-empty-marina-slips',
    title: 'How to Fill Empty Slips and Boost Marina Revenue',
    description:
      'Vacant slips are lost revenue. Here are the most effective strategies marina operators use to fill empty dock space and maximize occupancy year-round.',
    date: '2026-06-29',
    readingTime: 5,
    category: 'marina-owners',
    content: `
Vacant slips are the single biggest revenue leak at most marinas. A slip that sits empty for a month at $2,000/month is $2,000 you'll never recover. At a 50-slip marina, even 15% vacancy costs $180,000 per year.

The good news: most marina vacancies are addressable. Here's what the highest-occupancy operators in South Florida do differently.

## 1. Make Your Inventory Discoverable Online

The most common cause of vacant slips isn't lack of demand — it's lack of visibility. Boat owners searching for available slips in Miami, Fort Lauderdale, or the Keys can't book a slip they don't know about.

The first step is listing your available inventory on a platform where boaters are actively searching. When your slips appear in online search results with real-time availability, pricing, and specs, you capture demand that would otherwise go to a competitor.

[EasyDock](/) lists 241 South Florida marinas and connects marina operators directly with boat owners looking to book. If your marina isn't listed, [claim it here](/claim).

## 2. Separate Permanent and Transient Inventory

Many marinas treat all their slips as "permanent" by default and miss out on transient revenue between tenant contracts or during seasonal gaps.

Consider designating 10–20% of your slips as transient inventory during slow periods. Transient rates ($3–$6/ft/night) often exceed what you'd earn on the same slip under a monthly contract, especially in high-season months (November through April in South Florida).

Platforms like EasyDock make it easy to set per-slip availability windows so transient bookings never conflict with your permanent tenants.

## 3. Price Dynamically Based on Demand

Fixed monthly pricing leaves money on the table during peak season and creates vacancies during slow months. Operators who adjust their slip rates seasonally — even modest 15–20% shifts — consistently outperform those with static pricing.

Basic seasonal pricing framework for South Florida:
- **Peak season (Nov–Apr)**: Price at or above market
- **Off-season (May–Oct)**: Offer slightly below market to maintain occupancy
- **Holidays (New Year's, Memorial Day)**: Short-term premium pricing for transient slips

## 4. Activate Your Waitlist for Short-Term Revenue

Most popular marinas have waiting lists for permanent slips. Those waitlist members are already vetted, interested boaters.

When a permanent tenant cancels or a slip opens unexpectedly, contact your waitlist immediately with a short-term offer: "The slip is available now through [date] — would you like it on a month-to-month basis while you're waiting for your permanent assignment?"

This fills your vacancy fast and builds goodwill with future tenants.

## 5. Convert Leads from Unclaimed Inventory

If you have slips available but no active booking system, boat owners who find you will call — and calls you can't answer are leads you lose. Even a simple inquiry form with an email notification can prevent those leads from going cold.

With EasyDock, boat owners who find an unclaimed marina can submit an interest form. Those leads go directly to your email so you can follow up immediately, even before you've fully set up your listing.

## The Math of Occupancy Improvement

If you currently run at 80% occupancy on a 30-slip marina at $1,500/slip/month:
- **Current revenue**: 24 slips × $1,500 = $36,000/month
- **At 93% occupancy**: 28 slips × $1,500 = $42,000/month
- **Annual gain**: $72,000

Getting from 80% to 93% occupancy — 4 additional slips out of 30 — is entirely achievable with better visibility and an online booking channel.

## Getting Started

The fastest path to higher occupancy is getting your marina listed where boaters are actively searching. [Claim your marina on EasyDock](/claim) — the process takes about two minutes, and your listing goes live the same day.
    `.trim(),
  },
  {
    slug: 'transient-docking-south-florida-guide',
    title: 'Transient Docking in Miami and Fort Lauderdale: A Boater\'s Guide',
    description:
      'Planning a stop along the Florida ICW or cruising South Florida? Here\'s what you need to know about transient docking in Miami, Fort Lauderdale, and the Keys.',
    date: '2026-06-29',
    readingTime: 6,
    category: 'boat-owners',
    content: `
South Florida is one of the most popular cruising destinations on the East Coast — and one of the most competitive for short-term dock space. If you're planning to transit the Intracoastal Waterway, cruise the Biscayne Bay, or spend time in the Keys, here's what experienced boaters know about finding transient slips.

## What Is Transient Docking?

Transient docking (also called guest docking or transient slip rental) is short-term dock space — typically nightly, weekly, or for a specific number of days. Unlike annual contracts, transient slips are available on-demand and don't require a long-term commitment.

Transient docking is ideal for:
- **Coastal cruisers** passing through South Florida on the ICW or offshore route
- **Snowbirds** relocating seasonally between South Florida and the Northeast
- **Charter vessels** that need flexible, multi-stop accommodations
- **Boat owners** visiting South Florida for a weekend or vacation

## Rates: What to Expect in 2026

Transient rates in South Florida vary significantly by location, marina quality, and season. General ranges as of 2026:

| Area | Nightly Rate (per foot) | Notes |
|------|------------------------|-------|
| Miami / Coconut Grove | $4.00–$6.00/ft | Premium waterfront, highest demand |
| Fort Lauderdale | $3.50–$5.50/ft | High availability, strong amenity base |
| Palm Beach / Boca | $3.00–$5.00/ft | Less busy, good anchorage alternatives |
| Marathon / The Keys | $2.50–$4.50/ft | Tight availability during peak season |
| Miami Beach | $5.00–$7.00/ft | Urban premium, limited supply |

A 40-foot boat at a Fort Lauderdale marina might pay $140–$220/night for a transient slip. Factor in electricity ($15–$40/night depending on shore power draw) and any facility fees.

**Note:** Off-season (May through October) rates are typically 15–25% lower, and availability improves substantially.

## Where to Search for Transient Slips

### Online Booking Platforms
The most efficient way to find available transient slips is through an online platform with real-time availability. You can see open slips, compare rates, and book without phone tag.

[Search EasyDock's South Florida marina map](/search) to find available slips near your destination, filtered to your vessel dimensions and dates.

### Marina Directories
The USCG and BoatUS publish marina directories with contact information, but they don't show real-time availability. Use these as a starting point, then verify directly.

### VHF Channel 16
The traditional method: hail marinas on channel 16 as you approach. Most South Florida marinas monitor 16 and can advise on availability and direct you to their working channel.

## What Amenities to Look For

When evaluating a transient slip, confirm these details in advance:

**Shore power**
Confirm the slip has the right pedestal for your boat. 30A, 50A, and 100A service are common, but not universal. Running your generator all night in a marina will cost you goodwill quickly.

**Pump-out**
Most marinas require you to use their pump-out facility rather than pumping overboard. Confirm it's available and whether there's a fee.

**Fuel**
If you need diesel or gas, check whether the marina has a fuel dock or whether you'll need to move the boat. Many marinas separate fuel and slip services.

**Security and access**
Ask about gate codes for showers, laundry, and the dock. Most quality transient marinas provide 24-hour gate access with a code on check-in.

**Liveaboard policy**
If you're living aboard, confirm the marina allows overnight stays. Some transient slips are for day visits only.

## Tips for High-Demand Periods

### Book in Advance for Peak Season
November through April is peak season in South Florida — especially around New Year's, Presidents Day weekend, and spring break. Transient slips at popular Fort Lauderdale and Miami marinas book out weeks in advance during these periods.

If you're cruising south in the fall or north in the spring, book your overnight stops 1–2 weeks ahead, not the day before.

### Have a Backup Plan
During Boat Show week in Fort Lauderdale (October/November), every slip within 20 miles is booked. Same story during the Miami Boat Show (February). Build in alternatives: anchor-out spots, less-convenient marinas a few miles away, or arriving a day early.

### Arrive Early in the Day
Most transient slips are first-come, first-served unless reserved. Arriving after 4pm in peak season means you may be calling around for alternatives while running out of daylight.

## Anchoring as an Alternative

South Florida has excellent anchoring opportunities, especially in Biscayne Bay, the ICW, and the Keys. A free anchorage with a solid dinghy can save $150/night while keeping you close to the action.

Popular anchoring spots:
- **Biscayne Bay** (south of Miami): Good holding, lots of swing room, dinghy to Coconut Grove or Matheson Hammock
- **Lake Sylvia, Fort Lauderdale**: Tucked behind the ICW, protected in most conditions
- **No Name Harbor, Key Biscayne**: Free, protected, beautiful — but fills up on weekends

## Ready to Search?

[Browse available slips on EasyDock →](/search) to find transient dock space near your destination, with real-time availability and online booking.
    `.trim(),
  },
];

export function getPost(slug: string): BlogPost | undefined {
  return posts.find((p) => p.slug === slug);
}

export function getAllPosts(): BlogPost[] {
  return [...posts].sort((a, b) => (a.date > b.date ? -1 : 1));
}
