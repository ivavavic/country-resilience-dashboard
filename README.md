# Country Development & Resilience Dashboard

**An experimental public policy dashboard that looks beyond GNI per capita.**

GNI per capita is the backbone of how the world classifies countries by
income — but it says nothing about whether that income is broad-based,
fiscally sustainable, diversified, or resilient to shocks. Two countries with
identical income levels can face entirely different futures: one financing
consumption with rising debt and a single export commodity, the other with
balanced budgets, complex exports, and broad human development.

This dashboard puts that context back in. It combines income with fiscal and
debt sustainability, external vulnerability, export structure and productive
capacity, human development and inclusion, and governance — into a
transparent composite measure, the **Risk-Adjusted Development Profile
(RADP)**, whose six component scores are always displayed alongside the total.

**It is an analytical tool, not an official classification.** It does not
replace World Bank income groups, IMF assessments, UN categories, or expert
judgement — it is built to make discussions around them sharper.

## What the dashboard offers

- **Interactive world map**, colorable by the composite score or any of eleven
  underlying indicators (income, debt, fiscal balance, HDI, poverty,
  inequality, export concentration, complexity, remittances, income group,
  data confidence), with a colorblind-safe palette.
- **Country profiles** covering ~25 indicators across six pillars, top export
  products and destinations, an automatically generated plain-English
  summary, and explicit data-confidence warnings.
- **Comparison tool** for two to five countries: side-by-side indicators,
  pillar-score charts, and a written comparison.
- **Rankings table** with sorting and a full CSV export that preserves every
  value's year, source, and status label.
- **Published methodology** — pillar weights, winsorized min–max
  normalization, missing-data rules, reweighting rules, and confidence
  flags — including a standing section titled *"Why this index is defensible
  but not definitive."*
- **A Data status page** showing, per source, what is automated, what remains
  manual, when it last updated, and any errors — nothing is smoothed over.

## How the data works

The site is fully static (plain HTML/CSS/JS with JSON files as the database),
which keeps it free, fast, portable, and dependency-free. The data behind it
is maintained by an automated pipeline that runs monthly on GitHub Actions
and rewrites the JSON files from public sources:

| Source | Status | Feeds |
|---|---|---|
| World Bank — World Development Indicators | **Automated** (keyless API) | Income, growth, inflation, population, remittances, poverty, Gini, unemployment, life expectancy, income groups |
| IMF — World Economic Outlook (DataMapper API) | **Automated** (keyless) | Public debt, fiscal balance, current account |
| Worldwide Governance Indicators | **Automated** (via World Bank API) | Government effectiveness, rule of law percentile ranks |
| UNDP — Human Development Report | **Semi-automated** (edition-pinned public CSV) | HDI, expected years of schooling |
| Observatory of Economic Complexity | **Partial / manual** (bulk access requires a registered token) | Top exports, destinations, concentration, complexity — hand-transcribed, labeled as such |
| UN Comtrade | **Optional** (free registered key) | Real export structure and concentration when a key is configured |

Every value on the site carries its **source, reference year, and an honest
origin label**: `API` (fetched by the pipeline), `verified` (hand-checked),
`manual` (hand-transcribed, unverified), or `sample` (placeholder). Missing
values are shown as missing and are **never imputed**. Country-level
confidence badges (High / Medium / Low / Sample only) are computed from
coverage, recency, and those labels — hand-transcribed data can never earn a
High rating.

If a data source fails, the failure is recorded and displayed; the website
keeps serving its last good data. The site itself makes no API calls.

## The composite index, in one paragraph

Indicators are normalized 0–100 within the country set using min–max scaling
with winsorization at the 5th/95th percentiles; "lower-is-better" indicators
(debt, poverty, inequality, concentration, inflation, unemployment, remittance
dependence) are inverted. Pillar scores average the indicators actually
available; the total is a weighted average of pillar scores (income & growth
20%, fiscal & debt 20%, human development & inclusion 20%, external
vulnerability 15%, export structure 15%, governance 10%). Empty pillars are
excluded with visible reweighting warnings; below 60% indicator coverage the
total is flagged low-confidence. The weights are a published, editable expert
judgement — deliberately contestable, which is why the component scores are
never hidden.

## Current scope and limitations

- Ten countries in this version (Serbia, Moldova, South Korea, China, Japan,
  Germany, United States, Brazil, Nigeria, Singapore); scores are normalized
  within this set, so they shift as coverage expands. Adding countries is a
  data edit, not a code change.
- Export structure and economic complexity are not yet automated (see the
  table above) and remain labeled manual until verified or until a Comtrade
  key is configured.
- Reserve import-cover and interest-to-revenue lack stable keyless endpoints
  and remain manual; the Data status page documents exactly why.
- Single reference years only — no time series yet.
- Recent IMF WEO observations may be staff estimates; gross debt is a crude
  lens for countries like Japan or Singapore (context notes appear on their
  profiles).
- Governance indicators are perceptions-based and contested; they carry the
  lowest weight and are flagged.

## Disclaimer

This dashboard is an analytical prototype. It is not an official World Bank,
IMF, UN, or government classification. Composite scores are designed to
support discussion, not replace expert assessment.

## Repository guide

- `index.html`, `style.css`, `app.js` — the static website
- `/data/*.json` — the dataset, methodology, sources, and automation status
- `scripts/update_data.py` — the data pipeline (standard-library Python)
- `.github/workflows/update-data.yml` — the monthly update job
- **`SETUP.md`** — deployment, hosting, and maintenance instructions

Data sources: World Bank (CC BY 4.0), IMF public data, UNDP (CC BY 3.0 IGO),
Worldwide Governance Indicators, OEC public profiles, UN Comtrade. Attribute
them in any derived work.
