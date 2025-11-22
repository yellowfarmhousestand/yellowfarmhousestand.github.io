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
  console.log("Initializing products...");
  const spinner = document.getElementById("loadingSpinner");
  spinner.classList.remove("hidden");

  const products = await loadProducts();
  console.log("Loaded products:", products.length);

  spinner.style.display = "none";
  generateCategoryTabs();
  displayProducts(products);

  // Add event listeners
  document.getElementById("productSearch").addEventListener("input", filterAndDisplay);
  document.getElementById("productSort").addEventListener("change", filterAndDisplay);
  document.getElementById("filter-gf").addEventListener("change", filterAndDisplay);
  document.getElementById("filter-sf").addEventListener("change", filterAndDisplay);
  console.log("Products initialized");
}

function generateCategoryTabs() {
  const tabContainer = document.getElementById("categoryTabs");
  tabContainer.innerHTML = "";

  // All tab
  const allTab = document.createElement("button");
  allTab.className = "tab-button active";
  allTab.textContent = "All";
  allTab.dataset.category = "all";
  allTab.addEventListener("click", setActiveTab);
  tabContainer.appendChild(allTab);

  // Get unique categories
  const categories = [...new Set(menuItems.map(item => item.category))];
  for (const cat of categories) {
    const tab = document.createElement("button");
    tab.className = "tab-button";
    tab.textContent = cat;
    tab.dataset.category = cat;
    tab.addEventListener("click", setActiveTab);
    tabContainer.appendChild(tab);
  }
}

function setActiveTab(event) {
  for (const btn of document.querySelectorAll(".tab-button")) {
    btn.classList.remove("active");
  }
  event.target.classList.add("active");
  filterAndDisplay();
}

function displayProducts(products) {
  console.log("Displaying products:", products.length);
  const grid = document.getElementById("productsGrid");
  console.log("Grid found:", !!grid);
  grid.innerHTML = "";

  // Group by category
  const productsByCategory = {};
  for (const item of products) {
    if (!productsByCategory[item.category]) productsByCategory[item.category] = [];
    productsByCategory[item.category].push(item);
  }

  let globalIndex = 0;

  for (const category of Object.keys(productsByCategory)) {
    const items = productsByCategory[category];
    const sectionResult = createCategorySection(category, items, globalIndex);
    grid.appendChild(sectionResult.node);
    globalIndex = sectionResult.nextIndex;
  }
  console.log("Products displayed");
}

function createCategorySection(category, items, startIndex) {
  if (category === "Cookie") {
    return createCookieSections(items, startIndex);
  }

  // Normal category
  const section = document.createElement("div");
  section.className = "category-section";

  const title = document.createElement("h2");
  title.className = "category-title";
  title.textContent = category;
  section.appendChild(title);

  const categoryGrid = document.createElement("div");
  categoryGrid.className = "products-grid";

  let index = startIndex;
  for (const item of items) {
    const card = createProductCard(item, index);
    categoryGrid.appendChild(card);
    index++;
  }

  section.appendChild(categoryGrid);
  return { node: section, nextIndex: index };
}

function createCookieSections(items, startIndex) {
  const section = document.createElement("div");
  section.className = "category-section";

  const title = document.createElement("h2");
  title.className = "category-title";
  title.textContent = "Cookies";
  section.appendChild(title);

  const subcategories = ["simple", "fancy", "complex"];
  let index = startIndex;
  for (const sub of subcategories) {
    const subItems = items.filter(item => item.subcategory === sub);
    if (subItems.length > 0) {
      const subTitle = document.createElement("h3");
      subTitle.className = "subcategory-title";
      subTitle.textContent = `${sub.charAt(0).toUpperCase() + sub.slice(1)} Cookies`;
      section.appendChild(subTitle);

      const subGrid = document.createElement("div");
      subGrid.className = "products-grid";

      for (const item of subItems) {
        const card = createProductCard(item, index);
        subGrid.appendChild(card);
        index++;
      }
      section.appendChild(subGrid);
    }
  }
  return { node: section, nextIndex: index };
}

