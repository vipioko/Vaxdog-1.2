import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { toast } from "sonner";
import { Dog } from '@/data/mock';

interface AddReminderDialogProps {
  dogs: Dog[];
  onAddReminder: (reminder: { dog: string, vaccine: string, due: Date }) => void;
  defaultDogName?: string;
  children: React.ReactNode;
}

const AddReminderDialog = ({ dogs, onAddReminder, defaultDogName, children }: AddReminderDialogProps) => {
  const [open, setOpen] = useState(false);
  const [newReminder, setNewReminder] = useState<{ dog: string, vaccine: string, due: Date | undefined }>({ dog: defaultDogName || '', vaccine: '', due: undefined });

  useEffect(() => {
    if (!open) {
      setNewReminder({ dog: defaultDogName || '', vaccine: '', due: undefined });
    } else if (defaultDogName) {
      setNewReminder(prev => ({ ...prev, dog: defaultDogName }));
    }
  }, [open, defaultDogName]);

  const handleSave = () => {
    if (newReminder.dog && newReminder.vaccine && newReminder.due) {
      onAddReminder({
        dog: newReminder.dog,
        vaccine: newReminder.vaccine,
        due: newReminder.due,
      });
      setNewReminder({ dog: defaultDogName || '', vaccine: '', due: undefined });
      setOpen(false);
    } else {
      toast.error("Please fill out all fields.");
    }
  };

  // Get the selected dog's pet type for proper labeling
  const selectedDog = dogs.find(dog => dog.name === newReminder.dog);
  const petTypeLabel = selectedDog?.petType ? selectedDog.petType.charAt(0).toUpperCase() + selectedDog.petType.slice(1) : 'Pet';

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-md mx-auto bg-slate-800 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">Add vaccination reminder</DialogTitle>
          <DialogDescription className="text-slate-400">
            {defaultDogName ? `Adding reminder for ${defaultDogName}.` : "Select a pet and enter the vaccination details below."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="dog" className="text-right text-white">
              {petTypeLabel}
            </Label>
            <Select
              onValueChange={(value) => setNewReminder({ ...newReminder, dog: value })}
              value={newReminder.dog}
              disabled={!!defaultDogName}
            >
              <SelectTrigger className="col-span-3 bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder={`Select a ${petTypeLabel.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                {dogs.map(dog => (
                  <SelectItem key={dog.name} value={dog.name} className="text-white hover:bg-slate-600 focus:bg-slate-600">
                    {dog.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="vaccine" className="text-right text-white">
              Vaccine
            </Label>
            <Input
              id="vaccine"
              value={newReminder.vaccine}
              onChange={(e) => setNewReminder({ ...newReminder, vaccine: e.target.value })}
              className="col-span-3 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
              placeholder="e.g. Rabies Booster"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="due-date" className="text-right text-white">
              Due Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal col-span-3 bg-slate-700 border-slate-600 text-white hover:bg-slate-600",
                    !newReminder.due && "text-slate-400"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {newReminder.due ? format(newReminder.due, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-slate-800 border-slate-700">
                <Calendar
                  mode="single"
                  selected={newReminder.due}
                  onSelect={(date) => setNewReminder({ ...newReminder, due: date })}
                  initialFocus
                  className="bg-slate-800 text-white"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <DialogFooter>
          <Button 
            onClick={handleSave}
            className="bg-purple-500 hover:bg-purple-600 text-white"
          >
            Save Reminder
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddReminderDialog;