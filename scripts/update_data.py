#!/usr/bin/env python3
"""
Data pipeline for the Country Development & Resilience Dashboard.

Fetches public data into the static /data JSON files that power the website.
Runs monthly in GitHub Actions (see .github/workflows/update-data.yml) and can
be run by hand:  python3 scripts/update_data.py

Design rules
------------
* Standard library only (no pip installs), so it runs anywhere.
* Every source is isolated: if one fails, the others still run and the website
  keeps working with its existing data. Failures are recorded, per source, in
  data/update_status.json and shown on the site's "Data status" page.
* Every fetched value is written as {v, y, s, u}: value, reference year,
  status, last-updated date. Fetched values get status "api_reported".
* Nothing is ever imputed. If a source has no value, the existing entry is
  left alone (or stays missing).

Sources and their honest automation level
-----------------------------------------
wb_wdi   AUTOMATED      World Bank Indicators API (keyless).
imf      AUTOMATED      IMF DataMapper API (keyless; WEO series). Covers
                        debt_gdp, fiscal_balance, current_account.
                        UNRESOLVED: reserves_months, interest_rev — see
                        UNRESOLVED_INDICATORS below for exactly why.
wb_wgi   AUTOMATED      Worldwide Governance Indicators, served through the
                        same World Bank API (GE.PER.RNK, RL.PER.RNK).
undp_hdr SEMI-AUTOMATED UNDP publishes a complete-time-series CSV per HDR
                        edition; the URL changes with each edition. This
                        adapter downloads and parses it. When UNDP releases a
                        new report, update HDR_CSV_URL below (one line).
oec      PARTIAL/MANUAL The OEC bulk/API endpoints now require a registered
                        (paid) token, so top exports, partners, export
                        concentration and ECI are NOT automated. Values remain
                        manually transcribed and are labeled as such.
comtrade OPTIONAL       UN Comtrade's free API requires a (free) registered
                        key. If the environment variable COMTRADE_API_KEY is
                        set, this pipeline computes top export products,
                        top destinations and the export concentration index
                        (HHI) from real Comtrade data. The site never depends
                        on this.

Usage
-----
    python3 scripts/update_data.py                # run all sources
    python3 scripts/update_data.py --only wb_wdi  # run one source
    python3 scripts/update_data.py --embed-only   # just regenerate embedded_data.js
    python3 scripts/update_data.py --dry-run      # fetch + report, write nothing
"""

import csv
import io
import json
import os
import sys
import datetime
import urllib.request
import urllib.error
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data"
TODAY = datetime.date.today().isoformat()
THIS_YEAR = datetime.date.today().year
MAX_LOOKBACK_YEARS = 8   # ignore observations older than this
USER_AGENT = "country-resilience-dashboard/1.0 (open-source static policy dashboard)"

# ----------------------------------------------------------------------------
# Source configuration
# ----------------------------------------------------------------------------

# World Bank WDI: dashboard indicator id -> WB API code
WB_WDI = {
    "gni_pc":          "NY.GNP.PCAP.CD",
    "gdp_pc":          "NY.GDP.PCAP.CD",
    "gdp_growth":      "NY.GDP.MKTP.KD.ZG",
    "inflation":       "FP.CPI.TOTL.ZG",
    "population":      "SP.POP.TOTL",          # converted to millions
    "pop_growth":      "SP.POP.GROW",
    "remittances_gdp": "BX.TRF.PWKR.DT.GD.ZS",
    "poverty":         "SI.POV.UMIC",          # $6.85/day headcount
    "gini":            "SI.POV.GINI",
    "unemployment":    "SL.UEM.TOTL.ZS",
    "life_exp":        "SP.DYN.LE00.IN",
}

# WGI percentile ranks, served through the World Bank API
WB_WGI = {
    "gov_eff":  "GE.PER.RNK",
    "rule_law": "RL.PER.RNK",
}

# IMF DataMapper (WEO) : dashboard indicator id -> DataMapper code
IMF_DATAMAPPER = {
    "debt_gdp":        "GGXWDG_NGDP",   # general gov. gross debt, % GDP
    "fiscal_balance":  "GGXCNL_NGDP",   # general gov. net lending/borrowing, % GDP
    "current_account": "BCA_NGDPD",     # current account balance, % GDP
}
# WEO publishes projections; only accept observations up to this year.
IMF_MAX_YEAR = THIS_YEAR

