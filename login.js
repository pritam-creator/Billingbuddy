// ============================
// GLOBAL VARIABLES
const params = new URLSearchParams(window.location.search);
const isPublic = params.get("view") === "public";
// 🔥 GLOBAL CART (Persistent)
if (!window.currentOrder) {
  window.currentOrder = JSON.parse(localStorage.getItem("cartData")) || [];
}
let cart = [];
let invoiceItems = [];
let allItems = JSON.parse(localStorage.getItem("items")) || [];
let selectedItemId = null;
// ============================
// ============================
// FIREBASE CONFIG
// ============================

// ============================
// FIREBASE v8 CONFIG
// ============================

var firebaseConfig = {
  apiKey: "AIzaSyBjETFSgZsMDw1JRI0fIcUNMCMOHxBMaLA",
  authDomain: "billingbuddy-551f9.firebaseapp.com",
  databaseURL: "https://billingbuddy-551f9-default-rtdb.firebaseio.com",
  projectId: "billingbuddy-551f9",
  storageBucket: "billingbuddy-551f9.firebasestorage.app",
  messagingSenderId: "287026017084",
  appId: "1:287026017084:web:aae879570ad706e5a2a439"
};

firebase.initializeApp(firebaseConfig);

// ✅ THIS FIXES YOUR ERROR
// 🔥 FIRESTORE INIT
var db = firebase.firestore();


let currentPage = "loginPage";
let selectedItem = null;

let editingItemId = null;

// ============================
// PAGE NAVIGATION
// ============================

function showPage(pageId) {
  document.querySelectorAll(".page").forEach(page => {
    page.classList.remove("active");
  });
  
  const next = document.getElementById(pageId);
  if (next) {
    next.classList.add("active");
    window.scrollTo(0, 0);
  }
}



// ============================
// PIN SYSTEM
// ============================


function login() {
  
  let pin = "";
  document.querySelectorAll(".pin-input").forEach(i => pin += i.value);
  
  db.collection("settings").doc("pin").get().then(doc => {
    
    let savedPin = doc.exists ? doc.data().value : "1234";
    
    if (pin === savedPin) {
      showPage("dashboardPage");
    } else {
      alert("Wrong PIN!");
    }
    
  });
  
}



let pinInputs = [];

document.addEventListener("DOMContentLoaded", function() {
  
  pinInputs = document.querySelectorAll(".pin-input");
  
  if (pinInputs.length > 0) {
    pinInputs[0].focus();
  }
  
  pinInputs.forEach((input, index) => {
    
    input.addEventListener("input", () => {
      
      input.value = input.value.replace(/[^0-9]/g, "");
      
      if (input.value && index < pinInputs.length - 1) {
        pinInputs[index + 1].focus();
      }
      
      // Auto submit when 4 digits entered
      let pin = "";
      pinInputs.forEach(i => pin += i.value);
      
      if (pin.length === 4) {
        submitPin();
      }
      
    });
    
    input.addEventListener("keydown", (e) => {
      
      if (e.key === "Backspace" && !input.value && index > 0) {
        pinInputs[index - 1].focus();
      }
      
      if (e.key === "Escape") {
        clearPin();
      }
      
    });
    
  });
  
});


function submitPin() {
  let pin = "";
  pinInputs.forEach(input => {
    pin += input.value;
  });
  
 db.collection("settings").doc("pin").get().then(doc => {
      let savedPin = doc.exists ? doc.data().value : "1234";
    
    if (pin === savedPin) {
      showPage("dashboardPage"); // 🔥 PAGE CHANGE HERE
      clearPin();
    } else {
      alert("Wrong PIN");
      clearPin();
    }
  });
}

function clearPin() {
  pinInputs.forEach(input => input.value = "");
  pinInputs[0].focus();
}

function resetPin() {
  
  let oldPin = document.getElementById("oldPin").value;
  let newPin = document.getElementById("newPin").value;
  let confirmPin = document.getElementById("confirmPin").value;
  
  db.collection("settings").doc("pin").get().then(doc => {
    
    let savedPin = doc.exists ? doc.data().value : "1234";
    
    if (oldPin !== savedPin) return alert("Old PIN incorrect");
    if (newPin !== confirmPin) return alert("PIN not matched");
    
    db.collection("settings").doc("pin").set({ value: newPin });
    
    alert("PIN Updated!");
    showPage("loginPage");
  });
}

function openInvoiceDirect() {
  showPage('invoicePage');
}
// ============================
// INVOICE SYSTEM
// ============================
// ============================
// OPEN CART PAGE
// ============================

function openCartPage() {
  showPage("cartPage");
  setTimeout(() => {
    renderCart();
  }, 50);
}

/********************************
 GLOBAL DATA
*********************************/
let currentInvoiceItems = [];
let savedItems = [
  { name: "Rice", price: 50 },
  { name: "Sugar", price: 40 },
  { name: "Oil", price: 120 },
  { name: "Milk", price: 30 }
];

/********************************
 CLIENT SELECT PRINT UPDATE
*********************************/


/********************************
 MANUAL ADD ITEM
*********************************/
const invoiceAddBtn = document.getElementById("invoiceAddBtn");

if (invoiceAddBtn) {
  invoiceAddBtn.addEventListener("click", function() {
    const name = document.getElementById("invoiceItemName").value.trim();
    const qty = parseFloat(document.getElementById("invoiceItemQty").value);
    const price = parseFloat(document.getElementById("invoiceItemPrice").value);
    
    if (!name || qty <= 0 || price <= 0) {
      alert("Enter valid item details");
      return;
    }
    
    addItemToInvoice(name, qty, price);
    
    document.getElementById("invoiceItemName").value = "";
    document.getElementById("invoiceItemQty").value = "";
    document.getElementById("invoiceItemPrice").value = "";
  });
}
  


/********************************
 ADD ITEM FUNCTION
*********************************/
function addItemToInvoice(name, qty, price) {
  const amount = qty * price;
  
  currentInvoiceItems.push({ name, qty, price, amount });
  
  renderInvoiceItems();
  calculateTotals();
}

/********************************
 RENDER ITEMS TABLE
*********************************/
function renderInvoiceItems() {
  const tbody = document.getElementById("invoiceItems");
  if (!tbody) return;
  
  tbody.innerHTML = ""; // 🔥 IMPORTANT FIX
  
  currentInvoiceItems.forEach((item, index) => {
    const row = `
      <tr>
        <td>${item.name}</td>
        <td>${item.qty}</td>
        <td>₹${item.price}</td>
        <td>₹${item.amount}</td>
        <td>
          <button class="delete-btn" onclick="deleteItem(${index})">
            🗑️
          </button>
        </td>
      </tr>
    `;
    tbody.innerHTML += row;
  });
}
function deleteItem(index) {
  currentInvoiceItems.splice(index, 1);
  renderInvoiceItems();
  calculateTotals();
}
/********************************
 GST + TOTAL CALCULATION
*********************************/
function calculateTotals() {
  let subtotal = 0;
  
  currentInvoiceItems.forEach(item => {
    subtotal += item.amount;
  });
  
  document.getElementById("subTotal").textContent = subtotal.toFixed(2);
  document.getElementById("grandTotal").textContent = subtotal.toFixed(2);
}





/********************************
 ITEM SEARCH SYSTEM
*********************************/
const searchInput = document.getElementById("invoiceSearch");
const searchResult = document.getElementById("invoiceSearchResult");

if (searchInput && searchResult) {
  searchInput.addEventListener("input", function() {
    const value = this.value.toLowerCase();
    searchResult.innerHTML = "";
    
    if (!value) return;
    
    const filtered = savedItems.filter(item =>
      item.name.toLowerCase().includes(value)
    );
    
    filtered.forEach(item => {
      const div = document.createElement("div");
      div.textContent = item.name + " - ₹" + item.price;
      div.style.cursor = "pointer";
      
      div.onclick = function() {
        addItemToInvoice(item.name, 1, item.price);
        searchResult.innerHTML = "";
        searchInput.value = "";
      };
      
      searchResult.appendChild(div);
    });
  });
}

/********************************
  SAFE INVOICE CONTROLS
*********************************/