function createProductCard(item, index) {
  const defaultPrice = getDefaultPrice(item);

  const card = document.createElement("div");
  card.className = "product-card";

  const imgWrap = document.createElement("div");
  imgWrap.className = "product-image";
  if (item.image) {
    const img = document.createElement("img");
    img.src = item.image;
    img.alt = item.name || "Product Image";
    imgWrap.appendChild(img);
  } else {
    imgWrap.innerHTML = '<div class="image-placeholder">Image Coming Soon</div>';
  }
  card.appendChild(imgWrap);

  const header = document.createElement("div");
  header.className = "product-header";
  const nameDiv = document.createElement("div");
  nameDiv.className = "product-name";
  nameDiv.textContent = item.name;
  const priceDiv = document.createElement("div");
  priceDiv.className = "product-price";
  priceDiv.textContent = `from $${defaultPrice.toFixed(2)}`;
  header.appendChild(nameDiv);
  header.appendChild(priceDiv);
  card.appendChild(header);

  const badges = document.createElement("div");
  badges.className = "dietary-badges";
  if (item.canGlutenfree) {
    const gfBadge = document.createElement("span");
    gfBadge.className = "badge gluten-free";
    gfBadge.textContent = "Can be Gluten Free";
    badges.appendChild(gfBadge);
  }
  if (item.canSugarfree) {
    const sfBadge = document.createElement("span");
    sfBadge.className = "badge sugar-free";
    sfBadge.textContent = "Can be Sugar Free";
    badges.appendChild(sfBadge);
  }
  card.appendChild(badges);

  const form = document.createElement("div");
  form.className = "product-form";

  // Size select
  const sizeGroup = document.createElement("div");
  sizeGroup.className = "form-group";
  const sizeLabel = document.createElement("label");
  sizeLabel.textContent = "Size:";
  const sizeSelect = document.createElement("select");
  sizeSelect.id = `size-${index}`;
  sizeSelect.className = "size-select";
  sizeSelect.addEventListener("change", () => updatePrice(index));
  for (const size of item.sizes) {
    const opt = document.createElement("option");
    opt.value = size;
    opt.textContent = size;
    sizeSelect.appendChild(opt);
  }
  sizeGroup.appendChild(sizeLabel);
  sizeGroup.appendChild(sizeSelect);
  form.appendChild(sizeGroup);

  // Flavor select (optional)
  if (item.flavors && item.flavors.length > 0) {
    const flavorGroup = document.createElement("div");
    flavorGroup.className = "form-group";
    const flavorLabel = document.createElement("label");
    flavorLabel.textContent = "Flavor:";
    const flavorSelect = document.createElement("select");
    flavorSelect.id = `flavor-${index}`;
    flavorSelect.className = "flavor-select";
    flavorSelect.addEventListener("change", () => updateDietaryOptions(index));
    for (const flavor of item.flavors) {
      const opt = document.createElement("option");
      opt.value = flavor;
      opt.textContent = flavor;
      flavorSelect.appendChild(opt);
    }
    flavorGroup.appendChild(flavorLabel);
    flavorGroup.appendChild(flavorSelect);
    form.appendChild(flavorGroup);
  }

  // Flavor notes (optional)
  if (item.flavorNotes) {
    const notesGroup = document.createElement("div");
    notesGroup.className = "form-group";
    const notesLabel = document.createElement("label");
    notesLabel.textContent = "Flavor Notes:";
    const notesInput = document.createElement("input");
    notesInput.type = "text";
    notesInput.id = `notes-${index}`;
    notesInput.className = "flavor-notes";
    notesInput.placeholder = "Optional flavor preferences";
    notesGroup.appendChild(notesLabel);
    notesGroup.appendChild(notesInput);
    form.appendChild(notesGroup);
  }

  // Quantity
  const qtyGroup = document.createElement("div");
  qtyGroup.className = "form-group";
  const qtyLabel = document.createElement("label");
  qtyLabel.textContent = "Quantity:";
  const qtyInput = document.createElement("input");
  qtyInput.type = "number";
  qtyInput.id = `qty-${index}`;
  qtyInput.className = "quantity-input";
  qtyInput.min = "1";
  qtyInput.value = "1";
  qtyGroup.appendChild(qtyLabel);
  qtyGroup.appendChild(qtyInput);
  form.appendChild(qtyGroup);

  // Dietary options
  if (item.canGlutenfree || item.canSugarfree) {
    const dietaryGroup = document.createElement("div");
    dietaryGroup.className = "form-group dietary-options";
    const dietaryLabel = document.createElement("label");
    dietaryLabel.textContent = "Special Options:";
    dietaryGroup.appendChild(dietaryLabel);

    if (item.canGlutenfree) {
      const gfLabel = document.createElement("label");
      gfLabel.className = "checkbox-label";
      const gfCheckbox = document.createElement("input");
      gfCheckbox.type = "checkbox";
      gfCheckbox.id = `gf-${index}`;
      gfCheckbox.className = "dietary-checkbox";
      gfLabel.appendChild(gfCheckbox);
      gfLabel.appendChild(document.createTextNode(" Gluten Free"));
      dietaryGroup.appendChild(gfLabel);
    }

    if (item.canSugarfree) {
      const sfLabel = document.createElement("label");
      sfLabel.className = "checkbox-label";
      const sfCheckbox = document.createElement("input");
      sfCheckbox.type = "checkbox";
      sfCheckbox.id = `sf-${index}`;
      sfCheckbox.className = "dietary-checkbox";
      sfLabel.appendChild(sfCheckbox);
      sfLabel.appendChild(document.createTextNode(" Sugar Free"));
      dietaryGroup.appendChild(sfLabel);
    }

    form.appendChild(dietaryGroup);
  }

  const addBtn = document.createElement("button");
  addBtn.className = "add-to-cart-btn";
  addBtn.textContent = "Add to Cart";
  addBtn.addEventListener("click", () => addToCart(index));
  form.appendChild(addBtn);

  card.appendChild(form);
  return card;
}

