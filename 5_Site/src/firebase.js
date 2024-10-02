const firebaseConfig = {
  apiKey: "AIzaSyBoY_8c6ngRkaBlKbIyUDX_iPNoOQsTt90",
  authDomain: "chat-locale.firebaseapp.com",
  projectId: "chat-locale",
  storageBucket: "chat-locale.appspot.com",
  messagingSenderId: "704859525964",
  appId: "1:704859525964:web:af2db5cc0ffc8f23a235e9",
  measurementId: "G-P29QJQEHKS"
};

// Inizializza Firebase
firebase.initializeApp(firebaseConfig);

// Riferimento all'autenticazione Firebase
const auth = firebase.auth();

// Funzione per il login
document.getElementById('login-form').addEventListener('submit', function (event) {
  event.preventDefault();
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  auth.signInWithEmailAndPassword(email, password)
      .then((userCredential) => {
          const user = userCredential.user;
          document.getElementById('message').textContent = 'Login effettuato con successo!';
          console.log('Utente loggato:', user);
      })
      .catch((error) => {
          document.getElementById('message').textContent = 'Errore nel login: ' + error.message;
          console.error('Errore nel login:', error);
      });
});

// Funzione per la registrazione
document.getElementById('signup-form').addEventListener('submit', function (event) {
  event.preventDefault();
  
  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;
  
  auth.createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
          const user = userCredential.user;
          document.getElementById('message').textContent = 'Registrazione avvenuta con successo!';
          console.log('Utente registrato:', user);
      })
      .catch((error) => {
          document.getElementById('message').textContent = 'Errore nella registrazione: ' + error.message;
          console.error('Errore nella registrazione:', error);
      });
});