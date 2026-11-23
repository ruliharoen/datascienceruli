// Application State
let currentLang = localStorage.getItem('ds_lang') || 'id';
let currentModuleId = ROADMAP_DATA[0].id;
let activeTab = 'purpose';
let completedModules = JSON.parse(localStorage.getItem('ds_completed') || '[]');
let activeChart = null;

// Helper: Get Translation
function t(key) {
  return UI_TEXT[currentLang][key] || key;
}

// Helper: Render LaTeX-style math text into readable formatted HTML
function formatMathHTML(text) {
  if (!text) return '';
  return text
    .replace(/\$\$(.*?)\$\$/gs, '<div class="my-2 p-2.5 bg-slate-800/90 text-sky-300 font-mono text-center rounded border border-slate-700 overflow-x-auto text-sm">$1</div>')
    .replace(/\$(.*?)\$/g, '<code class="px-1.5 py-0.5 bg-slate-800 text-sky-300 rounded font-mono text-xs">$1</code>')
    .replace(/\n\n/g, '<br><br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="text-slate-300">$1</em>');
}

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  renderHeader();
  renderStageFilters();
  renderModuleList();
  loadModule(currentModuleId);
  setupSearch();

  // Register Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
});

// Switch Language
function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('ds_lang', lang);
  renderHeader();
  renderStageFilters();
  renderModuleList();
  loadModule(currentModuleId);
}

// Render Header & Progress
function renderHeader() {
  document.getElementById('app-title').textContent = t('appTitle');
  document.getElementById('app-subtitle').textContent = t('appSubtitle');
  document.getElementById('search-input').placeholder = t('searchPlaceholder');
  document.getElementById('pwa-tip').textContent = t('addToHomeTip');

  // Language buttons styling
  const btnId = document.getElementById('lang-id-btn');
  const btnEn = document.getElementById('lang-en-btn');
  if (currentLang === 'id') {
    btnId.className = "px-2.5 py-1 text-xs font-bold rounded bg-indigo-600 text-white shadow";
    btnEn.className = "px-2.5 py-1 text-xs font-semibold rounded text-slate-400 hover:text-white";
  } else {
    btnEn.className = "px-2.5 py-1 text-xs font-bold rounded bg-indigo-600 text-white shadow";
    btnId.className = "px-2.5 py-1 text-xs font-semibold rounded text-slate-400 hover:text-white";
  }

  // Update Progress Bar
  const total = ROADMAP_DATA.length;
  const completedCount = completedModules.length;
  const percent = Math.round((completedCount / total) * 100);

  document.getElementById('progress-label').textContent = `${t('progressTitle')}: ${completedCount}/${total} (${percent}%)`;
  document.getElementById('progress-bar').style.width = `${percent}%`;
}

// Filter Modules by Stage
let currentFilterStage = 'all';
function renderStageFilters() {
  const container = document.getElementById('stage-filters');
  container.innerHTML = '';

  const allBtn = document.createElement('button');
  allBtn.className = `px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
    currentFilterStage === 'all'
      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
  }`;
  allBtn.textContent = t('allStages');
  allBtn.onclick = () => {
    currentFilterStage = 'all';
    renderStageFilters();
    renderModuleList();
  };
  container.appendChild(allBtn);

  const stages = [
    { num: 1, label: t('stages')[0] },
    { num: 2, label: t('stages')[1] },
    { num: 3, label: t('stages')[2] },
    { num: 4, label: t('stages')[3] },
    { num: 5, label: t('stages')[4] },
    { num: 6, label: t('stages')[5] }
  ];

  stages.forEach(st => {
    const btn = document.createElement('button');
    btn.className = `px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
      currentFilterStage === st.num
        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
    }`;
    btn.textContent = st.label;
    btn.onclick = () => {
      currentFilterStage = st.num;
      renderStageFilters();
      renderModuleList();
    };
    container.appendChild(btn);
  });
}

// Render Sidebar / Bottom Drawer Module List
function renderModuleList(searchQuery = '') {
  const container = document.getElementById('module-list-items');
  container.innerHTML = '';

  const filtered = ROADMAP_DATA.filter(m => {
    const matchStage = currentFilterStage === 'all' || m.stage === currentFilterStage;
    const titleMatch = m.title[currentLang].toLowerCase().includes(searchQuery.toLowerCase());
    const purposeMatch = m.purpose[currentLang].toLowerCase().includes(searchQuery.toLowerCase());
    return matchStage && (titleMatch || purposeMatch);
  });

  if (filtered.length === 0) {
    container.innerHTML = `<div class="p-4 text-center text-slate-400 text-xs">${currentLang === 'id' ? 'Tidak ada materi yang sesuai.' : 'No modules found.'}</div>`;
    return;
  }

  filtered.forEach((m, idx) => {
    const isCompleted = completedModules.includes(m.id);
    const isActive = m.id === currentModuleId;

    const item = document.createElement('div');
    item.className = `p-3 rounded-xl cursor-pointer transition-all border ${
      isActive
        ? 'bg-slate-800 border-indigo-500 shadow-lg shadow-indigo-500/10'
        : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/60'
    }`;

    item.innerHTML = `
      <div class="flex items-center justify-between gap-2">
        <span class="text-[10px] font-semibold tracking-wider uppercase text-indigo-400">
          ${m.stageName[currentLang]}
        </span>
        ${isCompleted ? '<span class="text-xs text-emerald-400 font-bold">✓</span>' : ''}
      </div>
      <h4 class="text-xs font-bold text-slate-100 mt-1 line-clamp-2">
        ${m.title[currentLang]}
      </h4>
    `;

    item.onclick = () => {
      loadModule(m.id);
      closeDrawer();
    };
    container.appendChild(item);
  });
}

