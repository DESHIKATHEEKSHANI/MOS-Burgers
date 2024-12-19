const burgerData = loadFromLocalStorage("burgerData") || { categories: [] };
const customers = loadFromLocalStorage("customers") || [];
const orders = loadFromLocalStorage("orders") || [];

function saveToLocalStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function loadFromLocalStorage(key) {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

function initializeManagementPage() {
  renderItemsTable();
  renderCustomersTable();
  renderOrdersTable();


  document.getElementById("addCustomerBtn").addEventListener("click", addCustomer);
  document.getElementById("searchItems").addEventListener("input", () => searchTable("itemsTable", "searchItems"));
  document.getElementById("searchCustomers").addEventListener("input", () => searchTable("customersTable", "searchCustomers"));
  document.getElementById("searchOrders").addEventListener("input", () => searchTable("ordersTable", "searchOrders"));
}

function renderItemsTable() {
  const tbody = document.querySelector("#itemsTable tbody");
  tbody.innerHTML = ""; 
  burgerData.categories.forEach((category) => {
    category.items.forEach((item, index) => {
      tbody.innerHTML += `
        <tr>
          <td>${item.name}</td>
          <td>${item.price}</td>
          <td><img src="${item.image}" alt="${item.name}" width="50"></td>
          <td>${category.name}</td>
          <td>
            <button class="btn btn-warning btn-sm" onclick="editItem(${index}, '${category.name}')">Edit</button>
            <button class="btn btn-danger btn-sm" onclick="deleteItem(${index}, '${category.name}')">Delete</button>
          </td>
        </tr>
      `;
    });
  });
}

function renderCustomersTable() {
  const tbody = document.querySelector("#customersTable tbody");
  tbody.innerHTML = "";
  customers.forEach((customer, index) => {
    tbody.innerHTML += `
      <tr>
        <td>${customer.name}</td>
        <td>${customer.contact}</td>
        <td>
          <button class="btn btn-warning btn-sm" onclick="editCustomer(${index})">Edit</button>
          <button class="btn btn-danger btn-sm" onclick="deleteCustomer(${index})">Delete</button>
        </td>
      </tr>
    `;
  });
}

function renderOrdersTable() {
  const tbody = document.querySelector("#ordersTable tbody");
  tbody.innerHTML = "";
  orders.forEach((order, index) => {
    const itemsDetails = order.items.map(item => `${item.name} (x${item.quantity})`).join(", ");
    const orderDate = order.dateTime ? order.dateTime : "Not Provided"; 
    tbody.innerHTML += `
      <tr>
        <td>${order.customer.name}</td>
        <td>${itemsDetails}</td>
        <td>${order.subtotal}</td>
        <td>${order.discount}</td>
        <td>${order.total}</td>
        <td>${orderDate}</td>
        <td>
          <button class="btn btn-danger btn-sm" onclick="deleteOrder(${index})">Delete</button>
        </td>
      </tr>
    `;
  });
}


document.getElementById("addItemBtn").addEventListener("click", () => {
  document.getElementById("addItemModal").style.display = "block";
});

document.getElementById("cancelItemBtn").addEventListener("click", () => {
  document.getElementById("addItemModal").style.display = "none";
});

document.getElementById("saveItemBtn").addEventListener("click", () => {
  const name = document.getElementById("itemName").value;
  const price = parseFloat(document.getElementById("itemPrice").value);
  const imageFile = document.getElementById("itemImage").files[0];
  const category = document.getElementById("itemCategory").value;

  if (name && price && imageFile && category) {
    const imageUrl =`Images/Burgers/${imageFile.name}`;
    const categoryIndex = burgerData.categories.findIndex(cat => cat.name === category);

    if (categoryIndex > -1) {
      burgerData.categories[categoryIndex].items.push({ name, price, image: imageUrl });

      saveToLocalStorage("burgerData", burgerData);

      renderItemsTable();

      document.getElementById("addItemModal").style.display = "none";
      Swal.fire("Item added!", "", "success");
    } else {
      Swal.fire("Invalid category!", "Please select a valid category.", "error");
    }
  } else {
    Swal.fire("Invalid input!", "Please fill in all fields.", "error");
  }
});

function resetFormFields() {
  document.getElementById("itemName").value = ''; 
  document.getElementById("itemPrice").value = ''; 
  document.getElementById("itemCategory").value = ''; 
  document.getElementById("itemImage").value = ''; 
  document.getElementById("itemImagePreview").src = ''; 
}

window.onclick = function(event) {
  if (event.target == document.getElementById("addItemModal")) {
    document.getElementById("addItemModal").style.display = "none";
  }
};

function addCustomer() {
  document.getElementById("addCustomerModal").style.display = "block";

  document.getElementById("saveCustomerBtn").onclick = function() {
    const name = document.getElementById("customerName").value;
    const contact = document.getElementById("customerContact").value;

    if (name && contact) {
      customers.push({ name, contact });
      saveToLocalStorage("customers", customers);
      renderCustomersTable();
      Swal.fire("Customer added!", "", "success");
      
      document.getElementById("addCustomerModal").style.display = "none";
    } else {
      Swal.fire("Invalid data!", "Please make sure all fields are filled.", "error");
    }
  };

  document.getElementById("cancelCustomerBtn").onclick = function() {
    document.getElementById("addCustomerModal").style.display = "none"; 
  };
}

window.onclick = function(event) {
  if (event.target == document.getElementById("addCustomerModal")) {
    document.getElementById("addCustomerModal").style.display = "none";
  }
};


function editItem(index, categoryName) {
  const category = burgerData.categories.find(cat => cat.name === categoryName);
  const item = category.items[index];

  
  document.getElementById("editItemName").value = item.name;
  document.getElementById("editItemPrice").value = item.price;
  document.getElementById("editItemCategory").value = categoryName;

  document.getElementById("editItemModal").style.display = "block";

  document.getElementById("saveEditedItemBtn").onclick = function() {
    const name = document.getElementById("editItemName").value;
    const price = parseFloat(document.getElementById("editItemPrice").value);
    const category = document.getElementById("editItemCategory").value;
    
    const imageInput = document.getElementById("editItemImage");
    let imageUrl = item.image; 

    if (imageInput.files && imageInput.files[0]) {
      const fileReader = new FileReader();
      fileReader.onload = function(e) {
        imageUrl = e.target.result; 
        updateItemData(name, price, imageUrl, category, index);
      };
      fileReader.readAsDataURL(imageInput.files[0]);
    } else {
      updateItemData(name, price, imageUrl, category, index);
    }
  };

  document.getElementById("cancelEditItemBtn").onclick = function() {
    document.getElementById("editItemModal").style.display = "none"; 
  };
}

function updateItemData(name, price, imageUrl, category, index) {
  if (name && price && imageUrl && category) {
    const categoryIndex = burgerData.categories.findIndex(cat => cat.name === category);
    burgerData.categories[categoryIndex].items[index] = { name, price, image: imageUrl };
    
    saveToLocalStorage("burgerData", burgerData);
    renderItemsTable();
    Swal.fire("Item updated!", "", "success");

    document.getElementById("editItemModal").style.display = "none";
  } else {
    Swal.fire("Invalid data!", "Please make sure all fields are filled.", "error");
  }
}

window.onclick = function(event) {
  if (event.target == document.getElementById("editItemModal")) {
    document.getElementById("editItemModal").style.display = "none";
  }
};


function editCustomer(index) {
  const customer = customers[index];

  document.getElementById("editCustomerName").value = customer.name;
  document.getElementById("editCustomerContact").value = customer.contact;

  document.getElementById("editCustomerModal").style.display = "block";

  document.getElementById("saveEditedCustomerBtn").onclick = function() {
    const name = document.getElementById("editCustomerName").value;
    const contact = document.getElementById("editCustomerContact").value;

    if (name && contact) {
      customers[index] = { name, contact };
      saveToLocalStorage("customers", customers);
      renderCustomersTable();
      Swal.fire("Customer updated!", "", "success");

      document.getElementById("editCustomerModal").style.display = "none";
    } else {
      Swal.fire("Invalid data!", "Please make sure all fields are filled.", "error");
    }
  };

  document.getElementById("cancelEditCustomerBtn").onclick = function() {
    document.getElementById("editCustomerModal").style.display = "none"; 
  };
}

window.onclick = function(event) {
  if (event.target == document.getElementById("editCustomerModal")) {
    document.getElementById("editCustomerModal").style.display = "none";
  }
};


function deleteItem(index, categoryName) {
  const category = burgerData.categories.find(cat => cat.name === categoryName);

  Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!"
  }).then((result) => {
    if (result.isConfirmed) {
      category.items.splice(index, 1);

      saveToLocalStorage("burgerData", burgerData);

      renderItemsTable();

      Swal.fire({
        title: "Deleted!",
        text: "Your item has been deleted.",
        icon: "success"
      });
    }
  });
}

function deleteCustomer(index) {
  Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!"
  }).then((result) => {
    if (result.isConfirmed) {
      customers.splice(index, 1);

      saveToLocalStorage("customers", customers);

      renderCustomersTable();

      Swal.fire({
        title: "Deleted!",
        text: "The customer has been deleted.",
        icon: "success"
      });
    }
  });
}

function deleteOrder(index) {
  Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!"
  }).then((result) => {
    if (result.isConfirmed) {
      orders.splice(index, 1);

      saveToLocalStorage("orders", orders);

      renderOrdersTable();

      Swal.fire({
        title: "Deleted!",
        text: "The order has been deleted.",
        icon: "success"
      });
    }
  });
}


function searchTable(tableId, searchInputId) {
  const input = document.getElementById(searchInputId).value.toLowerCase();
  const rows = document.querySelectorAll(`#${tableId} tbody tr`);
  rows.forEach(row => {
    const text = row.innerText.toLowerCase();
    row.style.display = text.includes(input) ? "" : "none";
  });
}

document.addEventListener("DOMContentLoaded", initializeManagementPage);
