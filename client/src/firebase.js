import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// import { getDataConnect } from 'firebase/data-connect';
// import { connectorConfig } from '@dataconnect/generated';

// Placeholder configuration. The user MUST replace this with their actual config.
const firebaseConfig = {
  apiKey: "AIzaSyDA_d--bzRHCtvRTtQnxfy3TQJa-3Rq8Mk",
  authDomain: "orion-41c18.firebaseapp.com",
  projectId: "orion-41c18",
  storageBucket: "orion-41c18.firebasestorage.app",
  messagingSenderId: "357376926759",
  appId: "1:357376926759:web:5571963a8b81175e019a02"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
// export const dataconnect = getDataConnect(app, connectorConfig);
