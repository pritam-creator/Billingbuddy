import { db } from "./firebase.js";
import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 1️⃣ Invoice ID URL se lo
const params = new URLSearchParams(window.location.search);
const invoiceId = params.get("id"); // example: invoice.html?id=abc123

if (!invoiceId) {
  alert("Invoice ID missing");
}

// 2️⃣ Invoice data load
const ref = doc(db, "invoices", invoiceId);
const snap = await getDoc(ref);

if (!snap.exists()) {
  alert("Invoice not found");
}

const data = snap.data();

// 3️⃣ Fill header
document.getElementById("invNo").innerText = data.invoiceNo;
document.getElementById("customerName").innerText = data.customerName;
document.getElementById("invDate").innerText =
  new Date(data.createdAt).toLocaleDateString();

// 4️⃣ Items
let subtotal = 0;
const tbody = document.getElementById("items");

data.items.forEach(item => {
  const total = item.qty * item.price;
  subtotal += total;
  
  tbody.innerHTML += `
    <tr>
      <td>${item.name}</td>
      <td>${item.qty}</td>
      <td>₹${item.price}</td>
      <td>₹${total}</td>
    </tr>
  `;
});

// 5️⃣ GST
const cgst = subtotal * 0.09;
const sgst = subtotal * 0.09;
const grandTotal = subtotal + cgst + sgst;

document.getElementById("subTotal").innerText = subtotal.toFixed(2);
document.getElementById("cgst").innerText = cgst.toFixed(2);
document.getElementById("sgst").innerText = sgst.toFixed(2);
document.getElementById("grandTotal").innerText = grandTotal.toFixed(2);

// 6️⃣ LOGO
const savedLogo = localStorage.getItem("invoiceLogo");
if (savedLogo) {
  document.getElementById("logoPreview").src = savedLogo;
}

// 7️⃣ PDF
window.downloadPDF = function() {
  html2pdf()
    .set({
      margin: 5,
      filename: `Invoice_${data.invoiceNo}.pdf`,
      html2canvas: { scale: 2 },
      jsPDF: { format: "a4", orientation: "portrait" }
    })
    .from(document.getElementById("invoice"))
    .save();
};