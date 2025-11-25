// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBiDJJ_ADN8RvHjnKlPe0IJr2le9xe9DAg",
  authDomain: "threshingfloorcompanies-570a3.firebaseapp.com",
  databaseURL: "https://threshingfloorcompanies-570a3-default-rtdb.firebaseio.com",
  projectId: "threshingfloorcompanies-570a3",
  storageBucket: "threshingfloorcompanies-570a3.firebasestorage.app",
  messagingSenderId: "115640171854",
  appId: "1:115640171854:web:69c9df763475a93113f21f",
  measurementId: "G-VNCRPEEPN8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app);
export const auth = getAuth(app);