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

// Variabili
let userEmail = "";
const chat = document.getElementById("messaggi");

// Funzione per verificare lo stato di autenticazione dell'utente
onAuthStateChanged(auth, (user) => {
    // Verifica se ci sia una autenticazione in corso e che l'autenticazione sia verificata via email
    // Serve ad evitare che qualcuno crei un account non verificato e acceda cambiando manualmente ad index.html
    if (user && user.emailVerified) {
        userEmail = user.email;
        document.getElementById("benvenuto").innerHTML = "Autenticato come \"" + userEmail + "\"";
    } else {
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

function invioMessaggio() {
    // Recupero del messaggio da inviare
    var message = document.getElementById('messaggio').value;
    var fileInput = document.getElementById('fileInput');

    // Se è stato selezionato un file immagine
    if (fileInput.files && fileInput.files[0]) {
        // Convertiamo il file immagine in Base64
        convertToBase64(fileInput.files[0], (base64Image) => {
            // Aggiungi il messaggio con l'immagine
            const newMessageRef = push(messagesRef);
            const data = new Date();
            set(newMessageRef, {
                mittente: userEmail,
                text: message, // Testo del messaggio
                imageBase64: base64Image,  // Immagine in formato Base64
                ora: data.getHours(),
                minuti: data.getMinutes(),
                giorno: data.getDate(),
                mese: data.getMonth() + 1,
                anno: data.getFullYear()
            });

            // Pulizia dei campi (testo e file)
            document.getElementById('messaggio').value = '';
            fileInput.value = ''; // Resetta il campo di input immagine
        });
    } else if (message) {
        // Se non c'è immagine, ma solo un messaggio di testo
        const newMessageRef = push(messagesRef);
        const data = new Date();
        set(newMessageRef, {
            mittente: userEmail,
            text: message,
            ora: data.getHours(),
            minuti: data.getMinutes(),
            giorno: data.getDate(),
            mese: data.getMonth() + 1,
            anno: data.getFullYear()
        });

        // Pulizia del campo di testo
        document.getElementById('messaggio').value = '';

    }
}


window.addEventListener('keydown', tastoPremuto);

// Ogni volta che viene aggiunto un figlio al riferimento "messagesRef" viene eseguito il codice del blocco
onChildAdded(messagesRef, (snapshot) => {
    const messageData = snapshot.val();

    // Formattazione dei minuti
    if (messageData.minuti >= 0 && messageData.minuti <= 9) {
        messageData.minuti = "0" + messageData.minuti;
    }

    const ora = messageData.ora + ":" + messageData.minuti;
    const data = messageData.giorno + "/" + messageData.mese + "/" + messageData.anno;

    // Creazione di un tag <p> per il messaggio
    const messageElement = document.createElement('p');

    if (messageData.mittente == userEmail) {
        messageElement.classList.add("utente");
        messageElement.innerHTML = "<b style=\"color: rgb(87, 153, 122); user-select: none\">Tu</b>";
    } else {
        messageElement.classList.add("altri");
        messageElement.innerHTML = "<b style=\"color: rgb(129, 164, 193); user-select: none\">" + messageData.mittente + "</b>";
    }

    // Inserimento del testo e dell'ora
    if (isLink(messageData.text)) {
        messageElement.innerHTML += "<br>" + formatLink(messageData.text);
    } else {
        messageElement.innerHTML += "<br>" + messageData.text;
    }

    // Se il messaggio contiene un'immagine Base64
    if (messageData.imageBase64) {
        messageElement.innerHTML += `<br><img src="${messageData.imageBase64}" style="max-width: 300px; max-height: 300px; border-radius: 5px;" />`;
    }

    // Aggiunta della data e dell'ora al messaggio
    messageElement.innerHTML += "<br><i style=\"color: gray; user-select: none\">" + ora + " - " + data + "</i>"

    // Aggiungi il messaggio al contenitore
    document.getElementById('messaggi').appendChild(messageElement);

    // Aggiornamento della visuale
    chat.scrollTop = chat.scrollHeight;
    
});


// Funzione per gestire il logout
// Dopo il logout, l'utente viene reindirizzato alla pagina di autenticazione
document.getElementById('logout').addEventListener('click', () => {
    signOut(auth).then(() => {
        // Reindirizza alla pagina di autenticazione
        window.location.href = "auth.html";
    })
});

// Metodo di verifica se sia un link
function isLink(str) {
    // Il regex è una stringa utilizzabile come filtro da applicare ad una stringa
    const regex = /https?:\/\/[^\s/$.?#].[^\s]*/;
    const match = str.match(regex); // Cerca il primo match dell'URL

    // Se c'è un match, verifica se è un URL valido
    if (match) {
        try {
            new URL(match[0]); // Tenta di creare un oggetto URL
            return true; // È un link valido
        } catch (e) {
            return false; // Il link non è valido
        }
    }

    return false; // Se non c'è nessun URL
}

// Metodo per formattare il contenuto di un messaggio se contiene un link
function formatLink(str){
    // Il regex è una stringa utilizzabile come filtro da applicare ad una stringa
    const regex = /https?:\/\/[^\s/$.?#].[^\s]*/g;
    var formattata = "";
    var ultimoIndex = 0;

    // Cicliamo sulla stringa per trovare tutti i link
    var match;
    while ((match = regex.exec(str)) !== null) {
        // Aggiungiamo il testo prima del link
        formattata += str.slice(ultimoIndex, match.index);

        // Aggiungiamo il tag <a> per il link trovato
        formattata += `<a href="${match[0]}">${match[0]}</a>`;

        // Aggiorniamo l'ultimo indice
        ultimoIndex = regex.lastIndex;
    }

    // Aggiungiamo la parte finale della stringa (dopo l'ultimo URL)
    formattata += str.slice(ultimoIndex);

    return formattata;
}

// Funzione per convertire un file in base 64
function convertToBase64(file, onLoad) {
    // Creazione dell'oggetto "reader" per leggere un file
    const reader = new FileReader();
    // reader.onloadend serve a leggere prima tutto il file, in seguito eseguire un blocco di codice
    reader.onloadend = function() {
        onLoad(reader.result);
    };
    // Legge l'oggetto "reader"
    reader.readAsDataURL(file);
}

// Aggiornamento della visuale al caricamento della chat
window.onload = () => {
    chat.scrollTop = chat.scrollHeight;
};