document.addEventListener("DOMContentLoaded", function() {
  
  /* =========================
     CLIENT SELECT SAFE
  ========================= */
  
  const invoiceClient = document.getElementById("invoiceClient");
  const clientNamePrint = document.getElementById("clientNamePrint");
  const clientAddressPrint = document.getElementById("clientAddressPrint");
  
  if (invoiceClient && clientNamePrint) {
    invoiceClient.addEventListener("change", function() {
      const selectedText =
        this.options[this.selectedIndex]?.text || "";
      clientNamePrint.textContent = selectedText;
      if (clientAddressPrint) {
        clientAddressPrint.textContent = "Client Address Here";
      }
    });
  }
  
  /* =========================
     SAVE BUTTON
  ========================= */
  
  const saveBtn = document.getElementById("saveBtn");
  
  if (saveBtn) {
  saveBtn.addEventListener("click", async function() {
  
  try {
    
    // 🔥 AUTO INVOICE NUMBER
    const invoiceNo = await generateInvoiceNumber();
    document.getElementById("invoiceNumber").innerText = invoiceNo;
    
    const invoiceData = {
      invoiceNo: invoiceNo, // 🔥 Important
      customerName: document.getElementById("invoiceCustomerName").value,
      customerAddress: document.getElementById("invoiceCustomerAddress").value,
      items: currentInvoiceItems,
      subtotal: document.getElementById("subTotal").textContent,
      total: document.getElementById("grandTotal").textContent,
      date: new Date().toLocaleString()
    };
    
  await db.collection("invoices")
  .doc(invoiceNo)
  .set(invoiceData);
    
    alert("Invoice Saved Successfully ✅");
    
  } catch (error) {
    console.log(error);
    alert("Save Failed ⚠️");
  }
  
});
  }
  
  /* =========================
     PRINT BUTTON
  ========================= */
  
  // login.js mein printBtn wala section replace karein
const printBtn = document.getElementById("printBtn");

if (printBtn) {
  printBtn.addEventListener("click", function() {
    window.print();
  });
}

  
  /* =========================
     SHARE BUTTON
  ========================= */
  
  const shareBtn = document.getElementById("shareBtn");
  
  if (shareBtn) {
    shareBtn.addEventListener("click", function() {
      
      const total =
        document.getElementById("grandTotal")?.textContent || "0";
      
      if (navigator.share) {
        navigator.share({
          title: "Invoice",
          text: "Total Amount: ₹" + total
        });
      } else {
        alert("Sharing not supported in this browser");
      }
      
    });
  }
  
  /* =========================
     CLEAR BUTTON
  ========================= */
  
  const clearBtn = document.getElementById("clearBtn");
  
  if (clearBtn) {
    clearBtn.addEventListener("click", function() {
      
      if (!confirm("Clear this invoice?")) return;
      
      currentInvoiceItems = [];
      
      if (typeof renderInvoiceItems === "function") {
        renderInvoiceItems();
      }
      
      if (typeof calculateTotals === "function") {
        calculateTotals();
      }
      
    });
  }
  
});

function loadOrders() {
  
  const list = document.getElementById("ordersList");
  const sound = document.getElementById("orderSound");
  
 db.collection("orders").onSnapshot(snapshot => {
      
      list.innerHTML = "";
      
      snapshot.forEach(doc => {
            const order = doc.data();
            const key = doc.id;
      
      list.innerHTML += `
        <div class="card" style="margin-bottom:10px;">
          <strong>${order.customerName}</strong><br>
          📱 ${order.customerMobile}<br>
          💰 ₹${order.total}<br>
          🕒 ${order.createdAt}<br>
          📦 Status: ${order.status || "Pending"}<br><br>

          <button onclick="updateOrderStatus('${key}','Accepted')" 
            style="background:green;color:white;">Accept</button>

          <button onclick="updateOrderStatus('${key}','Rejected')" 
            style="background:red;color:white;">Reject</button>

          <button onclick="openOrderInvoice('${key}')">
            Generate Invoice
          </button>
        </div>
      `;
      
      // 🔔 Play sound if new order
      if (order.status === "Pending") {
        sound.play().catch(() => {});
      }
      
    });
    
  });
}

function updateOrderStatus(orderId, status) {
 db.collection("orders").doc(orderId).update({
  status: status
});
}





// ============================
// ITEMS CRUD
// ============================
function filterItems() {
  const searchValue = document
    .getElementById("searchInput")
    .value
    .toLowerCase()
    .trim();
  
  const items = document.querySelectorAll("#itemsList .item-card");
  
  items.forEach(item => {
    const text = item.textContent.toLowerCase();
    
    if (text.includes(searchValue)) {
      item.style.display = "flex"; // important
    } else {
      item.style.display = "none";
    }
  });
}
document.getElementById("addBtn").addEventListener("click", function() {
  
  const name = document.getElementById("itemName").value.trim();
  const price = document.getElementById("itemPrice").value.trim();
  
  if (!name || !price) {
    alert("Fill all fields");
    return;
  }
  
  db.collection("items").add({
  name: name,
  price: parseFloat(price),
  available: true
});
  
  // inputs clear
  document.getElementById("itemName").value = "";
  document.getElementById("itemPrice").value = "";
});

