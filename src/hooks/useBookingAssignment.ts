import { useMutation, useQueryClient } from '@tanstack/react-query';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase';
import { toast } from 'sonner';

export const useBookingAssignment = () => {
  const queryClient = useQueryClient();

  const assignDoctorMutation = useMutation({
    mutationFn: async ({ 
      userId, 
      transactionId, 
      doctorId 
    }: { 
      userId: string; 
      transactionId: string; 
      doctorId: string;
    }) => {
      const transactionRef = doc(db, 'users', userId, 'transactions', transactionId);
      return updateDoc(transactionRef, {
        assignedDoctorId: doctorId,
        assignedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allTransactions'] });
      queryClient.invalidateQueries({ queryKey: ['doctorBookings'] });
      toast.success('Doctor assigned successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to assign doctor');
    },
  });

  const unassignDoctorMutation = useMutation({
    mutationFn: async ({ 
      userId, 
      transactionId 
    }: { 
      userId: string; 
      transactionId: string;
    }) => {
      const transactionRef = doc(db, 'users', userId, 'transactions', transactionId);
      return updateDoc(transactionRef, {
        assignedDoctorId: null,
        assignedAt: null,
        updatedAt: serverTimestamp(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allTransactions'] });
      queryClient.invalidateQueries({ queryKey: ['doctorBookings'] });
      toast.success('Doctor unassigned successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to unassign doctor');
    },
  });

  return {
    assignDoctor: assignDoctorMutation.mutateAsync,
    unassignDoctor: unassignDoctorMutation.mutateAsync,
    isAssigning: assignDoctorMutation.isPending,
    isUnassigning: unassignDoctorMutation.isPending,
  };
};