import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, addMonths, subMonths } from 'date-fns';
import { supabase } from '../../lib/supabase';
import { useMarinaStore } from '../../stores/marinaStore';
import { Availability } from '../../types';

interface AvailabilityCalendarProps {
  slipId: string;
}

export const AvailabilityCalendar = ({ slipId }: AvailabilityCalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [blocking, setBlocking] = useState(false);
  const { availability, fetchAvailability } = useMarinaStore();

  useEffect(() => {
    if (slipId) {
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);
      fetchAvailability(slipId, format(start, 'yyyy-MM-dd'), format(end, 'yyyy-MM-dd'));
    }
  }, [slipId, currentDate, fetchAvailability]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const isDateAvailable = (date: Date): boolean => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const avail = availability.find((a) => a.date === dateStr);
    return avail ? avail.available : true;
  };

  const isDateBlocked = (date: Date): boolean => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const avail = availability.find((a) => a.date === dateStr);
    return avail ? !avail.available : false;
  };

  const toggleAvailability = async (date: Date) => {
    if (blocking) return;

    setBlocking(true);
    const dateStr = format(date, 'yyyy-MM-dd');
    const isAvailable = isDateAvailable(date);

    try {
      if (isAvailable) {
        // Block the date
        const { error } = await supabase.from('availability').upsert({
          slip_id: slipId,
          date: dateStr,
          available: false,
          blocked_reason: 'Blocked by marina',
        });
        if (error) throw error;
      } else {
        // Unblock the date
        const { error } = await supabase
          .from('availability')
          .update({ available: true, blocked_reason: null })
          .eq('slip_id', slipId)
          .eq('date', dateStr);
        if (error) throw error;
      }

      await fetchAvailability(slipId, format(monthStart, 'yyyy-MM-dd'), format(monthEnd, 'yyyy-MM-dd'));
    } catch (error) {
      console.error('Error toggling availability:', error);
    } finally {
      setBlocking(false);
    }
  };

  const getDateStatus = (date: Date) => {
    if (isDateBlocked(date)) return 'blocked';
    if (isDateAvailable(date)) return 'available';
    return 'unknown';
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Availability Calendar</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50"
          >
            ←
          </button>
          <span className="font-medium min-w-[200px] text-center">
            {format(currentDate, 'MMMM yyyy')}
          </span>
          <button
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50"
          >
            →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-4">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center text-sm font-medium text-gray-700 py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {daysInMonth.map((date) => {
          const status = getDateStatus(date);
          const isCurrentMonth = isSameMonth(date, currentDate);
          const isCurrentDay = isToday(date);

          return (
            <button
              key={date.toISOString()}
              onClick={() => {
                if (isCurrentMonth) {
                  setSelectedDate(date);
                  toggleAvailability(date);
                }
              }}
              disabled={!isCurrentMonth || blocking}
              className={`
                aspect-square p-2 rounded text-sm
                ${!isCurrentMonth ? 'text-gray-300 cursor-not-allowed' : ''}
                ${isCurrentDay ? 'ring-2 ring-primary-navy' : ''}
                ${status === 'blocked' ? 'bg-red-100 text-red-800 hover:bg-red-200' : ''}
                ${status === 'available' ? 'bg-green-100 text-green-800 hover:bg-green-200' : ''}
                ${status === 'unknown' ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : ''}
                ${blocking ? 'opacity-50 cursor-wait' : 'cursor-pointer'}
              `}
            >
              {format(date, 'd')}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-center space-x-4 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-100 rounded"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-red-100 rounded"></div>
          <span>Blocked</span>
        </div>
      </div>
    </div>
  );
};
