// Application State Management
let currentLang = localStorage.getItem('ds_lang') || 'id';
let currentModuleId = ROADMAP_DATA[0].id;
let activeTab = 'purpose';
let completedModules = JSON.parse(localStorage.getItem('ds_completed') || '[]');
let activeSimChart = null;
let activePlotChart = null;

// Helper: Translation lookup
function t(key) {
  return UI_TEXT[currentLang][key] || key;
}

// Helper: Format Math text for HTML & KaTeX
function formatMathContent(rawText) {
  if (!rawText) return '';
  // Basic markdown conversion for bold, list, breaks
  let html = rawText
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-900 font-bold">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="text-slate-700">$1</em>')
    .replace(/\n\n/g, '<div class="my-2"></div>');
  return html;
}

// Trigger KaTeX Auto-Render on container
function triggerKaTeX(container) {
  if (window.renderMathInElement) {
    try {
      renderMathInElement(container, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '$', right: '$', display: false }
        ],
        throwOnError: false
      });
    } catch (e) {
      console.warn("KaTeX render error:", e);
    }
  }
}

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  renderHeader();
  renderStageFilters();
  renderModuleList();
  loadModule(currentModuleId);
  setupSearch();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
});

// Switch Language (Bilingual)
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

  const btnId = document.getElementById('lang-id-btn');
  const btnEn = document.getElementById('lang-en-btn');
  if (currentLang === 'id') {
    btnId.className = "px-2.5 py-1 text-[11px] font-extrabold rounded bg-slate-900 text-white shadow-xs";
    btnEn.className = "px-2.5 py-1 text-[11px] font-semibold rounded text-slate-600 hover:text-slate-900";
  } else {
    btnEn.className = "px-2.5 py-1 text-[11px] font-extrabold rounded bg-slate-900 text-white shadow-xs";
    btnId.className = "px-2.5 py-1 text-[11px] font-semibold rounded text-slate-600 hover:text-slate-900";
  }

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
  allBtn.className = `px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
    currentFilterStage === 'all'
      ? 'bg-slate-900 text-white shadow-sm'
      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
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
    { num: 6, label: t('stages')[5] },
    { num: 7, label: t('stages')[6] }
  ];

  stages.forEach(st => {
    const btn = document.createElement('button');
    btn.className = `px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
      currentFilterStage === st.num
        ? 'bg-slate-900 text-white shadow-sm'
        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
    }`;
    btn.textContent = st.label;
    btn.onclick = () => {
      currentFilterStage = st.num;
      renderStageFilters();
      renderModuleList();

      // Automatically switch to the first module of this selected stage!
      const firstModuleInStage = ROADMAP_DATA.find(m => m.stage === st.num);
      if (firstModuleInStage && firstModuleInStage.id !== currentModuleId) {
        loadModule(firstModuleInStage.id);
      }
    };
    container.appendChild(btn);
  });
}

// Render Sidebar / Drawer Module List
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

  filtered.forEach(m => {
    const isCompleted = completedModules.includes(m.id);
    const isActive = m.id === currentModuleId;

    const item = document.createElement('div');
    item.className = `p-3 rounded-2xl cursor-pointer transition-all border ${
      isActive
        ? 'bg-indigo-50/80 border-indigo-600 shadow-sm'
        : 'bg-white border-slate-200 hover:border-slate-300'
    }`;

    item.innerHTML = `
      <div class="flex items-center justify-between gap-2">
        <span class="text-[10px] font-extrabold tracking-wider uppercase text-indigo-700">
          ${m.stageName[currentLang]}
        </span>
        ${isCompleted ? '<span class="text-xs text-emerald-600 font-extrabold">✓ Selesai</span>' : ''}
      </div>
      <h4 class="text-xs font-bold text-slate-900 mt-1 line-clamp-2">
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

// Setup Search
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

  // Sync active stage filter with current module
  if (currentFilterStage !== 'all' && currentFilterStage !== mod.stage) {
    currentFilterStage = mod.stage;
    renderStageFilters();
  }

  renderModuleList();

  document.getElementById('current-stage-badge').textContent = mod.stageName[currentLang];
  document.getElementById('current-title').textContent = mod.title[currentLang];

  updateMarkDoneButton();
  renderTabs();
  renderTabContent(mod);
  renderNavigationButtons(mod);
}

// Render Next / Previous Navigation Buttons
function renderNavigationButtons(mod) {
  const container = document.getElementById('nav-buttons-container');
  if (!container) return;

  const currentIndex = ROADMAP_DATA.findIndex(m => m.id === mod.id);
  const prevModule = currentIndex > 0 ? ROADMAP_DATA[currentIndex - 1] : null;
  const nextModule = currentIndex < ROADMAP_DATA.length - 1 ? ROADMAP_DATA[currentIndex + 1] : null;

  container.innerHTML = `
    ${prevModule ? `
      <button onclick="loadModule('${prevModule.id}')" class="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold shadow-xs transition-all">
        <span>←</span>
        <span class="truncate">${currentLang === 'id' ? 'Sebelumnya' : 'Previous'}</span>
      </button>
    ` : '<div class="flex-1"></div>'}

    ${nextModule ? `
      <button onclick="loadModule('${nextModule.id}')" class="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-900 text-white hover:bg-slate-800 text-xs font-bold shadow-sm transition-all">
        <span class="truncate">${currentLang === 'id' ? 'Materi Berikutnya' : 'Next Topic'}</span>
        <span>→</span>
      </button>
    ` : '<div class="flex-1"></div>'}
  `;
}

