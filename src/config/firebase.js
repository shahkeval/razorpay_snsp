import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
// Replace these with your actual Firebase config values
const firebaseConfig = {
  apiKey: "AIzaSyDW1mkhudjjHW5kbwkvj_h1AaJfccsM8XE",
  authDomain: "rssm-voting.firebaseapp.com",
  projectId: "rssm-voting",
  storageBucket: "rssm-voting.firebasestorage.app",
  messagingSenderId: "79484096864",
  appId: "1:79484096864:web:8b01481cf7928fbabfce05"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

export default app;


