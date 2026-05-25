import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  deleteUser,
} from 'firebase/auth';
import { auth } from './firebase';
import { createUserProfile } from './firestore';

export async function signUp(
  email: string,
  password: string,
  displayName: string,
): Promise<void> {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName });
  await createUserProfile(credential.user.uid, email, displayName);
}

export async function signIn(email: string, password: string): Promise<void> {
  await signInWithEmailAndPassword(auth, email, password);
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

export async function updateDisplayName(newName: string): Promise<void> {
  if (!auth.currentUser) throw new Error('Usuário não autenticado.');
  await updateProfile(auth.currentUser, { displayName: newName });
}

export async function deleteAccount(): Promise<void> {
  if (!auth.currentUser) throw new Error('Usuário não autenticado.');
  await deleteUser(auth.currentUser);
}