function updateMarkDoneButton() {
  const btn = document.getElementById('mark-done-btn');
  const isDone = completedModules.includes(currentModuleId);
  if (isDone) {
    btn.innerHTML = `<span class="text-emerald-600 font-bold">✓</span> <span class="text-emerald-700 font-bold">${t('markedDone')}</span>`;
    btn.className = "flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-50 border border-emerald-300";
  } else {
    btn.innerHTML = `<span>○</span> <span>${t('markDone')}</span>`;
    btn.className = "flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200 transition-all";
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

// Render Sub-Tabs Navigation
function renderTabs() {
  const tabs = [
    { key: 'purpose', label: t('tabPurpose') },
    { key: 'note', label: t('tabNote') },
    { key: 'math', label: t('tabMath') },
    { key: 'code', label: t('tabCode') },
    { key: 'sim', label: t('tabSim') }
  ];

  const container = document.getElementById('sub-tabs');
  container.innerHTML = '';

  tabs.forEach(tab => {
    const btn = document.createElement('button');
    btn.className = `flex-1 py-2 px-1 text-center text-[11px] font-bold rounded-lg transition-all whitespace-nowrap ${
      activeTab === tab.key
        ? 'bg-slate-900 text-white shadow-xs'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
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
      <div class="space-y-3.5">
        <div class="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-base">🎯</span>
            <h4 class="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
              ${currentLang === 'id' ? 'Untuk Apa Sub-Materi Ini?' : 'Why Learn This?'}
            </h4>
          </div>
          <p class="text-sm text-slate-700 leading-relaxed">${mod.purpose[currentLang]}</p>
        </div>

        <div class="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 shadow-xs">
          <div class="flex items-center gap-2 mb-1.5">
            <span class="text-base">💡</span>
            <h4 class="text-xs font-extrabold text-amber-900 uppercase tracking-wider">
              ${currentLang === 'id' ? 'Koneksi ke Tahap Berikutnya' : 'Connection to Next Stages'}
            </h4>
          </div>
          <p class="text-xs text-amber-950/90 leading-relaxed">${mod.takeNote[currentLang]}</p>
        </div>
      </div>
    `;
  } else if (activeTab === 'note') {
    contentEl.innerHTML = `
      <div class="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/70 to-white border border-indigo-200 shadow-xs space-y-2">
        <div class="flex items-center gap-2">
          <span class="text-indigo-600 font-bold text-lg">💡</span>
          <h4 class="text-xs font-extrabold text-indigo-950 uppercase tracking-wider">
            ${currentLang === 'id' ? 'Catatan Kunci Programmer (Take Note)' : 'Programmer Takeaway & Pitfalls'}
          </h4>
        </div>
        <p class="text-sm text-slate-800 leading-relaxed font-normal">${mod.takeNote[currentLang]}</p>
      </div>
    `;
  } else if (activeTab === 'math') {
    contentEl.innerHTML = `
      <div class="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div class="flex items-center gap-2 mb-1 border-b border-slate-100 pb-2">
          <span class="text-base">📐</span>
          <h4 class="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
            ${currentLang === 'id' ? 'Rumus & Logika Aritmatika Bertahap' : 'Formulas & Step-by-Step Arithmetic'}
          </h4>
        </div>
        <div id="katex-container" class="text-xs text-slate-700 leading-relaxed space-y-2">
          ${formatMathContent(mod.math[currentLang])}
        </div>
      </div>
    `;
    setTimeout(() => {
      triggerKaTeX(document.getElementById('katex-container'));
    }, 50);
  } else if (activeTab === 'code') {
    // Tab Python Code PLUS Visual Plot Preview underneath!
    contentEl.innerHTML = `
      <div class="space-y-4">
        <!-- Python Code Box -->
        <div class="rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-sm">
          <div class="flex items-center justify-between px-3.5 py-2.5 bg-slate-950 border-b border-slate-800">
            <div class="flex items-center gap-2">
              <span class="text-xs">🐍</span>
              <span class="text-[11px] font-mono font-bold text-indigo-300">Python Code (Pandas / Scikit-Learn)</span>
            </div>
            <button onclick="copyCodeText()" id="copy-btn" class="px-2.5 py-1 rounded text-[10px] font-bold bg-slate-800 text-slate-200 hover:text-white border border-slate-700 transition-colors">
              ${t('copyCode')}
            </button>
          </div>
          <pre class="p-3.5 text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed"><code id="code-snippet">${escapeHTML(mod.python.code)}</code></pre>
        </div>

        <!-- Terminal Output -->
        <div class="rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 shadow-xs">
          <div class="px-3.5 py-2 bg-slate-950 border-b border-slate-800 flex items-center gap-2">
            <span class="text-xs">📟</span>
            <span class="text-[11px] font-mono font-bold text-amber-400">Sample Terminal Output</span>
          </div>
          <pre class="p-3 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed whitespace-pre-wrap">${escapeHTML(mod.python.output)}</pre>
        </div>

        <!-- DEDICATED VISUAL CHART PREVIEW (Placed directly under code as requested!) -->
        <div class="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2.5">
          <div class="flex items-center justify-between border-b border-slate-100 pb-2">
            <div class="flex items-center gap-2">
              <span class="text-base">📊</span>
              <h4 class="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                ${t('chartPreviewTitle')}
              </h4>
            </div>
            <span class="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
              Matplotlib / Seaborn
            </span>
          </div>
          <p class="text-[11px] text-slate-500">
            ${currentLang === 'id' ? 'Visualisasi grafik yang dihasilkan saat kode Python di atas dijalankan:' : 'Graphical visualization rendered when the Python code above is executed:'}
          </p>
          <div class="relative w-full h-56 bg-slate-50 rounded-xl p-2 border border-slate-200 flex items-center justify-center">
            <canvas id="plot-preview-canvas"></canvas>
          </div>
        </div>
      </div>
    `;

    setTimeout(() => {
      renderPythonPlotPreview(mod);
    }, 60);

  } else if (activeTab === 'sim') {
    renderSimulatorView(contentEl, mod);
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
    btn.className = "px-2.5 py-1 rounded text-[10px] font-bold bg-emerald-600 text-white";
    setTimeout(() => {
      btn.textContent = t('copyCode');
      btn.className = "px-2.5 py-1 rounded text-[10px] font-bold bg-slate-800 text-slate-200 hover:text-white border border-slate-700 transition-colors";
    }, 1500);
  });
}

function openDrawer() {
  document.getElementById('mobile-drawer').classList.remove('hidden');
}
function closeDrawer() {
  document.getElementById('mobile-drawer').classList.add('hidden');
}

// ==========================================
// RENDER REALISTIC PYTHON CHART PLOT PREVIEWS
// ==========================================
function renderPythonPlotPreview(mod) {
  if (activePlotChart) {
    activePlotChart.destroy();
    activePlotChart = null;
  }
  const canvas = document.getElementById('plot-preview-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const chartType = mod.chartType;

  if (chartType === 'histogram') {
    // Histogram + KDE curve for Age
    activePlotChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['18-22', '23-26', '27-30', '31-35', '36-65 (Outlier)'],
        datasets: [{
          label: 'Frekuensi Orang (Usia)',
          data: [5, 4, 2, 1, 1],
          backgroundColor: '#4338ca',
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: { display: true, text: 'Distribusi Usia Pelanggan (Right-Skewed)', color: '#0f172a', font: { weight: 'bold' } },
          legend: { display: false }
        },
        scales: {
          y: { grid: { color: '#e2e8f0' }, ticks: { color: '#64748b' }, title: { display: true, text: 'Frekuensi' } },
          x: { grid: { display: false }, ticks: { color: '#64748b' } }
        }
      }
    });
  } else if (chartType === 'stats') {
    // Bar chart of salaries with Mean vs Median line
    activePlotChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Budi (4jt)', 'Siti (5jt)', 'Andi (6jt)', 'Dewi (7jt)', 'Bos (100jt)'],
        datasets: [{
          label: 'Gaji Karyawan (Juta Rp)',
          data: [4, 5, 6, 7, 100],
          backgroundColor: ['#6366f1', '#6366f1', '#10b981', '#6366f1', '#f43f5e'],
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: { display: true, text: 'Gaji: Mean = 24.4 jt (Terganggu) vs Median = 6.0 jt (Aman)', color: '#0f172a' },
          legend: { display: false }
        },
        scales: {
          y: { grid: { color: '#e2e8f0' }, ticks: { color: '#64748b' } },
          x: { grid: { display: false }, ticks: { color: '#64748b' } }
        }
      }
    });
  } else if (chartType === 'boxplot') {
    // Boxplot simulated visualization
    activePlotChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Batas Bawah (6.5)', 'Kuartil 1 (14)', 'Median (16)', 'Kuartil 3 (19)', 'Batas Atas (26.5)', 'OUTLIER (100)'],
        datasets: [{
          data: [6.5, 14, 16, 19, 26.5, 100],
          backgroundColor: ['#94a3b8', '#38bdf8', '#4f46e5', '#38bdf8', '#94a3b8', '#ef4444'],
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: { display: true, text: 'Visualisasi Rentang Boxplot & Titik Outlier', color: '#0f172a' },
          legend: { display: false }
        },
        scales: {
          y: { grid: { color: '#e2e8f0' }, ticks: { color: '#64748b' } },
          x: { grid: { display: false }, ticks: { color: '#64748b', font: { size: 10 } } }
        }
      }
    });
  } else if (chartType === 'heatmap') {
    // Heatmap correlation matrix representation
    activePlotChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Jam vs Nilai (+0.99)', 'Jam vs Tidur (-0.98)', 'Nilai vs Tidur (-0.97)'],
        datasets: [{
          label: 'Koefisien Korelasi (r)',
          data: [0.99, -0.98, -0.97],
          backgroundColor: ['#10b981', '#ef4444', '#ef4444'],
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: { display: true, text: 'Heatmap Matriks Korelasi (Positif Hijau vs Negatif Merah)', color: '#0f172a' },
          legend: { display: false }
        },
        scales: {
          y: { min: -1, max: 1, grid: { color: '#e2e8f0' }, ticks: { color: '#64748b' } },
          x: { grid: { display: false }, ticks: { color: '#64748b', font: { size: 10 } } }
        }
      }
    });
  } else if (chartType === 'missing') {
    activePlotChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Umur Budi (25)', 'Umur Siti (NaN -> 28)', 'Umur Andi (28)', 'Umur Dewi (30)'],
        datasets: [{
          label: 'Umur Setelah Diisi Median',
          data: [25, 28, 28, 30],
          backgroundColor: ['#6366f1', '#10b981', '#6366f1', '#6366f1'],
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: { display: true, text: 'Data Setelah Imputasi Median (Siti diisi 28)', color: '#0f172a' },
          legend: { display: false }
        },
        scales: {
          y: { grid: { color: '#e2e8f0' }, ticks: { color: '#64748b' } },
          x: { grid: { display: false }, ticks: { color: '#64748b', font: { size: 10 } } }
        }
      }
    });
  } else if (chartType === 'scaling') {
    activePlotChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Gaji 3 jt', 'Gaji 8 jt', 'Gaji 25 jt'],
        datasets: [
          { label: 'MinMax [0 s/d 1]', data: [0, 0.23, 1], backgroundColor: '#10b981' },
          { label: 'Standard Scaler Z-Score', data: [-0.9, -0.37, 1.27], backgroundColor: '#4338ca' }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: { display: true, text: 'Perbandingan Skala MinMax vs StandardScaler', color: '#0f172a' }
        },
        scales: {
          y: { grid: { color: '#e2e8f0' }, ticks: { color: '#64748b' } },
          x: { grid: { display: false }, ticks: { color: '#64748b' } }
        }
      }
    });
  } else if (chartType === 'encoding') {
    activePlotChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Baris 1 (Jakarta)', 'Baris 2 (Bandung)', 'Baris 3 (Surabaya)'],
        datasets: [
          { label: 'Kota_Bandung', data: [0, 1, 0], backgroundColor: '#ef4444' },
          { label: 'Kota_Jakarta', data: [1, 0, 0], backgroundColor: '#3b82f6' },
          { label: 'Kota_Surabaya', data: [0, 0, 1], backgroundColor: '#10b981' }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: { display: true, text: 'Matriks One-Hot Dummy (Kolom Biner 0 atau 1)', color: '#0f172a' }
        },
        scales: {
          y: { max: 1, grid: { color: '#e2e8f0' }, ticks: { color: '#64748b' } },
          x: { grid: { display: false }, ticks: { color: '#64748b' } }
        }
      }
    });
  } else if (chartType === 'traintest') {
    activePlotChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Data Training (80%)', 'Data Testing (20%)'],
        datasets: [{
          data: [80, 20],
          backgroundColor: ['#4338ca', '#38bdf8']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: { display: true, text: 'Proporsi Pembagian Data (Train vs Test)', color: '#0f172a' },
          legend: { position: 'bottom' }
        }
      }
    });
  } else if (chartType === 'regression') {
    // Scatter points + Regression Line
    const pts = [{ x: 60, y: 300 }, { x: 80, y: 420 }, { x: 100, y: 500 }, { x: 120, y: 610 }, { x: 150, y: 750 }];
    const line = [{ x: 50, y: 4.97 * 50 + 3.3 }, { x: 160, y: 4.97 * 160 + 3.3 }];
    activePlotChart = new Chart(ctx, {
      type: 'scatter',
      data: {
        datasets: [
          { label: 'Data Riil Rumah', data: pts, backgroundColor: '#38bdf8', pointRadius: 6 },
          { label: 'Garis Best Fit y=4.97x+3.3', data: line, type: 'line', borderColor: '#ef4444', borderWidth: 2.5, pointRadius: 0 }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { title: { display: true, text: 'Garis Regresi Linier (Luas Tanah vs Harga Rumah)', color: '#0f172a' } },
        scales: {
          x: { grid: { color: '#e2e8f0' }, ticks: { color: '#64748b' }, title: { display: true, text: 'Luas Tanah (m2)' } },
          y: { grid: { color: '#e2e8f0' }, ticks: { color: '#64748b' }, title: { display: true, text: 'Harga (Juta Rp)' } }
        }
      }
    });
  } else if (chartType === 'overfitting') {
    activePlotChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Underfitting', 'Good Fit (Target)', 'Overfitting'],
        datasets: [
          { label: 'Error di Data Training', data: [45, 10, 0], backgroundColor: '#3b82f6' },
          { label: 'Error di Data Test (Ujian)', data: [50, 12, 60], backgroundColor: '#ef4444' }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { title: { display: true, text: 'Perbandingan Error: Underfitting vs Good Fit vs Overfitting', color: '#0f172a' } },
        scales: {
          y: { grid: { color: '#e2e8f0' }, ticks: { color: '#64748b' } },
          x: { grid: { display: false }, ticks: { color: '#64748b' } }
        }
      }
    });
  } else if (chartType === 'regeval') {
    activePlotChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['MAE (17.5 Jt)', 'RMSE (19.36 Jt)', 'R2 Score (*100) (96.25%)'],
        datasets: [{
          data: [17.5, 19.36, 96.25],
          backgroundColor: ['#10b981', '#6366f1', '#38bdf8'],
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { title: { display: true, text: 'Hasil Metrik Evaluasi Regresi', color: '#0f172a' }, legend: { display: false } },
        scales: {
          y: { grid: { color: '#e2e8f0' }, ticks: { color: '#64748b' } },
          x: { grid: { display: false }, ticks: { color: '#64748b' } }
        }
      }
    });
  } else if (chartType === 'sigmoid') {
    const curve = [];
    for (let x = -5; x <= 5; x += 0.5) {
      curve.push({ x: x, y: 1 / (1 + Math.exp(-x)) });
    }
    activePlotChart = new Chart(ctx, {
      type: 'line',
      data: {
        datasets: [{
          label: 'Kurva Peluang Sigmoid',
          data: curve,
          borderColor: '#4338ca',
          borderWidth: 3,
          pointRadius: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { title: { display: true, text: 'Kurva S-Sigmoid (Pemetaan Probabilitas 0.0 s/d 1.0)', color: '#0f172a' } },
        scales: {
          x: { grid: { color: '#e2e8f0' }, ticks: { color: '#64748b' } },
          y: { min: 0, max: 1, grid: { color: '#e2e8f0' }, ticks: { color: '#64748b' } }
        }
      }
    });
  } else if (chartType === 'tree') {
    activePlotChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Root (Gini=0.66)', 'Petal Width <= 0.8 (Gini=0.0 Murni)', 'Petal Width > 0.8 (Gini=0.5)'],
        datasets: [{
          label: 'Gini Impurity Cabang Pohon',
          data: [0.66, 0.0, 0.5],
          backgroundColor: ['#64748b', '#10b981', '#f59e0b'],
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { title: { display: true, text: 'Pohon Memilih Pemisahan dengan Gini Terendah', color: '#0f172a' }, legend: { display: false } },
        scales: {
          y: { max: 1, grid: { color: '#e2e8f0' }, ticks: { color: '#64748b' } },
          x: { grid: { display: false }, ticks: { color: '#64748b', font: { size: 10 } } }
        }
      }
    });
  } else if (chartType === 'confmatrix') {
    activePlotChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Akurasi (75%)', 'Precision (75%)', 'Recall (75%)', 'F1-Score (75%)'],
        datasets: [{
          data: [75, 75, 75, 75],
          backgroundColor: ['#64748b', '#f59e0b', '#4338ca', '#10b981'],
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { title: { display: true, text: 'Skor Confusion Matrix Klasifikasi', color: '#0f172a' }, legend: { display: false } },
        scales: {
          y: { max: 100, grid: { color: '#e2e8f0' }, ticks: { color: '#64748b' } },
          x: { grid: { display: false }, ticks: { color: '#64748b' } }
        }
      }
    });
  } else if (chartType === 'forest') {
    activePlotChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Petal Length', 'Petal Width', 'Sepal Length', 'Sepal Width'],
        datasets: [{
          label: 'Feature Importance (%)',
          data: [44.1, 42.4, 11.2, 2.3],
          backgroundColor: '#4338ca',
          borderRadius: 6
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: { title: { display: true, text: 'Tingkat Kepentingan Fitur dari 100 Pohon', color: '#0f172a' }, legend: { display: false } },
        scales: {
          x: { grid: { color: '#e2e8f0' }, ticks: { color: '#64748b' } },
          y: { grid: { display: false }, ticks: { color: '#0f172a', font: { weight: 'bold' } } }
        }
      }
    });
  } else if (chartType === 'boosting') {
    const errorStages = [0.8, 0.5, 0.32, 0.2, 0.12, 0.08, 0.05, 0.03, 0.01];
    activePlotChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Estafet 1', 'Estafet 5', 'Estafet 10', 'Estafet 15', 'Estafet 20', 'Estafet 25', 'Estafet 30', 'Estafet 40', 'Estafet 50'],
        datasets: [{
          label: 'Loss Error Residual',
          data: errorStages,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true,
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { title: { display: true, text: 'Gradient Boosting: Error Menyusut Tiap Putaran', color: '#0f172a' } },
        scales: {
          y: { grid: { color: '#e2e8f0' }, ticks: { color: '#64748b' } },
          x: { grid: { display: false }, ticks: { color: '#64748b' } }
        }
      }
    });
  } else if (chartType === 'kmeans') {
    const cluster1 = [{x: 15, y: 39}, {x: 15, y: 81}, {x: 16, y: 6}, {x: 16, y: 77}, {x: 17, y: 40}];
    const cluster2 = [{x: 70, y: 75}, {x: 72, y: 70}, {x: 75, y: 80}, {x: 78, y: 65}, {x: 80, y: 85}];
    activePlotChart = new Chart(ctx, {
      type: 'scatter',
      data: {
        datasets: [
          { label: 'Cluster 1 (Nasabah Hemat)', data: cluster1, backgroundColor: '#3b82f6', pointRadius: 6 },
          { label: 'Cluster 2 (Nasabah Sultan)', data: cluster2, backgroundColor: '#10b981', pointRadius: 6 },
          { label: 'Centroid Pusat', data: [{x: 15.8, y: 48.6}, {x: 75, y: 75}], backgroundColor: '#ef4444', pointRadius: 10, pointStyle: 'triangle' }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { title: { display: true, text: 'Hasil Pengelompokan K-Means 2 Cluster', color: '#0f172a' } },
        scales: {
          x: { grid: { color: '#e2e8f0' }, ticks: { color: '#64748b' } },
          y: { grid: { color: '#e2e8f0' }, ticks: { color: '#64748b' } }
        }
      }
    });
  } else if (chartType === 'perceptron') {
    activePlotChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Input x1*w1 (1.0)', 'Input x2*w2 (-3.0)', 'Bias b (1.0)', 'Total z (-1.0)', 'Output ReLU (0.0)'],
        datasets: [{
          data: [1.0, -3.0, 1.0, -1.0, 0.0],
          backgroundColor: ['#3b82f6', '#ef4444', '#f59e0b', '#64748b', '#10b981'],
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { title: { display: true, text: 'Kalkulasi 1 Neuron: Nilai Negatif Dipadamkan oleh ReLU', color: '#0f172a' }, legend: { display: false } },
        scales: {
          y: { grid: { color: '#e2e8f0' }, ticks: { color: '#64748b' } },
          x: { grid: { display: false }, ticks: { color: '#64748b', font: { size: 10 } } }
        }
      }
    });
  } else if (chartType === 'mlp') {
    activePlotChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Input Layer (4 Fitur)', 'Hidden Layer 1 (8 Neuron)', 'Output Layer (1 Nilai)'],
        datasets: [{
          data: [4, 8, 1],
          backgroundColor: ['#3b82f6', '#4338ca', '#10b981'],
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { title: { display: true, text: 'Arsitektur Lapisan Multi-Layer Perceptron (MLP)', color: '#0f172a' }, legend: { display: false } },
        scales: {
          y: { grid: { color: '#e2e8f0' }, ticks: { color: '#64748b' } },
          x: { grid: { display: false }, ticks: { color: '#0f172a', font: { weight: 'bold' } } }
        }
      }
    });
  } else if (chartType === 'gradient') {
    activePlotChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Step 1', 'Step 2', 'Step 3', 'Step 4', 'Step 5'],
        datasets: [{
          label: 'Loss Error (MSE)',
          data: [25.0, 16.0, 10.24, 6.55, 4.19],
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          fill: true,
          tension: 0.3,
          pointRadius: 6,
          pointBackgroundColor: '#ef4444'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { title: { display: true, text: 'Penurunan Error via Gradient Descent & Backprop', color: '#0f172a' } },
        scales: {
          y: { grid: { color: '#e2e8f0' }, ticks: { color: '#64748b' } },
          x: { grid: { display: false }, ticks: { color: '#64748b' } }
        }
      }
    });
  }
}

