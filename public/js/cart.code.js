function loadCartItems() {
  const cartItemsContainer = document.getElementById('cart-items');
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  cartItemsContainer.innerHTML = ''; 
  let totalPrice = 0;
  const tax = 0.05;
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
    const itemTax = itemTotal * tax; 
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
      <td>$${itemTax.toFixed(2)}</td>
      <td>$${itemTotalWithTax.toFixed(2)}</td>
      <td><button class="btn btn-danger btn-sm btn-remove" data-item-id="${item.id}">Remove</button></td>
    `;

    cartItemsContainer.appendChild(row);

    row.querySelector('.quantity-select').addEventListener('change', (event) => {
      updateQuantity(item.id, parseInt(event.target.value));
    });

    row.querySelector('.btn-remove').addEventListener('click', () => {
      removeFromCart(item.id);
    });
  }

  totalTax = totalPrice * tax; 
  totalWithTax = totalPrice + totalTax; 

  document.getElementById('total-price').innerHTML = `Total: $${totalWithTax.toFixed(2)}`;
}

function generateQuantityOptions(selectedQuantity) {
  let options = '';
  for (let i = 1; i <= 10; i++) {
    if (i === selectedQuantity) {
      options += `<option value="${i}" selected>${i}</option>`;
    } else {
      options += `<option value="${i}">${i}</option>`;
    }
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

document.addEventListener('DOMContentLoaded', loadCartItems);
