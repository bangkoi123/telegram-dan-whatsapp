# Account Manager for Telegram & WhatsApp

This is a web-based dashboard designed to manage multiple Telegram and WhatsApp accounts from a single, centralized interface. The core feature of this application is its "Humanization Engine," which uses AI (via Google's Gemini API) to simulate realistic user activity, helping to maintain account health and activity metrics.

## ⚠️ Current Status: Hybrid Development

This project is currently in a **hybrid state**. Some features are connected to a live backend, while others are still using a mocked/simulated API for rapid frontend development.

-   **LIVE Features (Connected to Backend):**
    -   **Telegram Login via OTP:** The flow for adding a Telegram account using a phone number, receiving an OTP, and entering a 2FA password now makes real API calls to the Python backend server (`/api/telegram/...`). This is handled by `src/api/apiClient.ts`.

-   **SIMULATED Features (Using Mock API):**
    -   **All WhatsApp Functionality:** Adding accounts, checking status, and humanization for WhatsApp are currently simulated.
    -   **Telegram QR Code Login:** The entire QR code generation and confirmation flow is mocked.
    -   **Account Status Checks:** The "Refresh" button on account cards uses a simulated API that returns random statuses (`active`, `restricted`, `inactive`).
    -   **Proxy Connection Tests:** The proxy test function returns simulated success/failure results.
    -   **Humanization Actions:** While the Activity Log shows actions being performed, the backend logic to actually send messages or update statuses is not yet implemented. The log entries are generated on the frontend for demonstration purposes.
    -   All simulated logic can be found in `src/api/mockApi.ts`.

## ✨ Key Features

-   **Multi-Platform Management:** A unified dashboard for both Telegram and WhatsApp accounts.
-   **Account Management:**
    -   Add new accounts.
    -   Delete existing accounts.
    -   Enable or disable accounts individually.
-   **Flexible Login Methods:**
    -   **Telegram:** OTP (Live) & QR Code (Simulated).
    -   **WhatsApp:** QR Code (Simulated).
-   **Per-Account Proxy Configuration:**
    -   Assign unique HTTP or SOCKS5 proxies to each account.
    -   Includes a built-in (simulated) proxy connection tester.
-   **🤖 Humanization Engine:**
    -   **Global Toggle:** Easily enable or disable the entire engine.
    -   **Activity Intensity:** Set the frequency of actions to Low, Medium, or High.
    -   **Customizable Activities:** Choose which actions the engine can perform (e.g., account-to-account chat, posting status updates, interacting with AI bots).
    -   **AI-Powered Persona:** Configure a "System Instruction" and provide a Gemini API Key to give the AI a specific personality for its interactions.
-   **Global Settings:**
    -   Centrally configure Telegram API credentials (API ID & Hash).
    -   Manage the Gemini API key for all AI-related tasks.
-   **Humanization Activity Log:**
    -   A real-time feed displaying all actions performed by the Humanization Engine.
    -   Filter logs by platform (All, Telegram, WhatsApp).

## 🛠️ Tech Stack

-   **Frontend:** React, TypeScript, Vite
-   **Backend:** Python, Flask, Telethon
-   **Deployment (Backend):** Gunicorn

## 🚀 Getting Started

To run this project locally, you will need to run both the frontend and the backend servers.

### Prerequisites

-   [Node.js](https://nodejs.org/en/) (v18 or later recommended)
-   [Python 3](https://www.python.org/downloads/) (v3.8 or later recommended)

### 1. Backend Setup

The backend server handles the real API interactions with Telegram.

```bash
# 1. Navigate to the backend directory
cd backend

# 2. Create and activate a virtual environment
# On Windows:
# python -m venv venv
# .\venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# 3. Install Python dependencies
pip install -r requirements.txt

# 4. Run the Flask server
flask run

# The backend is now running on http://127.0.0.1:5000
```

### 2. Frontend Setup

The frontend is the React application that you interact with in the browser.

```bash
# 1. Open a new terminal and navigate to the project root directory (if you're not already there)

# 2. Install Node.js dependencies
npm install

# 3. Start the Vite development server
npm run dev

# The frontend is now running, typically on http://localhost:5173
```

You can now open the frontend URL in your browser and use the application. The frontend will automatically communicate with the backend server running on `port 5000`.

## 🗺️ Project Roadmap

-   [ ] **Backend Integration:** Transition all remaining simulated API calls in `mockApi.ts` to the live Python backend.
-   [ ] **Implement Humanization Logic:** Build the core logic in the backend for the Humanization Engine to perform its scheduled actions using Telethon and the Gemini API.
-   [ ] **WhatsApp Integration:** Implement the real backend logic for managing WhatsApp accounts.
-   [ ] **Database Persistence:** Integrate a database (e.g., SQLite, PostgreSQL) to persist account information instead of using browser `localStorage`.
-   [ ] **UI/UX Enhancements:** Continue to refine the user interface and experience.
