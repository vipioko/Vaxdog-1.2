import { useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/firebase';
import { doc, writeBatch } from 'firebase/firestore';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useAuth } from '@/providers/AuthProvider';

export const useDoctorActions = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const markBookingAsCompleteMutation = useMutation({
    mutationFn: async ({ transactionId, petOwnerUserId, reminderId }: { transactionId: string; petOwnerUserId: string; reminderId: string }) => {
      if (!user || !user.uid) throw new Error("Doctor not authenticated.");

      const batch = writeBatch(db);

      // 1. Update the transaction status
      const transactionRef = doc(db, 'users', petOwnerUserId, 'transactions', transactionId);
      batch.update(transactionRef, {
        status: 'completed',
        updatedAt: new Date(),
      });

      // 2. Mark the corresponding reminder as complete
      const reminderRef = doc(db, 'users', petOwnerUserId, 'reminders', reminderId);
      batch.update(reminderRef, {
        status: 'completed',
        completedDate: format(new Date(), 'MMMM d, yyyy'),
      });

      await batch.commit();
    },
    onSuccess: (_, { petOwnerUserId }) => {
      toast.success('Booking marked as completed!');
      // Invalidate relevant queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['doctorBookings', user?.uid] });
      queryClient.invalidateQueries({ queryKey: ['allTransactions'] });
      queryClient.invalidateQueries({ queryKey: ['transactions', petOwnerUserId] });
      queryClient.invalidateQueries({ queryKey: ['reminders', petOwnerUserId] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to mark booking as complete.');
    },
  });

  return {
    markBookingAsComplete: markBookingAsCompleteMutation.mutate,
    isMarkingComplete: markBookingAsCompleteMutation.isPending,
  };
};