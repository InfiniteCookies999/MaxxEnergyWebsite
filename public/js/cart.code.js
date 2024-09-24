document.addEventListener('DOMContentLoaded', () => {
  loadCartItems();

  const purchaseButton = document.getElementById('purchase-now');
  
  if (purchaseButton) { 
    purchaseButton.addEventListener('click', async () => {
      const cart = JSON.parse(localStorage.getItem('cart')) || [];

      if (cart.length === 0) {
        alert('Your cart is empty. Please add items to your cart before purchasing.');
        return;
      }

      const response = await fetch('/api/store/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ items: cart })
      });

      if (response.ok) {
        alert('Purchase successful! Your items have been updated in the store.');
        localStorage.removeItem('cart'); 
        loadCartItems(); 
      } else {
        alert('Failed to complete the purchase. Please try again. Note, you must be logged in to purchase items.');
      }
    });
  }
});

function loadCartItems() {
  const cartItemsContainer = document.getElementById('cart-items');
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  cartItemsContainer.innerHTML = ''; 
  let totalPrice = 0;
  let totalTax = 0;
  let totalWithTax = 0;

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<tr><td colspan="7" class="text-center">Your cart is empty. Please buy some of our Maxx Energy Products!</td></tr>';
    document.getElementById('total-price').innerHTML = '';
    return;
  }

  for (let i = 0; i < cart.length; i++) {
    const item = cart[i];
    const itemTotal = (item.price / 100) * item.quantity;
    
    let itemTaxRate = 0.043;
    const selectedTaxRate = document.querySelector(`.tax-select[data-item-id="${item.id}"]`);

    if (selectedTaxRate) {
      const selectedValue = selectedTaxRate.value;
      if (selectedValue === "0") {
        itemTaxRate = 0;
      } else if (selectedValue === "0.06") {
        itemTaxRate = 0.06; 
      } else if (selectedValue === "0.043") {
        itemTaxRate = 0.043; 
      }
    }

    const itemTax = itemTotal * itemTaxRate;
    const itemTotalWithTax = itemTotal + itemTax; 
    totalPrice += itemTotal;

    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${item.name}</td>
      <td>${item.description}</td>
      <td>$${(item.price / 100).toFixed(2)}</td>
      <td>
        <select class="form-control quantity-select" data-item-id="${item.id}">
          ${generateQuantityOptions(item.quantity)}
        </select>
      </td>
      <td>$${itemTotal.toFixed(2)}</td>
      <td>
        <select class="form-control tax-select" data-item-id="${item.id}">
          <option value="0">DE: 0%</option>
          <option value="0.043" selected>VA: 4.3%</option>
          <option value="0.06">MD, WV, KY, PA: 6%</option>
        </select>
      </td>
      <td class="total-with-tax" data-item-id="${item.id}">$${itemTotalWithTax.toFixed(2)}</td>
      <td><button class="btn btn-danger btn-sm btn-remove" data-item-id="${item.id}">Remove</button></td>
    `;

    cartItemsContainer.appendChild(row);

    row.querySelector('.quantity-select').addEventListener('change', (event) => {
      updateQuantity(item.id, parseInt(event.target.value));
    });

    row.querySelector('.tax-select').addEventListener('change', (event) => {
      updateTax(item.id, parseFloat(event.target.value));
    });

    row.querySelector('.btn-remove').addEventListener('click', () => {
      removeFromCart(item.id);
    });
  }

  totalTax = totalPrice * 0.043;
  totalWithTax = totalPrice + totalTax;

  document.getElementById('total-price').innerHTML = `Total: $${totalWithTax.toFixed(2)}`;
}

function updateTax(itemID, newTaxRate) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  const itemIndex = cart.findIndex(item => item.id === itemID);

  if (itemIndex !== -1) {
    const item = cart[itemIndex];
    const itemTotal = (item.price / 100) * item.quantity;
    
    let newTaxAmount;
    if (newTaxRate === 0) {
      newTaxAmount = 0;
    } else if (newTaxRate === 0.06) {
      newTaxAmount = itemTotal * 0.06;
    } else if (newTaxRate === 0.043) {
      newTaxAmount = itemTotal * 0.043;
    }

    const newTotalWithTax = itemTotal + newTaxAmount;
    document.querySelector(`.total-with-tax[data-item-id="${itemID}"]`).textContent = `$${newTotalWithTax.toFixed(2)}`;
    updateTotalPrice();
  }
}

function updateTotalPrice() {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  let totalPrice = 0;
  let totalTax = 0;
  let totalWithTax = 0;

  for (let i = 0; i < cart.length; i++) {
    const item = cart[i];
    const itemTotal = (item.price / 100) * item.quantity;
    const itemTaxRate = parseFloat(document.querySelector(`.tax-select[data-item-id="${item.id}"]`).value);
    
    let itemTax;
    if (itemTaxRate === 0) {
      itemTax = 0;
    } else if (itemTaxRate === 0.06) {
      itemTax = itemTotal * 0.06;
    } else if (itemTaxRate === 0.043) {
      itemTax = itemTotal * 0.043;
    }

    totalPrice += itemTotal;
    totalTax += itemTax;
  }

  totalWithTax = totalPrice + totalTax;
  document.getElementById('total-price').innerHTML = `Total: $${totalWithTax.toFixed(2)}`;
}

function generateQuantityOptions(selectedQuantity) {
  let options = '';
  for (let i = 1; i <= 10; i++) {
    options += `<option value="${i}" ${i === selectedQuantity ? 'selected' : ''}>${i}</option>`;
  }
  return options;
}

function updateQuantity(itemID, newQuantity) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  const itemIndex = cart.findIndex(item => item.id === itemID);

  if (itemIndex !== -1) {
    cart[itemIndex].quantity = newQuantity;
    localStorage.setItem('cart', JSON.stringify(cart));
    loadCartItems();
  }
}

function removeFromCart(itemID) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  cart = cart.filter(item => item.id !== itemID);
  localStorage.setItem('cart', JSON.stringify(cart));
  loadCartItems();
}
