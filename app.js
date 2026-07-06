/* ============================================================
   Country Development & Resilience Dashboard — app.js
   Vanilla JS single-page app. No build step required.
   Data: /data/*.json (fetched) with an embedded fallback
   (data/embedded_data.js) so the site also works when opened
   directly from a local folder (file://).
   ============================================================ */

"use strict";

/* ---------------- state ---------------- */
const S = {
  countries: [],        // country metadata
  iv: null,             // indicator_values.json
  exportsData: null,    // exports.json
  meth: null,           // methodology.json
  sources: null,        // sources.json
  scores: {},           // computed per-country scores
  norm: {},             // normalization bounds per indicator
  worldFeatures: null,  // cached local GeoJSON map features
  compareSel: [],       // selected iso3 for compare
  rankSort: { key: "total", dir: -1 }
};

const PILLAR_ORDER = ["income", "fiscal", "external", "productive", "human", "governance"];

/* Colorblind-safe sequential palette (ColorBrewer YlGnBu) */
const SEQ = ["#ffffd9", "#c7e9b4", "#7fcdbb", "#41b6c4", "#1d91c0", "#225ea8", "#0c2c84"];
/* Okabe–Ito derived categorical colors */
const CAT_INCOME = {
  "High income": "#0c2c84",
  "Upper middle income": "#1d91c0",
  "Lower middle income": "#E69F00",
  "Low income": "#D55E00"
};
const CAT_CONF = {
  high: "#009E73", medium: "#E69F00", low: "#D55E00", sample: "#CC79A7"
};

/* ---------------- utilities ---------------- */
function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, c => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));
}
function el(id) { return document.getElementById(id); }
function fmtNum(n, dec) {
  if (n == null || isNaN(n)) return "—";
  return n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
}
function fmtValue(v, fmt) {
  if (v == null || isNaN(v)) return "—";
  switch (fmt) {
    case "usd0": return "$" + fmtNum(v, 0);
    case "pct1": return fmtNum(v, 1) + "%";
    case "pct1s": return (v > 0 ? "+" : "") + fmtNum(v, 1) + "%";
    case "num0": return fmtNum(v, 0);
    case "num1": return fmtNum(v, 1);
    case "num2": return fmtNum(v, 2);
    case "num2s": return (v > 0 ? "+" : "") + fmtNum(v, 2);
    case "num3": return fmtNum(v, 3);
    case "pop": return fmtNum(v, v >= 100 ? 0 : 2) + " m";
    default: return fmtNum(v, 1);
  }
}
function statusChip(s) {
  if (s === "api_reported") return '<span class="chip-api" title="Fetched automatically from the source API by the data pipeline">API</span>';
  if (s === "reported") return '<span class="chip-reported" title="Verified by hand against the official source">verified</span>';
  if (s === "manual_approx" || s === "approx") return '<span class="chip-approx" title="Hand-transcribed from a public source; approximately correct but not verified">manual</span>';
  if (s === "sample") return '<span class="chip-sample" title="Illustrative placeholder value — demonstration only">sample</span>';
  return "";
}
function confBadge(level) {
  const labels = { high: "High confidence", medium: "Medium confidence", low: "Low confidence", sample: "Sample only" };
  return `<span class="badge badge-${level}">${labels[level] || level}</span>`;
}
function getVal(iso3, ind) {
  const c = S.iv.values[iso3];
  return c && c[ind] ? c[ind] : null;
}
function countryByIso(iso3) { return S.countries.find(c => c.iso3 === iso3); }
function percentile(sortedArr, p) {
  if (!sortedArr.length) return null;
  const idx = (sortedArr.length - 1) * p;
  const lo = Math.floor(idx), hi = Math.ceil(idx);
  if (lo === hi) return sortedArr[lo];
  return sortedArr[lo] + (sortedArr[hi] - sortedArr[lo]) * (idx - lo);
}

/* ---------------- data loading ---------------- */
async function loadJSON(path) {
  const res = await fetch(path, { cache: "no-cache" });
  if (!res.ok) throw new Error("HTTP " + res.status + " for " + path);
  return res.json();
}

async function loadData() {
  try {
    const [countries, iv, exp, meth, src, status] = await Promise.all([
      loadJSON("data/countries.json"),
      loadJSON("data/indicator_values.json"),
      loadJSON("data/exports.json"),
      loadJSON("data/methodology.json"),
      loadJSON("data/sources.json"),
      loadJSON("data/update_status.json")
    ]);
    return { countries, iv, exp, meth, src, status };
  } catch (e) {
    // Local file:// viewing blocks fetch(); fall back to the embedded copy.
    if (window.EMBEDDED_DATA) {
      console.warn("Using embedded data fallback (fetch failed):", e.message);
      const d = window.EMBEDDED_DATA;
      return { countries: d.countries, iv: d.indicator_values, exp: d.exports, meth: d.methodology, src: d.sources, status: d.update_status };
    }
    throw e;
  }
}

/* ---------------- scoring engine ---------------- */
function computeNormBounds() {
  // Winsorized (p5/p95) min-max bounds per scored indicator, across available countries.
  const bounds = {};
  for (const [ind, meta] of Object.entries(S.iv.indicators)) {
    if (!meta.scored) continue;
    const vals = [];
    for (const c of S.countries) {
      const v = getVal(c.iso3, ind);
      if (v && v.v != null && !isNaN(v.v)) vals.push(v.v);
    }
    if (vals.length < 2) { bounds[ind] = null; continue; }
    vals.sort((a, b) => a - b);
    let lo = percentile(vals, 0.05), hi = percentile(vals, 0.95);
    if (hi - lo < 1e-9) { lo = vals[0]; hi = vals[vals.length - 1]; }
    if (hi - lo < 1e-9) { bounds[ind] = null; continue; }
    bounds[ind] = { lo, hi };
  }
  return bounds;
}

function normalizeValue(ind, raw) {
  const b = S.norm[ind];
  const meta = S.iv.indicators[ind];
  if (!b || raw == null || isNaN(raw)) return null;
  const clamped = Math.min(Math.max(raw, b.lo), b.hi); // winsorize
  let score = ((clamped - b.lo) / (b.hi - b.lo)) * 100;
  if (meta.direction === "neg") score = 100 - score;
  return Math.round(score * 10) / 10;
}

function computeCountryScore(iso3) {
  const pillars = {};
  let availableCount = 0, totalScored = 0, sampleCount = 0, oldCount = 0;
  const nowYear = new Date().getFullYear();
  const recentThresh = (S.meth.recent_year_threshold || 3) + 1;

  let verifiedCount = 0;
  for (const pid of PILLAR_ORDER) {
    const inds = Object.entries(S.iv.indicators).filter(([, m]) => m.scored && m.pillar === pid);
    const scores = [], missing = [];
    for (const [ind] of inds) {
      totalScored++;
      const v = getVal(iso3, ind);
      if (v && v.v != null) {
        availableCount++;
        if (v.s === "sample") sampleCount++;
        if (v.s === "api_reported" || v.s === "reported") verifiedCount++;
        if (v.y && nowYear - v.y > recentThresh) oldCount++;
        const n = normalizeValue(ind, v.v);
        if (n != null) scores.push(n);
      } else {
        missing.push(ind);
      }
    }
    pillars[pid] = {
      score: scores.length ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10 : null,
      available: scores.length,
      total: inds.length,
      missing
    };
  }

  // Weighted total across pillars that have data, with transparent reweighting.
  let wSum = 0, sSum = 0;
  const excludedPillars = [];
  for (const pid of PILLAR_ORDER) {
    const w = S.meth.pillars[pid].weight;
    if (pillars[pid].score != null) { wSum += w; sSum += pillars[pid].score * w; }
    else excludedPillars.push(pid);
  }
  const total = wSum > 0 ? Math.round((sSum / wSum) * 10) / 10 : null;
  const coverage = totalScored ? availableCount / totalScored : 0;
  const lowCoverage = coverage < (S.meth.coverage_threshold || 0.6);

  // Confidence level. Verified = fetched from a source API or hand-verified.
  const sampleShare = availableCount ? sampleCount / availableCount : 1;
  const verifiedShare = availableCount ? verifiedCount / availableCount : 0;
  let conf;
  if (sampleShare > 0.5) conf = "sample";
  else if (coverage >= 0.85 && verifiedShare >= 0.7 && sampleShare <= 0.1 && oldCount / Math.max(availableCount, 1) < 0.3) conf = "high";
  else if (coverage >= (S.meth.coverage_threshold || 0.6)) conf = "medium";
  else conf = "low";
  if (lowCoverage && conf !== "sample") conf = "low";

  return { pillars, total, coverage, availableCount, totalScored, sampleCount, verifiedCount, verifiedShare, excludedPillars, lowCoverage, confidence: conf, reweighted: excludedPillars.length > 0 && total != null };
}

