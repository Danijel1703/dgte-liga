// Import the functions you need from the SDKs you need
import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB2lpTmmAOGJmEh5lI-pyUu_9_tuaYMWKg",
  authDomain: "dgte-liga.firebaseapp.com",
  projectId: "dgte-liga",
  storageBucket: "dgte-liga.firebasestorage.app",
  messagingSenderId: "311973497472",
  appId: "1:311973497472:web:f3687903c820ed569d3465",
  measurementId: "G-E35YYYLLD9",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
