
import { useQuery } from '@tanstack/react-query';
import { db } from '@/firebase';
import { collection, query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore';

export interface AvailableSlot {
    id: string;
    datetime: Timestamp;
    isBooked: boolean;
}

export const useAvailableSlots = (options: { enabled: boolean }) => {
    const fetchAvailableSlots = async (): Promise<AvailableSlot[]> => {
        const slotsCollectionRef = collection(db, 'bookingSlots');
        // Fetch all future slots, we will filter for !isBooked on the client
        const q = query(
            slotsCollectionRef, 
            where('datetime', '>', Timestamp.now()), 
            orderBy('datetime', 'asc')
        );
        const querySnapshot = await getDocs(q);
        const allFutureSlots = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AvailableSlot));
        
        // Filter out booked slots on the client
        return allFutureSlots.filter(slot => !slot.isBooked);
    };

    return useQuery<AvailableSlot[]>({
        queryKey: ['availableSlots'],
        queryFn: fetchAvailableSlots,
        enabled: options.enabled,
    });
};
