import { getFunctions, httpsCallable } from 'firebase/functions';
import { getApp } from 'firebase/app';

function fns() {
  return getFunctions(getApp(), 'us-central1');
}

export async function callSendVerificationToken(): Promise<void> {
  const fn = httpsCallable(fns(), 'sendVerificationToken');
  await fn({});
}

export async function callVerifyEmailToken(token: string): Promise<void> {
  const fn = httpsCallable<{ token: string }, { success: boolean }>(fns(), 'verifyEmailToken');
  await fn({ token });
}
