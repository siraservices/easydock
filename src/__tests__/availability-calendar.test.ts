import { describe, it, expect } from 'vitest';
import { isDayBooked } from '@/components/availability-calendar';

describe('isDayBooked', () => {
  it('returns true for day on check_in date', () => {
    const bookings = [{ check_in: '2026-03-10', check_out: '2026-03-15' }];
    expect(isDayBooked('2026-03-10', bookings)).toBe(true);
  });

  it('returns false for day on check_out date (same-day turnover)', () => {
    const bookings = [{ check_in: '2026-03-10', check_out: '2026-03-15' }];
    expect(isDayBooked('2026-03-15', bookings)).toBe(false);
  });

  it('returns true for day between check_in and check_out', () => {
    const bookings = [{ check_in: '2026-03-10', check_out: '2026-03-15' }];
    expect(isDayBooked('2026-03-12', bookings)).toBe(true);
  });

  it('returns false for day before check_in', () => {
    const bookings = [{ check_in: '2026-03-10', check_out: '2026-03-15' }];
    expect(isDayBooked('2026-03-09', bookings)).toBe(false);
  });

  it('returns false for day after check_out', () => {
    const bookings = [{ check_in: '2026-03-10', check_out: '2026-03-15' }];
    expect(isDayBooked('2026-03-16', bookings)).toBe(false);
  });

  it('returns false for empty bookings array', () => {
    expect(isDayBooked('2026-03-10', [])).toBe(false);
  });

  it('returns true when day overlaps one of multiple bookings', () => {
    const bookings = [
      { check_in: '2026-03-01', check_out: '2026-03-05' },
      { check_in: '2026-03-10', check_out: '2026-03-15' },
      { check_in: '2026-03-20', check_out: '2026-03-25' },
    ];
    expect(isDayBooked('2026-03-12', bookings)).toBe(true);
  });

  it('returns false when day falls between bookings (gap)', () => {
    const bookings = [
      { check_in: '2026-03-01', check_out: '2026-03-05' },
      { check_in: '2026-03-10', check_out: '2026-03-15' },
    ];
    expect(isDayBooked('2026-03-07', bookings)).toBe(false);
  });
});
