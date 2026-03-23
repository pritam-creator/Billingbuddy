// ===============================
// 🔥 FIREBASE DATA SYSTEM
// ===============================

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const db = getFirestore();

// ===============================
// 📦 ITEMS
// ===============================

export async function addItem(name, price, stock) {
  await addDoc(collection(db, "items"), {
    name,
    price: Number(price),
    stock: Number(stock)
  });
}

export async function getItems() {
  const snapshot = await getDocs(collection(db, "items"));
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

export async function updateItem(id, data) {
  const ref = doc(db, "items", id);
  await updateDoc(ref, data);
}

export async function deleteItem(id) {
  const ref = doc(db, "items", id);
  await deleteDoc(ref);
}

// ===============================
// 👤 CUSTOMERS
// ===============================

export async function addCustomer(name, phone) {
  await addDoc(collection(db, "customers"), {
    name,
    phone
  });
}

export async function getCustomers() {
  const snapshot = await getDocs(collection(db, "customers"));
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

// ===============================
// 🧾 ORDERS
// ===============================

export async function addOrder(customerId, cartItems) {
  
  let total = cartItems.reduce((sum, item) =>
    sum + (item.price * item.qty), 0
  );
  
  await addDoc(collection(db, "orders"), {
    customerId,
    items: cartItems,
    total,
    date: new Date().toLocaleString()
  });
  
  // 🔻 STOCK UPDATE
  const itemsSnapshot = await getDocs(collection(db, "items"));
  let items = itemsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
  
  for (let cart of cartItems) {
    let product = items.find(i => i.id === cart.id);
    if (product) {
      const ref = doc(db, "items", product.id);
      await updateDoc(ref, {
        stock: product.stock - cart.qty
      });
    }
  }
}

// ===============================
// 📊 DASHBOARD
// ===============================

export async function getTotalSales() {
  const snapshot = await getDocs(collection(db, "orders"));
  let orders = snapshot.docs.map(doc => doc.data());
  
  return orders.reduce((sum, order) => sum + order.total, 0);
}

export async function getTotalOrders() {
  const snapshot = await getDocs(collection(db, "orders"));
  return snapshot.size;
}