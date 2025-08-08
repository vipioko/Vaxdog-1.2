import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Calendar,
  Clock,
  User,
  Phone,
  MapPin,
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  IndianRupee
} from 'lucide-react';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { useDoctorBookings } from '@/hooks/useDoctorBookings';
import { useDoctorActions } from '@/hooks/useDoctorActions';
import { toast } from 'sonner';

const DoctorBookings = () => {
  const { bookings, isLoading } = useDoctorBookings();
  const { markBookingAsComplete, isMarkingComplete } = useDoctorActions();
  const [searchQuery, setSearchQuery] = useState('');

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'completed':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'cancelled':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      default:
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const filteredBookings = bookings.filter(booking =>
    booking.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    booking.service?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    booking.petName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleMarkAsCompleted = (bookingId: string, petOwnerUserId: string, reminderId?: string) => {
    if (!reminderId) {
      toast.error("Cannot mark as complete: Reminder ID is missing.");
      return;
    }
    markBookingAsComplete({ transactionId: bookingId, petOwnerUserId, reminderId });
  };

  if (isLoading) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">My Assigned Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full bg-slate-700" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-white">
          <span className="flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-blue-400" />
            My Assigned Bookings
          </span>
          <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">
            {bookings.length} Total
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search by customer, service, or pet name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-slate-700 border-slate-600 text-white"
          />
        </div>

        {filteredBookings.length === 0 ? (
          <div className="text-center py-16">
            <Calendar className="h-16 w-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">
              {bookings.length === 0 ? 'No bookings assigned yet' : 'No bookings found'}
            </h3>
            <p className="text-slate-400 text-sm">
              {bookings.length === 0 
                ? 'Bookings assigned to you by the admin will appear here' 
                : 'Try adjusting your search terms'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <Card key={booking.id} className="bg-slate-700/30 border-slate-600">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-white mb-1">{booking.service}</h4>
                      <div className="flex items-center gap-4 text-sm text-slate-300">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          <span>{booking.customerName}</span>
                        </div>
                        {booking.petName && (
                          <div className="flex items-center gap-1">
                            <span>🐕</span>
                            <span>{booking.petName}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <Badge className={getStatusColor(booking.status)}>
                      {getStatusIcon(booking.status)}
                      <span className="ml-1 capitalize">{booking.status}</span>
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-slate-300">
                        <Calendar className="h-4 w-4 text-blue-400" />
                        <span>
                          {booking.scheduledDate 
                            ? format(booking.scheduledDate.toDate(), 'MMM d, yyyy, p')
                            : 'Date TBD'
                          }
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <Phone className="h-4 w-4 text-blue-400" />
                        <span>{booking.customerPhone}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-slate-300">
                        <IndianRupee className="h-4 w-4 text-blue-400" />
                        <span className="font-medium">₹{booking.amount?.toFixed(2) || '0.00'}</span>
                      </div>
                      {booking.customerAddress && (
                        <div className="flex items-start gap-2 text-slate-300">
                          <MapPin className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                          <span className="text-xs line-clamp-2">{booking.customerAddress}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {booking.status === 'confirmed' && (
                    <div className="mt-4 flex gap-2">
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        Mark as Completed
                      </Button>
                      <Button size="sm" variant="outline" className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600">
                        Contact Customer
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Calendar,
  Clock,
  User,
  Phone,
  MapPin,
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  IndianRupee
} from 'lucide-react';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { useDoctorBookings } from '@/hooks/useDoctorBookings';
import { useDoctorActions } from '@/hooks/useDoctorActions'; // Import the new hook

const DoctorBookings = () => {
  const { bookings, isLoading } = useDoctorBookings();
  const { markBookingAsComplete, isMarkingComplete } = useDoctorActions(); // Use the new hook
  const [searchQuery, setSearchQuery] = useState('');

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'completed':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'cancelled':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      default:
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const filteredBookings = bookings.filter(booking =>
    booking.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    booking.service?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    booking.petName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleMarkAsCompleted = (bookingId: string, petOwnerUserId: string, reminderId?: string) => {
    if (!reminderId) {
      toast.error("Cannot mark as complete: Reminder ID is missing.");
      return;
    }
    markBookingAsComplete({ transactionId: bookingId, petOwnerUserId, reminderId });
  };

  if (isLoading) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">My Assigned Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full bg-slate-700" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-white">
          <span className="flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-blue-400" />
            My Assigned Bookings
          </span>
          <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">
            {bookings.length} Total
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search by customer, service, or pet name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-slate-700 border-slate-600 text-white"
          />
        </div>

        {filteredBookings.length === 0 ? (
          <div className="text-center py-16">
            <Calendar className="h-16 w-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">
              {bookings.length === 0 ? 'No bookings assigned yet' : 'No bookings found'}
            </h3>
            <p className="text-slate-400 text-sm">
              {bookings.length === 0 
                ? 'Bookings assigned to you by the admin will appear here' 
                : 'Try adjusting your search terms'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <Card key={booking.id} className="bg-slate-700/30 border-slate-600">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-white mb-1">{booking.service}</h4>
                      <div className="flex items-center gap-4 text-sm text-slate-300">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          <span>{booking.customerName}</span>
                        </div>
                        {booking.petName && (
                          <div className="flex items-center gap-1">
                            <span>🐕</span>
                            <span>{booking.petName}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <Badge className={getStatusColor(booking.status)}>
                      {getStatusIcon(booking.status)}
                      <span className="ml-1 capitalize">{booking.status}</span>
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-slate-300">
                        <Calendar className="h-4 w-4 text-blue-400" />
                        <span>
                          {booking.scheduledDate 
                            ? format(booking.scheduledDate.toDate(), 'MMM d, yyyy, p')
                            : 'Date TBD'
                          }
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <Phone className="h-4 w-4 text-blue-400" />
                        <span>{booking.customerPhone}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-slate-300">
                        <IndianRupee className="h-4 w-4 text-blue-400" />
                        <span className="font-medium">₹{booking.amount?.toFixed(2) || '0.00'}</span>
                      </div>
                      {booking.customerAddress && (
                        <div className="flex items-start gap-2 text-slate-300">
                          <MapPin className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                          <span className="text-xs line-clamp-2">{booking.customerAddress}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {booking.status === 'confirmed' && (
                    <div className="mt-4 flex gap-2">
                      <Button 
                        size="sm" 
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleMarkAsCompleted(booking.id, booking.userId, booking.reminderId)}
                        disabled={isMarkingComplete}
                        onClick={() => handleMarkAsCompleted(booking.id, booking.userId, booking.reminderId)}
                        disabled={isMarkingComplete}
                      >
                        {isMarkingComplete ? 'Marking...' : 'Mark as Completed'}
                      </Button>
                      <Button size="sm" variant="outline" className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600">
                        Contact Customer
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DoctorBookings;