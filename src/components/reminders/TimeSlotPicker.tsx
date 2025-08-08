
import React, { useState, useMemo } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { AvailableSlot } from '@/hooks/useAvailableSlots';
import { format, startOfToday, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface TimeSlotPickerProps {
  availableSlots: AvailableSlot[];
  selectedSlotId?: string;
  onSlotSelect: (slotId: string) => void;
  isLoading: boolean;
}

const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({ availableSlots, selectedSlotId, onSlotSelect, isLoading }) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  const slotsByDay = useMemo(() => {
    if (!availableSlots) return {};
    return availableSlots.reduce((acc, slot) => {
      const day = format(slot.datetime.toDate(), 'yyyy-MM-dd');
      if (!acc[day]) {
        acc[day] = [];
      }
      acc[day].push(slot);
      return acc;
    }, {} as Record<string, AvailableSlot[]>);
  }, [availableSlots]);

  const availableDays = useMemo(() => {
    return Object.keys(slotsByDay).map(dayStr => {
        const [year, month, day] = dayStr.split('-').map(Number);
        return new Date(year, month - 1, day);
    });
  }, [slotsByDay]);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
  };

  const slotsForSelectedDate = selectedDate
    ? slotsByDay[format(selectedDate, 'yyyy-MM-dd')]?.sort((a, b) => a.datetime.toMillis() - b.datetime.toMillis()) || []
    : [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h3 className="text-sm font-medium mb-2 text-center">Select a Date</h3>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDateSelect}
          disabled={(date) => {
            const today = startOfToday();
            if (date < today) return true;
            return !availableDays.some(availableDay => isSameDay(date, availableDay));
          }}
          className="rounded-md border flex justify-center"
        />
      </div>
      <div className="flex flex-col">
        <h3 className="text-sm font-medium mb-2 text-center">
          {selectedDate ? `Available Times` : 'Select a date to see times'}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
            {isLoading && (
                <div className="col-span-full flex items-center justify-center h-full">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
            )}
            {!isLoading && selectedDate && slotsForSelectedDate.length > 0 && slotsForSelectedDate.map(slot => (
              <Button
                key={slot.id}
                variant={selectedSlotId === slot.id ? 'default' : 'outline'}
                onClick={() => onSlotSelect(slot.id)}
                className={cn(
                  "w-full",
                  selectedSlotId !== slot.id && "text-black"
                )}
              >
                {format(slot.datetime.toDate(), 'h:mm a')}
              </Button>
            ))}
            {!isLoading && selectedDate && slotsForSelectedDate.length === 0 && (
                <p className="text-sm text-muted-foreground col-span-full text-center mt-4">No slots available for this day.</p>
            )}
            {!isLoading && !selectedDate && (
                 <p className="text-sm text-muted-foreground col-span-full text-center mt-4">Please pick a date.</p>
            )}
        </div>
      </div>
    </div>
  );
};

export default TimeSlotPicker;
