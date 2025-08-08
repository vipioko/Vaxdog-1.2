import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useBookingSlots, BookingSlot } from '@/hooks/useBookingSlots';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { Calendar as CalendarIcon, Trash2 } from 'lucide-react';
import { format, isSameDay, startOfToday } from 'date-fns';
import { toast } from 'sonner';
import RemindersSkeleton from '@/components/reminders/RemindersSkeleton';

const formSchema = z.object({
  date: z.date({ required_error: 'A date is required.' }),
});

const BookingSlotsManager: React.FC = () => {
  const { slots, isLoading, error, addSlotsBatch, deleteSlot } = useBookingSlots();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const slotsForDay = slots?.filter(slot => 
        isSameDay(slot.datetime.toDate(), values.date)
      ).length;

      if (slotsForDay && slotsForDay > 0) {
        toast.warning("Slots already exist for this date. Delete them first to regenerate.", {
          description: "This prevents creating duplicate time slots."
        });
        return;
      }

      await addSlotsBatch({ 
        date: values.date,
        startTime: 9, // 9 AM
        endTime: 17, // 5 PM
        interval: 30, // 30 minutes
      });
      toast.success('Booking slots generated for ' + format(values.date, "PPP"));
      form.reset({ date: undefined });
    } catch (e) {
      console.error('Failed to add slots:', e);
      toast.error('Failed to generate booking slots.');
    }
  };
  
  const handleDeleteSlot = async (slot: BookingSlot) => {
    if (slot.isBooked) {
      toast.warning("Cannot delete a booked slot.");
      return;
    }
    if (window.confirm("Are you sure you want to delete this slot?")) {
      try {
        await deleteSlot(slot.id);
        toast.success("Slot deleted successfully.");
      } catch (e) {
        console.error("Failed to delete slot:", e);
        toast.error("Failed to delete slot.");
      }
    }
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 md:space-y-0 md:flex md:items-end md:gap-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Generate Slots for Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn("w-full sm:w-[240px] pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                      >
                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < startOfToday()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Generating...' : 'Generate Slots'}
          </Button>
        </form>
      </Form>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date & Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={3}>
                  <RemindersSkeleton />
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center text-destructive">
                  Failed to load slots.
                </TableCell>
              </TableRow>
            ) : slots && slots.length > 0 ? (
              slots.map(slot => (
                <TableRow key={slot.id} className={cn(slot.isBooked && "bg-muted/50")}>
                  <TableCell className="font-medium">{format(slot.datetime.toDate(), 'PPP p')}</TableCell>
                  <TableCell>
                    <span className={cn("px-2 py-1 rounded-full text-xs", slot.isBooked ? "bg-red-200 text-red-800" : "bg-green-200 text-green-800")}>
                      {slot.isBooked ? 'Booked' : 'Available'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteSlot(slot)}
                      disabled={slot.isBooked}
                      aria-label="Delete slot"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">No slots found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default BookingSlotsManager;
