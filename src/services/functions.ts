import { getFunctions, httpsCallable } from 'firebase/functions';
import { getApp } from 'firebase/app';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

// ─── Dev bypass ──────────────────────────────────────────────────────────────
// true  → token "123456" verifica o e-mail sem envio real (dev / testes)
// false → fluxo real via Cloud Function
// __DEV__ é true no servidor local e false em qualquer build EAS
const DEV_SKIP_EMAIL_VERIFICATION: boolean = __DEV__;

function fns() {
  return getFunctions(getApp(), 'us-central1');
}

export async function callSendVerificationToken(): Promise<void> {
  if (DEV_SKIP_EMAIL_VERIFICATION) return;
  const fn = httpsCallable(fns(), 'sendVerificationToken');
  await fn({});
}

export async function callVerifyEmailToken(token: string): Promise<void> {
  if (DEV_SKIP_EMAIL_VERIFICATION && token === '123456') {
    const uid = auth.currentUser?.uid;
    if (!uid) throw new Error('Usuário não autenticado.');
    await updateDoc(doc(db, 'users', uid), { emailVerified: true });
    return;
  }
  const fn = httpsCallable<{ token: string }, { success: boolean }>(fns(), 'verifyEmailToken');
  await fn({ token });
}
