// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDW1mkhudjjHW5kbwkvj_h1AaJfccsM8XE",
    authDomain: "rssm-voting.firebaseapp.com",
    projectId: "rssm-voting",
    storageBucket: "rssm-voting.firebasestorage.app",
    messagingSenderId: "79484096864",
    appId: "1:79484096864:web:8b01481cf7928fbabfce05"
  };  

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
