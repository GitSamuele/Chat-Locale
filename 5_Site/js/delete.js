// Importa i moduli necessari da Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getAuth, deleteUser, deleteAccount } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js";

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
const db = getDatabase(app);

// Funzione per la rimozione dell'account
document.getElementById("deleteAccount").addEventListener('click', () => {
    const user = auth.currentUser;

    if(user){
        deleteUser(user).then(() => {
            alert("Account eliminato con successo. Verrai reindirizzato alla pagina di login.");
            window.location.href = "auth.html";
        })
    }

});

// Reindirizzamento alla pagina della chat
document.getElementById("home").addEventListener('click', () => {
    window.location.href = "index.html";
});