#!/usr/bin/env python3
"""
OPTIONAL data updater for the Country Development & Resilience Dashboard.
The website does NOT depend on this script. It works with the static JSON
files as they are.

What this script does:
  1. Pulls the latest available values for World Bank indicators from the free,
     keyless World Bank API (api.worldbank.org) for the countries in
     data/countries.json, and writes them into data/indicator_values.json with
     status "reported" and the correct reference year.
  2. Regenerates data/embedded_data.js (the backup copy used for local
     double-click viewing).

What it deliberately does NOT do:
  - It does not touch IMF/OEC/UNDP/WGI indicators (those keep their current
    values and status labels until you verify them by hand or extend this
    script).
  - It never invents values: if the API has no data, the entry is left as-is
    (or stays missing).

Usage (needs Python 3, standard library only — no pip installs):
    python3 scripts/update_data.py               # fetch + regenerate embed
    python3 scripts/update_data.py --embed-only  # only regenerate embedded_data.js
    python3 scripts/update_data.py --dry-run     # show what would change

Run it from the project root folder (the folder containing index.html).
"""

import json
import sys
import datetime
import urllib.request
import urllib.error
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data"

# Dashboard indicator id -> World Bank API indicator code
WB_INDICATORS = {
    "gni_pc":          "NY.GNP.PCAP.CD",     # GNI per capita, Atlas (current US$)
    "gdp_pc":          "NY.GDP.PCAP.CD",     # GDP per capita (current US$)
    "gdp_growth":      "NY.GDP.MKTP.KD.ZG",  # GDP growth (annual %)
    "inflation":       "FP.CPI.TOTL.ZG",     # Inflation, CPI (annual %)
    "population":      "SP.POP.TOTL",        # Population (converted to millions)
    "pop_growth":      "SP.POP.GROW",        # Population growth (annual %)
    "remittances_gdp": "BX.TRF.PWKR.DT.GD.ZS",  # Remittances received (% of GDP)
    "poverty":         "SI.POV.UMIC",        # Poverty headcount $6.85/day (%)
    "gini":            "SI.POV.GINI",        # Gini index
    "unemployment":    "SL.UEM.TOTL.ZS",     # Unemployment (% labour force, ILO)
    "life_exp":        "SP.DYN.LE00.IN",     # Life expectancy at birth
}

MAX_LOOKBACK_YEARS = 6  # accept the most recent value within this many years


def load(name):
    with open(DATA / name, encoding="utf-8") as f:
        return json.load(f)


def save(name, obj):
    with open(DATA / name, "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, indent=2)
        f.write("\n")


def fetch_wb(iso3, code):
    """Return (value, year) for the most recent non-null observation, or None."""
    url = (f"https://api.worldbank.org/v2/country/{iso3}/indicator/{code}"
           f"?format=json&per_page=20&mrnev=1")
    try:
        with urllib.request.urlopen(url, timeout=30) as r:
            payload = json.load(r)
    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as e:
        print(f"    ! network/parse problem for {iso3}/{code}: {e}")
        return None
    if not isinstance(payload, list) or len(payload) < 2 or not payload[1]:
        return None
    obs = payload[1][0]
    if obs.get("value") is None:
        return None
    year = int(obs["date"])
    if datetime.date.today().year - year > MAX_LOOKBACK_YEARS:
        print(f"    ! {iso3}/{code}: newest value is from {year}; too old, skipped")
        return None
    return float(obs["value"]), year


def update_from_world_bank(dry_run=False):
    countries = load("countries.json")["countries"]
    iv = load("indicator_values.json")
    changed = 0
    for c in countries:
        iso3 = c["iso3"]
        print(f"  {c['name']} ({iso3})")
        iv["values"].setdefault(iso3, {})
        for ind, code in WB_INDICATORS.items():
            res = fetch_wb(iso3, code)
            if res is None:
                continue
            value, year = res
            if ind == "population":
                value = round(value / 1_000_000, 2)
            else:
                value = round(value, 2)
            old = iv["values"][iso3].get(ind)
            new = {"v": value, "y": year, "s": "reported"}
            if old != new:
                changed += 1
                print(f"    {ind}: {old} -> {new}")
                if not dry_run:
                    iv["values"][iso3][ind] = new
    if not dry_run and changed:
        iv["last_updated"] = datetime.date.today().isoformat()
        iv["dataset_label"] = ("Mixed dataset — World Bank indicators fetched from the API; "
                               "other sources still approximate/sample")
        save("indicator_values.json", iv)
    print(f"World Bank refresh: {changed} value(s) {'would be ' if dry_run else ''}updated.")


def regenerate_embedded():
    data = {
        "countries": load("countries.json"),
        "indicator_values": load("indicator_values.json"),
        "exports": load("exports.json"),
        "methodology": load("methodology.json"),
        "sources": load("sources.json"),
    }
    banner = (
        "/* AUTO-GENERATED — do not edit by hand.\n"
        "   Copy of the JSON files in /data, wrapped as JavaScript so the dashboard\n"
        "   also works when index.html is opened directly from a local folder (file://).\n"
        "   Regenerate with: python3 scripts/update_data.py --embed-only\n"
        f"   Generated: {datetime.date.today().isoformat()} */\n"
    )
    out = DATA / "embedded_data.js"
    with open(out, "w", encoding="utf-8") as f:
        f.write(banner)
        f.write("window.EMBEDDED_DATA = ")
        json.dump(data, f, ensure_ascii=False, indent=1)
        f.write(";\n")
    print(f"Regenerated {out.relative_to(ROOT)}")


def main():
    args = set(sys.argv[1:])
    if not (DATA / "countries.json").exists():
        sys.exit("Run this from the project folder (data/countries.json not found).")
    if "--embed-only" not in args:
        print("Fetching latest World Bank values (free API, no key)…")
        update_from_world_bank(dry_run="--dry-run" in args)
    if "--dry-run" not in args:
        regenerate_embedded()
    print("Done. Review the changes, then upload the modified files in /data to GitHub.")


if __name__ == "__main__":
    main()
