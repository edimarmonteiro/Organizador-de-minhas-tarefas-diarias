import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {

  apiKey: "AIzaSyAfjNMYOdXRPXy6mGivas5CxoFfu3Zm4Ww",

  authDomain: "tarefasplus-d332d.firebaseapp.com",

  projectId: "tarefasplus-d332d",

  storageBucket: "tarefasplus-d332d.appspot.com",

  messagingSenderId: "12703724547",

  appId: "1:12703724547:web:f9fac4ee8a542882d28a36"

};

//Iniciar a configuração do projeto
const firebaseApp = initializeApp(firebaseConfig);

//Iniciar configuraçao do banco de dados
const db = getFirestore(firebaseApp)

export { db };