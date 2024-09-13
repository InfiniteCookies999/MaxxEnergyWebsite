// Store items data, did in cents so 1999 = 19.99 because of binary
const items = [
  {id: '1', name: 'LED Light bulb', price: 1999, description: 'Long-lasting LED that saves energy and brightens up your space.', image: "store-images/led-light-bulb.jpg"},
  {id: '2', name: 'Solar-Powered Charger', price: 6999, description: 'Charge your devices anywhere with solar power, perfect for on-the-go.', image: "store-images/solar-charger.jpg"},
  {id: '3', name: 'Solar-Powered Fan', price: 3099, description: 'Enjoy a cool breeze powered by the sun, great for outdoors and emergencies.', image: "store-images/solar-fan.jpg"},
  {id: '4', name: 'Reusable Smart Battery', price: 4999, description: 'Rechargeable battery for everyday use, eco-friendly and cost-effective.', image: "store-images/eco-battery.jpg"},
  {id: '5', name: 'Smart Plug', price: 1999, description: 'Control appliances remotely, save energy and reduce bills effortlessly.', image: "store-images/smart-plug.jpg"},
  {id: '6', name: 'Reusable Water Bottle', price: 1499, description: 'Durable, insulated bottle to keep drinks hot or cold, reusable and stylish.', image: "store-images/water-bottle.jpg"},
];

// Function to load store items
function loadStoreItems() {
  const storeContainer = document.getElementById('js-store-row');
  storeContainer.innerHTML = ''; 
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const itemHTML = `
      <div class="col-sm-12 col-lg-4 mb-4">
        <div class="card h-100">
          <img class="card-img-top" src="${item.image}" alt="${item.name}">
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">${item.name}</h5>
            <p class="card-text">${item.description}</p>
            <p class="text-success fs-1">$${(item.price / 100).toFixed(2)}</p>
            <button class="btn btn-primary mt-auto buy-now-btn" data-id="${item.id}">Buy Now</button>
          </div>
        </div>
      </div>`;
    storeContainer.innerHTML += itemHTML;
  }

  const buyNowButtons = document.getElementsByClassName('buy-now-btn');
  for (let i = 0; i < buyNowButtons.length; i++) {
    buyNowButtons[i].addEventListener('click', addToCart);
  }
}

function addToCart(event) {
  const itemId = event.target.getAttribute('data-id');
  const item = items.find(item => item.id === itemId);

  if (item) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartItemIndex = cart.findIndex(cartItem => cartItem.id === item.id);

    if (cartItemIndex > -1) {
      // Item already in cart; increase quantity
      cart[cartItemIndex].quantity += 1;
    } else {
      // New item; copy properties using a traditional `for` loop
      const newItem = {};
      const keys = Object.keys(item);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        newItem[key] = item[key];
      }
      newItem.quantity = 1; 

      cart.push(newItem);
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    alert(`${item.name} has been added to your cart!`);
  }
}

document.addEventListener('DOMContentLoaded', loadStoreItems);