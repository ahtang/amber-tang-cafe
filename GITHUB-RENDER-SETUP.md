# Amber Café V59 — Publish on GitHub Pages + Render Free + OpenAI

## Before you start
You need: a GitHub account, the free GitHub Desktop app for Mac, a free Render account, Node.js on Render (no Mac terminal), and an OpenAI API account with billing enabled. **Never paste your secret API key into GitHub, this ZIP, or ChatGPT.**

This archive has two folders: `GITHUB-PAGES-SITE` (public website) and `RENDER-AI-BACKEND` (server code, including private portfolio source files). **Keep the backend repository private** if you don't want its interview sources accessible publicly. GitHub Pages will be public. The two copies of your work remain distinct.

## Part A — GitHub Pages, no terminal
1. Install GitHub Desktop from https://desktop.github.com and sign into GitHub.
2. On github.com create a *public* repository called `amber-portfolio-cafe` with a README. (Use your desired repository name.)
3. In GitHub Desktop, choose **File → Clone Repository**, select the new repository, and pick a folder on your Mac.
4. Open the repository's local folder in Finder via **Repository → Show in Finder**. Copy **the contents inside** `GITHUB-PAGES-SITE` into the repository folder. Keep `index.html` at the top level beside `.nojekyll`, `assets`, and `portfolio`.
5. Return to GitHub Desktop, enter a summary such as `Publish café portfolio`, click **Commit to main**, then **Push origin**. This can take time because your portfolio contains many images. Do not use GitHub's browser file-upload for the large game script.
6. At github.com, go to the repository **Settings → Pages → Build and deployment → Deploy from a branch → main → /(root)** and save. Your public URL will be `https://YOUR-GITHUB-USERNAME.github.io/amber-portfolio-cafe/` after deployment.
7. Open the site and confirm the game loads before enabling chat. It will use its saved offline fallback until Render is connected.

## Part B — Create private backend repo
8. At github.com create a **private** repository `amber-cafe-ai` with a README, then clone it in GitHub Desktop.
9. Copy the contents of `RENDER-AI-BACKEND` into this local repo folder. Commit and push from GitHub Desktop. **Do not put `.env` or an API key into this repository.**

## Part C — Host backend on Render
10. Open https://dashboard.render.com/ → **New → Web Service** → connect your GitHub account and select the private `amber-cafe-ai` repo (grant Render access when prompted).
11. Set **Language**: Node; **Root directory**: blank; **Build command**: `echo Ready`; **Start command**: `node server.mjs`; **Instance type**: Free.
12. In Render Environment add these as **separate key/value rows**:
    - `OPENAI_API_KEY`: your secret key from https://platform.openai.com/api-keys — paste into Render only.
    - `OPENAI_MODEL`: an API model available to your account; default package value is `gpt-6-sol` but confirm your model access and pricing.
    - `API_ONLY`: `1`
    - `ALLOWED_ORIGINS`: `https://YOUR-GITHUB-USERNAME.github.io` (NO slash or repo path; replace username)
13. Click **Create Web Service**. Wait for a **Live** status, then copy the `https://YOUR-NAME.onrender.com` public address. Free instances sleep after periods of inactivity, so initial messages may fall back to saved answers.

## Part D — Connect your café to Render
14. In your *GitHub Pages* local repo folder open `assets/cafe-config.js` in any text editor. Change the last line to:

    `window.CAFE_CHAT_API_URL = 'https://YOUR-NAME.onrender.com/api/chat';`

    Replace the placeholder with your own Render URL, keep `/api/chat`, and **do not** put your OpenAI key in this file.
15. Save. In GitHub Desktop for the site repo, **Commit to main** and **Push origin**. GitHub Pages republishes the site.
16. Reload the live café, interact with Amber, click one of the three persistent question chips, then ask a follow-up about that project.

## Part E — Verify and troubleshoot
- Open `https://YOUR-NAME.onrender.com/api/status` in a browser. `online:true` means Render sees an API key; it does not prove account billing/model access.
- If you get generic scripted answers, the public API URL may be wrong, Render may be waking up, the API key/billing may need attention, or the origin may not be allowed. Check Render → Logs.
- If Render logs show `Origin not permitted`, set `ALLOWED_ORIGINS` to exactly `https://YOUR-GITHUB-USERNAME.github.io` (scheme + host only).
- If the pages/images fail, check that `index.html`, the two `assets/cafe-engine-*.js` files, `portfolio/`, and `.nojekyll` are at the repository root.
- If GitHub Desktop refuses the large JavaScript file, don't use the browser uploader; confirm it is less than 100 MiB and use GitHub Desktop. This package splits the original HTML script so each file is below 100 MiB.
- Enable OpenAI usage budgets/alerts and monitor API activity. The backend has a basic in-memory rate limit of 40 requests per IP per hour; that is not strong protection against determined abuse and resets on restart.
- For privacy, the site contains the portfolio and the private Render repo contains fuller interview notes. Only make the backend repo public if you intend to publish those sources.
- For reliable, fast chat, move Render from free to paid hosting later. Free hosting may spin down and is not intended for production reliability.

References: https://docs.github.com/en/pages ; https://render.com/docs/your-first-deploy ; https://help.openai.com/en/articles/5112595-best-practices-for-api-key-safety
