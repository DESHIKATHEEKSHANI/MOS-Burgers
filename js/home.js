import { burgerData } from './data.js';

function saveBurgerData() {
  const existingData = localStorage.getItem("burgerData");
  if (!existingData) {
    localStorage.setItem("burgerData", JSON.stringify(burgerData));
  }
}

function loadBurgerData() {
  const data = localStorage.getItem("burgerData");
  return data ? JSON.parse(data) : burgerData;
}

const cart = [];
const customers = loadFromLocalStorage("customers");
const orders = loadFromLocalStorage("orders");
const burgerDataFromLocalStorage = loadBurgerData();

const burgerCategories = document.getElementById("burgerCategories");
const cartContainer = document.getElementById("cartItems");
const subtotalElement = document.getElementById("subtotal");
const discountElement = document.getElementById("discount");
const totalElement = document.getElementById("total");
const discountCodeInput = document.getElementById("discountCode");
const customerSelect = document.getElementById("customerSelect");
const addCustomerBtn = document.getElementById("addCustomer");

const discountCodes = { DISCOUNT10: 0.10, DISCOUNT20: 0.20 };

function saveToLocalStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function loadFromLocalStorage(key) {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

function updateCustomerDropdown() {
  customerSelect.innerHTML = '<option value="">Select Customer</option>';
  customers.forEach(customer => {
    customerSelect.innerHTML += `<option>${customer.name}</option>`;
  });
}

function renderCategories() {
  burgerCategories.innerHTML = '';
  burgerDataFromLocalStorage.categories.forEach((category, index) => {
    const items = category.items.map(item => `
      <div class="col-6 mb-3">
        <div class="card shadow-sm">
          <img src="${item.image}" class="card-img-top" alt="${item.name}">
          <div class="card-body text-center">
            <h5>${item.name}</h5>
            <p>Rs. ${item.price}</p>
            <button class=" add-to-cart" data-name="${item.name}" data-price="${item.price}">Add to Cart</button>
          </div>
        </div>
      </div>
    `).join('');

    burgerCategories.innerHTML += `
      <div class="accordion-item">
        <h2 class="accordion-header" id="heading${index}">
          <button class="accordion-button" data-bs-toggle="collapse" data-bs-target="#collapse${index}">${category.name}</button>
        </h2>
        <div id="collapse${index}" class="accordion-collapse collapse">
          <div class="accordion-body row">${items}</div>
        </div>
      </div>`;
  });
}

function updateCart() {
  cartContainer.innerHTML = '';
  let subtotal = 0;

  cart.forEach(item => {
    subtotal += item.price * item.quantity;
    cartContainer.innerHTML += `
      <li class="list-group-item d-flex justify-content-between">
        ${item.name} x ${item.quantity} <span>Rs ${item.price * item.quantity}</span>
      </li>`;
  });

  const discountCode = discountCodeInput.value.trim().toUpperCase();
  const discountRate = discountCodes[discountCode] || 0;

  const discount = subtotal * discountRate;
  const total = subtotal - discount;

  discountElement.innerText = discount.toFixed(2);
  subtotalElement.innerText = subtotal.toFixed(2);
  totalElement.innerText = total.toFixed(2);
}

burgerCategories.addEventListener("click", e => {
  if (e.target.classList.contains("add-to-cart")) {
    const name = e.target.dataset.name;
    const price = parseFloat(e.target.dataset.price);
    const existingItem = cart.find(item => item.name === name);
    existingItem ? existingItem.quantity++ : cart.push({ name, price, quantity: 1 });
    updateCart();
  }
});

discountCodeInput.addEventListener("input", updateCart);

document.getElementById("addCustomerToggle").addEventListener("click", () => {
  const fields = document.getElementById("addCustomerFields");
  fields.style.display = fields.style.display === "none" ? "block" : "none";
});

addCustomerBtn.addEventListener("click", () => {
  const nameInput = document.getElementById("newCustomerName");
  const contactInput = document.getElementById("newCustomerContact");

  const name = nameInput.value.trim();
  const contact = contactInput.value.trim();

  if (!name || !contact) return alert("Please enter name and contact.");

  const newCustomer = { name, contact };
  customers.push(newCustomer);

  saveToLocalStorage("customers", customers);

  updateCustomerDropdown();

  Swal.fire({
    title: "Customer Added!",
    icon: "success",
    draggable: true
  });

  nameInput.value = "";
  contactInput.value = "";

  document.getElementById("addCustomerFields").style.display = "none";
});

document.getElementById("placeOrder").addEventListener("click", () => {
  if (cart.length === 0) return Swal.fire({
    icon: "error",
    title: "Oops...",
    text: "Cart is Empty!",
  });

  const customerName = customerSelect.value || "Unknown";
  const customerContact = customers.find(c => c.name === customerName)?.contact || "N/A";

  const subtotal = parseFloat(subtotalElement.innerText);
  const discount = parseFloat(discountElement.innerText);
  const total = parseFloat(totalElement.innerText);

  const now = new Date();
  const orderDateTime = now.toLocaleString("en-GB");

  const newOrder = {
    customer: { name: customerName, contact: customerContact },
    items: [...cart],
    subtotal: subtotal,
    discount: discount,
    total: total,
    dateTime: orderDateTime
  };

  orders.push(newOrder);

  saveToLocalStorage("orders", orders);

  document.getElementById("summaryCustomerName").innerText = customerName;
  document.getElementById("summaryCustomerContact").innerText = customerContact;
  document.getElementById("orderDetails").innerHTML = cart.map(item => `
    <p>${item.name} x ${item.quantity} = Rs ${item.price * item.quantity}</p>`).join('');
  document.getElementById("finalSubtotal").innerText = subtotal.toFixed(2);
  document.getElementById("finalDiscount").innerText = discount.toFixed(2);
  document.getElementById("finalTotal").innerText = total.toFixed(2);

  console.log("Orders Array:", orders);

  Swal.fire({
    title: "ORDER PLACED!",
    imageUrl: "Images/icon.png",
    imageWidth: 400,
    imageHeight: 200,
    imageAlt: "Custom image"
  });

  const modal = new bootstrap.Modal(document.getElementById("orderSummaryModal"));
  modal.show();

  cart.length = 0;
  updateCart();
  customerSelect.value = "";
  discountCodeInput.value = "";
});

window.openAdvancedBill = function openAdvancedBill() {
  document.getElementById("billCustomerName").innerText = document.getElementById("summaryCustomerName").innerText;
  document.getElementById("billCustomerContact").innerText = document.getElementById("summaryCustomerContact").innerText;
  document.getElementById("billOrderDetails").innerHTML = document.getElementById("orderDetails").innerHTML;
  document.getElementById("billSubtotal").innerText = document.getElementById("finalSubtotal").innerText;
  document.getElementById("billDiscount").innerText = document.getElementById("finalDiscount").innerText;
  document.getElementById("billTotal").innerText = document.getElementById("finalTotal").innerText;

  const modal = new bootstrap.Modal(document.getElementById("pdfBillModal"));
  modal.show();
};

function printBill() {
  const billContent = `
    <html>
      <head>
        <title>Print Bill</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            margin: 0;
            color: #333;
          }
          .invoice-container {
            max-width: 600px;
            margin: auto;
            border: 1px solid #ddd;
            padding: 20px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          }
          .logo {
            text-align: center;
            margin-bottom: 20px;
          }
          .logo img {
            max-width: 300px;
          }
          h2 {
            text-align: center;
            margin: 10px 0;
          }
          .details, .totals {
            border-bottom: 1px solid #ddd;
            margin-bottom: 10px;
            padding-bottom: 10px;
          }
          .details p, .totals p {
            margin: 5px 0;
          }
          strong {
            display: inline-block;
            width: 150px;
          }
          .order-items {
            margin: 15px 0;
          }
          .order-items p {
            margin: 5px 0;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 12px;
            color: #777;
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <div class="logo">
            <img src="Images/icon.png" alt="Logo">
          </div>
          <h2>Order Invoice</h2>
          
          <div class="details">
            <p><strong>Customer Name:</strong> ${document.getElementById("billCustomerName").innerText}</p>
            <p><strong>Customer Contact:</strong> ${document.getElementById("billCustomerContact").innerText}</p>
          </div>
          
          <div class="order-items">
            <h4>Order Details:</h4>
            ${document.getElementById("billOrderDetails").innerHTML}
          </div>

          <div class="totals">
            <p><strong>Subtotal:</strong> Rs ${document.getElementById("billSubtotal").innerText}</p>
            <p><strong>Discount:</strong> Rs ${document.getElementById("billDiscount").innerText}</p>
            <p><strong>Total:</strong> Rs ${document.getElementById("billTotal").innerText}</p>
          </div>

          <div class="footer">
            <p>Thank you for ordering from <strong>MOS BURGERS</strong>!<br>We hope to see you again soon.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const printWindow = window.open('', '_blank', 'width=800,height=600');
  printWindow.document.write(billContent);
  printWindow.document.close();

  printWindow.onload = function () {
    printWindow.print();
    printWindow.close();
  };
}

window.printBill = printBill;

saveBurgerData();
renderCategories();
updateCustomerDropdown();
updateCart();
