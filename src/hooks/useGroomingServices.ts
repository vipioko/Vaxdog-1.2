import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db, storage } from '@/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { toast } from 'sonner';
import { GroomingService } from '@/data/mock';

const fetchGroomingServices = async (): Promise<GroomingService[]> => {
  const servicesCollection = collection(db, 'groomingServices');
  const q = query(servicesCollection, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as GroomingService));
};

export const useGroomingServices = () => {
  const queryClient = useQueryClient();

  const { data: services = [], isLoading, error } = useQuery({
    queryKey: ['groomingServices'],
    queryFn: fetchGroomingServices,
  });

  const addServiceMutation = useMutation({
    mutationFn: async ({ 
      serviceData, 
      imageFile, 
      galleryFiles 
    }: { 
      serviceData: Omit<GroomingService, 'id' | 'imageUrl' | 'galleryImages' | 'createdAt' | 'updatedAt'>, 
      imageFile?: File,
      galleryFiles?: File[]
    }) => {
      let imageUrl = '';
      let galleryImages: string[] = [];
      
      // Upload main image
      if (imageFile) {
        const imageRef = ref(storage, `groomingServices/${Date.now()}_${imageFile.name}`);
        await uploadBytes(imageRef, imageFile);
        imageUrl = await getDownloadURL(imageRef);
      }

      // Upload gallery images
      if (galleryFiles && galleryFiles.length > 0) {
        const uploadPromises = galleryFiles.map(async (file, index) => {
          const galleryRef = ref(storage, `groomingServices/gallery/${Date.now()}_${index}_${file.name}`);
          await uploadBytes(galleryRef, file);
          return getDownloadURL(galleryRef);
        });
        galleryImages = await Promise.all(uploadPromises);
      }

      return addDoc(collection(db, 'groomingServices'), {
        ...serviceData,
        imageUrl,
        galleryImages,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groomingServices'] });
      toast.success('Grooming service added successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add grooming service');
    },
  });

  const updateServiceMutation = useMutation({
    mutationFn: async ({ 
      serviceId, 
      serviceData, 
      imageFile, 
      galleryFiles 
    }: { 
      serviceId: string, 
      serviceData: Partial<GroomingService>, 
      imageFile?: File,
      galleryFiles?: File[]
    }) => {
      const updateData = { ...serviceData };
      
      // Upload new main image if provided
      if (imageFile) {
        const imageRef = ref(storage, `groomingServices/${Date.now()}_${imageFile.name}`);
        await uploadBytes(imageRef, imageFile);
        updateData.imageUrl = await getDownloadURL(imageRef);
      }

      // Upload new gallery images if provided
      if (galleryFiles && galleryFiles.length > 0) {
        const uploadPromises = galleryFiles.map(async (file, index) => {
          const galleryRef = ref(storage, `groomingServices/gallery/${Date.now()}_${index}_${file.name}`);
          await uploadBytes(galleryRef, file);
          return getDownloadURL(galleryRef);
        });
        const newGalleryImages = await Promise.all(uploadPromises);
        
        // Merge with existing images
        const existingImages = serviceData.galleryImages || [];
        updateData.galleryImages = [...existingImages, ...newGalleryImages];
      }

      updateData.updatedAt = serverTimestamp();

      const serviceRef = doc(db, 'groomingServices', serviceId);
      return updateDoc(serviceRef, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groomingServices'] });
      toast.success('Grooming service updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update grooming service');
    },
  });

  const deleteServiceMutation = useMutation({
    mutationFn: async (serviceId: string) => {
      const serviceRef = doc(db, 'groomingServices', serviceId);
      return updateDoc(serviceRef, { isActive: false, updatedAt: serverTimestamp() });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groomingServices'] });
      toast.success('Grooming service deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete grooming service');
    },
  });

  return {
    services: services.filter(service => service.isActive),
    allServices: services,
    isLoading,
    error,
    addService: addServiceMutation.mutateAsync,
    updateService: updateServiceMutation.mutateAsync,
    deleteService: deleteServiceMutation.mutateAsync,
    isAddingService: addServiceMutation.isPending,
    isUpdatingService: updateServiceMutation.isPending,
    isDeletingService: deleteServiceMutation.isPending,
  };
};