// Search functionality
function setupSearch() {
  const searchInput = document.getElementById('search-input');
  searchInput.addEventListener('input', (e) => {
    renderModuleList(e.target.value);
  });
}

// Load Module Details
function loadModule(id) {
  currentModuleId = id;
  const mod = ROADMAP_DATA.find(m => m.id === id);
  if (!mod) return;

  // Update Active indicator in list
  renderModuleList();

  // Update Breadcrumb & Header
  document.getElementById('current-stage-badge').textContent = mod.stageName[currentLang];
  document.getElementById('current-title').textContent = mod.title[currentLang];

  // Update "Mark as Done" button
  updateMarkDoneButton();

  // Render Tabs Navigation
  renderTabs();

  // Render Active Tab Content
  renderTabContent(mod);
}

function updateMarkDoneButton() {
  const btn = document.getElementById('mark-done-btn');
  const isDone = completedModules.includes(currentModuleId);
  if (isDone) {
    btn.innerHTML = `<span>✓</span> <span>${t('markedDone')}</span>`;
    btn.className = "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600/20 text-emerald-400 border border-emerald-500/30";
  } else {
    btn.innerHTML = `<span>○</span> <span>${t('markDone')}</span>`;
    btn.className = "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700 hover:border-indigo-500 hover:text-white";
  }
}

function toggleMarkDone() {
  if (completedModules.includes(currentModuleId)) {
    completedModules = completedModules.filter(id => id !== currentModuleId);
  } else {
    completedModules.push(currentModuleId);
  }
  localStorage.setItem('ds_completed', JSON.stringify(completedModules));
  updateMarkDoneButton();
  renderHeader();
  renderModuleList();
}

// Render Module Sub-Tabs
function renderTabs() {
  const tabs = [
    { key: 'purpose', label: t('tabPurpose') },
    { key: 'note', label: t('tabNote') },
    { key: 'math', label: t('tabMath') },
    { key: 'sim', label: t('tabSim') },
    { key: 'code', label: t('tabCode') }
  ];

  const container = document.getElementById('sub-tabs');
  container.innerHTML = '';

  tabs.forEach(tab => {
    const btn = document.createElement('button');
    btn.className = `flex-1 py-2 px-1 text-center text-[11px] font-bold border-b-2 transition-all whitespace-nowrap ${
      activeTab === tab.key
        ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
        : 'border-transparent text-slate-400 hover:text-slate-200'
    }`;
    btn.textContent = tab.label;
    btn.onclick = () => {
      activeTab = tab.key;
      renderTabs();
      const mod = ROADMAP_DATA.find(m => m.id === currentModuleId);
      renderTabContent(mod);
    };
    container.appendChild(btn);
  });
}

// Render Tab Content
function renderTabContent(mod) {
  const contentEl = document.getElementById('tab-content');
  contentEl.innerHTML = '';

  if (activeTab === 'purpose') {
    contentEl.innerHTML = `
      <div class="space-y-4">
        <div class="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
          <h4 class="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2">🎯 ${currentLang === 'id' ? 'Untuk Apa Sub-Materi Ini?' : 'Why Learn This?'}</h4>
          <p class="text-sm text-slate-200 leading-relaxed">${mod.purpose[currentLang]}</p>
        </div>
        <div class="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <h4 class="text-xs font-bold text-amber-300 uppercase tracking-wider mb-1.5">💡 ${currentLang === 'id' ? 'Koneksi ke Tahap Berikutnya' : 'Connection to Next Stages'}</h4>
          <p class="text-xs text-amber-100/90 leading-relaxed">${mod.takeNote[currentLang]}</p>
        </div>
      </div>
    `;
  } else if (activeTab === 'note') {
    contentEl.innerHTML = `
      <div class="p-4 rounded-xl bg-gradient-to-br from-indigo-950/40 to-slate-900 border border-indigo-500/30">
        <div class="flex items-center gap-2 mb-2">
          <span class="text-amber-400 font-bold text-base">💡</span>
          <h4 class="text-xs font-bold text-indigo-200 uppercase tracking-wider">${currentLang === 'id' ? 'Catatan Kunci untuk Programmer' : 'Programmer Takeaway & Pitfalls'}</h4>
        </div>
        <p class="text-sm text-slate-200 leading-relaxed">${mod.takeNote[currentLang]}</p>
      </div>
    `;
  } else if (activeTab === 'math') {
    contentEl.innerHTML = `
      <div class="space-y-3">
        <div class="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <h4 class="text-xs font-bold text-sky-400 uppercase tracking-wider mb-2">📐 ${currentLang === 'id' ? 'Konsep Rumus & Logika Manual' : 'Mathematical Formulas & Intuition'}</h4>
          <div class="text-xs text-slate-300 leading-relaxed">${formatMathHTML(mod.math[currentLang])}</div>
        </div>
      </div>
    `;
  } else if (activeTab === 'sim') {
    renderSimulatorView(contentEl, mod);
  } else if (activeTab === 'code') {
    contentEl.innerHTML = `
      <div class="space-y-4">
        <div class="rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
          <div class="flex items-center justify-between px-3 py-2 bg-slate-900 border-b border-slate-800">
            <span class="text-[11px] font-mono font-semibold text-indigo-400">🐍 Python Code</span>
            <button onclick="copyCodeText()" id="copy-btn" class="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 hover:text-white border border-slate-700">
              ${t('copyCode')}
            </button>
          </div>
          <pre class="p-3 text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed"><code id="code-snippet">${escapeHTML(mod.python.code)}</code></pre>
        </div>

        <div class="rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
          <div class="px-3 py-1.5 bg-slate-900 border-b border-slate-800">
            <span class="text-[11px] font-mono font-semibold text-amber-400">📟 Sample Output Terminal</span>
          </div>
          <pre class="p-3 text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed whitespace-pre-wrap">${escapeHTML(mod.python.output)}</pre>
        </div>
      </div>
    `;
  }
}

