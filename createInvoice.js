import { db } from "./firebase.js";
import {
  doc,
  runTransaction,
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export async function createInvoice(customerName, items) {
  const counterRef = doc(db, "counters", "invoice");
  
  const invoiceNo = await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(counterRef);
    
    if (!snap.exists()) {
      throw "Invoice counter missing";
    }
    
    const nextNo = snap.data().current + 1;
    
    transaction.update(counterRef, {
      current: nextNo
    });
    
    return nextNo;
  });
  
  // Save invoice
  const invoiceRef = await addDoc(collection(db, "invoices"), {
    invoiceNo: invoiceNo,
    customerName: customerName,
    items: items,
    createdAt: serverTimestamp()
  });
  
  return invoiceRef.id; // for redirect
}