function computeAllScores() {
  S.norm = computeNormBounds();
  for (const c of S.countries) S.scores[c.iso3] = computeCountryScore(c.iso3);
}

/* ---------------- narratives ---------------- */
function pillarName(pid) { return S.meth.pillars[pid].name; }

function countryNarrative(iso3) {
  const c = countryByIso(iso3), sc = S.scores[iso3];
  const g = ind => { const v = getVal(iso3, ind); return v ? v.v : null; };
  const parts = [];

  const ranked = PILLAR_ORDER.filter(p => sc.pillars[p].score != null)
    .sort((a, b) => sc.pillars[b].score - sc.pillars[a].score);
  if (sc.total != null && ranked.length >= 2) {
    const best = ranked[0], worst = ranked[ranked.length - 1];
    parts.push(`${c.name} scores <strong>${sc.total}</strong> out of 100 on the Risk-Adjusted Development Profile within this sample of ${S.countries.length} countries. Its strongest pillar is <strong>${pillarName(best).toLowerCase()}</strong> (${sc.pillars[best].score}) and its weakest is <strong>${pillarName(worst).toLowerCase()}</strong> (${sc.pillars[worst].score}).`);
  }

  const flags = [];
  const debt = g("debt_gdp"), conc = g("export_conc"), rem = g("remittances_gdp"),
        pov = g("poverty"), gini = g("gini"), ca = g("current_account"),
        fb = g("fiscal_balance"), infl = g("inflation"), eci = g("eci"), popg = g("pop_growth");
  if (debt != null && debt > 90) flags.push(`public debt is high at roughly ${fmtNum(debt, 0)}% of GDP`);
  if (fb != null && fb < -6) flags.push(`the fiscal deficit is wide (about ${fmtNum(Math.abs(fb), 1)}% of GDP)`);
  if (conc != null && conc > 0.3) flags.push(`exports are heavily concentrated in a few products`);
  if (rem != null && rem > 8) flags.push(`the economy relies substantially on remittances (~${fmtNum(rem, 0)}% of GDP)`);
  if (ca != null && ca < -8) flags.push(`the current account deficit is large (${fmtNum(ca, 1)}% of GDP)`);
  if (pov != null && pov > 20) flags.push(`poverty remains widespread (~${fmtNum(pov, 0)}% under $6.85/day)`);
  if (gini != null && gini > 45) flags.push(`income inequality is high (Gini ${fmtNum(gini, 0)})`);
  if (infl != null && infl > 10) flags.push(`inflation has been elevated (~${fmtNum(infl, 0)}%)`);
  if (popg != null && popg < -0.5) flags.push(`the population is shrinking, which weighs on long-run capacity`);
  if (flags.length) {
    parts.push(`Points of vulnerability: ${flags.slice(0, 4).join("; ")}.`);
  }

  const strengths = [];
  if (eci != null && eci > 1.5) strengths.push("a highly complex, knowledge-intensive export basket");
  if (debt != null && debt < 60 && fb != null && fb > -3) strengths.push("a comparatively contained fiscal position");
  if (ca != null && ca > 3) strengths.push("a solid external surplus");
  const hdi = g("hdi");
  if (hdi != null && hdi > 0.9) strengths.push("very high human development");
  if (strengths.length) parts.push(`Sources of resilience include ${strengths.slice(0, 3).join(", ")}.`);

  const note = S.iv.notes && S.iv.notes[iso3];
  if (note) parts.push(`<em>Context:</em> ${esc(note)}`);

  parts.push(`<span class="note">This summary is generated automatically from the current dataset; check the per-value origin labels below before citing anything.</span>`);
  return parts.map(p => `<p>${p}</p>`).join("");
}

function compareNarrative(list) {
  if (list.length < 2) return "";
  const withTotal = list.filter(i => S.scores[i].total != null)
    .sort((a, b) => S.scores[b].total - S.scores[a].total);
  if (withTotal.length < 2) return "";
  const top = withTotal[0], bottom = withTotal[withTotal.length - 1];
  const parts = [];
  parts.push(`Within this selection, <strong>${countryByIso(top).name}</strong> has the highest composite profile (${S.scores[top].total}) and <strong>${countryByIso(bottom).name}</strong> the lowest (${S.scores[bottom].total}).`);

  // Find the pillar with the widest spread
  let widest = null, widestGap = -1;
  for (const pid of PILLAR_ORDER) {
    const vals = list.map(i => S.scores[i].pillars[pid].score).filter(v => v != null);
    if (vals.length >= 2) {
      const gap = Math.max(...vals) - Math.min(...vals);
      if (gap > widestGap) { widestGap = gap; widest = pid; }
    }
  }
  if (widest) {
    const best = list.filter(i => S.scores[i].pillars[widest].score != null)
      .sort((a, b) => S.scores[b].pillars[widest].score - S.scores[a].pillars[widest].score)[0];
    parts.push(`The largest gap between these countries is on <strong>${pillarName(widest).toLowerCase()}</strong> (a spread of ${Math.round(widestGap)} points), where ${countryByIso(best).name} leads.`);
  }
  parts.push(`Similar headline incomes can conceal very different risk profiles: compare the pillar bars below rather than the single number.`);
  parts.push(`<span class="note">Generated automatically from the current dataset; per-value origin labels appear in the table below.</span>`);
  return parts.map(p => `<p>${p}</p>`).join("");
}

/* ---------------- pillar strip (signature component) ---------------- */
function pillarStrip(iso3, opts = {}) {
  const sc = S.scores[iso3];
  let html = '<div class="pillar-strip">';
  for (const pid of PILLAR_ORDER) {
    const p = sc.pillars[pid], m = S.meth.pillars[pid];
    if (p.score == null) {
      html += `<div class="pillar-row pillar-missing">
        <span class="pillar-name">${esc(m.name)}</span>
        <span class="pillar-track"></span>
        <span class="pillar-val">n/a</span></div>`;
    } else {
      html += `<div class="pillar-row">
        <span class="pillar-name">${esc(m.name)}${opts.counts ? ` <span class="note">(${p.available}/${p.total})</span>` : ""}</span>
        <span class="pillar-track"><span class="pillar-fill" style="width:${p.score}%;background:${m.color}"></span></span>
        <span class="pillar-val">${p.score}</span></div>`;
    }
  }
  html += "</div>";
  return html;
}

/* ---------------- map ---------------- */
const MAP_INDICATORS = [
  { key: "radp", label: "Risk-Adjusted Development Profile (composite)", type: "score" },
  { key: "gni_pc", label: "GNI per capita (Atlas, US$)", type: "cont" },
  { key: "income_group", label: "World Bank income group", type: "cat_income" },
  { key: "debt_gdp", label: "Public debt (% of GDP)", type: "cont" },
  { key: "fiscal_balance", label: "Fiscal balance (% of GDP)", type: "cont" },
  { key: "hdi", label: "Human Development Index", type: "cont" },
  { key: "poverty", label: "Poverty headcount ($6.85/day, %)", type: "cont" },
  { key: "gini", label: "Gini index", type: "cont" },
  { key: "export_conc", label: "Export concentration (HHI)", type: "cont" },
  { key: "eci", label: "Economic Complexity Index", type: "cont" },
  { key: "remittances_gdp", label: "Remittances (% of GDP)", type: "cont" },
  { key: "confidence", label: "Data confidence", type: "cat_conf" }
];

function mapValueFor(iso3, mi) {
  if (mi.key === "radp") { const t = S.scores[iso3].total; return t == null ? null : t; }
  if (mi.key === "income_group") { const c = countryByIso(iso3); return c ? c.income_group : null; }
  if (mi.key === "confidence") return S.scores[iso3].confidence;
  const v = getVal(iso3, mi.key); return v ? v.v : null;
}

function mapValueDisplay(iso3, mi) {
  if (mi.key === "radp") { const t = S.scores[iso3].total; return t == null ? "—" : t + " / 100"; }
  if (mi.key === "income_group") return mapValueFor(iso3, mi) || "—";
  if (mi.key === "confidence") { const l = { high: "High", medium: "Medium", low: "Low", sample: "Sample only" }; return l[mapValueFor(iso3, mi)] || "—"; }
  const v = getVal(iso3, mi.key);
  if (!v) return "—";
  const meta = S.iv.indicators[mi.key];
  return fmtValue(v.v, meta.fmt) + (v.y ? ` (${v.y})` : "");
}

