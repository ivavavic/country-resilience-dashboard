/* AUTO-GENERATED — do not edit by hand.
   Copy of the JSON files in /data, wrapped as JavaScript so the dashboard
   also works when index.html is opened directly from a local folder (file://).
   Regenerate with: python3 scripts/update_data.py --embed-only
   Generated: 2026-07-06 */
window.EMBEDDED_DATA = {
 "countries": {
  "_comment": "Country metadata for the prototype. Income groups follow World Bank FY2025 classifications (approximate, verify before citing). iso_n is the ISO 3166-1 numeric code used to match countries on the world map.",
  "countries": [
   {
    "iso3": "SRB",
    "iso_n": "688",
    "name": "Serbia",
    "region": "Europe & Central Asia",
    "income_group": "Upper middle income",
    "marker": false
   },
   {
    "iso3": "MDA",
    "iso_n": "498",
    "name": "Moldova",
    "region": "Europe & Central Asia",
    "income_group": "Upper middle income",
    "marker": false
   },
   {
    "iso3": "KOR",
    "iso_n": "410",
    "name": "South Korea",
    "region": "East Asia & Pacific",
    "income_group": "High income",
    "marker": false
   },
   {
    "iso3": "CHN",
    "iso_n": "156",
    "name": "China",
    "region": "East Asia & Pacific",
    "income_group": "Upper middle income",
    "marker": false
   },
   {
    "iso3": "JPN",
    "iso_n": "392",
    "name": "Japan",
    "region": "East Asia & Pacific",
    "income_group": "High income",
    "marker": false
   },
   {
    "iso3": "DEU",
    "iso_n": "276",
    "name": "Germany",
    "region": "Europe & Central Asia",
    "income_group": "High income",
    "marker": false
   },
   {
    "iso3": "USA",
    "iso_n": "840",
    "name": "United States",
    "region": "North America",
    "income_group": "High income",
    "marker": false
   },
   {
    "iso3": "BRA",
    "iso_n": "076",
    "name": "Brazil",
    "region": "Latin America & Caribbean",
    "income_group": "Upper middle income",
    "marker": false
   },
   {
    "iso3": "NGA",
    "iso_n": "566",
    "name": "Nigeria",
    "region": "Sub-Saharan Africa",
    "income_group": "Lower middle income",
    "marker": false
   },
   {
    "iso3": "SGP",
    "iso_n": "702",
    "name": "Singapore",
    "region": "East Asia & Pacific",
    "income_group": "High income",
    "marker": true,
    "marker_coords": [
     103.82,
     1.35
    ]
   }
  ]
 },
 "indicator_values": {
  "_comment": "Main indicator dataset. Every value carries: v = value, y = reference year, s = status, u = last-updated date (when set by the pipeline). Status codes: 'api_reported' = fetched automatically from the source API by scripts/update_data.py; 'reported' = verified by hand against the official source; 'manual_approx' = transcribed by hand from public sources, approximately correct but NOT verified; 'sample' = illustrative placeholder for demonstration only. Missing values are simply absent — never imputed. The monthly pipeline upgrades WDI, IMF, WGI and HDR values to 'api_reported'; see data/update_status.json for what is and is not automated.",
  "dataset_status": "manual_snapshot",
  "dataset_label": "Manual snapshot — pipeline not yet run; World Bank, IMF, WGI and HDR values upgrade to api_reported on the first automated update",
  "last_updated": "2026-07-05",
  "indicators": {
   "gni_pc": {
    "name": "GNI per capita (Atlas method)",
    "unit": "current US$",
    "fmt": "usd0",
    "direction": "pos",
    "pillar": "income",
    "scored": true,
    "source": "wb_wdi",
    "desc": "Gross national income per person, Atlas method. The World Bank's headline income measure."
   },
   "gdp_pc": {
    "name": "GDP per capita",
    "unit": "current US$",
    "fmt": "usd0",
    "direction": "pos",
    "pillar": "income",
    "scored": true,
    "source": "wb_wdi",
    "desc": "Gross domestic product divided by mid-year population."
   },
   "gdp_growth": {
    "name": "GDP growth",
    "unit": "% per year",
    "fmt": "pct1",
    "direction": "pos",
    "pillar": "income",
    "scored": true,
    "source": "wb_wdi",
    "desc": "Annual real GDP growth."
   },
   "inflation": {
    "name": "Inflation (CPI)",
    "unit": "% per year",
    "fmt": "pct1",
    "direction": "neg",
    "pillar": "income",
    "scored": true,
    "source": "wb_wdi",
    "desc": "Consumer price inflation; high inflation erodes real incomes and signals macro instability."
   },
   "population": {
    "name": "Population",
    "unit": "millions",
    "fmt": "pop",
    "direction": "context",
    "pillar": "income",
    "scored": false,
    "source": "wb_wdi",
    "desc": "Mid-year population. Shown for context; not scored."
   },
   "pop_growth": {
    "name": "Population growth",
    "unit": "% per year",
    "fmt": "pct1",
    "direction": "context",
    "pillar": "income",
    "scored": false,
    "source": "wb_wdi",
    "desc": "Annual population growth. Shown for context; both rapid growth and rapid decline create policy challenges, so it is not scored."
   },
   "debt_gdp": {
    "name": "General government gross debt",
    "unit": "% of GDP",
    "fmt": "pct1",
    "direction": "neg",
    "pillar": "fiscal",
    "scored": true,
    "source": "imf_weo",
    "desc": "Public debt stock relative to the size of the economy."
   },
   "fiscal_balance": {
    "name": "General government fiscal balance",
    "unit": "% of GDP",
    "fmt": "pct1s",
    "direction": "pos",
    "pillar": "fiscal",
    "scored": true,
    "source": "imf_weo",
    "desc": "Overall budget surplus (+) or deficit (−)."
   },
   "interest_rev": {
    "name": "Interest payments",
    "unit": "% of gov. revenue",
    "fmt": "pct1",
    "direction": "neg",
    "pillar": "fiscal",
    "scored": true,
    "source": "imf_weo",
    "desc": "Share of government revenue absorbed by interest payments; a direct measure of debt-service pressure. Sparse in this prototype."
   },
   "current_account": {
    "name": "Current account balance",
    "unit": "% of GDP",
    "fmt": "pct1s",
    "direction": "pos",
    "pillar": "external",
    "scored": true,
    "source": "imf_weo",
    "desc": "External balance on goods, services and income. Persistent deficits can signal external vulnerability."
   },
   "reserves_months": {
    "name": "Reserves (import cover)",
    "unit": "months of imports",
    "fmt": "num1",
    "direction": "pos",
    "pillar": "external",
    "scored": true,
    "source": "imf_weo",
    "desc": "Foreign-exchange reserves expressed in months of imports. Less meaningful for reserve-currency issuers (US, euro area), where it is left blank."
   },
   "remittances_gdp": {
    "name": "Personal remittances received",
    "unit": "% of GDP",
    "fmt": "pct1",
    "direction": "neg",
    "pillar": "external",
    "scored": true,
    "source": "wb_wdi",
    "desc": "Remittance inflows. Vital income support, but heavy dependence signals reliance on external labour markets."
   },
   "export_conc": {
    "name": "Export concentration (HHI)",
    "unit": "index 0–1",
    "fmt": "num2",
    "direction": "neg",
    "pillar": "productive",
    "scored": true,
    "source": "oec",
    "desc": "Herfindahl–Hirschman index of export products. Higher = exports concentrated in few products."
   },
   "eci": {
    "name": "Economic Complexity Index",
    "unit": "index",
    "fmt": "num2s",
    "direction": "pos",
    "pillar": "productive",
    "scored": true,
    "source": "oec",
    "desc": "Measure of the knowledge intensity and diversity of a country's export basket."
   },
   "hdi": {
    "name": "Human Development Index",
    "unit": "index 0–1",
    "fmt": "num3",
    "direction": "pos",
    "pillar": "human",
    "scored": true,
    "source": "undp_hdr",
    "desc": "UNDP composite of health, education and income."
   },
   "life_exp": {
    "name": "Life expectancy at birth",
    "unit": "years",
    "fmt": "num1",
    "direction": "pos",
    "pillar": "human",
    "scored": true,
    "source": "wb_wdi",
    "desc": "Expected years of life at birth."
   },
   "school_exp": {
    "name": "Expected years of schooling",
    "unit": "years",
    "fmt": "num1",
    "direction": "pos",
    "pillar": "human",
    "scored": true,
    "source": "undp_hdr",
    "desc": "Years of schooling a child entering school can expect to receive."
   },
   "poverty": {
    "name": "Poverty headcount ($6.85/day, 2017 PPP)",
    "unit": "% of population",
    "fmt": "pct1",
    "direction": "neg",
    "pillar": "human",
    "scored": true,
    "source": "wb_wdi",
    "desc": "Share of population below the upper-middle-income poverty line."
   },
   "gini": {
    "name": "Gini index",
    "unit": "0–100",
    "fmt": "num1",
    "direction": "neg",
    "pillar": "human",
    "scored": true,
    "source": "wb_wdi",
    "desc": "Income inequality; 0 = perfect equality."
   },
   "unemployment": {
    "name": "Unemployment rate",
    "unit": "% of labour force",
    "fmt": "pct1",
    "direction": "neg",
    "pillar": "human",
    "scored": true,
    "source": "wb_wdi",
    "desc": "ILO-modelled unemployment. National definitions differ (e.g. Nigeria revised its methodology in 2023)."
   },
   "gov_eff": {
    "name": "Government effectiveness",
    "unit": "percentile rank",
    "fmt": "num0",
    "direction": "pos",
    "pillar": "governance",
    "scored": true,
    "source": "wb_wgi",
    "desc": "World Bank Worldwide Governance Indicators percentile rank (0–100). Perceptions-based; use with caution."
   },
   "rule_law": {
    "name": "Rule of law",
    "unit": "percentile rank",
    "fmt": "num0",
    "direction": "pos",
    "pillar": "governance",
    "scored": true,
    "source": "wb_wgi",
    "desc": "WGI percentile rank (0–100). Perceptions-based; use with caution."
   }
  },
  "values": {
   "SRB": {
    "gni_pc": {
     "v": 10140,
     "y": 2023,
     "s": "manual_approx"
    },
    "gdp_pc": {
     "v": 11360,
     "y": 2023,
     "s": "manual_approx"
    },
    "gdp_growth": {
     "v": 2.5,
     "y": 2023,
     "s": "manual_approx"
    },
    "inflation": {
     "v": 12.4,
     "y": 2023,
     "s": "manual_approx"
    },
    "population": {
     "v": 6.62,
     "y": 2023,
     "s": "manual_approx"
    },
    "pop_growth": {
     "v": -0.7,
     "y": 2023,
     "s": "manual_approx"
    },
    "debt_gdp": {
     "v": 52.3,
     "y": 2023,
     "s": "manual_approx"
    },
    "fiscal_balance": {
     "v": -2.2,
     "y": 2023,
     "s": "manual_approx"
    },
    "current_account": {
     "v": -2.6,
     "y": 2023,
     "s": "manual_approx"
    },
    "reserves_months": {
     "v": 6.1,
     "y": 2023,
     "s": "sample"
    },
    "remittances_gdp": {
     "v": 5.9,
     "y": 2023,
     "s": "manual_approx"
    },
    "export_conc": {
     "v": 0.08,
     "y": 2022,
     "s": "manual_approx"
    },
    "eci": {
     "v": 0.95,
     "y": 2022,
     "s": "manual_approx"
    },
    "hdi": {
     "v": 0.805,
     "y": 2022,
     "s": "manual_approx"
    },
    "life_exp": {
     "v": 74.2,
     "y": 2022,
     "s": "manual_approx"
    },
    "school_exp": {
     "v": 14.4,
     "y": 2022,
     "s": "manual_approx"
    },
    "poverty": {
     "v": 7.5,
     "y": 2021,
     "s": "manual_approx"
    },
    "gini": {
     "v": 33.1,
     "y": 2021,
     "s": "manual_approx"
    },
    "unemployment": {
     "v": 9.4,
     "y": 2023,
     "s": "manual_approx"
    },
    "gov_eff": {
     "v": 52,
     "y": 2022,
     "s": "manual_approx"
    },
    "rule_law": {
     "v": 47,
     "y": 2022,
     "s": "manual_approx"
    }
   },
   "MDA": {
    "gni_pc": {
     "v": 6110,
     "y": 2023,
     "s": "manual_approx"
    },
    "gdp_pc": {
     "v": 6650,
     "y": 2023,
     "s": "manual_approx"
    },
    "gdp_growth": {
     "v": 0.7,
     "y": 2023,
     "s": "manual_approx"
    },
    "inflation": {
     "v": 13.4,
     "y": 2023,
     "s": "manual_approx"
    },
    "population": {
     "v": 2.49,
     "y": 2023,
     "s": "manual_approx"
    },
    "pop_growth": {
     "v": -1.1,
     "y": 2023,
     "s": "manual_approx"
    },
    "debt_gdp": {
     "v": 35.2,
     "y": 2023,
     "s": "manual_approx"
    },
    "fiscal_balance": {
     "v": -5.2,
     "y": 2023,
     "s": "manual_approx"
    },
    "current_account": {
     "v": -11.9,
     "y": 2023,
     "s": "manual_approx"
    },
    "reserves_months": {
     "v": 5.4,
     "y": 2023,
     "s": "sample"
    },
    "remittances_gdp": {
     "v": 11.5,
     "y": 2023,
     "s": "manual_approx"
    },
    "export_conc": {
     "v": 0.12,
     "y": 2022,
     "s": "manual_approx"
    },
    "eci": {
     "v": 0.05,
     "y": 2022,
     "s": "sample"
    },
    "hdi": {
     "v": 0.763,
     "y": 2022,
     "s": "manual_approx"
    },
    "life_exp": {
     "v": 71.9,
     "y": 2022,
     "s": "manual_approx"
    },
    "school_exp": {
     "v": 14.4,
     "y": 2022,
     "s": "manual_approx"
    },
    "poverty": {
     "v": 13.0,
     "y": 2021,
     "s": "manual_approx"
    },
    "gini": {
     "v": 25.7,
     "y": 2022,
     "s": "manual_approx"
    },
    "unemployment": {
     "v": 4.6,
     "y": 2023,
     "s": "manual_approx"
    },
    "gov_eff": {
     "v": 38,
     "y": 2022,
     "s": "manual_approx"
    },
    "rule_law": {
     "v": 42,
     "y": 2022,
     "s": "manual_approx"
    }
   },
   "KOR": {
    "gni_pc": {
     "v": 35490,
     "y": 2023,
     "s": "manual_approx"
    },
    "gdp_pc": {
     "v": 33120,
     "y": 2023,
     "s": "manual_approx"
    },
    "gdp_growth": {
     "v": 1.4,
     "y": 2023,
     "s": "manual_approx"
    },
    "inflation": {
     "v": 3.6,
     "y": 2023,
     "s": "manual_approx"
    },
    "population": {
     "v": 51.7,
     "y": 2023,
     "s": "manual_approx"
    },
    "pop_growth": {
     "v": -0.1,
     "y": 2023,
     "s": "manual_approx"
    },
    "debt_gdp": {
     "v": 55.2,
     "y": 2023,
     "s": "manual_approx"
    },
    "fiscal_balance": {
     "v": -1.0,
     "y": 2023,
     "s": "manual_approx"
    },
    "current_account": {
     "v": 2.0,
     "y": 2023,
     "s": "manual_approx"
    },
    "reserves_months": {
     "v": 6.3,
     "y": 2023,
     "s": "sample"
    },
    "remittances_gdp": {
     "v": 0.4,
     "y": 2023,
     "s": "manual_approx"
    },
    "export_conc": {
     "v": 0.14,
     "y": 2022,
     "s": "manual_approx"
    },
    "eci": {
     "v": 2.11,
     "y": 2022,
     "s": "manual_approx"
    },
    "hdi": {
     "v": 0.929,
     "y": 2022,
     "s": "manual_approx"
    },
    "life_exp": {
     "v": 83.6,
     "y": 2022,
     "s": "manual_approx"
    },
    "school_exp": {
     "v": 16.5,
     "y": 2022,
     "s": "manual_approx"
    },
    "poverty": {
     "v": 0.5,
     "y": 2021,
     "s": "sample"
    },
    "gini": {
     "v": 31.4,
     "y": 2021,
     "s": "manual_approx"
    },
    "unemployment": {
     "v": 2.7,
     "y": 2023,
     "s": "manual_approx"
    },
    "gov_eff": {
     "v": 87,
     "y": 2022,
     "s": "manual_approx"
    },
    "rule_law": {
     "v": 86,
     "y": 2022,
     "s": "manual_approx"
    }
   },
   "CHN": {
    "gni_pc": {
     "v": 13400,
     "y": 2023,
     "s": "manual_approx"
    },
    "gdp_pc": {
     "v": 12610,
     "y": 2023,
     "s": "manual_approx"
    },
    "gdp_growth": {
     "v": 5.2,
     "y": 2023,
     "s": "manual_approx"
    },
    "inflation": {
     "v": 0.2,
     "y": 2023,
     "s": "manual_approx"
    },
    "population": {
     "v": 1410.7,
     "y": 2023,
     "s": "manual_approx"
    },
    "pop_growth": {
     "v": -0.1,
     "y": 2023,
     "s": "manual_approx"
    },
    "debt_gdp": {
     "v": 83.6,
     "y": 2023,
     "s": "manual_approx"
    },
    "fiscal_balance": {
     "v": -4.6,
     "y": 2023,
     "s": "manual_approx"
    },
    "current_account": {
     "v": 1.4,
     "y": 2023,
     "s": "manual_approx"
    },
    "reserves_months": {
     "v": 13.9,
     "y": 2023,
     "s": "sample"
    },
    "remittances_gdp": {
     "v": 0.2,
     "y": 2023,
     "s": "manual_approx"
    },
    "export_conc": {
     "v": 0.08,
     "y": 2022,
     "s": "manual_approx"
    },
    "eci": {
     "v": 1.3,
     "y": 2022,
     "s": "manual_approx"
    },
    "hdi": {
     "v": 0.788,
     "y": 2022,
     "s": "manual_approx"
    },
    "life_exp": {
     "v": 78.6,
     "y": 2022,
     "s": "manual_approx"
    },
    "school_exp": {
     "v": 15.2,
     "y": 2022,
     "s": "sample"
    },
    "poverty": {
     "v": 17.0,
     "y": 2021,
     "s": "sample"
    },
    "gini": {
     "v": 35.7,
     "y": 2021,
     "s": "manual_approx"
    },
    "unemployment": {
     "v": 5.2,
     "y": 2023,
     "s": "manual_approx"
    },
    "gov_eff": {
     "v": 74,
     "y": 2022,
     "s": "manual_approx"
    },
    "rule_law": {
     "v": 47,
     "y": 2022,
     "s": "manual_approx"
    }
   },
   "JPN": {
    "gni_pc": {
     "v": 39030,
     "y": 2023,
     "s": "manual_approx"
    },
    "gdp_pc": {
     "v": 33830,
     "y": 2023,
     "s": "manual_approx"
    },
    "gdp_growth": {
     "v": 1.9,
     "y": 2023,
     "s": "manual_approx"
    },
    "inflation": {
     "v": 3.3,
     "y": 2023,
     "s": "manual_approx"
    },
    "population": {
     "v": 124.5,
     "y": 2023,
     "s": "manual_approx"
    },
    "pop_growth": {
     "v": -0.5,
     "y": 2023,
     "s": "manual_approx"
    },
    "debt_gdp": {
     "v": 252.4,
     "y": 2023,
     "s": "manual_approx"
    },
    "fiscal_balance": {
     "v": -5.2,
     "y": 2023,
     "s": "manual_approx"
    },
    "current_account": {
     "v": 3.6,
     "y": 2023,
     "s": "manual_approx"
    },
    "reserves_months": {
     "v": 16.0,
     "y": 2023,
     "s": "sample"
    },
    "remittances_gdp": {
     "v": 0.1,
     "y": 2023,
     "s": "manual_approx"
    },
    "export_conc": {
     "v": 0.1,
     "y": 2022,
     "s": "manual_approx"
    },
    "eci": {
     "v": 2.3,
     "y": 2022,
     "s": "manual_approx"
    },
    "hdi": {
     "v": 0.92,
     "y": 2022,
     "s": "manual_approx"
    },
    "life_exp": {
     "v": 84.5,
     "y": 2022,
     "s": "manual_approx"
    },
    "school_exp": {
     "v": 15.2,
     "y": 2022,
     "s": "manual_approx"
    },
    "poverty": {
     "v": 0.7,
     "y": 2018,
     "s": "sample"
    },
    "gini": {
     "v": 32.9,
     "y": 2018,
     "s": "manual_approx"
    },
    "unemployment": {
     "v": 2.6,
     "y": 2023,
     "s": "manual_approx"
    },
    "gov_eff": {
     "v": 92,
     "y": 2022,
     "s": "manual_approx"
    },
    "rule_law": {
     "v": 90,
     "y": 2022,
     "s": "manual_approx"
    }
   },
   "DEU": {
    "gni_pc": {
     "v": 53970,
     "y": 2023,
     "s": "manual_approx"
    },
    "gdp_pc": {
     "v": 52750,
     "y": 2023,
     "s": "manual_approx"
    },
    "gdp_growth": {
     "v": -0.3,
     "y": 2023,
     "s": "manual_approx"
    },
    "inflation": {
     "v": 5.9,
     "y": 2023,
     "s": "manual_approx"
    },
    "population": {
     "v": 84.5,
     "y": 2023,
     "s": "manual_approx"
    },
    "pop_growth": {
     "v": 0.3,
     "y": 2023,
     "s": "manual_approx"
    },
    "debt_gdp": {
     "v": 62.9,
     "y": 2023,
     "s": "manual_approx"
    },
    "fiscal_balance": {
     "v": -2.5,
     "y": 2023,
     "s": "manual_approx"
    },
    "current_account": {
     "v": 6.2,
     "y": 2023,
     "s": "manual_approx"
    },
    "remittances_gdp": {
     "v": 0.5,
     "y": 2023,
     "s": "manual_approx"
    },
    "export_conc": {
     "v": 0.09,
     "y": 2022,
     "s": "manual_approx"
    },
    "eci": {
     "v": 1.95,
     "y": 2022,
     "s": "manual_approx"
    },
    "hdi": {
     "v": 0.95,
     "y": 2022,
     "s": "manual_approx"
    },
    "life_exp": {
     "v": 80.7,
     "y": 2022,
     "s": "manual_approx"
    },
    "school_exp": {
     "v": 17.0,
     "y": 2022,
     "s": "manual_approx"
    },
    "poverty": {
     "v": 0.2,
     "y": 2020,
     "s": "sample"
    },
    "gini": {
     "v": 31.7,
     "y": 2020,
     "s": "manual_approx"
    },
    "unemployment": {
     "v": 3.0,
     "y": 2023,
     "s": "manual_approx"
    },
    "gov_eff": {
     "v": 89,
     "y": 2022,
     "s": "manual_approx"
    },
    "rule_law": {
     "v": 91,
     "y": 2022,
     "s": "manual_approx"
    }
   },
   "USA": {
    "gni_pc": {
     "v": 80300,
     "y": 2023,
     "s": "manual_approx"
    },
    "gdp_pc": {
     "v": 81700,
     "y": 2023,
     "s": "manual_approx"
    },
    "gdp_growth": {
     "v": 2.9,
     "y": 2023,
     "s": "manual_approx"
    },
    "inflation": {
     "v": 4.1,
     "y": 2023,
     "s": "manual_approx"
    },
    "population": {
     "v": 334.9,
     "y": 2023,
     "s": "manual_approx"
    },
    "pop_growth": {
     "v": 0.5,
     "y": 2023,
     "s": "manual_approx"
    },
    "debt_gdp": {
     "v": 122.1,
     "y": 2023,
     "s": "manual_approx"
    },
    "fiscal_balance": {
     "v": -8.8,
     "y": 2023,
     "s": "manual_approx"
    },
    "interest_rev": {
     "v": 14.5,
     "y": 2023,
     "s": "sample"
    },
    "current_account": {
     "v": -3.0,
     "y": 2023,
     "s": "manual_approx"
    },
    "remittances_gdp": {
     "v": 0.03,
     "y": 2023,
     "s": "manual_approx"
    },
    "export_conc": {
     "v": 0.07,
     "y": 2022,
     "s": "manual_approx"
    },
    "eci": {
     "v": 1.55,
     "y": 2022,
     "s": "manual_approx"
    },
    "hdi": {
     "v": 0.927,
     "y": 2022,
     "s": "manual_approx"
    },
    "life_exp": {
     "v": 77.4,
     "y": 2022,
     "s": "manual_approx"
    },
    "school_exp": {
     "v": 16.3,
     "y": 2022,
     "s": "manual_approx"
    },
    "poverty": {
     "v": 1.2,
     "y": 2021,
     "s": "sample"
    },
    "gini": {
     "v": 41.3,
     "y": 2021,
     "s": "manual_approx"
    },
    "unemployment": {
     "v": 3.6,
     "y": 2023,
     "s": "manual_approx"
    },
    "gov_eff": {
     "v": 85,
     "y": 2022,
     "s": "manual_approx"
    },
    "rule_law": {
     "v": 89,
     "y": 2022,
     "s": "manual_approx"
    }
   },
   "BRA": {
    "gni_pc": {
     "v": 8720,
     "y": 2023,
     "s": "manual_approx"
    },
    "gdp_pc": {
     "v": 10040,
     "y": 2023,
     "s": "manual_approx"
    },
    "gdp_growth": {
     "v": 2.9,
     "y": 2023,
     "s": "manual_approx"
    },
    "inflation": {
     "v": 4.6,
     "y": 2023,
     "s": "manual_approx"
    },
    "population": {
     "v": 216.4,
     "y": 2023,
     "s": "manual_approx"
    },
    "pop_growth": {
     "v": 0.5,
     "y": 2023,
     "s": "manual_approx"
    },
    "debt_gdp": {
     "v": 84.7,
     "y": 2023,
     "s": "manual_approx"
    },
    "fiscal_balance": {
     "v": -8.0,
     "y": 2023,
     "s": "manual_approx"
    },
    "current_account": {
     "v": -1.4,
     "y": 2023,
     "s": "manual_approx"
    },
    "reserves_months": {
     "v": 11.0,
     "y": 2023,
     "s": "sample"
    },
    "remittances_gdp": {
     "v": 0.3,
     "y": 2023,
     "s": "manual_approx"
    },
    "export_conc": {
     "v": 0.15,
     "y": 2022,
     "s": "manual_approx"
    },
    "eci": {
     "v": 0.05,
     "y": 2022,
     "s": "sample"
    },
    "hdi": {
     "v": 0.76,
     "y": 2022,
     "s": "manual_approx"
    },
    "life_exp": {
     "v": 75.5,
     "y": 2022,
     "s": "manual_approx"
    },
    "school_exp": {
     "v": 15.6,
     "y": 2022,
     "s": "manual_approx"
    },
    "poverty": {
     "v": 23.5,
     "y": 2022,
     "s": "manual_approx"
    },
    "gini": {
     "v": 52.0,
     "y": 2022,
     "s": "manual_approx"
    },
    "unemployment": {
     "v": 8.0,
     "y": 2023,
     "s": "manual_approx"
    },
    "gov_eff": {
     "v": 45,
     "y": 2022,
     "s": "manual_approx"
    },
    "rule_law": {
     "v": 48,
     "y": 2022,
     "s": "manual_approx"
    }
   },
   "NGA": {
    "gni_pc": {
     "v": 1930,
     "y": 2023,
     "s": "manual_approx"
    },
    "gdp_pc": {
     "v": 1620,
     "y": 2023,
     "s": "manual_approx"
    },
    "gdp_growth": {
     "v": 2.9,
     "y": 2023,
     "s": "manual_approx"
    },
    "inflation": {
     "v": 24.7,
     "y": 2023,
     "s": "manual_approx"
    },
    "population": {
     "v": 223.8,
     "y": 2023,
     "s": "manual_approx"
    },
    "pop_growth": {
     "v": 2.4,
     "y": 2023,
     "s": "manual_approx"
    },
    "debt_gdp": {
     "v": 46.3,
     "y": 2023,
     "s": "manual_approx"
    },
    "fiscal_balance": {
     "v": -4.2,
     "y": 2023,
     "s": "manual_approx"
    },
    "interest_rev": {
     "v": 35.0,
     "y": 2023,
     "s": "sample"
    },
    "current_account": {
     "v": 1.7,
     "y": 2023,
     "s": "manual_approx"
    },
    "reserves_months": {
     "v": 6.0,
     "y": 2023,
     "s": "sample"
    },
    "remittances_gdp": {
     "v": 5.4,
     "y": 2023,
     "s": "manual_approx"
    },
    "export_conc": {
     "v": 0.52,
     "y": 2022,
     "s": "manual_approx"
    },
    "eci": {
     "v": -1.65,
     "y": 2022,
     "s": "manual_approx"
    },
    "hdi": {
     "v": 0.548,
     "y": 2022,
     "s": "manual_approx"
    },
    "life_exp": {
     "v": 53.6,
     "y": 2022,
     "s": "manual_approx"
    },
    "school_exp": {
     "v": 10.5,
     "y": 2022,
     "s": "sample"
    },
    "poverty": {
     "v": 91.0,
     "y": 2018,
     "s": "manual_approx"
    },
    "gini": {
     "v": 35.1,
     "y": 2018,
     "s": "manual_approx"
    },
    "unemployment": {
     "v": 4.1,
     "y": 2023,
     "s": "manual_approx"
    },
    "gov_eff": {
     "v": 14,
     "y": 2022,
     "s": "manual_approx"
    },
    "rule_law": {
     "v": 17,
     "y": 2022,
     "s": "manual_approx"
    }
   },
   "SGP": {
    "gni_pc": {
     "v": 67200,
     "y": 2023,
     "s": "manual_approx"
    },
    "gdp_pc": {
     "v": 84730,
     "y": 2023,
     "s": "manual_approx"
    },
    "gdp_growth": {
     "v": 1.1,
     "y": 2023,
     "s": "manual_approx"
    },
    "inflation": {
     "v": 4.8,
     "y": 2023,
     "s": "manual_approx"
    },
    "population": {
     "v": 5.92,
     "y": 2023,
     "s": "manual_approx"
    },
    "pop_growth": {
     "v": 0.7,
     "y": 2023,
     "s": "manual_approx"
    },
    "debt_gdp": {
     "v": 168.0,
     "y": 2023,
     "s": "manual_approx"
    },
    "fiscal_balance": {
     "v": 0.3,
     "y": 2023,
     "s": "manual_approx"
    },
    "current_account": {
     "v": 19.8,
     "y": 2023,
     "s": "manual_approx"
    },
    "reserves_months": {
     "v": 5.0,
     "y": 2023,
     "s": "sample"
    },
    "export_conc": {
     "v": 0.16,
     "y": 2022,
     "s": "manual_approx"
    },
    "eci": {
     "v": 1.85,
     "y": 2022,
     "s": "manual_approx"
    },
    "hdi": {
     "v": 0.949,
     "y": 2022,
     "s": "manual_approx"
    },
    "life_exp": {
     "v": 83.0,
     "y": 2022,
     "s": "manual_approx"
    },
    "school_exp": {
     "v": 16.5,
     "y": 2022,
     "s": "sample"
    },
    "unemployment": {
     "v": 1.9,
     "y": 2023,
     "s": "manual_approx"
    },
    "gov_eff": {
     "v": 100,
     "y": 2022,
     "s": "manual_approx"
    },
    "rule_law": {
     "v": 97,
     "y": 2022,
     "s": "manual_approx"
    }
   }
  },
  "notes": {
   "SGP": "Singapore's gross government debt is issued to develop the domestic bond market and is matched by financial assets; the headline debt ratio overstates fiscal risk. No World Bank poverty or Gini estimates are available.",
   "JPN": "Japan's very high gross debt is largely domestically held and yen-denominated, which reduces (but does not eliminate) rollover risk. The composite score treats debt mechanically; read it with this context.",
   "NGA": "Nigeria's unemployment rate reflects a 2023 methodology revision and is not comparable with earlier series. The interest-to-revenue figure is an illustrative placeholder.",
   "MDA": "Moldova's indicators reflect the shock of the war in neighbouring Ukraine (energy prices, refugee inflows, trade disruption)."
  }
 },
 "exports": {
  "_comment": "PROTOTYPE trade structure data. Product and destination shares are approximate figures transcribed from public OEC (Observatory of Economic Complexity) profiles for reference year ~2022. Status 'approx' = roughly consistent with public data but not verified; 'sample' = illustrative placeholder. Do not cite these shares.",
  "dataset_status": "sample",
  "reference_year": 2022,
  "source": "oec",
  "countries": {
   "SRB": {
    "status": "approx",
    "top_products": [
     {
      "name": "Insulated wire & cable",
      "share": 4.8
     },
     {
      "name": "Electric motors & machinery",
      "share": 3.4
     },
     {
      "name": "Rubber tires",
      "share": 3.0
     },
     {
      "name": "Maize (corn)",
      "share": 2.9
     },
     {
      "name": "Refined copper & ores",
      "share": 2.7
     }
    ],
    "top_destinations": [
     {
      "name": "Germany",
      "share": 13.0
     },
     {
      "name": "Italy",
      "share": 8.0
     },
     {
      "name": "Bosnia & Herzegovina",
      "share": 7.0
     },
     {
      "name": "Hungary",
      "share": 6.0
     },
     {
      "name": "Romania",
      "share": 5.0
     }
    ]
   },
   "MDA": {
    "status": "approx",
    "top_products": [
     {
      "name": "Insulated wire (vehicle wiring)",
      "share": 14.0
     },
     {
      "name": "Sunflower seeds & seed oils",
      "share": 12.0
     },
     {
      "name": "Wine",
      "share": 6.0
     },
     {
      "name": "Maize (corn)",
      "share": 5.5
     },
     {
      "name": "Wheat",
      "share": 4.5
     }
    ],
    "top_destinations": [
     {
      "name": "Romania",
      "share": 34.0
     },
     {
      "name": "Ukraine",
      "share": 10.0
     },
     {
      "name": "Italy",
      "share": 8.0
     },
     {
      "name": "Germany",
      "share": 6.0
     },
     {
      "name": "Türkiye",
      "share": 5.0
     }
    ]
   },
   "KOR": {
    "status": "approx",
    "top_products": [
     {
      "name": "Integrated circuits",
      "share": 15.0
     },
     {
      "name": "Cars",
      "share": 8.5
     },
     {
      "name": "Refined petroleum",
      "share": 7.0
     },
     {
      "name": "Vehicle parts",
      "share": 3.5
     },
     {
      "name": "Ships & vessels",
      "share": 3.0
     }
    ],
    "top_destinations": [
     {
      "name": "China",
      "share": 22.0
     },
     {
      "name": "United States",
      "share": 16.0
     },
     {
      "name": "Vietnam",
      "share": 9.0
     },
     {
      "name": "Japan",
      "share": 4.5
     },
     {
      "name": "Hong Kong",
      "share": 4.0
     }
    ]
   },
   "CHN": {
    "status": "approx",
    "top_products": [
     {
      "name": "Phones & broadcasting equipment",
      "share": 5.5
     },
     {
      "name": "Computers",
      "share": 5.0
     },
     {
      "name": "Integrated circuits",
      "share": 4.0
     },
     {
      "name": "Batteries & accumulators",
      "share": 2.5
     },
     {
      "name": "Textiles & apparel",
      "share": 2.5
     }
    ],
    "top_destinations": [
     {
      "name": "United States",
      "share": 16.0
     },
     {
      "name": "Hong Kong",
      "share": 8.0
     },
     {
      "name": "Japan",
      "share": 4.8
     },
     {
      "name": "South Korea",
      "share": 4.5
     },
     {
      "name": "Vietnam",
      "share": 4.0
     }
    ]
   },
   "JPN": {
    "status": "approx",
    "top_products": [
     {
      "name": "Cars",
      "share": 13.0
     },
     {
      "name": "Vehicle parts",
      "share": 4.5
     },
     {
      "name": "Integrated circuits",
      "share": 4.0
     },
     {
      "name": "Semiconductor-making machinery",
      "share": 3.5
     },
     {
      "name": "Construction machinery",
      "share": 2.5
     }
    ],
    "top_destinations": [
     {
      "name": "China",
      "share": 19.0
     },
     {
      "name": "United States",
      "share": 18.5
     },
     {
      "name": "South Korea",
      "share": 6.5
     },
     {
      "name": "Taiwan",
      "share": 6.0
     },
     {
      "name": "Hong Kong",
      "share": 4.5
     }
    ]
   },
   "DEU": {
    "status": "approx",
    "top_products": [
     {
      "name": "Cars",
      "share": 10.0
     },
     {
      "name": "Packaged medicaments",
      "share": 5.5
     },
     {
      "name": "Vehicle parts",
      "share": 4.0
     },
     {
      "name": "Vaccines & blood products",
      "share": 3.0
     },
     {
      "name": "Industrial machinery",
      "share": 2.8
     }
    ],
    "top_destinations": [
     {
      "name": "United States",
      "share": 10.0
     },
     {
      "name": "France",
      "share": 7.5
     },
     {
      "name": "Netherlands",
      "share": 7.0
     },
     {
      "name": "China",
      "share": 6.5
     },
     {
      "name": "Poland",
      "share": 5.5
     }
    ]
   },
   "USA": {
    "status": "approx",
    "top_products": [
     {
      "name": "Refined petroleum",
      "share": 7.0
     },
     {
      "name": "Crude petroleum",
      "share": 5.5
     },
     {
      "name": "Petroleum gas (LNG)",
      "share": 3.5
     },
     {
      "name": "Cars & vehicle parts",
      "share": 3.5
     },
     {
      "name": "Integrated circuits & aircraft",
      "share": 3.0
     }
    ],
    "top_destinations": [
     {
      "name": "Canada",
      "share": 17.0
     },
     {
      "name": "Mexico",
      "share": 16.0
     },
     {
      "name": "China",
      "share": 7.5
     },
     {
      "name": "Japan",
      "share": 4.0
     },
     {
      "name": "United Kingdom",
      "share": 3.7
     }
    ]
   },
   "BRA": {
    "status": "approx",
    "top_products": [
     {
      "name": "Soybeans",
      "share": 14.0
     },
     {
      "name": "Crude petroleum",
      "share": 12.5
     },
     {
      "name": "Iron ore",
      "share": 9.0
     },
     {
      "name": "Maize (corn)",
      "share": 5.5
     },
     {
      "name": "Beef",
      "share": 3.5
     }
    ],
    "top_destinations": [
     {
      "name": "China",
      "share": 27.0
     },
     {
      "name": "United States",
      "share": 11.0
     },
     {
      "name": "Argentina",
      "share": 4.5
     },
     {
      "name": "Netherlands",
      "share": 3.5
     },
     {
      "name": "Spain",
      "share": 3.0
     }
    ]
   },
   "NGA": {
    "status": "approx",
    "top_products": [
     {
      "name": "Crude petroleum",
      "share": 76.0
     },
     {
      "name": "Petroleum gas (LNG)",
      "share": 11.0
     },
     {
      "name": "Nitrogenous fertilizers (urea)",
      "share": 3.0
     },
     {
      "name": "Cocoa beans",
      "share": 1.5
     },
     {
      "name": "Oil seeds & sesame",
      "share": 1.0
     }
    ],
    "top_destinations": [
     {
      "name": "India",
      "share": 12.0
     },
     {
      "name": "Spain",
      "share": 10.0
     },
     {
      "name": "Netherlands",
      "share": 9.0
     },
     {
      "name": "United States",
      "share": 7.0
     },
     {
      "name": "France",
      "share": 7.0
     }
    ]
   },
   "SGP": {
    "status": "approx",
    "top_products": [
     {
      "name": "Integrated circuits",
      "share": 21.0
     },
     {
      "name": "Refined petroleum",
      "share": 10.0
     },
     {
      "name": "Gold",
      "share": 4.0
     },
     {
      "name": "Gas turbines & machinery",
      "share": 3.5
     },
     {
      "name": "Packaged medicaments",
      "share": 2.5
     }
    ],
    "top_destinations": [
     {
      "name": "China",
      "share": 13.0
     },
     {
      "name": "Hong Kong",
      "share": 12.0
     },
     {
      "name": "Malaysia",
      "share": 10.0
     },
     {
      "name": "United States",
      "share": 9.0
     },
     {
      "name": "Indonesia",
      "share": 7.0
     }
    ]
   }
  }
 },
 "methodology": {
  "index_name": "Risk-Adjusted Development Profile",
  "index_short": "RADP",
  "version": "0.2 (experimental public MVP)",
  "tagline": "An analytical lens on whether a country's income level is broad-based, sustainable and resilient. Not an official classification.",
  "pillars": {
   "income": {
    "name": "Income & growth",
    "weight": 0.2,
    "color": "#2166AC",
    "desc": "Level of income (GNI and GDP per capita), recent growth, and price stability. This is the starting point that headline classifications rely on."
   },
   "fiscal": {
    "name": "Fiscal & debt sustainability",
    "weight": 0.2,
    "color": "#4393C3",
    "desc": "Public debt burden, budget balance, and debt-service pressure. High income financed by unsustainable borrowing is fragile income."
   },
   "external": {
    "name": "External vulnerability",
    "weight": 0.15,
    "color": "#5AAE61",
    "desc": "Current account position, reserve buffers, and dependence on remittance inflows. Measures exposure to external shocks."
   },
   "productive": {
    "name": "Export structure & productive capacity",
    "weight": 0.15,
    "color": "#B8860B",
    "desc": "Export diversification and economic complexity. Concentrated, low-complexity export baskets make income volatile and hard to upgrade."
   },
   "human": {
    "name": "Human development & inclusion",
    "weight": 0.2,
    "color": "#8073AC",
    "desc": "HDI, life expectancy, education, poverty, inequality and unemployment. Whether income translates into broad-based wellbeing."
   },
   "governance": {
    "name": "Governance & institutions",
    "weight": 0.1,
    "color": "#878787",
    "desc": "Government effectiveness and rule of law (WGI percentile ranks). Perceptions-based and contested; weighted lowest and clearly flagged."
   }
  },
  "normalization": {
   "steps": [
    "Each indicator is converted to a 0–100 score using min–max scaling across the countries in the dataset.",
    "Before scaling, values are winsorized at the 5th and 95th percentiles of the cross-country distribution, so a single extreme value (for example Japan's debt ratio or Nigeria's poverty rate) does not compress everyone else's scores.",
    "For indicators where higher is better (GNI per capita, HDI, reserves, complexity, governance), the score rises with the value.",
    "For indicators where lower is better (public debt, deficit, inflation, poverty, Gini, unemployment, remittance dependence, export concentration), the scale is inverted.",
    "Missing values are never imputed or invented. They are shown as missing and simply excluded from the relevant pillar average.",
    "Each pillar score is the simple average of the normalized indicators available within that pillar.",
    "The total RADP score is the weighted average of available pillar scores, using the weights above.",
    "If a pillar has no data at all, it is excluded and the remaining weights are proportionally rescaled — and the country page shows a visible warning that this happened.",
    "If fewer than 60% of the scored indicators are available for a country, the total score is flagged as low-confidence."
   ]
  },
  "confidence_rules": {
   "levels": {
    "high": {
     "label": "High confidence",
     "desc": "Most indicators present, recent (within ~3 years), and verified against the source databases."
    },
    "medium": {
     "label": "Medium confidence",
     "desc": "Some indicators missing, older, or transcribed approximately rather than verified."
    },
    "low": {
     "label": "Low confidence",
     "desc": "Many missing values, or a material share of placeholder values; total score is indicative at best."
    },
    "sample": {
     "label": "Sample only",
     "desc": "Demonstration data. Do not use for analysis or citation."
    }
   },
   "note": "Confidence is computed per country from indicator coverage, value recency, and value status. Values fetched from source APIs ('api_reported') or hand-verified ('reported') count as verified; hand-transcribed values ('manual_approx') count as available but unverified and cannot support a High rating; placeholder ('sample') values push toward Sample only."
  },
  "defensible_not_definitive": {
   "title": "Why this index is defensible but not definitive",
   "points": [
    {
     "h": "GNI per capita alone is incomplete",
     "t": "GNI per capita is the backbone of income classifications, but it says nothing about how income is generated or distributed. A country can cross an income threshold while running unsustainable deficits, depending on one export commodity, or leaving large parts of its population in poverty. The RADP keeps GNI at the centre and surrounds it with the context that headline classifications strip out."
    },
    {
     "h": "Debt sustainability matters",
     "t": "Income financed by rapidly rising public debt or absorbed by interest payments is fragile. Two countries with identical GNI per capita can face completely different fiscal futures. Debt ratios, budget balances and debt-service burdens indicate whether today's income level is likely to survive a shock or a refinancing cycle."
    },
    {
     "h": "Export structure and productive capacity matter",
     "t": "A country exporting one commodity to a handful of partners inherits the volatility of that commodity's price. Diversified, complex export baskets are associated with more stable growth and more room to upgrade. Concentration indices and economic complexity capture this dimension that income figures hide."
    },
    {
     "h": "Human development, poverty and inequality matter",
     "t": "Development is ultimately about people. Average income can rise while poverty stays high and inequality widens. HDI, poverty headcounts, the Gini index and unemployment test whether income is actually reaching households."
    },
    {
     "h": "Vulnerability matters",
     "t": "Current account deficits, thin reserves and heavy remittance dependence all expose a country to shocks it does not control: partner-country recessions, migration policy changes, commodity swings, sudden stops in capital. Resilience is a property of the structure, not the level, of income."
    },
    {
     "h": "Weights are contestable — deliberately visible",
     "t": "The default weights (20/20/15/15/20/10) reflect a judgement that income, sustainability and inclusion deserve equal prominence, with structure and vulnerability close behind and perceptions-based governance weighted lowest. Reasonable experts would choose differently. That is exactly why the weights are published, the pillar scores are always shown separately, and no single number is presented as 'the answer'."
    },
    {
     "h": "Component scores must always be shown",
     "t": "A composite hides trade-offs by construction. Japan scores superbly on human development and complexity while carrying the world's highest debt ratio; Nigeria's low score is driven by very different pillars than Moldova's. The dashboard therefore never displays the total score without its six components."
    },
    {
     "h": "This does not replace official classifications",
     "t": "World Bank income groups, IMF assessments, UN LDC categories and national statistics follow governed, documented, internationally negotiated methodologies. The RADP is an analytical prototype meant to enrich discussion around those classifications, not to substitute for them."
    },
    {
     "h": "How missing data is handled",
     "t": "Missing values are shown as missing — never imputed, interpolated or borrowed from similar countries. Pillar scores average only what exists; if a pillar is empty it is excluded with a visible warning and transparent reweighting; if less than 60% of indicators exist the total score is flagged low-confidence."
    },
    {
     "h": "How confidence flags work",
     "t": "Every value carries a status (api_reported, reported, manual_approx, or sample), a reference year, and — for pipeline-fetched values — a last-updated date. These roll up into a country-level confidence badge (High / Medium / Low / Sample only) shown next to every score. High requires broad coverage of recent, API-fetched or verified values; hand-transcribed values cap a country at Medium. The Data status page shows, per source, what is automated, what remains manual, and when it last updated."
    }
   ]
  },
  "coverage_threshold": 0.6,
  "recent_year_threshold": 3
 },
 "sources": {
  "_comment": "Registry of the public data sources behind this dashboard, rendered on the Data sources page. Per-source automation status and last-run results live in update_status.json.",
  "dataset_status": "manual_snapshot",
  "last_updated": "2026-07-05",
  "update_method": "Monthly GitHub Actions pipeline (scripts/update_data.py) for World Bank, IMF, WGI and UNDP HDR; manual for OEC-derived values; optional UN Comtrade with a free key.",
  "sources": {
   "wb_wdi": {
    "name": "World Bank — World Development Indicators",
    "url": "https://data.worldbank.org",
    "api": "https://api.worldbank.org/v2 (open, no key required)",
    "used_for": "GNI per capita (Atlas), GDP per capita, GDP growth, inflation, population, remittances, poverty headcount, Gini index, unemployment, life expectancy, income group classification.",
    "license": "CC BY 4.0",
    "automation": "automated",
    "pipeline_note": "Automated: refreshed by the monthly pipeline via the keyless World Bank API."
   },
   "imf_weo": {
    "name": "IMF — World Economic Outlook database",
    "url": "https://www.imf.org/en/Publications/WEO/weo-database",
    "api": "IMF Data (public); WEO downloads are freely available.",
    "used_for": "General government gross debt, fiscal balance, current account balance, reserve adequacy, interest burden.",
    "license": "Free for public use with attribution",
    "automation": "automated",
    "pipeline_note": "Automated for debt, fiscal balance and current account via the keyless IMF DataMapper API (recent WEO points may be IMF staff estimates). Reserves import-cover and interest-to-revenue remain manual — see the Data status page for why."
   },
   "undp_hdr": {
    "name": "UNDP — Human Development Report data center",
    "url": "https://hdr.undp.org/data-center",
    "api": "Public CSV downloads",
    "used_for": "Human Development Index, expected years of schooling.",
    "license": "CC BY 3.0 IGO",
    "automation": "semi_automated",
    "pipeline_note": "Semi-automated: the pipeline parses UNDP’s complete-time-series CSV; the CSV link is pinned per HDR edition and needs a one-line update when a new report is released."
   },
   "oec": {
    "name": "Observatory of Economic Complexity (OEC) / Atlas of Economic Complexity",
    "url": "https://oec.world",
    "api": "Public country profiles; bulk API requires registration.",
    "used_for": "Top export products, top export destinations, export concentration, Economic Complexity Index.",
    "license": "Public profiles free to view; check terms before redistribution",
    "automation": "partial_manual",
    "pipeline_note": "Partial/manual: OEC bulk access now requires a registered token, so export structure and ECI values remain hand-transcribed and are labeled manual_approx."
   },
   "wb_wgi": {
    "name": "World Bank — Worldwide Governance Indicators",
    "url": "https://www.worldbank.org/en/publication/worldwide-governance-indicators",
    "api": "Public downloads",
    "used_for": "Government effectiveness and rule of law percentile ranks (governance pillar).",
    "license": "Free with attribution",
    "automation": "automated",
    "pipeline_note": "Automated: WGI percentile ranks are fetched through the World Bank API. WGI are perceptions-based composite indicators and are themselves debated; treat this pillar as indicative."
   },
   "un_comtrade": {
    "name": "UN Comtrade (planned, not used in prototype)",
    "url": "https://comtradeplus.un.org",
    "api": "Free tier requires registration and has rate limits.",
    "used_for": "Planned future source for detailed bilateral trade flows. Not used in the MVP to keep the site fully static and key-free.",
    "license": "Free tier with registration",
    "automation": "optional",
    "pipeline_note": "Optional: with a free registered COMTRADE_API_KEY, the pipeline computes real top exports, destinations and concentration (HHI). The site never depends on it."
   }
  }
 },
 "update_status": {
  "_comment": "Machine-written by scripts/update_data.py after each pipeline run, and rendered on the website's Data status page. 'last_success': null means the pipeline has not yet run successfully for that source since this file was created.",
  "pipeline_last_run": null,
  "pipeline_note": "The pipeline runs monthly via GitHub Actions (or manually: python3 scripts/update_data.py). Until its first run, values carry their shipped manual/sample labels.",
  "sources": {
   "wb_wdi": {
    "name": "World Bank — World Development Indicators",
    "automation": "automated",
    "how": "World Bank Indicators API (keyless). Most recent non-null observation per indicator, up to 8 years back.",
    "indicators_covered": [
     "gni_pc",
     "gdp_pc",
     "gdp_growth",
     "inflation",
     "population",
     "pop_growth",
     "remittances_gdp",
     "poverty",
     "gini",
     "unemployment",
     "life_exp"
    ],
    "indicators_manual": [],
    "also_updates": "Income group classification per country.",
    "last_attempt": null,
    "last_success": null,
    "latest_ref_year": null,
    "error": null
   },
   "imf": {
    "name": "IMF — World Economic Outlook (DataMapper API)",
    "automation": "automated",
    "how": "IMF DataMapper public API (keyless). Latest observation up to the current year; recent WEO points may be IMF staff estimates.",
    "indicators_covered": [
     "debt_gdp",
     "fiscal_balance",
     "current_account"
    ],
    "indicators_manual": [
     "reserves_months",
     "interest_rev"
    ],
    "unresolved": {
     "reserves_months": "No keyless IMF endpoint serves 'reserves in months of imports' as one ready series; it requires IRFCL/BOP SDMX mapping plus an imports denominator. Remains manual.",
     "interest_rev": "Interest payments as % of revenue is not a standard WEO DataMapper series; it appears in Fiscal Monitor tables without a stable machine-readable endpoint. Remains manual."
    },
    "last_attempt": null,
    "last_success": null,
    "latest_ref_year": null,
    "error": null
   },
   "wb_wgi": {
    "name": "Worldwide Governance Indicators (via World Bank API)",
    "automation": "automated",
    "how": "WGI percentile ranks (GE.PER.RNK, RL.PER.RNK) served through the keyless World Bank API.",
    "indicators_covered": [
     "gov_eff",
     "rule_law"
    ],
    "indicators_manual": [],
    "last_attempt": null,
    "last_success": null,
    "latest_ref_year": null,
    "error": null
   },
   "undp_hdr": {
    "name": "UNDP — Human Development Report",
    "automation": "semi_automated",
    "how": "Downloads and parses UNDP's complete-time-series CSV. The CSV URL is pinned per HDR edition; when a new report is released, one line in scripts/update_data.py (HDR_CSV_URL) must be updated.",
    "indicators_covered": [
     "hdi",
     "school_exp"
    ],
    "indicators_manual": [],
    "last_attempt": null,
    "last_success": null,
    "latest_ref_year": null,
    "error": null
   },
   "oec": {
    "name": "Observatory of Economic Complexity",
    "automation": "partial_manual",
    "how": "OEC bulk/API access now requires a registered (paid) token, so this source is NOT automated. Top export products, destinations and the Economic Complexity Index remain manually transcribed from public profile pages and are labeled 'manual_approx'.",
    "indicators_covered": [],
    "indicators_manual": [
     "eci",
     "export_conc",
     "top_products",
     "top_destinations"
    ],
    "last_attempt": null,
    "last_success": null,
    "latest_ref_year": null,
    "error": null
   },
   "un_comtrade": {
    "name": "UN Comtrade (optional)",
    "automation": "optional",
    "how": "If a free registered key is provided as the COMTRADE_API_KEY secret, the pipeline computes top export products, top destinations and export concentration (HHI) from real Comtrade flows, replacing the manual OEC transcriptions. The site never depends on this.",
    "indicators_covered": [],
    "indicators_manual": [
     "export_conc (until key provided)",
     "top_products",
     "top_destinations"
    ],
    "last_attempt": null,
    "last_success": null,
    "latest_ref_year": null,
    "error": null
   }
  }
 }
};
