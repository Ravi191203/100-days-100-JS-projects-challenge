document.addEventListener("DOMContentLoaded", () => {
  // Select key elements
  const itemContainer = document.getElementById("itemContainer");
  const addItemButton = document.getElementById("addItem");
  const generateBillButton = document.getElementById("generateBill");
  const billPreview = document.getElementById("billPreview");
  const businessNameInput = document.getElementById("businessName");
  const invoiceNumberInput = document.getElementById("invoiceNumber");
  const discountRateInput = document.getElementById("discountRate");
  const taxRateInput = document.getElementById("taxRate");

  // Function to generate unique invoice number
  function generateInvoiceNumber() {
      const prefix = "INV-2024-";
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      return `${prefix}${randomNum}`;
  }

  // Set initial invoice number
  invoiceNumberInput.value = generateInvoiceNumber();

  // Add Item Row Functionality
  addItemButton.addEventListener("click", () => {
      const newRow = document.createElement("div");
      newRow.classList.add("row", "item-row", "mb-2", "p-2");
      newRow.innerHTML = `
          <div class="col-md-5">
              <input type="text" class="form-control" placeholder="Item Name" required>
          </div>
          <div class="col-md-3">
              <input type="number" class="form-control" placeholder="Price" min="0" step="0.01" required>
          </div>
          <div class="col-md-3">
              <input type="number" class="form-control" placeholder="Quantity" min="1" value="1" required>
          </div>
          <div class="col-md-1">
              <button type="button" class="btn btn-danger btn-sm removeItem">
                  <i class="bi bi-trash"></i>
              </button>
          </div>
      `;

      // Add remove functionality to new row
      const removeButton = newRow.querySelector('.removeItem');
      removeButton.addEventListener('click', () => {
          itemContainer.removeChild(newRow);
      });

      // Append new row to container
      itemContainer.appendChild(newRow);
  });

  // Generate Bill Functionality
  generateBillButton.addEventListener("click", () => {
      // Collect Item Data
      const itemRows = itemContainer.querySelectorAll('.item-row');
      const items = [];

      itemRows.forEach(row => {
          const itemName = row.querySelector('input[placeholder="Item Name"]').value;
          const price = parseFloat(row.querySelector('input[placeholder="Price"]').value);
          const quantity = parseInt(row.querySelector('input[placeholder="Quantity"]').value);

          if (itemName && price && quantity) {
              items.push({ itemName, price, quantity });
          }
      });

      // Calculate Bill Details
      const businessName = businessNameInput.value || 'Business Name';
      const invoiceNumber = invoiceNumberInput.value;
      const discountRate = parseFloat(discountRateInput.value) || 0;
      const taxRate = parseFloat(taxRateInput.value) || 0;

      // Perform calculations
      const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const discountAmount = (subtotal * discountRate) / 100;
      const taxableAmount = subtotal - discountAmount;
      const taxAmount = (taxableAmount * taxRate) / 100;
      const total = taxableAmount + taxAmount;

      // Generate Bill Preview HTML
      const billHTML = `
          <div class="container">
              <div class="row">
                  <div class="col-12 text-center mb-4">
                      <h2>${businessName}</h2>
                      <p>Invoice: ${invoiceNumber}</p>
                      <p>Date: ${new Date().toLocaleDateString()}</p>
                  </div>
              </div>
              <table class="table table-striped">
                  <thead>
                      <tr>
                          <th>Item</th>
                          <th>Price</th>
                          <th>Quantity</th>
                          <th>Total</th>
                      </tr>
                  </thead>
                  <tbody>
                      ${items.map(item => `
                          <tr>
                              <td>${item.itemName}</td>
                              <td>₹${item.price.toFixed(2)}</td>
                              <td>${item.quantity}</td>
                              <td>₹${(item.price * item.quantity).toFixed(2)}</td>
                          </tr>
                      `).join('')}
                  </tbody>
                  <tfoot>
                      <tr>
                          <th colspan="3">Subtotal</th>
                          <td>₹${subtotal.toFixed(2)}</td>
                      </tr>
                      <tr>
                          <th colspan="3">Discount (${discountRate}%)</th>
                          <td>-₹${discountAmount.toFixed(2)}</td>
                      </tr>
                      <tr>
                          <th colspan="3">Tax (${taxRate}%)</th>
                          <td>+₹${taxAmount.toFixed(2)}</td>
                      </tr>
                      <tr class="table-primary">
                          <th colspan="3">Total</th>
                          <td><strong>₹${total.toFixed(2)}</strong></td>
                      </tr>
                  </tfoot>
              </table>
              <div class="text-center mt-4">
                  <button class="btn btn-success" onclick="window.print()">
                      <i class="bi bi-printer me-2"></i>Print Bill
                  </button>
              </div>
          </div>
      `;

      // Update Bill Preview
      billPreview.innerHTML = billHTML;
  });
});