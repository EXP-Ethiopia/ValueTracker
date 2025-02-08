import {auth, db } from '../../app/models/firebaseConfig.js';
import {BoxContainer} from './BoxContainer.js';

const boxContainer = new BoxContainer('box-container', auth, db) ;
boxContainer.generateBoxes(48);

window.addDoc = addDoc;
window.collection =collection;
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
        profilePic.src = "../images/default.jpg"; 
    }
}, 100); 
} else {
console.warn("❌ No user is signed in.");
}
});