function escapeHTML(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function copyCodeText() {
  const code = document.getElementById('code-snippet').innerText;
  navigator.clipboard.writeText(code).then(() => {
    const btn = document.getElementById('copy-btn');
    btn.textContent = t('copied');
    btn.className = "px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-600 text-white";
    setTimeout(() => {
      btn.textContent = t('copyCode');
      btn.className = "px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 hover:text-white border border-slate-700";
    }, 1500);
  });
}

// Drawer Toggle for Mobile
function openDrawer() {
  document.getElementById('mobile-drawer').classList.remove('hidden');
}
function closeDrawer() {
  document.getElementById('mobile-drawer').classList.add('hidden');
}

// ==========================================
// SIMULATOR ENGINES WITH CHART.JS
// ==========================================
function renderSimulatorView(container, mod) {
  container.innerHTML = `
    <div class="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
      <div>
        <h4 class="text-xs font-bold text-indigo-400 uppercase tracking-wider">${t('simTitle')}</h4>
        <p class="text-xs text-slate-400 mt-0.5">
          ${currentLang === 'id' ? 'Geser slider di bawah untuk melihat perhitungan matematis & grafik terupdate secara live!' : 'Drag the sliders below to see live math calculations and real-time chart updates!'}
        </p>
      </div>

      <!-- Controls Area -->
      <div id="sim-controls" class="space-y-3 p-3 bg-slate-950/70 rounded-lg border border-slate-800"></div>

      <!-- Live Calculation Card -->
      <div id="sim-math-results" class="p-3 bg-indigo-950/30 rounded-lg border border-indigo-500/20 text-xs font-mono space-y-1"></div>

      <!-- Chart Canvas -->
      <div class="relative w-full h-56 bg-slate-950 rounded-lg p-2 border border-slate-800 flex items-center justify-center">
        <canvas id="sim-chart-canvas"></canvas>
      </div>
    </div>
  `;

  // Initialize specific simulator
  setTimeout(() => {
    if (mod.simType === 'stats') setupStatsSimulator();
    else if (mod.simType === 'iqr') setupIqrSimulator();
    else if (mod.simType === 'correlation') setupCorrelationSimulator();
    else if (mod.simType === 'scaling') setupScalingSimulator();
    else if (mod.simType === 'regression') setupRegressionSimulator();
    else if (mod.simType === 'regeval') setupRegEvalSimulator();
    else if (mod.simType === 'logistic') setupLogisticSimulator();
    else if (mod.simType === 'confmatrix') setupConfMatrixSimulator();
    else if (mod.simType === 'gini') setupGiniSimulator();
    else if (mod.simType === 'perceptron') setupPerceptronSimulator();
    else if (mod.simType === 'gradient') setupGradientSimulator();
  }, 50);
}

function destroyActiveChart() {
  if (activeChart) {
    activeChart.destroy();
    activeChart = null;
  }
}

// 1. Stats Simulator
function setupStatsSimulator() {
  destroyActiveChart();
  const controls = document.getElementById('sim-controls');
  const results = document.getElementById('sim-math-results');
  const ctx = document.getElementById('sim-chart-canvas').getContext('2d');

  controls.innerHTML = `
    <div>
      <div class="flex justify-between text-xs text-slate-300">
        <span>${currentLang === 'id' ? 'Nilai Outlier Gaji' : 'Outlier Salary Value'}:</span>
        <span id="outlier-val" class="text-indigo-400 font-bold font-mono">100 jt</span>
      </div>
      <input type="range" id="outlier-slider" min="10" max="200" value="100" class="w-full accent-indigo-500 cursor-pointer">
    </div>
  `;

  function update() {
    const outlier = parseFloat(document.getElementById('outlier-slider').value);
    document.getElementById('outlier-val').textContent = outlier + " jt";
    const data = [5, 6, 5.5, 7, 6.2, outlier].sort((a,b)=>a-b);
    
    // Mean
    const mean = (data.reduce((a,b)=>a+b, 0) / data.length).toFixed(2);
    // Median
    const mid = Math.floor(data.length / 2);
    const median = ((data[mid-1] + data[mid]) / 2).toFixed(2);

    results.innerHTML = `
      <div class="text-indigo-300 font-bold mb-1">[ Perbandingan Mean vs Median ]</div>
      <div>• Total Gaji: <span class="text-white">${data.reduce((a,b)=>a+b, 0).toFixed(1)} jt</span></div>
      <div>• Mean (Rata-rata) : <span class="text-rose-400 font-bold">${mean} jt</span> ${parseFloat(mean) > 15 ? '(Terdistorsi parah oleh outlier!)' : ''}</div>
      <div>• Median (Nilai Tengah): <span class="text-emerald-400 font-bold">${median} jt</span> (Tetap stabil & mencerminkan realita)</div>
    `;

    if (activeChart) activeChart.destroy();
    activeChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Karyawan 1', 'Karyawan 2', 'Karyawan 3', 'Karyawan 4', 'Karyawan 5', 'Outlier'],
        datasets: [{
          label: 'Gaji (Juta Rp)',
          data: data,
          backgroundColor: data.map(d => d === outlier ? '#f43f5e' : '#6366f1')
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { grid: { color: '#334155' }, ticks: { color: '#94a3b8' } },
          x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
        }
      }
    });
  }

  document.getElementById('outlier-slider').addEventListener('input', update);
  update();
}