// ==========================================
// SIMULATOR VIEW (TAB SIMULATOR)
// ==========================================
function renderSimulatorView(container, mod) {
  container.innerHTML = `
    <div class="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
      <div>
        <h4 class="text-xs font-extrabold text-slate-900 uppercase tracking-wider">${t('simTitle')}</h4>
        <p class="text-xs text-slate-500 mt-0.5">
          ${currentLang === 'id' ? 'Geser slider di bawah untuk melihat kalkulasi manual & grafik terupdate secara live di layar HP Anda!' : 'Drag the sliders below to see live math calculations and real-time chart updates!'}
        </p>
      </div>

      <!-- Controls Area -->
      <div id="sim-controls" class="space-y-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200"></div>

      <!-- Live Calculation Card -->
      <div id="sim-math-results" class="p-3.5 bg-indigo-50/70 rounded-xl border border-indigo-100 text-xs font-mono space-y-1"></div>

      <!-- Chart Canvas -->
      <div class="relative w-full h-56 bg-slate-50 rounded-xl p-2 border border-slate-200 flex items-center justify-center">
        <canvas id="sim-chart-canvas"></canvas>
      </div>
    </div>
  `;

  setTimeout(() => {
    if (mod.simType === 'dist') setupDistSimulator();
    else if (mod.simType === 'stats') setupStatsSimulator();
    else if (mod.simType === 'iqr') setupIqrSimulator();
    else if (mod.simType === 'correlation') setupCorrelationSimulator();
    else if (mod.simType === 'missing') setupMissingSimulator();
    else if (mod.simType === 'scaling') setupScalingSimulator();
    else if (mod.simType === 'encoding') setupEncodingSimulator();
    else if (mod.simType === 'traintest') setupTrainTestSimulator();
    else if (mod.simType === 'regression') setupRegressionSimulator();
    else if (mod.simType === 'overfitting') setupOverfittingSimulator();
    else if (mod.simType === 'regeval') setupRegEvalSimulator();
    else if (mod.simType === 'logistic') setupLogisticSimulator();
    else if (mod.simType === 'gini') setupGiniSimulator();
    else if (mod.simType === 'confmatrix') setupConfMatrixSimulator();
    else if (mod.simType === 'forest') setupForestSimulator();
    else if (mod.simType === 'boosting') setupBoostingSimulator();
    else if (mod.simType === 'kmeans') setupKMeansSimulator();
    else if (mod.simType === 'perceptron') setupPerceptronSimulator();
    else if (mod.simType === 'mlp') setupMlpSimulator();
    else if (mod.simType === 'gradient') setupGradientSimulator();
  }, 50);
}

