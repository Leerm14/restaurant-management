import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
const firebaseConfig = {
  apiKey: "AIzaSyANE_54S-4URk44n97LZCerYEvfDaWbUnU",
  authDomain: "restaurant-e7901.firebaseapp.com",
  projectId: "restaurant-e7901",
  appId: "1:1044243182093:web:bca76de63e7d24104bdb44",
  databaseURL: "https://restaurant-e7901-default-rtdb.firebaseio.com",
};
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);
export { auth, database };
