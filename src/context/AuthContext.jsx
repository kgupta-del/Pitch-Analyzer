import { createContext, useContext, useEffect, useState } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  getAdditionalUserInfo,
} from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase';
import { identifyUser, trackEvent } from '../services/analytics';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
      identifyUser(u);
    });
    return unsubscribe;
  }, []);

  const loginWithEmail = async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    trackEvent('login', { method: 'password' });
    return cred;
  };

  const registerWithEmail = async (email, password) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    trackEvent('sign_up', { method: 'password' });
    return cred;
  };

  const loginWithGoogle = async () => {
    const cred = await signInWithPopup(auth, googleProvider);
    const isNew = getAdditionalUserInfo(cred)?.isNewUser;
    trackEvent(isNew ? 'sign_up' : 'login', { method: 'google' });
    return cred;
  };

  const logout = async () => {
    trackEvent('logout');
    await signOut(auth);
    identifyUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithEmail, registerWithEmail, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