function getDefaultPrice(item) {
  if (typeof item.basePrice === "number") return item.basePrice;
  if (item.sizes && item.sizes.length > 0 && item.sizePrice) {
    const firstSize = item.sizes[0];
    return item.sizePrice[firstSize] || 0;
  }
  return 0;
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

function filterAndDisplay() {
  let filtered = menuItems.slice(); // copy

  // Category filter
  const activeTab = document.querySelector(".tab-button.active");
  const category = activeTab ? activeTab.dataset.category : "all";
  if (category !== "all") {
    filtered = filtered.filter(item => item.category === category);
  }

  // Search filter
  const searchQuery = document.getElementById("productSearch").value.toLowerCase();
  if (searchQuery) {
    filtered = filtered.filter(item => item.name.toLowerCase().includes(searchQuery));
  }

  // Dietary filters
  const gfFilter = document.getElementById("filter-gf").checked;
  const sfFilter = document.getElementById("filter-sf").checked;
  if (gfFilter || sfFilter) {
    filtered = filtered.filter(item => {
      if (gfFilter && !item.canGlutenfree) return false;
      if (sfFilter && !item.canSugarfree) return false;
      return true;
    });
  }

  // Sort
  const sortBy = document.getElementById("productSort").value;
  filtered.sort((a, b) => {
    if (sortBy === "name") return a.name.localeCompare(b.name);
    const priceA = getDefaultPrice(a);
    const priceB = getDefaultPrice(b);
    if (sortBy === "price-low") return priceA - priceB;
    if (sortBy === "price-high") return priceB - priceA;
    return 0;
  });

  displayProducts(filtered);
}

// ========== DIETARY FILTERING ==========
// Removed as replaced with badges and filters

// ========== INITIALIZE ON PAGE LOAD ==========
document.addEventListener("DOMContentLoaded", initializeProducts);
