# Amber Café V57 — Start here (no coding experience needed)

## What changed
The three starter questions appear as a horizontal row of rounded, selectable chips on desktop and wrap on small screens. Any chip submits a real AI chat question; visitors can also type anything.

## Before you begin
This is a complete café plus an AI server, not a normal single HTML webpage. The café can open as a local preview without the server, but **live AI requires running the included server**. Your ChatGPT subscription and API billing are separate.

### Step 1 — Create your private OpenAI API key
1. In your browser, go to https://platform.openai.com/api-keys and sign in.
2. Select **Create new secret key** and copy it. You may need to choose or create a Project first.
3. **Don't send the key in ChatGPT, email, screenshots, or public files.** This key authorizes API charges. If you accidentally share it, revoke and create a new one.

### Step 2 — Add a small API balance
1. Go to https://platform.openai.com/settings/organization/billing/overview .
2. Add payment details, and if your account uses prepaid billing, buy a small initial amount (the current minimum is generally $5).
3. Review automatic recharge: turn it off if you prefer to add funds manually. Consider setting budgets or alerts too. API charges are separate from ChatGPT Plus.

### Step 3 — Unzip and safely save the key
1. Double-click this ZIP, then open its extracted folder in Finder.
2. **Right-click `setup-api-key.command` → Open**. macOS may show a security warning on downloaded scripts; proceed only if you trust this package.
3. Paste the secret API key into the *hidden-answer* dialog, and click **Save Key**.
4. The helper writes a private, hidden `.env` file next to the launcher. **Don't upload or share that file or re-zip the folder with it included**. The helper stores the key only on your computer. You can run the helper again if you rotate keys.

### Step 4 — Install Node.js (one time)
1. Visit https://nodejs.org , download the macOS LTS installer (version 20 or newer), and install it with the normal installer.
2. Close any open Terminal windows after installation. No extra npm packages are required for this café.

### Step 5 — Launch and try the chatbot
1. In Finder, **right-click `start-cafe.command` → Open**. You may need to approve the downloaded script on first run.
2. A Terminal window will open and stay open while the café runs. Your browser should open http://127.0.0.1:4173/ automatically.
3. Walk to the waitress sprite, interact, and click one of the three chips or type your own question.
4. Leave the Terminal window open while using the café. To stop, close the window or press Control+C there.

### Troubleshooting
- "AI connection required": You may have opened `index.html` directly. Use `start-cafe.command` and `http://127.0.0.1:4173/` instead.
- "Node.js required": install the Node.js LTS from nodejs.org and reopen the launcher.
- "Invalid API key": repeat step 3 with a newly generated key.
- "No credits" or billing error: confirm API billing and balance on the platform (ChatGPT Plus is not API credit).
- "Model unavailable": your account may not have access to the `.env.example` model. Open `.env` in a plain-text editor and set `OPENAI_MODEL` to a model your API account supports, then relaunch. Don't share `.env`.
- Chat won't work for other people through this local preview. For a **public portfolio**, the server must be deployed with its key stored as a host secret. Never include `.env` in a public ZIP or website.

## Important security distinction
The key is a secret. The chatbot should access it only on the server. This package's private server-side `.env` is for your local development; before putting the café online, use your hosting provider's **server-side environment variable** setting and add rate limits, a spending budget, and abuse protection. Never put an API key in browser JavaScript.