function destroySimChart() {
  if (activeSimChart) {
    activeSimChart.destroy();
    activeSimChart = null;
  }
}

// 1. Distribution Simulator
function setupDistSimulator() {
  destroySimChart();
  const controls = document.getElementById('sim-controls');
  const results = document.getElementById('sim-math-results');
  const ctx = document.getElementById('sim-chart-canvas').getContext('2d');

  controls.innerHTML = `
    <div>
      <div class="flex justify-between text-xs text-slate-700 font-semibold mb-1">
        <span>Tingkat Kemencengan (Skewness Slider):</span>
        <span id="skew-val" class="text-indigo-700 font-bold font-mono">0 (Normal Simetris)</span>
      </div>
      <input type="range" id="skew-slider" min="-2" max="2" step="1" value="0" class="w-full accent-indigo-600 cursor-pointer">
    </div>
  `;

  function update() {
    const val = parseInt(document.getElementById('skew-slider').value);
    let label = 'Normal Simetris (Bell Curve)';
    let data = [2, 6, 12, 6, 2];
    let mean = '50';
    let median = '50';

    if (val > 0) {
      label = 'Positive Skew (Mencong ke Kanan)';
      data = [15, 10, 4, 2, 1];
      mean = '65';
      median = '40';
    } else if (val < 0) {
      label = 'Negative Skew (Mencong ke Kiri)';
      data = [1, 2, 4, 10, 15];
      mean = '35';
      median = '60';
    }

    document.getElementById('skew-val').textContent = label;
    results.innerHTML = `
      <div class="text-slate-900 font-bold mb-1">[ Karakteristik Distribusi ]</div>
      <div>• Bentuk: <span class="text-indigo-700 font-bold">${label}</span></div>
      <div>• Rata-rata (Mean): ${mean} | Nilai Tengah (Median): ${median}</div>
      <div class="text-slate-600 mt-1">${val > 0 ? '⚠️ Ekor kanan panjang akibat ada segelintir angka raksasa.' : val < 0 ? '⚠️ Ekor kiri panjang.' : '✨ Bentuk lonceng sempurna, ideal untuk Machine Learning.'}</div>
    `;

    if (activeSimChart) activeSimChart.destroy();
    activeSimChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Grup 1', 'Grup 2', 'Grup 3', 'Grup 4', 'Grup 5'],
        datasets: [{
          data: data,
          backgroundColor: '#4338ca',
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { grid: { color: '#e2e8f0' }, ticks: { color: '#64748b' } },
          x: { grid: { display: false }, ticks: { color: '#64748b' } }
        }
      }
    });
  }

  document.getElementById('skew-slider').addEventListener('input', update);
  update();
}

// 2. Stats Simulator
function setupStatsSimulator() {
  destroySimChart();
  const controls = document.getElementById('sim-controls');
  const results = document.getElementById('sim-math-results');
  const ctx = document.getElementById('sim-chart-canvas').getContext('2d');

  controls.innerHTML = `
    <div>
      <div class="flex justify-between text-xs text-slate-700 font-semibold mb-1">
        <span>Nilai Outlier Gaji Karyawan:</span>
        <span id="outlier-val" class="text-indigo-700 font-bold font-mono">100 Juta</span>
      </div>
      <input type="range" id="outlier-slider" min="10" max="200" value="100" class="w-full accent-indigo-600 cursor-pointer">
    </div>
  `;

  function update() {
    const outlier = parseFloat(document.getElementById('outlier-slider').value);
    document.getElementById('outlier-val').textContent = outlier + " Juta";
    const data = [4, 5, 6, 7, outlier];
    const mean = (data.reduce((a,b)=>a+b, 0) / data.length).toFixed(1);
    const median = 6.0;

    results.innerHTML = `
      <div class="text-slate-900 font-bold mb-1">[ Perbandingan Mean vs Median ]</div>
      <div>• Mean (Rata-rata): <span class="text-rose-600 font-bold">${mean} Juta</span> (Terdistorsi oleh angka outlier!)</div>
      <div>• Median (Nilai Tengah): <span class="text-emerald-600 font-bold">${median} Juta</span> (Tetap tenang & mewakili mayoritas)</div>
    `;

    if (activeSimChart) activeSimChart.destroy();
    activeSimChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Karyawan 1 (4jt)', 'Karyawan 2 (5jt)', 'Karyawan 3 (6jt)', 'Karyawan 4 (7jt)', `Outlier (${outlier}jt)`],
        datasets: [{
          data: data,
          backgroundColor: data.map(d => d === outlier ? '#ef4444' : '#4338ca'),
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { grid: { color: '#e2e8f0' }, ticks: { color: '#64748b' } },
          x: { grid: { display: false }, ticks: { color: '#64748b', font: { size: 10 } } }
        }
      }
    });
  }

  document.getElementById('outlier-slider').addEventListener('input', update);
  update();
}

// 3. IQR Outlier Simulator
function setupIqrSimulator() {
  destroySimChart();
  const controls = document.getElementById('sim-controls');
  const results = document.getElementById('sim-math-results');
  const ctx = document.getElementById('sim-chart-canvas').getContext('2d');

  controls.innerHTML = `
    <div>
      <div class="flex justify-between text-xs text-slate-700 font-semibold mb-1">
        <span>Uji Angka Sampel:</span>
        <span id="iqr-val" class="text-indigo-700 font-bold font-mono">45</span>
      </div>
      <input type="range" id="iqr-slider" min="0" max="100" value="45" class="w-full accent-indigo-600 cursor-pointer">
    </div>
  `;

  function update() {
    const val = parseFloat(document.getElementById('iqr-slider').value);
    document.getElementById('iqr-val').textContent = val;

    const lower = 6.5;
    const upper = 26.5;
    const isOutlier = val < lower || val > upper;

    results.innerHTML = `
      <div class="text-slate-900 font-bold mb-1">[ Rumus Batas Aman IQR ]</div>
      <div>• Batas Bawah: Q1 - (1.5 × IQR) = <span class="font-bold">${lower}</span></div>
      <div>• Batas Atas: Q3 + (1.5 × IQR) = <span class="font-bold">${upper}</span></div>
      <div class="mt-1 font-bold ${isOutlier ? 'text-rose-600' : 'text-emerald-600'}">
        Status: Angka ${val} adalah ${isOutlier ? '⚠️ OUTLIER (Pencilan ekstrem)' : '✅ DATA NORMAL'}
      </div>
    `;

    if (activeSimChart) activeSimChart.destroy();
    activeSimChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Batas Bawah (6.5)', 'Titik Uji Anda', 'Batas Atas (26.5)'],
        datasets: [{
          data: [lower, val, upper],
          backgroundColor: ['#94a3b8', isOutlier ? '#ef4444' : '#10b981', '#94a3b8'],
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { grid: { color: '#e2e8f0' }, ticks: { color: '#64748b' }, max: 100 },
          x: { grid: { display: false }, ticks: { color: '#64748b' } }
        }
      }
    });
  }

  document.getElementById('iqr-slider').addEventListener('input', update);
  update();
}

