import { useQuery } from '@tanstack/react-query';
import { collection, query, where, getDocs, Timestamp, collectionGroup } from 'firebase/firestore'; // Import collectionGroup
import { db } from '@/firebase';
import { useAuth } from '@/providers/AuthProvider';

export interface DoctorBooking {
  id: string;
  userId: string; // Added to get the pet owner's UID
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  petName?: string;
  service: string;
  amount?: number;
  status: 'confirmed' | 'completed' | 'cancelled'; // Status can now be completed
  scheduledDate?: Timestamp;
  assignedDoctorId: string;
  createdAt?: Timestamp;
  notes?: string;
  // Add petDetails directly from transaction if available
  petDetails?: {
    name: string;
    breed: string;
    petType: string;
    dateOfBirth: string;
    age: number;
  };
  reminderId?: string; // Added to link to the reminder
}

const fetchDoctorBookings = async (doctorId: string): Promise<DoctorBooking[]> => {
  const allBookings: DoctorBooking[] = [];
  
  try {
    // Use a collectionGroup query to get all transactions assigned to this doctor
    const transactionsQuery = query(
      collectionGroup(db, 'transactions'), // Query the 'transactions' collection group
      where('assignedDoctorId', '==', doctorId)
      // Removed where('status', '==', 'successful') to fetch all assigned transactions regardless of their status
    );
    const transactionsSnapshot = await getDocs(transactionsQuery);
    
    transactionsSnapshot.docs.forEach(transactionDoc => {
      const transactionData = transactionDoc.data();
      
      const booking: DoctorBooking = {
        id: transactionDoc.id,
        userId: transactionData.userId, // userId is now directly available from the transaction document
        customerName: transactionData.customer?.name || 'Unknown Customer',
        customerPhone: transactionData.customer?.phone || '',
        customerAddress: transactionData.customer ? 
          `${transactionData.customer.address}, ${transactionData.customer.city} - ${transactionData.customer.postalCode}` : 
          undefined,
        petName: transactionData.dogName,
        service: transactionData.service,
        amount: transactionData.amount,
        status: transactionData.status || 'confirmed', // Dynamically get status from transaction
        scheduledDate: transactionData.slotDatetime,
        assignedDoctorId: doctorId,
        createdAt: transactionData.createdAt,
        petDetails: transactionData.petDetails, // Directly use petDetails from transaction
        reminderId: transactionData.reminderId, // Get reminderId from transaction
      };
      
      allBookings.push(booking);
    });
    
    // Sort by scheduled date
    return allBookings.sort((a, b) => {
      if (!a.scheduledDate || !b.scheduledDate) return 0;
      return a.scheduledDate.toMillis() - b.scheduledDate.toMillis();
    });
    
  } catch (error) {
    console.error('Error fetching doctor bookings:', error);
    throw error; // Re-throw to be caught by react-query
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