// 2. IQR Outlier Simulator
function setupIqrSimulator() {
  destroyActiveChart();
  const controls = document.getElementById('sim-controls');
  const results = document.getElementById('sim-math-results');
  const ctx = document.getElementById('sim-chart-canvas').getContext('2d');

  controls.innerHTML = `
    <div>
      <div class="flex justify-between text-xs text-slate-300">
        <span>${currentLang === 'id' ? 'Titik Data yang Diuji' : 'Tested Data Point'}:</span>
        <span id="iqr-val" class="text-indigo-400 font-bold font-mono">45</span>
      </div>
      <input type="range" id="iqr-slider" min="0" max="100" value="45" class="w-full accent-indigo-500 cursor-pointer">
    </div>
  `;

  function update() {
    const val = parseFloat(document.getElementById('iqr-slider').value);
    document.getElementById('iqr-val').textContent = val;

    // Normal range: Q1=14, Q3=20 -> IQR=6
    // Lower = 14 - (1.5*6) = 5
    // Upper = 20 + (1.5*6) = 29
    const lower = 5;
    const upper = 29;
    const isOutlier = val < lower || val > upper;

    results.innerHTML = `
      <div class="text-sky-300 font-bold mb-1">[ Perhitungan Rumus IQR ]</div>
      <div>• Kuartil 1 (Q1) = 14, Kuartil 3 (Q3) = 20</div>
      <div>• IQR = Q3 - Q1 = 6</div>
      <div>• Batas Aman: [${lower} s/d ${upper}]</div>
      <div class="mt-1 font-bold ${isOutlier ? 'text-rose-400' : 'text-emerald-400'}">
        Status: Angka ${val} adalah ${isOutlier ? '⚠️ OUTLIER (Di luar batas aman)' : '✅ DATA NORMAL'}
      </div>
    `;

    if (activeChart) activeChart.destroy();
    activeChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Batas Bawah (Q1-1.5*IQR)', 'Nilai Uji Anda', 'Batas Atas (Q3+1.5*IQR)'],
        datasets: [{
          data: [lower, val, upper],
          backgroundColor: ['#64748b', isOutlier ? '#f43f5e' : '#10b981', '#64748b']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { grid: { color: '#334155' }, ticks: { color: '#94a3b8' }, max: 100 },
          x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
        }
      }
    });
  }

  document.getElementById('iqr-slider').addEventListener('input', update);
  update();
}

// 3. Correlation Simulator
function setupCorrelationSimulator() {
  destroyActiveChart();
  const controls = document.getElementById('sim-controls');
  const results = document.getElementById('sim-math-results');
  const ctx = document.getElementById('sim-chart-canvas').getContext('2d');

  controls.innerHTML = `
    <div>
      <div class="flex justify-between text-xs text-slate-300">
        <span>${currentLang === 'id' ? 'Nilai Korelasi (r)' : 'Correlation Value (r)'}:</span>
        <span id="corr-val" class="text-indigo-400 font-bold font-mono">0.80</span>
      </div>
      <input type="range" id="corr-slider" min="-1" max="1" step="0.1" value="0.8" class="w-full accent-indigo-500 cursor-pointer">
    </div>
  `;

  function update() {
    const r = parseFloat(document.getElementById('corr-slider').value);
    document.getElementById('corr-val').textContent = r.toFixed(2);

    let desc = '';
    if (r > 0.7) desc = 'Korelasi Positif Kuat (X naik, Y pasti naik)';
    else if (r > 0.2) desc = 'Korelasi Positif Sedang';
    else if (r >= -0.2 && r <= 0.2) desc = 'Tidak Ada Korelasi (Data menyebar acak)';
    else if (r < -0.7) desc = 'Korelasi Negatif Kuat (X naik, Y justru anjlok)';
    else desc = 'Korelasi Negatif Sedang';

    results.innerHTML = `
      <div class="text-indigo-300 font-bold mb-1">[ Analisis Korelasi Pearson ]</div>
      <div>• Nilai r: <span class="text-white font-bold">${r.toFixed(2)}</span></div>
      <div>• Interpretasi: <span class="text-sky-300">${desc}</span></div>
    `;

    // Generate scatter points based on r
    const points = [];
    for (let i = 1; i <= 30; i++) {
      const x = i;
      const noise = (Math.random() - 0.5) * 30 * (1 - Math.abs(r));
      const y = r >= 0 ? (r * x * 2 + 10 + noise) : ((1 + r) * 60 - r * x * 2 + noise);
      points.push({ x: x, y: Math.max(0, y) });
    }

    if (activeChart) activeChart.destroy();
    activeChart = new Chart(ctx, {
      type: 'scatter',
      data: {
        datasets: [{
          label: 'Data Titik',
          data: points,
          backgroundColor: '#38bdf8'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: '#334155' }, ticks: { color: '#94a3b8' } },
          y: { grid: { color: '#334155' }, ticks: { color: '#94a3b8' } }
        }
      }
    });
  }

  document.getElementById('corr-slider').addEventListener('input', update);
  update();
}

