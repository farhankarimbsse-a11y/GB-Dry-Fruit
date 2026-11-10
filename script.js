/* GB Dry Fruit storefront
   WhatsApp number is stored in international format (Pakistan: 92 + number, no leading 0).
   Product prices below follow the user's reference screenshots. Items whose screenshot price
   was not readable are marked "Price on request" rather than guessing a price.
*/
const WHATSAPP_NUMBER = "923555850225";

const products = [
  {id:1,name:"Almond Without Shell (Badam)",category:"Nuts",weight:"200 Grams",price:875,emoji:"🥜",image:"images/almonds.webp",tag:"CUSTOMER FAVOURITE",featured:1,search:"badam almond almonds without shell"},
  {id:2,name:"Cashew Nuts Plain (Kaju)",category:"Nuts",weight:"200 Grams",price:845,emoji:"🌰",image:"images/cashews.webp",tag:"POPULAR",featured:2,search:"kaju cashew cashews plain"},
  {id:3,name:"Pistachios (Pista)",category:"Nuts",weight:"Pack size to confirm",price:null,emoji:"💚",image:"images/pistachios.webp",tag:"PREMIUM",featured:3,search:"pista pistachio pistachios"},
  {id:4,name:"Walnuts (Akhrot)",category:"Nuts",weight:"Pack size to confirm",price:null,emoji:"🌰",image:"images/walnuts.webp",tag:"FRESH PICK",featured:4,search:"akhrot walnut walnuts"},
  {id:5,name:"Peanut Roasted",category:"Nuts",weight:"200 Grams",price:375,emoji:"🥜",tag:"GREAT VALUE",featured:5,search:"mung phali peanut peanuts roasted"},

  {id:6,name:"Pumpkin Seed",category:"Seeds",weight:"200 Grams",price:460,emoji:"🌱",tag:"NUTRITIOUS",featured:6,search:"pumpkin seed seeds"},
  {id:7,name:"Sun Flower Seed Whole",category:"Seeds",weight:"200 Grams",price:140,emoji:"🌻",tag:"EVERYDAY FAVOURITE",featured:7,search:"sunflower sun flower seed whole seeds"},
  {id:8,name:"Chia Seeds",category:"Seeds",weight:"100 Grams",price:345,emoji:"⚫",tag:"NUTRITIOUS",featured:8,search:"chia seed seeds"},
  {id:9,name:"Charmaghaz",category:"Seeds",weight:"100 Grams",price:165,emoji:"🌿",tag:"MOUNTAIN FAVOURITE",featured:9,search:"charmaghaz seeds mix"},

  {id:10,name:"Ajwa Dates",category:"Dates",weight:"250 Grams",price:1050,emoji:"🟤",image:"images/dates.webp",tag:"PREMIUM DATES",featured:10,search:"ajwa khajoor dates"},
  {id:11,name:"Mazafati Dates",category:"Dates",weight:"500 Grams",price:495,emoji:"🟤",image:"images/dates.webp",tag:"CUSTOMER FAVOURITE",featured:11,search:"mazafati mazafati dates khajoor"},
  {id:12,name:"Mabroom Dates",category:"Dates",weight:"250 Grams",price:1050,emoji:"🌴",image:"images/dates.webp",tag:"RICH & DELICIOUS",featured:12,search:"mabroom dates khajoor"},
  {id:13,name:"Rubai Dates",category:"Dates",weight:"500 Grams",price:750,emoji:"🌴",image:"images/dates.webp",tag:"SWEET & SOFT",featured:13,search:"rubai dates khajoor"},

  {id:14,name:"Raisin Goal",category:"Dried Fruits",weight:"200 Grams",price:255,emoji:"🍇",image:"images/raisins.webp",tag:"NATURALLY SWEET",featured:14,search:"raisin goal golden raisins kishmish"},
  {id:15,name:"Dried Apricots (Khubani)",category:"Dried Fruits",weight:"Pack size to confirm",price:null,emoji:"🍑",image:"images/apricots.webp",tag:"MOUNTAIN PICK",featured:15,search:"khubani dried apricot apricots"},
  {id:16,name:"Pineapple Dried",category:"Dried Fruits",weight:"100 Grams",price:350,emoji:"🍍",tag:"TROPICAL TREAT",featured:16,search:"pineapple dried pineapple"},

  {id:17,name:"Phul Makhana",category:"Snacks & Mixes",weight:"50 Grams",price:255,emoji:"⚪",tag:"LIGHT SNACK",featured:17,search:"phul makhana fox nuts lotus seeds"},
  {id:18,name:"Sounf Misri Mix",category:"Snacks & Mixes",weight:"200 Grams",price:145,emoji:"🌿",tag:"SWEET & FRESH",featured:18,search:"sounf misri fennel sugar mix"},
  {id:19,name:"Nariyal Powder",category:"Snacks & Mixes",weight:"100 Grams",price:165,emoji:"🥥",tag:"KITCHEN ESSENTIAL",featured:19,search:"nariyal coconut powder"},
  {id:20,name:"Black Chana Roasted",category:"Snacks & Mixes",weight:"200 Grams",price:165,emoji:"🫘",tag:"TOP SELLER",featured:20,search:"black chana roasted chickpeas kala chana"}
];