function editItem() {
  console.log("Edit clicked");
  if (!selectedItemId) {
    alert("Select item first");
    return;
  }
  
  const name = document.getElementById("itemName").value.trim();
  const price = document.getElementById("itemPrice").value.trim();
  
  if (!name || !price || isNaN(price)) {
    alert("Enter valid item name and price");
    return;
  }
  
db.collection("items").doc(selectedItemId).update({
  name: name,
  price: parseFloat(price)
});
  
  clearItemForm();
}
function clearItemForm() {
  document.getElementById("itemName").value = "";
  document.getElementById("itemPrice").value = "";
  selectedItemId = null;
}


function loadItems() {
  
  db.collection("items").onSnapshot(snapshot => {
    
    allItems = [];
    
    snapshot.forEach(doc => {
      allItems.push({
        id: doc.id,
        name: doc.data().name,
        price: doc.data().price
      });
    });
    
    renderItems();
  });
  
}

function renderItems() {
const list = document.getElementById("itemsList");
if (!list) return;

list.innerHTML = "";
  
  allItems.forEach((item, index) => {
    
    list.innerHTML += `
     <div class="item-wrapper">
 <div class="delete-bg" onclick="event.stopPropagation(); deleteItemById('${item.id}')">

  <div class="item-card swipe-card"
    data-id="${item.id}"
    onclick="selectItem(event, '${item.id}', '${item.name}', '${item.price}')">

        <div class="pos-card">

    <div class="pos-left">
       <div class="pos-title">${item.name}</div>
<div class="pos-price">₹${item.price}</div>
    </div>

    <div class="pos-right">

        <div class="pos-qty">
            <button class="qty-btn minus">−</button>
            <span class="qty-number">1</span>
            <button class="qty-btn plus">+</button>
        </div>

        <button class="icon-btn add-icon">+</button>
      

    </div>

</div>

      </div>
    `;
    enableSwipeDelete();
  });
}
function selectItem(e, id, name, price) {
  selectedItem = { id, name, price };
  
  document.getElementById("itemName").value = name;
  document.getElementById("itemPrice").value = price;
  
  document.querySelectorAll(".item-card")
    .forEach(card => card.classList.remove("active"));
  
  e.currentTarget.classList.add("active");
}

function changeQty(index, change) {
  const input = document.getElementById(`qty-${index}`);
  let value = parseInt(input.value) || 1;
  value += change;
  if (value < 1) value = 1;
  input.value = value;
}




function addToCartWithQty(index) {
  const qty = parseInt(document.getElementById(`qty-${index}`).value) || 1;
  const item = allItems[index];
  
  const existing = window.currentOrder.find(i => i.name === item.name);
  
  if (existing) {
    existing.qty += qty;
  } else {
    window.currentOrder.push({
      name: item.name,
      price: item.price,
      qty: qty
    });
  }
  
  renderCart();
  updateCartBadge();
  showToast(item.name + " added to cart"); // 🔥 IMPORTANT
  localStorage.setItem("cartData", JSON.stringify(window.currentOrder));
}
function showToast(message) {
  let toast = document.getElementById("globalToast");
  
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "globalToast";
    document.body.appendChild(toast);
  }
  
  toast.innerText = message;
  
  toast.style.position = "fixed";
  toast.style.top = "80px";
  toast.style.left = "50%";
  toast.style.transform = "translateX(-50%) translateY(-20px)";
  toast.style.background = "#2ecc71";
  toast.style.color = "white";
  toast.style.padding = "12px 22px";
  toast.style.borderRadius = "30px";
  toast.style.zIndex = "999999";
  toast.style.fontSize = "14px";
  toast.style.boxShadow = "0 8px 25px rgba(0,0,0,0.25)";
  toast.style.opacity = "0";
  toast.style.transition = "all 0.3s ease";
  
  // show animation
  setTimeout(() => {
    toast.style.opacity = "1";
    toast.style.transform = "translateX(-50%) translateY(0)";
  }, 10);
  
  // hide animation
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(-50%) translateY(-20px)";
  }, 1500);
}

