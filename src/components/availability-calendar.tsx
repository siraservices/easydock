"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";

interface SlipOption {
  id: string;
  name: string;
}

interface Booking {
  check_in: string;
  check_out: string;
}

interface Props {
  slips: SlipOption[];
  marinaId: string;
}

/**
 * Convert a Date to a YYYY-MM-DD string.
 *
 * When a Date is created from an ISO date string like `new Date('2026-03-10')`,
 * it represents midnight UTC. We use UTC getters so the string matches the
 * original ISO date regardless of the local timezone.
 *
 * When a Date is created with `new Date(year, month, day)` (local time),
 * we use local getters via `toLocaleDateString` approach instead. To keep
 * things consistent across tests and the calendar render, we normalize to
 * UTC ISO string and take the first 10 chars.
 *
 * Actually, the simplest and most reliable approach: always use the ISO string
 * of the date object and trim. For `new Date('2026-03-10')` this is correct
 * because it is midnight UTC. For `new Date(2026, 2, 10)` (local midnight)
 * this could be one day off in UTC-behind timezones.
 *
 * Resolution: isDayBooked accepts a pre-formatted YYYY-MM-DD string instead
 * of a Date object. The calendar constructs strings directly. Tests pass strings.
 */

/**
 * Pure function: returns true if `dayStr` (YYYY-MM-DD) falls within any
 * booking range. Rule: check_in <= dayStr < check_out (same-day turnover).
 * Exported as named export for unit testing.
 */
export function isDayBooked(
  dayStr: string,
  bookings: Booking[]
): boolean {
  return bookings.some(
    (b) => b.check_in <= dayStr && b.check_out > dayStr
  );
}

/** Format a Date created via `new Date('YYYY-MM-DD')` (UTC midnight) safely. */
function isoToDateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Build YYYY-MM-DD from year/month(0-based)/day without timezone issues. */
function buildDateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function AvailabilityCalendar({ slips, marinaId: _marinaId }: Props) {
  const supabase = useMemo(() => createClient(), []);
  const [selectedSlipId, setSelectedSlipId] = useState<string>(
    slips[0]?.id ?? ""
  );
  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchBookings = useCallback(async () => {
    if (!selectedSlipId) return;

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const startOfMonth = buildDateStr(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const endOfMonth = buildDateStr(year, month, daysInMonth);

    setLoading(true);
    const { data } = await supabase
      .from("bookings")
      .select("check_in, check_out, status")
      .eq("slip_id", selectedSlipId)
      .neq("status", "cancelled")
      .neq("status", "declined")
      .gte("check_out", startOfMonth)
      .lte("check_in", endOfMonth);

    setBookings((data as Booking[]) ?? []);
    setLoading(false);
  }, [selectedSlipId, currentMonth, supabase]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Update selectedSlipId when slips prop changes (e.g. first slip added)
  useEffect(() => {
    if (!selectedSlipId && slips.length > 0) {
      setSelectedSlipId(slips[0].id);
    }
  }, [slips, selectedSlipId]);

  function prevMonth() {
    setCurrentMonth(
      (m) => new Date(m.getFullYear(), m.getMonth() - 1, 1)
    );
  }

  function nextMonth() {
    setCurrentMonth(
      (m) => new Date(m.getFullYear(), m.getMonth() + 1, 1)
    );
  }

  // Build calendar day strings (YYYY-MM-DD) for the month
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0=Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells: Array<{ dateStr: string | null; dayNum: number | null }> = [];

    // Leading empty cells
    for (let i = 0; i < firstDayOfWeek; i++) {
      cells.push({ dateStr: null, dayNum: null });
    }

    // Actual days
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ dateStr: buildDateStr(year, month, d), dayNum: d });
    }

    return cells;
  }, [currentMonth]);

  if (slips.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500 text-sm">
        No slips added yet.
      </div>
    );
  }

  return (
    <div className="p-5">
      {/* Slip selector */}
      <div className="mb-4">
        <label
          htmlFor="slip-select"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Select Slip
        </label>
        <select
          id="slip-select"
          value={selectedSlipId}
          onChange={(e) => setSelectedSlipId(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          {slips.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          aria-label="Previous month"
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
        >
          &#8249;
        </button>
        <h3 className="text-base font-semibold text-navy-800">
          {MONTH_NAMES[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        <button
          onClick={nextMonth}
          aria-label="Next month"
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
        >
          &#8250;
        </button>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_LABELS.map((label) => (
          <div
            key={label}
            className="text-center text-xs font-medium text-gray-500 py-1"
          >
            {label}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      {loading ? (
        <div className="text-center py-8 text-sm text-gray-400">
          Loading...
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((cell, idx) => {
            if (!cell.dateStr || !cell.dayNum) {
              return <div key={`empty-${idx}`} />;
            }
            const booked = isDayBooked(cell.dateStr, bookings);
            return (
              <div
                key={cell.dayNum}
                className={`
                  flex items-center justify-center rounded-md text-xs font-medium
                  h-8 w-full
                  ${booked
                    ? "bg-red-100 text-red-700"
                    : "bg-green-50 text-green-700"
                  }
                `}
              >
                {cell.dayNum}
              </div>
            );
          })}
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 text-xs text-gray-600">
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded bg-green-50 border border-green-200" />
          Open
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded bg-red-100 border border-red-200" />
          Booked
        </div>
      </div>
    </div>
  );
}
