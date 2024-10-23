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

// Funzione per verificare lo stato di autenticazione dell'utente
// Se l'utente è autenticato, mostra l'ID utente e carica le conversazioni.
// Altrimenti, reindirizza alla pagina di autenticazione.
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("Utente autenticato: ", user);
        document.getElementById('current-user-id').textContent = user.uid; // Mostra l'ID utente attuale
        loadConversations(user.uid); // Carica le conversazioni dell'utente
    } else {
        console.log("Nessun utente autenticato. Reindirizzamento alla pagina di autenticazione.");
        window.location.href = "auth.html"; // Reindirizza alla pagina di autenticazione
    }
});

// Funzione per cercare l'ID di un utente in base all'email fornita
// Restituisce una promessa che risolve con l'ID utente, o rifiuta se non trova l'utente
function findUserIdByEmail(email) {
    const usersRef = ref(database, 'users'); // Referenza alla lista degli utenti nel database
    return new Promise((resolve, reject) => {
        // Cerca l'utente per email
        onChildAdded(usersRef, (snapshot) => {
            const userData = snapshot.val();
            if (userData.email === email) {
                resolve(snapshot.key); // Restituisce l'ID dell'utente trovato
            }
        }, {
            onlyOnce: true // Limita la funzione a eseguire una sola volta
        });
        reject("Nessun utente trovato con questa email."); // Se l'utente non viene trovato
    });
}

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

// Funzione che avvia una nuova chat quando l'utente clicca sul pulsante "Inizia Chat"
document.getElementById('start-chat-button').addEventListener('click', async () => {
    const emailToChatWith = document.getElementById('email-to-chat').value;
    const currentUserId = auth.currentUser.uid; // Ottiene l'ID dell'utente autenticato

    if (emailToChatWith) {
        try {
            const userIdToChatWith = await findUserIdByEmail(emailToChatWith); // Cerca l'utente con cui chattare
            if (userIdToChatWith) {
                createConversation(currentUserId, userIdToChatWith); // Crea una nuova conversazione se l'utente viene trovato
            } else {
                alert("Nessun utente trovato con questa email.");
            }
        } catch (error) {
            console.error("Errore nella ricerca dell'utente: ", error);
        }
    } else {
        alert("Per favore, inserisci un'email valida."); // Mostra un avviso se l'email non è valida
    }
});

// Funzione per caricare le conversazioni dell'utente attuale
function loadConversations(userId) {
    const conversationsRef = ref(database, 'conversations'); // Referenza alla lista delle conversazioni nel database
    onChildAdded(conversationsRef, (snapshot) => {
        const conversationData = snapshot.val();
        const conversationId = snapshot.key;

        // Controlla se l'utente fa parte della conversazione
        if (conversationData.users[userId]) {
            const li = document.createElement('li');
            li.textContent = `Conversazione: ${conversationId}`; // Visualizza l'ID della conversazione
            li.addEventListener('click', () => {
                loadMessages(conversationId); // Carica i messaggi della conversazione selezionata
            });
            document.getElementById('conversation-list').appendChild(li); // Aggiunge la conversazione all'elenco
        }
    });
}

// Funzione per caricare i messaggi di una conversazione selezionata
function loadMessages(conversationId) {
    document.getElementById('conversation-id').value = conversationId; // Imposta l'ID della conversazione selezionata
    const messagesRef = ref(database, `conversations/${conversationId}/messages`); // Referenza ai messaggi della conversazione
    document.getElementById('messages').innerHTML = ""; // Pulisce l'area dei messaggi precedenti
    onChildAdded(messagesRef, (snapshot) => {
        const messageData = snapshot.val();
        const messageElement = document.createElement('p');
        messageElement.textContent = `${messageData.senderId}: ${messageData.text}`; // Visualizza il messaggio e il mittente
        document.getElementById('messages').appendChild(messageElement); // Aggiunge il messaggio all'area di visualizzazione
    });
}

// Funzione per inviare un nuovo messaggio alla conversazione
document.getElementById('send-button').addEventListener('click', () => {
    const message = document.getElementById('message-input').value;
    const conversationId = document.getElementById('conversation-id').value; // Ottiene l'ID della conversazione corrente
    const userId = auth.currentUser.uid; // Ottiene l'ID dell'utente attuale

    if (message && conversationId) {
        sendMessage(conversationId, message, userId); // Invia il messaggio se i dati sono validi
        document.getElementById('message-input').value = ''; // Pulisce il campo di input
    }
});

// Funzione per inviare un messaggio al database
function sendMessage(conversationId, message, senderId) {
    const messagesRef = ref(database, `conversations/${conversationId}/messages`); // Referenza ai messaggi della conversazione
    const newMessageRef = push(messagesRef); // Crea un nuovo nodo per il messaggio
    set(newMessageRef, {
        text: message,        // Testo del messaggio
        senderId: senderId,   // ID del mittente
        timestamp: new Date().toISOString() // Timestamp del messaggio
    });
}

// Funzione per creare una nuova conversazione tra due utenti
function createConversation(userId1, userId2) {
    const conversationsRef = ref(database, 'conversations'); // Referenza alla lista delle conversazioni
    const newConversationRef = push(conversationsRef); // Crea una nuova conversazione
    set(newConversationRef, {
        users: {
            [userId1]: true,   // Aggiunge il primo utente alla conversazione
            [userId2]: true    // Aggiunge il secondo utente alla conversazione
        }
    }).then(() => {
        console.log("Nuova conversazione creata.");
        loadConversations(userId1); // Ricarica le conversazioni per l'utente 1
        loadConversations(userId2); // Ricarica le conversazioni per l'utente 2
    });
}