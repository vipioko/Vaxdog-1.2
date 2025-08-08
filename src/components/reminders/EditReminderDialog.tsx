import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar as CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Reminder } from '@/data/mock';

interface EditReminderDialogProps {
  reminder: Reminder;
  onEditReminder: (reminderId: string, updatedData: { vaccine: string; due: Date }) => void;
  children: React.ReactNode;
}

const EditReminderDialog = ({ reminder, onEditReminder, children }: EditReminderDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [vaccine, setVaccine] = useState(reminder.vaccine);
  const [due, setDue] = useState<Date | undefined>(new Date(reminder.due));

  useEffect(() => {
    if (isOpen) {
      setVaccine(reminder.vaccine);
      setDue(new Date(reminder.due));
    }
  }, [isOpen, reminder]);

  const handleSubmit = () => {
    if (vaccine && due) {
      onEditReminder(reminder.id, { vaccine, due });
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="w-[95vw] max-w-md mx-auto bg-slate-800 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">Edit Reminder</DialogTitle>
          <DialogDescription className="text-slate-400">
            Update the details for this vaccination reminder.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="dog" className="text-right text-white">Dog</Label>
            <Input 
              id="dog" 
              value={reminder.dog} 
              disabled 
              className="col-span-3 bg-slate-700 border-slate-600 text-slate-400" 
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="vaccine" className="text-right text-white">Vaccine</Label>
            <Input 
              id="vaccine" 
              value={vaccine} 
              onChange={(e) => setVaccine(e.target.value)} 
              className="col-span-3 bg-slate-700 border-slate-600 text-white placeholder-slate-400" 
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="due-date" className="text-right text-white">Due Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "col-span-3 justify-start text-left font-normal bg-slate-700 border-slate-600 text-white hover:bg-slate-600",
                    !due && "text-slate-400"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {due ? format(due, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-slate-800 border-slate-700">
                <Calendar
                  mode="single"
                  selected={due}
                  onSelect={setDue}
                  initialFocus
                  className="bg-slate-800 text-white"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <DialogFooter>
          <Button 
            type="submit" 
            onClick={handleSubmit}
            className="bg-purple-500 hover:bg-purple-600 text-white"
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditReminderDialog;