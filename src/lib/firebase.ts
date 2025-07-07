import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getDatabase, Database } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCBeWkOPDNNRPd2rf3OBoTO0dnF-5E8sNA",
  authDomain: "clientlasentek.firebaseapp.com",
  projectId: "clientlasentek",
  storageBucket: "clientlasentek.appspot.com",
  messagingSenderId: "950026420074",
  appId: "1:950026420074:web:54b9c0e0afaec14cc1af13",
  databaseURL: "https://clientlasentek-default-rtdb.firebaseio.com/",
};


// Initialize Firebase
let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const auth: Auth = getAuth(app);
const db: Database = getDatabase(app);

export { app, auth, db };
