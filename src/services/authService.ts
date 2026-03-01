import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User,
  UserCredential,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { getFirebaseAuth, getFirebaseDb } from './firebase';

export async function registerUser(
  email: string,
  password: string,
  displayName?: string
): Promise<UserCredential> {
  const auth = getFirebaseAuth();
  const db = getFirebaseDb();

  const credential = await createUserWithEmailAndPassword(auth, email, password);

  if (displayName && credential.user) {
    await updateProfile(credential.user, { displayName });
  }

  // Create user document in Firestore
  if (credential.user) {
    await setDoc(doc(db, 'users', credential.user.uid), {
      email: credential.user.email,
      displayName: displayName || credential.user.displayName || '',
      createdAt: Date.now(),
    });
  }

  return credential;
}

export async function loginUser(
  email: string,
  password: string
): Promise<UserCredential> {
  const auth = getFirebaseAuth();
  return signInWithEmailAndPassword(auth, email, password);
}

export async function logoutUser(): Promise<void> {
  const auth = getFirebaseAuth();
  return signOut(auth);
}

export function getCurrentUser(): User | null {
  return getFirebaseAuth().currentUser;
}

export function onAuthStateChanged(callback: (user: User | null) => void) {
  return getFirebaseAuth().onAuthStateChanged(callback);
}
