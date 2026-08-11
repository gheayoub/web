import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAKiQKEeV9XIX6myHGGRo6yyrX2VZkX7eI",
  authDomain: "vmmo-b734b.firebaseapp.com",
  projectId: "vmmo-b734b",
  storageBucket: "vmmo-b734b.firebasestorage.app",
  messagingSenderId: "745547319563",
  appId: "1:745547319563:web:655d388d82f545827c3a0e",
  measurementId: "G-KMZ3NB2Z30"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

console.log("Firebase berhasil diinisialisasi!");

// Ekspor app dan db agar bisa digunakan oleh community.js
export { app, analytics, db };
