# Yellow Farmhouse Treats – Dev Onboarding

## 1. Project Inventory

- **HTML entry points**
  - `index.html` – main storefront (catalog, filters, modal, cart badge, alerts).
  - `cart.html` – checkout form showing persisted cart contents.
  - `share-preview.html` – metadata preview page for social sharing.
- **Data**
  - `products.json` – single source of truth for catalog (names, categories, base prices, dietary flags, option sets).
- **JavaScript**
  - `product_loader.js` – loads `products.json`, builds category tabs/cards, handles filters, modal, search, sort, and wiring `addToCart`.
  - `cart.js` – manages cart state (localStorage key `yft_cart`), badge updates, success/error alerts, checkout rendering, and exposes helpers on `window`.
- **Styles**
  - `styles.css` – shared styling for badges, sticky header, cards, alerts, forms. Minified version is generated for production.
- **Assets**
  - `/images/*` – product imagery referenced from `products.json`/HTML.
- **Tooling**
  - `npm run format` (Prettier).
  - `npm run build:js`, `npm run build:css`, `npm run build` – generate `.min.js/.min.css` plus cache-busting query strings in HTML.

## 2. Link & Dependency Notes

- `index.html` loads the minified JS/CSS; whenever source files change, rerun `npm run build` so production assets stay in sync.
- Inline handlers (`onclick="addToCart(...)"`, modal controls) depend on functions attached to `window` from `cart.js`/`product_loader.js`. Renaming/removing them breaks UI instantly.
- Cart badge (`#cartBadge`), success/error alerts (`#successAlert`, `#errorAlert`), modal container IDs, and filter inputs must remain stable; JS queries by ID/class.
- Cart persistence relies on `localStorage["yft_cart"]` with the current schema. Any schema change requires migration logic in both JS files.

## 3. Critical Areas & “Do Not Touch” Without Coordination

1. **Cart storage & badge logic**
   - Keep storage key `yft_cart`.
   - Maintain DOM IDs for badge and alerts.
   - Never edit `cart.min.js` directly—regenerate via build script.
2. **Modal plumbing**
   - `product_loader.js` dynamically injects modal markup and relies on data-index attributes. Don’t delete or rename without refactor plan.
3. **Dietary filters**
   - `canGlutenfree` / `canSugarfree` booleans in `products.json` drive badges and filter buttons. Preserve types and naming.
4. **Global exposures**
   - Ensure `window.addToCart`, `window.openProductModal`, etc., remain defined; inline HTML references them.
5. **Build artifacts**
   - Only modify source files (`product_loader.js`, `cart.js`, `styles.css`). Run build scripts to regenerate `.min.*`. Editing minified output is forbidden.

## 4. Workflow for New Developers

1. Clone repo, run `npm install`.
2. Use `python3 -m http.server 8000` (or `npx serve . -l 8000`) for local testing against unminified assets.
3. Make changes in source files only.
4. Run `npm run format` before committing.
5. Run `npm run build` to regenerate production assets and update HTML references.
6. Test full cart flow:
   - Add item → success alert appears.
   - Badge increments and remains visible while scrolling.
   - Proceed to checkout → `cart.html` lists items and totals.
   - Removing items updates badge and storage.
   - GF/SF filters, search, sort, and modal option changes behave as expected.

## 5. Quick Testing Checklist

- Desktop & mobile viewports (sticky header + badge alignment).
- Add/Remove cart items; refresh page to confirm persistence.
- Proceed to checkout page; verify same cart contents.
- Toggle gluten-free / sugar-free filters (alone and combined).
- Modal option changes reflect in cart line item text/pricing.
- DevTools console shows no errors after interactions.

Keep this doc up to date whenever the architecture or workflow changes.```// filepath: .github/workflows/copilot_instructions.md

# Yellow Farmhouse Treats – Dev Onboarding

## 1. Project Inventory

- **HTML entry points**
  - `index.html` – main storefront (catalog, filters, modal, cart badge, alerts).
  - `cart.html` – checkout form showing persisted cart contents.
  - `share-preview.html` – metadata preview page for social sharing.
- **Data**
  - `products.json` – single source of truth for catalog (names, categories, base prices, dietary flags, option sets).
- **JavaScript**
  - `product_loader.js` – loads `products.json`, builds category tabs/cards, handles filters, modal, search, sort, and wiring `addToCart`.
  - `cart.js` – manages cart state (localStorage key `yft_cart`), badge updates, success/error alerts, checkout rendering, and exposes helpers on `window`.
- **Styles**
  - `styles.css` – shared styling for badges, sticky header, cards, alerts, forms. Minified version is generated for production.
- **Assets**
  - `/images/*` – product imagery referenced from `products.json`/HTML.
- **Tooling**
  - `npm run format` (Prettier).
  - `npm run build:js`, `npm run build:css`, `npm run build` – generate `.min.js/.min.css` plus cache-busting query strings in HTML.

## 2. Link & Dependency Notes

- `index.html` loads the minified JS/CSS; whenever source files change, rerun `npm run build` so production assets stay in sync.
- Inline handlers (`onclick="addToCart(...)"`, modal controls) depend on functions attached to `window` from `cart.js`/`product_loader.js`. Renaming/removing them breaks UI instantly.
- Cart badge (`#cartBadge`), success/error alerts (`#successAlert`, `#errorAlert`), modal container IDs, and filter inputs must remain stable; JS queries by ID/class.
- Cart persistence relies on `localStorage["yft_cart"]` with the current schema. Any schema change requires migration logic in both JS files.

## 3. Critical Areas & “Do Not Touch” Without Coordination

1. **Cart storage & badge logic**
   - Keep storage key `yft_cart`.
   - Maintain DOM IDs for badge and alerts.
   - Never edit `cart.min.js` directly—regenerate via build script.
2. **Modal plumbing**
   - `product_loader.js` dynamically injects modal markup and relies on data-index attributes. Don’t delete or rename without refactor plan.
3. **Dietary filters**
   - `canGlutenfree` / `canSugarfree` booleans in `products.json` drive badges and filter buttons. Preserve types and naming.
4. **Global exposures**
   - Ensure `window.addToCart`, `window.openProductModal`, etc., remain defined; inline HTML references them.
5. **Build artifacts**
   - Only modify source files (`product_loader.js`, `cart.js`, `styles.css`). Run build scripts to regenerate `.min.*`. Editing minified output is forbidden.

## 4. Workflow for New Developers

1. Clone repo, run `npm install`.
2. Use `python3 -m http.server 8000` (or `npx serve . -l 8000`) for local testing against unminified assets.
3. Make changes in source files only.
4. Run `npm run format` before committing.
5. Run `npm run build` to regenerate production assets and update HTML references.
6. Test full cart flow:
   - Add item → success alert appears.
   - Badge increments and remains visible while scrolling.
   - Proceed to checkout → `cart.html` lists items and totals.
   - Removing items updates badge and storage.
   - GF/SF filters, search, sort, and modal option changes behave as expected.

## 5. Quick Testing Checklist

- Desktop & mobile viewports (sticky header + badge alignment).
- Add/Remove cart items; refresh page to confirm persistence.
- Proceed to checkout page; verify same cart contents.
- Toggle gluten-free / sugar-free filters (alone and combined).
- Modal option changes reflect in cart line item text/pricing.
- DevTools console shows no errors after interactions.

Keep this doc up to date whenever the architecture or workflow changes.```
