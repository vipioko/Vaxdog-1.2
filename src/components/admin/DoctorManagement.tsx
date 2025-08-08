import React, { useState } from 'react';
import { useDoctors } from '@/hooks/useDoctors';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogClose,
  DialogFooter 
} from '@/components/ui/dialog';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';
import { 
  Stethoscope, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2,
  Search,
  UserPlus,
  Phone,
  Mail,
  MapPin,
  Award,
  Calendar,
  IndianRupee
} from 'lucide-react';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { useIsMobile } from '@/hooks/use-mobile';
import { DoctorProfile } from '@/hooks/useDoctorProfile';

const DoctorManagement = () => {
  const { doctors, isLoading, updateDoctorStatus, isDeletingDoctor } = useDoctors();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorProfile | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const isMobile = useIsMobile();

  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? 'bg-green-500/20 text-green-300 border-green-500/30'
      : 'bg-red-500/20 text-red-300 border-red-500/30';
  };

  const filteredDoctors = doctors.filter(doctor =>
    doctor.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doctor.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doctor.phoneNumber?.includes(searchQuery) ||
    doctor.specialization?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewDetails = (doctor: DoctorProfile) => {
    setSelectedDoctor(doctor);
    setIsDetailsDialogOpen(true);
  };

  const handleToggleStatus = async (doctor: DoctorProfile) => {
    try {
      await updateDoctorStatus(doctor.uid, !doctor.isActive);
    } catch (error) {
      console.error('Error updating doctor status:', error);
    }
  };

  const handleDeleteDoctor = async () => {
    if (!selectedDoctor) return;

    try {
      // Note: In a real implementation, you might want to deactivate instead of delete
      // await deleteDoctor(selectedDoctor.uid);
      await updateDoctorStatus(selectedDoctor.uid, false);
      setIsDeleteDialogOpen(false);
      setSelectedDoctor(null);
    } catch (error) {
      console.error('Error deactivating doctor:', error);
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Doctor Management</CardTitle>
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
            <Stethoscope className="h-5 w-5 mr-2 text-blue-400" />
            Doctor Management
          </span>
          <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">
            {doctors.length} Doctors
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by name, email, phone, or specialization..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-slate-700 border-slate-600 text-white"
          />
        </div>

        {filteredDoctors.length === 0 ? (
          <div className="text-center py-16">
            <Stethoscope className="h-16 w-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">
              {doctors.length === 0 ? 'No doctors registered yet' : 'No doctors found'}
            </h3>
            <p className="text-slate-400 text-sm">
              {doctors.length === 0 
                ? 'Doctors will appear here when they register with the app' 
                : 'Try adjusting your search terms'
              }
            </p>
          </div>
        ) : isMobile ? (
          // Mobile Card View
          <div className="space-y-4">
            {filteredDoctors.map((doctor) => (
              <Card key={doctor.uid} className="bg-slate-700/30 border-slate-600">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <Avatar className="h-12 w-12 border-2 border-blue-500/30">
                      <AvatarImage src={doctor.profileImage} />
                      <AvatarFallback className="bg-blue-500/20 text-blue-300">
                        {doctor.name?.charAt(0).toUpperCase() || 'D'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-white truncate">{doctor.name || 'Unnamed Doctor'}</h4>
                      <p className="text-sm text-slate-400 truncate">{doctor.specialization || 'General Practice'}</p>
                      <p className="text-xs text-slate-500">{doctor.phoneNumber}</p>
                    </div>
                    <Badge className={getStatusColor(doctor.isActive ?? true)}>
                      {doctor.isActive !== false ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                      onClick={() => handleViewDetails(doctor)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    
                    <Button 
                      size="sm" 
                      className={`flex-1 ${doctor.isActive !== false ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                      onClick={() => handleToggleStatus(doctor)}
                    >
                      {doctor.isActive !== false ? 'Deactivate' : 'Activate'}
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
                <TableHead className="text-slate-300">Doctor</TableHead>
                <TableHead className="text-slate-300">Contact</TableHead>
                <TableHead className="text-slate-300">Specialization</TableHead>
                <TableHead className="text-slate-300">Experience</TableHead>
                <TableHead className="text-slate-300">Status</TableHead>
                <TableHead className="text-right text-slate-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDoctors.map((doctor) => (
                <TableRow key={doctor.uid} className="border-slate-700">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border-2 border-blue-500/30">
                        <AvatarImage src={doctor.profileImage} />
                        <AvatarFallback className="bg-blue-500/20 text-blue-300">
                          {doctor.name?.charAt(0).toUpperCase() || 'D'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-white">{doctor.name || 'Unnamed Doctor'}</div>
                        <div className="text-sm text-slate-400">{doctor.phoneNumber}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-white text-sm">{doctor.email || 'No email'}</div>
                      <div className="text-slate-400 text-xs">{doctor.phoneNumber}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-white">{doctor.specialization || 'General Practice'}</TableCell>
                  <TableCell className="text-white">{doctor.experience || 'Not specified'}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(doctor.isActive ?? true)}>
                      {doctor.isActive !== false ? 'Active' : 'Inactive'}
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
                        <DropdownMenuItem onClick={() => handleViewDetails(doctor)} className="text-white hover:bg-slate-700">
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleToggleStatus(doctor)}
                          className="text-white hover:bg-slate-700"
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          {doctor.isActive !== false ? 'Deactivate' : 'Activate'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Doctor Details Dialog */}
        <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
          <DialogContent className="max-w-2xl bg-slate-800 border-slate-700 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white">Doctor Profile Details</DialogTitle>
            </DialogHeader>
            {selectedDoctor && (
              <div className="space-y-6">
                {/* Doctor Header */}
                <div className="flex items-center gap-4 p-4 bg-slate-700/30 rounded-lg">
                  <Avatar className="h-16 w-16 border-2 border-blue-500/30">
                    <AvatarImage src={selectedDoctor.profileImage} />
                    <AvatarFallback className="bg-blue-500/20 text-blue-300 text-xl">
                      {selectedDoctor.name?.charAt(0).toUpperCase() || 'D'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white">{selectedDoctor.name || 'Unnamed Doctor'}</h3>
                    <p className="text-blue-300">{selectedDoctor.specialization || 'General Practice'}</p>
                    <Badge className={getStatusColor(selectedDoctor.isActive ?? true)}>
                      {selectedDoctor.isActive !== false ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h4 className="font-medium text-white mb-3 flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-blue-400" />
                    Contact Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-slate-700/20 rounded-lg">
                    <div>
                      <p className="text-sm text-slate-400">Phone</p>
                      <p className="text-white">{selectedDoctor.phoneNumber || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Email</p>
                      <p className="text-white">{selectedDoctor.email || 'Not provided'}</p>
                    </div>
                  </div>
                </div>

                {/* Professional Information */}
                <div>
                  <h4 className="font-medium text-white mb-3 flex items-center">
                    <Award className="h-4 w-4 mr-2 text-blue-400" />
                    Professional Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-slate-700/20 rounded-lg">
                    <div>
                      <p className="text-sm text-slate-400">Qualification</p>
                      <p className="text-white">{selectedDoctor.qualification || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Experience</p>
                      <p className="text-white">{selectedDoctor.experience || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Consultation Fee</p>
                      <div className="flex items-center text-white">
                        <IndianRupee className="h-4 w-4 mr-1" />
                        {selectedDoctor.consultationFee || 0}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Joined</p>
                      <p className="text-white">
                        {selectedDoctor.createdAt 
                          ? format(selectedDoctor.createdAt.toDate(), 'MMM d, yyyy')
                          : 'Unknown'
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {/* Clinic Information */}
                {(selectedDoctor.clinicName || selectedDoctor.clinicAddress) && (
                  <div>
                    <h4 className="font-medium text-white mb-3 flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-blue-400" />
                      Clinic Information
                    </h4>
                    <div className="p-3 bg-slate-700/20 rounded-lg">
                      {selectedDoctor.clinicName && (
                        <div className="mb-2">
                          <p className="text-sm text-slate-400">Clinic Name</p>
                          <p className="text-white">{selectedDoctor.clinicName}</p>
                        </div>
                      )}
                      {selectedDoctor.clinicAddress && (
                        <div>
                          <p className="text-sm text-slate-400">Address</p>
                          <p className="text-white">{selectedDoctor.clinicAddress}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Bio */}
                {selectedDoctor.bio && (
                  <div>
                    <h4 className="font-medium text-white mb-3">Professional Bio</h4>
                    <div className="p-3 bg-slate-700/20 rounded-lg">
                      <p className="text-white leading-relaxed">{selectedDoctor.bio}</p>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <Button
                    onClick={() => handleToggleStatus(selectedDoctor)}
                    className={selectedDoctor.isActive !== false ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
                  >
                    {selectedDoctor.isActive !== false ? 'Deactivate Doctor' : 'Activate Doctor'}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent className="bg-slate-800 border-slate-700">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">Deactivate Doctor?</AlertDialogTitle>
              <AlertDialogDescription className="text-slate-400">
                This will deactivate Dr. {selectedDoctor?.name}'s account. They will not be able to access the doctor panel until reactivated.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteDoctor} 
                disabled={isDeletingDoctor}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeletingDoctor ? 'Deactivating...' : 'Deactivate'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
};

export default DoctorManagement;