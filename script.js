/* GB Dry Fruit storefront
   Before taking real orders, replace WHATSAPP_NUMBER below with your WhatsApp
   number in international format (Pakistan example: 923001234567). Do not add + or spaces.
*/
const WHATSAPP_NUMBER = ""; // ADD YOUR BUSINESS WHATSAPP NUMBER, e.g. 923001234567

const products = [
  {id:1,name:"Almonds (Badam)",category:"Nuts",weight:"200 Grams",price:875,emoji:"🥜",image:"images/almonds.webp",tag:"BEST SELLER",featured:1,search:"badam almond almonds"},
  {id:2,name:"Premium Cashew Nuts (Kaju)",category:"Nuts",weight:"200 Grams",price:845,emoji:"🌰",image:"images/cashews.webp",tag:"POPULAR",featured:2,search:"kaju cashew cashews"},
  {id:3,name:"Pistachios (Pista)",category:"Nuts",weight:"100 Grams",price:690,emoji:"💚",image:"images/pistachios.webp",tag:"PREMIUM",featured:3,search:"pista pistachio pistachios"},
  {id:4,name:"Walnut Kernels (Akhrot)",category:"Nuts",weight:"200 Grams",price:590,emoji:"🌰",image:"images/walnuts.webp",tag:"FRESH PICK",featured:4,search:"akhrot walnut walnuts"},
  {id:5,name:"Roasted Peanuts",category:"Nuts",weight:"200 Grams",price:375,emoji:"🥜",tag:"GREAT VALUE",featured:5,search:"mung phali peanut peanuts"},
  {id:6,name:"Pumpkin Seeds",category:"Seeds",weight:"200 Grams",price:460,emoji:"🌱",tag:"NUTRITIOUS",featured:6,search:"pumpkin seed seeds"},
  {id:7,name:"Sunflower Seeds",category:"Seeds",weight:"200 Grams",price:140,emoji:"🌻",tag:"EVERYDAY FAVOURITE",featured:7,search:"sunflower seed seeds"},
  {id:8,name:"Ajwa Dates",category:"Dates",weight:"250 Grams",price:1050,emoji:"🟤",image:"images/dates.webp",tag:"PREMIUM DATES",featured:8,search:"ajwa khajoor dates"},
  {id:9,name:"Mazafati Dates",category:"Dates",weight:"500 Grams",price:495,emoji:"🟤",image:"images/dates.webp",tag:"CUSTOMER FAVOURITE",featured:9,search:"mazafati dates khajoor"},
  {id:10,name:"Mabroom Dates",category:"Dates",weight:"250 Grams",price:1050,emoji:"🌴",image:"images/dates.webp",tag:"RICH & DELICIOUS",featured:10,search:"mabroom dates khajoor"},
  {id:11,name:"Golden Raisins (Kishmish)",category:"Dried Fruits",weight:"200 Grams",price:255,emoji:"🍇",image:"images/raisins.webp",tag:"NATURALLY SWEET",featured:11,search:"kishmish raisin raisins"},
  {id:12,name:"Dried Apricots (Khubani)",category:"Dried Fruits",weight:"200 Grams",price:520,emoji:"🍑",image:"images/apricots.webp",tag:"MOUNTAIN PICK",featured:12,search:"khubani apricot apricots"}
];

const state = {category:"All",search:"",min:0,max:2500,sort:"featured",cart:{},quantities:{}};
const $ = (selector) => document.querySelector(selector);
const money = (amount) => `Rs. ${Number(amount).toLocaleString("en-PK")}`;

