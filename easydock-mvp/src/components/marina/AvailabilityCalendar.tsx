import { useEffect, useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns';
import { useMarinaStore } from '../../stores/marinaStore';

interface AvailabilityCalendarProps {
  marinaId: string;
}

export default function AvailabilityCalendar({ marinaId }: AvailabilityCalendarProps) {
  const { slips, fetchSlips, availability, fetchAvailability, setAvailability } = useMarinaStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedSlip, setSelectedSlip] = useState<string | null>(null);

  useEffect(() => {
    fetchSlips(marinaId);
  }, [marinaId, fetchSlips]);

  useEffect(() => {
    if (selectedSlip) {
      const start = format(startOfMonth(currentDate), 'yyyy-MM-dd');
      const end = format(endOfMonth(currentDate), 'yyyy-MM-dd');
      fetchAvailability(selectedSlip, start, end);
    }
  }, [selectedSlip, currentDate, fetchAvailability]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const handleDateClick = async (date: Date, slipId: string) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const existing = availability.find(
      (a) => a.slip_id === slipId && isSameDay(new Date(a.date), date)
    );

    if (existing) {
      // Toggle availability
      await setAvailability(slipId, dateStr, !existing.is_available);
    } else {
      // Set as unavailable (default when clicking)
      await setAvailability(slipId, dateStr, false);
    }

    // Refresh availability
    const start = format(startOfMonth(currentDate), 'yyyy-MM-dd');
    const end = format(endOfMonth(currentDate), 'yyyy-MM-dd');
    fetchAvailability(slipId, start, end);
  };

  const getDateAvailability = (date: Date, slipId: string): boolean | null => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const avail = availability.find(
      (a) => a.slip_id === slipId && a.date === dateStr
    );
    return avail ? avail.is_available : null; // null means not set (default available)
  };

  const previousMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Availability Calendar</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Slip
          </label>
          <select
            value={selectedSlip || ''}
            onChange={(e) => setSelectedSlip(e.target.value || null)}
            className="block w-full max-w-xs border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-navy focus:border-primary-navy sm:text-sm"
          >
            <option value="">Select a slip...</option>
            {slips.map((slip) => (
              <option key={slip.id} value={slip.id}>
                Slip {slip.slip_number}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedSlip && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={previousMonth}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              ← Previous
            </button>
            <h3 className="text-xl font-semibold text-gray-900">
              {format(currentDate, 'MMMM yyyy')}
            </h3>
            <button
              onClick={nextMonth}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Next →
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center text-sm font-medium text-gray-700 py-2">
                {day}
              </div>
            ))}
            {days.map((day) => {
              const avail = getDateAvailability(day, selectedSlip);
              const isPast = day < new Date();
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => !isPast && handleDateClick(day, selectedSlip)}
                  disabled={isPast}
                  className={`
                    aspect-square p-2 rounded-md text-sm
                    ${isPast ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}
                    ${!isPast && avail === false ? 'bg-red-200 text-red-800 hover:bg-red-300' : ''}
                    ${!isPast && avail === true ? 'bg-green-200 text-green-800 hover:bg-green-300' : ''}
                    ${!isPast && avail === null ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : ''}
                  `}
                  title={format(day, 'MMM d, yyyy')}
                >
                  {format(day, 'd')}
                </button>
              );
            })}
          </div>

          <div className="mt-6 flex items-center justify-center space-x-6">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-gray-200 rounded mr-2"></div>
              <span className="text-sm text-gray-700">Available (default)</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-200 rounded mr-2"></div>
              <span className="text-sm text-gray-700">Marked Available</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-200 rounded mr-2"></div>
              <span className="text-sm text-gray-700">Blocked</span>
            </div>
          </div>

          <p className="mt-4 text-sm text-gray-600 text-center">
            Click on dates to toggle availability. Gray dates are in the past.
          </p>
        </div>
      )}

      {!selectedSlip && (
        <div className="bg-white shadow rounded-lg p-12 text-center">
          <p className="text-gray-500">Please select a slip to view and manage availability</p>
        </div>
      )}
    </div>
  );
}
