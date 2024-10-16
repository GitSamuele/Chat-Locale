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

// Inizializza Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app); // Inizializza il database

// Funzione per caricare le informazioni dell'utente attualmente autenticato
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("Utente autenticato: ", user);
        document.getElementById('current-user-id').textContent = user.uid; // Mostra l'ID dell'utente attuale

        loadConversations(user.uid); // Carica le conversazioni dell'utente
    } else {
        console.log("Nessun utente autenticato. Reindirizzamento alla pagina di autenticazione.");
        window.location.href = "auth.html"; // Reindirizza alla pagina di autenticazione
    }
});

// Funzione per cercare l'ID dell'utente basato sull'email
function findUserIdByEmail(email) {
    const usersRef = ref(database, 'users');
    return new Promise((resolve, reject) => {
        onChildAdded(usersRef, (snapshot) => {
            const userData = snapshot.val();
            if (userData.email === email) {
                resolve(snapshot.key); // Restituisce l'ID dell'utente
            }
        }, {
            onlyOnce: true
        });
        reject("Nessun utente trovato con questa email.");
    });
}

// Funzione per gestire il logout
document.getElementById('logout-button').addEventListener('click', () => {
    signOut(auth).then(() => {
        console.log("Utente disconnesso");
        window.location.href = "auth.html"; // Reindirizza alla pagina di autenticazione
    }).catch((error) => {
        console.error("Errore durante la disconnessione: ", error);
    });
});

// Aggiungi evento per il bottone di chat
document.getElementById('start-chat-button').addEventListener('click', async () => {
    const emailToChatWith = document.getElementById('email-to-chat').value;
    const currentUserId = auth.currentUser.uid; // Ottieni l'ID dell'utente attualmente autenticato

    if (emailToChatWith) {
        try {
            const userIdToChatWith = await findUserIdByEmail(emailToChatWith);
            if (userIdToChatWith) {
                createConversation(currentUserId, userIdToChatWith);
            } else {
                alert("Nessun utente trovato con questa email.");
            }
        } catch (error) {
            console.error("Errore nella ricerca dell'utente: ", error);
        }
    } else {
        alert("Per favore, inserisci un'email valida.");
    }
});

// Carica le conversazioni
function loadConversations(userId) {
    const conversationsRef = ref(database, 'conversations');
    onChildAdded(conversationsRef, (snapshot) => {
        const conversationData = snapshot.val();
        const conversationId = snapshot.key;

        // Controlla se l'utente è parte della conversazione
        if (conversationData.users[userId]) {
            const li = document.createElement('li');
            li.textContent = `Conversazione: ${conversationId}`;
            li.addEventListener('click', () => {
                loadMessages(conversationId);
            });
            document.getElementById('conversation-list').appendChild(li);
        }
    });
}

// Carica i messaggi di una conversazione
function loadMessages(conversationId) {
    document.getElementById('conversation-id').value = conversationId; // Imposta l'ID della conversazione
    const messagesRef = ref(database, `conversations/${conversationId}/messages`);
    document.getElementById('messages').innerHTML = ""; // Pulisci i messaggi precedenti
    onChildAdded(messagesRef, (snapshot) => {
        const messageData = snapshot.val();
        const messageElement = document.createElement('p');
        messageElement.textContent = `${messageData.senderId}: ${messageData.text}`;
        document.getElementById('messages').appendChild(messageElement);
    });
}

// Invia un messaggio alla conversazione
document.getElementById('send-button').addEventListener('click', () => {
    const message = document.getElementById('message-input').value;
    const conversationId = document.getElementById('conversation-id').value; // Ottieni l'ID della conversazione
    const userId = auth.currentUser.uid;

    if (message && conversationId) {
        sendMessage(conversationId, message, userId);
        document.getElementById('message-input').value = ''; // Pulisci il campo input
    }
});

// Invia un messaggio
function sendMessage(conversationId, message, senderId) {
    const messagesRef = ref(database, `conversations/${conversationId}/messages`);
    const newMessageRef = push(messagesRef);
    set(newMessageRef, {
        text: message,
        senderId: senderId,
        timestamp: new Date().toISOString()
    });
}

// Crea una nuova conversazione
function createConversation(userId1, userId2) {
    const conversationsRef = ref(database, 'conversations');
    const newConversationRef = push(conversationsRef);
    set(newConversationRef, {
        users: {
            [userId1]: true,
            [userId2]: true
        }
    }).then(() => {
        console.log("Nuova conversazione creata.");
        loadConversations(userId1); // Ricarica le conversazioni
        loadConversations(userId2); // Ricarica le conversazioni
    });
}