import { Reminder } from '@/data/mock';
import { CheckCircle2 } from 'lucide-react';

interface RemindersListProps {
  reminders: Reminder[];
  title?: string;
  showDogName?: boolean;
}

const CompletedReminders = ({ reminders, title = "Vaccination History", showDogName = true }: RemindersListProps) => {
  const completed = reminders.filter(r => r.status === 'completed');
  return (
    <div className="space-y-3">
       {title && <h3 className="text-base sm:text-lg font-semibold text-white">{title}</h3>}
      {completed.length > 0 ? completed.map((reminder) => (
        <div key={reminder.id} className="p-4 bg-slate-800/30 rounded-lg border-l-4 border-l-green-500 opacity-80">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0 pr-2">
              <p className="font-semibold text-white text-base mb-1">{reminder.vaccine}</p>
              {showDogName && <p className="text-sm text-slate-400 mb-2">For {reminder.dog}</p>}
              <div className="flex items-center text-sm text-green-400 font-medium">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                <span>Completed on {reminder.completedDate}</span>
              </div>
            </div>
          </div>
        </div>
      )) : <p className="text-slate-400 text-center py-8">No completed vaccinations yet.</p>}
    </div>
  );
};

export default CompletedReminders;