function getFilteredProducts(){
  let items = products.filter((product) => {
    const matchesCategory = state.category === "All" || product.category === state.category;
    const query = state.search.trim().toLowerCase();
    const matchesSearch = !query || `${product.name} ${product.category} ${product.search}`.toLowerCase().includes(query);
    return matchesCategory && matchesSearch && product.price >= state.min && product.price <= state.max;
  });
  if(state.sort === "price-low") items.sort((a,b)=>a.price-b.price);
  else if(state.sort === "price-high") items.sort((a,b)=>b.price-a.price);
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
        <span class="product-label">${product.tag}</span>
        <button class="product-fav" type="button" aria-label="Save ${product.name}" title="Save for later">♡</button>
        ${productVisual(product)}
      </div>
      <div class="product-details">
        <div class="product-category">${product.category}</div>
        <h3 class="product-name" title="${product.name}">${product.name}</h3>
        <p class="product-weight">${product.weight}</p>
        <p class="product-price">${money(product.price)}</p>
        <div class="product-controls">
          <div class="quantity-control" aria-label="Quantity for ${product.name}">
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
  const favourites = [products[0],products[8],products[1],products[4]];
  $("#mini-products").innerHTML = favourites.map(product=>`<div class="mini-product"><div class="mini-product-art">${productVisual(product)}</div><div class="mini-product-info"><b>${product.name}</b><span>${money(product.price)}</span></div></div>`).join("");
}

function updateCategoryButtons(){
  document.querySelectorAll(".category-button").forEach(button=>button.classList.toggle("selected",button.dataset.category===state.category));
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
  cartItems.innerHTML = entries.map(([id,quantity])=>{
    const product=products.find(item=>item.id===Number(id));
    const lineTotal=product.price*quantity;subtotal+=lineTotal;
    return `<div class="cart-row"><div class="cart-row-art">${productVisual(product)}</div><div class="cart-row-info"><b>${product.name}</b><small>${product.weight} · ${money(product.price)}</small><div class="cart-row-controls"><button type="button" data-cart-action="minus" data-id="${id}" aria-label="Decrease">−</button><span>${quantity}</span><button type="button" data-cart-action="plus" data-id="${id}" aria-label="Increase">+</button></div></div><div class="cart-row-price">${money(lineTotal)}<button class="remove-item" data-cart-action="remove" data-id="${id}">Remove</button></div></div>`;
  }).join("");
  $("#cart-subtotal").textContent=money(subtotal);
  updateCartCount();
}
function addToCart(id){
  const quantity=state.quantities[id]||1;
  state.cart[id]=(state.cart[id]||0)+quantity;
  renderCart();showToast("Added to your cart!");
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
  $("#cart-drawer").classList.add("open");$("#drawer-backdrop").classList.add("show");
  $("#cart-drawer").setAttribute("aria-hidden","false");document.body.style.overflow="hidden";
}
function closeCart(){
  $("#cart-drawer").classList.remove("open");$("#drawer-backdrop").classList.remove("show");
  $("#cart-drawer").setAttribute("aria-hidden","true");document.body.style.overflow="";
}
function makeWhatsAppUrl(message){
  const number=WHATSAPP_NUMBER.replace(/\D/g,"");
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
function checkout(){
  const entries=Object.entries(state.cart).filter(([,quantity])=>quantity>0);
  if(entries.length===0){showToast("Your cart is empty.");return;}
  const lines=entries.map(([id,quantity])=>{const p=products.find(item=>item.id===Number(id));return `• ${p.name} (${p.weight}) x ${quantity} = ${money(p.price*quantity)}`;});
  const total=entries.reduce((sum,[id,quantity])=>sum+products.find(p=>p.id===Number(id)).price*quantity,0);
  const message=`Assalam-o-Alaikum GB Dry Fruit! I would like to place an order:\n\n${lines.join("\n")}\n\nSubtotal: ${money(total)}\n\nPlease confirm availability, delivery charges and payment details.\nName:\nDelivery city/address:`;
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
$("#open-cart").addEventListener("click",openCart);$("#close-cart").addEventListener("click",closeCart);$("#drawer-backdrop").addEventListener("click",closeCart);$("#checkout-whatsapp").addEventListener("click",checkout);
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
renderProducts();renderMiniProducts();renderCart();
