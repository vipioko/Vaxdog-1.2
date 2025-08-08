import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '@/firebase';
import { useAuth } from '@/providers/AuthProvider';
import { toast } from 'sonner';

export interface DoctorService {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration: number; // in minutes
  category: string;
  isActive: boolean;
  createdAt?: Timestamp;
}

const fetchDoctorServices = async (doctorId: string): Promise<DoctorService[]> => {
  const servicesCollection = collection(db, 'doctors', doctorId, 'services');
  const snapshot = await getDocs(servicesCollection);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as DoctorService));
};

export const useDoctorServices = () => {
  const { user, isDoctor } = useAuth();
  const queryClient = useQueryClient();

  const { data: services = [], isLoading, error } = useQuery({
    queryKey: ['doctorServices', user?.uid],
    queryFn: () => fetchDoctorServices(user!.uid),
    enabled: !!user && isDoctor,
  });

  const addServiceMutation = useMutation({
    mutationFn: async (serviceData: Omit<DoctorService, 'id' | 'createdAt'>) => {
      if (!user) throw new Error('User not authenticated');
      
      return addDoc(collection(db, 'doctors', user.uid, 'services'), {
        ...serviceData,
        createdAt: serverTimestamp(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctorServices', user?.uid] });
      toast.success('Service added successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add service');
    },
  });

  const updateServiceMutation = useMutation({
    mutationFn: async ({ serviceId, serviceData }: { serviceId: string, serviceData: Partial<DoctorService> }) => {
      if (!user) throw new Error('User not authenticated');
      
      const serviceRef = doc(db, 'doctors', user.uid, 'services', serviceId);
      return updateDoc(serviceRef, {
        ...serviceData,
        updatedAt: serverTimestamp(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctorServices', user?.uid] });
      toast.success('Service updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update service');
    },
  });

  const deleteServiceMutation = useMutation({
    mutationFn: async (serviceId: string) => {
      if (!user) throw new Error('User not authenticated');
      
      const serviceRef = doc(db, 'doctors', user.uid, 'services', serviceId);
      return deleteDoc(serviceRef);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctorServices', user?.uid] });
      toast.success('Service deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete service');
    },
  });

  return {
    services,
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