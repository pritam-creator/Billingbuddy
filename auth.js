import { auth } from "./firebase.js";
import {
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const loginBtn = document.getElementById("loginBtn");

loginBtn.addEventListener("click", async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  
  if (!email || !password) {
    alert("Email & password required");
    return;
  }
  
  try {
    await signInWithEmailAndPassword(auth, email, password);
    window.location.href = "dashboard.html"; // ya invoice.html
  } catch (err) {
    alert(err.message);
    console.error(err);
  }
});