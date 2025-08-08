// src/pages/Dashboard.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, Plus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import UpcomingReminders from '@/components/reminders/UpcomingReminders';
import CompletedReminders from '@/components/reminders/CompletedReminders';
import AddReminderDialog from '@/components/reminders/AddReminderDialog';
import { useDogs } from '@/hooks/useDogs';
import { useReminders } from '@/hooks/useReminders';
import RemindersSkeleton from '@/components/reminders/RemindersSkeleton';
import { useTransactions } from '@/hooks/useTransactions'; // FIX: Import useTransactions
import AllCompletedBookingsList from '@/components/bookings/AllCompletedBookingsList';
import BookingsList from '@/components/bookings/BookingsList';

const Dashboard = () => {
  const { dogs, isLoadingDogs } = useDogs();
  const { 
    reminders, 
    isLoadingReminders,
    addReminder,
    markReminderAsComplete,
    deleteReminder,
    editReminder,
  } = useReminders();
  const { transactions, isLoading: isLoadingTransactions } = useTransactions(); // FIX: Get transactions from unified hook

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pb-20">
      <div className="px-4 pt-8 pb-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Vaccination Schedule</h1>
          <AddReminderDialog dogs={dogs} onAddReminder={addReminder}>
            <Button size="sm" disabled={isLoadingDogs} className="bg-purple-500 hover:bg-purple-600">
              <Plus className="mr-2 h-4 w-4" />
              Add Reminder
            </Button>
          </AddReminderDialog>
        </div>
        
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-base sm:text-lg text-white">
              <Bell className="mr-2 h-5 w-5 text-purple-400" />
              Vaccination Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="upcoming" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-slate-700/50 mb-6">
                <TabsTrigger 
                  value="upcoming" 
                  className="data-[state=active]:bg-purple-500 data-[state=active]:text-white text-slate-300"
                >
                  Upcoming
                </TabsTrigger>
                <TabsTrigger 
                  value="completed" 
                  className="data-[state=active]:bg-purple-500 data-[state=active]:text-white text-slate-300"
                >
                  History
                </TabsTrigger>
                <TabsTrigger 
                  value="bookings" 
                  className="data-[state=active]:bg-purple-500 data-[state=active]:text-white text-slate-300"
                >
                  Bookings
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="upcoming" className="mt-0">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-white">All Upcoming Vaccinations</h3>
                </div>
                {isLoadingReminders ? (
                  <RemindersSkeleton />
                ) : (
                  <div className="space-y-3">
                    <UpcomingReminders
                      reminders={reminders} 
                      transactions={transactions} // FIX: Pass unified transactions
                      onMarkAsComplete={markReminderAsComplete}
                      onDeleteReminder={deleteReminder}
                      onEditReminder={editReminder}
                      title="" 
                    />
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="completed" className="mt-0">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-white">All Vaccination History</h3>
                </div>
                {isLoadingReminders ? (
                  <RemindersSkeleton />
                ) : (
                  <div className="space-y-3"> {/* FIX: Use AllCompletedBookingsList */}
                    <AllCompletedBookingsList transactions={transactions} />
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="bookings" className="mt-0">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-white">Your Bookings</h3>
                </div>
                {isLoadingTransactions ? (
                  <RemindersSkeleton />
                ) : (
                  <div className="space-y-3">
                    {/* FIX: Filter transactions to only show vaccination bookings for this list */}
                    <BookingsList transactions={transactions.filter(tx => tx.type === 'vaccination')} />
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

