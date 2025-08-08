import React, { useState } from 'react';
import { usePetHostelServices, PetHostelService } from '@/hooks/usePetHostelServices';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, MoreHorizontal, Edit, Trash2, Image as ImageIcon, Home, IndianRupee, Users } from 'lucide-react';
import { toast } from 'sonner';

import { useIsMobile } from '@/hooks/use-mobile';
const PetHostelManagement = () => {
  const { services, isLoading, addService, updateService, deleteService, isAddingService, isUpdatingService, isDeletingService } = usePetHostelServices();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<PetHostelService | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    dailyRate: 0,
    capacity: 10,
    amenities: [] as string[],
    isActive: true
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [amenityInput, setAmenityInput] = useState('');

  const isMobile = useIsMobile();

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      dailyRate: 0,
      capacity: 10,
      amenities: [],
      isActive: true
    });
    setImageFile(null);
    setGalleryFiles([]);
    setImagePreview('');
    setGalleryPreviews([]);
    setAmenityInput('');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setGalleryFiles(files);
    setGalleryPreviews(files.map(file => URL.createObjectURL(file)));
  };

  const addAmenity = () => {
    if (amenityInput.trim() && !formData.amenities.includes(amenityInput.trim())) {
      setFormData({ ...formData, amenities: [...formData.amenities, amenityInput.trim()] });
      setAmenityInput('');
    }
  };

  const removeAmenity = (amenity: string) => {
    setFormData({ ...formData, amenities: formData.amenities.filter(a => a !== amenity) });
  };

  const handleAddService = async () => {
    if (!formData.name.trim() || formData.dailyRate <= 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await addService({ 
        serviceData: formData, 
        imageFile: imageFile || undefined,
        galleryFiles: galleryFiles.length > 0 ? galleryFiles : undefined
      });
      setIsAddDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error adding pet hostel service:', error);
    }
  };

  const handleEditService = async () => {
    if (!selectedService || !formData.name.trim() || formData.dailyRate <= 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await updateService({ 
        serviceId: selectedService.id, 
        serviceData: formData, 
        imageFile: imageFile || undefined,
        galleryFiles: galleryFiles.length > 0 ? galleryFiles : undefined
      });
      setIsEditDialogOpen(false);
      setSelectedService(null);
      resetForm();
    } catch (error) {
      console.error('Error updating pet hostel service:', error);
    }
  };

  const handleDeleteService = async () => {
    if (!selectedService) return;

    try {
      await deleteService(selectedService.id);
      setIsDeleteDialogOpen(false);
      setSelectedService(null);
    } catch (error) {
      console.error('Error deleting pet hostel service:', error);
    }
  };

  const openEditDialog = (service: PetHostelService) => {
    setSelectedService(service);
    setFormData({
      name: service.name,
      description: service.description,
      dailyRate: service.dailyRate,
      capacity: service.capacity,
      amenities: service.amenities || [],
      isActive: service.isActive
    });
    setImagePreview(service.imageUrl || '');
    setGalleryPreviews(service.galleryImages || []);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (service: PetHostelService) => {
    setSelectedService(service);
    setIsDeleteDialogOpen(true);
  };

  if (isLoading) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Pet Hostel Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full bg-slate-700" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const ServiceForm = ({ isEdit = false }: { isEdit?: boolean }) => (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto">
      <div>
        <Label htmlFor="name">Service Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Premium Pet Boarding"
          className="bg-slate-700 border-slate-600 text-white"
        />
      </div>
      
      <div>
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Service description..."
          rows={3}
          className="bg-slate-700 border-slate-600 text-white"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="dailyRate">Daily Rate (₹) *</Label>
          <Input
            id="dailyRate"
            type="number"
            value={formData.dailyRate}
            onChange={(e) => setFormData({ ...formData, dailyRate: Number(e.target.value) })}
            placeholder="0.00"
            min="0"
            step="0.01"
            className="bg-slate-700 border-slate-600 text-white"
          />
        </div>
        
        <div>
          <Label htmlFor="capacity">Capacity (pets)</Label>
          <Input
            id="capacity"
            type="number"
            value={formData.capacity}
            onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
            placeholder="10"
            min="1"
            className="bg-slate-700 border-slate-600 text-white"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="amenities">Amenities</Label>
        <div className="flex gap-2 mb-2">
          <Input
            id="amenities"
            value={amenityInput}
            onChange={(e) => setAmenityInput(e.target.value)}
            placeholder="e.g., Air Conditioning"
            className="bg-slate-700 border-slate-600 text-white"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenity())}
          />
          <Button type="button" onClick={addAmenity} size="sm" className="bg-purple-500 hover:bg-purple-600">
            Add
          </Button>
        </div>
        {formData.amenities.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.amenities.map((amenity, index) => (
              <Badge key={index} variant="secondary" className="bg-slate-600 text-white">
                {amenity}
                <button
                  type="button"
                  onClick={() => removeAmenity(amenity)}
                  className="ml-2 text-red-400 hover:text-red-300"
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div>
        <Label htmlFor="image">Service Image</Label>
        <Input
          id="image"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="bg-slate-700 border-slate-600 text-white"
        />
        {imagePreview && (
          <div className="mt-2">
            <img src={imagePreview} alt="Preview" className="w-20 h-20 object-cover rounded" />
          </div>
        )}
      </div>

      <div>
        <Label htmlFor="gallery">Gallery Images (Multiple)</Label>
        <Input
          id="gallery"
          type="file"
          accept="image/*"
          multiple
          onChange={handleGalleryChange}
          className="bg-slate-700 border-slate-600 text-white"
        />
        {galleryPreviews.length > 0 && (
          <div className="mt-2 flex gap-2 flex-wrap">
            {galleryPreviews.map((preview, index) => (
              <img key={index} src={preview} alt={`Gallery ${index + 1}`} className="w-16 h-16 object-cover rounded" />
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="isActive"
          checked={formData.isActive}
          onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
        />
        <Label htmlFor="isActive" className="text-white">Active Service</Label>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <DialogClose asChild>
          <Button variant="outline" className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600">
            Cancel
          </Button>
        </DialogClose>
        <Button 
          onClick={isEdit ? handleEditService : handleAddService} 
          disabled={isEdit ? isUpdatingService : isAddingService}
          className="bg-purple-500 hover:bg-purple-600"
        >
          {isEdit 
            ? (isUpdatingService ? 'Updating...' : 'Update Service')
            : (isAddingService ? 'Adding...' : 'Add Service')
          }
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center text-white">
            <Home className="h-5 w-5 mr-2 text-blue-400" />
            Pet Hostel Management
          </CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="bg-blue-500 hover:bg-blue-600">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Service
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-slate-800 border-slate-700">
              <DialogHeader>
                <DialogTitle className="text-white">Add New Pet Hostel Service</DialogTitle>
              </DialogHeader>
              <ServiceForm />
            </DialogContent>
          </Dialog>
        </CardHeader>
        
        <CardContent>
          {services.length === 0 ? (
            <div className="text-center py-12">
              <Home className="h-16 w-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No pet hostel services yet</h3>
              <p className="text-slate-400 text-sm mb-4">Add your first pet hostel service to get started</p>
              <Button onClick={() => setIsAddDialogOpen(true)} className="bg-blue-500 hover:bg-blue-600">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Service
              </Button>
            </div>
          ) : isMobile ? (
            <div className="space-y-4">
              {services.map((service) => (
                <Card key={service.id} className="bg-slate-700/30 border-slate-600">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {service.imageUrl ? (
                        <img src={service.imageUrl} alt={service.name} className="w-20 h-20 object-cover rounded-lg flex-shrink-0" />
                      ) : (
                        <div className="w-20 h-20 bg-slate-600 rounded-lg flex-shrink-0 flex items-center justify-center">
                          <ImageIcon className="h-10 w-10 text-slate-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-white text-lg truncate">{service.name}</h4>
                        <p className="text-sm text-slate-400 line-clamp-2">{service.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center text-white text-sm">
                            <IndianRupee className="h-4 w-4 mr-1" />{service.dailyRate.toFixed(2)}/day
                          </div>
                          <div className="flex items-center text-slate-400 text-sm">
                            <Users className="h-4 w-4 mr-1" />Capacity: {service.capacity}
                          </div>
                        </div>
                        {service.amenities && service.amenities.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {service.amenities.slice(0, 2).map((amenity, idx) => (
                              <Badge key={idx} variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                                {amenity}
                              </Badge>
                            ))}
                            {service.amenities.length > 2 && (
                              <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                                +{service.amenities.length - 2} more
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-white">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                          <DropdownMenuItem onClick={() => openEditDialog(service)} className="text-white hover:bg-slate-700">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-400 hover:bg-red-500/10"
                            onClick={() => openDeleteDialog(service)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="mt-3 flex justify-end">
                      <Badge variant={service.isActive ? 'default' : 'secondary'} className={service.isActive ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}>
                        {service.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700">
                  <TableHead className="text-slate-300">Image</TableHead>
                  <TableHead className="text-slate-300">Service</TableHead>
                  <TableHead className="text-slate-300">Daily Rate</TableHead>
                  <TableHead className="text-slate-300">Capacity</TableHead>
                  <TableHead className="text-slate-300">Status</TableHead>
                  <TableHead className="text-right text-slate-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map((service) => (
                  <TableRow key={service.id} className="border-slate-700">
                    <TableCell>
                      {service.imageUrl ? (
                        <img src={service.imageUrl} alt={service.name} className="w-12 h-12 object-cover rounded" />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                          <ImageIcon className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-white">{service.name}</div>
                        <div className="text-sm text-slate-400 line-clamp-1">{service.description}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-white">
                        <IndianRupee className="h-4 w-4 mr-1" />
                        {service.dailyRate.toFixed(2)}/day
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-white">
                        <Users className="h-4 w-4 mr-1" />
                        {service.capacity} pets
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={service.isActive ? 'default' : 'secondary'}>
                        {service.isActive ? 'Active' : 'Inactive'}
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
                          <DropdownMenuItem onClick={() => openEditDialog(service)} className="text-white hover:bg-slate-700">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-400 hover:bg-red-500/10"
                            onClick={() => openDeleteDialog(service)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Pet Hostel Service</DialogTitle>
          </DialogHeader>
          <ServiceForm isEdit />
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-slate-800 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              This action cannot be undone. This will permanently delete the pet hostel service "{selectedService?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteService} 
              disabled={isDeletingService}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeletingService ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default PetHostelManagement;