# Finances-first

A React + Vite SPA for e-commerce reconciliation across carriers/brands (Cakado/Kekado and Balkis). It imports Excel/CSV files, classifies orders, lets you assign rows between brands, applies delivery/return fees (including Intigo regional return fees), computes totals, and supports Intigo product enrichment.

## Lock screen

The app starts with a discreet access gate. The user must enter two dates (one per field), accepting either order:
- Birthday: `24/09/1996`
- Current date: actual date in the `Africa/Tunis` timezone

Validation normalizes `DD/MM/YYYY`, `DD-MM-YYYY`, and `YYYY-MM-DD`. On success, an unlock flag is stored in `sessionStorage` (`lock_unlocked=1`) for that tab session (refresh preserves unlock in the same tab; new tabs require re-entry). On failure, the browser navigates to `https://www.google.com/` via `location.replace` (no history entry retained). Incomplete inputs do not trigger redirection.

> Note: The birthday is a hardcoded value in the frontend. For non-personal deployments, move it to a build-time environment variable (e.g. `VITE_LOCK_DATE`) instead of embedding in source.

## Fees

- Standard carriers (Converty/Logista): delivery and return fees per parcel (manual).
- Intigo: three fee inputs per brand:
  - Delivery fee (all delivered parcels)
  - Return fee — Grand Tunis (Tunis, Mannouba, Ariana, Ben Arous)
  - Return fee — Other governorates
When an Intigo file is uploaded, `parseIntigo` derives these rates from the `Frais` column (first observed values for delivered, Grand Tunis returned, non-Grand-Tunis returned) and pre-fills the inputs. You can override them manually. `calculateStats` applies the appropriate regional return fee based on `resolveGov(city)`.

## Import handling

- CSV/Excel detection is automatic. Text-based files (CSV) are decoded as UTF-8 (with Windows-1252 fallback) to preserve accented characters.
- Payment receipts (summary) are shown in a dedicated split panel; no synthetic product rows are loaded into trays. Order detail files populate master rows for classification.
- The "First Delivery" (Détails recette) format extracts product name from `designation`, price from `Prix`, and phone from `Client` ("Name / phone").

## Development

- Install: `npm install`
- Dev: `npm run dev`
- Build: `npm run build`
- Test: `node --test "tests/*.test.js"`
- Lint: `npm run lint`

## Security notes

- Intigo API key is stored in `localStorage` (`intigoApiKey`). Requests use `X-API-Key`. No key is logged.
- File parsing is synchronous on main thread for typical export sizes.
- Unlock state uses `sessionStorage` (tab-scoped). No permanent bypass via refresh within the same tab.
