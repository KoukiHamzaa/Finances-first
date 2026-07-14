# Order Management Dashboard

## Project Overview
This application is an internal tool designed for a Tunisian e-commerce operation. Staff can upload order data exported from carrier systems (Converty or Logista), manually sort individual orders into two brand categories (CAKADO or Balkis) via a drag-and-drop interface, and view live revenue summaries per brand after specific carrier fees are applied.

## Architecture
The application uses a **single-file React architecture**. All HTML structure, Tailwind utility classes, and JSX are contained entirely within `index.html`. It relies on the following CDNs:
- React 18: `react.production.min.js` and `react-dom.production.min.js`
- Babel Standalone: `@babel/standalone/babel.min.js` (for in-browser JSX transpilation)
- Tailwind CSS: `tailwindcss.com`
- SheetJS: `xlsx.full.min.js` (for parsing `.xlsx` and `.csv` files)

## Data Flow & Parsers
When a file is uploaded, the application detects its template type based on specific criteria:
- **CONVERTY**: Detected if headers contain `designation`, `prix`, and `etat`.
  - **Filtering**: Only includes rows where `Etat === 'Livré'`. Returned rows are ignored.
- **LOGISTA**: Detected if the first cell starts with `détails paiement` or `details paiement`.
  - **Dynamic Section Detection**: Uses keyword matching (e.g., `Code Barres` and `TTC (esp.)`) to locate the delivered and returns tables dynamically, avoiding hardcoded row indices.
  - **TTC Fallback**: For delivered sales, it reads `TTC (esp.)` at index 8. If null or invalid, it falls back to `TTC (chq.)` at index 9.
  - **Auto-Fee Computation**: Extracts delivery fees from column 10 of the delivered sub-table and return fees from column 8 of the returns sub-table to pre-fill the fee configuration.

## Business Logic
The application calculates the net revenue for each brand (CAKADO and Balkis) using the following financial formula:
```
Brand Final Total = Sum(Total Sales) - Delivery Fees - Return Fees
```
Fees are calculated based on the number of delivered and returned orders assigned to a specific brand multiplied by the brand's configured fee rates. The fee configuration structure is isolated per brand, allowing for different rates for the same delivery company depending on the brand.

## State Management
The application manages order rows using a three-zone state architecture with React's `useState`:
- `masterRows`: Contains initially uploaded, unassigned orders.
- `cakadoRows`: Contains orders assigned to CAKADO.
- `balkisRows`: Contains orders assigned to Balkis.

**Full Reset on Upload**: On every file upload, the state is completely reset. All rows are placed in `masterRows`, and the `cakadoRows` and `balkisRows` arrays are cleared.

## Drag and Drop
The application uses the **native HTML5 drag-and-drop API** (`onDragStart`, `onDragOver`, `onDrop`). All three columns (`master`, `cakado`, `balkis`) act as both valid drag sources and drop targets. The dragged row's unique identifier (`row.id`) is stored in the transfer payload.

## Setup/Usage Instructions
1. Download the `index.html` file to your local machine.
2. Open the file in any modern web browser.
3. Drag and drop a Converty or Logista `.xlsx` / `.csv` file into the upload zone to begin.
