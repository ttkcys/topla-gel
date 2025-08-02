import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyANU-_q0wrESG-Rk2wNUP-I2nROmip8FsE",
  authDomain: "topla-27154.firebaseapp.com",
  projectId: "topla-27154",
  storageBucket: "topla-27154.firebasestorage.app",
  messagingSenderId: "468778358946",
  appId: "1:468778358946:web:5d764fc6bd03dba4d99ffb",
  measurementId: "G-FTGCGTJKKN",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and Firestore
const auth = getAuth(app);
const db = getFirestore(app);

// Google Auth Provider
const provider = new GoogleAuthProvider();

// Sign in with Google
const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    return result;
  } catch (error) {
    throw error;
  }
};

export { auth, db, signInWithGoogle };