function updateCartBadge() {
  const badge = document.getElementById("cartBadge");
  if (!badge) return; // 🔥 ADD THIS
  
  let totalQty = 0;
  
  window.currentOrder.forEach(item => {
    totalQty += item.qty;
  });
  
  if (totalQty > 0) {
    badge.style.display = "inline-block";
    badge.innerText = totalQty;
  } else {
    badge.style.display = "none";
  }
}

function openItemPage(key, item) {
  
  selectedItem = {
    id: key,
    name: item.name,
    price: item.price
  };
  console.log("OPEN ITEM PAGE RUNNING")
  document.getElementById("detailName").innerText = item.name;
  document.getElementById("detailPrice").innerText = "₹" + item.price;
  
  showPage("itemDetailPage"); // 🔥 IMPORTANT
}
function goBack() {
  showPage("itemsPage");
}

  
  console.log("Cart:", window.currentOrder);
  renderCart();


function toggleAvailability() {
  
  if (!selectedItem) return;
  
  db.collection("items")
    .doc(selectedItem.id)
    .update({
      available: document.getElementById("itemAvailableToggle").checked
    });
  
}

function deleteCurrentItem() {
  db.collection("items").doc(selectedItem.id).delete();
  showPage("itemsPage");
}

function updateItem() {
  if (!selectedItem) return;
  db.collection("items").doc(selectedItem.id).update({
    name: document.getElementById("productName").value,
    price: parseFloat(document.getElementById("productPrice").value)
  });
}

// ✅ UPDATED ITEMS LISTENER




// ============================
// CLIENTS
// ============================

function addClient() {
  let name = document.getElementById("clientName").value;
  let phone = document.getElementById("clientPhone").value;
  
  if (!name || !phone) return alert("Fill all fields");
  
  db.collection("clients").doc(phone).set({
    name,
    phone,
    due: 0
  });
  
  document.getElementById("clientName").value = "";
  document.getElementById("clientPhone").value = "";
}

function loadClients() {
  db.collection("clients").onSnapshot(snapshot => {
    
    let list = document.getElementById("clientsList");
    list.innerHTML = "";
    
    snapshot.forEach(doc => {
      const c = doc.data();
      list.innerHTML += `<div class="card">${c.name} - ${c.phone}</div>`;
    });
    
  });
}

function searchClients(value) {
  loadClients();
}

// ============================
// DUE SYSTEM
// ============================

function checkDue() {
  
  let phone = document.getElementById("checkPhone").value;
  
  db.collection("clients").doc(phone).get().then(doc => {
    
    if (!doc.exists) {
      document.getElementById("dueResult").innerText = "Client not found";
      return;
    }
    
    const data = doc.data();
    document.getElementById("dueResult").innerText =
      "Due: ₹" + (data.due || 0);
    
  });
}

function loadDueList() {
  
  db.collection("clients").onSnapshot(snapshot => {
    
    let list = document.getElementById("dueList");
    list.innerHTML = "";
    
    snapshot.forEach(doc => {
      
      const c = doc.data();
      
      if (c.due > 0) {
        list.innerHTML += `<div class="card">${c.name} - ₹${c.due}</div>`;
      }
      
    });
    
  });
}

// ============================
// INVENTORY
// ============================

function updateStock() {
  
  let product = document.getElementById("inventorySelect").value;
  let qty = parseInt(document.getElementById("stockQuantity").value);
  
  if (!product || !qty) return alert("Select product & qty");
  
  const docRef = db.collection("inventory").doc(product);
  
  db.runTransaction(async (transaction) => {
    
    const doc = await transaction.get(docRef);
    
    let current = doc.exists ? doc.data().qty : 0;
    
    transaction.set(docRef, {
      qty: current + qty
    });
    
  });
  
}

function loadInventory() {
  db.collection("inventory").onSnapshot(snapshot => {
    
    let list = document.getElementById("inventoryList");
    list.innerHTML = "";
    
    let total = 0;
    let low = 0;
    
    snapshot.forEach(doc => {
      total++;
      
      const data = doc.data();
      const qty = data.qty || 0;
      
      if (qty < 5) low++;
      
      list.innerHTML += `
        <div class="card">${doc.id} - ${qty}</div>
      `;
    });
    
    document.getElementById("inventoryCount").innerText = total;
    document.getElementById("lowStockCount").innerText = low;
    
  });
}

// ============================
// RECORDS
// ============================

