# Country Development & Resilience Dashboard

**An analytical prototype that looks beyond GNI per capita.**

This is a complete, free, static website. It needs **no server, no database, no
accounts, no keys, no installation, and no coding** to run. It works by
double-clicking a file on your computer, and it works when uploaded to GitHub
Pages (free hosting).

> **Important:** This dashboard is an analytical prototype. It is **not** an
> official World Bank, IMF, UN, or government classification. The data in this
> version is **sample / approximate data** (clearly labeled throughout) and must
> not be cited as official.

---

## 1. What this dashboard is

GNI per capita is the standard way to classify countries by income, but it says
nothing about whether that income is **broad-based, sustainable, diversified, or
resilient**. This dashboard combines income with:

- fiscal and debt sustainability (public debt, deficits, interest burden),
- external vulnerability (current account, reserves, remittance dependence),
- export structure and productive capacity (top exports, concentration, complexity),
- human development and inclusion (HDI, poverty, inequality, unemployment),
- governance/institutions (World Bank governance percentile ranks),

into a transparent composite score called the **Risk-Adjusted Development
Profile (RADP)**, always displayed together with its six component scores. The
full methodology (weights, normalization, missing-data rules, confidence flags)
is published on the site's **Methodology** page and stored in
`data/methodology.json`.

It includes: an interactive world map, country profiles, a 2–5 country
comparison tool, a sortable rankings table with CSV download, per-value source
and year labels, and visible data-confidence warnings.

Sample countries included: Serbia, Moldova, South Korea, China, Japan, Germany,
United States, Brazil, Nigeria, Singapore.

---

## 2. How to test it on your computer (no tools needed)

1. Keep all the files together in one folder, exactly as they are
   (do not move files out of the `data` folder).
2. Double-click **`index.html`**.
3. It opens in your web browser. Everything works locally.
   - With an internet connection you also get the world map and the nicer fonts.
   - Without internet, the map is replaced by a country grid and the site still
     works fully (this is intentional, not an error).

Why it works offline: browsers block websites opened from a folder from reading
local data files, so the folder includes `data/embedded_data.js` — an automatic
backup copy of all the data that the page can always read.

---

## 3. How to put it online with GitHub Pages (free), step by step

You will upload the files through the GitHub website. No command line.

1. **Create a GitHub account** (free): go to <https://github.com>, click
   **Sign up**, and follow the steps.
2. **Create a new repository**: click the **+** in the top-right corner →
   **New repository**.
   - Repository name: `country-resilience-dashboard`
   - Visibility: **Public** (required for free GitHub Pages)
   - Click **Create repository**.
3. **Upload all files**: on the new repository page, click
   **uploading an existing file** (or **Add file → Upload files**).
   - Drag **the contents of this project folder** into the upload area:
     `index.html`, `style.css`, `app.js`, `README.md`, and the whole
     `data` folder (and optionally the `scripts` and `.github` folders).
   - Tip: dragging the folders themselves into the upload box keeps the folder
     structure. The `data` folder **must** end up as a folder named `data`
     containing the JSON files.
4. **Commit changes**: scroll down and click the green **Commit changes**
   button. (A "commit" just means "save".)
5. Go to **Settings** (tab at the top of the repository).
6. In the left menu, click **Pages**.
7. Under **Build and deployment → Source**, select **Deploy from a branch**.
8. Under **Branch**, choose **`main`**.
9. In the folder dropdown next to it, choose **`/ (root)`**.
10. Click **Save**.
11. Wait 1–3 minutes, then refresh the Pages settings page. GitHub shows your
    public address, which will look like:
    `https://YOUR-USERNAME.github.io/country-resilience-dashboard/`
    Open it — your dashboard is live. Share that link with anyone.

To update the site later: open a file on GitHub (for example
`data/indicator_values.json`), click the pencil icon (**Edit**), make your
change, and click **Commit changes**. The site updates itself in a minute or two.

---

## 4. What each file does

