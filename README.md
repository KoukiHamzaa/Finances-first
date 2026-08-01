# Intigo Financial Reconciliation Console (v1.0)

A secure, offline-first React SPA for financial reconciliation of e-commerce carrier data. The console parses `.xlsx` and `.csv` files from three Tunisian carriers (CONVERTY, LOGISTA, and INTIGO) to calculate delivery fees, return fees, and calculate net settlements across two distinct brands (Cakado and Balkis). 

## Architecture

- **Single-File React SPA**: Built as a self-contained `index.html` executing entirely in the browser using Babel-Standalone. No build steps required.
- **Client-Side Parsing**: Relies on `SheetJS` (`xlsx.full.min.js`) loaded via CDN for rapid client-side file parsing without server involvement.
- **Styling**: `Tailwind CSS` via CDN, augmented with custom CSS variables providing a toggleable "Console" (dark) and "Light" theme.
- **Security**: The application operates predominantly offline. API keys (for Intigo product enrichment) are supplied at runtime by the user, retained purely in `localStorage`, and interact directly with the Intigo API without proxy servers.

## Features

- **Automated Carrier Parsing**: Transparently auto-detects column structures and row mapping for Converty, Logista, and Intigo exports based on exact header signatures.
- **Cross-Brand Splitting**: Employs a three-tray drag-and-drop / bulk-move system. All rows initially land in the "Master" (unassigned) tray and can be categorized into Cakado or Balkis trays.
- **Dynamic Fee Rules**: Fully adjustable base fees (delivery / return) per brand. Supports real-time recalculation of Net Carrier vs Net Rules. 
- **Intigo Enrichment Pipeline**: Implements a robust fetch loop mapping `nid` back to product names by calling Intigo's `/api/v3/parcels` endpoint. Includes silent rate-limit throttling (HTTP 429), resilient 404 endpoint fallbacks, cache guarding, generation token cleanup, and status reconciliation.
- **Governorate Alias Resolution**: Implements a comprehensive Arabic/French lookup dictionary mapping raw messy text strings (e.g., "Tunis", "TNS", "تونس") into standardized internal codes for precise regional fee logic.
- **Financial Validation**: Tracks both "Carrier Reported Fees" and "Internal Rule Fees", highlighting discrepancies via automated positive/negative Δ indicators.

## Operation & Workflow

1. **Ingest**: Drop an exported `.xlsx` file from the carrier onto the drop zone.
2. **Review Initial Validation**: The application flags unknown governorates, duplicate NIDs, and unrecognized parcel states as dismissible banners for immediate correction.
3. **Product Enrichment (Intigo only)**: Requires an active Intigo API Key. Parcels undergo iterative fetch requests to attach product descriptions, updating dynamically in the grid.
4. **Assignment**: Assign groups of rows to either brand tray (Cakado or Balkis) via bulk selection.
5. **Reconcile**: View the live command bar metrics comparing expected settlements vs actuals.
