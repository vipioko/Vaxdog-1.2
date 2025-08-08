import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/firebase';
import { collection, query, orderBy, getDocs, addDoc, serverTimestamp, Timestamp, doc, deleteDoc, writeBatch } from 'firebase/firestore';
import { useAuth } from '@/providers/AuthProvider';
import { addMinutes, setHours, setMilliseconds, setMinutes, setSeconds } from 'date-fns';

export interface BookingSlot {
    id: string;
    datetime: Timestamp;
    isBooked: boolean;
    bookedBy?: string; // userId
    transactionId?: string;
}

export const useBookingSlots = () => {
    const queryClient = useQueryClient();
    const { isAdmin } = useAuth();

    const fetchSlots = async () => {
        if (!isAdmin) return [];
        const slotsCollectionRef = collection(db, 'bookingSlots');
        const q = query(slotsCollectionRef, orderBy('datetime', 'desc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BookingSlot));
    };

    const { data: slots, isLoading, error } = useQuery<BookingSlot[]>({
        queryKey: ['bookingSlots'],
        queryFn: fetchSlots,
        enabled: !!isAdmin,
    });

    const addSlotMutation = useMutation({
        mutationFn: (datetime: Date) => {
            return addDoc(collection(db, 'bookingSlots'), {
                datetime: Timestamp.fromDate(datetime),
                isBooked: false,
                createdAt: serverTimestamp(),
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bookingSlots'] });
        },
    });

    const addSlotsBatchMutation = useMutation({
        mutationFn: async ({ date, startTime, endTime, interval }: { date: Date, startTime: number, endTime: number, interval: number }) => {
            const batch = writeBatch(db);
            const slotsCollectionRef = collection(db, 'bookingSlots');
            
            let current = setHours(setMinutes(setSeconds(setMilliseconds(date, 0), 0), 0), startTime);
            const endOfDay = setHours(date, endTime);

            while (current < endOfDay) {
                const newSlotRef = doc(slotsCollectionRef);
                batch.set(newSlotRef, {
                    datetime: Timestamp.fromDate(current),
                    isBooked: false,
                    createdAt: serverTimestamp(),
                });
                current = addMinutes(current, interval);
            }

            return batch.commit();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bookingSlots'] });
        },
    });

    const deleteSlotMutation = useMutation({
        mutationFn: (slotId: string) => {
            return deleteDoc(doc(db, 'bookingSlots', slotId));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bookingSlots'] });
        },
    });

    return { 
        slots, 
        isLoading,
        error,
        addSlot: addSlotMutation.mutateAsync,
        addSlotsBatch: addSlotsBatchMutation.mutateAsync,
        deleteSlot: deleteSlotMutation.mutateAsync,
    };
};