| File | What it is |
|---|---|
| `index.html` | The page itself. The browser opens this file. |
| `style.css` | All colors, fonts and layout. |
| `app.js` | All the logic: pages, map, charts, scoring, CSV download. |
| `data/countries.json` | The country list: names, regions, income groups. |
| `data/indicator_values.json` | **The main "database":** every indicator value, with its year, source and status label. |
| `data/exports.json` | Top 5 export products and destinations per country. |
| `data/methodology.json` | Pillar weights, normalization rules, confidence rules, and the methodology text shown on the site. |
| `data/sources.json` | The registry of data sources shown on the Data sources page. |
| `data/embedded_data.js` | Auto-generated backup copy of the JSON files, so the site works when opened from a local folder. Regenerate it after editing the JSON files (see section 5). |
| `README.md` | This guide. |
| `scripts/update_data.py` | **Optional.** A Python script that can refresh World Bank indicators automatically and regenerate `embedded_data.js`. The site never needs it. |
| `.github/workflows/update-data.yml` | **Optional.** A GitHub automation that can run the script monthly. Disabled by default; the site never needs it. |

---

## 5. How to replace the sample data later

All data lives in plain text files in the `data` folder. Every value looks like
this:

```json
"debt_gdp": { "v": 52.3, "y": 2023, "s": "approx" }
```

- `v` = the value
- `y` = the reference year
- `s` = the status label:
  - `"approx"` — transcribed approximately from a public source, not verified
  - `"sample"` — an illustrative placeholder
  - `"reported"` — a value you verified against the official source

**To upgrade a value:** look it up at the source (the Data sources page links to
each one), edit `v` and `y`, and change `s` to `"reported"`. **Never invent a
value** — if a number is not available, delete that entry entirely and the
dashboard will honestly show "missing".

To add a country: add one entry to `data/countries.json` (you need its ISO-3
code and ISO numeric code, e.g. from Wikipedia), one block to the `values`
section of `data/indicator_values.json`, and optionally a block in
`data/exports.json`. Scores recalculate automatically.

**After editing the JSON files**, the live GitHub Pages site updates
automatically. Only the *double-click-locally* mode uses the backup file
`data/embedded_data.js`. To refresh that backup, either run
`python3 scripts/update_data.py --embed-only` (if you have Python), or simply
accept that local double-click viewing shows the older data until you do — the
online site is always current.

When your data is fully verified, also update in `data/indicator_values.json`:
`"dataset_status"`, `"dataset_label"`, and `"last_updated"`.

---

## 6. What is real data vs. sample/fallback data

- The **data model, sources, and methodology** are real and designed around the
  World Bank World Development Indicators, the IMF World Economic Outlook, the
  UNDP Human Development Report, the Observatory of Economic Complexity, and the
  Worldwide Governance Indicators.
- The **values** in this version are **not verified**:
  - values labeled **approx.** are hand-transcribed and roughly consistent with
    published figures (mostly reference years 2022–2023), but may be off;
  - values labeled **sample** are illustrative placeholders;
  - missing values are shown as **missing** — nothing is imputed or invented.
- Consequently, **no country is shown above "Medium confidence"** in this
  version, the site carries a permanent disclaimer banner, and the CSV export
  embeds the same warning.

---

## 7. Limitations

- Only 10 countries; scores are normalized **within this sample**, so they would
  shift if countries were added. Ranks are sample-relative, not global.
- Composite indices hide trade-offs by design; that is why component scores are
  always shown and the weights are published and editable.
- Governance indicators are perceptions-based and contested; they carry the
  lowest weight and are flagged.
- Some indicators (debt service burden, import dependence, manufacturing share,
  high-tech exports) are not yet populated; the structure supports them.
- Gross public debt is a crude measure for countries like Japan or Singapore
  (see the context notes on their profile pages).
- No time series yet — single reference years only.

---

## 8. Next steps for automation (optional, not required)

The site is fully functional without any of this.

1. **Semi-automatic refresh:** run `python3 scripts/update_data.py` on any
   computer with Python 3. It pulls the latest values for the World Bank
   indicators from the free World Bank API (no key needed), marks them as
   `"reported"` with the correct year, and regenerates `embedded_data.js`.
   Then upload the changed files to GitHub as in section 3.
2. **Fully automatic monthly refresh:** the included workflow file
   `.github/workflows/update-data.yml` can run that script inside GitHub once a
   month and commit the result. It only runs if you enable GitHub Actions for
   the repository (Settings → Actions) and edit the file to set
   `ENABLED: "true"`. If it ever fails, the site simply keeps its current data.
3. **Later ideas:** IMF/UNDP fetchers, more countries, time series, and a
   weight-adjustment slider (all listed on the site's About page).

---

*License note: indicator definitions and future data pulls rely on public
sources (World Bank CC BY 4.0, UNDP CC BY 3.0 IGO, IMF public data, OEC public
profiles). Attribute them if you publish derived work.*
