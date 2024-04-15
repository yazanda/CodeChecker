
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAQNY-FQW5GsELKYuEOspPkiZCQPgLKOy4",
  authDomain: "code-checker-748b4.firebaseapp.com",
  projectId: "code-checker-748b4",
  storageBucket: "code-checker-748b4.appspot.com",
  messagingSenderId: "749687557998",
  appId: "1:749687557998:web:9b22400cba74b3f9b87b7f",
  measurementId: "G-54SKK7XHV7"
};

export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
const storage = getStorage(app);
export default storage;