function openRecordPage() {
    showPage("recordPage");
    const recordList = document.getElementById("recordList");
    recordList.innerHTML = "Loading...";

    db.collection("invoices").onSnapshot(snapshot => {
  
  const recordList = document.getElementById("recordList");
  recordList.innerHTML = "";
  
  let totalSales = 0;
  let count = snapshot.size;
  
  snapshot.forEach(doc => {
    
    const data = doc.data();
    totalSales += parseFloat(data.total) || 0;
    
    recordList.innerHTML += `
          <div class="card" style="margin-bottom:10px;">
            <strong>${data.invoiceNo}</strong><br>
            Client: ${data.customerName}<br>
            Total: ₹${data.total}<br>
            <small>${data.date}</small>
          </div>
        `;
  });
  
  document.getElementById("totalInvoices").innerText = "Invoices: " + count;
  document.getElementById("totalSales").innerText = "Total Sales: ₹" + totalSales.toFixed(2);
  
});
}


function filterRecords() {
  // Basic placeholder
}

// ============================
// STARTUP LOAD
// ============================

window.onload = function() {
  
  loadItems();
  loadClients();
  loadDueList();
  loadInventory();
  loadOrders();
  
  // ✅ PUBLIC MODE CHECK
  if (isPublic) {
    
    showPage("itemsPage"); // 🔥 LOGIN SKIP
    
    // Bottom buttons hide
    document.querySelectorAll("#addBtn, #editBtn")
      .forEach(btn => btn.style.display = "none");
    
  } else {
    
    showPage("loginPage"); // Normal visit
    
  }
  
};

// Items Page ke Buttons ko connect karne ke liye


function addItemToOrder() {
    if (!selectedItem) return;
    
    // Invoice page par bhej kar item name auto-fill kar dega
    showPage("invoicePage");
    document.getElementById("invoiceItemSearch").value = selectedItem.name;
    document.getElementById("invoiceQty").focus();
    alert(selectedItem.name + " selected! Now enter quantity.");
}


function logoutUser() {
  firebase.auth().signOut().then(() => {
    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
    document.getElementById("loginPage").classList.add("active");
  });
}
// ============================
// CART RENDER SYSTEM
// ============================

function renderCart() {
  
  const cartItems = document.getElementById("cartContainer");
  const totalBox = document.getElementById("cartTotal");
  
  if (!cartItems || !totalBox) return;
  
  cartItems.innerHTML = "";
  
  if (window.currentOrder.length === 0) {
    cartItems.innerHTML = "<p style='text-align:center'>Cart is empty</p>";
    totalBox.innerText = "Total: ₹ 0.00";
    return;
  }
  
  let total = 0;
  
  window.currentOrder.forEach(item => {
    
    total += item.price * item.qty;
    
    cartItems.innerHTML += `
      <div class="cart-card">
        <h3>${item.name}</h3>
        <p class="price">₹${item.price}</p>

        <div class="cart-qty-box">
          <button onclick="changeCartQty('${item.name}', -1)">−</button>
          <span class="qty-number">${item.qty}</span>
          <button onclick="changeCartQty('${item.name}', 1)">+</button>
        </div>

        <p>₹${item.price * item.qty}</p>
      </div>
    `;
  });
  
  totalBox.innerText = "Total: ₹ " + total.toFixed(2);
}

function removeCartItem(index) {
  window.currentOrder.splice(index, 1);
  renderCart();
  updateCartBadge();
  localStorage.setItem("cartData", JSON.stringify(window.currentOrder));
}
// ============================
// PLACE ORDER (CART → INVOICE)
// ============================

function placeOrder() {
  const name = document.querySelector("#cartPage input[type='text']").value;
  const mobile = document.querySelector("#cartPage input[type='tel']").value;
  
  if (!name || !mobile) {
    alert("Please fill name and mobile number");
    return;
  }
  
  let message = `🛒 *New Order*\n\n`;
  message += `👤 Name: ${name}\n`;
  message += `📞 Mobile: ${mobile}\n\n`;
  
  let total = 0;
  
  window.currentOrder.forEach(item => {
    const itemTotal = item.price * item.qty;
    total += itemTotal;
    message += `• ${item.name} (${item.qty}) - ₹${itemTotal}\n`;
  });
  
  message += `\n💰 Total: ₹${total}`;
  
  const phoneNumber = "917085662649"; // apna number daalo
  const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  
  window.open(url, "_blank");
}


