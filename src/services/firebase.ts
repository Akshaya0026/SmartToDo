import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Replace with your Firebase project configuration
// Get this from Firebase Console > Project Settings > General > Your apps
const firebaseConfig = {
  apiKey: 'AIzaSyDXdlARFRGeV748hIBsx0fnRpRyHxyLgrY',
  authDomain: 'smarttodomanager-76fda.firebaseapp.com',
  projectId: 'smarttodomanager-76fda',
  storageBucket: 'smarttodomanager-76fda.firebasestorage.app',
  messagingSenderId: '757846089255',
  appId: '1:757846089255:android:701b12cb6b7ed6c6ca7802',
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

export function initFirebase() {
  if (!app) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  }
  return { app, auth, db };
}

export function getFirebaseAuth(): Auth {
  if (!auth) initFirebase();
  return auth;
}

export function getFirebaseDb(): Firestore {
  if (!db) initFirebase();
  return db;
}
