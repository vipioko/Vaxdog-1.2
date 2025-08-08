import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase';
import { useAuth } from '@/providers/AuthProvider';
import { toast } from 'sonner';

export interface DoctorProfile {
  uid: string;
  name?: string;
  email?: string;
  phoneNumber?: string;
  specialization?: string;
  experience?: string;
  qualification?: string;
  clinicName?: string;
  clinicAddress?: string;
  bio?: string;
  consultationFee?: number;
  profileImage?: string;
  isActive?: boolean;
  createdAt?: any;
  updatedAt?: any;
}

const fetchDoctorProfile = async (doctorId: string): Promise<DoctorProfile | null> => {
  const doctorRef = doc(db, 'doctors', doctorId);
  const doctorDoc = await getDoc(doctorRef);
  
  if (doctorDoc.exists()) {
    return { uid: doctorDoc.id, ...doctorDoc.data() } as DoctorProfile;
  }
  
  return null;
};

export const useDoctorProfile = () => {
  const { user, isDoctor } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['doctorProfile', user?.uid],
    queryFn: () => fetchDoctorProfile(user!.uid),
    enabled: !!user && isDoctor,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: Partial<DoctorProfile>) => {
      if (!user) throw new Error('User not authenticated');
      
      const doctorRef = doc(db, 'doctors', user.uid);
      return updateDoc(doctorRef, {
        ...profileData,
        updatedAt: serverTimestamp(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctorProfile', user?.uid] });
      toast.success('Profile updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update profile');
    },
  });

  return {
    profile,
    isLoading,
    error,
    updateProfile: updateProfileMutation.mutateAsync,
    isUpdating: updateProfileMutation.isPending,
  };
};