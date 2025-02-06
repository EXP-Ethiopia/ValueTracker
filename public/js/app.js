// Import Firebase services from firebase.js
import { auth, db, provider, signInWithPopup, getRedirectResult, onAuthStateChanged, signInWithRedirect, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider } from '../../firebase.js';

// Example usage of Firebase services

// Monitor authentication state
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("User is signed in:", user);
    } else {
        console.log("No user is signed in.");
    }
});

// Function to sign in with Google
const signInWithGoogle = () => {
    signInWithPopup(auth, provider)
        .then((result) => {
            console.log("User signed in with Google:", result.user);
        })
        .catch((error) => {
            console.error("Error signing in with Google:", error);
        });
};

// Function to create a new user with email and password
const createUser = (email, password) => {
    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            console.log("User created:", userCredential.user);
        })
        .catch((error) => {
            console.error("Error creating user:", error);
        });
};

// Function to sign in with email and password
const signInWithEmail = (email, password) => {
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            console.log("User signed in:", userCredential.user);
        })
        .catch((error) => {
            console.error("Error signing in:", error);
        });
};

// Example function calls
// signInWithGoogle();
// createUser('test@example.com', 'password123');
// signInWithEmail('test@example.com', 'password123');