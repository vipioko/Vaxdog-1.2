import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Calendar, 
  Heart, 
  Stethoscope, 
  ChevronRight,
  PlusCircle,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  IndianRupee,
  Home as HomeIcon,
  Scissors,
  Home as HostelIcon,
  Clock as ClockIcon,
  Users as UsersIcon,
} from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { useDogs } from '@/hooks/useDogs';
import { useReminders } from '@/hooks/useReminders';
import { useTransactions } from '@/hooks/useTransactions';
import { format, differenceInDays, startOfToday } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useGroomingServices } from '@/hooks/useGroomingServices';
import { usePetHostelServices } from '@/hooks/usePetHostelServices';
import NotificationBell from '@/components/NotificationBell';

// --- Helper Functions ---

// FIX: Dedicated function to get the best user name available
const getUserDisplayName = (user: any) => {
  if (user?.displayName) {
    return user.displayName;
  }
  if (user?.phoneNumber) {
    return `User...${user.phoneNumber.slice(-4)}`;
  }
  return 'Pet Parent';
};

const getHealthStatus = (reminders: any[], transactions: any[]) => {
  const today = startOfToday();
  let overdueCount = 0;
  
  reminders.forEach(reminder => {
    if (reminder.status === 'upcoming') {
      const isBooked = transactions?.some(tx => tx.reminderId === reminder.id && tx.status === 'successful');
      if (isBooked) return;
      
      const daysUntilDue = differenceInDays(new Date(reminder.due), today);
      if (daysUntilDue < 0) overdueCount++;
    }
  });

  if (overdueCount > 0) return { message: `${overdueCount} vaccination${overdueCount > 1 ? 's are' : ' is'} overdue`, color: 'text-red-400' };
  return { message: 'All vaccinations are up to date', color: 'text-green-400' };
};

const getReminderVisuals = (reminder: any, transactions: any[]) => {
  if (!reminder) return null;
  const isBooked = transactions?.some(tx => tx.reminderId === reminder.id && tx.status === 'successful');
  if (isBooked) return { statusText: "Booked & Confirmed", actionText: "View Booking", colorClass: "text-green-400", buttonVariant: "outline" as const };
  const daysUntilDue = differenceInDays(new Date(reminder.due), startOfToday());
  if (daysUntilDue < 0) return { statusText: `${Math.abs(daysUntilDue)} day${Math.abs(daysUntilDue) > 1 ? 's' : ''} Overdue`, actionText: "Book Now (Urgent)", colorClass: "text-red-400", buttonVariant: "default" as const };
  return { statusText: `Due in ${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''}`, actionText: "Book Now", colorClass: "text-yellow-400", buttonVariant: "default" as const };
};

// --- Sub-Components ---

const PetCarouselCard = ({ dog, onClick }: { dog: any, onClick: () => void }) => (
    <div onClick={onClick} className="flex flex-col items-center gap-2 flex-shrink-0 w-24 cursor-pointer group">
        <div className="relative h-24 w-24">
            <Avatar className="h-full w-full border-2 border-slate-700/80 group-hover:border-purple-500 transition-all duration-300 rounded-2xl">
                <AvatarImage src={dog.imageUrl} alt={dog.name} className="object-cover" />
                <AvatarFallback className="bg-purple-600 text-white font-bold rounded-2xl">{dog.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-2xl pointer-events-none"></div>
            <p className="absolute bottom-2 left-0 right-0 text-white text-sm font-semibold text-center truncate px-1 pointer-events-none">{dog.name}</p>
        </div>
    </div>
);

const AddPetCard = ({ onClick }: { onClick: () => void }) => (
     <div onClick={onClick} className="flex flex-col items-center justify-center gap-2 flex-shrink-0 w-24 h-24 cursor-pointer group">
        <div className="h-full w-full rounded-2xl border-2 border-dashed border-slate-600 flex flex-col items-center justify-center bg-slate-800/50 group-hover:border-purple-500 group-hover:bg-slate-800/80 transition-all duration-300">
            <PlusCircle className="h-8 w-8 text-slate-500 group-hover:text-purple-400 transition-colors" />
            <p className="text-slate-400 text-xs font-medium mt-1">Add Pet</p>
        </div>
    </div>
);

const GradientBorderCard = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
    <div className={`relative p-[2px] rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 ${className}`}>
        <div className="bg-slate-900/90 backdrop-blur-sm rounded-[14px] h-full w-full p-4">
            {children}
        </div>
    </div>
);

const GlassCard = ({ children, className = '', onClick }: { children: React.ReactNode, className?: string, onClick?: () => void }) => (
    <div className={`bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-4 ${onClick ? 'cursor-pointer hover:border-slate-600 transition-colors' : ''} ${className}`} onClick={onClick}>
        {children}
    </div>
);

// --- Main Home Component ---

