import { db } from "./firebase.js";
import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const snap = await getDocs(collection(db, "invoices"));

let total = 0;
let today = 0;
let month = 0;

const todayDate = new Date().toDateString();
const monthNow = new Date().getMonth();

snap.forEach(doc => {
  total++;
  const data = doc.data();
  const date = data.createdAt.toDate();
  
  if (date.toDateString() === todayDate) {
    today += data.grandTotal;
  }
  
  if (date.getMonth() === monthNow) {
    month += data.grandTotal;
  }
});

document.getElementById("totalInvoices").innerText = total;
document.getElementById("todaySales").innerText = today;
document.getElementById("monthSales").innerText = month;