function showOrderSuccess(orderId, name, total) {
  
  const successHTML = `
    <div style="
      padding:30px;
      text-align:center;
      animation:fadeIn 0.5s ease-in-out;
    ">
      <h2 style="color:green;">✅ Order Placed Successfully</h2>
      <p>Thank you <strong>${name}</strong> 🙏</p>
      <p>🧾 Order ID: <strong>${orderId}</strong></p>
      <p>💰 Total Amount: <strong>₹${total}</strong></p>
      <br>
      <button onclick="showPage('itemsPage')" 
        style="padding:10px 20px;background:#111;color:#fff;border:none;border-radius:8px;">
        Continue Shopping
      </button>
    </div>
  `;
  
  document.getElementById("cartPage").innerHTML = successHTML;
  
}
  

function updateCustomerPreview() {
  const name = document.getElementById("invoiceCustomerName").value;
  const address = document.getElementById("invoiceCustomerAddress").value;
  
  document.getElementById("clientNamePrint").innerText = name;
  document.getElementById("clientAddressPrint").innerText = address;
}
function openOrderInvoice(orderId) {
  
  db.collection("orders").doc(orderId).get().then(doc => {
    
    if (!doc.exists) return;
    
    const order = doc.data();
    
    currentInvoiceItems = [];
    
    order.items.forEach(item => {
      currentInvoiceItems.push({
        name: item.name,
        qty: item.qty,
        price: item.price,
        amount: item.price * item.qty
      });
    });
    
    renderInvoiceItems();
    calculateTotals();
    
    document.getElementById("clientNamePrint").innerText = order.customerName;
    document.getElementById("clientAddressPrint").innerText =
      "Mobile: " + order.customerMobile;
    
    showPage("invoicePage");
    
  
  

    setTimeout(() => {
  printInvoice();
}, 500);
    
  });
  
}
async function generatePDF(orderData) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  
  doc.setFontSize(22);
  doc.text("INVOICE", 80, 20);
  
  doc.setFontSize(12);
  doc.text("Customer Name: " + orderData.name, 20, 40);
  doc.text("Mobile: " + orderData.mobile, 20, 48);
  doc.text("Order ID: " + orderData.id, 20, 56);
  
  let y = 70;
  doc.text("Item", 20, y);
  doc.text("Qty", 100, y);
  doc.text("Price", 120, y);
  doc.text("Total", 160, y);
  
  y += 10;
  
  orderData.items.forEach(item => {
    doc.text(item.name, 20, y);
    doc.text(String(item.qty), 100, y);
    doc.text("₹" + item.price, 120, y);
    doc.text("₹" + (item.qty * item.price), 160, y);
    y += 10;
  });
  
  doc.text("Grand Total: ₹" + orderData.total, 20, y + 10);
  
  doc.save("Invoice_" + orderData.id + ".pdf");
}

function shareFullPage() {
  
  const baseURL = window.location.origin + window.location.pathname;
  const publicURL = baseURL + "?view=public";
  
  const message = `🥖 Surjya Bakery Fresh Items

Check our items 👇
${publicURL}`;
  
  if (navigator.share) {
    navigator.share({
      title: "Surjya Bakery",
      text: message,
      url: publicURL
    });
  } else {
    window.open(
      "https://wa.me/?text=" + encodeURIComponent(message),
      "_blank"
    );
  }
}

// ---- PUBLIC VIEW MODE CHECK ----

function shareItem(index) {
  
  if (!Array.isArray(allItems) || !allItems[index]) {
    alert("Item not found!");
    return;
  }
  
  const item = allItems[index];
  
  const shareText = `🛍️ ${item.name || "Item"}
Price: ₹${item.price || 0}
Check this item 👇
${window.location.href}`;
  
  if (navigator.share) {
    navigator.share({
      title: item.name || "Item",
      text: shareText,
      url: window.location.href
    }).catch(err => console.log("Share error:", err));
  } else if (navigator.clipboard) {
    navigator.clipboard.writeText(shareText)
      .then(() => alert("Item link copied!"))
      .catch(err => console.log(err));
  }
  
}
function shareAllItems() {
  
  let text = "🛍️ Surjya Bakery Items:\n\n";
  
  allItems.forEach(item => {
    if (item && item.name) {
      text += `• ${item.name} - ₹${item.price}\n`;
    }
  });
  
  const shopLink = "https://surjyabakery.vercel.app/#shop";
  
  if (navigator.share) {
    navigator.share({
      title: "Surjya Bakery",
      text: text,
      url: shopLink
    });
  } else {
    navigator.clipboard.writeText(text + "\n" + shopLink);
    alert("Link copied!");
  }
}