# Indicators we could NOT automate reliably, and exactly why. These are also
# surfaced on the website's Data status page via update_status.json.
UNRESOLVED_INDICATORS = {
    "reserves_months": "No keyless IMF endpoint publishes 'reserves in months of imports' "
                       "as a single ready series. It lives in the IRFCL/BOP SDMX datasets and "
                       "requires non-trivial series mapping and an imports denominator. "
                       "Left manual until that mapping is built and validated.",
    "interest_rev":    "Interest payments as % of government revenue is not a standard WEO "
                       "DataMapper series; it appears in Fiscal Monitor tables and country "
                       "DSAs without a stable machine-readable endpoint. Left manual.",
    "eci":             "OEC / Harvard Atlas economic-complexity downloads now sit behind "
                       "registration or tokens. Left manual until a stable open mirror is chosen.",
    "export_conc":     "Computed automatically from UN Comtrade when COMTRADE_API_KEY is "
                       "provided (optional). Otherwise remains manual.",
    "school_exp":      "Covered by the UNDP HDR CSV adapter (semi-automated; URL is pinned "
                       "per HDR edition).",
}

# UNDP HDR complete time-series CSV. This URL is EDITION-SPECIFIC: when UNDP
# releases a new Human Development Report, replace it with the new CSV link
# from https://hdr.undp.org/data-center/documentation-and-downloads
HDR_CSV_URL = ("https://hdr.undp.org/sites/default/files/2023-24_HDR/"
               "HDR23-24_Composite_indices_complete_time_series.csv")
HDR_COLUMNS = {"hdi": "hdi", "school_exp": "eys"}   # dashboard id -> CSV column prefix

COMTRADE_KEY = os.environ.get("COMTRADE_API_KEY", "").strip()
COMTRADE_YEAR_CANDIDATES = [THIS_YEAR - 1, THIS_YEAR - 2, THIS_YEAR - 3]

# ----------------------------------------------------------------------------
# Small helpers
# ----------------------------------------------------------------------------

def load(name):
    with open(DATA / name, encoding="utf-8") as f:
        return json.load(f)

def save(name, obj):
    with open(DATA / name, "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, indent=2)
        f.write("\n")

def http_get(url, timeout=60, headers=None):
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT, **(headers or {})})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read()

def http_json(url, timeout=60, headers=None):
    return json.loads(http_get(url, timeout=timeout, headers=headers).decode("utf-8"))

def set_value(iv, iso3, ind, value, year, status="api_reported"):
    """Write a value only if it's new or different; return True if changed."""
    entry = {"v": value, "y": year, "s": status, "u": TODAY}
    old = iv["values"].setdefault(iso3, {}).get(ind)
    if old and old.get("v") == value and old.get("y") == year and old.get("s") == status:
        return False
    iv["values"][iso3][ind] = entry
    return True


class SourceResult:
    def __init__(self, source_id):
        self.source_id = source_id
        self.ok = False
        self.error = None
        self.changed = 0
        self.years = []
        self.covered = set()

    def record(self, changed, year, ind):
        if changed:
            self.changed += 1
        if year:
            self.years.append(year)
        self.covered.add(ind)


# ----------------------------------------------------------------------------
# Fetchers
# ----------------------------------------------------------------------------

def fetch_worldbank_indicator(iso3, code):
    """Most recent non-null value from the World Bank API. -> (value, year) | None"""
    url = (f"https://api.worldbank.org/v2/country/{iso3}/indicator/{code}"
           f"?format=json&per_page=5&mrnev=1")
    payload = http_json(url)
    if not isinstance(payload, list) or len(payload) < 2 or not payload[1]:
        return None
    obs = payload[1][0]
    if obs.get("value") is None:
        return None
    year = int(obs["date"])
    if THIS_YEAR - year > MAX_LOOKBACK_YEARS:
        return None
    return float(obs["value"]), year


