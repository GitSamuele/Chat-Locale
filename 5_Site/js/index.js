// Importa i moduli necessari da Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";
import { getDatabase, ref, push, get, set, onChildAdded } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js";

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
const paroleProibite = ["Proibita"];

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

// Invio del messaggio alla pressione del tasto con id "invia"
document.getElementById("invia").addEventListener("click", () => {
    invioMessaggio();
});

// Aggiunta del listener di pressione dei tasti
window.addEventListener('keydown', tastoPremuto);
// Verifica dell'input
function tastoPremuto(event) {
    // Se il tasto è "enter" allora invia il messaggio
    if (event.key == 'Enter') {
        invioMessaggio();
    }
}

// Funzione per verificare il contenuto dei messaggi inviati
function contieneParoleProibite(messaggio) {
    for (let i = 0; i < paroleProibite.length; i++) {
        // Il metodo .includes() verifica se una stringa sia contenuta all'interno di un array
        if (messaggio.toLowerCase().includes(paroleProibite[i].toLowerCase())) {
            return true;
        }
    }
    return false;
}

function invioMessaggio() {
    // Recupero del messaggio da inviare
    var message = document.getElementById('messaggio').value;
    var fileInput = document.getElementById('fileInput');

    if(contieneParoleProibite(message)){
        alert("Parola proibita inserita");
        // Interrompe il codice
        return;
    }

    // Se è stato selezionato un file immagine
    if (fileInput.files[0]) {
        // Convertiamo il file immagine in Base64
        convertToBase64(fileInput.files[0], (base64Image) => {
            // Aggiungi il messaggio con l'immagine
            const newMessageRef = push(messagesRef);
            const data = new Date();
            set(newMessageRef, {
                mittente: userEmail,
                text: message, // Testo del messaggio
                image: base64Image,  // Immagine in formato Base64
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

        if(message.trim().length >= 1){
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
        }else{
            alert("Non è possibile inviare messaggi vuoti");
        }

        // Pulizia del campo di testo
        document.getElementById('messaggio').value = '';

    }

}

onChildAdded(messagesRef, (snapshot) => {
    const messageData = snapshot.val();

    // Controllo data
    const dataMessaggio = new Date(messageData.anno + "-" + messageData.mese + "-" + messageData.giorno);
    const dataAdttuale = new Date();

    // Controllo data e ora del messaggio, se più vecchio di 30 giorni non viene visualizzato
    if((dataAdttuale - dataMessaggio) / (1000 * 3600 * 24) >= 30){
        return;
    }

    // Formattazione dei minuti
    if (messageData.minuti >= 0 && messageData.minuti <= 9) {
        messageData.minuti = "0" + messageData.minuti;
    }

    // Data e ora
    const ora = messageData.ora + ":" + messageData.minuti;
    const data = messageData.giorno + "/" + messageData.mese + "/" + messageData.anno;

    // Creazione del tag <p> (messaggio)
    const messageElement = document.createElement('p');

    // Capire se sia inviato dal mittente o da un altro utente
    if (messageData.mittente == userEmail) {
        messageElement.classList.add("utente");
        messageElement.innerHTML = "<b style=\"color: rgb(87, 153, 122); user-select: none\">Tu</b>";
    } else {
        messageElement.classList.add("altri");
        messageElement.innerHTML = "<b style=\"color: rgb(129, 164, 193); user-select: none\">" + messageData.mittente + "</b>";
    }

    // Verifica se il testo contiene un link
    if (isLink(messageData.text)) {
        // Formatta il testo aggiungendo un anchor per il link
        messageElement.innerHTML += "<br>" + formatLink(messageData.text);
    } else {
        messageElement.innerHTML += "<br>" + messageData.text;
    }

    // Se contiene una immagine la aggiunge al corpo del messaggio con uno stile predefinito
    if (messageData.image) {
        messageElement.innerHTML += `<br><img src="${messageData.image}" style="max-width: 300px; max-height: 300px; border-radius: 5px;" />`;
    }

    // Aggiunta dell'orario
    messageElement.innerHTML += "<br><i style=\"color: gray; user-select: none\">" + ora + " - " + data + "</i>";

    // Aggiunta del messaggio al codice html
    document.getElementById('messaggi').appendChild(messageElement);

    // Reset della posizione della scrollbar
    chat.scrollTop = chat.scrollHeight;

});

// Metodo per esportare in csv o pdf (geeksforgeeks.org)
document.getElementById("esporta").addEventListener("click", function() {
    let dati = [];
    var formato = document.getElementById("formato").value;

    // Recupero dei messaggi dal database Firebase
    get(messagesRef).then((snapshot) => {
        snapshot.forEach((ciclo) => {
            const messageData = ciclo.val();

            // Controllo data
            const dataMessaggio = new Date(messageData.anno + "-" + messageData.mese + "-" + messageData.giorno);
            const dataAdttuale = new Date();
            if ((dataAdttuale - dataMessaggio) / (1000 * 3600 * 24) >= 30) {
                return;
            }

            dati.push({
                mittente: messageData.mittente,
                testo: messageData.text,
                data: `${messageData.giorno}/${messageData.mese}/${messageData.anno}`,
                ora: `${messageData.ora}:${messageData.minuti}`
            });
        });

        if (formato == "csv") {
            var contenuto = "Mittente, Testo, Data, Ora\n";

            dati.forEach((i) => {
                contenuto += '"' + i.mittente + '", "' + i.testo + '", "' + i.data + '", "' + i.ora + '"\n';
            });

            const blob = new Blob([dati], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'export.csv';
            a.click();

        } else if (formato == "pdf") {

        }
    })
});

// Funzione per gestire il logout
// Dopo il logout, l'utente viene reindirizzato alla pagina di autenticazione
document.getElementById('logout').addEventListener('click', () => {
    signOut(auth);
});

// Metodo di verifica se sia un link (con chat gpt)
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

// Metodo per formattare il contenuto di un messaggio se contiene un link (con chat gpt)
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

// Funzione per convertire un file in base 64 (Con chat gpt)
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