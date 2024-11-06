// Importa i moduli necessari da Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";
import { getDatabase, ref, push, set, onChildAdded } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js";

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

// Inizializza Firebase e il database
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);
let userEmail = "";

// Funzione per verificare lo stato di autenticazione dell'utente
onAuthStateChanged(auth, (user) => {
    if (user) {
        userEmail = user.email;
        console.log("Utente autenticato: ", user);
        document.getElementById('current-user-id').textContent = user.uid; // Mostra l'ID utente attuale
        loadConversations(user.uid); // Carica le conversazioni dell'utente
    } else {
        console.log("Nessun utente autenticato. Reindirizzamento alla pagina di autenticazione.");
        window.location.href = "auth.html"; // Reindirizza alla pagina di autenticazione
    }
});

// Referenza al nodo "messaggi" nel database
const messagesRef = ref(database, 'messaggi');

// Aggiungi un listener al bottone "Invia"
document.getElementById("invia").addEventListener("click", () => {
    invioMessaggio();
});

// Invio di un messaggio con invio
function tastoPremuto(event) {
    if (event.key == 'Enter') {
        invioMessaggio();
    }
}

function invioMessaggio(){
    // Recupero del messaggio da inviare all'interno della casella di testo
    const message = document.getElementById('messaggio').value;

    if (message) {
        // Aggiunta al database il messaggio
        const newMessageRef = push(messagesRef);
        const data = new Date();
        set(newMessageRef, {
            mittente: userEmail,
            text: message,
            ora: data.getHours(),
            minuti: data.getMinutes(),
            giorno: data.getDate(),
            mese: data.getMonth() + 1, // Viene aggiunto 1 perchè i mesi vengono contati dallo 0
            anno: data.getFullYear()
        });
        // Pulizia del campo di testo
        document.getElementById('messaggio').value = '';
    }
}

window.addEventListener('keydown', tastoPremuto);

// Ogni volta che viene aggiunto un figlio al riferimento "messagesRef" viene eseguito il codice del blocco
onChildAdded(messagesRef, (snapshot) => {
    // Trasformazione dei dati dello snapshot in un oggetto javascript
    const messageData = snapshot.val();

    // Formattazione minuti
    if(messageData.minuti >= 0 && messageData.minuti <= 9){
        messageData.minuti = "0" + messageData.minuti;
    }

    const ora = messageData.ora + ":" + messageData.minuti;
    const data = messageData.giorno + "/" + messageData.mese + "/" + messageData.anno;

    // Creazione di un tag "p"
    const messageElement = document.createElement('p');

    // Applicazione dello stile ai messaggi
    if(messageData.mittente == userEmail){
        messageElement.classList.add("utente");
    }else{
        messageElement.classList.add("altri");
    }

    // Inserimento del testo nel tag "p" precedente
    messageElement.innerHTML = "<b>" + messageData.mittente + ":</b><br>" + messageData.text + "<br><i>" + ora + " - " + data + "</i>";
    // Aggiunta dell'elemento al contenitore dei messaggi
    document.getElementById('messaggi').appendChild(messageElement);
});

// Funzione per gestire il logout
// Dopo il logout, l'utente viene reindirizzato alla pagina di autenticazione
document.getElementById('logout-button').addEventListener('click', () => {
    signOut(auth).then(() => {
        console.log("Utente disconnesso");
        window.location.href = "auth.html"; // Reindirizza alla pagina di autenticazione
    }).catch((error) => {
        console.error("Errore durante la disconnessione: ", error);
    });
});