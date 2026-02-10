import { db } from "./firebase.js";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const nameInput = document.getElementById("name");
const priceInput = document.getElementById("price");
const list = document.getElementById("list");

/* LOAD ITEMS */
async function loadItems() {
  list.innerHTML = "";
  const snap = await getDocs(collection(db, "items"));
  
  snap.forEach(d => {
    const li = document.createElement("li");
    li.innerHTML = `
      ${d.data().name} - ₹${d.data().price}
      <button data-id="${d.id}">Delete</button>
    `;
    
    li.querySelector("button").onclick = async () => {
      await deleteDoc(doc(db, "items", d.id));
      loadItems();
    };
    
    list.appendChild(li);
  });
}

/* ADD ITEM */
document.getElementById("add").onclick = async () => {
  const name = nameInput.value.trim();
  const price = Number(priceInput.value);
  
  if (!name || !price) return alert("Fill all fields");
  
  await addDoc(collection(db, "items"), {
    name,
    price
  });
  
  nameInput.value = "";
  priceInput.value = "";
  
  loadItems();
};

loadItems();