// 4. Feature Scaling Simulator
function setupScalingSimulator() {
  destroyActiveChart();
  const controls = document.getElementById('sim-controls');
  const results = document.getElementById('sim-math-results');
  const ctx = document.getElementById('sim-chart-canvas').getContext('2d');

  controls.innerHTML = `
    <div>
      <div class="flex justify-between text-xs text-slate-300">
        <span>${currentLang === 'id' ? 'Input Gaji Asli' : 'Original Raw Salary'}:</span>
        <span id="scale-raw" class="text-indigo-400 font-bold font-mono">15 jt</span>
      </div>
      <input type="range" id="scale-slider" min="3" max="30" value="15" class="w-full accent-indigo-500 cursor-pointer">
    </div>
  `;

  function update() {
    const raw = parseFloat(document.getElementById('scale-slider').value);
    document.getElementById('scale-raw').textContent = raw + " jt";

    // Min=3, Max=30, Mean=15, Std=6
    const min = 3, max = 30, mean = 15, std = 6;
    const minMax = ((raw - min) / (max - min)).toFixed(3);
    const standard = ((raw - mean) / std).toFixed(3);

    results.innerHTML = `
      <div class="text-sky-300 font-bold mb-1">[ Hasil Transformasi Angka ]</div>
      <div>• Nilai Asli: ${raw} Juta</div>
      <div>• Min-Max (0 s/d 1): <span class="text-emerald-400 font-bold">${minMax}</span> (Rentang absolut terkunci)</div>
      <div>• Standard Scaler (Z-Score): <span class="text-indigo-400 font-bold">${standard}</span> (Mean=0, Std=1)</div>
    `;

    if (activeChart) activeChart.destroy();
    activeChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Original (Juta)', 'MinMax (0-1)', 'Standard Scaler (Z)'],
        datasets: [{
          data: [raw, parseFloat(minMax) * 10, parseFloat(standard) * 5],
          backgroundColor: ['#64748b', '#10b981', '#6366f1']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { grid: { color: '#334155' }, ticks: { color: '#94a3b8' } },
          x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
        }
      }
    });
  }

  document.getElementById('scale-slider').addEventListener('input', update);
  update();
}

// 5. Linear Regression Simulator
function setupRegressionSimulator() {
  destroyActiveChart();
  const controls = document.getElementById('sim-controls');
  const results = document.getElementById('sim-math-results');
  const ctx = document.getElementById('sim-chart-canvas').getContext('2d');

  controls.innerHTML = `
    <div class="space-y-2">
      <div>
        <div class="flex justify-between text-xs text-slate-300">
          <span>Slope / Weight (w):</span>
          <span id="reg-w-val" class="text-indigo-400 font-bold font-mono">5.0</span>
        </div>
        <input type="range" id="reg-w" min="1" max="10" step="0.5" value="5.0" class="w-full accent-indigo-500 cursor-pointer">
      </div>
      <div>
        <div class="flex justify-between text-xs text-slate-300">
          <span>Bias / Intercept (b):</span>
          <span id="reg-b-val" class="text-indigo-400 font-bold font-mono">10</span>
        </div>
        <input type="range" id="reg-b" min="-50" max="50" step="5" value="10" class="w-full accent-indigo-500 cursor-pointer">
      </div>
    </div>
  `;

  // Sample real data: Luas Tanah vs Harga
  const realData = [
    { x: 50, y: 250 },
    { x: 70, y: 360 },
    { x: 90, y: 470 },
    { x: 110, y: 550 },
    { x: 130, y: 680 }
  ];

  function update() {
    const w = parseFloat(document.getElementById('reg-w').value);
    const b = parseFloat(document.getElementById('reg-b').value);
    document.getElementById('reg-w-val').textContent = w.toFixed(1);
    document.getElementById('reg-b-val').textContent = b;

    // Calculate MSE
    let totalSqError = 0;
    realData.forEach(d => {
      const pred = w * d.x + b;
      totalSqError += Math.pow(d.y - pred, 2);
    });
    const mse = (totalSqError / realData.length).toFixed(1);

    results.innerHTML = `
      <div class="text-indigo-300 font-bold mb-1">[ Persamaan Model: y = ${w}x + (${b}) ]</div>
      <div>• Total MSE (Error Kuadrat): <span class="text-rose-400 font-bold">${mse}</span></div>
      <div>• Prediksi Rumah 100m²: <span class="text-emerald-400 font-bold">${(w * 100 + b).toFixed(0)} Juta</span></div>
    `;

    // Line data
    const lineData = [
      { x: 40, y: w * 40 + b },
      { x: 140, y: w * 140 + b }
    ];

    if (activeChart) activeChart.destroy();
    activeChart = new Chart(ctx, {
      type: 'scatter',
      data: {
        datasets: [
          {
            label: 'Data Riil',
            data: realData,
            backgroundColor: '#38bdf8'
          },
          {
            label: 'Garis Prediksi (y = wx+b)',
            data: lineData,
            type: 'line',
            borderColor: '#f43f5e',
            borderWidth: 2,
            pointRadius: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: '#334155' }, ticks: { color: '#94a3b8' }, min: 40, max: 140 },
          y: { grid: { color: '#334155' }, ticks: { color: '#94a3b8' }, min: 100, max: 800 }
        }
      }
    });
  }

  document.getElementById('reg-w').addEventListener('input', update);
  document.getElementById('reg-b').addEventListener('input', update);
  update();
}

