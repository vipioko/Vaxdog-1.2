
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCkUy5C36i-ZzKtaTYtJ4Pz5hKKTTyAg64",
  authDomain: "dogvax-aeb2a.firebaseapp.com",
  projectId: "dogvax-aeb2a",
  storageBucket: "dogvax-aeb2a.firebasestorage.app",
  messagingSenderId: "42582914027",
  appId: "1:42582914027:web:db73627ed625b64a399fae",
  measurementId: "G-M0Y990D7DB"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
