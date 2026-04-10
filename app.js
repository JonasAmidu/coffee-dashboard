// Coffee Quality Dashboard — app.js

(async function () {
  'use strict';

  // ─── State ────────────────────────────────────────────────────────────
  let allData = [];
  let filteredData = [];
  let currentSort = { key: 'Total.Cup.Points', dir: 'desc' };
  let radarChart = null;
  let barChart = null;

  const summary = {
    total_samples: 1043,
    countries: 34,
    avg_score: 82.21,
    top_country: 'Mexico',
  };

  const filters = {
    country: '',
    processing: '',
    variety: '',
    altMin: 0,
    altMax: 3000,
    minScore: 0,
  };

  // ─── Load Data ─────────────────────────────────────────────────────────
  async function loadData() {
    const res = await fetch('data/arabica.json');
    if (!res.ok) throw new Error('Failed to load arabica.json');
    allData = await res.json();
    filteredData = [...allData];
    console.log(`Dashboard loaded, ${allData.length} samples ready`);
  }

  // ─── Init Map ─────────────────────────────────────────────────────────
  function initMap() {
    const map = L.map('world-map').setView([20, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 6,
    }).addTo(map);

    window.map = map;
    renderMap();
  }

  function countryCoords(country) {
    const coords = {
      'Ethiopia': [9.145, 40.489],
      'Brazil': [-14.235, -51.925],
      'Colombia': [4.571, -74.297],
      'Guatemala': [15.784, -90.230],
      'Mexico': [23.634, -102.552],
      'Honduras': [15.200, -86.241],
      'Peru': [-9.190, -75.015],
      'Kenya': [-0.023, 37.906],
      'Uganda': [1.373, 32.290],
      'Taiwan': [23.973, 120.214],
      'China': [35.861, 104.195],
      'United States': [37.090, -95.712],
      'United States (Hawaii)': [20.796, -156.336],
      'El Salvador': [13.794, -88.897],
      'Costa Rica': [9.748, -83.753],
      'Nicaragua': [12.865, -85.207],
      'Panama': [8.537, -80.782],
      'Indonesia': [-0.789, 113.921],
      'India': [20.593, 78.962],
      'Papua New Guinea': [-6.314, 143.955],
      'Tanzania': [-6.369, 34.888],
      'Thailand': [15.870, 100.992],
      'Vietnam': [14.058, 108.277],
      'Myanmar': [21.913, 95.956],
      'Yemen': [15.552, 48.516],
      'Rwanda': [-1.940, 29.873],
      'Burundi': [-3.426, 29.985],
      'Democratic Republic of the Congo': [-4.038, 21.758],
      'Cameroon': [7.369, 12.354],
      'Cuba': [21.521, -77.781],
      'Ghana': [7.946, -1.022],
      'Haiti': [18.971, -72.285],
      'Jamaica': [18.109, -77.297],
      'Dominican Republic': [18.735, -70.162],
      'Philippines': [12.879, 121.774],
      'Japan': [36.204, 138.252],
      'South Korea': [35.907, 127.766],
    };
    return coords[country] || [20, 20];
  }

  function renderMap() {
    const map = window.map;
    map.eachLayer(l => { if (l instanceof L.CircleMarker) l.remove(); });

    const counts = {};
    filteredData.forEach(d => {
      const c = d['Country.of.Origin'] || 'Unknown';
      counts[c] = (counts[c] || 0) + 1;
    });

    Object.entries(counts).forEach(([country, count]) => {
      const [lat, lng] = countryCoords(country);
      const avgScore = filteredData
        .filter(d => d['Country.of.Origin'] === country)
        .reduce((sum, d) => sum + (d['Total.Cup.Points'] || 0), 0) / count;

      const marker = L.circleMarker([lat, lng], {
        radius: Math.max(4, Math.sqrt(count) * 3),
        fillColor: '#c8a97e',
        color: '#c8a97e',
        fillOpacity: 0.7,
        weight: 1,
      }).addTo(map);

      marker.bindPopup(`<strong>${country}</strong><br>Samples: ${count}<br>Avg Score: ${avgScore.toFixed(1)}`);

      marker.on('click', () => {
        filters.country = filters.country === country ? '' : country;
        document.getElementById('filter-country').value = filters.country;
        applyFilters();
      });
    });
  }

  // ─── Radar Chart ───────────────────────────────────────────────────────
  const RADAR_KEYS = ['Aroma', 'Flavor', 'Aftertaste', 'Acidity', 'Body', 'Balance', 'Uniformity', 'Clean.Cup'];

  function avgFlavor(data) {
    const subset = data.length ? data : allData;
    return RADAR_KEYS.map(k => {
      const vals = subset.map(d => d[k]).filter(v => v != null && !isNaN(v));
      return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
    });
  }

  function globalAvg() {
    return RADAR_KEYS.map(k => {
      const vals = allData.map(d => d[k]).filter(v => v != null && !isNaN(v));
      return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
    });
  }

  function initRadar() {
    const ctx = document.getElementById('radar-chart').getContext('2d');
    radarChart = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: RADAR_KEYS,
        datasets: [
          {
            label: 'Global Avg',
            data: globalAvg(),
            borderColor: 'rgba(200, 169, 126, 0.4)',
            backgroundColor: 'transparent',
            borderWidth: 1.5,
            pointRadius: 0,
          },
          {
            label: 'Your Selection',
            data: avgFlavor(filteredData),
            borderColor: '#c8a97e',
            backgroundColor: 'rgba(200, 169, 126, 0.15)',
            borderWidth: 2,
            pointRadius: 3,
            pointBackgroundColor: '#c8a97e',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            min: 6, max: 10,
            ticks: { display: false },
            grid: { color: 'rgba(255,255,255,0.08)' },
            angleLines: { color: 'rgba(255,255,255,0.08)' },
            pointLabels: { color: '#9a9080', font: { size: 11 } },
          },
        },
        plugins: {
          legend: {
            labels: { color: '#9a9080', boxWidth: 12 },
          },
        },
      },
    });
  }

  // ─── Bar Chart ─────────────────────────────────────────────────────────
  function countryAvgScores() {
    const map = {};
    allData.forEach(d => {
      const c = d['Country.of.Origin'];
      if (!map[c]) map[c] = { sum: 0, count: 0 };
      map[c].sum += d['Total.Cup.Points'] || 0;
      map[c].count++;
    });
    return Object.entries(map)
      .map(([country, { sum, count }]) => ({ country, avg: sum / count, count }))
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 10);
  }

  function initBar() {
    const top = countryAvgScores();
    const ctx = document.getElementById('bar-chart').getContext('2d');
    barChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: top.map(t => t.country),
        datasets: [{
          label: 'Avg Score',
          data: top.map(t => t.avg.toFixed(2)),
          backgroundColor: '#c8a97e',
          borderRadius: 4,
        }],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { min: 70, max: 92, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#9a9080' } },
          y: { grid: { display: false }, ticks: { color: '#9a9080' } },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => `${ctx.raw} avg (${top[ctx.dataIndex].count} samples)`,
            },
          },
        },
        onClick: (_evt, elements) => {
          if (elements.length) {
            const country = top[elements[0].index].country;
            filters.country = filters.country === country ? '' : country;
            document.getElementById('filter-country').value = filters.country;
            applyFilters();
          }
        },
      },
    });
  }

  // ─── Filters ──────────────────────────────────────────────────────────
  function applyFilters() {
    filteredData = allData.filter(d => {
      if (filters.country && d['Country.of.Origin'] !== filters.country) return false;
      if (filters.processing && d['Processing.Method'] !== filters.processing) return false;
      if (filters.variety && d['Variety'] !== filters.variety) return false;
      const alt = d['altitude_mean_meters'];
      if (alt == null || isNaN(alt)) return false;
      if (alt < filters.altMin || alt > filters.altMax) return false;
      const score = d['Total.Cup.Points'];
      if (score == null || isNaN(score) || score < filters.minScore) return false;
      return true;
    });
    document.getElementById('sample-count-label').textContent = `${filteredData.length.toLocaleString()} samples`;
    renderAll();
  }

  function populateDropdowns() {
    const countries = [...new Set(allData.map(d => d['Country.of.Origin']))].sort();
    const processing = [...new Set(allData.map(d => d['Processing.Method']).filter(Boolean))].sort();
    const varieties = [...new Set(allData.map(d => d['Variety']).filter(Boolean))].sort();

    fillSelect('filter-country', countries);
    fillSelect('filter-processing', processing);
    fillSelect('filter-variety', varieties);

    const altMax = Math.ceil((summary.altitude_range || { max: 2560 }).max / 100) * 100;
    document.getElementById('filter-alt-min').max = altMax;
    document.getElementById('filter-alt-max').max = altMax;
    document.getElementById('filter-alt-max').value = altMax;
    filters.altMax = altMax;
    document.getElementById('alt-range-display').textContent = `0 — ${altMax} m`;
  }

  function fillSelect(id, options) {
    const sel = document.getElementById(id);
    options.forEach(opt => {
      const op = document.createElement('option');
      op.value = opt;
      op.textContent = opt;
      sel.appendChild(op);
    });
  }

  // ─── Overview Cards ────────────────────────────────────────────────────
  function renderStats() {
    document.getElementById('stat-samples').textContent = summary.total_samples.toLocaleString();
    document.getElementById('stat-avg-score').textContent = summary.avg_score.toFixed(1);
    document.getElementById('stat-countries').textContent = summary.countries;
    document.getElementById('stat-top-country').textContent = summary.top_country;
  }

  // ─── Table ──────────────────────────────────────────────────────────────
  function renderTable() {
    const tbody = document.querySelector('#top20-table tbody');
    const sorted = [...filteredData]
      .sort((a, b) => {
        const av = a[currentSort.key] ?? 0;
        const bv = b[currentSort.key] ?? 0;
        return currentSort.dir === 'desc' ? bv - av : av - bv;
      })
      .slice(0, 20);

    tbody.innerHTML = sorted.map((d, i) => {
      const rank = filteredData.indexOf(d) + 1;
      return `<tr>
        <td>${rank}</td>
        <td>${d['Country.of.Origin'] || '—'}</td>
        <td>${d['Farm.Name'] || d['Owner'] || '—'}</td>
        <td>${d['Variety'] || '—'}</td>
        <td>${d['Processing.Method'] || '—'}</td>
        <td>${d['altitude_mean_meters'] ? Math.round(d['altitude_mean_meters']) : '—'}</td>
        <td>${d['Total.Cup.Points'] ? d['Total.Cup.Points'].toFixed(1) : '—'}</td>
      </tr>`;
    }).join('');
  }

  function setupTableSort() {
    document.querySelectorAll('#top20-table th[data-sort]').forEach(th => {
      th.addEventListener('click', () => {
        const key = th.dataset.sort;
        if (currentSort.key === key) {
          currentSort.dir = currentSort.dir === 'desc' ? 'asc' : 'desc';
        } else {
          currentSort = { key, dir: 'desc' };
        }
        document.querySelectorAll('#top20-table th').forEach(h => {
          h.classList.remove('sort-asc', 'sort-desc');
        });
        th.classList.add(currentSort.dir === 'desc' ? 'sort-desc' : 'sort-asc');
        renderTable();
      });
    });
  }

  // ─── Render All ─────────────────────────────────────────────────────────
  function renderAll() {
    renderMap();
    if (radarChart) {
      radarChart.data.datasets[1].data = avgFlavor(filteredData);
      radarChart.update();
    }
    if (barChart) {
      // no update needed for bar — static top 10
    }
    renderTable();
  }

  // ─── Event Listeners ────────────────────────────────────────────────────
  function setupFilterListeners() {
    document.getElementById('filter-country').addEventListener('change', e => {
      filters.country = e.target.value;
      applyFilters();
    });
    document.getElementById('filter-processing').addEventListener('change', e => {
      filters.processing = e.target.value;
      applyFilters();
    });
    document.getElementById('filter-variety').addEventListener('change', e => {
      filters.variety = e.target.value;
      applyFilters();
    });
    document.getElementById('filter-alt-min').addEventListener('input', e => {
      filters.altMin = +e.target.value;
      document.getElementById('alt-range-display').textContent = `${filters.altMin} — ${filters.altMax} m`;
      applyFilters();
    });
    document.getElementById('filter-alt-max').addEventListener('input', e => {
      filters.altMax = +e.target.value;
      document.getElementById('alt-range-display').textContent = `${filters.altMin} — ${filters.altMax} m`;
      applyFilters();
    });
    document.getElementById('filter-min-score').addEventListener('input', e => {
      filters.minScore = +e.target.value;
      document.getElementById('min-score-display').textContent = filters.minScore.toFixed(1);
      applyFilters();
    });
    document.getElementById('reset-filters').addEventListener('click', () => {
      filters.country = '';
      filters.processing = '';
      filters.variety = '';
      filters.altMin = 0;
      filters.altMax = 2560;
      filters.minScore = 0;
      document.getElementById('filter-country').value = '';
      document.getElementById('filter-processing').value = '';
      document.getElementById('filter-variety').value = '';
      document.getElementById('filter-alt-min').value = 0;
      document.getElementById('filter-alt-max').value = 2560;
      document.getElementById('filter-min-score').value = 0;
      document.getElementById('alt-range-display').textContent = '0 — 2560 m';
      document.getElementById('min-score-display').textContent = '0';
      applyFilters();
    });
  }

  // ─── Boot ──────────────────────────────────────────────────────────────
  async function init() {
    try {
      await loadData();
      renderStats();
      populateDropdowns();
      initMap();
      initRadar();
      initBar();
      renderTable();
      setupTableSort();
      setupFilterListeners();
    } catch (err) {
      console.error('Dashboard init error:', err);
    }
  }

  init();
})();
