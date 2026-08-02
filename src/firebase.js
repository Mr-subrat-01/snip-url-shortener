import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAnalytics } from "firebase/analytics";
// 👉 Replace this with YOUR Firebase project config.
// Get it from: Firebase Console → Project Settings → General → Your apps → SDK setup and config
const firebaseConfig = {
  apiKey: "AIzaSyBUFWvx_LcGKhYoQyVf3j7uhNnZJMgl6gs",
  authDomain: "zixurl.firebaseapp.com",
  projectId: "zixurl",
  storageBucket: "zixurl.firebasestorage.app",
  messagingSenderId: "379302315301",
  appId: "1:379302315301:web:90a96ca3ba8257e92506cc",
  measurementId: "G-VMFFPGGD50"
};
const app = initializeApp(firebaseConfig)
const analytics = getAnalytics(app);
export const db = getFirestore(app)
