
import { useQuery } from '@tanstack/react-query';
import { db } from '@/firebase';
import { collection, getDocs, query, orderBy, doc, getDoc } from 'firebase/firestore';
import { Timestamp } from 'firebase/firestore';
import { Dog } from '@/data/mock';

export interface AdminTransaction {
  id: string;
  userId: string;
  paymentId: string;
  amount: number;
  currency: string;
  service: string;
  dogName?: string;
  petDetails?: {
    name: string;
    breed: string;
    petType: string;
    dateOfBirth: string;
    age: number;
  };
  vaccines?: Array<{ name: string; price: number }>;
  status: string;
  createdAt: Timestamp;
  customer?: {
    name: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
  };
  reminderId?: string;
  slotId?: string;
  slotDatetime?: Timestamp;
  assignedDoctorId?: string;
  assignedAt?: Timestamp;
}

export const useAllTransactions = () => {
  const result = useQuery<AdminTransaction[]>({
    queryKey: ['allTransactions'],
    queryFn: async () => {
      console.log('=== STARTING FETCH ALL TRANSACTIONS ===');
      console.log('Database reference:', db);
      
      const allTransactions: AdminTransaction[] = [];
      
      try {
        // First, let's check if the users collection exists and is accessible
        console.log('Checking users collection accessibility...');
        const usersCollectionRef = collection(db, 'users');
        console.log('Users collection reference:', usersCollectionRef);
        
        // Get all users
        console.log('Fetching all users...');
        const usersSnapshot = await getDocs(usersCollectionRef);
        console.log('Total users found:', usersSnapshot.docs.length);
        console.log('Users snapshot:', usersSnapshot);
        
        // Log each user document for debugging
        usersSnapshot.docs.forEach((userDoc, index) => {
          console.log(`User ${index + 1} - ID: ${userDoc.id}, Data:`, userDoc.data());
        });
        
        if (usersSnapshot.docs.length === 0) {
          console.log('❌ NO USERS FOUND IN DATABASE');
          console.log('This could mean:');
          console.log('1. No users have signed up and made transactions yet');
          console.log('2. Firestore security rules are blocking access');
          console.log('3. The users collection structure is different');
          console.log('4. Users are stored in a different collection');
          
          // Let's also try to check if there are any collections at all
          console.log('Checking for any existing data in Firestore...');
          
          // Try to check the products collection as we know it has data
          try {
            const productsSnapshot = await getDocs(collection(db, 'products'));
            console.log('Products collection accessible, count:', productsSnapshot.docs.length);
          } catch (error) {
            console.error('Cannot access products collection:', error);
          }
          
          // Try to check admin collection
          try {
            const adminsSnapshot = await getDocs(collection(db, 'admins'));
            console.log('Admins collection accessible, count:', adminsSnapshot.docs.length);
          } catch (error) {
            console.error('Cannot access admins collection:', error);
          }

          // Let's try some alternative approaches to find users
          console.log('🔍 ALTERNATIVE DEBUGGING APPROACHES:');
          
          // Check if there are any auth users vs firestore users mismatch
          console.log('Checking if this is an auth vs firestore mismatch...');
          
          // Try to check if users might be stored differently
          try {
            console.log('Checking if there are any documents in root collections...');
            const rootCollections = ['user', 'customers', 'clients', 'profiles'];
            
            for (const collectionName of rootCollections) {
              try {
                const testSnapshot = await getDocs(collection(db, collectionName));
                if (testSnapshot.docs.length > 0) {
                  console.log(`Found ${testSnapshot.docs.length} documents in '${collectionName}' collection`);
                  testSnapshot.docs.forEach((doc, index) => {
                    console.log(`${collectionName} ${index + 1}:`, { id: doc.id, data: doc.data() });
                  });
                }
              } catch (err) {
                console.log(`Collection '${collectionName}' doesn't exist or isn't accessible`);
              }
            }
          } catch (error) {
            console.error('Error checking alternative collections:', error);
          }

          // Check security rules by trying to access a specific document
          try {
            console.log('Testing security rules by trying to access a test document...');
            const testDocRef = doc(db, 'users', 'test-user-id');
            const testDoc = await getDoc(testDocRef);
            console.log('Test document access result:', testDoc.exists() ? testDoc.data() : 'Document does not exist');
          } catch (securityError) {
            console.error('❌ SECURITY RULE ERROR detected:', securityError);
            console.error('This confirms that security rules are blocking access to users collection');
          }
          
          return [];
        }
        
        // For each user, get their transactions
        for (const userDoc of usersSnapshot.docs) {
          const userId = userDoc.id;
          console.log(`Processing user: ${userId}`);
          console.log(`User data:`, userDoc.data());
          
          try {
            const transactionsCollectionRef = collection(db, 'users', userId, 'transactions');
            console.log(`Transactions collection ref for user ${userId}:`, transactionsCollectionRef);
            
            const transactionsQuery = query(
              transactionsCollectionRef,
              orderBy('createdAt', 'desc')
            );
            const transactionsSnapshot = await getDocs(transactionsQuery);
            console.log(`User ${userId} has ${transactionsSnapshot.docs.length} transactions`);
            
            // Log each transaction
            transactionsSnapshot.docs.forEach((transactionDoc, index) => {
              console.log(`Transaction ${index + 1} for user ${userId}:`, {
                id: transactionDoc.id,
                data: transactionDoc.data()
              });
            });
            
            // Get user's dogs for pet details lookup
            const dogsCollectionRef = collection(db, 'users', userId, 'dogs');
            const dogsSnapshot = await getDocs(dogsCollectionRef);
            const userDogs: Dog[] = dogsSnapshot.docs.map(doc => ({ 
              id: doc.id, 
              ...doc.data() 
            } as Dog));
            console.log(`User ${userId} has ${userDogs.length} dogs:`, userDogs);
            
            for (const transactionDoc of transactionsSnapshot.docs) {
              const transactionData = transactionDoc.data();
              console.log(`Processing transaction ${transactionDoc.id}:`, transactionData);
              
              // Find matching pet details
              let petDetails = null;
              if (transactionData.dogName) {
                const matchingDog = userDogs.find(dog => dog.name === transactionData.dogName);
                if (matchingDog) {
                  petDetails = {
                    name: matchingDog.name,
                    breed: matchingDog.breed,
                    petType: matchingDog.petType || 'Dog',
                    dateOfBirth: matchingDog.dateOfBirth || '',
                    age: matchingDog.age || 0,
                  };
                  console.log(`Found pet details for ${transactionData.dogName}:`, petDetails);
                }
              }
              
              const transaction = {
                id: transactionDoc.id,
                userId,
                petDetails,
                ...transactionData,
              } as AdminTransaction;
              
              allTransactions.push(transaction);
              console.log(`Added transaction:`, transaction);
            }
          } catch (userError) {
            console.error(`Error processing user ${userId}:`, userError);
            console.error('Error details:', {
              name: userError.name,
              message: userError.message,
              code: userError.code
            });
          }
        }
        
        // Sort by creation date (most recent first)
        const sortedTransactions = allTransactions.sort((a, b) => {
          if (!a.createdAt || !b.createdAt) return 0;
          return b.createdAt.toMillis() - a.createdAt.toMillis();
        });
        
        console.log('Final sorted transactions:', sortedTransactions);
        console.log(`Total transactions found: ${sortedTransactions.length}`);
        console.log('=== FETCH ALL TRANSACTIONS COMPLETE ===');
        return sortedTransactions;
        
      } catch (error) {
        console.error('❌ Error in useAllTransactions:', error);
        console.error('Error details:', {
          name: error.name,
          message: error.message,
          code: error.code,
          stack: error.stack
        });
        
        // Additional debugging for specific error types
        if (error.code === 'permission-denied') {
          console.error('🚫 PERMISSION DENIED - This is definitely a security rules issue');
          console.error('Check your Firestore security rules for the users collection');
        }
        
        // Don't throw error, return empty array to show a better message to user
        return [];
      }
    },
  });

  // Log the results
  console.log('useAllTransactions result:', result.data);
  if (result.error) {
    console.error('useAllTransactions error:', result.error);
  }

  return { 
    transactions: result.data || [], 
    isLoading: result.isLoading, 
    error: result.error 
  };
};
