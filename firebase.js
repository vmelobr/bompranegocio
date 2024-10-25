import { initializeApp, getApp } from 'firebase/app';
import { getFirestore, Timestamp } from 'firebase/firestore';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getStorage } from "firebase/storage";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
    apiKey: "AIzaSyCiOQf83vsKOEIDZpCET5B5zeXiY5KHYZk",
    authDomain: "bompranegocio-1f499.firebaseapp.com",
    projectId: "bompranegocio-1f499",
    storageBucket: "bompranegocio-1f499.appspot.com",
    messagingSenderId: "837643924813",
    appId: "1:837643924813:web:95591700d29007f4fb7304",
    measurementId: "G-YHY9V7C9X7"
  };

    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const auth = initializeAuth(app, {
      persistence: getReactNativePersistence(ReactNativeAsyncStorage),
    });
    const storage = getStorage(app, "gs://bompranegocio-1f499.appspot.com");

    export { db, auth, storage, getAuth, getApp, Timestamp};
    