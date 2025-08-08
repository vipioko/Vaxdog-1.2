
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, addDoc, updateDoc, doc, serverTimestamp, query, orderBy, where, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';
import { useAuth } from '@/providers/AuthProvider';
import { toast } from 'sonner';
import { PetHostelBooking } from '@/data/mock';

// Fetch user-specific pet hostel bookings
const fetchUserPetHostelBookings = async (userId: string): Promise<PetHostelBooking[]> => {
  const bookingsRef = collection(db, 'users', userId, 'petHostelBookings');
  const q = query(bookingsRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PetHostelBooking));
};

// Fetch all pet hostel bookings (for admin)
const fetchAllPetHostelBookings = async (): Promise<PetHostelBooking[]> => {
  const allBookings: PetHostelBooking[] = [];
  const usersSnapshot = await getDocs(collection(db, 'users'));

  for (const userDoc of usersSnapshot.docs) {
    const userId = userDoc.id;
    const bookingsRef = collection(db, 'users', userId, 'petHostelBookings');
    const bookingsSnapshot = await getDocs(bookingsRef);
    bookingsSnapshot.docs.forEach(bookingDoc => {
      allBookings.push({ ...bookingDoc.data(), id: bookingDoc.id, userId } as PetHostelBooking);
    });
  }
  return allBookings.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
};

export const usePetHostelBookings = () => {
  const { user, isAdmin } = useAuth();
  const queryClient = useQueryClient();

  // User-specific query
  const { data: userPetHostelBookings = [], isLoading: isLoadingUserBookings } = useQuery<PetHostelBooking[]>({
    queryKey: ['userPetHostelBookings', user?.uid],
    queryFn: () => fetchUserPetHostelBookings(user!.uid),
    enabled: !!user && !isAdmin,
  });

  // Admin-specific query
  const { data: adminPetHostelBookings = [], isLoading: isLoadingAdminBookings } = useQuery<PetHostelBooking[]>({
    queryKey: ['adminPetHostelBookings'],
    queryFn: fetchAllPetHostelBookings,
    enabled: !!isAdmin,
  });

  const createPetHostelBookingMutation = useMutation({
    mutationFn: async (bookingData: Omit<PetHostelBooking, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
      if (!user) throw new Error('User not authenticated');
      
      const bookingsRef = collection(db, 'users', user.uid, 'petHostelBookings');
      const newBooking = {
        ...bookingData,
        userId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      const docRef = await addDoc(bookingsRef, newBooking);
      return { id: docRef.id, ...newBooking };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userPetHostelBookings', user?.uid] });
      queryClient.invalidateQueries({ queryKey: ['adminPetHostelBookings'] });
      toast.success('Pet hostel booking placed successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to place pet hostel booking');
    },
  });

  const updatePetHostelBookingStatusMutation = useMutation({
    mutationFn: async ({ userId, bookingId, status }: { userId: string; bookingId: string; status: PetHostelBooking['bookingStatus'] }) => {
      const bookingRef = doc(db, 'users', userId, 'petHostelBookings', bookingId);
      return updateDoc(bookingRef, {
        bookingStatus: status,
        updatedAt: serverTimestamp(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userPetHostelBookings'] });
      queryClient.invalidateQueries({ queryKey: ['adminPetHostelBookings'] });
      toast.success('Pet hostel booking status updated!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update pet hostel booking status');
    },
  });

  return {
    userPetHostelBookings,
    adminPetHostelBookings,
    isLoading: isLoadingUserBookings || isLoadingAdminBookings,
    createPetHostelBooking: createPetHostelBookingMutation.mutateAsync,
    isCreatingPetHostelBooking: createPetHostelBookingMutation.isPending,
    updatePetHostelBookingStatus: updatePetHostelBookingStatusMutation.mutateAsync,
    isUpdatingPetHostelBookingStatus: updatePetHostelBookingStatusMutation.isPending,
  };
};
