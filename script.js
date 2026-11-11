/* GB Dry Fruit storefront — cart + delivery checkout fix
   Reads products from ./products.json. No customer data is stored.
*/
(() => {
  "use strict";

  const WHATSAPP_NUMBER = "923555850225";
  let products = [];
  const state = {
    category: "All",
    search: "",
    min: 0,
    max: 1000000,
    sort: "featured",
    cart: Object.create(null),
    quantities: Object.create(null)
  };

  const $ = (selector) => document.querySelector(selector);
  const money = (amount) => `Rs. ${Number(amount || 0).toLocaleString("en-PK")}`;
  const hasPrice = (product) => product.price !== null && product.price !== undefined && product.price !== "" && Number.isFinite(Number(product.price));
  const displayPrice = (price) => price === null || price === undefined || price === "" ? "Price on request" : money(price);

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[char]);
  }

  function productVisual(product, extraClass = "") {
    const image = product.image ? String(product.image) : "";
    const emoji = escapeHtml(product.emoji || "🥜");
    if (image) {
      return `<img class="product-photo ${extraClass}" src="${escapeHtml(image)}" alt="${escapeHtml(product.name)}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.hidden=false"><span class="product-emoji ${extraClass}" aria-hidden="true" hidden>${emoji}</span>`;
    }
    return `<span class="product-emoji ${extraClass}" aria-hidden="true">${emoji}</span>`;
  }

  function getFilteredProducts() {
    const query = state.search.trim().toLowerCase();
    const items = products.filter((product) => {
      const matchesCategory = state.category === "All" || product.category === state.category;
      const text = `${product.name || ""} ${product.category || ""} ${product.search || ""}`.toLowerCase();
      const matchesSearch = !query || text.includes(query);
      const matchesPrice = !hasPrice(product) || (Number(product.price) >= state.min && Number(product.price) <= state.max);
      return matchesCategory && matchesSearch && matchesPrice && product.active !== false;
    });

    if (state.sort === "price-low") items.sort((a, b) => (hasPrice(a) ? Number(a.price) : Infinity) - (hasPrice(b) ? Number(b.price) : Infinity));
    else if (state.sort === "price-high") items.sort((a, b) => (hasPrice(b) ? Number(b.price) : -Infinity) - (hasPrice(a) ? Number(a.price) : -Infinity));
    else if (state.sort === "name") items.sort((a, b) => String(a.name).localeCompare(String(b.name)));
    else items.sort((a, b) => Number(a.featured ?? a.id) - Number(b.featured ?? b.id));
    return items;
  }

  function renderCategoryButtons() {
    const list = $("#category-list");
    if (!list) return;
    const categories = [...new Set(products.map((p) => p.category).filter(Boolean))];
    const buttons = [
      `<button class="category-button ${state.category === "All" ? "selected" : ""}" data-category="All"><span>✦</span> All products <b>${products.filter(p => p.active !== false).length}</b></button>`,
      ...categories.map((category) => {
        const count = products.filter((p) => p.category === category && p.active !== false).length;
        return `<button class="category-button ${state.category === category ? "selected" : ""}" data-category="${escapeHtml(category)}"><span>◈</span> ${escapeHtml(category)} <b>${count}</b></button>`;
      })
    ];
    list.innerHTML = buttons.join("");
  }

  function renderFilterChips() {
    const chips = [];
    if (state.category !== "All") chips.push(state.category);
    if (state.search) chips.push(`Search: ${state.search}`);
    if (state.min > 0 || state.max < 1000000) chips.push(`${money(state.min)} – ${money(state.max)}`);
    const target = $("#active-filters");
    if (target) target.innerHTML = chips.map((chip) => `<span class="filter-chip">${escapeHtml(chip)}</span>`).join("");
  }

  function renderProducts() {
    const grid = $("#product-grid");
    if (!grid) return;
    const items = getFilteredProducts();
    grid.innerHTML = items.map((product) => {
      const priced = hasPrice(product);
      const label = priced ? "Add" : "Ask on WhatsApp";
      const klass = priced ? "product-price" : "product-price price-on-request";
      return `<article class="product-card">
        <div class="product-image">
          <span class="product-label">${escapeHtml(product.tag || "GB SELECTION")}</span>
          <button class="product-fav" type="button" aria-label="Save ${escapeHtml(product.name)}" title="Save for later">♡</button>
          ${productVisual(product)}
        </div>
        <div class="product-details">
          <div class="product-category">${escapeHtml(product.category || "Dry Fruits")}</div>
          <h3 class="product-name" title="${escapeHtml(product.name)}">${escapeHtml(product.name)}</h3>
          <p class="product-weight">${escapeHtml(product.weight || "Pack size to confirm")}</p>
          <p class="${klass}">${displayPrice(product.price)}</p>
          <div class="product-controls">
            <div class="quantity-control" aria-label="Quantity for ${escapeHtml(product.name)}">
              <button type="button" data-qty="minus" data-id="${Number(product.id)}" aria-label="Decrease quantity">−</button>
              <span id="qty-${Number(product.id)}">${state.quantities[product.id] || 1}</span>
              <button type="button" data-qty="plus" data-id="${Number(product.id)}" aria-label="Increase quantity">+</button>
            </div>
            <button class="add-button" type="button" data-add="${Number(product.id)}">${label}</button>
          </div>
        </div>
      </article>`;
    }).join("");
    const count = $("#result-count");
    if (count) count.textContent = `Showing ${items.length} of ${products.filter(p => p.active !== false).length} products`;
    const empty = $("#empty-state");
    if (empty) empty.hidden = items.length !== 0;
    grid.hidden = items.length === 0;
    renderFilterChips();
    document.querySelectorAll(".category-button").forEach((button) => button.classList.toggle("selected", button.dataset.category === state.category));
  }

  function renderMiniProducts() {
    const target = $("#mini-products");
    if (!target) return;
    const favourites = [products[0], products[9], products[1], products[4]].filter(Boolean);
    target.innerHTML = favourites.map((product) => `<div class="mini-product"><div class="mini-product-art">${productVisual(product)}</div><div class="mini-product-info"><b>${escapeHtml(product.name)}</b><span>${displayPrice(product.price)}</span></div></div>`).join("");
  }

  function showToast(message) {
    const toast = $("#toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove("show"), 2800);
  }

  function updateCartCount() {
    const count = Object.values(state.cart).reduce((sum, quantity) => sum + quantity, 0);
    const cartCount = $("#cart-count");
    const drawerCount = $("#drawer-count");
    const summary = $("#cart-summary");
    if (cartCount) cartCount.textContent = String(count);
    if (drawerCount) drawerCount.textContent = `(${count})`;
    if (summary) summary.hidden = count === 0;
  }

  function renderCart() {
    const target = $("#cart-items");
    if (!target) return;
    const entries = Object.entries(state.cart).filter(([, quantity]) => quantity > 0);
    if (entries.length === 0) {
      target.innerHTML = `<div class="cart-empty"><span>🛒</span><h3>Your cart is waiting</h3><p>Add something delicious to get started.</p><button class="button button-green" id="continue-shopping" type="button">Continue shopping</button></div>`;
      const subtotal = $("#cart-subtotal");
      if (subtotal) subtotal.textContent = money(0);
      updateCartCount();
      return;
    }

    let total = 0;
    target.innerHTML = entries.map(([id, quantity]) => {
      const product = products.find((item) => Number(item.id) === Number(id));
      if (!product || !hasPrice(product)) return "";
      const lineTotal = Number(product.price) * quantity;
      total += lineTotal;
      return `<div class="cart-row">
        <div class="cart-row-art">${productVisual(product)}</div>
        <div class="cart-row-info"><b>${escapeHtml(product.name)}</b><small>${escapeHtml(product.weight || "") } · ${money(product.price)}</small>
          <div class="cart-row-controls"><button type="button" data-cart-action="minus" data-id="${id}" aria-label="Decrease">−</button><span>${quantity}</span><button type="button" data-cart-action="plus" data-id="${id}" aria-label="Increase">+</button></div>
        </div>
        <div class="cart-row-price">${money(lineTotal)}<button class="remove-item" type="button" data-cart-action="remove" data-id="${id}">Remove</button></div>
      </div>`;
    }).join("");
    const subtotal = $("#cart-subtotal");
    if (subtotal) subtotal.textContent = money(total);
    updateCartCount();
  }

  function openCart() {
    const drawer = $("#cart-drawer");
    const backdrop = $("#drawer-backdrop");
    if (drawer) { drawer.classList.add("open"); drawer.setAttribute("aria-hidden", "false"); }
    if (backdrop) backdrop.classList.add("show");
    const trigger = $("#open-cart");
    if (trigger) trigger.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  }
  function closeCart() {
    const drawer = $("#cart-drawer");
    const backdrop = $("#drawer-backdrop");
    if (drawer) { drawer.classList.remove("open"); drawer.setAttribute("aria-hidden", "true"); }
    if (backdrop) backdrop.classList.remove("show");
    const trigger = $("#open-cart");
    if (trigger) trigger.setAttribute("aria-expanded", "false");
    if (!$("#checkout-modal") || $("#checkout-modal").hidden) document.body.style.overflow = "";
  }
  // Keep the inline header action in index.html compatible as well.
  window.openGBDryFruitCart = openCart;

  function addToCart(id) {
    const product = products.find((item) => Number(item.id) === Number(id));
    if (!product) { showToast("This product could not be found. Refresh the page and try again."); return; }
    if (!hasPrice(product)) {
      const message = `Assalam-o-Alaikum GB Dry Fruit! Please share the current price and pack size for ${product.name}.`;
      openWhatsApp(message);
      return;
    }
    const key = String(product.id);
    const quantity = state.quantities[key] || 1;
    state.cart[key] = (state.cart[key] || 0) + quantity;
    renderCart();
     openCart();
    showToast(`${product.name} added to your cart.`);
  }

  function setQuantity(id, change) {
    const key = String(id);
    state.quantities[key] = Math.max(1, Math.min(99, (state.quantities[key] || 1) + change));
    const label = $(`#qty-${key}`);
    if (label) label.textContent = String(state.quantities[key]);
  }

  function openWhatsApp(message) {
    if (!/^\d{10,15}$/.test(WHATSAPP_NUMBER)) {
      showToast("The WhatsApp number in script.js needs to be checked.");
      return;
    }
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    const whatsappWindow = window.open(url, "_blank");
    if (whatsappWindow) whatsappWindow.opener = null;
    else window.location.href = url; // fallback if the browser blocks a new tab
  }

  function normalizedCity(city) {
    return String(city || "").trim().toLowerCase().replace(/\s+city$/, "");
  }
  function deliveryFee(city) {
    return normalizedCity(city) === "gilgit" ? 150 : 300;
  }
  function updateDeliveryEstimate() {
    const city = $("#customer-city")?.value || "";
    const output = $("#delivery-estimate");
    if (!output) return;
    if (!city.trim()) output.textContent = "Enter your city to see the delivery charge included in your order.";
    else output.textContent = `Delivery charge for ${city.trim()}: ${money(deliveryFee(city))}.`;
  }

  function openCheckout() {
    if (Object.keys(state.cart).length === 0) {
      showToast("Your cart is empty. Add a product first.");
      return;
    }
    const modal = $("#checkout-modal");
    if (!modal) { showToast("Checkout form is missing. Please refresh the page."); return; }
    closeCart();
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    updateDeliveryEstimate();
    $("#customer-name")?.focus();
  }
  function closeCheckout() {
    const modal = $("#checkout-modal");
    if (modal) modal.hidden = true;
    document.body.style.overflow = "";
  }

  function checkout(event) {
    if (event) event.preventDefault();
    const form = $("#checkout-form");
    if (!form) { showToast("Checkout form is unavailable. Please refresh the page."); return; }
    if (!form.reportValidity()) return;

    const name = $("#customer-name").value.trim();
    const phone = $("#customer-phone").value.trim();
    const city = $("#customer-city").value.trim();
    const address = $("#customer-address").value.trim();
    const landmark = $("#customer-landmark")?.value.trim() || "Not provided";
    const note = $("#customer-note")?.value.trim() || "Not provided";
    if (!name || !phone || !city || !address) { showToast("Please complete all required delivery details."); return; }

    const entries = Object.entries(state.cart).filter(([, quantity]) => quantity > 0);
    if (!entries.length) { showToast("Your cart is empty."); closeCheckout(); return; }

    const lines = [];
    let subtotal = 0;
    for (const [id, quantity] of entries) {
      const product = products.find((item) => Number(item.id) === Number(id));
      if (!product || !hasPrice(product)) continue;
      const lineTotal = Number(product.price) * quantity;
      subtotal += lineTotal;
      lines.push(`• ${product.name} (${product.weight || "Pack size to confirm"}) × ${quantity} = ${money(lineTotal)}`);
    }
    if (!lines.length) { showToast("No priced products are in the cart."); return; }

    const delivery = deliveryFee(city);
    const grandTotal = subtotal + delivery;
    const message = [
      "Assalam-o-Alaikum GB Dry Fruit! I would like to place an order:",
      "",
      ...lines,
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

    closeCheckout();
    openWhatsApp(message);
  }

  function openCategoryMenu() {
    $("#sidebar")?.classList.add("mobile-open");
    $("#sidebar-backdrop")?.classList.add("show");
    $("#mobile-menu")?.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  }
  function closeCategoryMenu() {
    $("#sidebar")?.classList.remove("mobile-open");
    $("#sidebar-backdrop")?.classList.remove("show");
    $("#mobile-menu")?.setAttribute("aria-expanded", "false");
    if (!$("#cart-drawer")?.classList.contains("open") && $("#checkout-modal")?.hidden !== false) document.body.style.overflow = "";
  }

  function bindEvents() {
    $("#search-form")?.addEventListener("submit", (event) => {
      event.preventDefault();
      state.search = $("#search-input")?.value || "";
      renderProducts();
      $("#shop")?.scrollIntoView({ behavior: "smooth" });
    });
    $("#search-input")?.addEventListener("input", (event) => { state.search = event.target.value; renderProducts(); });
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
      const maxValue = Number($("#max-price")?.value);
      state.max = Math.max(state.min, Number.isFinite(maxValue) && maxValue > 0 ? maxValue : 1000000);
      renderProducts();
    });
    $("#reset-filters")?.addEventListener("click", () => {
      state.category = "All"; state.search = ""; state.min = 0; state.max = 1000000;
      if ($("#search-input")) $("#search-input").value = "";
      if ($("#min-price")) $("#min-price").value = "0";
      if ($("#max-price")) $("#max-price").value = "1000000";
      renderProducts();
    });
    $("#clear-search")?.addEventListener("click", () => $("#reset-filters")?.click());
    $("#sort-select")?.addEventListener("change", (event) => { state.sort = event.target.value; renderProducts(); });

    $("#product-grid")?.addEventListener("click", (event) => {
      const add = event.target.closest("[data-add]");
      if (add) { addToCart(Number(add.dataset.add)); return; }
      const qty = event.target.closest("[data-qty]");
      if (qty) { setQuantity(Number(qty.dataset.id), qty.dataset.qty === "plus" ? 1 : -1); return; }
      const fav = event.target.closest(".product-fav");
      if (fav) { fav.textContent = fav.textContent === "♡" ? "♥" : "♡"; fav.style.color = fav.textContent === "♥" ? "#dc7272" : ""; showToast("Your favourite list is just for this visit."); }
    });

    $("#cart-items")?.addEventListener("click", (event) => {
      if (event.target.id === "continue-shopping") { closeCart(); $("#shop")?.scrollIntoView({ behavior: "smooth" }); return; }
      const button = event.target.closest("[data-cart-action]");
      if (!button) return;
      const id = String(button.dataset.id);
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
    $("#checkout-form")?.addEventListener("submit", checkout);
    $("#customer-city")?.addEventListener("input", updateDeliveryEstimate);
    $("#close-checkout")?.addEventListener("click", closeCheckout);
    $("#cancel-checkout")?.addEventListener("click", () => { closeCheckout(); openCart(); });
    $("#checkout-modal-backdrop")?.addEventListener("click", closeCheckout);

    $("#mobile-menu")?.addEventListener("click", openCategoryMenu);
    $("#close-sidebar")?.addEventListener("click", closeCategoryMenu);
    $("#sidebar-backdrop")?.addEventListener("click", closeCategoryMenu);
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeCategoryMenu();
        closeCart();
        if ($("#checkout-modal") && !$("#checkout-modal").hidden) closeCheckout();
      }
    });

    const contact = $("#contact-whatsapp");
    if (contact) {
      contact.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Assalam-o-Alaikum GB Dry Fruit! I would like to know more about your products.")}`;
      contact.addEventListener("click", (event) => {
        event.currentTarget.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Assalam-o-Alaikum GB Dry Fruit! I would like to know more about your products.")}`;
      });
    }
    const year = $("#year");
    if (year) year.textContent = String(new Date().getFullYear());
  }

  async function startStore() {
    const grid = $("#product-grid");
    try {
      const response = await fetch("./products.json", { cache: "no-store" });
      if (!response.ok) throw new Error(`Could not load products.json (${response.status})`);
      const catalogue = await response.json();
      if (!Array.isArray(catalogue) || catalogue.length === 0) throw new Error("products.json is empty or invalid");
      products = catalogue;
      // Keep higher-priced products visible by default (e.g. Kaju at Rs. 7,000).
      if ($("#max-price")) $("#max-price").value = String(state.max);
      renderCategoryButtons();
      bindEvents();
      renderProducts();
      renderMiniProducts();
      renderCart();
    } catch (error) {
      console.error("GB Dry Fruit catalogue error:", error);
      if (grid) grid.innerHTML = `<p class="empty-state">We could not load the product catalogue. Please refresh the page or contact GB Dry Fruit.</p>`;
      const count = $("#result-count");
      if (count) count.textContent = "Product catalogue unavailable";
      showToast("Product list could not load. Please refresh the page.");
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

  // Update cart products and total
  renderCart();

  // Automatically open the right-side cart
  openCart();

  showToast("Added to your cart!");
}

  }

  startStore();
})();
