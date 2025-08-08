import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  ConfirmationResult,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { auth, db } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { createUserProfile } from '@/utils/userProfile';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  userRole: 'petOwner' | 'veterinaryDoctor' | null; // Added userRole
  isPetOwner: boolean; // Added isPetOwner
  isDoctor: boolean; // Added isDoctor
  signInWithPhone: (phoneNumber: string, recaptchaVerifier: RecaptchaVerifier) => Promise<ConfirmationResult>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userRole, setUserRole] = useState<'petOwner' | 'veterinaryDoctor' | null>(null); // New state for user role
  const [isPetOwner, setIsPetOwner] = useState(false); // New state for pet owner role
  const [isDoctor, setIsDoctor] = useState(false); // New state for doctor role

  const checkAdminStatus = async (phoneNumber: string | null) => {
    if (!phoneNumber) {
      console.log('No phone number provided for admin check');
      setIsAdmin(false);
      return;
    }

    console.log('Checking admin status for:', phoneNumber);
    try {
      const adminDocRef = doc(db, 'admins', phoneNumber);
      const adminDoc = await getDoc(adminDocRef);
      const adminStatus = adminDoc.exists();
      console.log(`Admin status for ${phoneNumber}:`, adminStatus);
      setIsAdmin(adminStatus);
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log('Auth state changed, user:', currentUser);
      setUser(currentUser);

      if (currentUser) {
        // Create user profile if it doesn't exist
        await createUserProfile(currentUser);

        // Fetch user's role from Firestore
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const role = userData.role as 'petOwner' | 'veterinaryDoctor' | undefined;
            setUserRole(role || null);
            setIsPetOwner(role === 'petOwner');
            setIsDoctor(role === 'veterinaryDoctor');
            console.log(`User ${currentUser.uid} role: ${role}`);
          } else {
            setUserRole(null);
            setIsPetOwner(false);
            setIsDoctor(false);
            console.log(`User document for ${currentUser.uid} not found.`);
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
          setUserRole(null);
          setIsPetOwner(false);
          setIsDoctor(false);
        }

        // Check admin status
        await checkAdminStatus(currentUser.phoneNumber);
      } else {
        setIsAdmin(false);
        setUserRole(null);
        setIsPetOwner(false);
        setIsDoctor(false);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithPhone = async (phoneNumber: string, recaptchaVerifier: RecaptchaVerifier) => {
    return signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setIsAdmin(false);
    setUserRole(null);
    setIsPetOwner(false);
    setIsDoctor(false);
  };

  const value = {
    user,
    loading,
    isAdmin,
    userRole, // Expose userRole
    isPetOwner, // Expose isPetOwner
    isDoctor, // Expose isDoctor
    signInWithPhone,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
