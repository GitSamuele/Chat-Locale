// Importa i moduli di Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
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

// Inizializza Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Referenza al nodo "messages" nel database
const messagesRef = ref(database, 'messages');

// Aggiungi un listener al bottone "Invia"
document.getElementById('send-button').addEventListener('click', () => {
    const message = document.getElementById('message-input').value;
    if (message) {
        // Aggiungi il messaggio al database con una chiave univoca
        const newMessageRef = push(messagesRef);
        set(newMessageRef, {
            text: message,
            timestamp: new Date().toISOString()
        });
        document.getElementById('message-input').value = ''; // Pulisci il campo input
    }
});

// Recupera i messaggi in tempo reale e aggiungili alla chat
onChildAdded(messagesRef, (snapshot) => {
    const messageData = snapshot.val();
    const messageElement = document.createElement('p');
    messageElement.textContent = messageData.text;
    document.getElementById('messages').appendChild(messageElement);
});
