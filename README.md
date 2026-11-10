# GB Dry Fruit — Online Store

A responsive front-end dry-fruit shop inspired by the reference design. Built with plain HTML, CSS and JavaScript — no build tools or frameworks required.

## Files

- `index.html` — store layout and page content
- `style.css` — responsive styling
- `script.js` — product catalogue, search, category and price filters, sorting, cart and WhatsApp order flow

## Run the website

1. Extract the ZIP file.
2. Open the `GB-Dry-Fruit` folder in Visual Studio Code.
3. Open `index.html` in a browser (or use the VS Code Live Server extension).

## Before accepting real orders

Open `script.js` and change this line near the top:

```js
const WHATSAPP_NUMBER = "923001234567";
```

Replace the sample number with your business WhatsApp number in international format, without `+`, spaces or dashes. For Pakistan, use `92` followed by your mobile number (for example, `923001234567`). The sample number is only a placeholder; WhatsApp checkout is intentionally disabled until you replace it.

## Update products and prices

The sample products and prices are in the `products` array near the top of `script.js`. Replace them with your actual product names, weights and prices before publishing.

## Publish with GitHub Pages

1. Create a new GitHub repository, for example `GB-Dry-Fruit`.
2. Extract the ZIP on your computer.
3. Upload the contents of the `GB-Dry-Fruit` folder to the repository's root (upload `index.html`, `style.css`, `script.js` and `README.md`, not the ZIP itself).
4. In the repository, open **Settings → Pages**.
5. Under **Build and deployment**, choose **Deploy from a branch**, select `main` and `/ (root)`, then save.
6. GitHub will show the published website link in the Pages section once deployment finishes.

## Notes

- This is a front-end demo. It does not include customer accounts, a payment gateway, inventory management, a database or an admin dashboard.
- Product prices are example/demo prices and should be updated before real sales.
- Google Fonts are loaded online; the layout still works with local system fonts if unavailable.
