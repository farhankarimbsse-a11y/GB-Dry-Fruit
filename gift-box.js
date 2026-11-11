/* GB Dry Fruit — Mountain Gift Box Designer
   Loads the current products.json so product names, images, weights and prices
   stay in sync with the live catalogue. No other storefront file is replaced. */
(() => {
  "use strict";

  const WHATSAPP_NUMBER = "923555850225";
  const SECTION_ID = "gb-mountain-gift-box";
  const MODAL_ID = "gb-gift-checkout-modal";
  const PALETTE = ["almond", "pistachio", "date", "apricot", "seed", "berry"];
  const money = (value) => `Rs. ${Math.round(Number(value) || 0).toLocaleString("en-PK")}`;
  const clean = (value) => String(value ?? "").trim();
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);

  const css = `
    #${SECTION_ID}{--gb-green:#16833b;--gb-deep:#173c27;--gb-cream:#fffaf0;width:min(1440px,calc(100% - 48px));margin:38px auto 54px;padding:clamp(20px,3vw,38px);border:1px solid #e9e4d5;border-radius:24px;background:linear-gradient(135deg,#f4f8ef 0%,#fffaf1 55%,#f3f6eb 100%);box-shadow:0 16px 42px rgba(28,54,31,.07);font-family:inherit;color:#24392a;scroll-margin-top:28px}
    #${SECTION_ID} *{box-sizing:border-box}
    #${SECTION_ID} .gbgb-head{display:flex;justify-content:space-between;align-items:flex-end;gap:20px;margin-bottom:22px}
    #${SECTION_ID} .gbgb-kicker{display:inline-flex;align-items:center;gap:7px;color:var(--gb-green);font-size:10px;letter-spacing:.16em;font-weight:900;text-transform:uppercase}
    #${SECTION_ID} h2{margin:8px 0 8px;font-family:'Playfair Display',Georgia,serif;font-size:clamp(28px,4vw,42px);line-height:1.08;color:var(--gb-deep)}
    #${SECTION_ID} h2 em{font-style:normal;color:var(--gb-green)}
    #${SECTION_ID} .gbgb-intro{max-width:680px;margin:0;color:#687568;font-size:13px;line-height:1.7}
    #${SECTION_ID} .gbgb-count-pill{flex:none;padding:9px 13px;border:1px solid #dce8d7;border-radius:99px;background:#fff;color:#286b39;font-size:11px;font-weight:800;white-space:nowrap}
    #${SECTION_ID} .gbgb-config{display:grid;grid-template-columns:1fr 1fr 1.2fr;gap:12px;margin:0 0 19px}
    #${SECTION_ID} .gbgb-config-card{min-width:0;padding:13px 14px;border:1px solid #e5e9dc;border-radius:14px;background:rgba(255,255,255,.88)}
    #${SECTION_ID} .gbgb-label{display:block;margin-bottom:9px;color:#657164;font-size:10px;font-weight:900;letter-spacing:.08em;text-transform:uppercase}
    #${SECTION_ID} .gbgb-choice-row{display:flex;gap:6px;flex-wrap:wrap}
    #${SECTION_ID} .gbgb-choice{min-height:34px;padding:7px 11px;border:1px solid #e0e7da;border-radius:9px;background:#f9fbf7;color:#48604b;font:700 11px inherit;cursor:pointer;transition:all .18s ease}
    #${SECTION_ID} .gbgb-choice[aria-pressed="true"]{border-color:var(--gb-green);background:#eaf5e8;color:#145e2b;box-shadow:0 0 0 2px rgba(22,131,59,.08)}
    #${SECTION_ID} .gbgb-budget-row{display:flex;gap:8px;align-items:center}
    #${SECTION_ID} .gbgb-budget-row select,#${SECTION_ID} .gbgb-budget-row input{width:100%;min-width:0;height:36px;padding:7px 9px;border:1px solid #dfe6d9;border-radius:8px;background:#fbfcf9;color:#263e2c;font:700 12px inherit}
    #${SECTION_ID} .gbgb-budget-row input{max-width:108px}
    #${SECTION_ID} .gbgb-tools{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:0 0 11px}
    #${SECTION_ID} .gbgb-tools strong{font-size:13px;color:#2c4430}
    #${SECTION_ID} .gbgb-tools small{display:block;margin-top:3px;color:#849083;font-size:10px}
    #${SECTION_ID} .gbgb-tools-actions{display:flex;gap:7px;flex-wrap:wrap}
    #${SECTION_ID} .gbgb-tool-btn{padding:7px 10px;border:1px solid #dfe8da;border-radius:20px;background:#fff;color:#286b39;font-size:10px;font-weight:800;cursor:pointer}
    #${SECTION_ID} .gbgb-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:11px;align-items:stretch;padding:4px 3px 10px}
    #${SECTION_ID} .gbgb-product{position:relative;min-width:0;border:1px solid #e8e8dd;border-radius:14px;background:#fff;box-shadow:0 3px 12px rgba(34,53,35,.035);transition:transform .2s ease,border-color .2s ease,box-shadow .2s ease;z-index:0}
    #${SECTION_ID} .gbgb-product:hover{transform:translateY(-2px);box-shadow:0 9px 20px rgba(31,55,33,.09);z-index:1}
    #${SECTION_ID} .gbgb-product.is-selected{transform:scale(1.035);border-color:var(--gb-green);box-shadow:0 10px 24px rgba(22,131,59,.16);z-index:2}
    #${SECTION_ID} .gbgb-product.is-selected .gbgb-product-image{height:76px}
    #${SECTION_ID} .gbgb-product.is-selected .gbgb-select{background:linear-gradient(180deg,#f1f8ec,#fff)}
    #${SECTION_ID} .gbgb-select{display:flex;width:100%;min-height:158px;flex-direction:column;align-items:stretch;gap:5px;padding:10px;border:0;border-radius:13px;background:#fff;text-align:left;cursor:pointer;color:inherit;font-family:inherit}
    #${SECTION_ID} .gbgb-product-image-wrap{display:grid;place-items:center;height:61px;overflow:hidden;border-radius:10px;background:var(--gb-tint,#f7f5e9)}
    #${SECTION_ID} .gbgb-product-image{display:block;width:100%;height:61px;object-fit:contain;transition:height .2s ease,transform .2s ease}
    #${SECTION_ID} .gbgb-product:hover .gbgb-product-image{transform:scale(1.06)}
    #${SECTION_ID} .gbgb-emoji{display:grid;place-items:center;width:100%;height:61px;font-size:35px;transition:font-size .2s ease}
    #${SECTION_ID} .gbgb-product.is-selected .gbgb-emoji{font-size:43px}
    #${SECTION_ID} .gbgb-category{color:var(--gb-accent,#16833b);font-size:8px;font-weight:900;letter-spacing:.1em;text-transform:uppercase}
    #${SECTION_ID} .gbgb-name{display:-webkit-box;min-height:29px;overflow:hidden;color:#293c2d;font-size:11px;font-weight:850;line-height:1.3;-webkit-line-clamp:2;-webkit-box-orient:vertical}
    #${SECTION_ID} .gbgb-weight{color:#879083;font-size:9px;line-height:1.25}
    #${SECTION_ID} .gbgb-price-line{display:flex;justify-content:space-between;align-items:center;gap:5px;margin-top:auto}
    #${SECTION_ID} .gbgb-price{color:#176c34;font-size:11px;font-weight:900;white-space:nowrap}
    #${SECTION_ID} .gbgb-price.request{color:#986d27;font-size:9px;white-space:normal}
    #${SECTION_ID} .gbgb-selected-dot{display:grid;place-items:center;flex:none;width:19px;height:19px;border:1px solid #dce5d8;border-radius:50%;color:transparent;font-size:11px;font-weight:900}
    #${SECTION_ID} .gbgb-product.is-selected .gbgb-selected-dot{border-color:var(--gb-green);background:var(--gb-green);color:#fff}
    #${SECTION_ID} .gbgb-qty{display:none;align-items:center;justify-content:space-between;gap:5px;padding:0 9px 9px}
    #${SECTION_ID} .gbgb-product.is-selected .gbgb-qty{display:flex}
    #${SECTION_ID} .gbgb-qty-label{color:#71806f;font-size:9px;font-weight:700}
    #${SECTION_ID} .gbgb-qty-controls{display:flex;align-items:center;gap:7px}
    #${SECTION_ID} .gbgb-qty-controls button{width:25px;height:25px;border:1px solid #dbe8d6;border-radius:50%;background:#f5faf2;color:#176c34;font-size:15px;font-weight:900;line-height:1;cursor:pointer}
    #${SECTION_ID} .gbgb-qty-controls output{min-width:12px;text-align:center;color:#263e2c;font-size:11px;font-weight:900}
    #${SECTION_ID} .gbgb-bottom{display:grid;grid-template-columns:minmax(0,1fr) minmax(260px,.65fr);gap:14px;margin-top:16px}
    #${SECTION_ID} .gbgb-preview,#${SECTION_ID} .gbgb-total{padding:15px 16px;border:1px solid #e3e9dd;border-radius:14px;background:rgba(255,255,255,.92)}
    #${SECTION_ID} .gbgb-preview h3,#${SECTION_ID} .gbgb-total h3{margin:0 0 8px;color:#29412e;font-size:13px}
    #${SECTION_ID} .gbgb-preview-list{color:#677567;font-size:11px;line-height:1.7;overflow-wrap:anywhere}
    #${SECTION_ID} .gbgb-total-line{display:flex;justify-content:space-between;gap:12px;color:#647263;font-size:11px;margin:6px 0}
    #${SECTION_ID} .gbgb-total-line strong{color:#1f6f37}
    #${SECTION_ID} .gbgb-warning{margin:8px 0 0;color:#976823;font-size:10px;line-height:1.5}
    #${SECTION_ID} .gbgb-order{width:100%;min-height:45px;margin-top:12px;padding:11px 14px;border:0;border-radius:10px;background:#16833b;color:white;font-size:12px;font-weight:900;cursor:pointer;box-shadow:0 8px 18px rgba(22,131,59,.16);transition:background .18s,transform .18s}
    #${SECTION_ID} .gbgb-order:hover{background:#0d622e;transform:translateY(-1px)}
    #${SECTION_ID} .gbgb-order:disabled{opacity:.45;cursor:not-allowed;transform:none}
    #${SECTION_ID} .gbgb-note{margin:9px 0 0;color:#889184;font-size:9px;line-height:1.5}
    #${SECTION_ID} .gbgb-loading{grid-column:1/-1;padding:24px;text-align:center;color:#708070;font-size:12px}
    #${SECTION_ID} .gbgb-error{grid-column:1/-1;padding:18px;border:1px solid #f0d4ce;border-radius:12px;background:#fff7f5;color:#8d3b2d;font-size:12px}
    @media(max-width:1050px){#${SECTION_ID} .gbgb-grid{grid-template-columns:repeat(4,minmax(0,1fr))}}
    @media(max-width:760px){#${SECTION_ID}{width:calc(100% - 28px);margin:27px auto 38px;padding:17px;border-radius:18px}#${SECTION_ID} .gbgb-head{align-items:flex-start;flex-direction:column;gap:10px}#${SECTION_ID} .gbgb-config{grid-template-columns:1fr 1fr}#${SECTION_ID} .gbgb-config-card:last-child{grid-column:1/-1}#${SECTION_ID} .gbgb-grid{grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}#${SECTION_ID} .gbgb-bottom{grid-template-columns:1fr}}
    @media(max-width:480px){#${SECTION_ID} .gbgb-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}#${SECTION_ID} .gbgb-select{min-height:151px;padding:8px}#${SECTION_ID} .gbgb-product-image-wrap,#${SECTION_ID} .gbgb-product-image,#${SECTION_ID} .gbgb-emoji{height:57px}#${SECTION_ID} .gbgb-product.is-selected .gbgb-product-image{height:70px}#${SECTION_ID} .gbgb-config{grid-template-columns:1fr}#${SECTION_ID} .gbgb-config-card:last-child{grid-column:auto}#${SECTION_ID} .gbgb-tools{align-items:flex-start;flex-direction:column}}
    @media(prefers-reduced-motion:reduce){#${SECTION_ID} .gbgb-product,#${SECTION_ID} .gbgb-product-image,#${SECTION_ID} .gbgb-emoji{transition:none}}

    #${MODAL_ID}{position:fixed;inset:0;z-index:11000;display:none;align-items:center;justify-content:center;padding:14px;font-family:inherit}
    #${MODAL_ID}.is-open{display:flex}
    #${MODAL_ID} .gbgb-modal-backdrop{position:absolute;inset:0;background:rgba(14,28,18,.68);backdrop-filter:blur(3px)}
    #${MODAL_ID} .gbgb-modal-dialog{position:relative;z-index:1;width:min(100%,540px);max-height:92vh;overflow:auto;padding:22px;border-radius:18px;background:#fff;box-shadow:0 24px 80px rgba(0,0,0,.24)}
    #${MODAL_ID} .gbgb-modal-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:9px}
    #${MODAL_ID} .gbgb-modal-kicker{color:#16833b;font-size:10px;font-weight:900;letter-spacing:.13em;text-transform:uppercase}
    #${MODAL_ID} h2{margin:5px 0 0;color:#203c29;font-family:'Playfair Display',Georgia,serif;font-size:25px}
    #${MODAL_ID} .gbgb-modal-close{width:35px;height:35px;border:0;border-radius:50%;background:#f0f4ed;color:#263b2b;font-size:23px;cursor:pointer}
    #${MODAL_ID} .gbgb-modal-help{margin:8px 0 15px;color:#6c786b;font-size:12px;line-height:1.6}
    #${MODAL_ID} .gbgb-modal-summary{margin:0 0 15px;padding:11px 12px;border:1px solid #e4ebde;border-radius:10px;background:#f7faf4;color:#425541;font-size:11px;line-height:1.6}
    #${MODAL_ID} .gbgb-form{display:grid;grid-template-columns:1fr 1fr;gap:10px 12px}
    #${MODAL_ID} .gbgb-field{display:flex;min-width:0;flex-direction:column;gap:5px}
    #${MODAL_ID} .gbgb-field.full{grid-column:1/-1}
    #${MODAL_ID} label{color:#405141;font-size:11px;font-weight:800}
    #${MODAL_ID} label span{color:#c34d3b}
    #${MODAL_ID} input,#${MODAL_ID} textarea{width:100%;box-sizing:border-box;padding:10px 11px;border:1px solid #dce4d8;border-radius:9px;background:#fcfdfb;color:#203426;font:13px inherit;outline:none}
    #${MODAL_ID} input:focus,#${MODAL_ID} textarea:focus{border-color:#16833b;box-shadow:0 0 0 3px rgba(22,131,59,.1)}
    #${MODAL_ID} textarea{min-height:68px;resize:vertical}
    #${MODAL_ID} .gbgb-delivery{grid-column:1/-1;padding:11px 12px;border:1px solid #f0e2c3;border-radius:10px;background:#fff9ec;color:#715b31;font-size:11px;line-height:1.6}
    #${MODAL_ID} .gbgb-form-actions{grid-column:1/-1;display:flex;gap:9px;margin-top:3px}
    #${MODAL_ID} .gbgb-form-actions button{flex:1;min-height:43px;padding:10px;border:0;border-radius:9px;font-size:11px;font-weight:900;cursor:pointer}
    #${MODAL_ID} .gbgb-back{background:#eef2eb;color:#435343}
    #${MODAL_ID} .gbgb-send{background:#16833b;color:#fff}
    @media(max-width:480px){#${MODAL_ID}{padding:9px}#${MODAL_ID} .gbgb-modal-dialog{padding:16px;border-radius:15px}#${MODAL_ID} .gbgb-form{grid-template-columns:1fr}#${MODAL_ID} .gbgb-field.full,#${MODAL_ID} .gbgb-delivery,#${MODAL_ID} .gbgb-form-actions{grid-column:1}#${MODAL_ID} h2{font-size:22px}}
  `;

  function productImage(product) {
    const image = clean(product.image);
    const emoji = escapeHtml(product.emoji || "🎁");
    if (image) {
      return `<img class="gbgb-product-image" src="${escapeHtml(image)}" alt="${escapeHtml(product.name)}" loading="lazy" onerror="this.replaceWith(Object.assign(document.createElement('span'),{className:'gbgb-emoji',textContent:'${emoji}'}))">`;
    }
    return `<span class="gbgb-emoji" aria-hidden="true">${emoji}</span>`;
  }

  function init() {
    if (document.getElementById(SECTION_ID)) return;
    // Keep the existing 20-product shop exactly as it is. Insert the Gift Box
    // designer only after the complete shop layout, so it appears below the
    // original product catalogue (and before the story section).
    const anchor = document.querySelector(".shop-layout") || document.getElementById("shop");
    if (!anchor) {
      console.error("GB Gift Box: could not find the existing product catalogue section (.shop-layout / #shop).");
      return;
    }

    const style = document.createElement("style");
    style.id = "gb-gift-box-styles";
    style.textContent = css;
    document.head.appendChild(style);

    const section = document.createElement("section");
    section.id = SECTION_ID;
    section.setAttribute("aria-labelledby", "gbgb-title");
    section.innerHTML = `
      <header class="gbgb-head">
        <div>
          <span class="gbgb-kicker">✦ A GIFT FROM THE MOUNTAINS</span>
          <h2 id="gbgb-title">Design your <em>Mountain Gift Box.</em></h2>
          <p class="gbgb-intro">Choose your favourite treats, set a gift budget and add a personal message. Tap a product to select it — selected cards grow a little so your choices stand out.</p>
        </div>
        <span class="gbgb-count-pill" id="gbgb-selected-count">0 products selected</span>
      </header>

      <div class="gbgb-config">
        <div class="gbgb-config-card">
          <span class="gbgb-label">1 · Choose box size</span>
          <div class="gbgb-choice-row" id="gbgb-box-sizes">
            <button class="gbgb-choice" type="button" data-box-size="Small" aria-pressed="true">Small</button>
            <button class="gbgb-choice" type="button" data-box-size="Medium" aria-pressed="false">Medium</button>
            <button class="gbgb-choice" type="button" data-box-size="Large" aria-pressed="false">Large</button>
          </div>
        </div>
        <div class="gbgb-config-card">
          <span class="gbgb-label">2 · Gift budget</span>
          <div class="gbgb-budget-row">
            <select id="gbgb-budget-preset" aria-label="Choose gift budget">
              <option value="1000">Rs. 1,000</option><option value="2000">Rs. 2,000</option><option value="3000">Rs. 3,000</option><option value="5000">Rs. 5,000</option><option value="custom">Custom</option>
            </select>
            <input id="gbgb-budget-custom" type="number" min="100" max="100000" step="50" value="1000" aria-label="Custom gift budget" hidden>
          </div>
        </div>
        <div class="gbgb-config-card">
          <span class="gbgb-label">3 · Gift for someone special</span>
          <div class="gbgb-budget-row"><input id="gbgb-recipient" type="text" maxlength="80" placeholder="Recipient name (optional)" aria-label="Gift recipient name"></div>
        </div>
      </div>

      <div class="gbgb-tools">
        <div><strong>Choose from all our products</strong><small>Every product has its own photo, pack size and live catalogue price.</small></div>
        <div class="gbgb-tools-actions"><button class="gbgb-tool-btn" type="button" id="gbgb-select-all">Select all</button><button class="gbgb-tool-btn" type="button" id="gbgb-clear-all">Clear all</button></div>
      </div>

      <div class="gbgb-grid" id="gbgb-product-grid" aria-label="All gift box products">
        <div class="gbgb-loading">Loading all products…</div>
      </div>

      <div class="gbgb-bottom">
        <section class="gbgb-preview" aria-live="polite">
          <h3>Your gift box preview</h3>
          <div class="gbgb-preview-list" id="gbgb-preview-list">Choose products above to start building your gift box.</div>
          <div style="margin-top:12px"><label class="gbgb-label" for="gbgb-message">Personal gift message</label><textarea id="gbgb-message" maxlength="240" style="width:100%;min-height:66px;padding:10px;border:1px solid #dfe6d9;border-radius:9px;background:#fff;font:12px inherit;resize:vertical" placeholder="Write a short message for the gift recipient…"></textarea></div>
        </section>
        <section class="gbgb-total">
          <h3>Gift box summary</h3>
          <div class="gbgb-total-line"><span>Box size</span><strong id="gbgb-total-size">Small</strong></div>
          <div class="gbgb-total-line"><span>Selected products</span><strong id="gbgb-total-count">0</strong></div>
          <div class="gbgb-total-line"><span>Known items total</span><strong id="gbgb-total-price">Rs. 0</strong></div>
          <div class="gbgb-total-line"><span>Gift budget</span><strong id="gbgb-total-budget">Rs. 1,000</strong></div>
          <p class="gbgb-warning" id="gbgb-total-warning">Choose products to see your estimated total. Delivery and box packaging will be confirmed on WhatsApp.</p>
          <button class="gbgb-order" id="gbgb-order" type="button" disabled>Continue to gift delivery details ↗</button>
          <p class="gbgb-note">Prices and pack sizes are taken from the live catalogue. Any item marked “Price on request” and gift packaging charges will be confirmed before the order is accepted.</p>
        </section>
      </div>`;

    anchor.insertAdjacentElement("afterend", section);

    const grid = section.querySelector("#gbgb-product-grid");
    const budgetPreset = section.querySelector("#gbgb-budget-preset");
    const budgetCustom = section.querySelector("#gbgb-budget-custom");
    const selected = new Map();
    let products = [];
    let boxSize = "Small";

    const budget = () => {
      const raw = budgetPreset.value === "custom" ? budgetCustom.value : budgetPreset.value;
      const value = Number(raw);
      return Number.isFinite(value) && value >= 100 && value <= 100000 ? Math.round(value) : 0;
    };
    const selectedItems = () => products.filter((p) => selected.has(String(p.id))).map((p) => ({ product: p, qty: selected.get(String(p.id)) }));
    const subtotal = () => selectedItems().reduce((sum, item) => sum + (Number.isFinite(Number(item.product.price)) && item.product.price !== null && item.product.price !== "" ? Number(item.product.price) * item.qty : 0), 0);
    const hasQuoteItems = () => selectedItems().some(({product}) => product.price === null || product.price === undefined || product.price === "");

    function renderProducts() {
      if (!products.length) {
        grid.innerHTML = `<div class="gbgb-error">No products were found in products.json. Please check the live product catalogue.</div>`;
        return;
      }
      grid.innerHTML = products.map((p, index) => {
        const id = String(p.id);
        const isSelected = selected.has(id);
        const qty = selected.get(id) || 1;
        const priceKnown = p.price !== null && p.price !== undefined && p.price !== "" && Number.isFinite(Number(p.price));
        const palette = PALETTE[index % PALETTE.length];
        const accent = ["#9a6a32", "#16833b", "#a35d34", "#bc7b36", "#63804e", "#8a6caa"][index % 6];
        const tint = ["#f8f0df", "#edf6e8", "#fbefe8", "#fbf1e1", "#eef3e8", "#f4eff8"][index % 6];
        return `<article class="gbgb-product ${isSelected ? "is-selected" : ""}" data-product-card="${escapeHtml(id)}" style="--gb-accent:${accent};--gb-tint:${tint}">
          <button class="gbgb-select" type="button" data-select-product="${escapeHtml(id)}" aria-pressed="${isSelected}" aria-label="${isSelected ? "Remove" : "Add"} ${escapeHtml(p.name)} ${isSelected ? "from" : "to"} gift box">
            <span class="gbgb-product-image-wrap">${productImage(p)}</span>
            <span class="gbgb-category">${escapeHtml(p.category || "Gift favourite")}</span>
            <span class="gbgb-name">${escapeHtml(p.name)}</span>
            <span class="gbgb-weight">${escapeHtml(p.weight || "Pack size to confirm")}</span>
            <span class="gbgb-price-line"><strong class="gbgb-price ${priceKnown ? "" : "request"}">${priceKnown ? money(p.price) : "Price on request"}</strong><span class="gbgb-selected-dot" aria-hidden="true">✓</span></span>
          </button>
          <div class="gbgb-qty" ${isSelected ? "" : "hidden"}><span class="gbgb-qty-label">Packs</span><span class="gbgb-qty-controls"><button type="button" data-qty-change="-1" data-product-id="${escapeHtml(id)}" aria-label="Remove one ${escapeHtml(p.name)}">−</button><output>${qty}</output><button type="button" data-qty-change="1" data-product-id="${escapeHtml(id)}" aria-label="Add one ${escapeHtml(p.name)}">+</button></span></div>
        </article>`;
      }).join("");
      updateSummary();
    }

    function updateSummary() {
      const items = selectedItems();
      const knownTotal = subtotal();
      const selectedCount = items.length;
      const budgetValue = budget();
      section.querySelector("#gbgb-selected-count").textContent = `${selectedCount} product${selectedCount === 1 ? "" : "s"} selected`;
      section.querySelector("#gbgb-total-size").textContent = boxSize;
      section.querySelector("#gbgb-total-count").textContent = String(selectedCount);
      section.querySelector("#gbgb-total-price").textContent = money(knownTotal) + (hasQuoteItems() ? " + quote" : "");
      section.querySelector("#gbgb-total-budget").textContent = budgetValue ? money(budgetValue) : "Enter a valid budget";
      section.querySelector("#gbgb-preview-list").innerHTML = items.length
        ? items.map(({product, qty}) => `<div>✦ ${escapeHtml(product.name)} × ${qty} <strong>${product.price === null || product.price === undefined || product.price === "" ? "(price on request)" : money(Number(product.price) * qty)}</strong></div>`).join("")
        : "Choose products above to start building your gift box.";
      const warning = section.querySelector("#gbgb-total-warning");
      if (!items.length) warning.textContent = "Choose at least one product. Delivery and box packaging will be confirmed on WhatsApp.";
      else if (!budgetValue) warning.textContent = "Enter a gift budget between Rs. 100 and Rs. 100,000.";
      else if (knownTotal > budgetValue) warning.textContent = `Your selected items are ${money(knownTotal - budgetValue)} over your target budget. Remove a pack or increase the budget.`;
      else if (hasQuoteItems()) warning.textContent = "Some selected products need a quote. We will confirm their price, packaging and delivery on WhatsApp.";
      else warning.textContent = `${money(budgetValue - knownTotal)} remains in your target budget. Packaging and delivery are confirmed separately.`;
      section.querySelector("#gbgb-order").disabled = !items.length || !budgetValue;
    }

    function toggleProduct(id) {
      const key = String(id);
      if (selected.has(key)) selected.delete(key);
      else selected.set(key, 1);
      renderProducts();
    }

    grid.addEventListener("click", (event) => {
      const selectButton = event.target.closest("[data-select-product]");
      if (selectButton) {
        toggleProduct(selectButton.dataset.selectProduct);
        return;
      }
      const qtyButton = event.target.closest("[data-qty-change]");
      if (qtyButton) {
        const id = String(qtyButton.dataset.productId);
        const nextQty = (selected.get(id) || 1) + Number(qtyButton.dataset.qtyChange);
        if (nextQty <= 0) selected.delete(id);
        else selected.set(id, Math.min(99, nextQty));
        renderProducts();
      }
    });

    section.querySelector("#gbgb-select-all").addEventListener("click", () => {
      products.forEach((p) => { if (!selected.has(String(p.id))) selected.set(String(p.id), 1); });
      renderProducts();
    });
    section.querySelector("#gbgb-clear-all").addEventListener("click", () => { selected.clear(); renderProducts(); });
    section.querySelector("#gbgb-box-sizes").addEventListener("click", (event) => {
      const button = event.target.closest("[data-box-size]");
      if (!button) return;
      boxSize = button.dataset.boxSize;
      section.querySelectorAll("[data-box-size]").forEach((node) => node.setAttribute("aria-pressed", String(node === button)));
      updateSummary();
    });
    budgetPreset.addEventListener("change", () => {
      const custom = budgetPreset.value === "custom";
      budgetCustom.hidden = !custom;
      if (custom) budgetCustom.focus();
      updateSummary();
    });
    budgetCustom.addEventListener("input", updateSummary);
    section.querySelector("#gbgb-order").addEventListener("click", () => openCheckout());

    function ensureModal() {
      let modal = document.getElementById(MODAL_ID);
      if (modal) return modal;
      modal = document.createElement("div");
      modal.id = MODAL_ID;
      modal.innerHTML = `
        <div class="gbgb-modal-backdrop" data-gbgb-close></div>
        <section class="gbgb-modal-dialog" role="dialog" aria-modal="true" aria-labelledby="gbgb-modal-title">
          <div class="gbgb-modal-head"><div><div class="gbgb-modal-kicker">A little goodness, wrapped with care</div><h2 id="gbgb-modal-title">Gift delivery details</h2></div><button class="gbgb-modal-close" type="button" data-gbgb-close aria-label="Close">×</button></div>
          <p class="gbgb-modal-help">Add your delivery details and we will confirm gift packaging, final price and delivery on WhatsApp.</p>
          <div class="gbgb-modal-summary" id="gbgb-modal-summary"></div>
          <form class="gbgb-form" id="gbgb-form">
            <div class="gbgb-field"><label for="gbgb-customer-name">Your full name <span>*</span></label><input id="gbgb-customer-name" name="name" autocomplete="name" maxlength="80" required placeholder="Your name"></div>
            <div class="gbgb-field"><label for="gbgb-customer-phone">Mobile / WhatsApp <span>*</span></label><input id="gbgb-customer-phone" name="phone" type="tel" autocomplete="tel" minlength="10" maxlength="20" required placeholder="03XXXXXXXXX"></div>
            <div class="gbgb-field full"><label for="gbgb-customer-city">City / Town <span>*</span></label><input id="gbgb-customer-city" name="city" autocomplete="address-level2" maxlength="80" required placeholder="e.g. Gilgit, Hunza, Islamabad"></div>
            <div class="gbgb-field full"><label for="gbgb-customer-address">Complete delivery address <span>*</span></label><textarea id="gbgb-customer-address" name="address" autocomplete="street-address" maxlength="500" required placeholder="House number, street, area or village"></textarea></div>
            <div class="gbgb-field full"><label for="gbgb-customer-landmark">Nearest landmark (optional)</label><input id="gbgb-customer-landmark" name="landmark" maxlength="120" placeholder="School, shop, masjid, etc."></div>
            <div class="gbgb-field full"><label for="gbgb-recipient-message">Message for gift recipient (optional)</label><textarea id="gbgb-recipient-message" name="giftMessage" maxlength="240" placeholder="Write a personal gift message"></textarea></div>
            <div class="gbgb-field full"><label for="gbgb-delivery-note">Delivery note (optional)</label><textarea id="gbgb-delivery-note" name="note" maxlength="300" placeholder="Any special instructions"></textarea></div>
            <div class="gbgb-delivery" id="gbgb-delivery-fee">Delivery estimate: Gilgit city Rs. 150 · Other cities Rs. 300. Gift packaging charge will be confirmed.</div>
            <div class="gbgb-form-actions"><button class="gbgb-back" type="button" data-gbgb-close>Back to gift box</button><button class="gbgb-send" type="submit">Send gift request on WhatsApp ↗</button></div>
          </form>
        </section>`;
      document.body.appendChild(modal);
      modal.addEventListener("click", (event) => { if (event.target.closest("[data-gbgb-close]")) closeCheckout(modal); });
      const cityInput = modal.querySelector("#gbgb-customer-city");
      cityInput.addEventListener("input", () => {
        const city = clean(cityInput.value);
        modal.querySelector("#gbgb-delivery-fee").textContent = city
          ? `Estimated delivery for ${city}: ${money(deliveryFee(city))}. Gift packaging charge will be confirmed.`
          : "Delivery estimate: Gilgit city Rs. 150 · Other cities Rs. 300. Gift packaging charge will be confirmed.";
      });
      modal.querySelector("#gbgb-form").addEventListener("submit", submitOrder);
      return modal;
    }

    function deliveryFee(city) {
      const normalized = clean(city).toLowerCase().replace(/\s+city$/, "");
      return normalized === "gilgit" ? 150 : 300;
    }

    function openCheckout() {
      const items = selectedItems();
      if (!items.length) return;
      const modal = ensureModal();
      const recipient = clean(section.querySelector("#gbgb-recipient").value) || "Not specified";
      const message = clean(section.querySelector("#gbgb-message").value) || "Not specified";
      const summary = items.map(({product, qty}) => `${escapeHtml(product.name)} × ${qty}`).join(" · ");
      modal.querySelector("#gbgb-modal-summary").innerHTML = `<strong>${boxSize} gift box</strong><br>Recipient: ${escapeHtml(recipient)}<br>${summary}<br><strong>Known items total: ${money(subtotal())}${hasQuoteItems() ? " + prices to confirm" : ""}</strong><br>Gift budget: ${money(budget())}<br>Gift message: ${escapeHtml(message)}`;
      modal.querySelector("#gbgb-recipient-message").value = message === "Not specified" ? "" : message;
      modal.classList.add("is-open");
      document.body.style.overflow = "hidden";
      modal.querySelector("#gbgb-customer-name").focus();
    }

    function closeCheckout(modal) {
      modal.classList.remove("is-open");
      document.body.style.overflow = "";
    }

    function submitOrder(event) {
      event.preventDefault();
      const modal = event.currentTarget.closest(`#${MODAL_ID}`);
      const form = event.currentTarget;
      if (!form.reportValidity()) return;
      const name = clean(modal.querySelector("#gbgb-customer-name").value);
      const phone = clean(modal.querySelector("#gbgb-customer-phone").value);
      const city = clean(modal.querySelector("#gbgb-customer-city").value);
      const address = clean(modal.querySelector("#gbgb-customer-address").value);
      const landmark = clean(modal.querySelector("#gbgb-customer-landmark").value) || "Not provided";
      const recipient = clean(section.querySelector("#gbgb-recipient").value) || "Not specified";
      const giftMessage = clean(modal.querySelector("#gbgb-recipient-message").value) || "Not provided";
      const note = clean(modal.querySelector("#gbgb-delivery-note").value) || "Not provided";
      const items = selectedItems();
      if (!items.length) { window.alert("Please select at least one product for your gift box."); closeCheckout(modal); return; }
      const delivery = deliveryFee(city);
      const itemLines = items.map(({product, qty}) => {
        const priceKnown = product.price !== null && product.price !== undefined && product.price !== "" && Number.isFinite(Number(product.price));
        const line = priceKnown ? money(Number(product.price) * qty) : "Price on request";
        return `• ${clean(product.name)} × ${qty} pack(s)${product.weight ? ` (${clean(product.weight)})` : ""} — ${line}`;
      });
      const messageLines = [
        "Assalam-o-Alaikum GB Dry Fruit! I would like to request a custom Mountain Gift Box.",
        "",
        `Box size: ${boxSize}`,
        `Recipient: ${recipient}`,
        `Gift budget: ${money(budget())}`,
        "Selected products:",
        ...itemLines,
        `Known items total: ${money(subtotal())}${hasQuoteItems() ? " (plus items awaiting quote)" : ""}`,
        `Estimated delivery (${city}): ${money(delivery)}`,
        "Gift packaging charge and final availability/price: please confirm.",
        "",
        `Gift message: ${giftMessage}`,
        `Customer name: ${name}`,
        `Customer mobile: ${phone}`,
        `City / Town: ${city}`,
        `Full delivery address: ${address}`,
        `Nearest landmark: ${landmark}`,
        `Delivery note: ${note}`
      ];
      const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(messageLines.join("\n"))}`;
      const newWindow = window.open(url, "_blank");
      if (newWindow) newWindow.opener = null;
      closeCheckout(modal);
      if (!newWindow) window.location.href = url;
    }

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        const modal = document.getElementById(MODAL_ID);
        if (modal?.classList.contains("is-open")) closeCheckout(modal);
      }
    });

    async function loadCatalogue() {
      try {
        const response = await fetch("./products.json", { cache: "no-store" });
        if (!response.ok) throw new Error(`products.json request failed (${response.status})`);
        const data = await response.json();
        if (!Array.isArray(data) || !data.length) throw new Error("products.json did not contain a product list");
        products = data;
        renderProducts();
      } catch (error) {
        console.error("GB Gift Box catalogue error:", error);
        grid.innerHTML = `<div class="gbgb-error">The product list could not load. Please refresh the page and try again.</div>`;
      }
    }
    loadCatalogue();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
