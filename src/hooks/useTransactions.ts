// src/hooks/useTransactions.ts
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/providers/AuthProvider';
import { db } from '@/firebase';
import { collection, query, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import { GroomingBooking, PetHostelBooking } from '@/data/mock'; // Import necessary types

// Updated Transaction interface to be more generic
export interface Transaction {
    id: string;
    type: 'vaccination' | 'grooming' | 'petHostel'; // New field to distinguish booking types
    service: string;
    amount: number;
    status: string; // e.g., 'successful', 'failed', 'pending', 'confirmed', 'completed', 'cancelled'
    createdAt: Timestamp;
    paymentId?: string;
    // Fields specific to vaccination bookings (now optional)
    reminderId?: string;
    slotId?: string;
    slotDatetime?: Timestamp;
    vaccines?: Array<{ name: string; price: number }>;
    // Fields specific to grooming/pet hostel (now optional, mapped from original booking data)
    petName?: string;
    petDetails?: {
      name: string;
      breed: string;
      petType: string;
      dateOfBirth?: string;
      age?: number;
      aggressionLevel?: 'Low' | 'Medium' | 'High';
      weight?: number; // in kg
      sex?: 'Male' | 'Female';
    };
    customer?: {
      name: string;
      phone: string;
      address?: string;
      city?: string;
      postalCode?: string;
    };
    preferredDate?: string; // For grooming
    preferredTime?: string; // For grooming
    startDate?: string; // For pet hostel
    endDate?: string; // For pet hostel
    foodPreference?: 'veg' | 'non-veg' | 'both'; // For pet hostel
}

export const useTransactions = () => {
    const { user } = useAuth();

    const fetchTransactions = async (): Promise<Transaction[]> => {
        if (!user) return [];

        const userId = user.uid;
        const allBookings: Transaction[] = [];

        // 1. Fetch Vaccination Bookings (from 'transactions' subcollection)
        const vaccinationBookingsRef = collection(db, 'users', userId, 'transactions');
        const qVaccination = query(vaccinationBookingsRef, orderBy('createdAt', 'desc'));
        const vaccinationSnapshot = await getDocs(qVaccination);
        vaccinationSnapshot.docs.forEach(doc => {
            const data = doc.data();
            allBookings.push({
                id: doc.id,
                type: 'vaccination',
                service: data.service,
                amount: data.amount,
                status: data.status,
                createdAt: data.createdAt,
                paymentId: data.paymentId,
                reminderId: data.reminderId,
                slotId: data.slotId,
                slotDatetime: data.slotDatetime,
                vaccines: data.vaccines,
                petName: data.dogName, // Map dogName to petName for consistency
                customer: data.customer,
            });
        });

        // 2. Fetch Grooming Bookings (from 'groomingBookings' subcollection)
        const groomingBookingsRef = collection(db, 'users', userId, 'groomingBookings');
        const qGrooming = query(groomingBookingsRef, orderBy('createdAt', 'desc'));
        const groomingSnapshot = await getDocs(qGrooming);
        groomingSnapshot.docs.forEach(doc => {
            const data = doc.data() as GroomingBooking;
            allBookings.push({
                id: doc.id,
                type: 'grooming',
                service: data.serviceName,
                amount: data.amount,
                status: data.bookingStatus, // Map bookingStatus to status
                createdAt: data.createdAt,
                paymentId: data.razorpayPaymentId,
                petName: data.petName,
                petDetails: data.petDetails,
                customer: data.customerDetails,
                preferredDate: data.preferredDate,
                preferredTime: data.preferredTime,
            });
        });

        // 3. Fetch Pet Hostel Bookings (from 'petHostelBookings' subcollection)
        const petHostelBookingsRef = collection(db, 'users', userId, 'petHostelBookings');
        const qPetHostel = query(petHostelBookingsRef, orderBy('createdAt', 'desc'));
        const petHostelSnapshot = await getDocs(qPetHostel);
        petHostelSnapshot.docs.forEach(doc => {
            const data = doc.data() as PetHostelBooking;
            allBookings.push({
                id: doc.id,
                type: 'petHostel',
                service: data.serviceName,
                amount: data.amount,
                status: data.bookingStatus, // Map bookingStatus to status
                createdAt: data.createdAt,
                paymentId: data.razorpayPaymentId,
                petName: data.petName,
                petDetails: data.petDetails,
                customer: data.customerDetails,
                startDate: data.startDate,
                endDate: data.endDate,
                foodPreference: data.foodPreference,
            });
        });

        // Sort all bookings by createdAt in descending order
        return allBookings.sort((a, b) => {
            if (!a.createdAt || !b.createdAt) return 0;
            return b.createdAt.toMillis() - a.createdAt.toMillis();
        });
    };

    const { data: transactions, isLoading, error } = useQuery<Transaction[]>({
        queryKey: ['transactions', user?.uid],
        queryFn: fetchTransactions,
        enabled: !!user,
    });

    return { transactions, isLoading, error };
};

