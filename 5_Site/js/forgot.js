// Importa i moduli necessari da Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getAuth, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js";

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

// Funzione per resettare la password
document.getElementById("sendButton").addEventListener('click', () => {
    const email = document.getElementById('email').value;

    if(email.length === 0){
        alert("Nessuna e-mail inserita");
        return;
    }

    var emailRegistrate = [];

    // Riferimento nel database dove vengono salvate le email
    const usersRef = ref(db, "users");
    get(usersRef).then((snapshot) => {
        if (snapshot.exists()) {
            // Scorri tutti gli utenti e raccogli le email
            snapshot.forEach((childSnapshot) => {
                const emailFromDb = childSnapshot.val().email;
                emailRegistrate.push(emailFromDb); // Aggiungi l'email all'array
            });

            // Verifica se l'email inserita esiste nel database
            if (emailRegistrate.includes(email)) {
                // Se l'email esiste, invia il ripristino della password
                sendPasswordResetEmail(auth, email)
                    .then(() => {
                        // Mostra il messaggio di successo
                        document.getElementById("inviato").style.display = "block";
                        document.getElementById("inesistente").style.display = "none";
                    })
            } else {
                // Se l'email non è registrata
                document.getElementById("inviato").style.display = "none";
                document.getElementById("inesistente").style.display = "block";  
            }
        }
    })

});

// Reindirizzamento all'autenticazione
document.getElementById("home").addEventListener('click', () => {
    window.location.href = "auth.html";
});