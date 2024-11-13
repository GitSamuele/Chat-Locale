// Importa i moduli necessari da Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";

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
initializeApp(firebaseConfig);
const auth = getAuth();

// Funzione per verificare l'email e reindirizzare
function verificaEmail(user) {
    // Verifica se user sia autenticato e user.emailVerified sia true
    if (user && user.emailVerified) {
        // Reindirizzamento all'index
        window.location.href = "index.html";
    }
}

// Monitora lo stato di autenticazione
onAuthStateChanged(auth, function(user) {
    // Controllo se l'utente sia autenticato
    if (user) {
        /* Intervallo che controlla perennemente se l'utente ha verificato l'email scaricando
           le informazioni ogni secondo */
        setInterval(function() {
            /* .then serve ad assicurarsi che le informazioni dell'utente scaricate con ".reload()"
               siano complete, in seguito viene eseguito il metodo di verifica */
            user.reload().then(function() {
                verificaEmail(user);
            });
        }, 1000);
    }
});

// Reindirizzamento all'autenticazione
document.getElementById("home").addEventListener('click', () => {
    window.location.href = "auth.html";
});