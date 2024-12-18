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
var isFiltering = false;

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
const messagesRef = ref(database, "messaggi");

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

// Filtro applicato dall'utente
document.getElementById("applicaFiltro").addEventListener("click", () => {
    const parolaChiave = document.getElementById("parolaChiave").value.trim().toLowerCase();

    if (parolaChiave) {
        filtraMessaggi(parolaChiave);
    }else{
        alert("Nessuna parola chiave inserita");
    }
});

// Reset del filtro
document.getElementById("rimuoviFiltro").addEventListener("click", () => {
    isFiltering = false;
    // Pulizia del filtro
    document.getElementById("parolaChiave").value = '';
    // Pulizia della chat
    chat.innerHTML = '';
    // Caricamento di tutti i messaggi
    caricaMessaggi();
});

// Funzione per visualizzare i messaggi con una parola chiave (con chat gpt)
function filtraMessaggi(chiave){
    // Ottenimento con un "get" dei messaggi al riferimento al db (messagesRef) in "snapshot"
    get(messagesRef).then((snapshot) => {
        // Pulizia della chat
        chat.innerHTML = '';
        // Cambiamento di stato
        isFiltering = true;

        // Ciclo dei messaggi
        snapshot.forEach((messaggio) => {
            // Ottenimento degli attributi del messaggio
            const messageData = messaggio.val();

            // Verifica se il messaggio contiene la parola chiave, altrimenti viene ignorato
            if (messageData.text && messageData.text.toLowerCase().includes(chiave)) {
                visualizzaMessaggio(messageData);
            }
        });
    });
}

// Carica tutti i messaggi
function caricaMessaggi(){
    get(messagesRef).then((snapshot) => {
        snapshot.forEach((messaggio) => {
            visualizzaMessaggio(messaggio.val());
        });
    });
}

// Aggiornamento dei messaggi se non si sta filtrando
onChildAdded(messagesRef, (snapshot) => {
    if(!isFiltering){
        visualizzaMessaggio(snapshot.val())
    }
});

function visualizzaMessaggio(dati){
    const dataMessaggio = new Date(dati.anno, dati.mese - 1, dati.giorno);
    const dataAttuale = new Date();
    // Calcolo dei caratteri nel testo (regex con chat gpt)
    const volume = dati.text.replace(/\s+/g, '').length;

    // Controllo: visualizza solo i messaggi recenti (meno o uguali a 30 giorni)
    if ((dataAttuale - dataMessaggio) / (1000 * 3600 * 24) > 30) {
        return;
    }

    // Formattazione dei minuti
    if (dati.minuti >= 0 && dati.minuti <= 9) {
        dati.minuti = "0" + dati.minuti;
    }

    // Data e ora
    const ora = dati.ora + ":" + dati.minuti;
    const data = dati.giorno + "/" + dati.mese + "/" + dati.anno;

    // Creazione del tag contenente il messaggio
    const messageElement = document.createElement('p');

    // Applicazione dello stile al messaggio
    if (dati.mittente == userEmail) {
        messageElement.classList.add("utente");
        messageElement.innerHTML = "<b style='color: rgb(87, 153, 122); user-select: none'>Tu</b>";
    } else {
        messageElement.classList.add("altri");
        messageElement.innerHTML = "<b style='color: rgb(129, 164, 193); user-select: none'>" + dati.mittente + "</b>";
    }

    // Verifica se il testo contiene un link
    if (isLink(dati.text)) {
        // Formatta il testo aggiungendo un anchor per il link
        messageElement.innerHTML += "<br>" + formatLink(dati.text);
    } else {
        messageElement.innerHTML += "<br>" + dati.text;
    }

    // Se contiene un'immagine
    if (dati.image) {
        messageElement.innerHTML += "<br><img src='" + dati.image + "' style='max-width: 300px; max-height: 300px; border-radius: 5px;' />";
    }

    // Aggiunta della data e ora
    messageElement.innerHTML += "<br><i style='color: gray; user-select: none'>" + ora + " - " + data + "</i>";

    // Aggiunta del volume dei messaggi
    if(volume > 1){
        messageElement.innerHTML += "<br><i style='color: gray; user-select: none'>" + volume + " caratteri</i>";
    }else if(volume == 1){
        messageElement.innerHTML += "<br><i style='color: gray; user-select: none'>" + volume + " carattere</i>";
    }else{
        messageElement.innerHTML += "<br><i style='color: gray; user-select: none'>Nessun carattere</i>";
    }
    
    // Aggiunta del messaggio nella chat
    chat.appendChild(messageElement);

    // Scroll della chat all'aggiunta di un messaggio
    chat.scrollTop = chat.scrollHeight;
    
}

