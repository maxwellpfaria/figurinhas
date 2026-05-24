import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../services/firebase';
import {
  getUserProfile,
  UserProfile,
} from '../services/firestore';
import { signIn, signUp, signOut, resetPassword } from '../services/auth';

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  authError: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  clearError: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  loading: true,
  authError: null,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  resetPassword: async () => {},
  clearError: () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const loadProfile = useCallback(async (uid: string) => {
    const p = await getUserProfile(uid);
    setProfile(p);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      try {
        if (firebaseUser) {
          await loadProfile(firebaseUser.uid);
        } else {
          setProfile(null);
        }
      } catch {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    });
    return unsubscribe;
  }, [loadProfile]);

  const handleSignIn = useCallback(async (email: string, password: string) => {
    try {
      setAuthError(null);
      await signIn(email, password);
    } catch (e: any) {
      setAuthError(friendlyError(e.code));
      throw e;
    }
  }, []);

  const handleSignUp = useCallback(
    async (email: string, password: string, displayName: string) => {
      try {
        setAuthError(null);
        await signUp(email, password, displayName);
      } catch (e: any) {
        setAuthError(friendlyError(e.code));
        throw e;
      }
    },
    [],
  );

  const handleSignOut = useCallback(async () => {
    await signOut();
    setProfile(null);
  }, []);

  const handleResetPassword = useCallback(async (email: string) => {
    try {
      setAuthError(null);
      await resetPassword(email);
    } catch (e: any) {
      setAuthError(friendlyError(e.code));
      throw e;
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) await loadProfile(user.uid);
  }, [user, loadProfile]);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        authError,
        signIn: handleSignIn,
        signUp: handleSignUp,
        signOut: handleSignOut,
        resetPassword: handleResetPassword,
        clearError: () => setAuthError(null),
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

// ─── Firebase error → Portuguese message ─────────────────────────────────────
function friendlyError(code: string): string {
  switch (code) {
    case 'auth/user-not-found':
    case 'auth/invalid-credential':
      return 'E-mail ou senha incorretos.';
    case 'auth/wrong-password':
      return 'Senha incorreta.';
    case 'auth/email-already-in-use':
      return 'Este e-mail já está cadastrado.';
    case 'auth/weak-password':
      return 'A senha deve ter pelo menos 6 caracteres.';
    case 'auth/invalid-email':
      return 'E-mail inválido.';
    case 'auth/network-request-failed':
      return 'Sem conexão com a internet.';
    case 'auth/too-many-requests':
      return 'Muitas tentativas. Tente novamente mais tarde.';
    default:
      return 'Ocorreu um erro. Tente novamente.';
  }
}
