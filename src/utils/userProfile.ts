
import { db } from '@/firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { User } from 'firebase/auth';

export const createUserProfile = async (user: User) => {
  if (!user) return;
  
  try {
    console.log('Creating user profile for:', user.uid, user.email);
    const userDocRef = doc(db, 'users', user.uid);
    
    // Check if user document already exists
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      console.log('User document does not exist, creating new one...');
      
      // Create user document
      await setDoc(userDocRef, {
        uid: user.uid,
        email: user.email,
        phoneNumber: user.phoneNumber,
        displayName: user.displayName,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      
      console.log('✅ User profile created successfully');
    } else {
      console.log('User document already exists');
    }
  } catch (error) {
    console.error('❌ Error creating user profile:', error);
  }
};