// 6. Regression Evaluation Simulator
function setupRegEvalSimulator() {
  destroyActiveChart();
  const controls = document.getElementById('sim-controls');
  const results = document.getElementById('sim-math-results');
  const ctx = document.getElementById('sim-chart-canvas').getContext('2d');

  controls.innerHTML = `
    <div>
      <div class="flex justify-between text-xs text-slate-300">
        <span>${currentLang === 'id' ? 'Kesalahan Prediksi Rumah (Meleset)' : 'Prediction Error Deviation'}:</span>
        <span id="eval-err-val" class="text-indigo-400 font-bold font-mono">20 jt</span>
      </div>
      <input type="range" id="eval-err" min="5" max="100" value="20" class="w-full accent-indigo-500 cursor-pointer">
    </div>
  `;

  function update() {
    const err = parseFloat(document.getElementById('eval-err').value);
    document.getElementById('eval-err-val').textContent = err + " jt";

    const mae = err;
    const mse = err * err;
    const rmse = Math.sqrt(mse);
    const r2 = Math.max(0, 1 - (mse / 10000)).toFixed(2);

    results.innerHTML = `
      <div class="text-sky-300 font-bold mb-1">[ Perbandingan Metrik Evaluasi ]</div>
      <div>• MAE (Rata-rata selisih): <span class="text-emerald-400 font-bold">${mae} Juta</span></div>
      <div>• MSE (Selisih dikuadratkan): <span class="text-amber-400 font-bold">${mse}</span></div>
      <div>• RMSE (Akar kuadrat): <span class="text-indigo-400 font-bold">${rmse} Juta</span></div>
      <div>• R² Score (Kemampuan model): <span class="text-white font-bold">${r2}</span> (${Math.round(r2*100)}% pola terjelaskan)</div>
    `;

    if (activeChart) activeChart.destroy();
    activeChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['MAE', 'RMSE', 'R2 Score (*100)'],
        datasets: [{
          data: [mae, rmse, r2 * 100],
          backgroundColor: ['#10b981', '#6366f1', '#38bdf8']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { grid: { color: '#334155' }, ticks: { color: '#94a3b8' } },
          x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
        }
      }
    });
  }

  document.getElementById('eval-err').addEventListener('input', update);
  update();
}

// 7. Logistic Regression & Sigmoid Simulator
function setupLogisticSimulator() {
  destroyActiveChart();
  const controls = document.getElementById('sim-controls');
  const results = document.getElementById('sim-math-results');
  const ctx = document.getElementById('sim-chart-canvas').getContext('2d');

  controls.innerHTML = `
    <div>
      <div class="flex justify-between text-xs text-slate-300">
        <span>Nilai z (Input Garis wx + b):</span>
        <span id="sig-z-val" class="text-indigo-400 font-bold font-mono">1.5</span>
      </div>
      <input type="range" id="sig-z" min="-5" max="5" step="0.2" value="1.5" class="w-full accent-indigo-500 cursor-pointer">
    </div>
  `;

  function update() {
    const z = parseFloat(document.getElementById('sig-z').value);
    document.getElementById('sig-z-val').textContent = z.toFixed(1);

    // Sigmoid = 1 / (1 + e^-z)
    const prob = 1 / (1 + Math.exp(-z));
    const isClass1 = prob >= 0.5;

    results.innerHTML = `
      <div class="text-indigo-300 font-bold mb-1">[ Perhitungan Probabilitas Sigmoid ]</div>
      <div>• Rumus: 1 / (1 + e^(-z)) = 1 / (1 + e^(-${z.toFixed(1)}))</div>
      <div>• Probabilitas: <span class="text-white font-bold font-mono">${(prob * 100).toFixed(1)}%</span></div>
      <div class="mt-1 font-bold ${isClass1 ? 'text-emerald-400' : 'text-slate-400'}">
        Keputusan (Threshold 50%): ${isClass1 ? '✅ KELAS 1 (Positif / Lulus)' : '❌ KELAS 0 (Negatif / Gagal)'}
      </div>
    `;

    // Generate Sigmoid Curve Points
    const curve = [];
    for (let x = -5; x <= 5; x += 0.5) {
      curve.push({ x: x, y: 1 / (1 + Math.exp(-x)) });
    }

    if (activeChart) activeChart.destroy();
    activeChart = new Chart(ctx, {
      type: 'scatter',
      data: {
        datasets: [
          {
            label: 'Kurva Sigmoid',
            data: curve,
            showLine: true,
            borderColor: '#6366f1',
            borderWidth: 2,
            pointRadius: 0
          },
          {
            label: 'Titik Posisi Anda',
            data: [{ x: z, y: prob }],
            backgroundColor: isClass1 ? '#10b981' : '#f43f5e',
            pointRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: '#334155' }, ticks: { color: '#94a3b8' }, min: -5, max: 5 },
          y: { grid: { color: '#334155' }, ticks: { color: '#94a3b8' }, min: 0, max: 1 }
        }
      }
    });
  }

  document.getElementById('sig-z').addEventListener('input', update);
  update();
}

