
import { useAuth } from '@/providers/AuthProvider';
import { useQuery } from '@tanstack/react-query';
import { db } from '@/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Dog } from '@/data/mock';

export const useDogs = () => {
    const { user } = useAuth();
    
    const { data: dogs = [], isLoading: isLoadingDogs, ...rest } = useQuery<Dog[]>({
        queryKey: ['dogs', user?.uid],
        queryFn: async () => {
            if (!user) return [];
            const dogsCollectionRef = collection(db, 'users', user.uid, 'dogs');
            const dogsSnapshot = await getDocs(dogsCollectionRef);
            return dogsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }) as Dog);
        },
        enabled: !!user,
    });
    
    return { dogs, isLoadingDogs, ...rest };
}