const state = {category:"All",search:"",min:0,max:2500,sort:"featured",cart:{},quantities:{}};
const $ = (selector) => document.querySelector(selector);
const money = (amount) => `Rs. ${Number(amount).toLocaleString("en-PK")}`;
const priceLabel = (product) => product.price == null ? "Price on request" : money(product.price);

function getFilteredProducts(){
  let items = products.filter((product) => {
    const matchesCategory = state.category === "All" || product.category === state.category;
    const query = state.search.trim().toLowerCase();
    const matchesSearch = !query || `${product.name} ${product.category} ${product.search}`.toLowerCase().includes(query);
    const priceFilterActive = state.min > 0 || state.max < 2500;
    const matchesPrice = product.price == null ? !priceFilterActive : product.price >= state.min && product.price <= state.max;
    return matchesCategory && matchesSearch && matchesPrice;
  });
  if(state.sort === "price-low") items.sort((a,b)=>(a.price ?? Infinity)-(b.price ?? Infinity));
  else if(state.sort === "price-high") items.sort((a,b)=>(b.price ?? -Infinity)-(a.price ?? -Infinity));
  else if(state.sort === "name") items.sort((a,b)=>a.name.localeCompare(b.name));
  else items.sort((a,b)=>a.featured-b.featured);
  return items;
}

function productVisual(product, extraClass = "") {
  if (product.image) {
    return `<img class="product-photo ${extraClass}" src="${product.image}" alt="${escapeHtml(product.name)}" loading="lazy" />`;
  }
  return `<span class="product-emoji ${extraClass}" aria-hidden="true">${product.emoji}</span>`;
}

function renderProducts(){
  const items = getFilteredProducts();
  const grid = $("#product-grid");
  grid.innerHTML = items.map(product => `
    <article class="product-card">
      <div class="product-image">
        <span class="product-label">${escapeHtml(product.tag)}</span>
        <button class="product-fav" type="button" aria-label="Save ${escapeHtml(product.name)}" title="Save for later">♡</button>
        ${productVisual(product)}
      </div>
      <div class="product-details">
        <div class="product-category">${escapeHtml(product.category)}</div>
        <h3 class="product-name" title="${escapeHtml(product.name)}">${escapeHtml(product.name)}</h3>
        <p class="product-weight">${escapeHtml(product.weight)}</p>
        <p class="product-price ${product.price == null ? "price-on-request" : ""}">${priceLabel(product)}</p>
        <div class="product-controls">
          <div class="quantity-control" aria-label="Quantity for ${escapeHtml(product.name)}">
            <button type="button" data-qty="minus" data-id="${product.id}" aria-label="Decrease quantity">−</button>
            <span id="qty-${product.id}">${state.quantities[product.id] || 1}</span>
            <button type="button" data-qty="plus" data-id="${product.id}" aria-label="Increase quantity">+</button>
          </div>
          <button class="add-button" type="button" data-add="${product.id}"><span>＋</span> Add</button>
        </div>
      </div>
    </article>`).join("");
  $("#result-count").textContent = `Showing ${items.length} of ${products.length} products`;
  $("#empty-state").hidden = items.length !== 0;
  grid.hidden = items.length === 0;
  renderFilterChips();
}

