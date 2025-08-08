import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Home,
  MoreHorizontal,
  Eye,
  Edit,
  Search,
  IndianRupee,
  Calendar,
  User,
  Clock,
  CheckCircle,
  XCircle,
  Dog,
  Cake,
  Heart,
  Users,
  Image as ImageIcon,
  Utensils,
} from 'lucide-react';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { useIsMobile } from '@/hooks/use-mobile';
import { usePetHostelBookings } from '@/hooks/usePetHostelBookings';
import { PetHostelBooking } from '@/data/mock';

const PetHostelBookingManagement = () => {
  const { adminPetHostelBookings, isLoading, updatePetHostelBookingStatus, isUpdatingPetHostelBookingStatus } = usePetHostelBookings();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<PetHostelBooking | null>(null);
  const [statusUpdateBooking, setStatusUpdateBooking] = useState<PetHostelBooking | null>(null);
  const [newStatus, setNewStatus] = useState<string>('');
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const isMobile = useIsMobile();

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'completed':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'cancelled':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
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
      case 'pending':
        return <Clock className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const filteredBookings = adminPetHostelBookings.filter(booking =>
    booking.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    booking.customerDetails.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    booking.petName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewDetails = (booking: PetHostelBooking) => {
    setSelectedBooking(booking);
    setIsDetailsDialogOpen(true);
  };

  const handleUpdateStatus = (booking: PetHostelBooking) => {
    setStatusUpdateBooking(booking);
    setNewStatus(booking.bookingStatus);
    setIsStatusDialogOpen(true);
  };

  const handleStatusUpdate = async () => {
    if (!statusUpdateBooking || !newStatus) return;

    try {
      await updatePetHostelBookingStatus({
        userId: statusUpdateBooking.userId,
        bookingId: statusUpdateBooking.id,
        status: newStatus as PetHostelBooking['bookingStatus'],
      });
      setIsStatusDialogOpen(false);
      setStatusUpdateBooking(null);
      setNewStatus('');
    } catch (error) {
      console.error('Error updating booking status:', error);
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Pet Hostel Bookings</CardTitle>
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

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-white">
          <span className="flex items-center">
            <Home className="h-5 w-5 mr-2 text-blue-400" />
            Pet Hostel Bookings
          </span>
          <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">
            {adminPetHostelBookings.length} Bookings
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by service, customer, or pet name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-slate-700 border-slate-600 text-white"
          />
        </div>

        {filteredBookings.length === 0 ? (
          <div className="text-center py-16">
            <Home className="h-16 w-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">
              {adminPetHostelBookings.length === 0 ? 'No pet hostel bookings yet' : 'No bookings found'}
            </h3>
            <p className="text-slate-400 text-sm">
              {adminPetHostelBookings.length === 0
                ? 'Pet hostel bookings will appear here when customers place them'
                : 'Try adjusting your search terms'}
            </p>
          </div>
        ) : isMobile ? (
          // Mobile Card View
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <Card key={booking.id} className="border bg-slate-700/30 border-slate-600">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-white">{booking.serviceName}</h4>
                      <p className="text-sm text-slate-400">{booking.customerDetails.name}</p>
                      <p className="text-xs text-slate-500">{booking.petName}</p>
                    </div>
                    <Badge className={getStatusColor(booking.bookingStatus)}>
                      {getStatusIcon(booking.bookingStatus)}
                      <span className="ml-1 capitalize">{booking.bookingStatus}</span>
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                    <div>
                      <span className="text-slate-400">Check-in:</span>
                      <p className="font-medium text-white">
                        {booking.startDate ? format(new Date(booking.startDate), 'MMM d, yyyy') : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400">Amount:</span>
                      <div className="flex items-center font-medium text-white">
                        <IndianRupee className="h-3 w-3 mr-1" />
                        {booking.amount.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                      onClick={() => handleViewDetails(booking)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>

                    <Button
                      size="sm"
                      className="flex-1 bg-blue-500 hover:bg-blue-600"
                      onClick={() => handleUpdateStatus(booking)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Update
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          // Desktop Table View
          <Table>
            <TableHeader>
              <TableRow className="border-slate-700">
                <TableHead className="text-slate-300">Service</TableHead>
                <TableHead className="text-slate-300">Customer</TableHead>
                <TableHead className="text-slate-300">Pet</TableHead>
                <TableHead className="text-slate-300">Dates</TableHead>
                <TableHead className="text-slate-300">Amount</TableHead>
                <TableHead className="text-slate-300">Status</TableHead>
                <TableHead className="text-right text-slate-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBookings.map((booking) => (
                <TableRow key={booking.id} className="border-slate-700">
                  <TableCell className="font-medium text-white">{booking.serviceName}</TableCell>
                  <TableCell>
                    <div className="text-white">
                      <p className="font-medium">{booking.customerDetails.name}</p>
                      <p className="text-sm text-slate-400">{booking.customerDetails.phone}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-white">
                    <p className="font-medium">{booking.petName}</p>
                    <p className="text-sm text-slate-400">{booking.petDetails.breed}</p>
                  </TableCell>
                  <TableCell className="text-white">
                    <p>{booking.startDate ? format(new Date(booking.startDate), 'MMM d, yyyy') : 'N/A'}</p>
                    <p className="text-sm text-slate-400">
                      {booking.endDate ? format(new Date(booking.endDate), 'MMM d, yyyy') : 'N/A'}
                    </p>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-white">
                      <IndianRupee className="h-4 w-4 mr-1" />
                      {booking.amount.toFixed(2)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(booking.bookingStatus)}>
                      {getStatusIcon(booking.bookingStatus)}
                      <span className="ml-1 capitalize">{booking.bookingStatus}</span>
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-white">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                        <DropdownMenuItem onClick={() => handleViewDetails(booking)} className="text-white hover:bg-slate-700">
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateStatus(booking)} className="text-white hover:bg-slate-700">
                          <Edit className="mr-2 h-4 w-4" />
                          Update Status
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Booking Details Dialog */}
        <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-800 border-slate-700 text-white">
            <DialogHeader>
              <DialogTitle className="text-white">Pet Hostel Booking Details - {selectedBooking?.serviceName}</DialogTitle>
            </DialogHeader>
            {selectedBooking && (
              <div className="space-y-6">
                {/* Customer Info */}
                <Card className="bg-slate-700/30 border-slate-600">
                  <CardContent className="p-4">
                    <h4 className="font-medium text-white mb-2 flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Customer Details
                    </h4>
                    <p className="font-semibold text-white">{selectedBooking.customerDetails.name}</p>
                    <p className="text-sm text-slate-400">{selectedBooking.customerDetails.phone}</p>
                    <p className="text-sm text-slate-400">
                      {selectedBooking.customerDetails.address}, {selectedBooking.customerDetails.city} - {selectedBooking.customerDetails.postalCode}
                    </p>
                  </CardContent>
                </Card>

                {/* Pet Info */}
                <Card className="bg-slate-700/30 border-slate-600">
                  <CardContent className="p-4">
                    <h4 className="font-medium text-white mb-2 flex items-center">
                      <Dog className="h-4 w-4 mr-2" />
                      Pet Details
                    </h4>
                    <p className="font-semibold text-white">{selectedBooking.petName}</p>
                    <p className="text-sm text-slate-400">Breed: {selectedBooking.petDetails.breed}</p>
                    <p className="text-sm text-slate-400">Type: {selectedBooking.petDetails.petType}</p>
                    {selectedBooking.petDetails.dateOfBirth && (
                      <p className="text-sm text-slate-400 flex items-center gap-1">
                        <Cake className="h-4 w-4" /> DOB: {format(new Date(selectedBooking.petDetails.dateOfBirth), 'PPP')}
                      </p>
                    )}
                    {selectedBooking.petDetails.age !== undefined && (
                      <p className="text-sm text-slate-400">Age: {selectedBooking.petDetails.age} years</p>
                    )}
                    {selectedBooking.petDetails.weight !== undefined && (
                      <p className="text-sm text-slate-400">Weight: {selectedBooking.petDetails.weight} kg</p>
                    )}
                    {selectedBooking.petDetails.sex && (
                      <p className="text-sm text-slate-400">Sex: {selectedBooking.petDetails.sex}</p>
                    )}
                    {selectedBooking.petDetails.aggressionLevel && (
                      <p className="text-sm text-slate-400">Aggression Level: {selectedBooking.petDetails.aggressionLevel}</p>
                    )}
                    {selectedBooking.petDetails.matingInterest !== undefined && (
                      <p className="text-sm text-slate-400 flex items-center gap-1">
                        <Heart className="h-4 w-4" /> Mating Interest: {selectedBooking.petDetails.matingInterest ? 'Yes' : 'No'}
                      </p>
                    )}
                    {selectedBooking.petDetails.sex === 'Female' && selectedBooking.petDetails.pregnancyCount !== undefined && (
                      <p className="text-sm text-slate-400">Times Pregnant: {selectedBooking.petDetails.pregnancyCount}</p>
                    )}
                    {selectedBooking.petDetails.sex === 'Female' && selectedBooking.petDetails.pupCount !== undefined && (
                      <p className="text-sm text-slate-400">Total Offspring: {selectedBooking.petDetails.pupCount}</p>
                    )}
                  </CardContent>
                </Card>

                {selectedBooking.petDetails?.vaccinationScheduleImages && selectedBooking.petDetails.vaccinationScheduleImages.length > 0 && (
                  <Card className="bg-slate-700/30 border-slate-600">
                    <CardContent className="p-4">
                      <h4 className="font-medium text-white mb-2 flex items-center">
                        <ImageIcon className="h-4 w-4 mr-2" />
                        Vaccination Schedule Images
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {selectedBooking.petDetails.vaccinationScheduleImages.map((imageUrl, index) => (
                          <a
                            key={index}
                            href={imageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block relative group"
                          >
                            <img
                              src={imageUrl}
                              alt={`Vaccination Schedule ${index + 1}`}
                              className="w-full h-24 object-cover rounded-md border border-gray-300 group-hover:opacity-75 transition-opacity"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                              <Eye className="h-6 w-6 text-white" />
                            </div>
                          </a>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Service Info */}
                <Card className="bg-slate-700/30 border-slate-600">
                  <CardContent className="p-4">
                    <h4 className="font-medium text-white mb-2 flex items-center">
                      <Home className="h-4 w-4 mr-2" />
                      Service Details
                    </h4>
                    <p className="font-semibold text-white">{selectedBooking.serviceName}</p>
                    <p className="text-sm text-slate-400">
                      Check-in: {selectedBooking.startDate ? format(new Date(selectedBooking.startDate), 'PPP') : 'N/A'}
                    </p>
                    <p className="text-sm text-slate-400">
                      Check-out: {selectedBooking.endDate ? format(new Date(selectedBooking.endDate), 'PPP') : 'N/A'}
                    </p>
                    <p className="text-sm text-slate-400">
                      Food Preference: {selectedBooking.foodPreference || 'N/A'}
                    </p>
                    <div className="flex items-center text-white font-bold mt-2">
                      <IndianRupee className="h-4 w-4 mr-1" />
                      {selectedBooking.amount.toFixed(2)}
                    </div>
                  </CardContent>
                </Card>

                {/* Status & Payment */}
                <Card className="bg-slate-700/30 border-slate-600">
                  <CardContent className="p-4">
                    <h4 className="font-medium text-white mb-2 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Status & Payment
                    </h4>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getStatusColor(selectedBooking.bookingStatus)}>
                        {getStatusIcon(selectedBooking.bookingStatus)}
                        <span className="ml-1 capitalize">{selectedBooking.bookingStatus}</span>
                      </Badge>
                      <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                        {selectedBooking.paymentStatus}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-400">Payment Method: {selectedBooking.paymentMethod}</p>
                    <p className="text-sm text-slate-400">Payment ID: {selectedBooking.razorpayPaymentId || 'N/A'}</p>
                  </CardContent>
                </Card>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Status Update Dialog */}
        <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
          <DialogContent className="bg-slate-800 border-slate-700 text-white">
            <DialogHeader>
              <DialogTitle className="text-white">Update Pet Hostel Booking Status</DialogTitle>
            </DialogHeader>
            {statusUpdateBooking && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="status" className="text-white">Booking Status</Label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white">
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)} className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600">
                Cancel
              </Button>
              <Button onClick={handleStatusUpdate} disabled={isUpdatingPetHostelBookingStatus} className="bg-blue-500 hover:bg-blue-600">
                {isUpdatingPetHostelBookingStatus ? 'Updating...' : 'Update Status'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default PetHostelBookingManagement;