const Home = () => {
  const { user } = useAuth();
  const { dogs, isLoading: dLoading } = useDogs();
  const { reminders, isLoading: rLoading } = useReminders();
  const { transactions, isLoading: tLoading } = useTransactions();
  const { services: groomingServices, isLoading: gLoading } = useGroomingServices();
  const { services: petHostelServices, isLoading: phLoading } = usePetHostelServices();
  const navigate = useNavigate();

  const isLoading = dLoading || rLoading || tLoading || gLoading || phLoading;
  
  const { nextReminder, recentTransaction, healthStatus, stats } = useMemo(() => {
    const upcoming = reminders.filter(r => r.status === 'upcoming').sort((a, b) => new Date(a.due).getTime() - new Date(b.due).getTime());
    const recentTx = transactions?.sort((a,b) => b.createdAt.toMillis() - a.createdAt.toMillis())[0];
    const status = getHealthStatus(reminders, transactions);
    const petStats = { totalPets: dogs.length, completedVaccinations: reminders.filter(r => r.status === 'completed').length };
    return { nextReminder: upcoming[0], recentTransaction: recentTx, healthStatus: status, stats: petStats };
  }, [reminders, transactions, dogs]);

  const reminderVisuals = useMemo(() => getReminderVisuals(nextReminder, transactions), [nextReminder, transactions]);

  if (isLoading) {
    return <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center"><p>Loading dashboard...</p></div>;
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-black to-slate-900 text-white pb-24">
      <header className="px-5 pt-10 pb-6">
        <div className="flex items-start justify-between">
            <div>
                <p className="text-slate-400 text-sm">Welcome back,</p>
                {/* FIX: Using the helper function to display the correct user name */}
                <h1 className="text-3xl font-bold text-white -mt-1">{getUserDisplayName(user)}</h1>
                <p className={`text-sm mt-1 font-medium ${healthStatus.color}`}>{healthStatus.message}</p>
            </div>
            <NotificationBell />
        </div>
      </header>

      <main className="space-y-8 px-5">
        <section>
          {nextReminder && reminderVisuals ? (
              <GradientBorderCard>
                  <div className="flex items-center gap-4 mb-4">
                      <Avatar className="h-14 w-14 border-2 border-slate-700">
                          <AvatarImage src={dogs.find(d => d.name === nextReminder.dog)?.imageUrl} />
                          <AvatarFallback>{nextReminder.dog.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                          <p className="text-slate-400 text-sm">{nextReminder.dog}'s Next Vaccination</p>
                          <p className="text-white font-bold text-lg -mt-1">{nextReminder.vaccine}</p>
                      </div>
                  </div>
                  <div className="flex items-center justify-between bg-slate-800/70 p-3 rounded-lg mb-4">
                      <div className="flex items-center gap-2">
                          <Clock className={`h-5 w-5 ${reminderVisuals.colorClass}`} />
                          <span className={`font-semibold ${reminderVisuals.colorClass}`}>{reminderVisuals.statusText}</span>
                      </div>
                      <p className="text-slate-300">{format(new Date(nextReminder.due), 'MMM d, yyyy')}</p>
                  </div>
                  <Button onClick={() => navigate('/dashboard')} size="lg" className="w-full font-bold text-base bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-[0_0_20px_rgba(192,38,211,0.5)] transition-shadow duration-300">
                      {reminderVisuals.actionText}
                      <ArrowRight className="h-5 w-5 ml-2"/>
                  </Button>
              </GradientBorderCard>
          ) : (
              <GradientBorderCard>
                  <div className="text-center py-4">
                      <CheckCircle className="h-12 w-12 mx-auto text-green-400 mb-2"/>
                      <h3 className="text-white text-lg font-semibold">All Caught Up!</h3>
                      <p className="text-slate-400 text-sm">No upcoming vaccinations found.</p>
                  </div>
              </GradientBorderCard>
          )}
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">My Pets</h2>
              <ChevronRight className="h-5 w-5 text-slate-500"/>
          </div>
          {dogs.length > 0 ? (
             <div className="flex gap-4 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
                {dogs.map(dog => <PetCarouselCard key={dog.id} dog={dog} onClick={() => navigate(`/my-dogs/${dog.name}`)} />)}
                <AddPetCard onClick={() => navigate('/my-dogs')} />
             </div>
          ) : (
            <GlassCard className="text-center">
                <Heart className="h-8 w-8 mx-auto text-purple-400 mb-2"/>
                <h3 className="text-white font-semibold">Welcome to GVAX!</h3>
                <p className="text-slate-400 text-sm mb-4">Add your pet to start tracking their health.</p>
                <Button onClick={() => navigate('/my-dogs')} className="bg-purple-600 hover:bg-purple-700">Add Your First Pet</Button>
            </GlassCard>
          )}
        </section>

        {recentTransaction && (
             <section>
                <h2 className="text-lg font-semibold text-white mb-4">Recent Booking</h2>
                <GlassCard>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 rounded-full bg-green-500/10"><HomeIcon className="h-5 w-5 text-green-400"/></div>
                        <div className="flex-1">
                            <p className="text-white font-medium">{recentTransaction.service}</p>
                            <p className="text-slate-400 text-xs">{format(recentTransaction.createdAt.toDate(), 'MMM d, yyyy')}</p>
                        </div>
                        <Badge className={`text-xs ${recentTransaction.status === 'successful' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                            {recentTransaction.status === 'successful' ? 'Paid' : 'Failed'}
                        </Badge>
                    </div>
                    <div className="border-t border-slate-700/50 pt-3 flex items-center justify-between">
                        <span className="text-slate-400 text-sm">Amount Paid</span>
                        <span className="text-white font-bold flex items-center"><IndianRupee className="h-4 w-4 mr-0.5" />{recentTransaction.amount}</span>
                    </div>
                </GlassCard>
            </section>
        )}

        <section className="grid grid-cols-2 gap-4">
            <GlassCard className="text-center">
                <p className="text-3xl font-bold text-white">{stats.totalPets}</p>
                <p className="text-slate-400 text-sm">Total Pets</p>
            </GlassCard>
             <GlassCard className="text-center">
                <p className="text-3xl font-bold text-white">{stats.completedVaccinations}</p>
                <p className="text-slate-400 text-sm">Completed</p>
            </GlassCard>
        </section>

        {/* Grooming Services Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Grooming Services</h2>
            <Button variant="ghost" size="sm" className="text-purple-400 hover:text-white" onClick={() => navigate('/grooming-services')}>
              View All <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          {gLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Skeleton className="h-40 rounded-lg bg-slate-700" />
              <Skeleton className="h-40 rounded-lg bg-slate-700" />
            </div>
          ) : groomingServices.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {groomingServices.slice(0, 2).map(service => (
                <GlassCard key={service.id} onClick={() => navigate(`/grooming-services/${service.id}`)}>
                  <div className="flex items-center gap-4">
                    {service.imageUrl && (
                      <img src={service.imageUrl} alt={service.name} className="w-16 h-16 object-cover rounded-lg" />
                    )}
                    <div className="flex-1">
                      <h3 className="text-white font-semibold">{service.name}</h3>
                      <p className="text-slate-400 text-sm line-clamp-2">{service.description}</p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center text-white text-sm">
                          <IndianRupee className="h-4 w-4 mr-1" />{service.price.toFixed(2)}
                        </div>
                        <div className="flex items-center text-slate-400 text-xs">
                          <ClockIcon className="h-3 w-3 mr-1" />{service.duration} min
                        </div>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          ) : (
            <GlassCard className="text-center">
              <Scissors className="h-8 w-8 mx-auto text-purple-400 mb-2"/>
              <h3 className="text-white font-semibold">No Grooming Services</h3>
              <p className="text-slate-400 text-sm">Check back later for available services.</p>
            </GlassCard>
          )}
        </section>

        {/* Pet Hostel Services Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Pet Hostel Services</h2>
            <Button variant="ghost" size="sm" className="text-blue-400 hover:text-white" onClick={() => navigate('/pet-hostel-services')}>
              View All <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          {phLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Skeleton className="h-40 rounded-lg bg-slate-700" />
              <Skeleton className="h-40 rounded-lg bg-slate-700" />
            </div>
          ) : petHostelServices.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {petHostelServices.slice(0, 2).map(service => (
                <GlassCard key={service.id} onClick={() => navigate(`/pet-hostel-services/${service.id}`)}>
                  <div className="flex items-center gap-4">
                    {service.imageUrl && (
                      <img src={service.imageUrl} alt={service.name} className="w-16 h-16 object-cover rounded-lg" />
                    )}
                    <div className="flex-1">
                      <h3 className="text-white font-semibold">{service.name}</h3>
                      <p className="text-slate-400 text-sm line-clamp-2">{service.description}</p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center text-white text-sm">
                          <IndianRupee className="h-4 w-4 mr-1" />{service.dailyRate.toFixed(2)}/day
                        </div>
                        <div className="flex items-center text-slate-400 text-xs">
                          <UsersIcon className="h-3 w-3 mr-1" />Capacity: {service.capacity}
                        </div>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          ) : (
            <GlassCard className="text-center">
              <HostelIcon className="h-8 w-8 mx-auto text-blue-400 mb-2"/>
              <h3 className="text-white font-semibold">No Pet Hostel Services</h3>
              <p className="text-slate-400 text-sm">Check back later for available services.</p>
            </GlassCard>
          )}
        </section>
      </main>
    </div>
  );
};

export default Home;