function seqColor(t) { // t in [0,1]
  const idx = Math.min(SEQ.length - 1, Math.max(0, Math.floor(t * SEQ.length)));
  return SEQ[idx];
}

function buildColorScale(mi) {
  if (mi.type === "cat_income") return { type: "cat", get: v => CAT_INCOME[v] || "#B0B7BD", legend: Object.entries(CAT_INCOME) };
  if (mi.type === "cat_conf") {
    const labels = { high: "High", medium: "Medium", low: "Low", sample: "Sample only" };
    return { type: "cat", get: v => CAT_CONF[v] || "#B0B7BD", legend: Object.entries(labels).map(([k, l]) => [l, CAT_CONF[k]]) };
  }
  const vals = S.countries.map(c => mapValueFor(c.iso3, mi)).filter(v => v != null && !isNaN(v));
  if (!vals.length) return { type: "cont", get: () => "#B0B7BD", min: 0, max: 1 };
  const min = Math.min(...vals), max = Math.max(...vals);
  const span = (max - min) || 1;
  const inverted = mi.key !== "radp" && S.iv.indicators[mi.key] && S.iv.indicators[mi.key].direction === "neg";
  return {
    type: "cont", min, max, inverted,
    get: v => seqColor(inverted ? 1 - (v - min) / span : (v - min) / span)
  };
}

function legendHTML(mi, scale) {
  if (scale.type === "cat") {
    return scale.legend.map(([label, color]) =>
      `<span class="legend-item"><span class="legend-swatch" style="background:${color}"></span>${esc(label)}</span>`
    ).join("") + `<span class="legend-item"><span class="legend-swatch" style="background:var(--nodata)"></span>No data / not in sample</span>`;
  }
  const meta = mi.key === "radp" ? { fmt: "num0" } : S.iv.indicators[mi.key];
  const steps = SEQ.map((c, i) => `<span class="legend-swatch" style="background:${c};border-radius:0"></span>`).join("");
  const lo = fmtValue(scale.min, meta.fmt), hi = fmtValue(scale.max, meta.fmt);
  const dirNote = scale.inverted ? " (lower is better; darker = higher value)" : "";
  return `<span class="legend-item">${scale.inverted ? esc(lo) : esc(lo)}</span>
    <span class="legend-item" style="gap:0">${steps}</span>
    <span class="legend-item">${esc(hi)}${dirNote}</span>
    <span class="legend-item"><span class="legend-swatch" style="background:var(--nodata)"></span>No data / not in sample</span>`;
}

async function ensureWorldFeatures() {
  if (S.worldFeatures) return S.worldFeatures;

  const embedded = () => {
    if (window.EMBEDDED_WORLD_GEOJSON && Array.isArray(window.EMBEDDED_WORLD_GEOJSON.features)) {
      S.worldFeatures = window.EMBEDDED_WORLD_GEOJSON.features;
      return S.worldFeatures;
    }
    return null;
  };

  // First try the local GeoJSON file. This works on GitHub Pages and on a local web server.
  // If the page is opened directly as file://, many browsers block fetch(), so fall back
  // to the embedded script copy loaded by index.html.
  try {
    const res = await fetch("data/world_countries.geojson", { cache: "no-cache" });
    if (!res.ok) throw new Error("local map outlines unavailable: " + res.status);
    const geo = await res.json();
    if (!geo || !Array.isArray(geo.features)) throw new Error("invalid local map outlines");
    S.worldFeatures = geo.features;
    return S.worldFeatures;
  } catch (e) {
    const fallback = embedded();
    if (fallback) {
      console.warn("Using embedded map fallback (GeoJSON fetch failed):", e.message);
      return fallback;
    }
    throw e;
  }
}

function projectLonLat(coord, width, height) {
  const lon = Math.max(-180, Math.min(180, Number(coord[0])));
  const lat = Math.max(-90, Math.min(90, Number(coord[1])));
  // Dependency-free equirectangular projection. Not as pretty as D3 Natural Earth,
  // but robust and fully static on GitHub Pages.
  return [((lon + 180) / 360) * width, ((90 - lat) / 180) * height];
}

function ringPath(ring, width, height) {
  if (!Array.isArray(ring) || ring.length === 0) return "";
  return ring.map((pt, i) => {
    const [x, y] = projectLonLat(pt, width, height);
    return (i ? "L" : "M") + x.toFixed(2) + "," + y.toFixed(2);
  }).join(" ") + " Z";
}

function geometryPath(geometry, width, height) {
  if (!geometry) return "";
  if (geometry.type === "Polygon") {
    return geometry.coordinates.map(r => ringPath(r, width, height)).join(" ");
  }
  if (geometry.type === "MultiPolygon") {
    return geometry.coordinates.flatMap(poly => poly.map(r => ringPath(r, width, height))).join(" ");
  }
  return "";
}

function showTooltip(evt, html) {
  const tt = el("tooltip");
  tt.innerHTML = html;
  tt.hidden = false;
  const pad = 14;
  let x = evt.clientX + pad, y = evt.clientY + pad;
  const r = tt.getBoundingClientRect();
  if (x + r.width > window.innerWidth - 8) x = evt.clientX - r.width - pad;
  if (y + r.height > window.innerHeight - 8) y = evt.clientY - r.height - pad;
  tt.style.left = x + "px"; tt.style.top = y + "px";
}
function hideTooltip() { el("tooltip").hidden = true; }

async function renderMap(containerId, indicatorKey) {
  const container = el(containerId);
  const mi = MAP_INDICATORS.find(m => m.key === indicatorKey) || MAP_INDICATORS[0];
  const scale = buildColorScale(mi);
  const legend = el("mapLegend");
  if (legend) legend.innerHTML = legendHTML(mi, scale);

  try {
    const features = await ensureWorldFeatures();
    const byIso = Object.fromEntries(S.countries.map(c => [c.iso3, c]));
    const width = 960, height = 480;

    const countryPaths = features.map((f, idx) => {
      const iso = f.properties && f.properties.iso3;
      const c = iso ? byIso[iso] : null;
      const v = c ? mapValueFor(c.iso3, mi) : null;
      const fill = c && v != null ? scale.get(v) : "var(--nodata)";
      const cls = "country-shape" + (c ? " has-data" : "");
      const d = geometryPath(f.geometry, width, height);
      if (!d) return "";
      const attrs = c
        ? `data-iso="${esc(c.iso3)}" tabindex="0" role="button" aria-label="${esc(c.name)}"`
        : "";
      return `<path d="${d}" class="${cls}" fill="${fill}" ${attrs}></path>`;
    }).join("");

    const markers = S.countries.filter(x => x.marker && x.marker_coords).map(c => {
      const [x, y] = projectLonLat(c.marker_coords, width, height);
      const v = mapValueFor(c.iso3, mi);
      const fill = v == null ? "var(--nodata)" : scale.get(v);
      return `<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="6" fill="${fill}" stroke="#17324A" stroke-width="1.2" class="country-shape has-data" data-iso="${esc(c.iso3)}" tabindex="0" role="button" aria-label="${esc(c.name)}"></circle>`;
    }).join("");

    container.innerHTML = `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="World map colored by ${esc(mi.label)}">
      <rect x="0" y="0" width="${width}" height="${height}" fill="#EAF1F5" stroke="#C9D6DE"></rect>
      <g>${countryPaths}${markers}</g>
    </svg>`;

    container.querySelectorAll("[data-iso]").forEach(node => {
      const c = byIso[node.dataset.iso];
      if (!c) return;
      node.addEventListener("mousemove", evt => tooltipFor(evt, c, mi));
      node.addEventListener("mouseleave", hideTooltip);
      node.addEventListener("click", () => location.hash = "#/country/" + c.iso3);
      node.addEventListener("keydown", evt => {
        if (evt.key === "Enter" || evt.key === " ") location.hash = "#/country/" + c.iso3;
      });
    });
  } catch (e) {
    console.warn("Map unavailable, using grid fallback:", e.message);
    renderMapFallback(container, mi, scale);
  }
}

function tooltipFor(evt, c, mi) {
  const sc = S.scores[c.iso3];
  showTooltip(evt, `<div class="tt-name">${esc(c.name)}</div>
    <div>${esc(mi.label)}: <strong>${esc(mapValueDisplay(c.iso3, mi))}</strong></div>
    <div class="tt-sub">RADP ${sc.total != null ? sc.total : "—"} · ${esc(c.income_group)} · click for profile</div>`);
}

