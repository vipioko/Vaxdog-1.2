import { useParams, useNavigate } from 'react-router-dom';
import { Dog } from '@/data/mock';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Cake, Plus } from 'lucide-react';
import UpcomingReminders from '@/components/reminders/UpcomingReminders';
import CompletedReminders from '@/components/reminders/CompletedReminders';
import AddReminderDialog from '@/components/reminders/AddReminderDialog';
import { useDogs } from '@/hooks/useDogs';
import { useReminders } from '@/hooks/useReminders';
import { Skeleton } from '@/components/ui/skeleton';
import { differenceInYears, differenceInMonths } from 'date-fns';

const DogProfile = () => {
  const { dogName } = useParams<{ dogName: string }>();
  const decodedDogName = decodeURIComponent(dogName || '');
  const navigate = useNavigate();

  const { dogs = [], isLoadingDogs } = useDogs();

  const dog = dogs.find(d => d.name === decodedDogName);

  const { 
    reminders: dogReminders, 
    isLoadingReminders,
    addReminder,
    markReminderAsComplete,
    deleteReminder,
    editReminder,
  } = useReminders(dog?.name);

  const calculateDetailedAge = (dateOfBirth: string | undefined) => {
    if (!dateOfBirth) return null;
    const dob = new Date(dateOfBirth);
    const today = new Date();
    const years = differenceInYears(today, dob);
    const months = differenceInMonths(today, dob) % 12;
    
    if (years > 0 && months > 0) {
      return `${years} ${years === 1 ? 'year' : 'years'} ${months} ${months === 1 ? 'month' : 'months'} old`;
    } else if (years > 0) {
      return `${years} ${years === 1 ? 'year' : 'years'} old`;
    } else if (months > 0) {
      return `${months} ${months === 1 ? 'month' : 'months'} old`;
    } else {
      return 'Less than a month old';
    }
  };
  
  const handleMarkAsComplete = (reminderId: string) => {
    markReminderAsComplete(reminderId);
  };

  const handleAddReminder = ({ dog, vaccine, due }: { dog: string; vaccine: string; due: Date }) => {
    addReminder({
      dog,
      vaccine,
      due,
    });
  };

  const handleDeleteReminder = (reminderId: string) => {
    deleteReminder(reminderId);
  };

  const handleEditReminder = (reminderId: string, updatedData: { vaccine: string; due: Date }) => {
    editReminder(reminderId, updatedData);
  };

  if (isLoadingDogs) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pb-20">
        <div className="px-4 pt-8 space-y-6">
          <Skeleton className="h-9 w-40 bg-slate-700" />
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                <Skeleton className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-slate-700" />
                <div className="text-center sm:text-left space-y-2">
                  <Skeleton className="h-10 w-48 bg-slate-700" />
                  <Skeleton className="h-7 w-32 bg-slate-700" />
                  <Skeleton className="h-6 w-24 bg-slate-700" />
                </div>
              </div>
            </CardHeader>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <Skeleton className="h-8 w-60 bg-slate-700" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full bg-slate-700" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!dog) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pb-20">
        <div className="text-center py-10 px-4">
          <h1 className="text-2xl font-bold text-white mb-4">Dog not found</h1>
          <Button onClick={() => navigate('/my-dogs')} className="bg-purple-500 hover:bg-purple-600">
            Back to My Dogs
          </Button>
        </div>
      </div>
    );
  }

  const detailedAge = calculateDetailedAge(dog.dateOfBirth);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pb-20">
      <div className="px-4 pt-8 pb-6 space-y-6 max-w-4xl mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/my-dogs')} 
          className="pl-0 text-white hover:text-purple-300 hover:bg-white/10"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to My Dogs
        </Button>
        
        <Card className="overflow-hidden bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              {dog.imageUrl ? (
                <div className="relative">
                  <picture>
                    <img 
                      src={dog.imageUrl} 
                      alt={dog.name} 
                      className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-purple-500/30 shadow-lg"
                      loading="lazy"
                      decoding="async"
                      sizes="(max-width: 640px) 96px, 128px"
                    />
                  </picture>
                </div>
              ) : (
                <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-purple-500/30 shadow-lg">
                  <AvatarFallback className="text-3xl sm:text-4xl bg-purple-500/20 text-purple-300 font-bold">
                    {dog.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              )}
              <div className="text-center sm:text-left space-y-1">
                <CardTitle className="text-2xl sm:text-3xl font-bold tracking-tight text-white">{dog.name}</CardTitle>
                <p className="text-base sm:text-lg text-slate-300 font-medium">{dog.breed}</p>
                <div className="flex items-center justify-center sm:justify-start text-sm sm:text-base text-slate-300 mt-2">
                  <Cake className="w-4 h-4 mr-2 text-pink-400 flex-shrink-0" />
                  <span className="font-medium">{detailedAge || 'Age not available'}</span>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-lg sm:text-xl font-semibold text-white">Vaccination Schedule</CardTitle>
            <AddReminderDialog dogs={dogs} onAddReminder={handleAddReminder} defaultDogName={dog.name}>
              <Button size="sm" className="text-xs sm:text-sm bg-purple-500 hover:bg-purple-600">
                <Plus className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                Add Reminder
              </Button>
            </AddReminderDialog>
          </CardHeader>
          <CardContent className="space-y-6 pt-0">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Upcoming Vaccinations</h3>
              <UpcomingReminders 
                reminders={isLoadingReminders ? [] : dogReminders}
                onMarkAsComplete={handleMarkAsComplete} 
                onDeleteReminder={handleDeleteReminder}
                onEditReminder={handleEditReminder}
                showDogName={false}
                title=""
              />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Vaccination History</h3>
              <CompletedReminders 
                reminders={isLoadingReminders ? [] : dogReminders} 
                showDogName={false} 
                title=""
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DogProfile;