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
var db = firebase.database();


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
  let inputs = document.querySelectorAll(".pin-input");
  let pin = "";
  inputs.forEach(i => pin += i.value);
  
  db.ref("settings/pin").once("value").then(snapshot => {
    let savedPin = snapshot.val() || "1234";
    
    if (pin === savedPin) {
      showPage("dashboardPage");
    } else {
      alert("Wrong PIN!");
    }
  });
}



let pinInputs = [];

window.addEventListener("DOMContentLoaded", function() {
  
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
  
  db.ref("settings/pin").once("value").then(snapshot => {
    let savedPin = snapshot.val() || "1234";
    
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
  
  db.ref("settings/pin").once("value").then(snapshot => {
    let savedPin = snapshot.val() || "1234";
    
    if (oldPin !== savedPin) {
      alert("Old PIN incorrect");
      return;
    }
    
    if (newPin !== confirmPin) {
      alert("PIN not matched");
      return;
    }
    
    db.ref("settings/pin").set(newPin);
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
document.getElementById("invoiceAddBtn").addEventListener("click", function() {
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
  tbody.innerHTML = "";
  
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


function openInvoiceDirect() {
  showPage('invoicePage');
}


/********************************
 ITEM SEARCH SYSTEM
*********************************/
const searchInput = document.getElementById("invoiceSearch");
const searchResult = document.getElementById("invoiceSearchResult");

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
    
    let invoices = JSON.parse(localStorage.getItem("invoices")) || [];
    invoices.push(invoiceData);
    localStorage.setItem("invoices", JSON.stringify(invoices));
    
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
  
  db.ref("orders").on("value", snapshot => {
    
    list.innerHTML = "";
    
    snapshot.forEach(child => {
      
      const order = child.val();
      const key = child.key;
      
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
  db.ref("orders/" + orderId).update({
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
  
  firebase.database().ref("items").push({
    name: name,
    price: price
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
  
  db.ref("items/" + selectedItemId).update({
    name: name,
    price: price
  });
  
  clearItemForm();
}
function clearItemForm() {
  document.getElementById("itemName").value = "";
  document.getElementById("itemPrice").value = "";
  selectedItemId = null;
}


function loadItems() {
  
  db.ref("items").on("value", snapshot => {
    
    const data = snapshot.val() || {};
    allItems = [];
    
    Object.keys(data).forEach(key => {
      allItems.push({
        id: key,
        name: data[key].name,
        price: data[key].price
      });
    });
    
    renderItems(allItems);
    
  });
  
}

function renderItems() {
  const list = document.getElementById("itemsList");
  list.innerHTML = "";
  
  allItems.forEach((item, index) => {
    
    list.innerHTML += `
      <div class="item-card" onclick="selectItem('${item.id}', '${item.name}', '${item.price}')">

        <div class="item-left">
          <img src="${item.image || ''}" class="item-img">
          <h4>${item.name}</h4>
          <p>₹${item.price}</p>
        </div>

        <div class="item-right">

          <div class="qty-box">
            <button type="button" onclick="event.stopPropagation(); changeQty(${index}, -1)">−</button>
            <input type="number" id="qty-${index}" value="1" min="1">
            <button type="button" onclick="event.stopPropagation(); changeQty(${index}, 1)">+</button>
          </div>

          <button type="button"
            class="add-cart-btn"
            onclick="event.stopPropagation(); addToCartWithQty(${index})">
            Add
          </button>

         <button type="button"
  class="share-btn"
  onclick="event.stopPropagation(); shareItem(${index})">
  Share
</button>

        </div>

      </div>
    `;
    
  });
}
function selectItem(id, name, price) {
  selectedItemId = id;
  
  document.getElementById("itemName").value = name;
  document.getElementById("itemPrice").value = price;
  
  console.log("Selected ID:", selectedItemId);
  
  // Highlight selected
  document.querySelectorAll(".item-card").forEach(card =>
    card.classList.remove("active")
  );
  
  event.currentTarget.classList.add("active");
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

  
  console.log("Cart:", currentOrder);
  renderCart();


function toggleAvailability() {
  db.ref("items/" + selectedItem.id + "/available")
    .set(document.getElementById("itemAvailableToggle").checked);
}

function deleteCurrentItem() {
  db.ref("items/" + selectedItem.id).remove();
  showPage("itemsPage");
}

function updateItem() {
  if (!selectedItem) return;
  db.ref("items/" + selectedItem.id).update({
    name: document.getElementById("productName").value,
    price: document.getElementById("productPrice").value
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
  
  db.ref("clients/" + phone).set({
    name,
    phone,
    due: 0
  });
  
  document.getElementById("clientName").value = "";
  document.getElementById("clientPhone").value = "";
}

function loadClients() {
  db.ref("clients").on("value", snapshot => {
    let list = document.getElementById("clientsList");
    list.innerHTML = "";
    
    snapshot.forEach(child => {
      let c = child.val();
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
  
  db.ref("clients/" + phone).once("value").then(snapshot => {
    if (!snapshot.exists()) {
      document.getElementById("dueResult").innerText = "Client not found";
      return;
    }
    let data = snapshot.val();
    document.getElementById("dueResult").innerText =
      "Due: ₹" + (data.due || 0);
  });
}

function loadDueList() {
  db.ref("clients").on("value", snapshot => {
    let list = document.getElementById("dueList");
    list.innerHTML = "";
    
    snapshot.forEach(child => {
      let c = child.val();
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
  
  db.ref("inventory/" + product).transaction(current => {
    return (current || 0) + qty;
  });
}

function loadInventory() {
  db.ref("inventory").on("value", snapshot => {
    let list = document.getElementById("inventoryList");
    list.innerHTML = "";
    
    let total = 0;
    let low = 0;
    
    snapshot.forEach(child => {
      total++;
      if (child.val() < 5) low++;
      
      list.innerHTML += `<div class="card">${child.key} - ${child.val()}</div>`;
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

    db.ref("records").on("value", snapshot => {
        recordList.innerHTML = "";
        let totalSales = 0;
        let count = 0;

        snapshot.forEach(child => {
            const data = child.val();
            totalSales += data.total || 0;
            count++;

            const div = document.createElement("div");
            div.className = "card";
            div.style.marginBottom = "10px";
            div.innerHTML = `
                <strong>${data.invoiceNo}</strong><br>
                Client: ${data.clientPhone}<br>
                Total: ₹${data.total}<br>
                <small>${data.date}</small>
            `;
            recordList.appendChild(div);
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
document.addEventListener("DOMContentLoaded", function() {
    const addBtn = document.getElementById("addBtn");
    const editBtn = document.getElementById("editBtn");

    if (addBtn) {
        // Purana alert wala code hatakar ye likhein
        addBtn.onclick = function() {
            const name = document.getElementById("itemName").value.trim();
            const price = document.getElementById("itemPrice").value.trim();
            if (!name || !price) return alert("Fill all fields");

            db.ref("items").push({
                name: name,
                price: price,
                available: true // Default available rakhein
            });
            document.getElementById("itemName").value = "";
            document.getElementById("itemPrice").value = "";
        };
    }
    
    if (editBtn) {
        editBtn.onclick = editItem; 
    }
});
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
  cart.splice(index, 1);
  renderCart();
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
  
  const phoneNumber = "91XXXXXXXXXX"; // apna number daalo
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
  
  db.ref("orders/" + orderId).once("value").then(snapshot => {
    
    const order = snapshot.val();
    
    if (!order) return;
    
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
async function generateInvoiceNumber() {
  const counterRef = firebase.database().ref("invoiceCounter");
  
  const snapshot = await counterRef.get();
  
  let currentNumber = 1;
  
  if (snapshot.exists()) {
    currentNumber = snapshot.val();
  }
  
  const newNumber = currentNumber + 1;
  
  await counterRef.set(newNumber);
  
  return "SB-" + String(currentNumber).padStart(4, "0");
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
    
    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
    
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