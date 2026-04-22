import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Check for saved Demo Session FIRST
    const savedUser = localStorage.getItem('orion_user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setCurrentUser({ ...user, ...docSnap.data() });
          } else {
            // Fallback if no profile exists
            setCurrentUser({ ...user, role: 'Analyst' });
          }
        } catch (err) {
          console.error("Error fetching user role:", err);
          setCurrentUser({ ...user, role: 'Analyst' }); // Default fallback
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    // Hackathon Demo Mode Failsafe: Bypass Firebase if demo credentials are used
    if (email === 'admin@orion.com' && password === 'admin123') {
      console.warn("Activating Hackathon Demo Mode.");
      const demoUser = { 
        uid: 'demo_admin_id', 
        email: 'admin@orion.com', 
        role: 'Admin',
        isDemo: true 
      };
      setCurrentUser(demoUser);
      localStorage.setItem('orion_user', JSON.stringify(demoUser));
      return demoUser;
    }

    try {
      // 2. Try real Firebase Auth
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      // 3. Last Resort: Check Firestore for "Provisioned" users (Hackathon Demo Path)
      try {
        // 3. Try Local Failsafe (LocalStorage)
        const localUsersStr = localStorage.getItem('orion_provisioned_users');
        if (localUsersStr) {
          const localUsers = JSON.parse(localUsersStr);
          const found = localUsers.find(u => u.email === email && u.password === password);
          if (found) {
            setCurrentUser(found);
            localStorage.setItem('orion_user', JSON.stringify(found));
            return found;
          }
        }

        // 4. Try Firestore
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('email', '==', email));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data();
          
          if (userData.password === password) {
            const provisionedUser = { 
              uid: querySnapshot.docs[0].id, 
              ...userData 
            };
            setCurrentUser(provisionedUser);
            localStorage.setItem('orion_user', JSON.stringify(provisionedUser));
            return provisionedUser;
          }
        }
      } catch (firestoreErr) {
        console.error("Firestore Auth Check Failed:", firestoreErr);
      }
      throw err;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Firebase Signout Error:", err);
    }
    setCurrentUser(null);
    localStorage.removeItem('orion_user'); // Clear saved session
  };

  const value = {
    currentUser,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
