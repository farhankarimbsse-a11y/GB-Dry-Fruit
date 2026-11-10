/* GB Dry Fruit storefront
   Reads the live product catalogue from products.json in this repository.
   Delivery: Gilgit city Rs. 150; all other cities Rs. 300.
*/
const WHATSAPP_NUMBER = "923555850225";

let products = [];
const state = {
  category: "All",
  search: "",
  min: 0,
  max: 2500,
  sort: "featured",
  cart: {},
  quantities: {}
};

const $ = (selector) => document.querySelector(selector);
const money = (amount) => `Rs. ${Number(amount || 0).toLocaleString("en-PK")}`;
const displayPrice = (price) => price === null || price === undefined || price === "" ? "Price on request" : money(price);

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[char]));
}

function getFilteredProducts() {
  let items = products.filter((product) => {
    const matchesCategory = state.category === "All" || product.category === state.category;
    const query = state.search.trim().toLowerCase();
    const text = `${product.name || ""} ${product.category || ""} ${product.search || ""}`.toLowerCase();
    const matchesSearch = !query || text.includes(query);
    const hasPrice = product.price === null || product.price === undefined || product.price === "";
    const matchesPrice = hasPrice || (Number(product.price) >= state.min && Number(product.price) <= state.max);
    return matchesCategory && matchesSearch && matchesPrice && product.active !== false;
  });

  if (state.sort === "price-low") {
    items.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
  } else if (state.sort === "price-high") {
    items.sort((a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity));
  } else if (state.sort === "name") {
    items.sort((a, b) => String(a.name).localeCompare(String(b.name)));
  } else {
    items.sort((a, b) => (a.featured ?? a.id) - (b.featured ?? b.id));
  }
  return items;
}

function productVisual(product, extraClass = "") {
  const image = product.image ? String(product.image) : "";
  if (image) {
    return `<img class="product-photo ${extraClass}" src="${escapeHtml(image)}" alt="${escapeHtml(product.name)}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.hidden=false" /><span class="product-emoji ${extraClass}" aria-hidden="true" hidden>${escapeHtml(product.emoji || "🥜")}</span>`;
  }
  return `<span class="product-emoji ${extraClass}" aria-hidden="true">${escapeHtml(product.emoji || "🥜")}</span>`;
}

function renderCategoryButtons() {
  const categoryList = $("#category-list");
  const categories = [...new Set(products.map((product) => product.category).filter(Boolean))];
  const allButton = `<button class="category-button ${state.category === "All" ? "selected" : ""}" data-category="All"><span>✦</span> All products <b>${products.filter(p => p.active !== false).length}</b></button>`;
  const categoryButtons = categories.map((category) => {
    const count = products.filter((product) => product.category === category && product.active !== false).length;
    const selected = state.category === category ? "selected" : "";
    return `<button class="category-button ${selected}" data-category="${escapeHtml(category)}"><span>◈</span> ${escapeHtml(category)} <b>${count}</b></button>`;
  }).join("");
  categoryList.innerHTML = allButton + categoryButtons;
}