// Statistica messaggi/giorno
function messaggiAlGiorno(){

    const attuale = new Date();
    var contaMessaggi = 0;

    get(messagesRef).then((snapshot) => {
        snapshot.forEach((messaggio) => {
            const dati = messaggio.val();
            const dataMessaggio = new Date(dati.anno, dati.mese - 1, dati.giorno);

            // Verifica se il messaggio sia più vecchio di 30 giorni
            if ((attuale - dataMessaggio) / (1000 * 3600 * 24) <= 30) {
                contaMessaggi++;
            }
        });
        document.getElementById("mediaMessaggi").innerHTML = "Media dei messaggi negli ultimi 30 giorni: <i>" + (contaMessaggi/30).toFixed(2) + " Messaggi/Giorno</i>";
    })

}

// Metodo per esportare in csv o pdf (geeksforgeeks.org)
document.getElementById("esporta").addEventListener("click", function() {
    let dati = [];
    var formato = document.getElementById("formato").value;

    // Recupero dei messaggi dal database Firebase al riferimento "messagesRef"
    get(messagesRef).then((snapshot) => {
        snapshot.forEach((messaggio) => {
            const messageData = messaggio.val();

            // Controllo data, vengono esportati solo quelli visibili in chat
            const dataMessaggio = new Date(messageData.anno + "-" + messageData.mese + "-" + messageData.giorno);
            const dataAdttuale = new Date();
            if ((dataAdttuale - dataMessaggio) / (1000 * 3600 * 24) >= 30) {
                return;
            }
            // Formattazione dei minuti
            if (messageData.minuti >= 0 && messageData.minuti <= 9) {
                messageData.minuti = "0" + messageData.minuti;
            }
            // Il contenuto non può essere vuoto (può accadere con l'invio di immagini dove non serve immettere del testo)
            if(messageData.text == 0){
                return;
            }
            // Quelli validi vengono salvati all'interno dell'array
            dati.push({
                mittente: messageData.mittente,
                testo: messageData.text,
                data: `${messageData.giorno}/${messageData.mese}/${messageData.anno}`,
                ora: `${messageData.ora}:${messageData.minuti}`
            });
        });

        if (formato == "csv") {
            // Intestazione
            var contenuto = "Mittente, Testo, Data, Ora\n";

            // Aggiunta dei messaggi nell'array "dati"
            dati.forEach((i) => {
                contenuto += '"' + i.mittente + '", "' + i.testo + '", "' + i.data + '", "' + i.ora + '"\n';
            });

            // Esportazione in csv (con chat gpt)
            // Creazione di un blob specificandone il tipo "testo/csv"
            const blob = new Blob([contenuto], { type: 'text/csv' });
            // Creazione dell'url per il download del blob (posizione del blob contenente il csv)
            const url = URL.createObjectURL(blob);
            // Generazione di un elemento "<a>" per il download dell'elemento
            const a = document.createElement('a');
            // Impostazione dell'attributo "href" dell'elemento anchor nel url del blob
            a.href = url;
            // Definizione del nome del file
            a.download = 'chat.csv';
            // .click() è un metodo per scaricare automaticamente un file, simula la pressione di un utente
            a.click();

        } else if (formato == "pdf") {
            // Creazione dell'oggetto jsPDF (da https://www.geeksforgeeks.org/ + chatgpt)
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();

            // Aggiunta di un titolo alle coordinate 10 10
            doc.text("Chat esportata", 10, 10);

            doc.autoTable({
                // Intestazione della tabella
                head: [['Mittente', 'Testo', 'Data', 'Ora']],
                // Scrittura delle righe
                body: dati.map(messaggio => [messaggio.mittente, messaggio.testo, messaggio.data, messaggio.ora]),
                // Definisce l'altezza iniziale della tabella
                startY: 20,
                margin: { top: 30 },
                // Stile della tabella
                theme: 'striped'
            });

            // Salvare il file come "chat.pdf"
            doc.save("chat.pdf");
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

    // Se c'è un match tra la stringa e il regex, verifica se è un URL valido
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
    messaggiAlGiorno();
};