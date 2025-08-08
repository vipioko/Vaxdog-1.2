// src/pages/Bookings.tsx
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search,
  Calendar,
  MapPin,
  IndianRupee,
  User,
  Clock,
  Home as HomeIcon,
  Stethoscope,
  CheckCircle,
  XCircle,
  Scissors,
  Home as HostelIcon,
  Dog as DogIcon, // Import Dog icon
  Utensils, // Import Utensils icon
} from 'lucide-react';
import { useTransactions, Transaction } from '@/hooks/useTransactions'; // FIX: Import Transaction interface
import { format } from 'date-fns';
import RemindersSkeleton from '@/components/reminders/RemindersSkeleton';

const Bookings = () => {
  const [activeTab, setActiveTab] = useState('home-vaccinations');
  const [searchQuery, setSearchQuery] = useState('');
  const { transactions, isLoading } = useTransactions(); // FIX: Use unified transactions hook

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'successful':
      case 'paid':
      case 'confirmed':
      case 'completed': // FIX: Add completed status
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'failed':
      case 'cancelled': // FIX: Add cancelled status
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'pending':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'successful':
      case 'paid':
        return 'Confirmed';
      case 'failed':
        return 'Failed';
      case 'pending':
        return 'Pending';
      case 'confirmed':
        return 'Confirmed';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'successful':
      case 'confirmed':
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'failed':
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  // FIX: Filter transactions by type for each tab
  const homeVaccinationBookings = transactions?.filter(tx => tx.type === 'vaccination') || [];
  const groomingBookings = transactions?.filter(tx => tx.type === 'grooming') || [];
  const petHostelBookings = transactions?.filter(tx => tx.type === 'petHostel') || [];

  const filteredHomeVaccinationBookings = homeVaccinationBookings.filter(booking =>
    booking.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (booking.petName && booking.petName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredGroomingBookings = groomingBookings.filter(booking =>
    booking.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (booking.petName && booking.petName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredPetHostelBookings = petHostelBookings.filter(booking =>
    booking.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (booking.petName && booking.petName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pb-20">
        <div className="px-4 pt-8">
          <h1 className="text-2xl font-bold text-white mb-6">Bookings</h1>
          <RemindersSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pb-20">
      <div className="px-4 pt-8 pb-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Bookings</h1>
          <div className="flex items-center gap-2"></div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-700/50 mb-6">
            <TabsTrigger 
              value="home-vaccinations" 
              className="data-[state=active]:bg-purple-500 data-[state=active]:text-white text-slate-300"
            >
              Home Vaccinations
            </TabsTrigger>
            <TabsTrigger 
              value="grooming" 
              className="data-[state=active]:bg-purple-500 data-[state=active]:text-white text-slate-300"
            >
              Grooming
            </TabsTrigger>
            <TabsTrigger 
              value="pet-hostel" 
              className="data-[state=active]:bg-purple-500 data-[state=active]:text-white text-slate-300"
            >
              Pet Hostel
            </TabsTrigger>
          </TabsList>

          <TabsContent value="home-vaccinations" className="mt-0">
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Search bookings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-800/50 border-slate-700 text-white placeholder-slate-400 pl-10 rounded-xl h-12"
              />
            </div>

            <div className="space-y-4">
              {filteredHomeVaccinationBookings.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">
                    {homeVaccinationBookings.length === 0 ? 'No bookings yet' : 'No bookings found'}
                  </h3>
                  <p className="text-slate-400 text-sm">
                    {homeVaccinationBookings.length === 0 
                      ? 'Your home vaccination bookings will appear here' 
                      : 'Try adjusting your search terms'
                    }
                  </p>
                </div>
              ) : (
                filteredHomeVaccinationBookings.map((booking) => {
                  const bookingId = booking.id.slice(-3).toUpperCase();
                  
                  return (
                    <Card key={booking.id} className="bg-slate-800/50 border-slate-700 overflow-hidden">
                      <CardContent className="p-0">
                        <div className="p-4 pb-2">
                          <div className="flex justify-center mb-4">
                            <Badge className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 rounded-full">
                              <Stethoscope className="h-4 w-4 mr-2" />
                              Home Vaccination
                            </Badge>
                          </div>

                          <div className="text-center mb-4">
                            <h2 className="text-2xl font-bold text-white mb-1">#{bookingId}</h2>
                            <p className="text-slate-400 text-sm">
                              Booking status: <span className={`font-medium ${getStatusColor(booking.status)}`}>
                                {getStatusText(booking.status)}
                              </span>
                            </p>
                          </div>
                        </div>

                        <div className="px-4 pb-4 space-y-3">
                          <div className="text-center mb-4">
                            <p className="text-white font-medium text-sm">{booking.service}</p>
                          </div>

                          {booking.petName && (
                            <div className="flex items-center gap-3">
                              <Avatar className="h-12 w-12">
                                <AvatarFallback className="bg-purple-500 text-white">
                                  {booking.petName.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <p className="text-white font-medium">{booking.petName}</p>
                                <p className="text-slate-400 text-sm">Your pet</p>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-400 flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              Booked On
                            </span>
                            <span className="text-white font-medium">
                              {booking.createdAt ? format(booking.createdAt.toDate(), 'MMM d, yyyy, p') : 'N/A'}
                            </span>
                          </div>

                          {booking.slotDatetime && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-slate-400 flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                Scheduled
                              </span>
                              <span className="text-white font-medium">
                                {format(booking.slotDatetime.toDate(), 'MMM d, yyyy, p')}
                              </span>
                            </div>
                          )}

                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-400 flex items-center gap-2">
                              <IndianRupee className="h-4 w-4" />
                              Amount
                            </span>
                            <span className="text-green-400 font-bold text-lg">
                              ₹{booking.amount.toFixed(2)}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-400">Payment ID</span>
                            <span className="text-white font-mono text-xs">
                              {booking.paymentId ? booking.paymentId.slice(-8) : 'N/A'}
                            </span>
                          </div>

                          {booking.customer && (
                            <>
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-400 flex items-center gap-2">
                                  <User className="h-4 w-4" />
                                  Contact
                                </span>
                                <span className="text-white font-medium">{booking.customer.name}</span>
                              </div>

                              {booking.customer.address && (
                                <div className="flex items-start justify-between text-sm">
                                  <span className="text-slate-400 flex items-center gap-2">
                                    <MapPin className="h-4 w-4 mt-0.5" />
                                    Address
                                  </span>
                                  <div className="text-right text-white max-w-48">
                                    <p className="text-xs leading-relaxed">
                                      {booking.customer.address}, {booking.customer.city} - {booking.customer.postalCode}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </>
                          )}

                          {booking.vaccines && booking.vaccines.length > 0 && (
                            <div className="mt-4 p-3 bg-slate-700/30 rounded-lg">
                              <p className="text-slate-400 text-sm mb-2">Vaccines:</p>
                              <div className="space-y-1">
                                {booking.vaccines.map((vaccine, index) => (
                                  <div key={index} className="flex justify-between text-sm">
                                    <span className="text-white">{vaccine.name}</span>
                                    <span className="text-slate-300">₹{vaccine.price}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="px-4 pb-4">
                          <div className={`flex items-center justify-center gap-2 p-3 rounded-xl ${getStatusColor(booking.status)}`}>
                            {getStatusIcon(booking.status)}
                            <span className="font-medium">
                              {booking.status === 'successful' ? 'Payment Successful - Home Visit Scheduled' :
                               booking.status === 'failed' ? 'Payment Failed - Please Try Again' :
                               'Payment Processing'}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>

          <TabsContent value="grooming" className="mt-0">
            <GroomingBookingsList transactions={filteredGroomingBookings} /> {/* FIX: Pass filtered transactions */}
          </TabsContent>

          <TabsContent value="pet-hostel" className="mt-0">
            <PetHostelBookingsList transactions={filteredPetHostelBookings} /> {/* FIX: Pass filtered transactions */}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// FIX: New component for Grooming Bookings List - now accepts transactions as prop
const GroomingBookingsList = ({ transactions }: { transactions: Transaction[] }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBookings = transactions.filter(booking =>
    booking.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (booking.petName && booking.petName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'completed': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'cancelled': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'pending': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      default: return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed': return <CheckCircle className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  // FIX: Removed isLoading check as data is passed via prop
  if (transactions.length === 0 && searchQuery === '') { // Only show empty state if no search query
    return (
      <div className="text-center py-12">
        <Scissors className="h-16 w-16 text-slate-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">No grooming bookings yet</h3>
        <p className="text-slate-400 text-sm">Book a grooming service to see it here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          type="text"
          placeholder="Search grooming bookings..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-800/50 border-slate-700 text-white placeholder-slate-400 pl-10 rounded-xl h-12"
        />
      </div>
      {filteredBookings.length === 0 ? (
        <div className="text-center py-12">
          <Scissors className="h-16 w-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No grooming bookings found</h3>
          <p className="text-slate-400 text-sm">Try adjusting your search terms.</p>
        </div>
      ) : (
        filteredBookings.map(booking => (
          <Card key={booking.id} className="bg-slate-800/50 border-slate-700 overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-white">{booking.service}</h3> {/* FIX: Use generic service field */}
                <Badge className={getStatusColor(booking.status)}> {/* FIX: Use generic status field */}
                  {getStatusIcon(booking.status)}
                  <span className="ml-1 capitalize">{getStatusText(booking.status)}</span>
                </Badge>
              </div>
              <div className="space-y-2 text-sm">
                <p className="text-slate-300">For: {booking.petName} ({booking.petDetails?.breed})</p>
                {booking.petDetails?.age && (
                  <p className="text-slate-300">Age: {booking.petDetails.age} years</p>
                )}
                {booking.petDetails?.weight && (
                  <p className="text-slate-300">Weight: {booking.petDetails.weight} kg</p>
                )}
                {booking.petDetails?.sex && (
                  <p className="text-slate-300">Sex: {booking.petDetails.sex}</p>
                )}
                <p className="text-slate-300">Date: {booking.preferredDate ? format(new Date(booking.preferredDate), 'PPP') : 'N/A'}</p>
                <p className="text-slate-300">Time: {booking.preferredTime || 'N/A'}</p>
                <div className="flex items-center text-white font-bold">
                  <IndianRupee className="h-4 w-4 mr-1" />
                  {booking.amount.toFixed(2)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

// FIX: New component for Pet Hostel Bookings List - now accepts transactions as prop
const PetHostelBookingsList = ({ transactions }: { transactions: Transaction[] }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBookings = transactions.filter(booking =>
    booking.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (booking.petName && booking.petName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'completed': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'cancelled': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'pending': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      default: return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed': return <CheckCircle className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  // FIX: Removed isLoading check as data is passed via prop
  if (transactions.length === 0 && searchQuery === '') { // Only show empty state if no search query
    return (
      <div className="text-center py-12">
        <HostelIcon className="h-16 w-16 text-slate-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">No pet hostel bookings yet</h3>
        <p className="text-slate-400 text-sm">Book a pet hostel service to see it here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          type="text"
          placeholder="Search pet hostel bookings..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-800/50 border-slate-700 text-white placeholder-slate-400 pl-10 rounded-xl h-12"
        />
      </div>
      {filteredBookings.length === 0 ? (
        <div className="text-center py-12">
          <HostelIcon className="h-16 w-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No pet hostel bookings found</h3>
          <p className="text-slate-400 text-sm">Try adjusting your search terms.</p>
        </div>
      ) : (
        filteredBookings.map(booking => (
          <Card key={booking.id} className="bg-slate-800/50 border-slate-700 overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-white">{booking.service}</h3> {/* FIX: Use generic service field */}
                <Badge className={getStatusColor(booking.status)}> {/* FIX: Use generic status field */}
                  {getStatusIcon(booking.status)}
                  <span className="ml-1 capitalize">{getStatusText(booking.status)}</span>
                </Badge>
              </div>
              <div className="space-y-2 text-sm">
                <p className="text-slate-300">For: {booking.petName} ({booking.petDetails?.breed})</p>
                {booking.petDetails?.age && (
                  <p className="text-slate-300">Age: {booking.petDetails.age} years</p>
                )}
                {booking.petDetails?.weight && (
                  <p className="text-slate-300">Weight: {booking.petDetails.weight} kg</p>
                )}
                {booking.petDetails?.sex && (
                  <p className="text-slate-300">Sex: {booking.petDetails.sex}</p>
                )}
                <p className="text-slate-300">Check-in: {booking.startDate ? format(new Date(booking.startDate), 'PPP') : 'N/A'}</p>
                <p className="text-slate-300">Check-out: {booking.endDate ? format(new Date(booking.endDate), 'PPP') : 'N/A'}</p>
                <p className="text-slate-300">Food: {booking.foodPreference || 'N/A'}</p>
                <div className="flex items-center text-white font-bold">
                  <IndianRupee className="h-4 w-4 mr-1" />
                  {booking.amount.toFixed(2)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default Bookings;

