import {auth, db } from './firebaseConfig';

// Initialize google provider
const provider = new GoogleAuthProvider();

// 🔹 Save User Info in Firestore
async function saveUserToFirebase(user) {
    try {
        await setDoc(doc(db, "users", user.uid), {
            name: user.displayName,
            email: user.email,
            profilePicture: user.photoURL,
            lastLogin: new Date().toISOString()
        });
        console.log("User saved to Firebase:", user.email);
    } catch (error) {
        console.error("Error saving user to Firestore:", error);
    }
}

// Google Sign-In
function GoogleLogin() {
    signInWithPopup(auth, provider)  // Open Google login popup
        .then((result) => {
            const user = result.user;
            console.log("User logged in via Google:", user);
            saveUserToFirebase(user); // Save user info to Firestore
            redirectToHome(user.displayName || "User");
        })
        .catch((error) => {
            console.error("Google Sign-In Error:", error.message);
        });
}


// Check if user is authenticated after page reload
// onAuthStateChanged(auth, (user) => {
//     if (user) {
//         console.log("User is already logged in:", user);
//         redirectToHome(user.displayName || "User");
//     }
// });

// Redirect to Home Page
function redirectToHome(username) {
    window.location.href = `../../app/views/home.html?username=${encodeURIComponent(username)}`;
}

// Event listeners for buttons
document.getElementById("google-btn").addEventListener("click", GoogleLogin);

// Handle other login/signup functionality here (email/password etc.)
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const createNewUser = document.getElementById("create-btn");
const LoginBtn = document.getElementById("sign-btn");

// createNewUser.addEventListener("click", () => {
//     console.log("New User:", emailInput.value, passwordInput.value);
//     SignIn(emailInput.value, passwordInput.value);
// });

LoginBtn.addEventListener("click", () => {
    LogIn(emailInput.value, passwordInput.value);
});

// ✅ Sign-up function (MODULAR Firebase)
function SignIn(email, password) {
    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            console.log("User Created Successfully:", userCredential.user);
            saveUserToFirebase(userCredential.user); // Save user info to Firestore
            redirectToHome(userCredential.user.displayName || "User");
        })
        .catch((error) => {
            console.error("Error:", error.message);
        });
}

// Log-in function (MODULAR Firebase)
function LogIn(email, password) {
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Signed in 
            const user = userCredential.user;
            console.log("User Is logged in:", user.email);
            redirectToHome(user.email || "User");
        })
        .catch((error) => {
            console.error("Error:", error.message);
        });
}