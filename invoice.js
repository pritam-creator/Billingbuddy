import { db } from "./firebase.js";
import {
  collection, getDocs, addDoc, doc, setDoc, getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const itemSelect = document.getElementById("items");
const bill = document.getElementById("bill");
const totalEl = document.getElementById("total");

let total = 0;
let billItems = [];

const itemsSnap = await getDocs(collection(db, "items"));
itemsSnap.forEach(d => {
  const o = document.createElement("option");
  o.value = JSON.stringify(d.data());
  o.textContent = `${d.data().name} ₹${d.data().price}`;
  itemSelect.appendChild(o);
});

document.getElementById("add").onclick = () => {
  const item = JSON.parse(itemSelect.value);
  const qty = Number(document.getElementById("qty").value);

  if (!qty) return alert("Qty missing");

  const price = item.price * qty;
  total += price;
  totalEl.textContent = total;

  billItems.push({ ...item, qty, price });

  const li = document.createElement("li");
  li.textContent = `${item.name} x${qty} = ₹${price}`;
  bill.appendChild(li);
};

document.getElementById("save").onclick = async () => {
  const phone = document.getElementById("phone").value;
  if (!phone) return alert("Phone missing");

  await addDoc(collection(db, "invoices"), {
    phone,
    billItems,
    total,
    date: Date.now()
  });

  const ref = doc(db, "customers", phone);
  const snap = await getDoc(ref);

  let due = total;
  if (snap.exists()) due += snap.data().due;

  await setDoc(ref, { phone, due });

  alert("Invoice saved ✅");
};