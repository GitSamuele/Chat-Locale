// Importa i moduli necessari da Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getAuth, sendEmailVerification, signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";
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
        
        // Salva l'email dell'utente nel database
        set(ref(database, 'users/' + user.uid), {
            email: user.email
        });
        
        console.log("Utente loggato: ", user);
        // Reindirizzamento alla pagina principale
        window.location.href = "index.html";
    })
});

// Funzione per il login con email e password
document.getElementById('login-email-button').addEventListener('click', () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Autentica l'utente tramite email e password
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {

            const user = userCredential.user;

            // Verifica se l'email è verificata
            if (!user.emailVerified) {
                sendEmailVerification(user);
                window.location.href = "wait.html"; // Reindirizza alla pagina di verifica
            }else{
                window.location.href = "index.html"; // Reindirizza alla pagina principale
            }

        })
});

// Funzione per la registrazione di nuovi utenti
document.getElementById('register-button').addEventListener('click', () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Crea un nuovo utente con email e password
    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            
            // Salva l'email dell'utente nel database
            set(ref(database, 'users/' + user.uid), {
                email: user.email
            });

            sendEmailVerification(user)
                .then(() => {
                    // Reindirizza alla pagina di verifica
                    window.location.href = "wait.html";
                })

        })
});

// Reindirizza alla pagina per ripristino della password
document.getElementById('cambiaP').addEventListener('click', () => {
    window.location.href = "forgot.html";
});