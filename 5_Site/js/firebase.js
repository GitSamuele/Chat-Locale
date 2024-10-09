import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBoY_8c6ngRkaBlKbIyUDX_iPNoOQsTt90",
  authDomain: "chat-locale.firebaseapp.com",
  projectId: "chat-locale",
  storageBucket: "chat-locale.appspot.com",
  messagingSenderId: "704859525964",
  appId: "1:704859525964:web:af2db5cc0ffc8f23a235e9",
  measurementId: "G-P29QJQEHKS"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);