import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBjETFSgZsMDw1JRI0fIcUNMCMOHxBMaLA",
  authDomain: "billingbuddy-551f9.firebaseapp.com",
  projectId: "billingbuddy-551f9",
  storageBucket: "billingbuddy-551f9.firebasestorage.app",
  messagingSenderId: "287026017084",
  appId: "1:287026017084:web:aae879570ad706e5a2a439"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);