function renderMapFallback(container, mi, scale) {
  const tiles = S.countries.map(c => {
    const v = mapValueFor(c.iso3, mi);
    const color = v == null ? "var(--nodata)" : scale.get(v);
    return `<button class="map-fallback-tile" data-iso="${c.iso3}">
      <span class="tile-swatch" style="background:${color}"></span>
      <span class="tile-name">${esc(c.name)}</span><br>
      <span class="tile-val">${esc(mapValueDisplay(c.iso3, mi))}</span>
    </button>`;
  }).join("");
  container.innerHTML = `<div class="warn-box" style="margin:14px 18px 0">
      The interactive world map could not load (it needs an internet connection for the map outlines).
      Showing the countries in the dataset as a grid instead — all data and pages work normally.
    </div>
    <div class="map-fallback-grid">${tiles}</div>`;
  container.querySelectorAll(".map-fallback-tile").forEach(b =>
    b.addEventListener("click", () => location.hash = "#/country/" + b.dataset.iso));
}

/* ---------------- charts (dependency-free SVG) ---------------- */
function barChartSVG(items, opts = {}) {
  // items: [{label, value, color, display}]
  const w = opts.width || 640, barH = 24, gap = 10, labelW = opts.labelW || 150, valW = 84;
  const h = items.length * (barH + gap) + 6;
  const maxV = Math.max(...items.map(i => Math.abs(i.value ?? 0)), 1e-9);
  const hasNeg = items.some(i => (i.value ?? 0) < 0);
  const plotW = w - labelW - valW - 12;
  const zeroX = hasNeg ? labelW + plotW / 2 : labelW;
  const unit = hasNeg ? (plotW / 2) / maxV : plotW / maxV;

  let bars = "";
  items.forEach((it, i) => {
    const y = i * (barH + gap) + 3;
    if (it.value == null || isNaN(it.value)) {
      bars += `<text x="${labelW}" y="${y + barH * 0.7}" font-size="12" fill="#8a949c" font-style="italic">no data</text>`;
    } else {
      const len = Math.abs(it.value) * unit;
      const x = it.value < 0 ? zeroX - len : zeroX;
      bars += `<rect x="${x}" y="${y}" width="${Math.max(len, 1)}" height="${barH}" rx="2" fill="${it.color}"></rect>
        <text x="${labelW + plotW + 8}" y="${y + barH * 0.7}" font-size="12" fill="#44525E" font-variant-numeric="tabular-nums">${esc(it.display ?? it.value)}</text>`;
    }
    bars += `<text x="${labelW - 8}" y="${y + barH * 0.7}" font-size="12" fill="#44525E" text-anchor="end">${esc(it.label)}</text>`;
  });
  const zeroLine = hasNeg ? `<line x1="${zeroX}" y1="0" x2="${zeroX}" y2="${h}" stroke="#C6CFD6" stroke-dasharray="3,3"/>` : "";
  return `<svg viewBox="0 0 ${w} ${h}" role="img">${zeroLine}${bars}</svg>`;
}

const COMPARE_COLORS = ["#2166AC", "#B8860B", "#5AAE61", "#8073AC", "#CC6677"];

const PILLAR_CHART_LABELS = {
  income: "Income & growth", fiscal: "Fiscal & debt", external: "External vulnerability",
  productive: "Export structure", human: "Human development", governance: "Governance"
};

function groupedPillarChart(list) {
  // groups = pillars; one bar per country
  const w = 680, labelW = 200;
  const rowH = 16, spacerH = 12;
  let y = 4, out = "";
  for (const pid of PILLAR_ORDER) {
    out += `<text x="${labelW - 8}" y="${y + 12}" font-size="12" fill="#1C2B36" font-weight="600" text-anchor="end">${esc(PILLAR_CHART_LABELS[pid])}</text>`;
    for (let i = 0; i < list.length; i++) {
      const sc = S.scores[list[i]].pillars[pid].score;
      if (sc == null) {
        out += `<text x="${labelW}" y="${y + 12}" font-size="11" fill="#8a949c" font-style="italic">no data — ${esc(countryByIso(list[i]).name)}</text>`;
      } else {
        const len = sc / 100 * (w - labelW - 60);
        out += `<rect x="${labelW}" y="${y + 2}" width="${Math.max(len, 1)}" height="${rowH - 5}" rx="2" fill="${COMPARE_COLORS[i]}"></rect>
          <text x="${labelW + len + 6}" y="${y + 12}" font-size="11" fill="#44525E" font-variant-numeric="tabular-nums">${sc}</text>`;
      }
      y += rowH;
    }
    y += spacerH;
  }
  const h = y + 4;
  return `<svg viewBox="0 0 ${w} ${h}" role="img">${out}</svg>`;
}

function compareLegend(list) {
  return `<div class="chart-legend">` + list.map((iso, i) =>
    `<span class="legend-item"><span class="legend-swatch" style="background:${COMPARE_COLORS[i]}"></span>${esc(countryByIso(iso).name)}</span>`
  ).join("") + `</div>`;
}