def run_wb_generic(iv, countries, mapping, source_id, dry_run):
    res = SourceResult(source_id)
    errors = []
    for c in countries:
        for ind, code in mapping.items():
            try:
                got = fetch_worldbank_indicator(c["iso3"], code)
            except Exception as e:            # noqa: BLE001 - keep pipeline alive
                errors.append(f"{c['iso3']}/{code}: {e}")
                continue
            if got is None:
                continue
            value, year = got
            if ind == "population":
                value = round(value / 1_000_000, 2)
            else:
                value = round(value, 2)
            changed = False if dry_run else set_value(iv, c["iso3"], ind, value, year)
            res.record(changed, year, ind)
            print(f"    {c['iso3']} {ind}: {value} ({year})")
    if res.covered:
        res.ok = True
        if errors:
            res.error = f"{len(errors)} request(s) failed, e.g. {errors[0]}"
    else:
        res.error = errors[0] if errors else "No data returned by the API."
    return res


def run_wb_income_groups(countries_doc, dry_run):
    """Refresh income group classifications from the World Bank country endpoint."""
    changed = 0
    for c in countries_doc["countries"]:
        try:
            payload = http_json(f"https://api.worldbank.org/v2/country/{c['iso3']}?format=json")
            level = payload[1][0]["incomeLevel"]["value"]
        except Exception as e:                # noqa: BLE001
            print(f"    ! income group {c['iso3']}: {e}")
            continue
        if level and level != c.get("income_group"):
            print(f"    {c['iso3']} income group: {c.get('income_group')} -> {level}")
            if not dry_run:
                c["income_group"] = level
            changed += 1
    return changed


def run_imf(iv, countries, dry_run):
    """IMF DataMapper API (keyless). One request per indicator, all countries."""
    res = SourceResult("imf")
    isos = {c["iso3"] for c in countries}
    errors = []
    for ind, code in IMF_DATAMAPPER.items():
        try:
            payload = http_json(f"https://www.imf.org/external/datamapper/api/v1/{code}")
            series = payload["values"][code]
        except Exception as e:                # noqa: BLE001
            errors.append(f"{code}: {e}")
            continue
        for iso3 in isos:
            country_series = series.get(iso3)
            if not country_series:
                continue
            # Latest year up to IMF_MAX_YEAR (skip pure projections beyond it).
            usable = {int(y): v for y, v in country_series.items()
                      if v is not None and int(y) <= IMF_MAX_YEAR}
            if not usable:
                continue
            year = max(usable)
            if THIS_YEAR - year > MAX_LOOKBACK_YEARS:
                continue
            value = round(float(usable[year]), 2)
            changed = False if dry_run else set_value(iv, iso3, ind, value, year)
            res.record(changed, year, ind)
            print(f"    {iso3} {ind}: {value} ({year})")
    if res.covered:
        res.ok = True
        if errors:
            res.error = "; ".join(errors)
    else:
        res.error = "; ".join(errors) or "No data returned."
    return res


def run_hdr(iv, countries, dry_run):
    """UNDP HDR complete-time-series CSV (semi-automated: edition-pinned URL)."""
    res = SourceResult("undp_hdr")
    try:
        raw = http_get(HDR_CSV_URL, timeout=120).decode("utf-8-sig", errors="replace")
    except Exception as e:                    # noqa: BLE001
        res.error = (f"Could not download the HDR CSV ({e}). The URL is pinned per HDR "
                     f"edition; update HDR_CSV_URL in scripts/update_data.py to the latest "
                     f"link from hdr.undp.org/data-center.")
        return res
    try:
        rows = list(csv.DictReader(io.StringIO(raw)))
        by_iso = {r.get("iso3", "").upper(): r for r in rows}
        header = rows[0].keys() if rows else []
        for c in countries:
            row = by_iso.get(c["iso3"])
            if not row:
                continue
            for ind, prefix in HDR_COLUMNS.items():
                # columns look like hdi_1990 ... hdi_2022 ; take the latest non-empty
                candidates = sorted(
                    (int(col.rsplit("_", 1)[1]), col) for col in header
                    if col.startswith(prefix + "_") and col.rsplit("_", 1)[1].isdigit()
                )
                for year, col in reversed(candidates):
                    txt = (row.get(col) or "").strip()
                    if txt:
                        value = round(float(txt), 3 if ind == "hdi" else 1)
                        changed = False if dry_run else set_value(iv, c["iso3"], ind, value, year)
                        res.record(changed, year, ind)
                        print(f"    {c['iso3']} {ind}: {value} ({year})")
                        break
        res.ok = bool(res.covered)
        if not res.ok:
            res.error = "CSV downloaded but no matching iso3/columns found (format change?)."
    except Exception as e:                    # noqa: BLE001
        res.error = f"CSV parse failed: {e}"
    return res


