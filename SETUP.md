# Setup, deployment and maintenance guide

This guide covers everything operational: testing locally, publishing on
GitHub Pages, enabling the automated monthly data updates, and maintaining
the data. No coding knowledge is required. (For what the project *is*, see
`README.md`.)

---

## 1. Test on your computer (no tools needed)

1. Keep all files together in one folder, exactly as they are (do not move
   files out of the `data` folder).
2. Double-click **`index.html`** — it opens in your browser and everything
   works.
   - With internet you also get the world map and the nicer fonts.
   - Without internet, the map becomes a country grid and the rest works
     normally (intentional fallback, not an error).

Why it works offline: browsers block pages opened from a folder from reading
local JSON files, so the project includes `data/embedded_data.js`, an
auto-generated backup copy of all data that the page can always read.

---

## 2. Publish on GitHub Pages (free), step by step

1. **Create a GitHub account** (free) at <https://github.com> → **Sign up**.
2. **Create a repository**: click the **+** (top-right) → **New repository**.
   - Name: `country-resilience-dashboard`
   - Visibility: **Public** (required for free GitHub Pages)
   - Click **Create repository**.
3. **Upload all files**: click **uploading an existing file** (or
   **Add file → Upload files**) and drag in the *contents* of the project
   folder: `index.html`, `style.css`, `app.js`, `README.md`, `SETUP.md`, and
   the `data`, `scripts`, and `.github` folders.
   - Dragging the folders themselves keeps the folder structure. `data` must
     end up as a folder named `data` containing the JSON files.
   - Note: some browsers hide the `.github` folder in file pickers because
     its name starts with a dot. If it did not upload, use
     **Add file → Create new file**, type
     `.github/workflows/update-data.yml` as the filename (GitHub creates the
     folders), paste the file's contents, and commit.
4. **Commit changes** (the green button — "commit" just means save).
5. Go to **Settings** → **Pages** (left menu).
6. Under **Build and deployment → Source**, choose **Deploy from a branch**.
7. Branch: **`main`**; folder: **`/ (root)`**. Click **Save**.
8. Wait 1–3 minutes, refresh the page, and open the address GitHub shows:
   `https://YOUR-USERNAME.github.io/country-resilience-dashboard/`

---

## 3. Enable the automated monthly data updates

The update job is already included (`.github/workflows/update-data.yml`) and
scheduled for the 3rd of each month. It needs **one permission switch**, once:

1. In the repository: **Settings → Actions → General**.
2. Under **Workflow permissions**, select **Read and write permissions**
   (this lets the update job save the refreshed data files). Click **Save**.

To run an update immediately instead of waiting for the schedule:

1. Open the **Actions** tab.
2. Click **Update dashboard data** in the left list.
3. Click **Run workflow** → **Run workflow**.
4. After a minute or two the run turns green. If data changed, a commit named
   "Automated data refresh (date)" appears and the live site updates itself.
   The site's **Data status** page will now show real last-update dates.

What the job updates automatically: World Bank WDI indicators, income-group
classifications, IMF WEO debt/fiscal/current-account, WGI governance ranks,
and UNDP HDR values. What it does not: see the site's Data status page —
those values keep their `manual`/`sample` labels until verified by hand or
automated later.

If a run fails: nothing is committed, the site keeps its existing data, and
the error appears both in the Actions log and (per source) on the Data status
page after the next successful run.

### Optional: real trade data via UN Comtrade

Top exports, destinations and export concentration can be computed from real
UN Comtrade flows instead of the manual transcriptions:

1. Register free at <https://comtradeplus.un.org> and copy your API key.
2. In the repository: **Settings → Secrets and variables → Actions →
   New repository secret**. Name: `COMTRADE_API_KEY`, value: your key.
3. Run the workflow (step above). Trade cards switch to the `API` label.

The site never depends on this — without a key, that source is simply
skipped and marked "optional" on the Data status page.

---

## 4. Running the pipeline on your own computer (optional)

Requires only Python 3 (no installs):

```
python3 scripts/update_data.py               # fetch everything, write files
python3 scripts/update_data.py --dry-run     # show what would change
python3 scripts/update_data.py --only imf    # one source (wb_wdi, imf, wb_wgi, undp_hdr, un_comtrade)
python3 scripts/update_data.py --embed-only  # just regenerate the local-viewing backup
```

Run it from the project folder, then upload the changed files in `/data` to
GitHub (or commit them, if you use git).

---

## 5. Maintaining the data

**Value format.** Every value in `data/indicator_values.json` looks like:

```json
"debt_gdp": { "v": 52.3, "y": 2023, "s": "manual_approx", "u": "2026-07-05" }
```

`v` = value · `y` = reference year · `s` = status · `u` = last updated
(written by the pipeline). Statuses:

| Status | Meaning | Who writes it |
|---|---|---|
| `api_reported` | Fetched from the source API | the pipeline |
| `reported` | Verified by hand against the official source | you |
| `manual_approx` | Hand-transcribed, approximately correct, unverified | shipped data |
| `sample` | Illustrative placeholder | shipped data |
| *(absent)* | Missing — shown as missing, never imputed | — |

**Upgrading a manual value:** look it up at the source (linked on the site's
Data sources page), edit `v` and `y`, set `s` to `"reported"`. Never invent a
value — if it is not published, delete the entry and the site shows "missing".

**Adding a country:** add one entry to `data/countries.json` (ISO-3 code,
ISO numeric code, name, region — income group is auto-refreshed), one block
in the `values` section of `data/indicator_values.json` (it can start almost
empty; the pipeline fills what it can), and optionally a block in
`data/exports.json`. Scores and rankings recalculate automatically.

**Changing pillar weights or methodology text:** edit
`data/methodology.json`. The Methodology page and scoring update from it.

**When UNDP releases a new Human Development Report:** update one line in
`scripts/update_data.py` (`HDR_CSV_URL`) with the new CSV link from
<https://hdr.undp.org/data-center/documentation-and-downloads>.

**After editing JSON files by hand:** the live GitHub Pages site updates
automatically on commit. Only local double-click viewing uses the backup file
`data/embedded_data.js`; refresh it with
`python3 scripts/update_data.py --embed-only` (or just wait for the next
monthly run, which regenerates it).

---

## 6. Troubleshooting

- **Site shows "Could not load data"** — the `data` folder was not uploaded
  or was renamed. It must sit next to `index.html`.
- **Workflow fails with a permissions/push error** — the write-permission
  switch in section 3 was not enabled.
- **A source shows an error on the Data status page** — that source failed on
  the last run; others still updated. IMF/UNDP occasionally change endpoints;
  the error message says what happened, and the pipeline recovers on the next
  run if the source is back.
- **HDR shows "Could not download the HDR CSV"** — UNDP published a new
  edition; update `HDR_CSV_URL` (section 5).
- **Map does not appear locally** — no internet connection; the grid fallback
  is expected. On the live site the map loads normally.
