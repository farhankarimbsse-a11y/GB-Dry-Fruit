/* GB Dry Fruit — Mountain Mix Lab
   A budget-based WhatsApp request builder. It intentionally does not promise
   gram weights because catalogue pack sizes/pricing units must be confirmed. */
(() => {
  "use strict";

  const WHATSAPP_NUMBER = "923555850225";
  const BUDGET_MIN = 100;
  const BUDGET_MAX = 50000;
  const DEFAULT_BUDGET = 1000;
  const DEFAULT_BADAM_SHARE = 50;
  const money = (value) => `Rs. ${Math.round(Number(value) || 0).toLocaleString("en-PK")}`;
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);

  const styles = `
    .mountain-mix-section{width:min(1440px,calc(100% - 64px));margin:34px auto 42px;padding:clamp(20px,3vw,38px);border:1px solid #e8e5d9;border-radius:22px;background:linear-gradient(125deg,#f5f7ed 0%,#fffaf0 58%,#f1f5e9 100%);box-shadow:0 14px 38px rgba(34,48,34,.06)}
    .mountain-mix-layout{display:grid;grid-template-columns:minmax(0,1fr) minmax(320px,.95fr);gap:clamp(22px,4vw,54px);align-items:center}
    .mountain-mix-copy .eyebrow{display:inline-flex;align-items:center;gap:8px;color:#16833b;font-size:10px;letter-spacing:.14em;font-weight:800;text-transform:uppercase}
    .mountain-mix-copy h2{margin:13px 0 12px;color:#24392a;font-family:'Playfair Display',Georgia,serif;font-size:clamp(29px,4vw,45px);line-height:1.12;letter-spacing:-.7px}
    .mountain-mix-copy h2 em{color:#16833b;font-style:normal}
    .mountain-mix-copy>p{max-width:530px;color:#6d786d;font-size:13px;line-height:1.8}
    .mountain-mix-perks{display:flex;flex-wrap:wrap;gap:9px;margin-top:20px}
    .mountain-mix-perks span{padding:8px 11px;border:1px solid #e2e8d7;border-radius:30px;background:rgba(255,255,255,.76);color:#476148;font-size:11px;font-weight:700}
    .mountain-mix-card{padding:clamp(16px,2.5vw,25px);border:1px solid #e7e2d2;border-radius:18px;background:#fff;box-shadow:0 16px 35px rgba(55,65,43,.09)}
    .mountain-mix-card-head{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:16px}
    .mountain-mix-card-head h3{margin:0;color:#24392a;font-size:17px}
    .mountain-mix-card-head span{padding:6px 9px;border-radius:20px;background:#edf6eb;color:#16833b;font-size:10px;font-weight:800;white-space:nowrap}
    .mountain-mix-ingredients{display:grid;grid-template-columns:1fr 1fr;gap:10px}
    .mountain-mix-ingredient{position:relative;display:flex;align-items:center;gap:10px;min-width:0;padding:10px;border:1px solid #e8e8df;border-radius:13px;background:#fff;cursor:pointer;transition:border-color .18s,background .18s,box-shadow .18s}
    .mountain-mix-ingredient.is-selected{border-color:#16833b;background:#f4faf1;box-shadow:0 0 0 2px rgba(22,131,59,.08)}
    .mountain-mix-ingredient input{position:absolute;opacity:0;pointer-events:none}
    .mountain-mix-ingredient img{width:52px;height:52px;object-fit:contain;flex:none;border-radius:10px;background:#f8f5ec}
    .mountain-mix-ingredient-copy{display:flex;flex-direction:column;gap:3px;min-width:0}
    .mountain-mix-ingredient-copy strong{font-size:12px;color:#253a2a;line-height:1.25}
    .mountain-mix-ingredient-copy small{font-size:10px;line-height:1.35;color:#81897d}
    .mountain-mix-check{margin-left:auto;color:#16833b;font-size:18px;opacity:0;flex:none}
    .mountain-mix-ingredient.is-selected .mountain-mix-check{opacity:1}
    .mountain-mix-budget-row{display:flex;justify-content:space-between;align-items:end;gap:12px;margin:20px 0 13px}
    .mountain-mix-budget-row label{display:block;color:#596659;font-size:11px;font-weight:700}
    .mountain-mix-budget-input{display:flex;align-items:center;gap:7px;margin-top:6px;padding:9px 11px;border:1px solid #dfe5d8;border-radius:9px;background:#fbfcf8}
    .mountain-mix-budget-input span{color:#16833b;font-weight:800}
    .mountain-mix-budget-input input{width:116px;min-width:0;border:0;outline:0;background:transparent;color:#203b26;font-size:19px;font-weight:800}
    .mountain-mix-budget-hint{max-width:145px;text-align:right;color:#8a9186;font-size:10px;line-height:1.45}
    .mountain-mix-split{padding:13px 14px;border-radius:12px;background:#f7f8f3;border:1px solid #edf0e8}
    .mountain-mix-split-head{display:flex;justify-content:space-between;gap:10px;margin-bottom:8px;color:#445445;font-size:11px;font-weight:800}
    .mountain-mix-split input[type=range]{width:100%;accent-color:#16833b;cursor:pointer}
    .mountain-mix-split-ends{display:flex;justify-content:space-between;gap:10px;color:#7c877a;font-size:10px}
    .mountain-mix-allocation{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:11px}
    .mountain-mix-allocation div{padding:10px;border:1px solid #e7ecdf;border-radius:10px;background:#fff}
    .mountain-mix-allocation small{display:block;color:#7e887d;font-size:10px}
    .mountain-mix-allocation strong{display:block;margin-top:4px;color:#1c6d35;font-size:16px}
    .mountain-mix-warning{margin:12px 0 0;padding:10px 11px;border-left:3px solid #d6a34a;border-radius:7px;background:#fffaf0;color:#786743;font-size:10px;line-height:1.55}
    .mountain-mix-preview{margin-top:14px;padding-top:13px;border-top:1px solid #edf0e8;color:#526052;font-size:11px;line-height:1.55}
    .mountain-mix-preview strong{color:#24392a}
    .mountain-mix-actions{display:flex;flex-direction:column;gap:9px;margin-top:15px}
    .mountain-mix-submit{width:100%;min-height:47px;border:0;border-radius:9px;background:#16833b;color:#fff;font-size:12px;font-weight:800;cursor:pointer;box-shadow:0 8px 17px rgba(22,131,59,.16);transition:background .18s,transform .18s}
    .mountain-mix-submit:hover:not(:disabled){background:#0d5f2c;transform:translateY(-1px)}
    .mountain-mix-submit:disabled{opacity:.45;cursor:not-allowed}
    .mountain-mix-browse{align-self:center;color:#16833b;font-size:11px;font-weight:800;text-decoration:none}
    .mountain-mix-browse:hover{text-decoration:underline}
    @media(max-width:760px){.mountain-mix-section{width:calc(100% - 28px);margin:25px auto 32px;padding:18px;border-radius:16px}.mountain-mix-layout{grid-template-columns:1fr;gap:20px}.mountain-mix-copy h2{font-size:31px}.mountain-mix-copy>p{font-size:12px}.mountain-mix-card{padding:15px}}
    @media(max-width:390px){.mountain-mix-ingredients{grid-template-columns:1fr}.mountain-mix-ingredient img{width:46px;height:46px}.mountain-mix-budget-input input{width:92px}.mountain-mix-budget-hint{max-width:115px}}
  `;

  function init() {
    if (document.getElementById("mountain-mix-lab")) return;
    const trustStrip = document.querySelector(".trust-strip");
    if (!trustStrip) return;

    const style = document.createElement("style");
    style.id = "mountain-mix-lab-styles";
    style.textContent = styles;
    document.head.appendChild(style);

    const section = document.createElement("section");
    section.id = "mountain-mix-lab";
    section.className = "mountain-mix-section";
    section.setAttribute("aria-labelledby", "mountain-mix-title");
    section.innerHTML = `
      <div class="mountain-mix-layout">
        <div class="mountain-mix-copy">
          <span class="eyebrow">✦ ONLY AT GB DRY FRUIT</span>
          <h2 id="mountain-mix-title">Build your own <em>Mountain Mix.</em></h2>
          <p>Choose your favourite mountain treats, set a budget and tell us how you would like it split. We will confirm the exact mix weight and final quote with you on WhatsApp before packing.</p>
          <div class="mountain-mix-perks"><span>✦ Your ingredients</span><span>₨ Your budget</span><span>♡ Made for you</span></div>
        </div>
        <div class="mountain-mix-card">
          <div class="mountain-mix-card-head"><h3>Create your custom blend</h3><span>YOUR MIX LAB</span></div>
          <div class="mountain-mix-ingredients" id="mountain-mix-ingredients" aria-label="Choose ingredients">
            <div class="mountain-mix-ingredient is-selected"><span>🥜</span><span class="mountain-mix-ingredient-copy"><strong>Loading Badam…</strong><small>Catalogue details loading</small></span></div>
            <div class="mountain-mix-ingredient is-selected"><span>💚</span><span class="mountain-mix-ingredient-copy"><strong>Loading Pista…</strong><small>Catalogue details loading</small></span></div>
          </div>
          <div class="mountain-mix-budget-row">
            <label for="mountain-mix-budget">Your mix budget
              <span class="mountain-mix-budget-input"><span>Rs.</span><input id="mountain-mix-budget" type="number" min="${BUDGET_MIN}" max="${BUDGET_MAX}" step="50" value="${DEFAULT_BUDGET}" inputmode="numeric" /></span>
            </label>
            <span class="mountain-mix-budget-hint">Product mix budget<br/>Delivery is separate</span>
          </div>
          <div class="mountain-mix-split">
            <div class="mountain-mix-split-head"><label for="mountain-mix-ratio">Budget preference</label><span id="mountain-mix-ratio-label">50% / 50%</span></div>
            <input id="mountain-mix-ratio" type="range" min="10" max="90" step="5" value="${DEFAULT_BADAM_SHARE}" aria-label="Budget share for Badam" />
            <div class="mountain-mix-split-ends"><span>More Badam</span><span>More Pista</span></div>
            <div class="mountain-mix-allocation" aria-live="polite">
              <div><small id="mountain-mix-badam-label">Badam preference</small><strong id="mountain-mix-badam-amount">Rs. 500</strong></div>
              <div><small id="mountain-mix-pista-label">Pista preference</small><strong id="mountain-mix-pista-amount">Rs. 500</strong></div>
            </div>
          </div>
          <p class="mountain-mix-warning">This is your preferred budget split, not a confirmed gram/weight quote. We will confirm available quantities and the final mix price on WhatsApp.</p>
          <div class="mountain-mix-preview" id="mountain-mix-preview" aria-live="polite"><strong>Your mix:</strong> Badam + Pista · <strong>Budget:</strong> Rs. 1,000</div>
          <div class="mountain-mix-actions">
            <button class="mountain-mix-submit" id="mountain-mix-whatsapp" type="button" disabled>Request my Mountain Mix on WhatsApp ↗</button>
            <a class="mountain-mix-browse" href="#shop">Or browse all ready-made products →</a>
          </div>
        </div>
      </div>`;
    trustStrip.insertAdjacentElement("afterend", section);

    const ingredientsRoot = section.querySelector("#mountain-mix-ingredients");
    const budgetInput = section.querySelector("#mountain-mix-budget");
    const ratioInput = section.querySelector("#mountain-mix-ratio");
    const whatsappButton = section.querySelector("#mountain-mix-whatsapp");
    const preview = section.querySelector("#mountain-mix-preview");
    let ingredientProducts = [];
    let catalogueError = false;

    function selectedProducts() {
      return [...ingredientsRoot.querySelectorAll("input[data-mix-id]:checked")]
        .map((input) => ingredientProducts.find((product) => Number(product.id) === Number(input.dataset.mixId)))
        .filter(Boolean);
    }

    function getBudget() {
      const raw = Number(budgetInput.value);
      if (!Number.isFinite(raw) || raw < BUDGET_MIN || raw > BUDGET_MAX) return null;
      return Math.round(raw);
    }

    function allocation() {
      const selected = selectedProducts();
      const budget = getBudget();
      if (!budget || selected.length === 0) return { selected, budget, shares: [] };
      if (selected.length === 1) return { selected, budget, shares: [{ product: selected[0], amount: budget, percent: 100 }] };
      const firstPercent = Number(ratioInput.value);
      const firstAmount = Math.round(budget * firstPercent / 100);
      return { selected, budget, shares: [
        { product: selected[0], amount: firstAmount, percent: firstPercent },
        { product: selected[1], amount: budget - firstAmount, percent: 100 - firstPercent }
      ] };
    }

    function updateIngredientCards() {
      const selectedIds = new Set(selectedProducts().map((product) => Number(product.id)));
      ingredientsRoot.querySelectorAll(".mountain-mix-ingredient").forEach((card) => {
        const input = card.querySelector("input");
        const selected = Boolean(input && selectedIds.has(Number(input.dataset.mixId)));
        card.classList.toggle("is-selected", selected);
        if (input) input.checked = selected;
      });
    }

    function updateBuilder() {
      const data = allocation();
      const [badamShare, pistaShare] = data.shares;
      const bothSelected = data.selected.length === 2;
      ratioInput.disabled = !bothSelected;
      section.querySelector(".mountain-mix-split").style.opacity = bothSelected ? "1" : ".72";
      section.querySelector("#mountain-mix-ratio-label").textContent = bothSelected
        ? `${badamShare.percent}% / ${pistaShare.percent}%`
        : data.selected.length === 1 ? "100% for selected item" : "Choose an ingredient";
      section.querySelector("#mountain-mix-badam-label").textContent = badamShare ? `${badamShare.product.name} preference` : "First ingredient";
      section.querySelector("#mountain-mix-pista-label").textContent = pistaShare ? `${pistaShare.product.name} preference` : "Second ingredient";
      section.querySelector("#mountain-mix-badam-amount").textContent = badamShare ? money(badamShare.amount) : "—";
      section.querySelector("#mountain-mix-pista-amount").textContent = pistaShare ? money(pistaShare.amount) : "—";

      if (!data.selected.length) {
        preview.innerHTML = "<strong>Your mix:</strong> Select Badam, Pista or both to continue.";
      } else if (!data.budget) {
        preview.innerHTML = `<strong>Your mix:</strong> ${data.selected.map((p) => escapeHtml(p.name)).join(" + ")} · <strong>Enter a budget from ${money(BUDGET_MIN)} to ${money(BUDGET_MAX)}.</strong>`;
      } else {
        preview.innerHTML = `<strong>Your mix:</strong> ${data.selected.map((p) => escapeHtml(p.name)).join(" + ")} · <strong>Budget:</strong> ${money(data.budget)}`;
      }
      whatsappButton.disabled = catalogueError || !data.selected.length || !data.budget;
    }

    function renderIngredientCards() {
      ingredientsRoot.innerHTML = ingredientProducts.map((product) => {
        const image = product.image ? `<img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" loading="lazy" />` : `<span aria-hidden="true">${escapeHtml(product.emoji || "🥜")}</span>`;
        const detail = `${product.weight || "Pack size to confirm"} · ${product.price == null ? "Price on request" : money(product.price)}`;
        return `<label class="mountain-mix-ingredient is-selected">
          <input type="checkbox" data-mix-id="${Number(product.id)}" checked />
          ${image}
          <span class="mountain-mix-ingredient-copy"><strong>${escapeHtml(product.name)}</strong><small>${escapeHtml(detail)}</small></span>
          <span class="mountain-mix-check" aria-hidden="true">✓</span>
        </label>`;
      }).join("");
      ingredientsRoot.addEventListener("change", updateBuilder);
      ingredientsRoot.addEventListener("change", updateIngredientCards);
      updateBuilder();
    }

    function requestMix() {
      const data = allocation();
      if (!data.selected.length || !data.budget) return;
      const shareLines = data.shares.map((share) => `• ${share.product.name}: preferred budget share ${money(share.amount)} (${share.percent}%)`).join("\n");
      const message = [
        "Assalam-o-Alaikum GB Dry Fruit! I would like to request a custom Mountain Mix.",
        "",
        `Target mix budget (delivery separate): ${money(data.budget)}`,
        "Selected ingredients and preferred budget split:",
        shareLines,
        "",
        "Please suggest the exact available grams/weights for this budget and confirm the final mix price before packing.",
        "Thank you!"
      ].join("\n");
      const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
      const win = window.open(url, "_blank", "noopener,noreferrer");
      if (!win) window.location.href = url;
    }

    ingredientsRoot.innerHTML = "<p style='grid-column:1/-1;color:#788078;font-size:12px'>Loading the latest Badam and Pista details…</p>";
    fetch("./products.json", { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error(`Catalogue request failed (${response.status})`);
        return response.json();
      })
      .then((catalogue) => {
        const wanted = [1, 3];
        ingredientProducts = wanted.map((id) => catalogue.find((product) => Number(product.id) === id)).filter(Boolean);
        if (ingredientProducts.length !== 2) throw new Error("Badam or Pista is missing from products.json");
        renderIngredientCards();
      })
      .catch((error) => {
        console.error("Mountain Mix Lab could not load catalogue:", error);
        catalogueError = true;
        ingredientsRoot.innerHTML = "<p style='grid-column:1/-1;color:#9b4c35;font-size:12px'>We could not load Badam and Pista right now. Please refresh the page.</p>";
        updateBuilder();
      });

    budgetInput.addEventListener("input", updateBuilder);
    ratioInput.addEventListener("input", updateBuilder);
    whatsappButton.addEventListener("click", requestMix);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