// 4. Correlation Simulator
function setupCorrelationSimulator() {
  destroySimChart();
  const controls = document.getElementById('sim-controls');
  const results = document.getElementById('sim-math-results');
  const ctx = document.getElementById('sim-chart-canvas').getContext('2d');

  controls.innerHTML = `
    <div>
      <div class="flex justify-between text-xs text-slate-700 font-semibold mb-1">
        <span>Nilai Korelasi Pearson (r):</span>
        <span id="corr-val" class="text-indigo-700 font-bold font-mono">+0.80</span>
      </div>
      <input type="range" id="corr-slider" min="-1" max="1" step="0.1" value="0.8" class="w-full accent-indigo-600 cursor-pointer">
    </div>
  `;

  function update() {
    const r = parseFloat(document.getElementById('corr-slider').value);
    document.getElementById('corr-val').textContent = (r >= 0 ? '+' : '') + r.toFixed(2);

    let desc = '';
    if (r > 0.7) desc = 'Korelasi Positif Kuat (X naik, Y pasti naik)';
    else if (r > 0.2) desc = 'Korelasi Positif Sedang';
    else if (r >= -0.2 && r <= 0.2) desc = 'Tidak Ada Korelasi (Titik menyebar acak)';
    else if (r < -0.7) desc = 'Korelasi Negatif Kuat (X naik, Y justru anjlok)';
    else desc = 'Korelasi Negatif Sedang';

    results.innerHTML = `
      <div class="text-slate-900 font-bold mb-1">[ Analisis Korelasi Pearson ]</div>
      <div>• Nilai r: <span class="text-indigo-700 font-bold">${r.toFixed(2)}</span></div>
      <div>• Pola: <span class="text-slate-700 font-bold">${desc}</span></div>
    `;

    const points = [];
    for (let i = 1; i <= 25; i++) {
      const x = i;
      const noise = (Math.random() - 0.5) * 25 * (1 - Math.abs(r));
      const y = r >= 0 ? (r * x * 2 + 10 + noise) : ((1 + r) * 50 - r * x * 2 + noise);
      points.push({ x: x, y: Math.max(0, y) });
    }

    if (activeSimChart) activeSimChart.destroy();
    activeSimChart = new Chart(ctx, {
      type: 'scatter',
      data: {
        datasets: [{
          label: 'Data Titik',
          data: points,
          backgroundColor: '#4338ca',
          pointRadius: 5
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: '#e2e8f0' }, ticks: { color: '#64748b' } },
          y: { grid: { color: '#e2e8f0' }, ticks: { color: '#64748b' } }
        }
      }
    });
  }

  document.getElementById('corr-slider').addEventListener('input', update);
  update();
}

// 5. Missing Value Simulator
function setupMissingSimulator() {
  destroySimChart();
  const controls = document.getElementById('sim-controls');
  const results = document.getElementById('sim-math-results');
  const ctx = document.getElementById('sim-chart-canvas').getContext('2d');

  controls.innerHTML = `
    <div>
      <label class="text-xs text-slate-700 font-semibold mb-1 block">Pilih Strategi Pengisian Missing Value:</label>
      <select id="missing-select" class="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-900">
        <option value="median">Imputasi Median (Rekomendasi Terbaik)</option>
        <option value="mean">Imputasi Mean</option>
        <option value="drop">Drop Baris (Hapus)</option>
      </select>
    </div>
  `;

  function update() {
    const strategy = document.getElementById('missing-select').value;
    let label = '';
    let val = 28;
    if (strategy === 'median') {
      label = 'Mengisi NaN dengan Median (28.0) - Aman dari outlier';
      val = 28;
    } else if (strategy === 'mean') {
      label = 'Mengisi NaN dengan Mean (36.5) - Agak bias karena outlier usia 80';
      val = 36.5;
    } else {
      label = 'Menghapus baris NaN - Data berkurang dari 5 menjadi 4';
      val = 0;
    }

    results.innerHTML = `
      <div class="text-slate-900 font-bold mb-1">[ Dampak Penanganan ]</div>
      <div>• Strategi: ${strategy.toUpperCase()}</div>
      <div>• Keterangan: ${label}</div>
    `;

    if (activeSimChart) activeSimChart.destroy();
    activeSimChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Baris 1 (20)', 'Baris 2 (22)', 'Baris 3 (NaN Terisi)', 'Baris 4 (24)', 'Baris 5 (80)'],
        datasets: [{
          data: [20, 22, val, 24, 80],
          backgroundColor: ['#64748b', '#64748b', '#10b981', '#64748b', '#f59e0b'],
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { grid: { color: '#e2e8f0' }, ticks: { color: '#64748b' } },
          x: { grid: { display: false }, ticks: { color: '#64748b', font: { size: 10 } } }
        }
      }
    });
  }

  document.getElementById('missing-select').addEventListener('change', update);
  update();
}

// 6. Scaling Simulator
function setupScalingSimulator() {
  destroySimChart();
  const controls = document.getElementById('sim-controls');
  const results = document.getElementById('sim-math-results');
  const ctx = document.getElementById('sim-chart-canvas').getContext('2d');

  controls.innerHTML = `
    <div>
      <div class="flex justify-between text-xs text-slate-700 font-semibold mb-1">
        <span>Gaji Asli yang Diskalakan:</span>
        <span id="scale-raw" class="text-indigo-700 font-bold font-mono">15 Juta</span>
      </div>
      <input type="range" id="scale-slider" min="3" max="30" value="15" class="w-full accent-indigo-600 cursor-pointer">
    </div>
  `;

  function update() {
    const raw = parseFloat(document.getElementById('scale-slider').value);
    document.getElementById('scale-raw').textContent = raw + " Juta";

    const min = 3, max = 30, mean = 15, std = 6;
    const minMax = ((raw - min) / (max - min)).toFixed(2);
    const standard = ((raw - mean) / std).toFixed(2);

    results.innerHTML = `
      <div class="text-slate-900 font-bold mb-1">[ Hasil Transformasi Angka ]</div>
      <div>• Nilai Asli: ${raw} Juta</div>
      <div>• Min-Max (0 s/d 1): <span class="text-emerald-600 font-bold">${minMax}</span></div>
      <div>• StandardScaler (Z-Score): <span class="text-indigo-700 font-bold">${standard}</span> (Pusat di 0)</div>
    `;

    if (activeSimChart) activeSimChart.destroy();
    activeSimChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Original (Juta)', 'MinMax (*10)', 'Z-Score (*5)'],
        datasets: [{
          data: [raw, parseFloat(minMax) * 10, parseFloat(standard) * 5],
          backgroundColor: ['#64748b', '#10b981', '#4338ca'],
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { grid: { color: '#e2e8f0' }, ticks: { color: '#64748b' } },
          x: { grid: { display: false }, ticks: { color: '#64748b' } }
        }
      }
    });
  }

  document.getElementById('scale-slider').addEventListener('input', update);
  update();
}

// 7. Encoding Simulator
function setupEncodingSimulator() {
  destroySimChart();
  const controls = document.getElementById('sim-controls');
  const results = document.getElementById('sim-math-results');
  const ctx = document.getElementById('sim-chart-canvas').getContext('2d');

  controls.innerHTML = `
    <div>
      <label class="text-xs text-slate-700 font-semibold mb-1 block">Pilih Input Kategori Kota:</label>
      <select id="city-select" class="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-900">
        <option value="Jakarta">Jakarta</option>
        <option value="Bandung">Bandung</option>
        <option value="Surabaya">Surabaya</option>
      </select>
    </div>
  `;

  function update() {
    const city = document.getElementById('city-select').value;
    const isBdg = city === 'Bandung' ? 1 : 0;
    const isJkt = city === 'Jakarta' ? 1 : 0;
    const isSub = city === 'Surabaya' ? 1 : 0;

    results.innerHTML = `
      <div class="text-slate-900 font-bold mb-1">[ Vektor Biner One-Hot ]</div>
      <div>• Kota_Bandung : ${isBdg}</div>
      <div>• Kota_Jakarta : ${isJkt}</div>
      <div>• Kota_Surabaya: ${isSub}</div>
      <div class="text-emerald-700 font-bold mt-1">Vektor: [${isBdg}, ${isJkt}, ${isSub}]</div>
    `;

    if (activeSimChart) activeSimChart.destroy();
    activeSimChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Kota_Bandung', 'Kota_Jakarta', 'Kota_Surabaya'],
        datasets: [{
          data: [isBdg, isJkt, isSub],
          backgroundColor: ['#ef4444', '#3b82f6', '#10b981'],
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { max: 1, grid: { color: '#e2e8f0' }, ticks: { color: '#64748b' } },
          x: { grid: { display: false }, ticks: { color: '#64748b' } }
        }
      }
    });
  }

  document.getElementById('city-select').addEventListener('change', update);
  update();
}

