import React from 'react';
import { Control, useWatch } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { format, addHours, setHours, setMinutes, isBefore, startOfToday } from 'date-fns';
import { DateRange } from 'react-day-picker';

interface Step2ServiceInputsProps {
  control: Control<any>;
  serviceType: 'grooming' | 'petHostel';
}

const Step2ServiceInputs: React.FC<Step2ServiceInputsProps> = ({ control, serviceType }) => {
  const today = startOfToday();

  if (serviceType === 'grooming') {
    const preferredDate = useWatch({ control, name: 'preferredDate' });
    const preferredTime = useWatch({ control, name: 'preferredTime' });

    const generateTimeSlots = () => {
      const slots = [];
      for (let i = 9; i <= 17; i++) { // 9 AM to 5 PM
        slots.push(format(setMinutes(setHours(new Date(), i), 0), 'HH:mm'));
        if (i < 17) { // Add :30 slots, but not after 5:00 PM
          slots.push(format(setMinutes(setHours(new Date(), i), 30), 'HH:mm'));
        }
      }
      return slots;
    };

    const timeSlots = generateTimeSlots();

    return (
      <div className="space-y-4 animate-in fade-in">
        <FormField
          control={control}
          name="preferredDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel className="text-white">Preferred Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal bg-slate-700 border-slate-600 text-white hover:bg-slate-600",
                        !field.value && "text-slate-400"
                      )}
                    >
                      {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-slate-800 border-slate-700" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => isBefore(date, today)}
                    initialFocus
                    className="bg-slate-800 text-white"
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="preferredTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Preferred Time</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="w-full bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Select a time" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 text-white">
                    {timeSlots.map(slot => (
                      <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    );
  } else if (serviceType === 'petHostel') {
    const dateRange = useWatch({ control, name: 'dateRange' });

    return (
      <div className="space-y-4 animate-in fade-in">
        <FormField
          control={control}
          name="dateRange"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel className="text-white">Stay Dates</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      id="date"
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal bg-slate-700 border-slate-600 text-white hover:bg-slate-600",
                        !field.value?.from && "text-slate-400"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                      {field.value?.from ? (
                        field.value.to ? (
                          <>
                            {format(field.value.from, "LLL dd, y")} -{" "}
                            {format(field.value.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(field.value.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Pick a date range</span>
                      )}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-slate-800 border-slate-700" align="start">
                  <Calendar
                    mode="range"
                    selected={field.value}
                    onSelect={field.onChange}
                    numberOfMonths={2}
                    disabled={(date) => isBefore(date, today)}
                    className="bg-slate-800 text-white"
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="foodPreference"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Food Preference</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="w-full bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Select food preference" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 text-white">
                    <SelectItem value="veg">Vegetarian</SelectItem>
                    <SelectItem value="non-veg">Non-Vegetarian</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    );
  }
  return null;
};

export default Step2ServiceInputs;