function renderProducts() {
  const items = getFilteredProducts();
  const grid = $("#product-grid");
  grid.innerHTML = items.map((product) => {
    const priceText = displayPrice(product.price);
    const priceClass = product.price == null ? "product-price price-on-request" : "product-price";
    const addLabel = product.price == null ? "Ask on WhatsApp" : "Add";
    return `
      <article class="product-card">
        <div class="product-image">
          <span class="product-label">${escapeHtml(product.tag || "GB SELECTION")}</span>
          <button class="product-fav" type="button" aria-label="Save ${escapeHtml(product.name)}" title="Save for later">♡</button>
          ${productVisual(product)}
        </div>
        <div class="product-details">
          <div class="product-category">${escapeHtml(product.category || "Dry Fruits")}</div>
          <h3 class="product-name" title="${escapeHtml(product.name)}">${escapeHtml(product.name)}</h3>
          <p class="product-weight">${escapeHtml(product.weight || "Pack size to confirm")}</p>
          <p class="${priceClass}">${priceText}</p>
          <div class="product-controls">
            <div class="quantity-control" aria-label="Quantity for ${escapeHtml(product.name)}">
              <button type="button" data-qty="minus" data-id="${Number(product.id)}" aria-label="Decrease quantity">−</button>
              <span id="qty-${Number(product.id)}">${state.quantities[product.id] || 1}</span>
              <button type="button" data-qty="plus" data-id="${Number(product.id)}" aria-label="Increase quantity">+</button>
            </div>
            <button class="add-button" type="button" data-add="${Number(product.id)}">${addLabel}</button>
          </div>
        </div>
      </article>`;
  }).join("");

  $("#result-count").textContent = `Showing ${items.length} of ${products.filter(p => p.active !== false).length} products`;
  $("#empty-state").hidden = items.length !== 0;
  grid.hidden = items.length === 0;
  renderFilterChips();
  updateCategoryButtons();
}

function renderFilterChips() {
  const chips = [];
  if (state.category !== "All") chips.push(state.category);
  if (state.search) chips.push(`Search: ${state.search}`);
  if (state.min > 0 || state.max < 2500) chips.push(`${money(state.min)} – ${money(state.max)}`);
  $("#active-filters").innerHTML = chips.map((chip) => `<span class="filter-chip">${escapeHtml(chip)}</span>`).join("");
}

function renderMiniProducts() {
  const favourites = [products[0], products[9], products[1], products[4]].filter(Boolean);
  $("#mini-products").innerHTML = favourites.map((product) => `
    <div class="mini-product">
      <div class="mini-product-art">${productVisual(product)}</div>
      <div class="mini-product-info"><b>${escapeHtml(product.name)}</b><span>${displayPrice(product.price)}</span></div>
    </div>`).join("");
}

function updateCategoryButtons() {
  document.querySelectorAll(".category-button").forEach((button) => {
    button.classList.toggle("selected", button.dataset.category === state.category);
  });
}

function updateCartCount() {
  const count = Object.values(state.cart).reduce((sum, quantity) => sum + quantity, 0);
  $("#cart-count").textContent = count;
  $("#drawer-count").textContent = `(${count})`;
  $("#cart-summary").hidden = count === 0;
}

function renderCart() {
  const entries = Object.entries(state.cart).filter(([, quantity]) => quantity > 0);
  const cartItems = $("#cart-items");
  if (entries.length === 0) {
    cartItems.innerHTML = `<div class="cart-empty"><span>🛒</span><h3>Your cart is waiting</h3><p>Add something delicious to get started.</p><button class="button button-green" id="continue-shopping">Continue shopping</button></div>`;
    $("#cart-subtotal").textContent = money(0);
    updateCartCount();
    return;
  }

  let subtotal = 0;
  cartItems.innerHTML = entries.map(([id, quantity]) => {
    const product = products.find((item) => item.id === Number(id));
    if (!product) return "";
    const lineTotal = Number(product.price) * quantity;
    subtotal += lineTotal;
    return `<div class="cart-row">
      <div class="cart-row-art">${productVisual(product)}</div>
      <div class="cart-row-info"><b>${escapeHtml(product.name)}</b><small>${escapeHtml(product.weight)} · ${money(product.price)}</small>
        <div class="cart-row-controls"><button type="button" data-cart-action="minus" data-id="${id}" aria-label="Decrease">−</button><span>${quantity}</span><button type="button" data-cart-action="plus" data-id="${id}" aria-label="Increase">+</button></div>
      </div>
      <div class="cart-row-price">${money(lineTotal)}<button class="remove-item" data-cart-action="remove" data-id="${id}">Remove</button></div>
    </div>`;
  }).join("");
  $("#cart-subtotal").textContent = money(subtotal);
  updateCartCount();
}

