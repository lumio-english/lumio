# Setting up Google Sheets sync for Lumio

This connects your teacher dashboard to a shared Google Sheet, so the
roster, class schedule, and lesson progress all sync across every
device/teacher instead of staying trapped in one browser.

Takes about 10 minutes. You only do this once.

---

## 1. Create the Sheet

1. Go to [sheets.google.com](https://sheets.google.com) and create a
   **new blank spreadsheet**.
2. Name it something like "Lumio Data" (top-left, click "Untitled
   spreadsheet").
3. You don't need to add any tabs or columns yourself — the script does
   that automatically the first time it runs.

## 2. Add the script

1. In the Sheet, go to **Extensions → Apps Script**. A new tab opens
   with a code editor.
2. You'll see a placeholder file called `Code.gs` with a few empty
   lines in it. **Select all of that and delete it.**
3. Open `AppsScript-Code.gs` (the file that came with this guide),
   copy its entire contents, and paste it into the empty editor.
4. Click the **save icon** (or Ctrl/Cmd+S). Give the project a name if
   asked, e.g. "Lumio Sync."

## 3. Deploy it as a Web App

1. Top-right, click **Deploy → New deployment**.
2. Click the gear icon next to "Select type" and choose **Web app**.
3. Fill in:
   - **Description:** anything, e.g. "Lumio sync v1"
   - **Execute as:** **Me** (your Google account)
   - **Who has access:** **Anyone**
     *(this doesn't mean anyone can edit your Sheet — it means the web
     address can be called from your Lumio site without asking a
     visitor to log into Google first. Only people with the exact,
     hard-to-guess URL can reach it, and it can only do what the script
     above allows: read/write these four specific tabs.)*
4. Click **Deploy**.
5. Google will ask you to **authorize** the script the first time —
   click through the consent screens (it'll warn you it's an
   unverified app, since you wrote it yourself; click "Advanced" →
   "Go to Lumio Sync (unsafe)" → allow).
6. You'll be given a **Web app URL** that looks like:
   ```
   https://script.google.com/macros/s/AKfycb.../exec
   ```
   **Copy that whole URL.**

## 4. Connect it in Lumio

1. Open your teacher dashboard, log in as the **owner** (👑 Teacher
   Lumi, or whoever you've promoted to owner).
2. Go to **Students → 🔄 Sync settings**.
3. Paste the Web App URL into the field and click **Save**.
4. Click **Sync now**. It should say "Synced just now."
5. Open the Google Sheet again — you should now see tabs called
   **Teachers**, **Roster**, **Schedule**, and **Progress** with your
   data in them.

Do this same "paste the URL, Sync now" step on every device/browser
you want kept in sync — each one needs the same Web App URL.

---

## What actually gets synced

- **Roster** — students and teachers, including avatars and levels.
  PINs are sent as a one-way **hash**, never in plain text — the
  Sheet itself can't be used to look up anyone's actual PIN.
- **Schedule** — every booked class.
- **Progress** — lesson results (stars, score, date) for every
  student, flattened into one row per lesson completed. Syncs
  **both ways**: your device pulls in anyone else's progress first
  (keeping whichever score has more stars, same rule the site already
  uses locally), then pushes the merged result back up — so no device
  can accidentally downgrade a student's best score.

## Troubleshooting

- **"Sync failed"** — double check the URL was pasted in full,
  including `/exec` at the end, and that you chose "Anyone" for access
  when deploying.
- **The URL works fine in a browser tab, but "Sync now" still fails** —
  this was an actual bug we hit and fixed: Apps Script Web Apps don't
  handle the CORS preflight request that browsers send before a `POST`
  with `Content-Type: application/json`. The sync code now sends
  `text/plain;charset=utf-8` instead (Apps Script still parses the body
  as JSON fine either way) — if you're on an older copy of
  `lumio-profiles.js` / `lumio-schedule.js` / `teacher.html`, update to
  the latest version to pick up this fix.
- **Re-deploying after editing the script** — if you ever change the
  Apps Script code, you need to **Deploy → Manage deployments → Edit
  (pencil icon) → New version → Deploy** for the changes to actually
  take effect. Saving the code alone isn't enough.
- **Data looks wrong in the Sheet** — the Roster/Teachers/Schedule tabs
  are a mirror of whatever the most recent sync sent; don't hand-edit
  rows in the Sheet expecting them to flow back into Lumio — pulling
  from manual Sheet edits isn't supported yet.
