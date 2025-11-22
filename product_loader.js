// ========== PRODUCT DATA LOADER ==========
let menuItems = [];

async function loadProducts() {
  try {
    const response = await fetch("products.json");
    if (!response.ok) {
      throw new Error("Failed to load products");
    }
    menuItems = await response.json();
    return menuItems;
  } catch (error) {
    console.error("Error loading products:", error);
    return [];
  }
}

// ========== INITIALIZE PRODUCTS ==========
async function initializeProducts() {
  await loadProducts();

  const grid = document.getElementById("productsGrid");
  if (!grid) return;

  grid.innerHTML = "";

  menuItems.forEach((item, index) => {
    const defaultPrice = item.basePrice || item.sizePrice[item.sizes[0]];

    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <div class="product-header">
        <div class="product-name">${item.emoji} ${item.name}</div>
        <div class="product-price">from $${defaultPrice.toFixed(2)}</div>
      </div>
      <div class="product-form">
        <div class="form-group">
          <label>Size:</label>
          <select class="size-select" onchange="updatePrice(${index})">
            ${item.sizes
              .map((size) => `<option value="${size}">${size}</option>`)
              .join("")}
          </select>
        </div>
        ${
          item.flavors && item.flavors.length > 0
            ? `
          <div class="form-group">
            <label>Flavor:</label>
            <select class="flavor-select">
              ${item.flavors
                .map((flavor) => `<option value="${flavor}">${flavor}</option>`)
                .join("")}
            </select>
          </div>
        `
            : ""
        }
        ${
          item.flavorNotes
            ? `
          <div class="form-group">
            <label>Flavor Notes:</label>
            <input type="text" class="flavor-notes" placeholder="Optional flavor preferences">
          </div>
        `
            : ""
        }
        <div class="form-group">
          <label>Quantity:</label>
          <input type="number" class="quantity-input" min="1" value="1">
        </div>
        <button class="add-to-cart-btn" onclick="addToCart(${index})">Add to Cart</button>
      </div>
    `;
    grid.appendChild(card);
  });

  updateDietaryOptions();
}

function updatePrice(index) {
  const item = menuItems[index];
  const cards = document.querySelectorAll(".product-card");
  const card = cards[index];
  const sizeSelect = card.querySelector(".size-select");
  const priceDisplay = card.querySelector(".product-price");

  const selectedSize = sizeSelect.value;
  const price = item.sizePrice[selectedSize] || item.basePrice;
  priceDisplay.textContent = `from $${price.toFixed(2)}`;
}

// ========== DIETARY FILTERING ==========
function updateDietaryOptions() {
  const dietaryContainer = document.getElementById("dietaryFilters");
  if (!dietaryContainer) return;

  const allDietaryTags = new Set();
  menuItems.forEach((item) => {
    if (item.dietary) {
      item.dietary.forEach((tag) => allDietaryTags.add(tag));
    }
  });

  dietaryContainer.innerHTML = Array.from(allDietaryTags)
    .map(
      (tag) => `
      <label>
        <input type="checkbox" value="${tag}" onchange="filterProducts()">
        ${tag}
      </label>
    `
    )
    .join("");
}

function filterProducts() {
  const checkedFilters = Array.from(
    document.querySelectorAll("#dietaryFilters input:checked")
  ).map((cb) => cb.value);

  const cards = document.querySelectorAll(".product-card");

  cards.forEach((card, index) => {
    const item = menuItems[index];

    if (checkedFilters.length === 0) {
      card.style.display = "block";
    } else {
      const matches = checkedFilters.every(
        (filter) => item.dietary && item.dietary.includes(filter)
      );
      card.style.display = matches ? "block" : "none";
    }
  });
}

// ========== CART MANAGEMENT ==========
let cart = [];

function addToCart(index) {
  const item = menuItems[index];
  const cards = document.querySelectorAll(".product-card");
  const card = cards[index];

  const sizeSelect = card.querySelector(".size-select");
  const flavorSelect = card.querySelector(".flavor-select");
  const flavorNotes = card.querySelector(".flavor-notes");
  const quantityInput = card.querySelector(".quantity-input");

  const selectedSize = sizeSelect ? sizeSelect.value : item.sizes[0];
  const selectedFlavor = flavorSelect ? flavorSelect.value : null;
  const notes = flavorNotes ? flavorNotes.value : "";
  const quantity = parseInt(quantityInput.value) || 1;

  const price = item.sizePrice ? item.sizePrice[selectedSize] : item.basePrice;

  const cartItem = {
    name: item.name,
    emoji: item.emoji,
    size: selectedSize,
    flavor: selectedFlavor,
    notes: notes,
    quantity: quantity,
    price: price,
    canShip: item.canShip,
  };

  cart.push(cartItem);
  updateCart();

  // Reset form
  if (quantityInput) quantityInput.value = 1;
  if (flavorNotes) flavorNotes.value = "";
}

function updateCart() {
  const cartItems = document.getElementById("cartItems");
  const cartCount = document.getElementById("cartCount");
  const cartTotal = document.getElementById("cartTotal");

  if (!cartItems) return;

  if (cart.length === 0) {
    cartItems.innerHTML = "<p>Your cart is empty</p>";
    if (cartCount) cartCount.textContent = "0";
    if (cartTotal) cartTotal.textContent = "$0.00";
    return;
  }

  let total = 0;
  cartItems.innerHTML = cart
    .map((item, i) => {
      const itemTotal = item.price * item.quantity;
      total += itemTotal;

      return `
      <div class="cart-item">
        <div class="cart-item-details">
          <strong>${item.emoji} ${item.name}</strong>
          <div>Size: ${item.size}</div>
          ${item.flavor ? `<div>Flavor: ${item.flavor}</div>` : ""}
          ${item.notes ? `<div>Notes: ${item.notes}</div>` : ""}
          <div>Quantity: ${item.quantity}</div>
          <div>Price: $${itemTotal.toFixed(2)}</div>
        </div>
        <button onclick="removeFromCart(${i})" class="remove-btn">Remove</button>
      </div>
    `;
    })
    .join("");

  if (cartCount) cartCount.textContent = cart.length;
  if (cartTotal) cartTotal.textContent = `$${total.toFixed(2)}`;

  checkShippingAvailability();
}

function removeFromCart(index) {
  cart.splice(index, 1);
  updateCart();
}

function clearCart() {
  cart = [];
  updateCart();
}

// ========== SHIPPING AVAILABILITY ==========
function checkShippingAvailability() {
  const shippingNotice = document.getElementById("shippingNotice");
  if (!shippingNotice) return;

  const hasNonShippable = cart.some((item) => !item.canShip);

  if (hasNonShippable) {
    shippingNotice.style.display = "block";
    shippingNotice.innerHTML =
      "⚠️ Some items in your cart require local pickup only.";
  } else {
    shippingNotice.style.display = "none";
  }
}

// ========== PAYMENT DETAILS ==========
const paymentInfo = {
  Cash: "Pay 50% deposit now to secure your appointment. Bring remaining 50% at pickup.",
  "Cash App":
    "Send 50% deposit to: <a href='https://cash.app/$DanaBlueMoonHaven'>$DanaBlueMoonHaven</a>",
  Venmo:
    "Send 50% deposit to: <a href='https://venmo.com/BlueMoonHaven'>@BlueMoonHaven</a> to secure your appointment.",
  PayPal:
    "Send 50% deposit to: <a href='https://paypal.me/BlueMoonHaven'>@BlueMoonHaven</a> to secure your appointment.",
  Zelle:
    "Use Zelle to send 50% deposit to: <strong>805-709-4680</strong> to secure your appointment.",
};

function updatePaymentDetails() {
  const selectedMethod = document.querySelector(
    'input[name="payment_method"]:checked'
  )?.value;
  const detailsDiv = document.getElementById("paymentDetails");
  const contentDiv = document.getElementById("paymentDetailsContent");

  if (selectedMethod && paymentInfo[selectedMethod]) {
    contentDiv.innerHTML = paymentInfo[selectedMethod];
    detailsDiv.style.display = "block";
  } else {
    detailsDiv.style.display = "none";
  }
}

// ========== INITIALIZE ON PAGE LOAD ==========
document.addEventListener("DOMContentLoaded", initializeProducts);
