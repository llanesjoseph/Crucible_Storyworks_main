
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  getAuth, 
  onAuthStateChanged, 
  signInWithPopup,
  GoogleAuthProvider,
  type User, 
  signOut as firebaseSignOut 
} from 'firebase/auth';
import { app, firebaseConfig } from '@/lib/firebase';

export type AppUser = User & {
    role: 'admin' | 'teacher' | 'student' | 'parent' | 'librarian' | 'coordinator' | 'guest';
};

interface AuthContextType {
  user: AppUser | null;
  isLoading: boolean;
  signInWithGoogle: () => Promise<Error | void>;
  signOut: () => Promise<void>;
  firebaseConfig?: typeof firebaseConfig;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {},
});

// Helper to assign a role based on email or invite code (for demo purposes)
function getRoleForUser(user: User, inviteCode: string | null): AppUser['role'] {
    const email = user.email;
    // Admin role is special and based on a specific email
    if (email === 'crucible.analytics.ops@gmail.com') {
        return 'admin';
    }

    // Role from invite code takes precedence for new users
    if (inviteCode) {
        if (inviteCode.startsWith('TCHR')) return 'teacher';
        if (inviteCode.startsWith('STUD')) return 'student';
        if (inviteCode.startsWith('PARENT')) return 'parent';
        if (inviteCode.startsWith('LIBR')) return 'librarian';
        if (inviteCode.startsWith('COORD')) return 'coordinator';
        if (inviteCode.startsWith('GUEST')) return 'guest';
    }

    // Fallback for existing mock users if no invite code is present
    if (email === 'e.reed@school.edu' || email === 's.carter@school.edu') {
        return 'teacher';
    }

    // Default role for any other user
    return 'student';
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // After a sign-in redirect, we check localStorage for an invite code.
        // This is a temporary mechanism until a proper 'users' collection is in place.
        const inviteCode = localStorage.getItem('inviteCode');
        const role = getRoleForUser(firebaseUser, inviteCode);
        
        // Once we've used the code to determine the role, we should remove it
        // to prevent it from being reused on subsequent page loads.
        if (inviteCode) {
            localStorage.removeItem('inviteCode');
        }
        
        const appUser: AppUser = {
            ...firebaseUser,
            role: role
        };
        setUser(appUser);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async (): Promise<Error | void> => {
    const auth = getAuth(app);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Google sign-in failed:", error);
      return error as Error;
    }
  };

  const signOut = async () => {
    try {
      const auth = getAuth(app);
      await firebaseSignOut(auth);
      // User state will be updated by onAuthStateChanged listener
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signInWithGoogle, signOut, firebaseConfig }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