# ---------------- optional: UN Comtrade ----------------

def comtrade_get(path, params):
    q = "&".join(f"{k}={v}" for k, v in params.items())
    url = f"https://comtradeapi.un.org/data/v1/get/{path}?{q}"
    return http_json(url, headers={"Ocp-Apim-Subscription-Key": COMTRADE_KEY}, timeout=120)

def run_comtrade(iv, exports_doc, countries, dry_run):
    """Optional: real top export products/destinations + HHI from UN Comtrade."""
    res = SourceResult("un_comtrade")
    if not COMTRADE_KEY:
        res.error = ("Skipped: no COMTRADE_API_KEY provided. This source is optional; "
                     "get a free key at comtradeplus.un.org and add it as a repository "
                     "secret to enable it.")
        return res
    for c in countries:
        m49 = str(int(c["iso_n"]))
        done = False
        for year in COMTRADE_YEAR_CANDIDATES:
            try:
                # All HS2 commodity exports for the year
                prod = comtrade_get("C/A/HS", {
                    "reporterCode": m49, "period": year, "flowCode": "X",
                    "partnerCode": 0, "cmdCode": "AG2", "maxRecords": 500,
                    "includeDesc": "true"})
                prows = [r for r in prod.get("data", []) if r.get("primaryValue")]
                if not prows:
                    continue
                total = sum(r["primaryValue"] for r in prows)
                if total <= 0:
                    continue
                shares = sorted(((r.get("cmdDesc") or r.get("cmdCode"),
                                  r["primaryValue"] / total) for r in prows),
                                key=lambda x: -x[1])
                hhi = round(sum(s * s for _, s in shares), 3)
                top_products = [{"name": str(n)[:70], "share": round(s * 100, 1)}
                                for n, s in shares[:5]]
                # Top partner destinations (total trade per partner)
                part = comtrade_get("C/A/HS", {
                    "reporterCode": m49, "period": year, "flowCode": "X",
                    "cmdCode": "TOTAL", "maxRecords": 500, "includeDesc": "true"})
                partners = [r for r in part.get("data", [])
                            if r.get("primaryValue") and r.get("partnerCode") not in (0, "0")]
                psum = sum(r["primaryValue"] for r in partners) or total
                partners.sort(key=lambda r: -r["primaryValue"])
                top_dest = [{"name": r.get("partnerDesc") or str(r.get("partnerCode")),
                             "share": round(r["primaryValue"] / psum * 100, 1)}
                            for r in partners[:5]]
                if not dry_run:
                    exports_doc["countries"][c["iso3"]] = {
                        "status": "api_reported", "year": year,
                        "top_products": top_products, "top_destinations": top_dest}
                    set_value(iv, c["iso3"], "export_conc", hhi, year)
                res.record(True, year, "export_conc")
                res.covered.update({"top_products", "top_destinations"})
                print(f"    {c['iso3']} exports {year}: HHI={hhi}, top={top_products[0]['name']}")
                done = True
                break
            except Exception as e:            # noqa: BLE001
                res.error = f"{c['iso3']}: {e}"
        if not done:
            print(f"    ! Comtrade: no usable data for {c['iso3']}")
    res.ok = bool(res.covered)
    return res


# ----------------------------------------------------------------------------
# Status file + embedded backup
# ----------------------------------------------------------------------------

def update_status_file(results, dry_run):
    status = load("update_status.json")
    status["pipeline_last_run"] = TODAY
    for sid, res in results.items():
        entry = status["sources"].get(sid)
        if not entry:
            continue
        entry["last_attempt"] = TODAY
        entry["error"] = None if res.ok else (res.error or "Unknown failure")
        if res.ok:
            entry["last_success"] = TODAY
            if res.years:
                entry["latest_ref_year"] = max(res.years)
            if res.error:
                entry["error"] = "Partial: " + res.error
    if not dry_run:
        save("update_status.json", status)
    return status


