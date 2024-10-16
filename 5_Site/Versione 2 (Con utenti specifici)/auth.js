import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js";

// Configurazione Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCpcm22ruonGhkkq4YmdR9PDKo8s1-yho4",
    authDomain: "chat-app-65431.firebaseapp.com",
    databaseURL: "https://chat-app-65431-default-rtdb.firebaseio.com",
    projectId: "chat-app-65431",
    storageBucket: "chat-app-65431.appspot.com",
    messagingSenderId: "854226616840",
    appId: "1:854226616840:web:57ee5cf8b1875f7c3007bd"
};

// Inizializza Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

// Funzione per il login con Google
document.getElementById('login-button').addEventListener('click', () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider).then((result) => {
        const user = result.user;
        // Salva l'email nel database
        set(ref(database, 'users/' + user.uid), {
            email: user.email
        });
        console.log("Utente loggato: ", user);
        window.location.href = "index.html"; // Reindirizza alla pagina principale
    }).catch((error) => {
        console.error("Errore durante l'accesso: ", error);
    });
});

// Funzione per il login con email e password
document.getElementById('login-email-button').addEventListener('click', () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Accesso effettuato
            const user = userCredential.user;
            console.log("Utente loggato con email: ", user);
            window.location.href = "index.html"; // Reindirizza alla pagina principale
        })
        .catch((error) => {
            console.error("Errore durante l'accesso: ", error);
        });
});

// Funzione per la registrazione
document.getElementById('register-button').addEventListener('click', () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Utente registrato
            const user = userCredential.user;
            // Salva l'email nel database
            set(ref(database, 'users/' + user.uid), {
                email: user.email
            });
            console.log("Utente registrato: ", user);
            window.location.href = "index.html"; // Reindirizza alla pagina principale
        })
        .catch((error) => {
            console.error("Errore durante la registrazione: ", error);
        });
});