
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/providers/AuthProvider';
import { db } from '@/firebase';
import { collection, query, orderBy, getDocs, Timestamp } from 'firebase/firestore';

export interface Transaction {
    id: string;
    amount: number;
    currency: string;
    service: string;
    status: string;
    createdAt: Timestamp;
    paymentId: string;
    reminderId?: string;
    slotId?: string;
    slotDatetime?: Timestamp;
}

export const useTransactions = () => {
    const { user } = useAuth();

    const fetchTransactions = async (): Promise<Transaction[]> => {
        if (!user) return [];
        const transactionsCollectionRef = collection(db, 'users', user.uid, 'transactions');
        const q = query(transactionsCollectionRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
    };

    const { data: transactions, isLoading, error } = useQuery<Transaction[]>({
        queryKey: ['transactions', user?.uid],
        queryFn: fetchTransactions,
        enabled: !!user,
    });

    return { transactions, isLoading, error };
};