// 8. Train Test Split Simulator
function setupTrainTestSimulator() {
  destroySimChart();
  const controls = document.getElementById('sim-controls');
  const results = document.getElementById('sim-math-results');
  const ctx = document.getElementById('sim-chart-canvas').getContext('2d');

  controls.innerHTML = `
    <div>
      <div class="flex justify-between text-xs text-slate-700 font-semibold mb-1">
        <span>Rasio Data Training (%):</span>
        <span id="split-val" class="text-indigo-700 font-bold font-mono">80% Train : 20% Test</span>
      </div>
      <input type="range" id="split-slider" min="60" max="90" step="5" value="80" class="w-full accent-indigo-600 cursor-pointer">
    </div>
  `;

  function update() {
    const trainRatio = parseInt(document.getElementById('split-slider').value);
    const testRatio = 100 - trainRatio;
    document.getElementById('split-val').textContent = `${trainRatio}% Train : ${testRatio}% Test`;

    results.innerHTML = `
      <div class="text-slate-900 font-bold mb-1">[ Alokasi Data ]</div>
      <div>• Dari 1.000 data: <span class="text-indigo-700 font-bold">${trainRatio * 10} baris</span> untuk belajar.</div>
      <div>• <span class="text-sky-600 font-bold">${testRatio * 10} baris</span> disembunyikan untuk ujian model.</div>
    `;

    if (activeSimChart) activeSimChart.destroy();
    activeSimChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Data Training', 'Data Testing'],
        datasets: [{
          data: [trainRatio, testRatio],
          backgroundColor: ['#4338ca', '#38bdf8']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } }
      }
    });
  }

  document.getElementById('split-slider').addEventListener('input', update);
  update();
}

// 9. Linear Regression Simulator
function setupRegressionSimulator() {
  destroySimChart();
  const controls = document.getElementById('sim-controls');
  const results = document.getElementById('sim-math-results');
  const ctx = document.getElementById('sim-chart-canvas').getContext('2d');

  controls.innerHTML = `
    <div class="space-y-2">
      <div>
        <div class="flex justify-between text-xs text-slate-700 font-semibold mb-1">
          <span>Kemiringan Garis (Slope w):</span>
          <span id="reg-w-val" class="text-indigo-700 font-bold font-mono">5.0</span>
        </div>
        <input type="range" id="reg-w" min="1" max="10" step="0.5" value="5.0" class="w-full accent-indigo-600">
      </div>
      <div>
        <div class="flex justify-between text-xs text-slate-700 font-semibold mb-1">
          <span>Titik Potong (Bias b):</span>
          <span id="reg-b-val" class="text-indigo-700 font-bold font-mono">10</span>
        </div>
        <input type="range" id="reg-b" min="-50" max="50" step="5" value="10" class="w-full accent-indigo-600">
      </div>
    </div>
  `;

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

    let totalSqError = 0;
    realData.forEach(d => {
      const pred = w * d.x + b;
      totalSqError += Math.pow(d.y - pred, 2);
    });
    const mse = (totalSqError / realData.length).toFixed(1);

    results.innerHTML = `
      <div class="text-slate-900 font-bold mb-1">[ Persamaan Garis: y = ${w}x + (${b}) ]</div>
      <div>• Total MSE Error: <span class="text-rose-600 font-bold">${mse}</span></div>
      <div>• Prediksi Rumah Luas 100 m²: <span class="text-emerald-600 font-bold">${(w * 100 + b).toFixed(0)} Juta</span></div>
    `;

    const lineData = [
      { x: 40, y: w * 40 + b },
      { x: 140, y: w * 140 + b }
    ];

    if (activeSimChart) activeSimChart.destroy();
    activeSimChart = new Chart(ctx, {
      type: 'scatter',
      data: {
        datasets: [
          { label: 'Data Riil', data: realData, backgroundColor: '#38bdf8', pointRadius: 6 },
          { label: 'Garis Anda', data: lineData, type: 'line', borderColor: '#ef4444', borderWidth: 2.5, pointRadius: 0 }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: '#e2e8f0' }, ticks: { color: '#64748b' }, min: 40, max: 140 },
          y: { grid: { color: '#e2e8f0' }, ticks: { color: '#64748b' }, min: 100, max: 800 }
        }
      }
    });
  }

  document.getElementById('reg-w').addEventListener('input', update);
  document.getElementById('reg-b').addEventListener('input', update);
  update();
}

// 10. Overfitting Simulator
function setupOverfittingSimulator() {
  destroySimChart();
  const controls = document.getElementById('sim-controls');
  const results = document.getElementById('sim-math-results');
  const ctx = document.getElementById('sim-chart-canvas').getContext('2d');

  controls.innerHTML = `
    <div>
      <label class="text-xs text-slate-700 font-semibold mb-1 block">Kompleksitas Derajat Model (Polinomial Degree):</label>
      <select id="fit-select" class="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-900">
        <option value="under">Derajat 1 (Underfitting - Terlalu Sederhana)</option>
        <option value="good" selected>Derajat 2 (Good Fit - Pas & Konsep Benar)</option>
        <option value="over">Derajat 15 (Overfitting - Menghafal Data)</option>
      </select>
    </div>
  `;

  function update() {
    const state = document.getElementById('fit-select').value;
    let desc = '';
    let trainErr = 0, testErr = 0;
    if (state === 'under') {
      desc = 'Underfitting: Garis lurus kaku gagal membaca lekukan data.';
      trainErr = 45; testErr = 48;
    } else if (state === 'good') {
      desc = 'Good Fit: Melengkung luwes mengikuti pola dasar tanpa terganggu noise.';
      trainErr = 10; testErr = 12;
    } else {
      desc = 'Overfitting: Berkelok-kelok ekstrem demi mengejar semua titik latihan.';
      trainErr = 0; testErr = 75;
    }

    results.innerHTML = `
      <div class="text-slate-900 font-bold mb-1">[ Analisis Kondisi ]</div>
      <div>• Status: ${state.toUpperCase()}</div>
      <div>• ${desc}</div>
      <div class="mt-1 font-bold">Error Train: ${trainErr} | Error Test: ${testErr}</div>
    `;

    if (activeSimChart) activeSimChart.destroy();
    activeSimChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Error Data Latihan', 'Error Data Ujian (Test)'],
        datasets: [{
          data: [trainErr, testErr],
          backgroundColor: ['#3b82f6', '#ef4444'],
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { max: 80, grid: { color: '#e2e8f0' }, ticks: { color: '#64748b' } },
          x: { grid: { display: false }, ticks: { color: '#64748b' } }
        }
      }
    });
  }

  document.getElementById('fit-select').addEventListener('change', update);
  update();
}

// 11. Regression Evaluation Simulator
function setupRegEvalSimulator() {
  destroySimChart();
  const controls = document.getElementById('sim-controls');
  const results = document.getElementById('sim-math-results');
  const ctx = document.getElementById('sim-chart-canvas').getContext('2d');

  controls.innerHTML = `
    <div>
      <div class="flex justify-between text-xs text-slate-700 font-semibold mb-1">
        <span>Rata-rata Selisih Kesalahan Tebakan (Juta):</span>
        <span id="eval-err-val" class="text-indigo-700 font-bold font-mono">15 Juta</span>
      </div>
      <input type="range" id="eval-err" min="5" max="80" value="15" class="w-full accent-indigo-600">
    </div>
  `;

  function update() {
    const err = parseFloat(document.getElementById('eval-err').value);
    document.getElementById('eval-err-val').textContent = err + " Juta";

    const mae = err;
    const mse = err * err;
    const rmse = Math.sqrt(mse);
    const r2 = Math.max(0, 1 - (mse / 8000)).toFixed(2);

    results.innerHTML = `
      <div class="text-slate-900 font-bold mb-1">[ Perhitungan Metrik Evaluasi ]</div>
      <div>• MAE (Rata-rata Meleset): <span class="text-emerald-600 font-bold">${mae} Juta</span></div>
      <div>• RMSE (Hukuman Kuadrat): <span class="text-indigo-700 font-bold">${rmse} Juta</span></div>
      <div>• R² Score: <span class="text-slate-900 font-bold">${r2}</span> (${Math.round(r2*100)}% pola dijelaskan)</div>
    `;

    if (activeSimChart) activeSimChart.destroy();
    activeSimChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['MAE (Juta)', 'RMSE (Juta)', 'R² Score (*100)'],
        datasets: [{
          data: [mae, rmse, r2 * 100],
          backgroundColor: ['#10b981', '#4338ca', '#38bdf8'],
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { grid: { color: '#e2e8f0' }, ticks: { color: '#64748b' } },
          x: { grid: { display: false }, ticks: { color: '#64748b' } }
        }
      }
    });
  }

  document.getElementById('eval-err').addEventListener('input', update);
  update();
}

