/* GB Dry Fruit storefront
   Cart, quantity controls, delivery form and WhatsApp checkout.
   Catalogue is loaded from ./products.json.
*/

const WHATSAPP_NUMBER = "923555850225";
const DELIVERY_GILGIT = 150;
const DELIVERY_OTHER_CITIES = 300;

let products = [];
const state = {
  category: "All",
  search: "",
  min: 0,
  max: 1000000000,
  sort: "featured",
  cart: {},
  quantities: {}
};

const $ = (selector) => document.querySelector(selector);
const money = (amount) => `Rs. ${Number(amount || 0).toLocaleString("en-PK")}`;
const hasPrice = (price) => price !== null && price !== undefined && price !== "" && Number.isFinite(Number(price));
const displayPrice = (price) => hasPrice(price) ? money(price) : "Price on request";

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[char]));
}

function showToast(message) {
  const toast = $("#toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2800);
}

function productVisual(product, extraClass = "") {
  const image = product.image ? String(product.image) : "";
  if (image) {
    return `<img class="product-photo ${extraClass}" src="${escapeHtml(image)}" alt="${escapeHtml(product.name)}" loading="lazy" onerror="this.style.display='none';if(this.nextElementSibling)this.nextElementSibling.hidden=false" />` +
      `<span class="product-emoji ${extraClass}" aria-hidden="true" hidden>${escapeHtml(product.emoji || "🥜")}</span>`;
  }
  return `<span class="product-emoji ${extraClass}" aria-hidden="true">${escapeHtml(product.emoji || "🥜")}</span>`;
}

function getFilteredProducts() {
  let items = products.filter((product) => {
    const matchesCategory = state.category === "All" || product.category === state.category;
    const query = state.search.trim().toLowerCase();
    const searchable = `${product.name || ""} ${product.category || ""} ${product.search || ""}`.toLowerCase();
    const matchesSearch = !query || searchable.includes(query);
    const priceMissing = !hasPrice(product.price);
    const matchesPrice = priceMissing || (Number(product.price) >= state.min && Number(product.price) <= state.max);
    return matchesCategory && matchesSearch && matchesPrice && product.active !== false;
  });

  if (state.sort === "price-low") {
    items.sort((a, b) => (hasPrice(a.price) ? Number(a.price) : Infinity) - (hasPrice(b.price) ? Number(b.price) : Infinity));
  } else if (state.sort === "price-high") {
    items.sort((a, b) => (hasPrice(b.price) ? Number(b.price) : -Infinity) - (hasPrice(a.price) ? Number(a.price) : -Infinity));
  } else if (state.sort === "name") {
    items.sort((a, b) => String(a.name).localeCompare(String(b.name)));
  } else {
    items.sort((a, b) => (a.featured ?? a.id) - (b.featured ?? b.id));
  }
  return items;
}

function updateCategoryButtons() {
  document.querySelectorAll(".category-button").forEach((button) => {
    button.classList.toggle("selected", button.dataset.category === state.category);
  });
}

function renderCategoryButtons() {
  const categoryList = $("#category-list");
  if (!categoryList) return;
  const categories = [...new Set(products.map((product) => product.category).filter(Boolean))];
  const countActive = (list) => list.filter((product) => product.active !== false).length;
  const allButton = `<button class="category-button ${state.category === "All" ? "selected" : ""}" data-category="All"><span>✦</span> All products <b>${countActive(products)}</b></button>`;
  const categoryButtons = categories.map((category) => {
    const count = countActive(products.filter((product) => product.category === category));
    const selected = state.category === category ? "selected" : "";
    return `<button class="category-button ${selected}" data-category="${escapeHtml(category)}"><span>◈</span> ${escapeHtml(category)} <b>${count}</b></button>`;
  }).join("");
  categoryList.innerHTML = allButton + categoryButtons;
}

function renderFilterChips() {
  const chips = [];
  if (state.category !== "All") chips.push(state.category);
  if (state.search) chips.push(`Search: ${state.search}`);
  if (state.min > 0 || state.max < 1000000000) chips.push(`${money(state.min)} – ${money(state.max)}`);
  const target = $("#active-filters");
  if (target) target.innerHTML = chips.map((chip) => `<span class="filter-chip">${escapeHtml(chip)}</span>`).join("");
}

function renderProducts() {
  const grid = $("#product-grid");
  if (!grid) return;
  const items = getFilteredProducts();
  grid.innerHTML = items.map((product) => {
    const priced = hasPrice(product.price);
    const priceClass = priced ? "product-price" : "product-price price-on-request";
    const actionLabel = priced ? "Add" : "Ask on WhatsApp";
    const quantity = state.quantities[product.id] || 1;
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
          <p class="${priceClass}">${displayPrice(product.price)}</p>
          <div class="product-controls">
            <div class="quantity-control" aria-label="Quantity for ${escapeHtml(product.name)}">
              <button type="button" data-qty="minus" data-id="${escapeHtml(product.id)}" aria-label="Decrease quantity">−</button>
              <span id="qty-${escapeHtml(product.id)}">${quantity}</span>
              <button type="button" data-qty="plus" data-id="${escapeHtml(product.id)}" aria-label="Increase quantity">+</button>
            </div>
            <button class="add-button" type="button" data-add="${escapeHtml(product.id)}">${actionLabel}</button>
          </div>
        </div>
      </article>`;
  }).join("");

  const activeCount = products.filter((product) => product.active !== false).length;
  const resultCount = $("#result-count");
  if (resultCount) resultCount.textContent = `Showing ${items.length} of ${activeCount} products`;
  const empty = $("#empty-state");
  if (empty) empty.hidden = items.length !== 0;
  grid.hidden = items.length === 0;
  renderFilterChips();
  updateCategoryButtons();
}

function renderMiniProducts() {
  const target = $("#mini-products");
  if (!target) return;
  const favourites = [products[0], products[9], products[1], products[4]].filter(Boolean);
  target.innerHTML = favourites.map((product) => `
    <div class="mini-product">
      <div class="mini-product-art">${productVisual(product)}</div>
      <div class="mini-product-info"><b>${escapeHtml(product.name)}</b><span>${displayPrice(product.price)}</span></div>
    </div>`).join("");
}

function updateCartCount() {
  const count = Object.values(state.cart).reduce((sum, quantity) => sum + quantity, 0);
  const countLabel = $("#cart-count");
  const drawerCount = $("#drawer-count");
  const summary = $("#cart-summary");
  if (countLabel) countLabel.textContent = String(count);
  if (drawerCount) drawerCount.textContent = `(${count})`;
  if (summary) summary.hidden = count === 0;
}

function renderCart() {
  const cartItems = $("#cart-items");
  if (!cartItems) return;
  const entries = Object.entries(state.cart).filter(([, quantity]) => quantity > 0);
  if (entries.length === 0) {
    cartItems.innerHTML = `<div class="cart-empty"><span>🛒</span><h3>Your cart is waiting</h3><p>Add something delicious to get started.</p><button class="button button-green" id="continue-shopping" type="button">Continue shopping</button></div>`;
    const subtotalLabel = $("#cart-subtotal");
    if (subtotalLabel) subtotalLabel.textContent = money(0);
    updateCartCount();
    return;
  }

  let subtotal = 0;
  cartItems.innerHTML = entries.map(([id, quantity]) => {
    const product = products.find((item) => String(item.id) === String(id));
    if (!product || !hasPrice(product.price)) return "";
    const lineTotal = Number(product.price) * quantity;
    subtotal += lineTotal;
    return `<div class="cart-row">
      <div class="cart-row-art">${productVisual(product)}</div>
      <div class="cart-row-info"><b>${escapeHtml(product.name)}</b><small>${escapeHtml(product.weight || "Pack size to confirm")} · ${money(product.price)}</small>
        <div class="cart-row-controls"><button type="button" data-cart-action="minus" data-id="${escapeHtml(id)}" aria-label="Decrease">−</button><span>${quantity}</span><button type="button" data-cart-action="plus" data-id="${escapeHtml(id)}" aria-label="Increase">+</button></div>
      </div>
      <div class="cart-row-price">${money(lineTotal)}<button class="remove-item" type="button" data-cart-action="remove" data-id="${escapeHtml(id)}">Remove</button></div>
    </div>`;
  }).join("");

  const subtotalLabel = $("#cart-subtotal");
  if (subtotalLabel) subtotalLabel.textContent = money(subtotal);
  updateCartCount();
}

function addToCart(id) {
  const product = products.find((item) => String(item.id) === String(id));
  if (!product) return;
  if (!hasPrice(product.price)) {
    const message = `Assalam-o-Alaikum GB Dry Fruit! Please share the current price and availability of ${product.name} (${product.weight || "pack size to confirm"}).`;
    openWhatsApp(message);
    return;
  }
  const quantity = state.quantities[id] || 1;
  state.cart[id] = (state.cart[id] || 0) + quantity;
  renderCart();
  showToast(`${product.name} added to your cart.`);
}

function setQuantity(id, change) {
  state.quantities[id] = Math.max(1, Math.min(99, (state.quantities[id] || 1) + change));
  const label = $(`#qty-${CSS.escape(String(id))}`);
  if (label) label.textContent = String(state.quantities[id]);
}

function openCategoryMenu() {
  const sidebar = $("#sidebar");
  const backdrop = $("#sidebar-backdrop");
  if (sidebar) sidebar.classList.add("mobile-open");
  if (backdrop) backdrop.classList.add("show");
  $("#mobile-menu")?.setAttribute("aria-expanded", "true");
  document.body.style.overflow = "hidden";
}

function closeCategoryMenu() {
  $("#sidebar")?.classList.remove("mobile-open");
  $("#sidebar-backdrop")?.classList.remove("show");
  $("#mobile-menu")?.setAttribute("aria-expanded", "false");
  document.body.style.overflow = "";
}

function openCart() {
  const drawer = $("#cart-drawer");
  const backdrop = $("#drawer-backdrop");
  if (drawer) {
    drawer.classList.add("open");
    drawer.setAttribute("aria-hidden", "false");
  }
  if (backdrop) backdrop.classList.add("show");
  $("#open-cart")?.setAttribute("aria-expanded", "true");
  document.body.style.overflow = "hidden";
}

function closeCart() {
  $("#cart-drawer")?.classList.remove("open");
  $("#drawer-backdrop")?.classList.remove("show");
  $("#cart-drawer")?.setAttribute("aria-hidden", "true");
  $("#open-cart")?.setAttribute("aria-expanded", "false");
  document.body.style.overflow = "";
}

// The header button also calls this function inline in index.html.
window.openGBDryFruitCart = openCart;

function deliveryChargeFor(city) {
  const normalized = String(city || "").trim().toLowerCase().replace(/\s+/g, " ");
  return /^(gilgit|gilgit city)$/.test(normalized) ? DELIVERY_GILGIT : DELIVERY_OTHER_CITIES;
}

function updateDeliveryEstimate() {
  const cityInput = $("#customer-city");
  const estimate = $("#delivery-estimate");
  if (!cityInput || !estimate) return;
  const city = cityInput.value.trim();
  if (!city) {
    estimate.textContent = "Enter your city to see the delivery charge included in your order.";
    return;
  }
  estimate.textContent = `Delivery for ${city}: ${money(deliveryChargeFor(city))}`;
}

function openCheckout() {
  if (Object.keys(state.cart).length === 0) {
    showToast("Your cart is empty. Add a product first.");
    return;
  }
  const modal = $("#checkout-modal");
  if (!modal) {
    showToast("Checkout form is unavailable. Please refresh the website.");
    return;
  }
  modal.hidden = false;
  updateDeliveryEstimate();
  $("#customer-name")?.focus();
}

function closeCheckout() {
  const modal = $("#checkout-modal");
  if (modal) modal.hidden = true;
}

function openWhatsApp(message) {
  if (!/^\d{10,15}$/.test(WHATSAPP_NUMBER)) {
    showToast("Please check the business WhatsApp number in script.js.");
    return;
  }
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  const popup = window.open(url, "_blank", "noopener,noreferrer");
  if (!popup) {
    window.location.href = url;
  }
}

function submitWhatsAppOrder(event) {
  event.preventDefault();
  const entries = Object.entries(state.cart).filter(([, quantity]) => quantity > 0);
  if (entries.length === 0) {
    showToast("Your cart is empty.");
    closeCheckout();
    return;
  }

  const name = $("#customer-name")?.value.trim() || "";
  const phone = $("#customer-phone")?.value.trim() || "";
  const city = $("#customer-city")?.value.trim() || "";
  const address = $("#customer-address")?.value.trim() || "";
  const landmark = $("#customer-landmark")?.value.trim() || "Not provided";
  const note = $("#customer-note")?.value.trim() || "Not provided";
  const phoneDigits = phone.replace(/\D/g, "");

  if (!name || !city || !address || phoneDigits.length < 10 || phoneDigits.length > 15) {
    showToast("Please enter your name, valid phone number, city and complete address.");
    return;
  }

  const orderLines = [];
  let subtotal = 0;
  for (const [id, quantity] of entries) {
    const product = products.find((item) => String(item.id) === String(id));
    if (!product || !hasPrice(product.price)) continue;
    const lineTotal = Number(product.price) * quantity;
    subtotal += lineTotal;
    orderLines.push(`• ${product.name} (${product.weight || "pack size to confirm"}) x ${quantity} = ${money(lineTotal)}`);
  }
  if (!orderLines.length) {
    showToast("No priced products found in your cart. Please add a priced product.");
    return;
  }

  const delivery = deliveryChargeFor(city);
  const grandTotal = subtotal + delivery;
  const message = [
    "Assalam-o-Alaikum GB Dry Fruit! I would like to place an order:",
    "",
    ...orderLines,
    "",
    `Subtotal: ${money(subtotal)}`,
    `Delivery (${city}): ${money(delivery)}`,
    `Grand total: ${money(grandTotal)}`,
    "",
    `Customer name: ${name}`,
    `Customer mobile: ${phone}`,
    `City: ${city}`,
    `Full address: ${address}`,
    `Nearest landmark: ${landmark}`,
    `Order / delivery note: ${note}`
  ].join("\n");

  openWhatsApp(message);
}

function bindEvents() {
  $("#search-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    state.search = $("#search-input")?.value || "";
    renderProducts();
    $("#shop")?.scrollIntoView({ behavior: "smooth" });
  });
  $("#search-input")?.addEventListener("input", (event) => {
    state.search = event.target.value;
    renderProducts();
  });
  $("#category-list")?.addEventListener("click", (event) => {
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
  $("#apply-filter")?.addEventListener("click", () => {
    state.min = Math.max(0, Number($("#min-price")?.value) || 0);
    state.max = Math.max(state.min, Number($("#max-price")?.value) || 1000000000);
    renderProducts();
  });
  $("#reset-filters")?.addEventListener("click", () => {
    state.category = "All";
    state.search = "";
    state.min = 0;
    state.max = 1000000000;
    if ($("#search-input")) $("#search-input").value = "";
    if ($("#min-price")) $("#min-price").value = "0";
    if ($("#max-price")) $("#max-price").value = "1000000000";
    if ($("#sort-select")) $("#sort-select").value = "featured";
    state.sort = "featured";
    renderProducts();
  });
  $("#clear-search")?.addEventListener("click", () => $("#reset-filters")?.click());
  $("#sort-select")?.addEventListener("change", (event) => {
    state.sort = event.target.value;
    renderProducts();
  });

  $("#product-grid")?.addEventListener("click", (event) => {
    const addButton = event.target.closest("[data-add]");
    if (addButton) {
      addToCart(addButton.dataset.add);
      return;
    }
    const quantityButton = event.target.closest("[data-qty]");
    if (quantityButton) {
      setQuantity(quantityButton.dataset.id, quantityButton.dataset.qty === "plus" ? 1 : -1);
      return;
    }
    const favourite = event.target.closest(".product-fav");
    if (favourite) {
      favourite.textContent = favourite.textContent === "♡" ? "♥" : "♡";
      favourite.style.color = favourite.textContent === "♥" ? "#dc7272" : "";
      showToast("Your favourite list is just for this visit.");
    }
  });

  $("#cart-items")?.addEventListener("click", (event) => {
    if (event.target.closest("#continue-shopping")) {
      closeCart();
      $("#shop")?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    const button = event.target.closest("[data-cart-action]");
    if (!button) return;
    const id = button.dataset.id;
    const action = button.dataset.cartAction;
    if (action === "remove") delete state.cart[id];
    else if (action === "plus") state.cart[id] = Math.min(99, (state.cart[id] || 0) + 1);
    else state.cart[id] = Math.max(0, (state.cart[id] || 0) - 1);
    if (state.cart[id] === 0) delete state.cart[id];
    renderCart();
  });

  $("#open-cart")?.addEventListener("click", openCart);
  $("#close-cart")?.addEventListener("click", closeCart);
  $("#drawer-backdrop")?.addEventListener("click", closeCart);
  $("#checkout-whatsapp")?.addEventListener("click", openCheckout);
  $("#checkout-form")?.addEventListener("submit", submitWhatsAppOrder);
  $("#customer-city")?.addEventListener("input", updateDeliveryEstimate);
  $("#close-checkout")?.addEventListener("click", closeCheckout);
  $("#cancel-checkout")?.addEventListener("click", closeCheckout);
  $("#checkout-modal-backdrop")?.addEventListener("click", closeCheckout);

  $("#mobile-menu")?.addEventListener("click", openCategoryMenu);
  $("#close-sidebar")?.addEventListener("click", closeCategoryMenu);
  $("#sidebar-backdrop")?.addEventListener("click", closeCategoryMenu);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeCategoryMenu();
      closeCheckout();
      closeCart();
    }
  });

  const contactLink = $("#contact-whatsapp");
  if (contactLink) {
    const contactMessage = "Assalam-o-Alaikum GB Dry Fruit! I would like to know more about your products.";
    contactLink.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(contactMessage)}`;
    contactLink.target = "_blank";
    contactLink.rel = "noopener noreferrer";
  }
  const year = $("#year");
  if (year) year.textContent = String(new Date().getFullYear());
}

async function startStore() {
  bindEvents();
  try {
    const response = await fetch("./products.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`Could not load products.json (${response.status})`);
    const catalogue = await response.json();
    if (!Array.isArray(catalogue) || catalogue.length === 0) throw new Error("products.json is empty or invalid");
    products = catalogue;
    renderCategoryButtons();
    renderProducts();
    renderMiniProducts();
    renderCart();
  } catch (error) {
    console.error("GB Dry Fruit catalogue error:", error);
    const grid = $("#product-grid");
    if (grid) grid.innerHTML = `<p class="empty-state">We could not load the product catalogue. Please refresh the page or contact GB Dry Fruit.</p>`;
    const resultCount = $("#result-count");
    if (resultCount) resultCount.textContent = "Product catalogue unavailable";
  }
}

startStore();
