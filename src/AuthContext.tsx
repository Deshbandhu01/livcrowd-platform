import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { UserProfile } from './types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,
  updateProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

import { handleFirestoreError, OperationType } from './lib/firestore-errors';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionRole, setSessionRole] = useState<string | null>(sessionStorage.getItem('intendedRole'));

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setSessionRole(sessionStorage.getItem('intendedRole'));
      if (u) {
        const path = `users/${u.uid}`;
        const userDoc = doc(db, 'users', u.uid);
        
        try {
          // Ensure profile exists
          const snap = await getDoc(userDoc);
          if (!snap.exists()) {
            const newProfile: UserProfile = {
              uid: u.uid,
              email: u.email || '',
              displayName: u.displayName || '',
              avatarUrl: u.photoURL || '',
              role: 'user',
            };
            await setDoc(userDoc, newProfile);
          }

          // Listen for real-time profile updates
          unsubscribeProfile = onSnapshot(userDoc, (docSnap) => {
            if (docSnap.exists()) {
              setProfile(docSnap.data() as UserProfile);
            }
          }, (error) => {
            handleFirestoreError(error, OperationType.GET, path);
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.GET, path);
        }
      } else {
        setProfile(null);
        if (unsubscribeProfile) unsubscribeProfile();
        sessionStorage.removeItem('intendedRole');
        setSessionRole(null);
      }
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    const path = `users/${user.uid}`;
    const userDoc = doc(db, 'users', user.uid);
    try {
      await setDoc(userDoc, { ...profile, ...data }, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  const isAdminEmail = (email: string | null | undefined) => {
    const adminEmails = ['dbadhauliya@gmail.com', 'dbadhauliya01@gmail.com'];
    return email ? adminEmails.includes(email) : false;
  };

  // Admin if: (hardcoded email OR Firestore role is 'admin') AND logged in via Admin portal
  const isSystemAdmin = (isAdminEmail(user?.email) || profile?.role === 'admin') && sessionRole === 'ADMIN';

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      loading, 
      isAdmin: isSystemAdmin,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};
