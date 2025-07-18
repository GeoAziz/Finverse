'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { roleDoc, userDoc } from '@/lib/collections';
import { useRouter } from 'next/navigation';

type UserProfile = {
  name: string;
  email: string;
  profileImage: string;
}

type AuthContextType = {
  user: User | null;
  loading: boolean;
  role: string | null;
  profile: UserProfile | null;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  role: null,
  profile: null,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        setUser(user);
        
        // Fetch user role from Firestore
        const roleSnap = await getDoc(roleDoc(user.uid));
        if (roleSnap.exists()) {
          setRole(roleSnap.data().role);
        } else {
          setRole('user'); // Default role
        }
        
        // Listen for profile changes
        const unsubProfile = onSnapshot(userDoc(user.uid), (doc) => {
            if (doc.exists()) {
                setProfile(doc.data() as UserProfile);
            }
        });

        setLoading(false);
        return () => unsubProfile();

      } else {
        setUser(null);
        setRole(null);
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, loading, role, profile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
