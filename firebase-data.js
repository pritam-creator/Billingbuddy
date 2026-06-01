// ===============================
// 🔥 FIREBASE HIGH-PERFORMANCE DATA SYSTEM
// ===============================

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  runTransaction,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const db = getFirestore();

// ===============================
// 📦 ITEMS (With Strict Formatting)
// ===============================

export async function addItem(name, price, stock) {
  // Fix: Block malicious or invalid formatting entries instantly
  const formattedPrice = Math.max(0, parseFloat(price) || 0);
  const formattedStock = Math.max(0, parseInt(stock) || 0);

  await addDoc(collection(db, "items"), {
    name: name.trim(),
    price: formattedPrice,
    stock: formattedStock,
    createdAt: serverTimestamp()
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
  // Sanitize incoming metrics if updates scale directly to numerical entries
  if(data.price !== undefined) data.price = Math.max(0, parseFloat(data.price) || 0);
  if(data.stock !== undefined) data.stock = Math.max(0, parseInt(data.stock) || 0);
  
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
    name: name.trim(),
    phone: phone.trim().replace(/\s+/g, '')
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
// 🧾 ORDERS & STOCK MATRIX (Atomic Transactions)
// ===============================

export async function addOrder(customerId, cartItems) {
  if (!cartItems || cartItems.length === 0) throw new Error("Cart registry cannot be empty.");

  const total = cartItems.reduce((sum, item) => sum + ((parseFloat(item.price) || 0) * (parseInt(item.qty) || 0)), 0);
  const cleanTotal = parseFloat(total.toFixed(2));

  // RUN TRANSACTION BLOCK: Fixes Race Conditions, Negative Stocks, and O(N) Reads Leaks entirely!
  await runTransaction(db, async (transaction) => {
    const itemSnapshots = [];
    
    // 1. Target Read Optimization Layer: Fetch ONLY the specific products present in the cart
    for (const item of cartItems) {
      const itemRef = doc(db, "items", item.id);
      const itemDoc = await transaction.get(itemRef);
      if (!itemDoc.exists()) {
        throw new Error(`Product mapping failed: ${item.name} does not exist in inventory system.`);
      }
      itemSnapshots.push({ ref: itemRef, doc: itemDoc, cartItem: item });
    }

    // 2. Strict Realtime Verification State Validation Loop
    for (const itemObj of itemSnapshots) {
      const currentDbStock = parseInt(itemObj.doc.data().stock) || 0;
      const requestedQty = parseInt(itemObj.cartItem.qty) || 0;

      if (currentDbStock < requestedQty) {
        throw new Error(`Insufficient stock warning for [${itemObj.cartItem.name}]. Available: ${currentDbStock}, Requested: ${requestedQty}`);
      }
    }

    // 3. Atomically write Order Details Record
    const orderCollectionRef = collection(db, "orders");
    const newOrderPayload = {
      customerId,
      items: cartItems.map(i => ({ id: i.id, name: i.name, price: parseFloat(i.price), qty: parseInt(i.qty) })),
      total: cleanTotal,
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      timestamp: serverTimestamp() // Safe operational tracking timestamp sync
    };
    
    // Create new document reference within transaction state
    const newOrderRef = doc(orderCollectionRef);
    transaction.set(newOrderRef, newOrderPayload);

    // 4. Update the Dashboard Metadata Counters dynamically to prevent memory crashes on scaling
    const analyticsMetaRef = doc(db, "analytics", "dashboard");
    const metaDoc = await transaction.get(analyticsMetaRef);

    if (!metaDoc.exists()) {
      transaction.set(analyticsMetaRef, { totalSales: cleanTotal, totalOrders: 1 });
    } else {
      const currentSales = parseFloat(metaDoc.data().totalSales) || 0;
      const currentOrders = parseInt(metaDoc.data().totalOrders) || 0;
      transaction.update(analyticsMetaRef, {
        totalSales: parseFloat((currentSales + cleanTotal).toFixed(2)),
        totalOrders: currentOrders + 1
      });
    }

    // 5. Update individual Product Stocks safely
    for (const itemObj of itemSnapshots) {
      const updatedStockValue = (parseInt(itemObj.doc.data().stock) || 0) - (parseInt(itemObj.cartItem.qty) || 0);
      transaction.update(itemObj.ref, { stock: updatedStockValue });
    }
  });
}

// ===============================
// 📊 DASHBOARD METRICS SYSTEM (Ultra High-Speed Optimization)
// ===============================

// Scaled Fix: Instantly fetches aggregated counter parameters instead of executing thousands of raw document mapping queries
export async function getTotalSales() {
  try {
    const snap = await getDocs(collection(db, "analytics"));
    const dashboardDoc = snap.docs.find(d => d.id === "dashboard");
    return dashboardDoc ? (parseFloat(dashboardDoc.data().totalSales) || 0) : 0;
  } catch {
    return 0;
  }
}

export async function getTotalOrders() {
  try {
    const snap = await getDocs(collection(db, "analytics"));
    const dashboardDoc = snap.docs.find(d => d.id === "dashboard");
    return dashboardDoc ? (parseInt(dashboardDoc.data().totalOrders) || 0) : 0;
  } catch {
    return 0;
  }
}
