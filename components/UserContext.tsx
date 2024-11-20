import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { auth } from '../utils/firebaseConfig'; // Adjust the import path as needed
import { onAuthStateChanged } from 'firebase/auth';
import { checkPendingVotes } from '@/utils/user'; // Import the pending votes checker function

interface UserContextType {
  user: User | null;
  pendingVotes: any[]; // Array to store pending votes
  refreshPendingVotes: () => void; // Function to manually refresh pending votes
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [pendingVotes, setPendingVotes] = useState<any[]>([]);

  // Fetch pending votes for the authenticated user
  const fetchPendingVotes = async (firebaseUser: User | null) => {
    if (firebaseUser) {
      const { hasPendingVotes, pendingVotes } = await checkPendingVotes(firebaseUser);
      if (hasPendingVotes) {
        setPendingVotes(pendingVotes);
        console.log('Pending votes:', pendingVotes);
      } else {
        setPendingVotes([]);
      }
    } else {
      setPendingVotes([]);
    }
  };

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      fetchPendingVotes(firebaseUser); // Fetch pending votes whenever the user changes
    });

    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        pendingVotes,
        refreshPendingVotes: () => fetchPendingVotes(user), // Provide a way to manually refresh pending votes
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
