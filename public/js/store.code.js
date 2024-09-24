let items = [];

async function loadStoreItems() {
  try {
    const response = await fetch('/api/store/items');
    items = await response.json();

    const storeContainer = document.getElementById('js-store-row');
    storeContainer.innerHTML = ''; 
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const itemHTML = `
        <div class="col-sm-12 col-lg-4 mb-4">
          <div class="card h-100">
            <img class="card-img-top" src="/${item.image}" alt="${item.name}">
            <div class="card-body d-flex flex-column">
              <h5 class="card-title">${item.name}</h5>
              <p class="card-text">${item.description}</p>
              <p class="text-success fs-1">$${(item.price / 100).toFixed(2)}</p>
              <p class="card-text" style="color: gray;">Stock: ${item.quantity}</p>
              <button class="btn btn-primary mt-auto buy-now-btn" data-id="${item.id}">Add Item To Cart</button>
            </div>
          </div>
        </div>`;
      storeContainer.innerHTML += itemHTML;
    }

    const buyNowButtons = document.getElementsByClassName('buy-now-btn');
    for (let i = 0; i < buyNowButtons.length; i++) {
      buyNowButtons[i].addEventListener('click', addToCart);
    }
  } catch (error) {
    console.error('Error loading store items:', error);
  }
}

function addToCart(event) {
  const itemId = event.target.getAttribute('data-id');
  const item = items.find(item => item.id == itemId);

  if (item) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartItemIndex = cart.findIndex(cartItem => cartItem.id == item.id);

    if (cartItemIndex > -1) {
      cart[cartItemIndex].quantity += 1;
    } else {
      const newItem = { ...item, quantity: 1 };
      cart.push(newItem);
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    alert(`${item.name} has been added to your cart!`);
    loadCartItems();  
  }
}

document.addEventListener('DOMContentLoaded', loadStoreItems);
