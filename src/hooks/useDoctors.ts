import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, getDocs, updateDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '@/firebase';
import { useAuth } from '@/providers/AuthProvider';
import { toast } from 'sonner';
import { DoctorProfile } from './useDoctorProfile';

const fetchAllDoctors = async (): Promise<DoctorProfile[]> => {
  const doctorsCollection = collection(db, 'doctors');
  const q = query(doctorsCollection, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    uid: doc.id,
    ...doc.data()
  } as DoctorProfile));
};

export const useDoctors = () => {
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();

  const { data: doctors = [], isLoading, error } = useQuery({
    queryKey: ['allDoctors'],
    queryFn: fetchAllDoctors,
    enabled: !!isAdmin,
  });

  const updateDoctorStatusMutation = useMutation({
    mutationFn: async ({ doctorId, isActive }: { doctorId: string, isActive: boolean }) => {
      const doctorRef = doc(db, 'doctors', doctorId);
      return updateDoc(doctorRef, { 
        isActive,
        updatedAt: new Date()
      });
    },
    onSuccess: (_, { isActive }) => {
      queryClient.invalidateQueries({ queryKey: ['allDoctors'] });
      toast.success(`Doctor ${isActive ? 'activated' : 'deactivated'} successfully!`);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update doctor status');
    },
  });

  const updateDoctorStatus = (doctorId: string, isActive: boolean) => {
    updateDoctorStatusMutation.mutate({ doctorId, isActive });
  };

  return {
    doctors,
    isLoading,
    error,
    updateDoctorStatus,
    isDeletingDoctor: updateDoctorStatusMutation.isPending,
  };
};