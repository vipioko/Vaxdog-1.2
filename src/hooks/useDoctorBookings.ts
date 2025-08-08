import { useQuery } from '@tanstack/react-query';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/firebase';
import { useAuth } from '@/providers/AuthProvider';

export interface DoctorBooking {
  id: string;
  userId: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  petName?: string;
  service: string;
  amount?: number;
  status: 'confirmed' | 'completed' | 'cancelled';
  scheduledDate?: Timestamp;
  assignedDoctorId: string;
  createdAt?: Timestamp;
  notes?: string;
}

const fetchDoctorBookings = async (doctorId: string): Promise<DoctorBooking[]> => {
  // Query all users' transactions to find bookings assigned to this doctor
  const allBookings: DoctorBooking[] = [];
  
  try {
    // Get all users
    const usersSnapshot = await getDocs(collection(db, 'users'));
    
    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      
      // Get transactions for this user
      const transactionsRef = collection(db, 'users', userId, 'transactions');
      const transactionsQuery = query(
        transactionsRef,
        where('assignedDoctorId', '==', doctorId),
        where('status', '==', 'successful')
      );
      const transactionsSnapshot = await getDocs(transactionsQuery);
      
      // Get user's dogs for pet details
      const dogsRef = collection(db, 'users', userId, 'dogs');
      const dogsSnapshot = await getDocs(dogsRef);
      const userDogs = dogsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      transactionsSnapshot.docs.forEach(transactionDoc => {
        const transactionData = transactionDoc.data();
        
        // Find matching pet details
        const matchingDog = userDogs.find(dog => dog.name === transactionData.dogName);
        
        const booking: DoctorBooking = {
          id: transactionDoc.id,
          userId,
          customerName: transactionData.customer?.name || 'Unknown Customer',
          customerPhone: transactionData.customer?.phone || '',
          customerAddress: transactionData.customer ? 
            `${transactionData.customer.address}, ${transactionData.customer.city} - ${transactionData.customer.postalCode}` : 
            undefined,
          petName: transactionData.dogName,
          service: transactionData.service,
          amount: transactionData.amount,
          status: 'confirmed',
          scheduledDate: transactionData.slotDatetime,
          assignedDoctorId: doctorId,
          createdAt: transactionData.createdAt,
        };
        
        allBookings.push(booking);
      });
    }
    
    // Sort by scheduled date
    return allBookings.sort((a, b) => {
      if (!a.scheduledDate || !b.scheduledDate) return 0;
      return a.scheduledDate.toMillis() - b.scheduledDate.toMillis();
    });
    
  } catch (error) {
    console.error('Error fetching doctor bookings:', error);
    return [];
  }
};

export const useDoctorBookings = () => {
  const { user, isDoctor } = useAuth();

  const { data: bookings = [], isLoading, error } = useQuery({
    queryKey: ['doctorBookings', user?.uid],
    queryFn: () => fetchDoctorBookings(user!.uid),
    enabled: !!user && isDoctor,
  });

  return {
    bookings,
    isLoading,
    error,
  };
};