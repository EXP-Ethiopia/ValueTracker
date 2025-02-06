// DOM Manipulation for the Home Page
import { auth, onAuthStateChanged } from '../../firebase.js';

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
        // Add your user-specific code here
    }
});