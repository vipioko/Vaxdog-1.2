
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, addDoc, updateDoc, doc, serverTimestamp, query, orderBy, where, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';
import { useAuth } from '@/providers/AuthProvider';
import { toast } from 'sonner';
import { GroomingBooking } from '@/data/mock';

// Fetch user-specific grooming bookings
const fetchUserGroomingBookings = async (userId: string): Promise<GroomingBooking[]> => {
  const bookingsRef = collection(db, 'users', userId, 'groomingBookings');
  const q = query(bookingsRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GroomingBooking));
};

// Fetch all grooming bookings (for admin)
const fetchAllGroomingBookings = async (): Promise<GroomingBooking[]> => {
  const allBookings: GroomingBooking[] = [];
  const usersSnapshot = await getDocs(collection(db, 'users'));

  for (const userDoc of usersSnapshot.docs) {
    const userId = userDoc.id;
    const bookingsRef = collection(db, 'users', userId, 'groomingBookings');
    const bookingsSnapshot = await getDocs(bookingsRef);
    bookingsSnapshot.docs.forEach(bookingDoc => {
      allBookings.push({ ...bookingDoc.data(), id: bookingDoc.id, userId } as GroomingBooking);
    });
  }
  return allBookings.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
};

export const useGroomingBookings = () => {
  const { user, isAdmin } = useAuth();
  const queryClient = useQueryClient();

  // User-specific query
  const { data: userGroomingBookings = [], isLoading: isLoadingUserBookings } = useQuery<GroomingBooking[]>({
    queryKey: ['userGroomingBookings', user?.uid],
    queryFn: () => fetchUserGroomingBookings(user!.uid),
    enabled: !!user && !isAdmin,
  });

  // Admin-specific query
  const { data: adminGroomingBookings = [], isLoading: isLoadingAdminBookings } = useQuery<GroomingBooking[]>({
    queryKey: ['adminGroomingBookings'],
    queryFn: fetchAllGroomingBookings,
    enabled: !!isAdmin,
  });

  const createGroomingBookingMutation = useMutation({
    mutationFn: async (bookingData: Omit<GroomingBooking, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
      if (!user) throw new Error('User not authenticated');
      
      const bookingsRef = collection(db, 'users', user.uid, 'groomingBookings');
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
      queryClient.invalidateQueries({ queryKey: ['userGroomingBookings', user?.uid] });
      queryClient.invalidateQueries({ queryKey: ['adminGroomingBookings'] });
      toast.success('Grooming booking placed successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to place grooming booking');
    },
  });

  const updateGroomingBookingStatusMutation = useMutation({
    mutationFn: async ({ userId, bookingId, status }: { userId: string; bookingId: string; status: GroomingBooking['bookingStatus'] }) => {
      const bookingRef = doc(db, 'users', userId, 'groomingBookings', bookingId);
      return updateDoc(bookingRef, {
        bookingStatus: status,
        updatedAt: serverTimestamp(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userGroomingBookings'] });
      queryClient.invalidateQueries({ queryKey: ['adminGroomingBookings'] });
      toast.success('Grooming booking status updated!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update grooming booking status');
    },
  });

  return {
    userGroomingBookings,
    adminGroomingBookings,
    isLoading: isLoadingUserBookings || isLoadingAdminBookings,
    createGroomingBooking: createGroomingBookingMutation.mutateAsync,
    isCreatingGroomingBooking: createGroomingBookingMutation.isPending,
    updateGroomingBookingStatus: updateGroomingBookingStatusMutation.mutateAsync,
    isUpdatingGroomingBookingStatus: updateGroomingBookingStatusMutation.isPending,
  };
};
