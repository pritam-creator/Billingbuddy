import { db } from "./firebase.js";
import {
  collection, getDocs, addDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const menu = document.getElementById("menu");
let selected = [];

const snap = await getDocs(collection(db, "items"));
snap.forEach(d => {
  const li = document.createElement("li");
  li.innerHTML = `
    ${d.data().name} ₹${d.data().price}
    <button>Add</button>
  `;
  li.querySelector("button").onclick = () => {
    selected.push(d.data());
    alert("Added");
  };
  menu.appendChild(li);
});

document.getElementById("order").onclick = async () => {
  const phone = document.getElementById("phone").value;
  if (!phone || selected.length === 0)
    return alert("Missing");

  await addDoc(collection(db, "orders"), {
    phone,
    items: selected,
    date: Date.now()
  });

  alert("Order placed ✅");
};