import { useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/firebase';
import { doc, updateDoc, writeBatch } from 'firebase/firestore';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useAuth } from './AuthProvider'; // Correct path to AuthProvider

export const useDoctorActions = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth(); // Get current doctor's UID

  const markBookingAsCompleteMutation = useMutation({
    mutationFn: async ({ transactionId, petOwnerUserId, reminderId }: { transactionId: string; petOwnerUserId: string; reminderId: string }) => {
      if (!user || !user.uid) throw new Error("Doctor not authenticated.");

      const batch = writeBatch(db);

      // 1. Update the transaction status
      const transactionRef = doc(db, 'users', petOwnerUserId, 'transactions', transactionId);
      batch.update(transactionRef, {
        status: 'completed',
        updatedAt: new Date(), // Add an updatedAt timestamp
      });

      // 2. Mark the corresponding reminder as complete
      const reminderRef = doc(db, 'users', petOwnerUserId, 'reminders', reminderId);
      batch.update(reminderRef, {
        status: 'completed',
        completedDate: format(new Date(), 'MMMM d, yyyy'),
      });

      await batch.commit();
    },
    onSuccess: (_, { petOwnerUserId, reminderId }) => {
      toast.success('Booking marked as completed!');
      // Invalidate relevant queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['doctorBookings', user?.uid] }); // Doctor's own bookings
      queryClient.invalidateQueries({ queryKey: ['allTransactions'] }); // Admin panel
      queryClient.invalidateQueries({ queryKey: ['transactions', petOwnerUserId] }); // User's transactions
      queryClient.invalidateQueries({ queryKey: ['reminders', petOwnerUserId] }); // User's reminders
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
