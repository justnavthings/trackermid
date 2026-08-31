# EXAM QUEST — enabling sign-in and Google Sheets sync

The site works fully offline out of the box (progress is saved to the
browser). Two optional pieces turn on real accounts and cloud saving:

## 1. Google Sign-In

1. Go to the [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials.
2. Create an **OAuth client ID** → Application type: **Web application**.
3. Under "Authorized JavaScript origins," add the URL where you'll host `exam-quest.html` (e.g. `https://yourname.github.io` or your Vercel/Netlify domain). Localhost works too for testing (`http://localhost:5500` etc).
4. Copy the generated **Client ID**.
5. Open `exam-quest.html`, find the `CONFIG` block near the top of the `<script>` tag, and paste it into `GOOGLE_CLIENT_ID`.

## 2. Google Sheets sync

1. Create a new Google Sheet (any name).
2. Extensions → Apps Script, delete the placeholder code, and paste in everything from `exam-quest-appsscript.gs`.
3. Deploy → New deployment → type **Web app**:
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Authorize the permissions Google asks for, then copy the **Web app URL** (ends in `/exec`).
5. Paste that URL into `CONFIG.SHEETS_WEBAPP_URL` in `exam-quest.html`.

Once both are filled in, signing in with Google will load that
person's saved progress from the sheet, and every change (checking a
topic, editing, adding, theme switch) is pushed back to their row
automatically. Each signed-in user gets their own row, matched by
email — no collisions between users.

## Why this shape

A real username/password auth system and a direct Sheets API
connection both require a server holding secret credentials — that
can't live safely inside a single HTML file anyone can view-source.
Google Sign-In (verifies identity client-side, no secret needed) +
an Apps Script Web App (runs the actual Sheets write server-side,
under your Google account) is the standard way to get "auth +
spreadsheet backend" without exposing any keys. If you outgrow this
later — multiple collaborators, roles, finer-grained security — that's
the point to move to a proper backend (e.g. Supabase, as in the
original brief), which is a Claude Code job rather than a single
static file.

## Important note on the in-chat preview

The inline preview inside Claude's chat runs in a restricted sandbox
and cannot load `accounts.google.com` or call your Apps Script URL —
sign-in and sync will only work once you've downloaded the file and
hosted it for real (GitHub Pages, Netlify, Vercel, or even opening it
locally for the Sheets part). Local browser storage keeps working
everywhere, including the in-chat preview.
