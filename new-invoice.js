import { createInvoice } from "./createInvoice.js";

const btn = document.getElementById("saveInvoice");

if (btn) {
  btn.onclick = async () => {
    const customerName =
      document.getElementById("customer").value;
    
    const items = [
      { name: "Rice", qty: 2, price: 60 },
      { name: "Oil", qty: 1, price: 140 }
    ];
    
    const invoiceId = await createInvoice(customerName, items);
    
    window.location.href = `invoice.html?id=${invoiceId}`;
  };
}