// src/components/reminders/UpcomingReminders.tsx
import { Reminder } from '@/data/mock';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Calendar as CalendarIconLucide, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { differenceInDays, startOfToday } from 'date-fns';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import DeleteReminderDialog from './DeleteReminderDialog';
import EditReminderDialog from './EditReminderDialog';
import ReminderDetailsDialog from './ReminderDetailsDialog';
import React from 'react';
import { Transaction } from '@/hooks/useTransactions'; // FIX: Import unified Transaction interface

interface RemindersListProps {
  reminders: Reminder[];
  onMarkAsComplete?: (reminderId: string) => void;
  onDeleteReminder?: (reminderId: string) => void;
  onEditReminder?: (reminderId: string, updatedData: { vaccine: string; due: Date }) => void;
  title?: string;
  showDogName?: boolean;
  transactions?: Transaction[]; // FIX: Use unified Transaction type
}

const UpcomingReminders = ({ reminders, onMarkAsComplete, onDeleteReminder, onEditReminder, title = "Upcoming Vaccinations", showDogName = true, transactions }: RemindersListProps) => {
  const upcoming = reminders.filter(r => r.status === 'upcoming');
  
  // Sort reminders: booked first, then by urgency
  const sortedUpcoming = upcoming.sort((a, b) => {
    // FIX: Check for vaccination type transactions
    const aTransaction = transactions?.find(tx => tx.type === 'vaccination' && tx.reminderId === a.id && tx.status === 'successful');
    const bTransaction = transactions?.find(tx => tx.type === 'vaccination' && tx.reminderId === b.id && tx.status === 'successful');
    const aIsBooked = !!aTransaction;
    const bIsBooked = !!bTransaction;
    
    // Booked items go to top
    if (aIsBooked && !bIsBooked) return -1;
    if (!aIsBooked && bIsBooked) return 1;
    
    // If both booked or both not booked, sort by urgency
    const today = startOfToday();
    const aDaysUntilDue = differenceInDays(new Date(a.due), today);
    const bDaysUntilDue = differenceInDays(new Date(b.due), today);
    
    return aDaysUntilDue - bDaysUntilDue;
  });

  return (
    <div className="space-y-3">
      {title && <h3 className="text-base sm:text-lg font-semibold text-white">{title}</h3>}
      {sortedUpcoming.length > 0 ? sortedUpcoming.map((reminder) => {
        const dueDate = new Date(reminder.due);
        const today = startOfToday();
        const daysUntilDue = differenceInDays(dueDate, today);
        const isOverdue = daysUntilDue < 0;
        const isDueSoon = daysUntilDue >= 0 && daysUntilDue <= 30;
        // FIX: Check for vaccination type transactions
        const transaction = transactions?.find(tx => tx.type === 'vaccination' && tx.reminderId === reminder.id && tx.status === 'successful');
        const isBooked = !!transaction;

        const getStatusColor = () => {
          if (isBooked) return 'border-l-green-500 bg-green-500/10';
          if (isOverdue) return 'border-l-red-500 bg-red-500/10';
          if (isDueSoon) return 'border-l-yellow-500 bg-yellow-500/10';
          return 'border-l-slate-600 bg-slate-800/30';
        };

        const getStatusText = () => {
          if (isBooked) return 'Home visit booked';
          if (isOverdue) {
            const daysOverdue = Math.abs(daysUntilDue);
            return `${daysOverdue} day${daysOverdue > 1 ? 's' : ''} overdue`;
          }
          if (isDueSoon) {
            return `Due ${daysUntilDue === 0 ? 'today' : `in ${daysUntilDue} day${daysUntilDue > 1 ? 's' : ''}`}`;
          }
          return null;
        };

        const getStatusTextColor = () => {
          if (isBooked) return 'text-green-400';
          if (isOverdue) return 'text-red-400';
          if (isDueSoon) return 'text-yellow-400';
          return 'text-slate-400';
        };

        return (
          <ReminderDetailsDialog key={reminder.id} reminder={reminder} isBooked={isBooked} transaction={transaction}>
            <div
              className={cn(
                "p-4 rounded-lg border-l-4 cursor-pointer hover:bg-slate-700/30 transition-all",
                getStatusColor()
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0 pr-2">
                  <p className="font-semibold text-white text-base mb-1">{reminder.vaccine}</p>
                  {showDogName && <p className="text-sm text-slate-400 mb-2">For {reminder.dog}</p>}
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center text-slate-300">
                      <CalendarIconLucide className="mr-1 h-4 w-4" />
                      <span>{reminder.due}</span>
                    </div>
                    
                    {getStatusText() && (
                      <span className={cn("font-medium", getStatusTextColor())}>
                        {getStatusText()}
                      </span>
                    )}
                  </div>
                </div>
                
                {!isBooked && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white" onClick={(e) => e.stopPropagation()}>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                      {onMarkAsComplete && (
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onMarkAsComplete(reminder.id); }} className="text-white hover:bg-slate-700">
                          <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                          <span>Mark as done</span>
                        </DropdownMenuItem>
                      )}
                      {onEditReminder && (
                        <EditReminderDialog reminder={reminder} onEditReminder={onEditReminder}>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()} onClick={(e) => e.stopPropagation()} className="cursor-pointer text-white hover:bg-slate-700">
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Edit</span>
                          </DropdownMenuItem>
                        </EditReminderDialog>
                      )}
                      {onDeleteReminder && (
                        <DeleteReminderDialog reminder={reminder} onDelete={onDeleteReminder}>
                           <DropdownMenuItem 
                             onSelect={(e) => e.preventDefault()}
                             onClick={(e) => e.stopPropagation()}
                             className="text-red-400 focus:text-red-400 focus:bg-red-500/10 cursor-pointer hover:bg-red-500/10"
                           >
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </DeleteReminderDialog>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          </ReminderDetailsDialog>
        );
      }) : <p className="text-slate-400 text-center py-8">No upcoming vaccinations. You're all caught up! 🎉</p>}
    </div>
  );
};

export default UpcomingReminders;

