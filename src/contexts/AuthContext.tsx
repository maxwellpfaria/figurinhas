import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { auth, firebaseInitError } from '../services/firebase';
import {
  getUserProfile,
  UserProfile,
} from '../services/firestore';
import { signIn, signUp, signOut, resetPassword, updateDisplayName, deleteAccount as authDeleteAccount } from '../services/auth';
import { callSendVerificationToken, callVerifyEmailToken } from '../services/functions';
import { updateUserDisplayName, deleteUserData } from '../services/firestore';

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  authError: string | null;
  emailVerified: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  clearError: () => void;
  refreshProfile: () => Promise<void>;
  updateName: (name: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  verifyEmailToken: (token: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  loading: true,
  authError: null,
  emailVerified: false,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  resetPassword: async () => {},
  clearError: () => {},
  refreshProfile: async () => {},
  updateName: async () => {},
  deleteAccount: async () => {},
  resendVerificationEmail: async () => {},
  verifyEmailToken: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  // Se o Firebase não inicializou, lança para o ErrorBoundary mostrar o erro na tela
  if (firebaseInitError) throw firebaseInitError;

  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [emailVerified, setEmailVerified] = useState(false);

  const loadProfile = useCallback(async (uid: string) => {
    const p = await getUserProfile(uid);
    setProfile(p);
    // null profile (doc not found yet) → not verified; undefined = grandfathered → verified
    setEmailVerified(p !== null && p.emailVerified !== false);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // Garante loading=true durante toda a transição (evita flash de telas
      // intermediárias quando o Firebase dispara null antes de restaurar o usuário)
      setLoading(true);
      setUser(firebaseUser);
      try {
        if (firebaseUser) {
          await loadProfile(firebaseUser.uid);
        } else {
          setProfile(null);
          setEmailVerified(false);
        }
      } catch {
        setProfile(null);
        setEmailVerified(false);
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
    } catch (e: unknown) {
      setAuthError(friendlyError(e instanceof FirebaseError ? e.code : ''));
      throw e;
    }
  }, []);

  const handleSignUp = useCallback(
    async (email: string, password: string, displayName: string) => {
      try {
        setAuthError(null);
        await signUp(email, password, displayName);
        await callSendVerificationToken();
        // onAuthStateChanged fires before createUserProfile writes to Firestore,
        // so the first loadProfile returns null. Force a reload now that the doc exists.
        if (auth.currentUser) await loadProfile(auth.currentUser.uid);
      } catch (e: unknown) {
        const code = e instanceof FirebaseError ? e.code : (e as { message?: string })?.message ?? '';
        setAuthError(friendlyError(code));
        throw e;
      }
    },
    [loadProfile],
  );

  const handleSignOut = useCallback(async () => {
    await signOut();
    setProfile(null);
  }, []);

  const handleResetPassword = useCallback(async (email: string) => {
    try {
      setAuthError(null);
      await resetPassword(email);
    } catch (e: unknown) {
      setAuthError(friendlyError(e instanceof FirebaseError ? e.code : ''));
      throw e;
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) await loadProfile(user.uid);
  }, [user, loadProfile]);

  const handleUpdateName = useCallback(async (name: string) => {
    if (!user) return;
    await updateDisplayName(name);
    await updateUserDisplayName(user.uid, name);
    await loadProfile(user.uid);
  }, [user, loadProfile]);

  const handleDeleteAccount = useCallback(async () => {
    if (!user) return;
    await deleteUserData(user.uid);
    await authDeleteAccount();
  }, [user]);

  const handleResendVerificationEmail = useCallback(async () => {
    try {
      setAuthError(null);
      await callSendVerificationToken();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '';
      setAuthError(msg || 'Não foi possível reenviar o código. Tente novamente.');
      throw e;
    }
  }, []);

  const handleVerifyEmailToken = useCallback(async (token: string) => {
    try {
      setAuthError(null);
      await callVerifyEmailToken(token);
      if (user) await loadProfile(user.uid);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '';
      setAuthError(msg || 'Código inválido. Tente novamente.');
      throw e;
    }
  }, [user, loadProfile]);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        authError,
        emailVerified,
        signIn: handleSignIn,
        signUp: handleSignUp,
        signOut: handleSignOut,
        resetPassword: handleResetPassword,
        clearError: () => setAuthError(null),
        refreshProfile,
        updateName: handleUpdateName,
        deleteAccount: handleDeleteAccount,
        resendVerificationEmail: handleResendVerificationEmail,
        verifyEmailToken: handleVerifyEmailToken,
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
