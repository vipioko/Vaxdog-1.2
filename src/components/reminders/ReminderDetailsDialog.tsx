// src/components/reminders/ReminderDetailsDialog.tsx
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Reminder } from '@/data/mock';
import { Calendar, Dog, Home, Stethoscope, CheckCircle, IndianRupee } from 'lucide-react';
import BookingFormDialog from './BookingFormDialog';
import { Transaction } from '@/hooks/useTransactions'; // FIX: Import unified Transaction interface
import { format } from 'date-fns';

interface ReminderDetailsDialogProps {
  reminder: Reminder;
  children: React.ReactNode;
  isBooked?: boolean;
  transaction?: Transaction; // FIX: Use unified Transaction type
}

const ReminderDetailsDialog: React.FC<ReminderDetailsDialogProps> = ({ reminder, children, isBooked, transaction }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="w-[95vw] max-w-md mx-auto bg-slate-800 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center text-white">
            <Stethoscope className="mr-2 h-5 w-5 text-purple-400" />
            Vaccination Details
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            {isBooked
              ? 'Review the details for your booked home visit.'
              : 'Review the details for the upcoming vaccination and book a home visit.'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-400">Vaccine</p>
            <p className="text-lg font-semibold text-white">{reminder.vaccine}</p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-400 flex items-center">
                      <Dog className="mr-2 h-4 w-4" />
                      For
                  </p>
                  <p className="font-semibold text-white">{reminder.dog}</p>
              </div>
              <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-400 flex items-center">
                      <Calendar className="mr-2 h-4 w-4" />
                      Due Date
                  </p>
                  <p className="font-semibold text-white">{reminder.due}</p>
              </div>
          </div>
          {isBooked && transaction && transaction.type === 'vaccination' && ( // FIX: Check transaction type
            <div className="rounded-md border border-green-500/30 bg-green-500/10 p-4 space-y-3 mt-4">
              <h4 className="font-semibold flex items-center text-green-300">
                <CheckCircle className="mr-2 h-5 w-5" />
                Home Visit Booked
              </h4>
              <div className="text-sm space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-slate-400">Booking Date:</span>
                  <span className="font-medium text-white">
                    {transaction.createdAt ? format(transaction.createdAt.toDate(), 'MMM d, yyyy, p') : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-slate-400">Amount Paid:</span>
                  <div className="flex items-center font-medium text-white">
                    <IndianRupee className="h-4 w-4 mr-1" />
                    {transaction.amount}
                  </div>
                </div>
                <div className="flex flex-col items-start pt-1">
                  <span className="font-medium text-slate-400">Payment ID:</span>
                  <span className="font-mono text-xs bg-slate-700 text-white rounded px-1.5 py-0.5 mt-1">
                    {transaction.paymentId}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600">
              Close
            </Button>
          </DialogClose>
          {!isBooked && (
            <BookingFormDialog reminder={reminder}>
              <Button className="bg-purple-500 hover:bg-purple-600 text-white">
                <Home className="mr-2 h-4 w-4" />
                Book Home Vaccination
              </Button>
            </BookingFormDialog>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReminderDetailsDialog;

