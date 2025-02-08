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
const auth = getAuth(app);
const db = getDatabase(app);

// const boxContainer = new BoxContainer('box-container', auth, db);
window.boxContainer = new BoxContainer('box-container', auth, db) ;
boxContainer.generateBoxes(48);

window.auth = auth;
window.addDoc = addDoc;
window.collection =collection;
window.db = db;
window.ref = ref;
window.set = set;

const urlParams = new URLSearchParams(window.location.search);

// Retrieve the 'username' parameter
const username = urlParams.get('username');

// Display the username on the page
document.getElementById('username').textContent = username;

const logoutBtn = document.getElementById('logoutBtn');

logoutBtn.addEventListener('click', () => {


// Sign out the user
auth.signOut()
    .then(() => {
        console.log('User signed out');
        window.location.href = 'index.html';
    })
    .catch((error) => {
        console.error('Sign out error:', error);
    });
});

const profilePic = document.getElementById("profile-pic");

onAuthStateChanged(auth, (user) => {
console.log("🔥 Auth State Changed:", user); // Log user info

if (user) {
console.log("✅ User signed in:", user.displayName, user.email, user.uid);
window.userId = user.uid;

let checkPhotoInterval = setInterval(() => {
    if (user.photoURL) {
        console.log("🖼 Found Profile Pic:", user.photoURL);
    
        profilePic.src = user.photoURL; 
        clearInterval(checkPhotoInterval);
    } else {
        console.warn("⚠ No photoURL found, using default.");
        profilePic.src = "public/images/default.jpg"; 
    }
}, 100); 
} else {
console.warn("❌ No user is signed in.");
}
});