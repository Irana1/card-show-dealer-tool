# Card Show Dealer Tool

## Card search languages

Card search supports English and Japanese Pokémon cards. Choose the language
before searching; market price lookups and inventory price updates use the
matching Pokémon or Pokémon Japan pricing catalog.

When a Japanese card is added to inventory, its card and set names use the
official English counterpart when TCGdex can match it confidently. Japanese
names are kept when a matching English counterpart cannot be verified.

Promo cards use their TCGplayer product ID for market-price lookup when TCGdex
provides one, avoiding reliance on promo set names and numbering conventions.
If a promo card record has no image URL, the app tries the corresponding TCGdex
promo image asset.

## Deploying market pricing for GitHub Pages

GitHub Pages hosts the frontend only. Market prices are fetched by the Express
backend in `server`, which must be deployed separately for pricing to work on
your phone or other devices.

1. In Render, create a new Blueprint from this repository and use the included
   `render.yaml`.
2. Set the `JUSTTCG_API_KEY` environment variable for the new service to your
   JustTCG API key. Keep this key in Render; do not put it in the frontend.
3. After the service deploys, copy its public HTTPS URL (for example,
   `https://card-show-pricing-api.onrender.com`).
4. In `js/api.js`, replace `http://localhost:3000` in `API_BASE_URL` with the
   Render URL, then commit and push the change so GitHub Pages can use it.

The `localhost` URL is for local development. An installed GitHub Pages app
cannot reach a backend at `localhost` because that address refers to the
device running the app. Render's free service may take a short time to wake up
after being idle.