// 12. Logistic Simulator
function setupLogisticSimulator() {
  destroySimChart();
  const controls = document.getElementById('sim-controls');
  const results = document.getElementById('sim-math-results');
  const ctx = document.getElementById('sim-chart-canvas').getContext('2d');

  controls.innerHTML = `
    <div>
      <div class="flex justify-between text-xs text-slate-700 font-semibold mb-1">
        <span>Nilai Linier z = (wx + b):</span>
        <span id="sig-z-val" class="text-indigo-700 font-bold font-mono">1.5</span>
      </div>
      <input type="range" id="sig-z" min="-5" max="5" step="0.2" value="1.5" class="w-full accent-indigo-600">
    </div>
  `;

  function update() {
    const z = parseFloat(document.getElementById('sig-z').value);
    document.getElementById('sig-z-val').textContent = z.toFixed(1);

    const prob = 1 / (1 + Math.exp(-z));
    const isClass1 = prob >= 0.5;

    results.innerHTML = `
      <div class="text-slate-900 font-bold mb-1">[ Perhitungan Probabilitas Sigmoid ]</div>
      <div>• 1 / (1 + e^-${z.toFixed(1)}) = <span class="text-indigo-700 font-bold font-mono">${(prob * 100).toFixed(1)}%</span></div>
      <div class="mt-1 font-bold ${isClass1 ? 'text-emerald-600' : 'text-slate-600'}">
        Keputusan: ${isClass1 ? '✅ KELAS 1 (Positif / Lulus)' : '❌ KELAS 0 (Negatif / Gagal)'}
      </div>
    `;

    const curve = [];
    for (let x = -5; x <= 5; x += 0.5) {
      curve.push({ x: x, y: 1 / (1 + Math.exp(-x)) });
    }

    if (activeSimChart) activeSimChart.destroy();
    activeSimChart = new Chart(ctx, {
      type: 'scatter',
      data: {
        datasets: [
          { label: 'Kurva Sigmoid', data: curve, showLine: true, borderColor: '#4338ca', borderWidth: 2.5, pointRadius: 0 },
          { label: 'Posisi Anda', data: [{ x: z, y: prob }], backgroundColor: isClass1 ? '#10b981' : '#ef4444', pointRadius: 7 }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { min: -5, max: 5, grid: { color: '#e2e8f0' }, ticks: { color: '#64748b' } },
          y: { min: 0, max: 1, grid: { color: '#e2e8f0' }, ticks: { color: '#64748b' } }
        }
      }
    });
  }

  document.getElementById('sig-z').addEventListener('input', update);
  update();
}

// 13. Gini Simulator
function setupGiniSimulator() {
  destroySimChart();
  const controls = document.getElementById('sim-controls');
  const results = document.getElementById('sim-math-results');
  const ctx = document.getElementById('sim-chart-canvas').getContext('2d');

  controls.innerHTML = `
    <div>
      <div class="flex justify-between text-xs text-slate-700 font-semibold mb-1">
        <span>Proporsi Kelas 1 di Cabang:</span>
        <span id="gini-ratio-val" class="text-indigo-700 font-bold font-mono">50%</span>
      </div>
      <input type="range" id="gini-slider" min="0" max="100" value="50" class="w-full accent-indigo-600">
    </div>
  `;

  function update() {
    const p1 = parseFloat(document.getElementById('gini-slider').value) / 100;
    const p0 = 1 - p1;
    document.getElementById('gini-ratio-val').textContent = Math.round(p1 * 100) + "%";

    const gini = (1 - (p0 * p0 + p1 * p1)).toFixed(3);

    results.innerHTML = `
      <div class="text-slate-900 font-bold mb-1">[ Rumus Gini: 1 - (p0² + p1²) ]</div>
      <div>• Nilai Gini Impurity: <span class="text-slate-900 font-bold font-mono">${gini}</span></div>
      <div class="text-slate-600 mt-1">${gini == 0 ? '✨ Murni Sempurna (100% satu kelas)' : gini == 0.5 ? '⚠️ Paling Kotor (Campur aduk 50:50)' : 'Pemisahan sebagian'}</div>
    `;

    if (activeSimChart) activeSimChart.destroy();
    activeSimChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Kelas 0', 'Kelas 1'],
        datasets: [{
          data: [p0 * 100, p1 * 100],
          backgroundColor: ['#64748b', '#4338ca']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } }
      }
    });
  }

  document.getElementById('gini-slider').addEventListener('input', update);
  update();
}

// 14. Confusion Matrix Simulator
function setupConfMatrixSimulator() {
  destroySimChart();
  const controls = document.getElementById('sim-controls');
  const results = document.getElementById('sim-math-results');
  const ctx = document.getElementById('sim-chart-canvas').getContext('2d');

  controls.innerHTML = `
    <div class="grid grid-cols-2 gap-2 text-xs">
      <div>
        <label class="text-emerald-700 font-bold">TP (Benar Positif):</label>
        <input type="number" id="cm-tp" value="40" min="0" class="w-full bg-white border border-slate-300 rounded p-1 text-slate-900">
      </div>
      <div>
        <label class="text-rose-600 font-bold">FP (Salah Tuduh):</label>
        <input type="number" id="cm-fp" value="10" min="0" class="w-full bg-white border border-slate-300 rounded p-1 text-slate-900">
      </div>
      <div>
        <label class="text-rose-600 font-bold">FN (Kecolongan):</label>
        <input type="number" id="cm-fn" value="5" min="0" class="w-full bg-white border border-slate-300 rounded p-1 text-slate-900">
      </div>
      <div>
        <label class="text-emerald-700 font-bold">TN (Benar Negatif):</label>
        <input type="number" id="cm-tn" value="45" min="0" class="w-full bg-white border border-slate-300 rounded p-1 text-slate-900">
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
      <div class="text-slate-900 font-bold mb-1">[ Hasil Metrik Klasifikasi ]</div>
      <div>• Akurasi : <span class="font-bold">${(accuracy * 100).toFixed(1)}%</span></div>
      <div>• Precision: <span class="text-amber-700 font-bold">${(precision * 100).toFixed(1)}%</span></div>
      <div>• Recall   : <span class="text-indigo-700 font-bold">${(recall * 100).toFixed(1)}%</span></div>
      <div>• F1-Score : <span class="text-emerald-700 font-bold">${(f1 * 100).toFixed(1)}%</span></div>
    `;

    if (activeSimChart) activeSimChart.destroy();
    activeSimChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Akurasi', 'Precision', 'Recall', 'F1-Score'],
        datasets: [{
          data: [accuracy * 100, precision * 100, recall * 100, f1 * 100],
          backgroundColor: ['#64748b', '#f59e0b', '#4338ca', '#10b981'],
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { max: 100, grid: { color: '#e2e8f0' }, ticks: { color: '#64748b' } },
          x: { grid: { display: false }, ticks: { color: '#64748b' } }
        }
      }
    });
  }

  ['cm-tp', 'cm-fp', 'cm-fn', 'cm-tn'].forEach(id => {
    document.getElementById(id).addEventListener('input', update);
  });
  update();
}

// 15. Random Forest Simulator
function setupForestSimulator() {
  destroySimChart();
  const controls = document.getElementById('sim-controls');
  const results = document.getElementById('sim-math-results');
  const ctx = document.getElementById('sim-chart-canvas').getContext('2d');

  controls.innerHTML = `
    <div>
      <div class="flex justify-between text-xs text-slate-700 font-semibold mb-1">
        <span>Jumlah Pohon dalam Hutan (n_estimators):</span>
        <span id="trees-val" class="text-indigo-700 font-bold font-mono">50 Pohon</span>
      </div>
      <input type="range" id="trees-slider" min="5" max="150" step="5" value="50" class="w-full accent-indigo-600">
    </div>
  `;

  function update() {
    const trees = parseInt(document.getElementById('trees-slider').value);
    document.getElementById('trees-val').textContent = trees + " Pohon";

    const stability = Math.min(99, 80 + Math.round(trees / 8));

    results.innerHTML = `
      <div class="text-slate-900 font-bold mb-1">[ Efek Banyak Pohon (Wisdom of Crowd) ]</div>
      <div>• Total Pohon: ${trees} Pohon</div>
      <div>• Stabilitas Voting: <span class="text-emerald-600 font-bold">${stability}%</span></div>
      <div class="text-slate-600 mt-1">Pohon yang banyak meredam risiko overfitting pohon tunggal.</div>
    `;

    if (activeSimChart) activeSimChart.destroy();
    activeSimChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Pohon Tunggal (1)', 'Hutan Kecil (10)', `Hutan Anda (${trees})`],
        datasets: [{
          data: [72, 85, stability],
          backgroundColor: ['#ef4444', '#f59e0b', '#10b981'],
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { max: 100, grid: { color: '#e2e8f0' }, ticks: { color: '#64748b' } },
          x: { grid: { display: false }, ticks: { color: '#64748b' } }
        }
      }
    });
  }

  document.getElementById('trees-slider').addEventListener('input', update);
  update();
}

// 16. Boosting Simulator
function setupBoostingSimulator() {
  destroySimChart();
  const controls = document.getElementById('sim-controls');
  const results = document.getElementById('sim-math-results');
  const ctx = document.getElementById('sim-chart-canvas').getContext('2d');

  controls.innerHTML = `
    <div>
      <div class="flex justify-between text-xs text-slate-700 font-semibold mb-1">
        <span>Learning Rate (Ukuran Koreksi Error):</span>
        <span id="boost-lr-val" class="text-indigo-700 font-bold font-mono">0.10</span>
      </div>
      <input type="range" id="boost-lr" min="0.05" max="0.5" step="0.05" value="0.10" class="w-full accent-indigo-600">
    </div>
  `;

  function update() {
    const lr = parseFloat(document.getElementById('boost-lr').value);
    document.getElementById('boost-lr-val').textContent = lr.toFixed(2);

    const losses = [];
    let cur = 1.0;
    for (let i = 0; i < 6; i++) {
      losses.push(cur);
      cur = Math.max(0.01, cur * (1 - lr));
    }

    results.innerHTML = `
      <div class="text-slate-900 font-bold mb-1">[ Perbaikan Estafet Residual ]</div>
      <div>• Loss Awal: 1.00 $\\rightarrow$ Loss Putaran 5: <span class="text-emerald-600 font-bold">${losses[5].toFixed(3)}</span></div>
      <div class="text-slate-600 mt-1">Setiap pohon mengoreksi sisa kesalahan dari pohon sebelumnya.</div>
    `;

    if (activeSimChart) activeSimChart.destroy();
    activeSimChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Pohon 1', 'Pohon 2', 'Pohon 3', 'Pohon 4', 'Pohon 5', 'Pohon 6'],
        datasets: [{
          label: 'Error',
          data: losses,
          borderColor: '#10b981',
          tension: 0.3,
          fill: true,
          backgroundColor: 'rgba(16, 185, 129, 0.1)'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { grid: { color: '#e2e8f0' }, ticks: { color: '#64748b' } },
          x: { grid: { display: false }, ticks: { color: '#64748b' } }
        }
      }
    });
  }

  document.getElementById('boost-lr').addEventListener('input', update);
  update();
}

