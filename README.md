# ☕ Coffee Quality Dashboard

An interactive explorer for ~1,000 Arabica coffee samples from 34 countries. Built with vanilla HTML, CSS, and JavaScript — no framework required.

**Live:** https://jonasamidu.github.io/coffee-dashboard

---

## What's Inside

- **Overview cards** — total samples, average score, country count, top origin
- **World map** — circle markers sized by sample count; click any country to filter
- **Flavor radar** — 8 dimensions (aroma, acidity, body, balance…) with your selection vs. global average
- **Top 10 bar chart** — countries ranked by average cup score
- **Filters** — country, processing method, variety, altitude range, minimum score
- **Top 20 table** — sortable by any column

## Dataset

[Coffee Quality Institute Database](https://github.com/jldbc/coffee-quality-database) — 1,043 cleaned Arabica samples with cupping scores, farm metadata, altitude, and processing methods.

## Run Locally

```bash
git clone https://github.com/JonasAmidu/coffee-dashboard.git
cd coffee-dashboard
python3 -m http.server 8000
# open http://localhost:8000
```

## Tech Stack

- HTML5 / CSS3 / JavaScript (ES2020)
- [Chart.js](https://www.chartjs.org) — radar + bar charts
- [Leaflet.js](https://leafletjs.com) — interactive world map
- [OpenStreetMap](https://www.openstreetmap.org) — tile layer
- Python `http.server` — local gateway

## Project Structure

```
coffee-dashboard/
├── index.html          ← main page
├── styles.css          ← dark theme
├── app.js              ← dashboard logic
├── data/
│   └── arabica.json   ← cleaned dataset
└── README.md
```

## Screenshots

> Dashboard showing world map, flavor radar, and top 20 table with 1,000+ coffee samples from 34 countries.