def recompute_dataset_label(iv):
    counts = {}
    for vals in iv["values"].values():
        for v in vals.values():
            counts[v.get("s", "?")] = counts.get(v.get("s", "?"), 0) + 1
    total = sum(counts.values()) or 1
    api = counts.get("api_reported", 0) + counts.get("reported", 0)
    if api / total >= 0.5:
        iv["dataset_status"] = "mixed"
        iv["dataset_label"] = (f"Mixed dataset — {api} of {total} values fetched/verified from "
                               f"source APIs; remainder manual or sample (labeled per value)")
    iv["last_updated"] = TODAY


def regenerate_embedded():
    data = {
        "countries": load("countries.json"),
        "indicator_values": load("indicator_values.json"),
        "exports": load("exports.json"),
        "methodology": load("methodology.json"),
        "sources": load("sources.json"),
        "update_status": load("update_status.json"),
    }
    banner = (
        "/* AUTO-GENERATED — do not edit by hand.\n"
        "   Copy of the JSON files in /data, wrapped as JavaScript so the dashboard\n"
        "   also works when index.html is opened directly from a local folder (file://).\n"
        "   Regenerate with: python3 scripts/update_data.py --embed-only\n"
        f"   Generated: {TODAY} */\n"
    )
    with open(DATA / "embedded_data.js", "w", encoding="utf-8") as f:
        f.write(banner)
        f.write("window.EMBEDDED_DATA = ")
        json.dump(data, f, ensure_ascii=False, indent=1)
        f.write(";\n")
    print("Regenerated data/embedded_data.js")


# ----------------------------------------------------------------------------
# Main
# ----------------------------------------------------------------------------

def main():
    args = sys.argv[1:]
    dry_run = "--dry-run" in args
    only = None
    if "--only" in args:
        only = args[args.index("--only") + 1]
    if not (DATA / "countries.json").exists():
        sys.exit("Run from the project root (data/countries.json not found).")

    if "--embed-only" in args:
        regenerate_embedded()
        return

    countries_doc = load("countries.json")
    countries = countries_doc["countries"]
    iv = load("indicator_values.json")
    exports_doc = load("exports.json")
    results = {}

    def should(sid):
        return only is None or only == sid

    if should("wb_wdi"):
        print("== World Bank WDI ==")
        results["wb_wdi"] = run_wb_generic(iv, countries, WB_WDI, "wb_wdi", dry_run)
        try:
            if run_wb_income_groups(countries_doc, dry_run) and not dry_run:
                save("countries.json", countries_doc)
        except Exception as e:                # noqa: BLE001
            print(f"    ! income group refresh failed: {e}")

    if should("wb_wgi"):
        print("== Worldwide Governance Indicators (via World Bank API) ==")
        results["wb_wgi"] = run_wb_generic(iv, countries, WB_WGI, "wb_wgi", dry_run)

    if should("imf"):
        print("== IMF DataMapper (WEO) ==")
        results["imf"] = run_imf(iv, countries, dry_run)

    if should("undp_hdr"):
        print("== UNDP Human Development Report ==")
        results["undp_hdr"] = run_hdr(iv, countries, dry_run)

    if should("un_comtrade"):
        print("== UN Comtrade (optional) ==")
        results["un_comtrade"] = run_comtrade(iv, exports_doc, countries, dry_run)

    total_changed = sum(r.changed for r in results.values())
    ok = [s for s, r in results.items() if r.ok]
    failed = [(s, r.error) for s, r in results.items() if not r.ok]
    print(f"\nSummary: {total_changed} value(s) updated. Succeeded: {', '.join(ok) or 'none'}.")
    for s, err in failed:
        print(f"  {s}: FAILED/SKIPPED — {err}")

    if dry_run:
        print("Dry run: nothing written.")
        return

    recompute_dataset_label(iv)
    save("indicator_values.json", iv)
    save("exports.json", exports_doc)
    update_status_file(results, dry_run=False)
    regenerate_embedded()
    print("Done.")


if __name__ == "__main__":
    main()