function renderFilterChips(){
  const chips = [];
  if(state.category !== "All") chips.push(state.category);
  if(state.search) chips.push(`Search: ${state.search}`);
  if(state.min > 0 || state.max < 2500) chips.push(`${money(state.min)} – ${money(state.max)}`);
  $("#active-filters").innerHTML = chips.map(chip=>`<span class="filter-chip">${escapeHtml(chip)}</span>`).join("");
}
function escapeHtml(value){return String(value).replace(/[&<>"']/g, char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));}

function renderMiniProducts(){
  const favourites = [products.find(p=>p.id===1),products.find(p=>p.id===11),products.find(p=>p.id===2),products.find(p=>p.id===20)];
  $("#mini-products").innerHTML = favourites.map(product=>`<div class="mini-product"><div class="mini-product-art">${productVisual(product)}</div><div class="mini-product-info"><b>${escapeHtml(product.name)}</b><span>${priceLabel(product)}</span></div></div>`).join("");
}

function updateCategoryButtons(){
  document.querySelectorAll(".category-button").forEach(button=>{
    const category = button.dataset.category;
    button.classList.toggle("selected",category===state.category);
    const count = button.querySelector("[data-count]");
    if(count) count.textContent = category === "All" ? products.length : products.filter(product=>product.category===category).length;
  });
}
function updateCartCount(){
  const count = Object.values(state.cart).reduce((sum,quantity)=>sum+quantity,0);
  $("#cart-count").textContent = count;
  $("#drawer-count").textContent = `(${count})`;
  $("#cart-summary").hidden = count === 0;
}
function renderCart(){
  const entries = Object.entries(state.cart).filter(([,quantity])=>quantity>0);
  const cartItems = $("#cart-items");
  if(entries.length===0){
    cartItems.innerHTML = `<div class="cart-empty"><span>🛒</span><h3>Your cart is waiting</h3><p>Add something delicious to get started.</p><button class="button button-green" id="continue-shopping">Continue shopping</button></div>`;
    $("#cart-subtotal").textContent = money(0);
    updateCartCount();
    return;
  }
  let subtotal=0;
  let hasPriceOnRequest=false;
  cartItems.innerHTML = entries.map(([id,quantity])=>{
    const product=products.find(item=>item.id===Number(id));
    const lineTotal=product.price == null ? null : product.price*quantity;
    if(lineTotal == null) hasPriceOnRequest=true; else subtotal+=lineTotal;
    const linePrice = lineTotal == null ? "Price to confirm" : money(lineTotal);
    const unitLabel = product.price == null ? "Price on request" : money(product.price);
    return `<div class="cart-row"><div class="cart-row-art">${productVisual(product)}</div><div class="cart-row-info"><b>${escapeHtml(product.name)}</b><small>${escapeHtml(product.weight)} · ${unitLabel}</small><div class="cart-row-controls"><button type="button" data-cart-action="minus" data-id="${id}" aria-label="Decrease">−</button><span>${quantity}</span><button type="button" data-cart-action="plus" data-id="${id}" aria-label="Increase">+</button></div></div><div class="cart-row-price">${linePrice}<button class="remove-item" data-cart-action="remove" data-id="${id}">Remove</button></div></div>`;
  }).join("");
  $("#cart-subtotal").textContent = hasPriceOnRequest ? "To be confirmed" : money(subtotal);
  updateCartCount();
}
function addToCart(id){
  const quantity=state.quantities[id]||1;
  state.cart[id]=(state.cart[id]||0)+quantity;
  renderCart();
  showToast("Added to your cart!");
  openCart();
}
function setQuantity(id,change){
  state.quantities[id]=Math.max(1,Math.min(99,(state.quantities[id]||1)+change));
  const label=$(`#qty-${id}`);if(label)label.textContent=state.quantities[id];
}
function showToast(message){
  const toast=$("#toast");toast.textContent=message;toast.classList.add("show");
  clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>toast.classList.remove("show"),2200);
}
function openCategoryMenu(){
  $("#sidebar").classList.add("mobile-open");
  $("#sidebar-backdrop").classList.add("show");
  $("#mobile-menu").setAttribute("aria-expanded","true");
  document.body.style.overflow="hidden";
}
function closeCategoryMenu(){
  $("#sidebar").classList.remove("mobile-open");
  $("#sidebar-backdrop").classList.remove("show");
  $("#mobile-menu").setAttribute("aria-expanded","false");
  document.body.style.overflow="";
}
function openCart(){
  const drawer = $("#cart-drawer");
  const backdrop = $("#drawer-backdrop");
  if (!drawer || !backdrop) {
    console.error("GB Dry Fruit cart elements are missing from index.html.");
    showToast("Cart could not open. Please refresh the page.");
    return;
  }
  drawer.classList.add("open");
  backdrop.classList.add("show");
  // Inline fallback keeps the cart usable even if an old stylesheet is cached.
  Object.assign(drawer.style, {
    display: "flex",
    position: "fixed",
    top: "0",
    right: "0",
    bottom: "0",
    width: "min(430px, 100vw)",
    maxWidth: "100vw",
    flexDirection: "column",
    background: "#fff",
    transform: "translateX(0)",
    visibility: "visible",
    opacity: "1",
    pointerEvents: "auto",
    zIndex: "1001",
    boxShadow: "-15px 0 45px rgba(0,0,0,.18)"
  });
  Object.assign(backdrop.style, {
    display: "block",
    position: "fixed",
    inset: "0",
    background: "rgba(15,28,19,.42)",
    opacity: "1",
    visibility: "visible",
    pointerEvents: "auto",
    zIndex: "1000"
  });
  drawer.setAttribute("aria-hidden","false");
  const trigger = $("#open-cart");
  if (trigger) trigger.setAttribute("aria-expanded", "true");
  document.body.style.overflow="hidden";
  renderCart();
}
function closeCart(){
  const drawer = $("#cart-drawer");
  const backdrop = $("#drawer-backdrop");
  if (drawer) {
    drawer.classList.remove("open");
    drawer.style.transform = "translateX(102%)";
    drawer.style.pointerEvents = "none";
    drawer.setAttribute("aria-hidden","true");
  }
  if (backdrop) {
    backdrop.classList.remove("show");
    backdrop.style.opacity = "0";
    backdrop.style.visibility = "hidden";
    backdrop.style.pointerEvents = "none";
  }
  const trigger = $("#open-cart");
  if (trigger) trigger.setAttribute("aria-expanded", "false");
  document.body.style.overflow="";
}
// Public fallback used by the header button, including when click listeners are reloaded.
window.openGBDryFruitCart = openCart;
function makeWhatsAppUrl(message){
  const number=WHATSAPP_NUMBER.replace(/\D/g,"");
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
function checkout(){
  const entries=Object.entries(state.cart).filter(([,quantity])=>quantity>0);
  if(entries.length===0){showToast("Your cart is empty.");return;}
  let subtotal=0;
  let hasPriceOnRequest=false;
  const lines=entries.map(([id,quantity])=>{
    const p=products.find(item=>item.id===Number(id));
    if(p.price == null){hasPriceOnRequest=true;return `• ${p.name} (${p.weight}) x ${quantity} = Price to confirm`;}
    const lineTotal=p.price*quantity;subtotal+=lineTotal;
    return `• ${p.name} (${p.weight}) x ${quantity} = ${money(lineTotal)}`;
  });
  const totalLabel=hasPriceOnRequest?"To be confirmed (some products are price on request)":money(subtotal);
  const message=`Assalam-o-Alaikum GB Dry Fruit! I would like to place an order:\n\n${lines.join("\n")}\n\nSubtotal: ${totalLabel}\n\nPlease confirm availability, final price, delivery charges and payment details.\nName:\nDelivery city/address:`;
  if(!/^\d{10,15}$/.test(WHATSAPP_NUMBER)){
    showToast("Please add your business WhatsApp number in script.js first.");
    return;
  }
  window.open(makeWhatsAppUrl(message),"_blank","noopener,noreferrer");
}

$("#search-form").addEventListener("submit",event=>{event.preventDefault();state.search=$("#search-input").value;renderProducts();$("#shop").scrollIntoView({behavior:"smooth"});});
$("#search-input").addEventListener("input",event=>{state.search=event.target.value;renderProducts();});
$("#category-list").addEventListener("click",event=>{const button=event.target.closest("[data-category]");if(!button)return;state.category=button.dataset.category;updateCategoryButtons();renderProducts();closeCategoryMenu();});
document.querySelectorAll("[data-nav-category]").forEach(link=>link.addEventListener("click",()=>{state.category=link.dataset.navCategory;updateCategoryButtons();renderProducts();}));
$("#apply-filter").addEventListener("click",()=>{state.min=Math.max(0,Number($("#min-price").value)||0);state.max=Math.max(state.min,Number($("#max-price").value)||2500);renderProducts();});
$("#reset-filters").addEventListener("click",()=>{state.category="All";state.search="";state.min=0;state.max=2500;$("#search-input").value="";$("#min-price").value=0;$("#max-price").value=2500;updateCategoryButtons();renderProducts();});
$("#clear-search").addEventListener("click",()=>$("#reset-filters").click());
$("#sort-select").addEventListener("change",event=>{state.sort=event.target.value;renderProducts();});
$("#product-grid").addEventListener("click",event=>{
  const add=event.target.closest("[data-add]");if(add){addToCart(Number(add.dataset.add));return;}
  const qty=event.target.closest("[data-qty]");if(qty){setQuantity(Number(qty.dataset.id),qty.dataset.qty==="plus"?1:-1);return;}
  const fav=event.target.closest(".product-fav");if(fav){fav.textContent=fav.textContent==="♡"?"♥":"♡";fav.style.color=fav.textContent==="♥"?"#dc7272":"";showToast("Your favourite list is just for this visit.");}
});
$("#cart-items").addEventListener("click",event=>{if(event.target.id==="continue-shopping"){closeCart();$("#shop").scrollIntoView({behavior:"smooth"});return;}const button=event.target.closest("[data-cart-action]");if(!button)return;const id=button.dataset.id;const action=button.dataset.cartAction;if(action==="remove")delete state.cart[id];else if(action==="plus")state.cart[id]=(state.cart[id]||0)+1;else state.cart[id]=Math.max(0,(state.cart[id]||0)-1);if(state.cart[id]===0)delete state.cart[id];renderCart();});
$("#close-cart").addEventListener("click",closeCart);
$("#drawer-backdrop").addEventListener("click",closeCart);
$("#checkout-whatsapp").addEventListener("click",checkout);
// Delegated header-cart click is resilient to button markup changes.
document.addEventListener("click", event => {
  const cartButton = event.target.closest("#open-cart");
  if (cartButton) {
    event.preventDefault();
    openCart();
  }
});
$("#mobile-menu").addEventListener("click",openCategoryMenu);
$("#close-sidebar").addEventListener("click",closeCategoryMenu);
$("#sidebar-backdrop").addEventListener("click",closeCategoryMenu);
document.addEventListener("keydown",event=>{
  if(event.key!=="Escape")return;
  closeCategoryMenu();
  closeCart();
});
$("#contact-whatsapp").addEventListener("click",event=>{if(!/^\d{10,15}$/.test(WHATSAPP_NUMBER)){event.preventDefault();showToast("Add your business WhatsApp number in script.js to activate this link.");}else event.currentTarget.href=makeWhatsAppUrl("Assalam-o-Alaikum GB Dry Fruit! I would like to know more about your products.");});
$("#year").textContent=new Date().getFullYear();
updateCategoryButtons();
renderProducts();renderMiniProducts();renderCart();
