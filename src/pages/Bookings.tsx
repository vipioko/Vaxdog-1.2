import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Search,
  Calendar,
  MapPin,
  IndianRupee,
  User,
  Clock,
  Home,
  Stethoscope,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useTransactions } from '@/hooks/useTransactions';
import { format } from 'date-fns';
import RemindersSkeleton from '@/components/reminders/RemindersSkeleton';

const Bookings = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { transactions, isLoading } = useTransactions();

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'successful':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'failed':
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
        return 'Confirmed';
      case 'failed':
        return 'Failed';
      case 'pending':
        return 'Pending';
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'successful':
        return <CheckCircle className="h-4 w-4" />;
      case 'failed':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  // Filter transactions to only show home vaccination bookings
  const homeBookings = transactions?.filter(tx => 
    tx.service.toLowerCase().includes('home vaccination') ||
    tx.service.toLowerCase().includes('vaccination')
  ) || [];

  const filteredBookings = homeBookings.filter(booking =>
    booking.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (booking.dogName && booking.dogName.toLowerCase().includes(searchQuery.toLowerCase()))
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
      {/* Header */}
      <div className="px-4 pt-8 pb-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Bookings</h1>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-slate-600 rounded-full"></div>
            <div className="w-6 h-2 bg-slate-600 rounded-full"></div>
          </div>
        </div>

        {/* Search Bar */}
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
      </div>

      {/* Bookings List */}
      <div className="px-4 space-y-4">
        {filteredBookings.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">
              {homeBookings.length === 0 ? 'No bookings yet' : 'No bookings found'}
            </h3>
            <p className="text-slate-400 text-sm">
              {homeBookings.length === 0 
                ? 'Your home vaccination bookings will appear here' 
                : 'Try adjusting your search terms'
              }
            </p>
          </div>
        ) : (
          filteredBookings.map((booking) => {
            const bookingId = booking.id.slice(-3).toUpperCase();
            
            return (
              <Card key={booking.id} className="bg-slate-800/50 border-slate-700 overflow-hidden">
                <CardContent className="p-0">
                  {/* Service Type Badge */}
                  <div className="p-4 pb-2">
                    <div className="flex justify-center mb-4">
                      <Badge className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 rounded-full">
                        <Stethoscope className="h-4 w-4 mr-2" />
                        Home Vaccination
                      </Badge>
                    </div>

                    {/* Booking ID and Status */}
                    <div className="text-center mb-4">
                      <h2 className="text-2xl font-bold text-white mb-1">#{bookingId}</h2>
                      <p className="text-slate-400 text-sm">
                        Booking status: <span className={`font-medium ${
                          booking.status === 'successful' ? 'text-green-400' :
                          booking.status === 'failed' ? 'text-red-400' : 'text-orange-400'
                        }`}>
                          {getStatusText(booking.status)}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Booking Details */}
                  <div className="px-4 pb-4 space-y-3">
                    {/* Service Description */}
                    <div className="text-center mb-4">
                      <p className="text-white font-medium text-sm">{booking.service}</p>
                    </div>

                    {/* Pet Info */}
                    {booking.dogName && (
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-purple-500 text-white">
                            {booking.dogName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-white font-medium">{booking.dogName}</p>
                          <p className="text-slate-400 text-sm">Your pet</p>
                        </div>
                      </div>
                    )}

                    {/* Booking Date */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400 flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Booked On
                      </span>
                      <span className="text-white font-medium">
                        {booking.createdAt ? format(booking.createdAt.toDate(), 'MMM d, yyyy, p') : 'N/A'}
                      </span>
                    </div>

                    {/* Scheduled Time */}
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

                    {/* Price */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400 flex items-center gap-2">
                        <IndianRupee className="h-4 w-4" />
                        Amount
                      </span>
                      <span className="text-green-400 font-bold text-lg">
                        ₹{booking.amount.toFixed(2)}
                      </span>
                    </div>

                    {/* Payment ID */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Payment ID</span>
                      <span className="text-white font-mono text-xs">
                        {booking.paymentId ? booking.paymentId.slice(-8) : 'N/A'}
                      </span>
                    </div>

                    {/* Customer Info */}
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

                    {/* Vaccines */}
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

                  {/* Status Badge */}
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
    </div>
  );
};

export default Bookings;