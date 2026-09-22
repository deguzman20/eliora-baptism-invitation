import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD60lXbSJKTBxp25w98lvN5hVfrDvqwUP0",
  authDomain: "eliora-faye-christining.firebaseapp.com",
  projectId: "eliora-faye-christining",
  storageBucket: "eliora-faye-christining.firebasestorage.app",
  messagingSenderId: "290667839844",
  appId: "1:290667839844:web:8f30f21fbab02ff95f7a71",
  measurementId: "G-WR6H3J2QMV",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);
