# snip — URL shortener

React + Firebase (Firestore + Hosting). Tracks every click: time, browser,
OS, referrer, language. No backend server needed — Firestore does the storage,
Hosting serves the static React app.

## 1. Create the Firebase project (short name = short URL)

1. Go to https://console.firebase.google.com → **Add project**
2. For the Project ID, try something short — this becomes `NAME.web.app`.
   Ideas: `snp`, `snpit`, `csnip`, `snip99`, `getsnip`. Project IDs are
   globally unique across ALL Firebase users, so short common words are
   usually already taken — you'll need to try a few.
3. Skip Google Analytics (not needed).
4. Once created: **Build → Firestore Database → Create database** → start
   in **production mode** → pick any region close to you.
5. **Build → Hosting** → click "Get started" (you don't need to follow the
   CLI steps shown there, we'll do that below).
6. Go to **Project settings (gear icon) → General → Your apps → Web (</>)**,
   register an app (nickname anything), and copy the `firebaseConfig` object
   it gives you.

## 2. Wire up the code

Paste your config into `src/firebase.js`, replacing the placeholder values:

```js
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
}
```

Also update `.firebaserc` — replace `YOUR_PROJECT_ID` with your real project ID.

## 3. Run it locally

```bash
npm install
npm run dev
```

Opens at http://localhost:5173

## 4. Deploy to Firebase Hosting

```bash
npm install -g firebase-tools   # one-time
firebase login
npm run build
firebase deploy --only hosting,firestore:rules
```

That's it — your app is live at `https://YOUR_PROJECT_ID.web.app`.

## How it works

- **Home page** — paste a long URL, get back `yoursite.web.app/abc123`.
  Optionally set a custom code instead of a random one.
- **Redirect** — visiting `/abc123` looks up the URL in Firestore, logs a
  visit (timestamp, browser, OS, referrer, language, screen size — all read
  from the visitor's own browser, nothing server-side or IP-based), bumps
  the click counter, then forwards the browser to the real destination.
- **Stats page** — `/stats/abc123` shows total clicks and a table of every
  visit logged for that link.
- "Your links" on the home page reads short codes from `localStorage` on
  your own device, so you can find links you've created again — it's not a
  login system.

## Note on security

Firestore rules in `firestore.rules` are intentionally open (anyone can
create a link, anyone can view stats for a code they know) since there's no
login system. That's fine for personal/demo use. If you want private stats,
add Firebase Authentication and restrict the `visits` read rule to the
link's creator — happy to help wire that up if you want it.
