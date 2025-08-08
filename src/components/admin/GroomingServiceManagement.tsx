import React, { useState } from 'react';
import { useGroomingServices, GroomingService } from '@/hooks/useGroomingServices';
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
import { PlusCircle, MoreHorizontal, Edit, Trash2, Image as ImageIcon, Scissors, IndianRupee, Clock } from 'lucide-react';
import { toast } from 'sonner';

const GroomingServiceManagement = () => {
  const { services, isLoading, addService, updateService, deleteService, isAddingService, isUpdatingService, isDeletingService } = useGroomingServices();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<GroomingService | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    duration: 60,
    isActive: true
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      duration: 60,
      isActive: true
    });
    setImageFile(null);
    setGalleryFiles([]);
    setImagePreview('');
    setGalleryPreviews([]);
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

  const handleAddService = async () => {
    if (!formData.name.trim() || formData.price <= 0) {
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
      console.error('Error adding grooming service:', error);
    }
  };

  const handleEditService = async () => {
    if (!selectedService || !formData.name.trim() || formData.price <= 0) {
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
      console.error('Error updating grooming service:', error);
    }
  };

  const handleDeleteService = async () => {
    if (!selectedService) return;

    try {
      await deleteService(selectedService.id);
      setIsDeleteDialogOpen(false);
      setSelectedService(null);
    } catch (error) {
      console.error('Error deleting grooming service:', error);
    }
  };

  const openEditDialog = (service: GroomingService) => {
    setSelectedService(service);
    setFormData({
      name: service.name,
      description: service.description,
      price: service.price,
      duration: service.duration,
      isActive: service.isActive
    });
    setImagePreview(service.imageUrl || '');
    setGalleryPreviews(service.galleryImages || []);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (service: GroomingService) => {
    setSelectedService(service);
    setIsDeleteDialogOpen(true);
  };

  if (isLoading) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Grooming Service Management</CardTitle>
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
          placeholder="e.g., Full Body Grooming"
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
          <Label htmlFor="price">Price (₹) *</Label>
          <Input
            id="price"
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
            placeholder="0.00"
            min="0"
            step="0.01"
            className="bg-slate-700 border-slate-600 text-white"
          />
        </div>
        
        <div>
          <Label htmlFor="duration">Duration (minutes)</Label>
          <Input
            id="duration"
            type="number"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
            placeholder="60"
            min="15"
            step="15"
            className="bg-slate-700 border-slate-600 text-white"
          />
        </div>
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
            <Scissors className="h-5 w-5 mr-2 text-purple-400" />
            Grooming Service Management
          </CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="bg-purple-500 hover:bg-purple-600">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Service
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-slate-800 border-slate-700">
              <DialogHeader>
                <DialogTitle className="text-white">Add New Grooming Service</DialogTitle>
              </DialogHeader>
              <ServiceForm />
            </DialogContent>
          </Dialog>
        </CardHeader>
        
        <CardContent>
          {services.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700">
                  <TableHead className="text-slate-300">Image</TableHead>
                  <TableHead className="text-slate-300">Service</TableHead>
                  <TableHead className="text-slate-300">Price</TableHead>
                  <TableHead className="text-slate-300">Duration</TableHead>
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
                        {service.price.toFixed(2)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-white">
                        <Clock className="h-4 w-4 mr-1" />
                        {service.duration} min
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
          ) : (
            <div className="text-center py-12">
              <Scissors className="h-16 w-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No grooming services yet</h3>
              <p className="text-slate-400 text-sm mb-4">Add your first grooming service to get started</p>
              <Button onClick={() => setIsAddDialogOpen(true)} className="bg-purple-500 hover:bg-purple-600">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Service
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Grooming Service</DialogTitle>
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
              This action cannot be undone. This will permanently delete the grooming service "{selectedService?.name}".
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

export default GroomingServiceManagement;