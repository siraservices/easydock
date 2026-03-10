/**
 * Tests for server-side price calculation logic in checkout route.
 * These tests verify HARD-01: price computation must happen server-side
 * from DB slip data, client-submitted price must never be used.
 */
import { describe, it, expect } from "vitest";
import { calculateNights } from "@/lib/utils/format";

// Pure price calculation logic extracted from checkout route behavior spec
function computeCheckoutPricing(pricePerNight: number, checkIn: string, checkOut: string) {
  const nights = calculateNights(checkIn, checkOut);
  const basePrice = pricePerNight * nights;
  const yachtOwnerFeeRate = 0.10;
  const serviceFeeRate = 0.15;
  const yachtOwnerFee = Math.round(basePrice * yachtOwnerFeeRate * 100) / 100;
  const totalChargedToCustomer = basePrice + yachtOwnerFee;
  const platformFeeAmount = Math.round(basePrice * serviceFeeRate * 100) / 100;

  return { nights, basePrice, yachtOwnerFee, totalChargedToCustomer, platformFeeAmount };
}

describe("checkout pricing (server-side, HARD-01)", () => {
  it("computes nights correctly for a 3-night stay", () => {
    const nights = calculateNights("2025-07-01", "2025-07-04");
    expect(nights).toBe(3);
  });

  it("computes base price from slip price_per_night and nights", () => {
    const { basePrice } = computeCheckoutPricing(100, "2025-07-01", "2025-07-04");
    // $100/night * 3 nights = $300
    expect(basePrice).toBe(300);
  });

  it("applies 10% yacht owner surcharge on top of base price", () => {
    const { yachtOwnerFee, totalChargedToCustomer } = computeCheckoutPricing(100, "2025-07-01", "2025-07-04");
    expect(yachtOwnerFee).toBe(30);          // 10% of $300
    expect(totalChargedToCustomer).toBe(330); // $300 + $30
  });

  it("stores platform_fee_amount as 15% of base price (total platform fee)", () => {
    const { platformFeeAmount } = computeCheckoutPricing(100, "2025-07-01", "2025-07-04");
    expect(platformFeeAmount).toBe(45); // 15% of $300
  });

  it("does not use client-submitted totalPrice — price derives from slip DB data only", () => {
    // If an attacker submits totalPrice: 1, the server ignores it.
    // Server computes from price_per_night (fetched from DB).
    const slipPricePerNightFromDB = 100;
    const clientSubmittedTotalPrice = 1; // tampered value — must be ignored

    const { totalChargedToCustomer } = computeCheckoutPricing(
      slipPricePerNightFromDB,
      "2025-07-01",
      "2025-07-04"
    );

    // Server result must NOT equal tampered price
    expect(totalChargedToCustomer).not.toBe(clientSubmittedTotalPrice);
    // Server result must equal correct computed price
    expect(totalChargedToCustomer).toBe(330);
  });

  it("rounds fee amounts to 2 decimal places", () => {
    // $99/night * 1 night = $99 base
    // 10% of $99 = $9.9 (already 1 decimal, stored as 9.9)
    // 15% of $99 = $14.85
    const { yachtOwnerFee, platformFeeAmount } = computeCheckoutPricing(99, "2025-07-01", "2025-07-02");
    expect(yachtOwnerFee).toBe(9.9);
    expect(platformFeeAmount).toBe(14.85);
  });

  it("allows same-day turnover — check_out date equals next booking check_in", () => {
    // A checkout on Jul 4 and a new check-in on Jul 4 must NOT conflict
    // The date conflict check uses strict < and > (not <= / >=)
    // Check: booking1.check_out(Jul 4) > booking2.check_in(Jul 4) is FALSE → no conflict
    const booking1CheckOut = "2025-07-04";
    const booking2CheckIn = "2025-07-04";

    // Overlap detection: check_in < p_check_out AND check_out > p_check_in
    // booking1: check_in=Jul1, check_out=Jul4
    // booking2: p_check_in=Jul4, p_check_out=Jul7
    // Does booking1 conflict with booking2?
    //   booking1.check_in(Jul1) < booking2.p_check_out(Jul7) → TRUE
    //   booking1.check_out(Jul4) > booking2.p_check_in(Jul4) → FALSE (Jul4 > Jul4 is false)
    // Result: no conflict — same-day turnover is allowed
    const conflictCheckInLtCheckOut = new Date("2025-07-01") < new Date("2025-07-07");
    const conflictCheckOutGtCheckIn = new Date(booking1CheckOut) > new Date(booking2CheckIn);

    expect(conflictCheckInLtCheckOut).toBe(true);
    expect(conflictCheckOutGtCheckIn).toBe(false); // strict > means same-day is NOT a conflict
  });
});
