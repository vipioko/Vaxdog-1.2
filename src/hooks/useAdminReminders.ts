
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { toast } from "sonner";
import { format } from 'date-fns';

export const useAdminReminders = () => {
    const queryClient = useQueryClient();

    const markBookingAsCompleteMutation = useMutation({
        mutationFn: async ({ userId, reminderId }: { userId: string; reminderId: string }) => {
            const reminderDocRef = doc(db, 'users', userId, 'reminders', reminderId);
            return updateDoc(reminderDocRef, {
                status: 'completed',
                completedDate: format(new Date(), 'MMMM d, yyyy')
            });
        },
        onSuccess: () => {
            // Invalidate all related queries
            queryClient.invalidateQueries({ queryKey: ['allTransactions'] });
            queryClient.invalidateQueries({ queryKey: ['reminders'] });
            toast.success('Home visit marked as completed!');
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to mark booking as complete.");
        }
    });

    const markBookingAsComplete = (userId: string, reminderId: string) => {
        markBookingAsCompleteMutation.mutate({ userId, reminderId });
    };

    return {
        markBookingAsComplete,
        isMarkingComplete: markBookingAsCompleteMutation.isPending,
    };
};
