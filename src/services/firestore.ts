import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  collection,
  where,
  getDocs,
  arrayUnion,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  inviteCode: string;
  friends: string[];       // array of friend UIDs
  createdAt: Date | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateInviteCode(): string {
  // Avoids visually ambiguous chars (0, O, 1, I)
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

async function uniqueInviteCode(): Promise<string> {
  let code = generateInviteCode();
  let attempts = 0;
  while (attempts < 5) {
    const q = query(collection(db, 'users'), where('inviteCode', '==', code));
    const snap = await getDocs(q);
    if (snap.empty) return code;
    code = generateInviteCode();
    attempts++;
  }
  return code; // very unlikely collision after 5 tries
}

// ─── User Profile ─────────────────────────────────────────────────────────────

export async function createUserProfile(
  uid: string,
  email: string,
  displayName: string,
): Promise<void> {
  const inviteCode = await uniqueInviteCode();
  await setDoc(doc(db, 'users', uid), {
    uid,
    email,
    displayName,
    inviteCode,
    friends: [],
    quantities: {},
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  const d = snap.data();
  return {
    uid: d.uid,
    email: d.email,
    displayName: d.displayName,
    inviteCode: d.inviteCode,
    friends: d.friends ?? [],
    createdAt: d.createdAt?.toDate() ?? null,
  };
}

// ─── Album Quantities ─────────────────────────────────────────────────────────

export async function loadAlbumQuantities(
  uid: string,
): Promise<Record<string, number>> {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return {};
  return snap.data().quantities ?? {};
}

export async function saveAlbumQuantities(
  uid: string,
  quantities: Record<string, number>,
): Promise<void> {
  await updateDoc(doc(db, 'users', uid), {
    quantities,
    updatedAt: serverTimestamp(),
  });
}

// ─── Friends ──────────────────────────────────────────────────────────────────

export async function findUserByInviteCode(
  code: string,
): Promise<UserProfile | null> {
  const upper = code.toUpperCase().trim();
  const q = query(collection(db, 'users'), where('inviteCode', '==', upper));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0].data();
  return {
    uid: d.uid,
    email: d.email,
    displayName: d.displayName,
    inviteCode: d.inviteCode,
    friends: d.friends ?? [],
    createdAt: d.createdAt?.toDate() ?? null,
  };
}

export async function addFriend(myUid: string, friendUid: string): Promise<void> {
  // Add to both sides
  await Promise.all([
    updateDoc(doc(db, 'users', myUid), { friends: arrayUnion(friendUid) }),
    updateDoc(doc(db, 'users', friendUid), { friends: arrayUnion(myUid) }),
  ]);
}

export async function getFriendsProfiles(
  friendUids: string[],
): Promise<UserProfile[]> {
  if (friendUids.length === 0) return [];
  const docs = await Promise.all(
    friendUids.map(uid => getDoc(doc(db, 'users', uid))),
  );
  return docs
    .filter(s => s.exists())
    .map(s => {
      const d = s.data()!;
      return {
        uid: d.uid,
        email: d.email,
        displayName: d.displayName,
        inviteCode: d.inviteCode,
        friends: d.friends ?? [],
        createdAt: d.createdAt?.toDate() ?? null,
      };
    });
}

export async function getFriendQuantities(
  friendUid: string,
): Promise<Record<string, number>> {
  const snap = await getDoc(doc(db, 'users', friendUid));
  if (!snap.exists()) return {};
  return snap.data().quantities ?? {};
}
