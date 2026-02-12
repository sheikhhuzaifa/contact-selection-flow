## Contact Selection + Edit Flow

This project implements the **Contact Selection + Edit Flow** take‑home assignment using **Next.js (App Router)**, **React**, **TypeScript**, and **Material UI (MUI)**.

### Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **UI**: Material UI (MUI)
- **Node**: Recommended \(v20.19.4\)

### Features

- **Three related fields**: `Client 1`, `Client 1 Primary Contact`, `Client 1 Secondary Contact`
- **Search → Select → Summary → Edit/Create** flow per field
- **Debounced search** against `https://dummyjson.com/users/search`
- **Summary card** with required‑field highlighting
- **Shared Edit/Create modal** with validation rules:
  - Required: name, email (valid format), address line 1, city, country
  - Company: company name required
  - Individual: first + last name required
- **Persistence** via `localStorage` so a refresh restores the current selections
- **Server‑side logging** via `/api/log`:
  - Logs `create` and `update` events from the edit/create modal
  - Logs the full payload on **Final Submit**
  - Logs are appended to `logs/events.log`

### Setup

From the project root (`contact-selection-flow`):

```bash
nvm use 20.19.4   # optional, if you have nvm and this Node version
npm install
```

### Running the app

```bash
npm run dev
```

Then open `http://localhost:3000` in your browser.

### Notes

- This app does not persist data on the server; it only logs JSON lines for `create`, `update`, and `submit` actions to `logs/events.log`.
- Client‑side state is stored under the `localStorage` key `contact-selection-state-v1`.