/* ---------------- CSV export ---------------- */
function downloadCSV(filename, rows) {
  const csv = rows.map(r => r.map(cell => {
    const s = String(cell == null ? "" : cell);
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }).join(",")).join("\r\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}

function rankingsCSV() {
  const inds = Object.keys(S.iv.indicators);
  const header = ["country", "iso3", "region", "income_group", "radp_total", "confidence",
    ...PILLAR_ORDER.map(p => "pillar_" + p),
    ...inds.flatMap(i => [i, i + "_year", i + "_status"])];
  const rows = [header];
  for (const c of sortedByScore()) {
    const sc = S.scores[c.iso3];
    const row = [c.name, c.iso3, c.region, c.income_group, sc.total ?? "", sc.confidence,
      ...PILLAR_ORDER.map(p => sc.pillars[p].score ?? "")];
    for (const i of inds) {
      const v = getVal(c.iso3, i);
      row.push(v ? v.v : "", v ? v.y : "", v ? v.s : "missing");
    }
    rows.push(row);
  }
  rows.push([]);
  rows.push(["NOTE: prototype dataset — values are approximate ('approx') or illustrative ('sample'); not official; verify against sources before use. Generated " + S.iv.last_updated]);
  downloadCSV("radp_prototype_data.csv", rows);
}

/* ---------------- views ---------------- */
function sortedByScore() {
  return [...S.countries].sort((a, b) => (S.scores[b.iso3].total ?? -1) - (S.scores[a.iso3].total ?? -1));
}

function searchBoxHTML(id) {
  return `<div class="search-box">
    <input type="search" id="${id}" placeholder="Search a country (e.g. Moldova)…" autocomplete="off"
      aria-label="Search countries">
    <div class="search-results" id="${id}Results" hidden></div>
  </div>`;
}

function wireSearch(id) {
  const input = el(id), results = el(id + "Results");
  if (!input) return;
  function render(q) {
    const t = q.trim().toLowerCase();
    if (!t) { results.hidden = true; results.innerHTML = ""; return; }
    const hits = S.countries.filter(c => c.name.toLowerCase().includes(t) || c.iso3.toLowerCase() === t);
    results.innerHTML = hits.length
      ? hits.map(c => `<button data-iso="${c.iso3}"><span>${esc(c.name)}</span><span class="search-meta">${esc(c.income_group)} · RADP ${S.scores[c.iso3].total ?? "—"}</span></button>`).join("")
      : `<button disabled><span class="note">No match in the ${S.countries.length}-country sample. More countries can be added via the data files.</span></button>`;
    results.hidden = false;
    results.querySelectorAll("button[data-iso]").forEach(b =>
      b.addEventListener("click", () => { location.hash = "#/country/" + b.dataset.iso; }));
  }
  input.addEventListener("input", () => render(input.value));
  input.addEventListener("focus", () => render(input.value));
  document.addEventListener("click", e => {
    if (!results.contains(e.target) && e.target !== input) results.hidden = true;
  });
}

/* ----- HOME ----- */
function viewHome() {
  const ranked = sortedByScore();
  const totals = ranked.map(c => S.scores[c.iso3].total).filter(t => t != null).sort((a, b) => a - b);
  const median = totals.length ? percentile(totals, 0.5).toFixed(1) : "—";
  const top = ranked[0], bottom = ranked[ranked.length - 1];
  const nInd = Object.values(S.iv.indicators).filter(m => m.scored).length;

  const previewRows = ranked.slice(0, 5).map((c, i) => {
    const sc = S.scores[c.iso3];
    return `<tr>
      <td class="rank-cell">${i + 1}</td>
      <td><a href="#/country/${c.iso3}">${esc(c.name)}</a></td>
      <td>${esc(c.income_group)}</td>
      <td class="num"><strong>${sc.total ?? "—"}</strong></td>
      <td>${confBadge(sc.confidence)}</td>
    </tr>`;
  }).join("");

  const optionsHTML = MAP_INDICATORS.map(m => `<option value="${m.key}">${esc(m.label)}</option>`).join("");

  return `
  <section class="home-lede">
    <p class="eyebrow">Experimental public dashboard · ${S.countries.length} countries · free automated data pipeline</p>
    <h1>Is a country's income level built to last?</h1>
    <p>GNI per capita tells you how much income a country generates — not whether that income is
    broad-based, fiscally sustainable, diversified, or resilient to shocks. This dashboard combines
    income with debt, external vulnerability, export structure, human development, and governance
    into a transparent <a href="#/methodology">Risk-Adjusted Development Profile</a>, always shown
    together with its component scores.</p>
    ${searchBoxHTML("homeSearch")}
  </section>

  <section class="card map-panel" aria-label="World map">
    <div class="map-controls">
      <label for="mapIndicator">Color the map by</label>
      <select id="mapIndicator">${optionsHTML}</select>
      <span class="note">Click a colored country to open its profile. Gray = not in the prototype sample.</span>
    </div>
    <div id="mapContainer" aria-live="polite"></div>
    <div class="map-legend" id="mapLegend"></div>
  </section>

  <section class="grid grid-4 headline-cards" aria-label="Headline figures">
    <div class="card"><div class="headline-num">${S.countries.length}</div><div class="headline-label">countries in the prototype sample</div></div>
    <div class="card"><div class="headline-num">${nInd}</div><div class="headline-label">scored indicators across 6 pillars</div></div>
    <div class="card"><div class="headline-num">${median}</div><div class="headline-label">median RADP score in sample</div></div>
    <div class="card"><div class="headline-num">${esc(top.name)}</div><div class="headline-label">highest composite profile (${S.scores[top.iso3].total}); lowest: ${esc(bottom.name)} (${S.scores[bottom.iso3].total})</div></div>
  </section>

  <section class="card">
    <h2 style="margin-top:0">Ranking preview</h2>
    <div class="table-scroll"><table class="data">
      <thead><tr><th>#</th><th>Country</th><th>Income group</th><th class="num">RADP score</th><th>Confidence</th></tr></thead>
      <tbody>${previewRows}</tbody>
    </table></div>
    <p style="margin-bottom:0"><a class="btn" href="#/rankings">Full rankings &amp; CSV download</a>
    <a class="btn btn-ghost" href="#/methodology" style="margin-left:8px">How the score works</a></p>
  </section>

  <section class="warn-box">
    <strong>Read before using:</strong> every value on this site carries a label — fetched from a source
    API, hand-verified, hand-transcribed, or sample — plus its source and reference year. The
    <a href="#/status">Data status page</a> shows exactly which sources update automatically, which
    remain manual, and when each last refreshed.
  </section>`;
}

function afterHome() {
  wireSearch("homeSearch");
  const sel = el("mapIndicator");
  renderMap("mapContainer", sel.value);
  sel.addEventListener("change", () => renderMap("mapContainer", sel.value));
}

/* ----- COUNTRY PROFILE ----- */
function kvCard(iso3, ind) {
  const meta = S.iv.indicators[ind];
  const v = getVal(iso3, ind);
  const srcName = S.sources.sources[meta.source] ? S.sources.sources[meta.source].name.split("—")[0].trim() : meta.source;
  if (!v) {
    return `<div class="kv kv-missing">
      <div class="kv-label" title="${esc(meta.desc)}">${esc(meta.name)}</div>
      <div class="kv-value">missing <span class="chip-missing">no data</span></div>
      <div class="kv-src">${esc(srcName)} · not imputed</div>
    </div>`;
  }
  return `<div class="kv">
    <div class="kv-label" title="${esc(meta.desc)}">${esc(meta.name)}${meta.unit ? ` <span class="note">(${esc(meta.unit)})</span>` : ""}</div>
    <div class="kv-value">${fmtValue(v.v, meta.fmt)} ${statusChip(v.s)}</div>
    <div class="kv-src">${esc(srcName)} · ${v.y || "n.d."}</div>
  </div>`;
}

function viewCountry(iso3) {
  const c = countryByIso(iso3);
  if (!c) return `<div class="card"><h1>Country not found</h1><p>No country with code “${esc(iso3)}” is in the sample. <a href="#/home">Back to the map</a>.</p></div>`;
  const sc = S.scores[iso3];
  const exp = S.exportsData.countries[iso3];

  const pillarSections = PILLAR_ORDER.map(pid => {
    const inds = Object.entries(S.iv.indicators).filter(([, m]) => m.pillar === pid).map(([k]) => k);
    const m = S.meth.pillars[pid];
    return `<section class="card">
      <h3><span class="pillar-dot" style="background:${m.color}"></span>${esc(m.name)}
        ${sc.pillars[pid].score != null ? `<span class="badge badge-status">pillar score ${sc.pillars[pid].score}</span>` : `<span class="badge badge-low">no scored data</span>`}</h3>
      <p class="note">${esc(m.desc)}</p>
      <div class="kv-grid">${inds.map(i => kvCard(iso3, i)).join("")}</div>
    </section>`;
  }).join("");

  let exportsHTML = "";
  if (exp) {
    const prod = exp.top_products.map(p => `
      <div class="export-row"><span>${esc(p.name)} ${statusChip(exp.status === "approx" ? "manual_approx" : exp.status)}</span><span class="export-share">${fmtNum(p.share, 1)}% of exports</span>
      <span class="export-track"><span class="export-fill" style="width:${Math.min(p.share, 100)}%"></span></span></div>`).join("");
    const dest = exp.top_destinations.map(p => `
      <div class="export-row"><span>${esc(p.name)}</span><span class="export-share">${fmtNum(p.share, 1)}%</span>
      <span class="export-track"><span class="export-fill" style="width:${Math.min(p.share, 100)}%;background:#B8860B"></span></span></div>`).join("");
    exportsHTML = `<section class="card">
      <h3><span class="pillar-dot" style="background:#B8860B"></span>Trade structure <span class="badge badge-status">ref. ${exp.year || "~" + S.exportsData.reference_year}</span> ${statusChip(exp.status === "approx" ? "manual_approx" : exp.status)}</h3>
      <div class="grid grid-2">
        <div><h3 style="font-size:.95rem">Top 5 export products</h3><div class="export-bars">${prod}</div></div>
        <div><h3 style="font-size:.95rem">Top 5 export destinations</h3><div class="export-bars">${dest}</div></div>
      </div>
      <p class="note" style="margin-bottom:0">${exp.status === "api_reported"
        ? "Computed from UN Comtrade reported trade flows by the data pipeline."
        : "Approximate shares hand-transcribed from public OEC country profiles; not verified. Becomes automated when a UN Comtrade key is configured — see the Data status page."}</p>
    </section>`;
  }

  const warnBits = [];
  if (sc.lowCoverage) warnBits.push(`fewer than ${Math.round((S.meth.coverage_threshold || 0.6) * 100)}% of scored indicators are available (${sc.availableCount}/${sc.totalScored}), so the total score is <strong>low-confidence</strong>`);
  if (sc.reweighted) warnBits.push(`the following pillar(s) had no data and were excluded, with remaining weights rescaled proportionally: <strong>${sc.excludedPillars.map(pillarName).map(esc).join(", ")}</strong>`);

  const note = S.iv.notes && S.iv.notes[iso3];

  return `
  <div class="profile-head">
    <div>
      <p class="eyebrow">Country profile</p>
      <h1>${esc(c.name)}</h1>
      <div class="profile-meta">
        <span class="badge badge-group">${esc(c.income_group)}</span>
        <span>${esc(c.region)}</span>
        <span>·</span>
        <span>Data last updated ${esc(S.iv.last_updated)}</span>
        ${confBadge(sc.confidence)}
      </div>
    </div>
  </div>

  <div class="warn-box"><strong>Data confidence — ${esc({ high: "high", medium: "medium", low: "low", sample: "sample only" }[sc.confidence])}:</strong>
    ${sc.availableCount} of ${sc.totalScored} scored indicators available; ${sc.verifiedCount} fetched from
    source APIs or verified, ${sc.availableCount - sc.verifiedCount - sc.sampleCount} hand-transcribed
    (unverified), ${sc.sampleCount} sample placeholder(s)${warnBits.length ? "; " + warnBits.join("; ") : ""}.
    Each value below carries its own label, source and year — see the <a href="#/status">Data status page</a>
    for what updates automatically. Verify against the <a href="#/sources">original sources</a> before citing.
  </div>

  <section class="card">
    <div class="score-hero">
      <div>
        <p class="eyebrow">Risk-Adjusted Development Profile</p>
        <div class="score-num">${sc.total ?? "—"}<span class="score-den"> / 100</span></div>
        <p class="note">Weighted composite of the six pillar scores below,<br>relative to this ${S.countries.length}-country sample. <a href="#/methodology">Methodology</a></p>
      </div>
      <div style="flex:1;min-width:280px">
        <p class="eyebrow">Component scores (always shown)</p>
        ${pillarStrip(iso3, { counts: true })}
      </div>
    </div>
  </section>

  <section class="card narrative">
    <h3>Plain-English summary</h3>
    ${countryNarrative(iso3)}
    ${note ? "" : ""}
  </section>

  ${pillarSections}
  ${exportsHTML}

  <p>
    <a class="btn" href="#/compare?add=${iso3}">Compare ${esc(c.name)} with other countries</a>
    <a class="btn btn-ghost" href="#/rankings" style="margin-left:8px">See full rankings</a>
  </p>`;
}

/* ----- RANKINGS ----- */
function viewRankings() {
  return `
  <p class="eyebrow">Rankings</p>
  <h1>Sample-country rankings</h1>
  <p class="prose">Countries ranked by Risk-Adjusted Development Profile <em>within this ${S.countries.length}-country
  prototype sample</em>. Because normalization is relative to the sample, scores would shift if more countries
  were added. Click a column header to sort; click a country for its full profile.</p>
  <div class="card">
    <p><button class="btn" id="csvBtn">Download data as CSV</button>
    <span class="note" style="margin-left:10px">Includes every indicator with its year and status label (approx / sample / missing).</span></p>
    <div class="table-scroll"><table class="data" id="rankTable">
      <thead><tr>
        <th>#</th>
        <th class="sortable" data-sort="name">Country</th>
        <th>Group</th>
        <th class="num sortable" data-sort="total">RADP ▾</th>
        ${PILLAR_ORDER.map(p => `<th class="num sortable" data-sort="p_${p}" title="${esc(S.meth.pillars[p].name)}"><span class="pillar-dot" style="background:${S.meth.pillars[p].color}"></span>${esc(shortPillar(p))}</th>`).join("")}
        <th class="num sortable" data-sort="gni">GNI p.c.</th>
        <th>Confidence</th>
      </tr></thead>
      <tbody id="rankBody"></tbody>
    </table></div>
    <p class="note" style="margin-bottom:0">Scores recalculate from the current data files on every load. Pillar abbreviations:
    ${PILLAR_ORDER.map(p => `${esc(shortPillar(p))} = ${esc(S.meth.pillars[p].name)}`).join("; ")}.</p>
  </div>`;
}
function shortPillar(p) {
  return { income: "Income", fiscal: "Fiscal", external: "External", productive: "Exports", human: "Human", governance: "Gov." }[p];
}
function renderRankBody() {
  const { key, dir } = S.rankSort;
  const rows = [...S.countries].sort((a, b) => {
    const va = rankSortValue(a, key), vb = rankSortValue(b, key);
    if (va == null && vb == null) return 0;
    if (va == null) return 1;
    if (vb == null) return -1;
    return (va < vb ? -1 : va > vb ? 1 : 0) * dir;
  });
  el("rankBody").innerHTML = rows.map((c, i) => {
    const sc = S.scores[c.iso3];
    const gni = getVal(c.iso3, "gni_pc");
    return `<tr>
      <td class="rank-cell">${i + 1}</td>
      <td><a href="#/country/${c.iso3}">${esc(c.name)}</a></td>
      <td>${esc(c.income_group.replace(" income", ""))}</td>
      <td class="num"><strong>${sc.total ?? "—"}</strong></td>
      ${PILLAR_ORDER.map(p => `<td class="num">${sc.pillars[p].score ?? '<span class="note">n/a</span>'}</td>`).join("")}
      <td class="num">${gni ? fmtValue(gni.v, "usd0") : "—"}</td>
      <td>${confBadge(sc.confidence)}</td>
    </tr>`;
  }).join("");
}
function rankSortValue(c, key) {
  if (key === "name") return c.name.toLowerCase();
  const sc = S.scores[c.iso3];
  if (key === "total") return sc.total;
  if (key.startsWith("p_")) return sc.pillars[key.slice(2)].score;
  if (key === "gni") { const v = getVal(c.iso3, "gni_pc"); return v ? v.v : null; }
  return null;
}
function afterRankings() {
  renderRankBody();
  el("csvBtn").addEventListener("click", rankingsCSV);
  document.querySelectorAll("#rankTable th.sortable").forEach(th => {
    th.addEventListener("click", () => {
      const k = th.dataset.sort;
      if (S.rankSort.key === k) S.rankSort.dir *= -1;
      else S.rankSort = { key: k, dir: k === "name" ? 1 : -1 };
      renderRankBody();
    });
  });
}

/* ----- COMPARE ----- */
const COMPARE_TABLE_INDS = ["gni_pc", "gdp_pc", "gdp_growth", "population", "debt_gdp", "fiscal_balance",
  "current_account", "remittances_gdp", "export_conc", "eci", "hdi", "poverty", "gini", "unemployment"];
const COMPARE_CHART_INDS = ["gni_pc", "debt_gdp", "hdi", "export_conc", "poverty", "gini"];

function viewCompare() {
  return `
  <p class="eyebrow">Compare</p>
  <h1>Compare countries</h1>
  <p class="prose">Select two to five countries. Comparing the pillar scores side by side is usually more
  informative than comparing the single composite number.</p>
  <div class="card">
    <p class="note" style="margin-top:0">Selected: <span id="compareCount">0</span> of 5 maximum.</p>
    <div class="compare-picker" id="comparePicker"></div>
  </div>
  <div id="compareOut"></div>`;
}

function renderComparePicker() {
  el("comparePicker").innerHTML = S.countries.map(c => {
    const on = S.compareSel.includes(c.iso3);
    const disabled = !on && S.compareSel.length >= 5;
    return `<button class="compare-pill" data-iso="${c.iso3}" aria-pressed="${on}" ${disabled ? "disabled" : ""}>${esc(c.name)}</button>`;
  }).join("");
  el("compareCount").textContent = S.compareSel.length;
  el("comparePicker").querySelectorAll("button").forEach(b => {
    b.addEventListener("click", () => {
      const iso = b.dataset.iso;
      if (S.compareSel.includes(iso)) S.compareSel = S.compareSel.filter(x => x !== iso);
      else if (S.compareSel.length < 5) S.compareSel.push(iso);
      renderComparePicker(); renderCompareOut();
    });
  });
}

function renderCompareOut() {
  const out = el("compareOut");
  const list = S.compareSel;
  if (list.length < 2) {
    out.innerHTML = `<div class="card note">Select at least two countries above to see the comparison.</div>`;
    return;
  }
  // side-by-side table
  const head = `<tr><th>Indicator</th>${list.map(i => `<th class="num">${esc(countryByIso(i).name)}</th>`).join("")}</tr>`;
  const rowsHTML = COMPARE_TABLE_INDS.map(ind => {
    const meta = S.iv.indicators[ind];
    return `<tr><td>${esc(meta.name)} <span class="note">(${esc(meta.unit)})</span></td>` +
      list.map(iso => {
        const v = getVal(iso, ind);
        return `<td class="num">${v ? fmtValue(v.v, meta.fmt) + " " + statusChip(v.s) + `<div class="note">${v.y}</div>` : '<span class="chip-missing">missing</span>'}</td>`;
      }).join("") + "</tr>";
  }).join("");
  const totalRow = `<tr><td><strong>RADP composite (0–100)</strong></td>${list.map(iso =>
    `<td class="num"><strong>${S.scores[iso].total ?? "—"}</strong><div>${confBadge(S.scores[iso].confidence)}</div></td>`).join("")}</tr>`;

  // per-indicator grouped bar charts
  const charts = COMPARE_CHART_INDS.map(ind => {
    const meta = S.iv.indicators[ind];
    const items = list.map((iso, i) => {
      const v = getVal(iso, ind);
      return { label: countryByIso(iso).name, value: v ? v.v : null, color: COMPARE_COLORS[i], display: v ? fmtValue(v.v, meta.fmt) : null };
    });
    return `<div class="chart-block">
      <div class="chart-title">${esc(meta.name)}</div>
      <div class="chart-sub">${esc(meta.unit)} · ${meta.direction === "neg" ? "lower is generally better" : "higher is generally better"}</div>
      ${barChartSVG(items)}
    </div>`;
  }).join("");

  out.innerHTML = `
  <section class="card narrative">
    <h3>Plain-English comparison</h3>
    ${compareNarrative(list)}
  </section>
  <section class="card">
    <h3>Component scores</h3>
    ${compareLegend(list)}
    <div class="chart-block">${groupedPillarChart(list)}</div>
    <p class="note" style="margin-bottom:0">Pillar scores are 0–100, normalized within the ${S.countries.length}-country sample. “No data” pillars are excluded from that country's composite with reweighting.</p>
  </section>
  <section class="card">
    <h3>Side-by-side indicators</h3>
    <div class="table-scroll"><table class="data"><thead>${head}</thead><tbody>${totalRow}${rowsHTML}</tbody></table></div>
    <p class="note" style="margin-bottom:0">Labels: “API” = fetched from the source API by the pipeline; “verified” = hand-checked; “manual” = hand-transcribed, unverified; “sample” = placeholder; “missing” = no value, never imputed.</p>
  </section>
  <section class="card">
    <h3>Key indicators, charted</h3>
    ${charts}
  </section>`;
}

function afterCompare(params) {
  if (params && params.get("add")) {
    const iso = params.get("add").toUpperCase();
    if (countryByIso(iso) && !S.compareSel.includes(iso)) S.compareSel.push(iso);
  }
  if (S.compareSel.length === 0) S.compareSel = ["SRB", "MDA"]; // sensible default pair
  renderComparePicker();
  renderCompareOut();
}

/* ----- METHODOLOGY ----- */
function viewMethodology() {
  const m = S.meth;
  const weightRows = PILLAR_ORDER.map(pid => {
    const p = m.pillars[pid];
    const inds = Object.values(S.iv.indicators).filter(x => x.pillar === pid && x.scored).map(x => x.name);
    const ctx = Object.values(S.iv.indicators).filter(x => x.pillar === pid && !x.scored).map(x => x.name);
    return `<tr>
      <td><span class="pillar-dot" style="background:${p.color}"></span>${esc(p.name)}</td>
      <td class="num">${Math.round(p.weight * 100)}%</td>
      <td>${esc(inds.join("; "))}${ctx.length ? `<div class="note">Context only (not scored): ${esc(ctx.join("; "))}</div>` : ""}</td>
    </tr>`;
  }).join("");

  const steps = m.normalization.steps.map(s => `<li>${esc(s)}</li>`).join("");
  const defPoints = m.defensible_not_definitive.points.map(p =>
    `<h3>${esc(p.h)}</h3><p>${esc(p.t)}</p>`).join("");
  const confRows = Object.entries(m.confidence_rules.levels).map(([k, v]) =>
    `<tr><td>${confBadge(k)}</td><td>${esc(v.desc)}</td></tr>`).join("");

  return `
  <p class="eyebrow">Methodology · ${esc(m.index_name)} v${esc(m.version)}</p>
  <h1>${esc(m.index_name)}</h1>
  <div class="prose">
    <p>${esc(m.tagline)}</p>
    <p><strong>Core concept.</strong> GNI per capita alone is incomplete: it does not show whether income is
    sustainable, inclusive, diversified, resilient, or fiscally healthy. The RADP therefore combines income with
    debt sustainability, external vulnerability, productive capacity, human development and inclusion, and an
    institutional/data-confidence proxy — and always displays the components next to the composite.</p>
  </div>

  <section class="card">
    <h2 style="margin-top:0">Pillars, weights and indicators</h2>
    <div class="table-scroll"><table class="data weights-table">
      <thead><tr><th>Pillar</th><th class="num">Weight</th><th>Scored indicators</th></tr></thead>
      <tbody>${weightRows}</tbody>
    </table></div>
    <p class="note">Weights are an explicit expert judgement, not an estimation result — see
    “Why weights are contestable” below. They can be changed in <code>data/methodology.json</code>.</p>
  </section>

  <section class="card prose">
    <h2 style="margin-top:0">Normalization and aggregation</h2>
    <ol>${steps}</ol>
    <div class="formula">pillar_score = mean( normalized indicators available in pillar )
total_RADP  = Σ ( pillar_score × weight ) / Σ ( weights of pillars with data )</div>
  </section>

  <section class="card">
    <h2 style="margin-top:0">Data confidence categories</h2>
    <div class="table-scroll"><table class="data"><tbody>${confRows}</tbody></table></div>
    <p class="note">${esc(m.confidence_rules.note)}</p>
  </section>

  <section class="card prose">
    <h2 style="margin-top:0">${esc(m.defensible_not_definitive.title)}</h2>
    ${defPoints}
  </section>`;
}

/* ----- SOURCES ----- */
function viewSources() {
  const rows = Object.values(S.sources.sources).map(s => `
    <tr>
      <td><strong>${esc(s.name)}</strong><div class="note"><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.url)}</a></div></td>
      <td>${autoBadge(s.automation)}</td>
      <td>${esc(s.used_for)}</td>
      <td class="note">${esc(s.pipeline_note || "")}</td>
    </tr>`).join("");
  return `
  <p class="eyebrow">Data sources</p>
  <h1>Sources, status and last update</h1>
  <div class="card">
    <div class="grid grid-3">
      <div><div class="eyebrow">Dataset status</div><span class="badge badge-sample">Sample / approximate — not verified</span></div>
      <div><div class="eyebrow">Last updated</div>${esc(S.sources.last_updated)}</div>
      <div><div class="eyebrow">Update method</div>${esc(S.sources.update_method)}</div>
    </div>
  </div>
  <div class="warn-box"><strong>What is real vs. manual vs. sample?</strong> Values labeled
  “API” were fetched from the source APIs by the automated pipeline; “verified” values were hand-checked;
  “manual” values were hand-transcribed and are approximately correct but unverified; “sample” values are
  placeholders. Missing values are shown as missing, never invented. Per-source automation, last-run dates
  and failures are on the <a href="#/status">Data status page</a>. Nothing here should be cited as official
  without checking the source.</div>
  <div class="card">
    <div class="table-scroll"><table class="data">
      <thead><tr><th>Source</th><th>Automation</th><th>Used for</th><th>Notes</th></tr></thead>
      <tbody>${rows}</tbody>
    </table></div>
  </div>
  <div class="card prose">
    <h2 style="margin-top:0">How the data stays current</h2>
    <p>All data lives in plain-text JSON files in the <code>/data</code> folder. A monthly GitHub Actions
    pipeline (<code>scripts/update_data.py</code>) refreshes World Bank WDI, IMF WEO, WGI and UNDP HDR values
    automatically and records the outcome on the <a href="#/status">Data status page</a>. Values the pipeline
    cannot fetch (OEC-derived export structure and complexity, reserve cover, interest burden) remain manual
    and are labeled as such; they can be hand-verified and marked <code>"reported"</code>. See
    <code>SETUP.md</code> in the repository for maintenance instructions.</p>
  </div>`;
}


/* ----- DATA STATUS ----- */
function autoBadge(a) {
  const map = {
    automated: ["badge-high", "Automated"],
    semi_automated: ["badge-medium", "Semi-automated"],
    partial_manual: ["badge-low", "Partial / manual"],
    optional: ["badge-status", "Optional"],
    manual: ["badge-low", "Manual"]
  };
  const [cls, label] = map[a] || ["badge-status", a];
  return `<span class="badge ${cls}">${esc(label)}</span>`;
}

function viewStatus() {
  const st = S.updateStatus;
  if (!st) return `<div class="card"><h1>Data automation status</h1><p>update_status.json could not be loaded.</p></div>`;
  const indName = id => S.iv.indicators[id] ? S.iv.indicators[id].name : id;

  // dataset-wide status counts
  const counts = {};
  let total = 0;
  for (const vals of Object.values(S.iv.values)) {
    for (const v of Object.values(vals)) { counts[v.s] = (counts[v.s] || 0) + 1; total++; }
  }
  const statusOrder = [["api_reported", "fetched from source API"], ["reported", "hand-verified"], ["manual_approx", "hand-transcribed, unverified"], ["sample", "illustrative placeholder"]];
  const countCards = statusOrder.map(([k, d]) => `
    <div class="card"><div class="headline-num">${counts[k] || 0}</div>
    <div class="headline-label">${statusChip(k)} values — ${esc(d)}</div></div>`).join("");

  const rows = Object.entries(st.sources).map(([sid, s]) => {
    const covered = (s.indicators_covered || []).map(i => esc(indName(i))).join("; ") || "—";
    const manual = (s.indicators_manual || []).map(i => esc(indName(i))).join("; ") || "—";
    const unresolved = s.unresolved
      ? Object.entries(s.unresolved).map(([k, why]) => `<div class="note" style="margin-top:4px"><strong>${esc(indName(k))}:</strong> ${esc(why)}</div>`).join("")
      : "";
    return `<tr>
      <td><strong>${esc(s.name)}</strong><div class="note">${esc(s.how || "")}</div>${unresolved}</td>
      <td>${autoBadge(s.automation)}</td>
      <td>${s.last_success ? esc(s.last_success) : '<span class="note">not yet run</span>'}
        ${s.last_attempt && s.last_attempt !== s.last_success ? `<div class="note">last attempt ${esc(s.last_attempt)}</div>` : ""}</td>
      <td class="num">${s.latest_ref_year ? esc(String(s.latest_ref_year)) : "—"}</td>
      <td>${covered}</td>
      <td>${manual}</td>
      <td>${s.error ? `<span class="badge badge-low">error</span><div class="note">${esc(s.error)}</div>` : '<span class="note">—</span>'}</td>
    </tr>`;
  }).join("");

  return `
  <p class="eyebrow">Data automation status</p>
  <h1>What updates itself — and what does not</h1>
  <p class="prose">This dashboard is fed by a free, keyless data pipeline
  (<code>scripts/update_data.py</code>) that runs monthly via GitHub Actions and rewrites the static
  <code>/data</code> files. Each source below is isolated: if one fails, the site keeps serving its
  existing data. Nothing on this page is hidden or smoothed over — sources that are not automated
  say so.</p>
  <div class="card">
    <div class="grid grid-3">
      <div><div class="eyebrow">Pipeline last run</div>${st.pipeline_last_run ? esc(st.pipeline_last_run) : '<span class="badge badge-medium">not yet run</span>'}</div>
      <div><div class="eyebrow">Dataset label</div>${esc(S.iv.dataset_label || "—")}</div>
      <div><div class="eyebrow">Schedule</div>Monthly (GitHub Actions) + manual trigger</div>
    </div>
    ${st.pipeline_last_run ? "" : `<p class="warn-box" style="margin-bottom:0">${esc(st.pipeline_note || "")}</p>`}
  </div>
  <section class="grid grid-4 headline-cards" aria-label="Value status counts">${countCards}</section>
  <div class="card" style="margin-top:18px">
    <div class="table-scroll"><table class="data">
      <thead><tr><th>Source</th><th>Automation</th><th>Last successful update</th><th class="num">Latest ref. year</th><th>Indicators covered</th><th>Still manual / missing</th><th>Failure</th></tr></thead>
      <tbody>${rows}</tbody>
    </table></div>
  </div>
  <div class="card prose">
    <h2 style="margin-top:0">How to read value labels across the site</h2>
    <p>${statusChip("api_reported")} fetched automatically from the source API by the pipeline, with the
    date it was last refreshed. ${statusChip("reported")} checked by hand against the official source.
    ${statusChip("manual_approx")} hand-transcribed from a public source; approximately correct but unverified —
    these cap a country's confidence at Medium. ${statusChip("sample")} illustrative placeholder, demonstration
    only. <em>Missing</em> values are shown as missing and are never imputed.</p>
  </div>`;
}

/* ----- ABOUT ----- */
function viewAbout() {
  return `
  <p class="eyebrow">About</p>
  <h1>About this dashboard</h1>
  <div class="card prose">
    <h2 style="margin-top:0">What it is</h2>
    <p>The Country Development &amp; Resilience Dashboard is an open, static analytical prototype. It explores a
    simple question with serious policy consequences: <em>when a country's income per person rises, is that income
    broad-based, fiscally sustainable, diversified, and resilient — or fragile?</em></p>
    <p>It combines income indicators with public debt, fiscal balances, external vulnerability, export structure,
    human development, inequality and governance into a transparent composite — the
    <a href="#/methodology">Risk-Adjusted Development Profile</a> — whose components are always shown.</p>
    <h2>Who it is for</h2>
    <p>Analysts and advisers in international organizations, ministries, development banks, think tanks and
    research groups who need a structured, honest way to discuss development beyond a single income number.</p>
    <h2>What it is not</h2>
    <ul>
      <li>Not an official World Bank, IMF, UN or government product, classification or ranking.</li>
      <li>Not a substitute for country-specific expert assessment or debt sustainability analysis.</li>
      <li>Not (yet) a verified dataset — this version runs on labeled sample/approximate data.</li>
    </ul>
    <h2>How it is built</h2>
    <p>Plain HTML, CSS and JavaScript with static JSON files as the database. No server, no build step, no
    paid services, no tracking. It runs for free on GitHub Pages. A monthly GitHub Actions pipeline refreshes
    the World Bank, IMF, WGI and UNDP HDR data from their public APIs and commits the updated files; the site
    itself never makes API calls and keeps working even if every source fails. What is and is not automated is
    shown openly on the <a href="#/status">Data status page</a>.</p>
    <h2>Roadmap ideas</h2>
    <ul>
      <li>Verify and expand the dataset to full country coverage via the World Bank / IMF / UNDP APIs.</li>
      <li>Add time series and trend arrows per indicator.</li>
      <li>Let users adjust pillar weights interactively to test the index's sensitivity.</li>
      <li>Governance pillar: evaluate alternatives to perceptions-based WGI measures.</li>
    </ul>
  </div>`;
}

/* ---------------- router ---------------- */
const ROUTES = {
  home: { render: viewHome, after: afterHome, nav: "home" },
  rankings: { render: viewRankings, after: afterRankings, nav: "rankings" },
  compare: { render: viewCompare, after: afterCompare, nav: "compare" },
  methodology: { render: viewMethodology, nav: "methodology" },
  sources: { render: viewSources, nav: "sources" },
  status: { render: viewStatus, nav: "status" },
  about: { render: viewAbout, nav: "about" }
};

function route() {
  hideTooltip();
  const hash = location.hash.replace(/^#\/?/, "") || "home";
  const [pathPart, queryPart] = hash.split("?");
  const params = new URLSearchParams(queryPart || "");
  const segs = pathPart.split("/").filter(Boolean);
  const app = el("app");

  let navKey = segs[0] || "home";
  if (segs[0] === "country" && segs[1]) {
    app.innerHTML = viewCountry(segs[1].toUpperCase());
    navKey = "home";
  } else {
    const r = ROUTES[segs[0] || "home"] || ROUTES.home;
    app.innerHTML = r.render();
    if (r.after) r.after(params);
    navKey = r.nav;
  }
  document.querySelectorAll(".site-nav a").forEach(a =>
    a.classList.toggle("active", a.dataset.nav === navKey));
  el("siteNav").classList.remove("open");
  window.scrollTo(0, 0);
}

/* ---------------- init ---------------- */
async function init() {
  try {
    const d = await loadData();
    S.countries = d.countries.countries;
    S.iv = d.iv;
    S.exportsData = d.exp;
    S.meth = d.meth;
    S.sources = d.src;
    S.updateStatus = d.status || null;
    computeAllScores();

    el("footerUpdated").textContent = S.iv.last_updated || "—";
    el("footerDatasetStatus").textContent = S.iv.dataset_label || S.iv.dataset_status || "—";

    window.addEventListener("hashchange", route);
    route();
  } catch (e) {
    el("app").innerHTML = `<div class="card"><h1>Could not load data</h1>
      <p>The dashboard could not load its data files (${esc(e.message)}).</p>
      <p>If you opened <code>index.html</code> directly from a folder, make sure the file
      <code>data/embedded_data.js</code> is present next to it. On GitHub Pages, make sure the whole
      <code>data</code> folder was uploaded.</p></div>`;
  }
}

el("navToggle").addEventListener("click", () => {
  const nav = el("siteNav");
  const open = nav.classList.toggle("open");
  el("navToggle").setAttribute("aria-expanded", String(open));
});

init();