function printInvoice() {
  const invoice = document.getElementById("printable-invoice");
  
  if (!invoice) {
    alert("Invoice not found");
    return;
  }
  
  html2canvas(invoice, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff"
  }).then(canvas => {
    
    const imgData = canvas.toDataURL("image/png");
    
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF("p", "mm", "a4");
    
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
   if (imgHeight > pageHeight) {
  pdf.addImage(imgData, "PNG", 0, 0, imgWidth, pageHeight);
} else {
  pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
}

pdf.save("Surjya_Bakery_Invoice.pdf");
  });
}
function sharePage() {
  
  const publicURL = window.location.origin + window.location.pathname + "?view=public";
  
  if (navigator.share) {
    navigator.share({
      title: "Surjya Bakery Items",
      text: "Check our items list 👇",
      url: publicURL
    }).catch(err => console.log(err));
  } else {
    navigator.clipboard.writeText(publicURL)
      .then(() => alert("Page link copied!"));
  }
}

function fallbackShare(text) {
  const whatsappURL =
    "https://wa.me/?text=" + encodeURIComponent(text);
  window.open(whatsappURL, "_blank");
}

// ===== PUBLIC MODE CONTROL =====
window.addEventListener("load", function() {
  
  if (isPublic) {
    
    showPage("itemsPage");
    
    // ❌ Admin buttons hide
    document.querySelectorAll("#editBtn, #addBtn, #addItemSection, #sharePageBtn, #backBtn, #itemName, #itemPrice")
      .forEach(el => {
        if (el) el.style.display = "none";
      });
    
    // ❌ Share button hide (item card wala)
    setTimeout(() => {
      document.querySelectorAll(".share-btn")
        .forEach(btn => btn.style.display = "none");
    }, 300);
    
  }
  
});
function changeCartQty(name, change) {
  
  const item = window.currentOrder.find(i => i.name === name);
  if (!item) return;
  
  item.qty += change;
  
  if (item.qty <= 0) {
    window.currentOrder = window.currentOrder.filter(i => i.name !== name);
  }
  
  renderCart();
  updateCartBadge();
  localStorage.setItem("cartData", JSON.stringify(window.currentOrder));
}
// ============================
// AUTO INVOICE NUMBER SYSTEM
// ============================

async function generateInvoiceNumber() {
  
  const counterRef = db.collection("settings").doc("invoiceCounter");
  
  return db.runTransaction(async (transaction) => {
    
    const doc = await transaction.get(counterRef);
    
    let current = 0;
    
    if (doc.exists) {
      current = doc.data().value || 0;
    }
    
    const newNumber = current + 1;
    
    transaction.set(counterRef, { value: newNumber });
    
    return "SB-" + String(newNumber).padStart(4, "0");
    
  });
  
}
function enableSwipeDelete() {
  const cards = document.querySelectorAll(".swipe-card");
  let openedCard = null;
  
  cards.forEach(card => {
    let startX = 0;
    let currentX = 0;
    let isDragging = false;
    const maxSwipe = -90;
    
    card.addEventListener("touchstart", e => {
      startX = e.touches[0].clientX;
      isDragging = true;
      
      if (openedCard && openedCard !== card) {
        openedCard.style.transform = "translateX(0)";
      }
    });
    
    card.addEventListener("touchmove", e => {
      if (!isDragging) return;
      
      currentX = e.touches[0].clientX;
      let diff = currentX - startX;
      
      if (diff < 0) {
        if (diff < maxSwipe) diff = maxSwipe;
        card.style.transform = `translateX(${diff}px)`;
      }
    });
    
    card.addEventListener("touchend", () => {
      isDragging = false;
      let diff = currentX - startX;
      
      if (diff < -60) {
        card.style.transform = `translateX(${maxSwipe}px)`;
        openedCard = card;
      } else {
        card.style.transform = "translateX(0)";
        openedCard = null;
      }
      
      startX = 0;
      currentX = 0;
    });
  });
}
function deleteItemById(id) {
  if (!confirm("Delete this item?")) return;
  
  db.collection("items").doc(id).delete()
    .then(() => {
      showToast("Item Deleted ✅");
    })
    .catch(err => {
      console.log(err);
      alert("Delete failed");
    });
}