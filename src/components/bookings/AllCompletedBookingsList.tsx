
import React from 'react';
import { Transaction } from '@/hooks/useTransactions';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle, XCircle, Clock, Stethoscope, Scissors, Home as HostelIcon,
  IndianRupee, Calendar, User, MapPin, Dog as DogIcon, Utensils
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface AllCompletedBookingsListProps {
  transactions: Transaction[];
}

const AllCompletedBookingsList: React.FC<AllCompletedBookingsListProps> = ({ transactions }) => {
  const completedBookings = transactions.filter(tx =>
    tx.status === 'completed' || tx.status === 'successful' || tx.status === 'paid'
  );

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'successful':
      case 'paid':
      case 'confirmed':
      case 'completed':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'failed':
      case 'cancelled':
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

  const getServiceIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'vaccination': return <Stethoscope className="h-4 w-4 mr-2" />;
      case 'grooming': return <Scissors className="h-4 w-4 mr-2" />;
      case 'petHostel': return <HostelIcon className="h-4 w-4 mr-2" />;
      default: return <Calendar className="h-4 w-4 mr-2" />;
    }
  };

  if (completedBookings.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
        <CheckCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-medium text-white mb-2">No completed bookings yet</h3>
        <p className="text-sm">Completed home vaccinations, grooming, and pet hostel bookings will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {completedBookings.map(booking => (
        <Card key={booking.id} className="bg-slate-800/50 border-slate-700 overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-white flex items-center">
                {getServiceIcon(booking.type)}
                {booking.service}
              </h3>
              <Badge className={getStatusColor(booking.status)}>
                {getStatusIcon(booking.status)}
                <span className="ml-1 capitalize">{getStatusText(booking.status)}</span>
              </Badge>
            </div>
            <div className="space-y-2 text-sm">
              {booking.petName && (
                <div className="flex items-center gap-2 text-slate-300">
                  <DogIcon className="h-4 w-4" />
                  <span>For: {booking.petName} ({booking.petDetails?.breed})</span>
                </div>
              )}
              {booking.type === 'vaccination' && booking.slotDatetime && (
                <div className="flex items-center gap-2 text-slate-300">
                  <Calendar className="h-4 w-4" />
                  <span>Scheduled: {format(booking.slotDatetime.toDate(), 'MMM d, yyyy, p')}</span>
                </div>
              )}
              {booking.type === 'grooming' && booking.preferredDate && booking.preferredTime && (
                <div className="flex items-center gap-2 text-slate-300">
                  <Calendar className="h-4 w-4" />
                  <span>Date: {format(new Date(booking.preferredDate), 'MMM d, yyyy')} at {booking.preferredTime}</span>
                </div>
              )}
              {booking.type === 'petHostel' && booking.startDate && booking.endDate && (
                <div className="flex items-center gap-2 text-slate-300">
                  <Calendar className="h-4 w-4" />
                  <span>Stay: {format(new Date(booking.startDate), 'MMM d, yyyy')} to {format(new Date(booking.endDate), 'MMM d, yyyy')}</span>
                </div>
              )}
              <div className="flex items-center text-white font-bold">
                <IndianRupee className="h-4 w-4 mr-1" />
                {booking.amount.toFixed(2)}
              </div>
              {booking.customer?.name && (
                <div className="flex items-center gap-2 text-slate-300">
                  <User className="h-4 w-4" />
                  <span>Booked by: {booking.customer.name}</span>
                </div>
              )}
              {booking.customer?.phone && (
                <div className="flex items-center gap-2 text-slate-300">
                  <User className="h-4 w-4" />
                  <span>Contact: {booking.customer.phone}</span>
                </div>
              )}
              {booking.customer?.address && (
                <div className="flex items-start gap-2 text-slate-300">
                  <MapPin className="h-4 w-4 mt-0.5" />
                  <span className="text-xs line-clamp-2">{booking.customer.address}, {booking.customer.city} - {booking.customer.postalCode}</span>
                </div>
              )}
              {booking.type === 'petHostel' && booking.foodPreference && (
                <div className="flex items-center gap-2 text-slate-300">
                  <Utensils className="h-4 w-4" />
                  <span>Food: {booking.foodPreference}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
