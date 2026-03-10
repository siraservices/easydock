import { describe, it, expect } from 'vitest';
import { calculateNights } from '@/lib/utils/format';

describe('calculateNights', () => {
  it('returns 3 for a 3-night stay', () => {
    expect(calculateNights('2025-06-01', '2025-06-04')).toBe(3);
  });

  it('returns 1 (minimum) for a single night stay', () => {
    expect(calculateNights('2025-06-01', '2025-06-02')).toBe(1);
  });

  it('returns 1 as minimum even for same-day (edge case)', () => {
    expect(calculateNights('2025-06-01', '2025-06-01')).toBe(1);
  });
});

describe('Server-side price calculation', () => {
  const serviceFeeRate = 0.15;
  const yachtOwnerFeeRate = 0.10;

  function computePricing(pricePerNight: number, nights: number) {
    const basePrice = pricePerNight * nights;
    const yachtOwnerFee = Math.round(basePrice * yachtOwnerFeeRate * 100) / 100;
    const totalChargedToCustomer = basePrice + yachtOwnerFee;
    const platformFeeAmount = Math.round(basePrice * serviceFeeRate * 100) / 100;
    return { basePrice, yachtOwnerFee, totalChargedToCustomer, platformFeeAmount };
  }

  it('calculates fees correctly for $100/night x 3 nights', () => {
    const { basePrice, yachtOwnerFee, platformFeeAmount, totalChargedToCustomer } =
      computePricing(100, 3);

    expect(basePrice).toBe(300);
    expect(yachtOwnerFee).toBe(30);      // 10% surcharge
    expect(platformFeeAmount).toBe(45);  // 15% platform fee
    expect(totalChargedToCustomer).toBe(330);
  });

  it('calculates fees correctly for $75.50/night x 2 nights', () => {
    const { basePrice, yachtOwnerFee, totalChargedToCustomer } =
      computePricing(75.50, 2);

    expect(basePrice).toBe(151);
    expect(yachtOwnerFee).toBe(15.10); // 10% of 151, rounded
    expect(totalChargedToCustomer).toBe(166.1);
  });

  it('converts to Stripe cents correctly (integer math)', () => {
    const { basePrice, yachtOwnerFee } = computePricing(100, 3);

    expect(Math.round(basePrice * 100)).toBe(30000);
    expect(Math.round(yachtOwnerFee * 100)).toBe(3000);
  });

  it('handles single night edge case ($50/night)', () => {
    const { basePrice, yachtOwnerFee, totalChargedToCustomer } =
      computePricing(50, 1);

    expect(basePrice).toBe(50);
    expect(yachtOwnerFee).toBe(5);
    expect(totalChargedToCustomer).toBe(55);
  });
});