// 8. Confusion Matrix Simulator
function setupConfMatrixSimulator() {
  destroyActiveChart();
  const controls = document.getElementById('sim-controls');
  const results = document.getElementById('sim-math-results');
  const ctx = document.getElementById('sim-chart-canvas').getContext('2d');

  controls.innerHTML = `
    <div class="grid grid-cols-2 gap-2 text-xs">
      <div>
        <label class="text-emerald-400">TP (Benar Positif):</label>
        <input type="number" id="cm-tp" value="40" min="0" class="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white">
      </div>
      <div>
        <label class="text-rose-400">FP (Salah Tuduh):</label>
        <input type="number" id="cm-fp" value="10" min="0" class="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white">
      </div>
      <div>
        <label class="text-rose-400">FN (Kecolongan):</label>
        <input type="number" id="cm-fn" value="5" min="0" class="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white">
      </div>
      <div>
        <label class="text-emerald-400">TN (Benar Negatif):</label>
        <input type="number" id="cm-tn" value="45" min="0" class="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white">
      </div>
    </div>
  `;

  function update() {
    const tp = parseFloat(document.getElementById('cm-tp').value) || 0;
    const fp = parseFloat(document.getElementById('cm-fp').value) || 0;
    const fn = parseFloat(document.getElementById('cm-fn').value) || 0;
    const tn = parseFloat(document.getElementById('cm-tn').value) || 0;

    const total = tp + fp + fn + tn;
    const accuracy = total > 0 ? ((tp + tn) / total) : 0;
    const precision = (tp + fp) > 0 ? (tp / (tp + fp)) : 0;
    const recall = (tp + fn) > 0 ? (tp / (tp + fn)) : 0;
    const f1 = (precision + recall) > 0 ? (2 * precision * recall / (precision + recall)) : 0;

    results.innerHTML = `
      <div class="text-sky-300 font-bold mb-1">[ Skor Metrik Klasifikasi ]</div>
      <div>• Akurasi : <span class="text-white font-bold">${(accuracy * 100).toFixed(1)}%</span></div>
      <div>• Precision : <span class="text-amber-400 font-bold">${(precision * 100).toFixed(1)}%</span> (Seberapa tepat saat menuduh)</div>
      <div>• Recall : <span class="text-indigo-400 font-bold">${(recall * 100).toFixed(1)}%</span> (Seberapa sedikit kecolongan)</div>
      <div>• F1-Score : <span class="text-emerald-400 font-bold">${(f1 * 100).toFixed(1)}%</span> (Keseimbangan Precision & Recall)</div>
    `;

    if (activeChart) activeChart.destroy();
    activeChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Akurasi', 'Precision', 'Recall', 'F1-Score'],
        datasets: [{
          data: [accuracy * 100, precision * 100, recall * 100, f1 * 100],
          backgroundColor: ['#64748b', '#f59e0b', '#6366f1', '#10b981']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { grid: { color: '#334155' }, ticks: { color: '#94a3b8' }, max: 100 },
          x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
        }
      }
    });
  }

  ['cm-tp', 'cm-fp', 'cm-fn', 'cm-tn'].forEach(id => {
    document.getElementById(id).addEventListener('input', update);
  });
  update();
}

// 9. Gini Impurity Simulator
function setupGiniSimulator() {
  destroyActiveChart();
  const controls = document.getElementById('sim-controls');
  const results = document.getElementById('sim-math-results');
  const ctx = document.getElementById('sim-chart-canvas').getContext('2d');

  controls.innerHTML = `
    <div>
      <div class="flex justify-between text-xs text-slate-300">
        <span>${currentLang === 'id' ? 'Komposisi Kelas Positif' : 'Class 1 Ratio'}:</span>
        <span id="gini-ratio-val" class="text-indigo-400 font-bold font-mono">50%</span>
      </div>
      <input type="range" id="gini-slider" min="0" max="100" value="50" class="w-full accent-indigo-500 cursor-pointer">
    </div>
  `;

  function update() {
    const p1 = parseFloat(document.getElementById('gini-slider').value) / 100;
    const p0 = 1 - p1;
    document.getElementById('gini-ratio-val').textContent = Math.round(p1 * 100) + "%";

    // Gini = 1 - (p0^2 + p1^2)
    const gini = (1 - (p0 * p0 + p1 * p1)).toFixed(3);

    results.innerHTML = `
      <div class="text-indigo-300 font-bold mb-1">[ Rumus Gini: 1 - (p0² + p1²) ]</div>
      <div>• Peluang Kelas 0: ${(p0 * 100).toFixed(0)}%, Kelas 1: ${(p1 * 100).toFixed(0)}%</div>
      <div>• Nilai Gini Impurity: <span class="text-white font-bold font-mono">${gini}</span></div>
      <div class="text-[11px] text-slate-400 mt-1">
        ${gini == 0 ? '✨ Murni Sempurna (100% homogen)' : gini == 0.5 ? '⚠️ Paling Kotor/Bercampur aduk (50:50)' : 'Pemisahan sebagian'}
      </div>
    `;

    if (activeChart) activeChart.destroy();
    activeChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Kelas 0', 'Kelas 1'],
        datasets: [{
          data: [p0 * 100, p1 * 100],
          backgroundColor: ['#64748b', '#6366f1']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8' } } }
      }
    });
  }

  document.getElementById('gini-slider').addEventListener('input', update);
  update();
}