function addToCart(id) {
  const product = products.find((item) => item.id === id);
  if (!product) return;
  if (product.price == null || product.price === "") {
    showToast("Price is on request. Please contact us on WhatsApp.");
    return;
  }
  const quantity = state.quantities[id] || 1;
  state.cart[id] = (state.cart[id] || 0) + quantity;
  renderCart();
  showToast("Added to your cart!");
}

function setQuantity(id, change) {
  state.quantities[id] = Math.max(1, Math.min(99, (state.quantities[id] || 1) + change));
  const label = $(`#qty-${id}`);
  if (label) label.textContent = state.quantities[id];
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2600);
}

function openCategoryMenu() {
  $("#sidebar").classList.add("mobile-open");
  $("#sidebar-backdrop").classList.add("show");
  $("#mobile-menu").setAttribute("aria-expanded", "true");
  document.body.style.overflow = "hidden";
}

function closeCategoryMenu() {
  $("#sidebar").classList.remove("mobile-open");
  $("#sidebar-backdrop").classList.remove("show");
  $("#mobile-menu").setAttribute("aria-expanded", "false");
  document.body.style.overflow = "";
}

function openCart() {
  $("#cart-drawer").classList.add("open");
  $("#drawer-backdrop").classList.add("show");
  $("#cart-drawer").setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeCart() {
  $("#cart-drawer").classList.remove("open");
  $("#drawer-backdrop").classList.remove("show");
  $("#cart-drawer").setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function askForCustomerDetails() {
  const name = window.prompt("Customer full name:");
  if (name === null || !name.trim()) return null;
  const phone = window.prompt("Customer mobile / WhatsApp number:");
  if (phone === null || !phone.trim()) return null;
  const city = window.prompt("Delivery city / town (write Gilgit for Gilgit city):");
  if (city === null || !city.trim()) return null;
  const address = window.prompt("Complete delivery address:");
  if (address === null || !address.trim()) return null;
  const landmark = window.prompt("Nearest landmark (optional):") || "Not provided";
  return { name: name.trim(), phone: phone.trim(), city: city.trim(), address: address.trim(), landmark: landmark.trim() || "Not provided" };
}

function checkout() {
  const entries = Object.entries(state.cart).filter(([, quantity]) => quantity > 0);
  if (entries.length === 0) {
    showToast("Your cart is empty.");
    return;
  }
  const customer = askForCustomerDetails();
  if (!customer) {
    showToast("Order cancelled. Please enter the delivery details to continue.");
    return;
  }

  const lines = entries.map(([id, quantity]) => {
    const product = products.find((item) => item.id === Number(id));
    return `• ${product.name} (${product.weight}) x ${quantity} = ${money(Number(product.price) * quantity)}`;
  });
  const subtotal = entries.reduce((sum, [id, quantity]) => {
    const product = products.find((item) => item.id === Number(id));
    return sum + Number(product.price) * quantity;
  }, 0);
  const delivery = customer.city.toLowerCase().includes("gilgit") ? 150 : 300;
  const grandTotal = subtotal + delivery;
  const message = `Assalam-o-Alaikum GB Dry Fruit! I would like to place an order:\n\n${lines.join("\n")}\n\nSubtotal: ${money(subtotal)}\nDelivery (${customer.city}): ${money(delivery)}\nGrand total: ${money(grandTotal)}\n\nCustomer name: ${customer.name}\nCustomer mobile: ${customer.phone}\nCity: ${customer.city}\nFull address: ${customer.address}\nNearest landmark: ${customer.landmark}`;

  if (!/^\d{10,15}$/.test(WHATSAPP_NUMBER)) {
    showToast("Please check the business WhatsApp number in script.js.");
    return;
  }
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
}

function bindEvents() {
  $("#search-form").addEventListener("submit", (event) => {
    event.preventDefault();
    state.search = $("#search-input").value;
    renderProducts();
    $("#shop").scrollIntoView({ behavior: "smooth" });
  });
  $("#search-input").addEventListener("input", (event) => {
    state.search = event.target.value;
    renderProducts();
  });
  $("#category-list").addEventListener("click", (event) => {
    const button = event.target.closest("[data-category]");
    if (!button) return;
    state.category = button.dataset.category;
    renderProducts();
    closeCategoryMenu();
  });
  document.querySelectorAll("[data-nav-category]").forEach((link) => link.addEventListener("click", () => {
    state.category = link.dataset.navCategory;
    renderProducts();
  }));
  $("#apply-filter").addEventListener("click", () => {
    state.min = Math.max(0, Number($("#min-price").value) || 0);
    state.max = Math.max(state.min, Number($("#max-price").value) || 2500);
    renderProducts();
  });
  $("#reset-filters").addEventListener("click", () => {
    state.category = "All"; state.search = ""; state.min = 0; state.max = 2500;
    $("#search-input").value = ""; $("#min-price").value = 0; $("#max-price").value = 2500;
    renderProducts();
  });
  $("#clear-search").addEventListener("click", () => $("#reset-filters").click());
  $("#sort-select").addEventListener("change", (event) => { state.sort = event.target.value; renderProducts(); });
  $("#product-grid").addEventListener("click", (event) => {
    const add = event.target.closest("[data-add]");
    if (add) { addToCart(Number(add.dataset.add)); return; }
    const qty = event.target.closest("[data-qty]");
    if (qty) { setQuantity(Number(qty.dataset.id), qty.dataset.qty === "plus" ? 1 : -1); return; }
    const fav = event.target.closest(".product-fav");
    if (fav) { fav.textContent = fav.textContent === "♡" ? "♥" : "♡"; fav.style.color = fav.textContent === "♥" ? "#dc7272" : ""; showToast("Your favourite list is just for this visit."); }
  });
  $("#cart-items").addEventListener("click", (event) => {
    if (event.target.id === "continue-shopping") { closeCart(); $("#shop").scrollIntoView({ behavior: "smooth" }); return; }
    const button = event.target.closest("[data-cart-action]");
    if (!button) return;
    const id = button.dataset.id;
    const action = button.dataset.cartAction;
    if (action === "remove") delete state.cart[id];
    else if (action === "plus") state.cart[id] = (state.cart[id] || 0) + 1;
    else state.cart[id] = Math.max(0, (state.cart[id] || 0) - 1);
    if (state.cart[id] === 0) delete state.cart[id];
    renderCart();
  });
  $("#open-cart").addEventListener("click", openCart);
  $("#close-cart").addEventListener("click", closeCart);
  $("#drawer-backdrop").addEventListener("click", closeCart);
  $("#checkout-whatsapp").addEventListener("click", checkout);
  $("#mobile-menu").addEventListener("click", openCategoryMenu);
  $("#close-sidebar").addEventListener("click", closeCategoryMenu);
  $("#sidebar-backdrop").addEventListener("click", closeCategoryMenu);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") { closeCategoryMenu(); closeCart(); }
  });
  $("#contact-whatsapp").addEventListener("click", (event) => {
    event.currentTarget.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Assalam-o-Alaikum GB Dry Fruit! I would like to know more about your products.")}`;
  });
  $("#year").textContent = new Date().getFullYear();
}

async function startStore() {
  try {
    const response = await fetch("./products.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`Could not load products.json (${response.status})`);
    const catalogue = await response.json();
    if (!Array.isArray(catalogue) || catalogue.length === 0) throw new Error("products.json is empty or invalid");
    products = catalogue;
    renderCategoryButtons();
    bindEvents();
    renderProducts();
    renderMiniProducts();
    renderCart();
  } catch (error) {
    console.error("GB Dry Fruit catalogue error:", error);
    $("#product-grid").innerHTML = `<p class="empty-state">We could not load the product catalogue. Please refresh the page or contact GB Dry Fruit.</p>`;
    $("#result-count").textContent = "Product catalogue unavailable";
  }
}

startStore();
