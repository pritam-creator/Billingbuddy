import { createInvoice } from "./createInvoice.js";

const itemBody = document.getElementById("itemBody");
const grandTotalEl = document.getElementById("grandTotal");

// ➕ Add Row
function addRow(name = "", qty = 1, price = 0) {
  const row = document.createElement("tr");
  
  row.innerHTML = `
    <td><input class="name" value="${name}"></td>
    <td><input type="number" class="qty" value="${qty}" min="1"></td>
    <td><input type="number" class="price" value="${price}" min="0"></td>
    <td class="total">0</td>
    <td><button class="del">❌</button></td>
  `;
  
  itemBody.appendChild(row);
  calculate();
  
  row.querySelectorAll("input").forEach(inp =>
    inp.addEventListener("input", calculate)
  );
  
  row.querySelector(".del").onclick = () => {
    row.remove();
    calculate();
  };
}

// ➕ Button
document.getElementById("addItem").onclick = () => addRow();

// 🧮 Total Calculation
function calculate() {
  let sum = 0;
  
  document.querySelectorAll("#itemBody tr").forEach(row => {
    const qty = +row.querySelector(".qty").value;
    const price = +row.querySelector(".price").value;
    const total = qty * price;
    
    row.querySelector(".total").innerText = total;
    sum += total;
  });
  
  grandTotalEl.innerText = sum;
}

// Default one row
addRow();

// 💾 Save Invoice
document.getElementById("saveInvoice").onclick = async () => {
  const customer = document.getElementById("customer").value;
  
  if (!customer) {
    alert("Customer name required");
    return;
  }
  
  const items = [];
  document.querySelectorAll("#itemBody tr").forEach(row => {
    items.push({
      name: row.querySelector(".name").value,
      qty: +row.querySelector(".qty").value,
      price: +row.querySelector(".price").value
    });
  });
  
  const id = await createInvoice(customer, items);
  location.href = `invoice.html?id=${id}`;
};