// 10. Perceptron Simulator
function setupPerceptronSimulator() {
  destroyActiveChart();
  const controls = document.getElementById('sim-controls');
  const results = document.getElementById('sim-math-results');
  const ctx = document.getElementById('sim-chart-canvas').getContext('2d');

  controls.innerHTML = `
    <div class="space-y-2 text-xs">
      <div class="flex justify-between">
        <span>Input x: <span id="p-x-val" class="text-indigo-400 font-bold">2.0</span></span>
        <span>Weight w: <span id="p-w-val" class="text-indigo-400 font-bold">1.5</span></span>
        <span>Bias b: <span id="p-b-val" class="text-indigo-400 font-bold">-1.0</span></span>
      </div>
      <input type="range" id="p-x" min="-3" max="3" step="0.5" value="2.0" class="w-full accent-indigo-500">
      <input type="range" id="p-w" min="-3" max="3" step="0.5" value="1.5" class="w-full accent-indigo-500">
      <input type="range" id="p-b" min="-3" max="3" step="0.5" value="-1.0" class="w-full accent-indigo-500">
    </div>
  `;

  function update() {
    const x = parseFloat(document.getElementById('p-x').value);
    const w = parseFloat(document.getElementById('p-w').value);
    const b = parseFloat(document.getElementById('p-b').value);

    document.getElementById('p-x-val').textContent = x.toFixed(1);
    document.getElementById('p-w-val').textContent = w.toFixed(1);
    document.getElementById('p-b-val').textContent = b.toFixed(1);

    const z = (w * x + b).toFixed(2);
    const relu = Math.max(0, parseFloat(z)).toFixed(2);
    const sigmoid = (1 / (1 + Math.exp(-parseFloat(z)))).toFixed(3);

    results.innerHTML = `
      <div class="text-sky-300 font-bold mb-1">[ Kalkulasi 1 Neuron ]</div>
      <div>• z = (w × x) + b = (${w} × ${x}) + (${b}) = <span class="text-white font-bold font-mono">${z}</span></div>
      <div>• Aktivasi ReLU: max(0, z) = <span class="text-emerald-400 font-bold font-mono">${relu}</span></div>
      <div>• Aktivasi Sigmoid: 1 / (1 + e^-z) = <span class="text-indigo-400 font-bold font-mono">${sigmoid}</span></div>
    `;

    if (activeChart) activeChart.destroy();
    activeChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Linier z', 'ReLU (max(0,z))', 'Sigmoid (0-1)'],
        datasets: [{
          data: [parseFloat(z), parseFloat(relu), parseFloat(sigmoid) * 5],
          backgroundColor: ['#64748b', '#10b981', '#6366f1']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { grid: { color: '#334155' }, ticks: { color: '#94a3b8' } },
          x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
        }
      }
    });
  }

  ['p-x', 'p-w', 'p-b'].forEach(id => {
    document.getElementById(id).addEventListener('input', update);
  });
  update();
}

// 11. Gradient Descent Simulator
function setupGradientSimulator() {
  destroyActiveChart();
  const controls = document.getElementById('sim-controls');
  const results = document.getElementById('sim-math-results');
  const ctx = document.getElementById('sim-chart-canvas').getContext('2d');

  controls.innerHTML = `
    <div>
      <div class="flex justify-between text-xs text-slate-300">
        <span>Learning Rate (α):</span>
        <span id="lr-val" class="text-indigo-400 font-bold font-mono">0.20</span>
      </div>
      <input type="range" id="lr-slider" min="0.05" max="0.9" step="0.05" value="0.2" class="w-full accent-indigo-500 cursor-pointer">
    </div>
  `;

  function update() {
    const lr = parseFloat(document.getElementById('lr-slider').value);
    document.getElementById('lr-val').textContent = lr.toFixed(2);

    // Minimize y = x^2 starting at x = 4.0
    // dy/dx = 2x
    let steps = [];
    let curX = 4.0;
    for (let i = 0; i < 6; i++) {
      steps.push({ step: i, x: curX, loss: curX * curX });
      const grad = 2 * curX;
      curX = curX - lr * grad;
    }

    results.innerHTML = `
      <div class="text-indigo-300 font-bold mb-1">[ Simulasi Optimasi Bobot (Loss = w²) ]</div>
      <div>• Step 0: w = 4.00 $\\rightarrow$ Loss = 16.00</div>
      <div>• Step 1: w = ${steps[1].x.toFixed(2)} $\\rightarrow$ Loss = ${steps[1].loss.toFixed(2)}</div>
      <div>• Step 5: w = ${steps[5].x.toFixed(2)} $\\rightarrow$ Loss = <span class="text-emerald-400 font-bold">${steps[5].loss.toFixed(4)}</span></div>
      <div class="text-[11px] text-slate-400 mt-1">Bobot w berhasil diperbaiki menuruni lereng kesalahan!</div>
    `;

    if (activeChart) activeChart.destroy();
    activeChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Step 0', 'Step 1', 'Step 2', 'Step 3', 'Step 4', 'Step 5'],
        datasets: [{
          label: 'Error (Loss)',
          data: steps.map(s => s.loss),
          borderColor: '#f43f5e',
          backgroundColor: 'rgba(244, 63, 94, 0.1)',
          fill: true,
          tension: 0.3,
          pointRadius: 5,
          pointBackgroundColor: '#f43f5e'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { grid: { color: '#334155' }, ticks: { color: '#94a3b8' } },
          x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
        }
      }
    });
  }

  document.getElementById('lr-slider').addEventListener('input', update);
  update();
}