// 17. KMeans Simulator
function setupKMeansSimulator() {
  destroySimChart();
  const controls = document.getElementById('sim-controls');
  const results = document.getElementById('sim-math-results');
  const ctx = document.getElementById('sim-chart-canvas').getContext('2d');

  controls.innerHTML = `
    <div>
      <div class="flex justify-between text-xs text-slate-700 font-semibold mb-1">
        <span>Jumlah Kelompok (K):</span>
        <span id="k-val" class="text-indigo-700 font-bold font-mono">K = 2</span>
      </div>
      <input type="range" id="k-slider" min="2" max="4" value="2" class="w-full accent-indigo-600">
    </div>
  `;

  function update() {
    const k = parseInt(document.getElementById('k-slider').value);
    document.getElementById('k-val').textContent = "K = " + k;

    results.innerHTML = `
      <div class="text-slate-900 font-bold mb-1">[ Segmentasi K-Means ]</div>
      <div>• Menemukan ${k} titik pusat centroid terpisah.</div>
      <div class="text-slate-600 mt-1">Tiap data dikelompokkan ke centroid terdekatnya.</div>
    `;

    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];
    const datasets = [];
    for (let i = 0; i < k; i++) {
      datasets.push({
        label: `Cluster ${i+1}`,
        data: [{x: 10 + i * 25 + Math.random()*5, y: 20 + i * 20 + Math.random()*5}, {x: 15 + i * 25, y: 25 + i * 20}],
        backgroundColor: colors[i],
        pointRadius: 7
      });
    }

    if (activeSimChart) activeSimChart.destroy();
    activeSimChart = new Chart(ctx, {
      type: 'scatter',
      data: { datasets: datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } },
        scales: {
          x: { min: 0, max: 100, grid: { color: '#e2e8f0' }, ticks: { color: '#64748b' } },
          y: { min: 0, max: 100, grid: { color: '#e2e8f0' }, ticks: { color: '#64748b' } }
        }
      }
    });
  }

  document.getElementById('k-slider').addEventListener('input', update);
  update();
}

// 18. Perceptron Simulator
function setupPerceptronSimulator() {
  destroySimChart();
  const controls = document.getElementById('sim-controls');
  const results = document.getElementById('sim-math-results');
  const ctx = document.getElementById('sim-chart-canvas').getContext('2d');

  controls.innerHTML = `
    <div class="space-y-2 text-xs">
      <div class="flex justify-between font-semibold">
        <span>Input x: <span id="p-x-val" class="text-indigo-700 font-mono">2.0</span></span>
        <span>Bobot w: <span id="p-w-val" class="text-indigo-700 font-mono">1.5</span></span>
        <span>Bias b: <span id="p-b-val" class="text-indigo-700 font-mono">-1.0</span></span>
      </div>
      <input type="range" id="p-x" min="-3" max="3" step="0.5" value="2.0" class="w-full accent-indigo-600">
      <input type="range" id="p-w" min="-3" max="3" step="0.5" value="1.5" class="w-full accent-indigo-600">
      <input type="range" id="p-b" min="-3" max="3" step="0.5" value="-1.0" class="w-full accent-indigo-600">
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
      <div class="text-slate-900 font-bold mb-1">[ Kalkulasi 1 Neuron ]</div>
      <div>• z = (${w} × ${x}) + (${b}) = <span class="font-bold">${z}</span></div>
      <div>• ReLU: max(0, z) = <span class="text-emerald-600 font-bold">${relu}</span></div>
      <div>• Sigmoid: 1/(1+e^-z) = <span class="text-indigo-700 font-bold">${sigmoid}</span></div>
    `;

    if (activeSimChart) activeSimChart.destroy();
    activeSimChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Linier z', 'Output ReLU', 'Output Sigmoid (*5)'],
        datasets: [{
          data: [parseFloat(z), parseFloat(relu), parseFloat(sigmoid) * 5],
          backgroundColor: ['#64748b', '#10b981', '#4338ca'],
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { grid: { color: '#e2e8f0' }, ticks: { color: '#64748b' } },
          x: { grid: { display: false }, ticks: { color: '#64748b' } }
        }
      }
    });
  }

  ['p-x', 'p-w', 'p-b'].forEach(id => {
    document.getElementById(id).addEventListener('input', update);
  });
  update();
}

// 19. MLP Simulator
function setupMlpSimulator() {
  destroySimChart();
  const controls = document.getElementById('sim-controls');
  const results = document.getElementById('sim-math-results');
  const ctx = document.getElementById('sim-chart-canvas').getContext('2d');

  controls.innerHTML = `
    <div>
      <div class="flex justify-between text-xs text-slate-700 font-semibold mb-1">
        <span>Jumlah Neuron di Hidden Layer:</span>
        <span id="mlp-nodes-val" class="text-indigo-700 font-bold font-mono">8 Neuron</span>
      </div>
      <input type="range" id="mlp-slider" min="4" max="32" step="4" value="8" class="w-full accent-indigo-600">
    </div>
  `;

  function update() {
    const nodes = parseInt(document.getElementById('mlp-slider').value);
    document.getElementById('mlp-nodes-val').textContent = nodes + " Neuron";

    const totalParams = (4 * nodes + nodes) + (nodes * 1 + 1);

    results.innerHTML = `
      <div class="text-slate-900 font-bold mb-1">[ Kapasitas Model MLP ]</div>
      <div>• Arsitektur: 4 Input $\\rightarrow$ ${nodes} Hidden $\\rightarrow$ 1 Output</div>
      <div>• Total Parameter (Bobot & Bias): <span class="text-indigo-700 font-bold">${totalParams}</span> variabel bebas</div>
    `;

    if (activeSimChart) activeSimChart.destroy();
    activeSimChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Input Layer (4)', `Hidden Layer (${nodes})`, 'Output Layer (1)'],
        datasets: [{
          data: [4, nodes, 1],
          backgroundColor: ['#3b82f6', '#4338ca', '#10b981'],
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { grid: { color: '#e2e8f0' }, ticks: { color: '#64748b' } },
          x: { grid: { display: false }, ticks: { color: '#64748b' } }
        }
      }
    });
  }

  document.getElementById('mlp-slider').addEventListener('input', update);
  update();
}

// 20. Gradient Simulator
function setupGradientSimulator() {
  destroySimChart();
  const controls = document.getElementById('sim-controls');
  const results = document.getElementById('sim-math-results');
  const ctx = document.getElementById('sim-chart-canvas').getContext('2d');

  controls.innerHTML = `
    <div>
      <div class="flex justify-between text-xs text-slate-700 font-semibold mb-1">
        <span>Learning Rate (α):</span>
        <span id="lr-val" class="text-indigo-700 font-bold font-mono">0.20</span>
      </div>
      <input type="range" id="lr-slider" min="0.05" max="0.8" step="0.05" value="0.2" class="w-full accent-indigo-600">
    </div>
  `;

  function update() {
    const lr = parseFloat(document.getElementById('lr-slider').value);
    document.getElementById('lr-val').textContent = lr.toFixed(2);

    let steps = [];
    let curX = 4.0;
    for (let i = 0; i < 6; i++) {
      steps.push({ step: i, x: curX, loss: curX * curX });
      const grad = 2 * curX;
      curX = curX - lr * grad;
    }

    results.innerHTML = `
      <div class="text-slate-900 font-bold mb-1">[ Optimasi Bobot via Turunan Gradient ]</div>
      <div>• Step 0: Bobot = 4.00 $\\rightarrow$ Error Loss = 16.00</div>
      <div>• Step 5: Bobot = ${steps[5].x.toFixed(2)} $\\rightarrow$ Error Loss = <span class="text-emerald-600 font-bold">${steps[5].loss.toFixed(4)}</span></div>
      <div class="text-slate-600 mt-1">Bobot berhasil digeser menuruni lereng kesalahan.</div>
    `;

    if (activeSimChart) activeSimChart.destroy();
    activeSimChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Step 0', 'Step 1', 'Step 2', 'Step 3', 'Step 4', 'Step 5'],
        datasets: [{
          label: 'Error (Loss)',
          data: steps.map(s => s.loss),
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          fill: true,
          tension: 0.3,
          pointRadius: 5,
          pointBackgroundColor: '#ef4444'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { grid: { color: '#e2e8f0' }, ticks: { color: '#64748b' } },
          x: { grid: { display: false }, ticks: { color: '#64748b' } }
        }
      }
    });
  }

  document.getElementById('lr-slider').addEventListener('input', update);
  update();
}
