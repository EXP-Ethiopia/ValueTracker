// Get the URL parameters
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getAuth,signInWithPopup, getRedirectResult, onAuthStateChanged, signInWithRedirect, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
// import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
import { getFirestore, doc, setDoc, collection, addDoc } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
import { ref, set,getDatabase } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-database.js";


// Firebase Configuration
const firebaseConfig = {
apiKey: "AIzaSyClF_kUmfMyrxDqP_iuu7BgoqqTtX67JRY",
authDomain: "valutracker-391c6.firebaseapp.com",
databaseURL: "https://valutracker-391c6-default-rtdb.firebaseio.com",
projectId: "valutracker-391c6",
storageBucket: "valutracker-391c6.firebasestorage.app",
messagingSenderId: "268267434732",
appId: "1:268267434732:web:49e075d9a0b22df4c4abc9",
measurementId: "G-X8RX5C4WKS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);