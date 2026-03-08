
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Log at runtime to be 100% sure which key is being used
console.log("VITE_FIREBASE_APIKEY at runtime:", import.meta.env.VITE_FIREBASE_APIKEY);

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "examnotesai-5a42a.firebaseapp.com",
  projectId: "examnotesai-5a42a",
  storageBucket: "examnotesai-5a42a.firebasestorage.app",
  messagingSenderId: "607996421002",
  appId: "1:607996421002:web:95b39cf4e62c5523811e73",
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const provider = new GoogleAuthProvider();

export { auth, provider };