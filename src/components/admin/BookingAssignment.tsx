import React, { useState } from 'react';
import { useAllTransactions, AdminTransaction } from '@/hooks/useAllTransactions';
import { useDoctors } from '@/hooks/useDoctors';
import { useBookingAssignment } from '@/hooks/useBookingAssignment';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  UserCheck, 
  MoreHorizontal, 
  Calendar, 
  User, 
  Stethoscope,
  Search,
  IndianRupee,
  Phone,
  MapPin,
  CheckCircle,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { useIsMobile } from '@/hooks/use-mobile';

const BookingAssignment = () => {
  const { transactions, isLoading: isLoadingTransactions } = useAllTransactions();
  const { doctors, isLoading: isLoadingDoctors } = useDoctors();
  const { assignDoctor, isAssigning } = useBookingAssignment();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<AdminTransaction | null>(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const isMobile = useIsMobile();

  // Filter for successful transactions that don't have assigned doctors yet
  const unassignedBookings = transactions.filter(tx => 
    tx.status === 'successful' && !tx.assignedDoctorId
  );

  const assignedBookings = transactions.filter(tx => 
    tx.status === 'successful' && tx.assignedDoctorId
  );

  const filteredUnassigned = unassignedBookings.filter(booking =>
    booking.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    booking.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
    booking.dogName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAssigned = assignedBookings.filter(booking =>
    booking.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    booking.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
    booking.dogName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAssignDoctor = (booking: AdminTransaction) => {
    setSelectedBooking(booking);
    setSelectedDoctorId('');
    setIsAssignDialogOpen(true);
  };

  const handleConfirmAssignment = async () => {
    if (!selectedBooking || !selectedDoctorId) {
      return;
    }

    try {
      await assignDoctor({
        userId: selectedBooking.userId,
        transactionId: selectedBooking.id,
        doctorId: selectedDoctorId
      });
      setIsAssignDialogOpen(false);
      setSelectedBooking(null);
      setSelectedDoctorId('');
    } catch (error) {
      console.error('Error assigning doctor:', error);
    }
  };

  const getAssignedDoctor = (doctorId: string) => {
    return doctors.find(doc => doc.uid === doctorId);
  };

  if (isLoadingTransactions || isLoadingDoctors) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Booking Assignment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full bg-slate-700" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const BookingCard = ({ booking, isAssigned = false }: { booking: AdminTransaction, isAssigned?: boolean }) => {
    const assignedDoctor = isAssigned && booking.assignedDoctorId ? getAssignedDoctor(booking.assignedDoctorId) : null;
    
    return (
      <Card className="bg-slate-700/30 border-slate-600">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h4 className="font-semibold text-white mb-1">{booking.service}</h4>
              <div className="flex items-center gap-4 text-sm text-slate-300">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>{booking.customer?.name || 'Unknown'}</span>
                </div>
                {booking.dogName && (
                  <div className="flex items-center gap-1">
                    <span>🐕</span>
                    <span>{booking.dogName}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center text-white font-medium">
              <IndianRupee className="h-4 w-4 mr-1" />
              {booking.amount.toFixed(2)}
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-slate-300">
              <Calendar className="h-4 w-4 text-blue-400" />
              <span>
                {booking.slotDatetime 
                  ? format(booking.slotDatetime.toDate(), 'MMM d, yyyy, p')
                  : 'Date TBD'
                }
              </span>
            </div>
            
            {booking.customer?.phone && (
              <div className="flex items-center gap-2 text-slate-300">
                <Phone className="h-4 w-4 text-blue-400" />
                <span>{booking.customer.phone}</span>
              </div>
            )}
            
            {booking.customer?.address && (
              <div className="flex items-start gap-2 text-slate-300">
                <MapPin className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <span className="text-xs line-clamp-2">
                  {booking.customer.address}, {booking.customer.city} - {booking.customer.postalCode}
                </span>
              </div>
            )}
          </div>

          {isAssigned && assignedDoctor ? (
            <div className="mt-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8 border border-green-500/30">
                  <AvatarImage src={assignedDoctor.profileImage} />
                  <AvatarFallback className="bg-green-500/20 text-green-300 text-sm">
                    {assignedDoctor.name?.charAt(0).toUpperCase() || 'D'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-green-300 font-medium text-sm">
                    Assigned to Dr. {assignedDoctor.name || 'Unknown'}
                  </p>
                  <p className="text-green-400 text-xs">{assignedDoctor.specialization || 'General Practice'}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-3">
              <Button 
                size="sm" 
                className="w-full bg-blue-500 hover:bg-blue-600"
                onClick={() => handleAssignDoctor(booking)}
              >
                <UserCheck className="h-4 w-4 mr-2" />
                Assign Doctor
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <>
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-white">
            <span className="flex items-center">
              <UserCheck className="h-5 w-5 mr-2 text-blue-400" />
              Booking Assignment
            </span>
            <div className="flex gap-2">
              <Badge variant="secondary" className="bg-orange-500/20 text-orange-300">
                {unassignedBookings.length} Unassigned
              </Badge>
              <Badge variant="secondary" className="bg-green-500/20 text-green-300">
                {assignedBookings.length} Assigned
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by customer, service, or pet name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-700 border-slate-600 text-white"
            />
          </div>

          {/* Unassigned Bookings */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-orange-400" />
              Unassigned Bookings ({filteredUnassigned.length})
            </h3>
            
            {filteredUnassigned.length === 0 ? (
              <div className="text-center py-8 bg-slate-700/20 rounded-lg">
                <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-2" />
                <p className="text-slate-400">All bookings have been assigned!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredUnassigned.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </div>
            )}
          </div>

          {/* Assigned Bookings */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-green-400" />
              Assigned Bookings ({filteredAssigned.length})
            </h3>
            
            {filteredAssigned.length === 0 ? (
              <div className="text-center py-8 bg-slate-700/20 rounded-lg">
                <UserCheck className="h-12 w-12 text-slate-600 mx-auto mb-2" />
                <p className="text-slate-400">No bookings have been assigned yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAssigned.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} isAssigned />
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Assignment Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Assign Doctor to Booking</DialogTitle>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="space-y-4">
              {/* Booking Summary */}
              <div className="p-3 bg-slate-700/30 rounded-lg">
                <h4 className="font-medium text-white mb-2">Booking Details</h4>
                <div className="space-y-1 text-sm">
                  <p className="text-slate-300">Service: {selectedBooking.service}</p>
                  <p className="text-slate-300">Customer: {selectedBooking.customer?.name}</p>
                  {selectedBooking.dogName && (
                    <p className="text-slate-300">Pet: {selectedBooking.dogName}</p>
                  )}
                  <p className="text-slate-300">
                    Scheduled: {selectedBooking.slotDatetime 
                      ? format(selectedBooking.slotDatetime.toDate(), 'MMM d, yyyy, p')
                      : 'TBD'
                    }
                  </p>
                </div>
              </div>

              {/* Doctor Selection */}
              <div>
                <label className="text-sm font-medium text-white mb-2 block">
                  Select Doctor
                </label>
                <Select value={selectedDoctorId} onValueChange={setSelectedDoctorId}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Choose a doctor..." />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {doctors
                      .filter(doctor => doctor.isActive !== false)
                      .map((doctor) => (
                        <SelectItem key={doctor.uid} value={doctor.uid} className="text-white hover:bg-slate-700">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={doctor.profileImage} />
                              <AvatarFallback className="bg-blue-500/20 text-blue-300 text-xs">
                                {doctor.name?.charAt(0).toUpperCase() || 'D'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <span className="font-medium">{doctor.name || 'Unnamed Doctor'}</span>
                              <span className="text-xs text-slate-400 ml-2">
                                {doctor.specialization || 'General Practice'}
                              </span>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Selected Doctor Info */}
              {selectedDoctorId && (
                <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  {(() => {
                    const doctor = doctors.find(d => d.uid === selectedDoctorId);
                    return doctor ? (
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border border-blue-500/30">
                          <AvatarImage src={doctor.profileImage} />
                          <AvatarFallback className="bg-blue-500/20 text-blue-300">
                            {doctor.name?.charAt(0).toUpperCase() || 'D'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-blue-300 font-medium">Dr. {doctor.name}</p>
                          <p className="text-blue-400 text-sm">{doctor.specialization || 'General Practice'}</p>
                          <p className="text-slate-400 text-xs">{doctor.phoneNumber}</p>
                        </div>
                      </div>
                    ) : null;
                  })()}
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsAssignDialogOpen(false)}
              className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmAssignment}
              disabled={!selectedDoctorId || isAssigning}
              className="bg-blue-500 hover:bg-blue-600"
            >
              {isAssigning ? 'Assigning...' : 'Assign Doctor'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BookingAssignment;