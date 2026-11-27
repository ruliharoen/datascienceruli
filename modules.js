// Comprehensive Bilingual Data Science Curriculum (EDA to Deep Learning)
// Designed for programmers: Intuitive math, step-by-step arithmetic, practical pitfalls, Python syntax & visual plots.

const ROADMAP_DATA = [
  // ===================== STAGE 1: EDA =====================
  {
    id: "eda-dist",
    stage: 1,
    stageName: { id: "1. EDA (Exploratory Data Analysis)", en: "1. EDA (Exploratory Data Analysis)" },
    title: { id: "Distribusi Data, Histogram & Skewness", en: "Data Distribution, Histograms & Skewness" },
    icon: "activity",
    purpose: {
      id: "Melihat 'bentuk' sebaran data Anda. Apakah data berkumpul rapi di tengah (Distribusi Normal/Bell Curve), atau menceng/berat sebelah ke kiri atau ke kanan (Skewed Data).",
      en: "Inspect the 'shape' of your data. Check if values cluster symmetrically in the center (Normal Bell Curve) or skew heavily to the left or right."
    },
    takeNote: {
      id: "Banyak algoritma Machine Learning (terutama Regresi Linier) mengasumsikan data terdistribusi normal. Jika data sangat menceng (misal: data gaji yang kebanyakan kecil tapi ada beberapa triliuner), model akan bias. Solusi programmer: terapkan log transform (`np.log1p`) untuk meluruskan data.",
      en: "Many ML algorithms assume normally distributed features. Highly skewed data (like income data with extreme billionaires) causes model bias. Programmer fix: apply log transformation (`np.log1p`) to normalize distribution shape."
    },
    math: {
      id: `
**Konsep Bentuk Distribusi:**
* **Normal (Simetris):** Rata-rata (Mean) $\\approx$ Nilai Tengah (Median). Bentuk kurva seperti lonceng simetris sempurna.
* **Positive Skew (Mencong Kanan):** Ekor panjang menjulur ke kanan. Ada sedikit angka yang teramat besar (contoh: kekayaan, harga properti). Di sini: $\\text{Mean} > \\text{Median}$.
* **Negative Skew (Mencong Kiri):** Ekor panjang menjulur ke kiri. Mayoritas angka bernilai tinggi (contoh: umur lansia pensiun). Di sini: $\\text{Mean} < \\text{Median}$.

**Contoh Hitungan Sederhana:**
Data: [2, 3, 3, 4, 5, 6, 20] (angka 20 menarik kurva ke kanan)
* Mean = (2 + 3 + 3 + 4 + 5 + 6 + 20) ÷ 7 = 6.14
* Median = 4 (nilai tengah)
* Karena Mean (6.14) > Median (4), maka data ini **Positive Skewed**.
      `,
      en: `
**Distribution Shapes:**
* **Normal (Symmetric):** Mean $\\approx$ Median. Perfect bell-shaped curve.
* **Right/Positive Skew:** Long tail extends rightwards. A few extreme high outliers exist (e.g. wealth). Mean > Median.
* **Left/Negative Skew:** Long tail extends leftwards. Most values are high (e.g. retirement age). Mean < Median.

**Step-by-Step Arithmetic Example:**
Data: [2, 3, 3, 4, 5, 6, 20]
* Mean = (2 + 3 + 3 + 4 + 5 + 6 + 20) ÷ 7 = 6.14
* Median = 4
* Since Mean (6.14) > Median (4), distribution is **Positive Skewed**.
      `
    },
    python: {
      code: `import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt

# Data sampel usia pelanggan
data = [18, 20, 21, 22, 22, 23, 24, 25, 26, 28, 30, 35, 65]
df = pd.DataFrame(data, columns=['Usia'])

# Visualisasi Histogram + Garis Estimasi Kerapatan (KDE)
plt.figure(figsize=(7, 4))
sns.histplot(df['Usia'], kde=True, color='#4338ca')
plt.title('Distribusi Usia Pelanggan')
plt.xlabel('Usia (Tahun)')
plt.ylabel('Frekuensi (Jumlah Orang)')
plt.show()`,
      output: `Skewness value: 2.14 (Data mencong ke kanan / Right-Skewed karena ada outlier usia 65)`
    },
    chartType: "histogram",
    simType: "dist"
  },
  {
    id: "eda-stats",
    stage: 1,
    stageName: { id: "1. EDA (Exploratory Data Analysis)", en: "1. EDA (Exploratory Data Analysis)" },
    title: { id: "Pemusatan Data: Mean, Median & Standar Deviasi", en: "Summary Statistics: Mean, Median & Std Dev" },
    icon: "bar-chart-2",
    purpose: {
      id: "Memahami 'pusat' dan 'sebaran' data numerik. Mengetahui apakah angka rata-rata yang kita peroleh bisa dipercaya atau tertipu oleh nilai pencilan ekstrim.",
      en: "Understand center and dispersion of numerical data. Discover whether the mean accurately represents typical observations or is distorted by anomalies."
    },
    takeNote: {
      id: "Sebagai programmer: Mean = `array.sum() / array.length`. Jika ada 1 angka bernilai 1.000.000 di antara data 1-10, Mean akan melonjak hancur! Di sinilah MEDIAN (nilai tengah array yang sudah di-sort) jadi penyelamat karena kebal terhadap outlier.",
      en: "Programmer rule: Mean is `sum / length`. A single extreme number ruins the mean. MEDIAN (middle element of sorted array) is robust against extreme outliers."
    },
    math: {
      id: `
**Langkah Aritmatika Sederhana:**
Diberikan 5 angka gaji karyawan (dalam juta): [4, 5, 6, 7, 100]

1. **Mean (Rata-rata):**
   * Langkah 1: Jumlahkan semua angka: 4 + 5 + 6 + 7 + 100 = 122
   * Langkah 2: Bagi dengan jumlah orang (5): 122 ÷ 5 = **24.4 Juta** (Menipu! Mayoritas cuma 4-7 jt).

2. **Median (Nilai Tengah):**
   * Langkah 1: Urutkan data dari kecil ke besar: [4, 5, 6, 7, 100]
   * Langkah 2: Ambil posisi persis di tengah $\\rightarrow$ **6 Juta** (Jauh lebih realistis!).

3. **Standar Deviasi ($\\sigma$ / Std Dev - Ukuran Sebaran):**
   * Menghitung seberapa jauh rata-rata jarak tiap data dari titik pusatnya. Jika Std Dev kecil, data berkumpul rapat. Jika besar, data menyebar luas.
      `,
      en: `
**Step-by-Step Arithmetic Calculation:**
Sample salaries (in millions): [4, 5, 6, 7, 100]

1. **Mean:**
   * Step 1: Sum all numbers = 4 + 5 + 6 + 7 + 100 = 122
   * Step 2: Divide by count (5) = 122 ÷ 5 = **24.4** (Distorted by 100!).

2. **Median:**
   * Step 1: Sort data: [4, 5, 6, 7, 100]
   * Step 2: Pick middle value = **6** (Reflects typical observation!).

3. **Standard Deviation ($\\sigma$):**
   * Measures average spread around the mean. Small std dev = tight cluster; Large std dev = wide spread.
      `
    },
    python: {
      code: `import pandas as pd

gaji = pd.Series([4, 5, 6, 7, 100])

print("Mean (Rata-rata)    :", gaji.mean())
print("Median (Nilai Tengah):", gaji.median())
print("Standar Deviasi      :", gaji.std())
print("\\nRingkasan Statistik (5-Number Summary):\\n", gaji.describe())`,
      output: `Mean (Rata-rata)    : 24.4
Median (Nilai Tengah): 6.0
Standar Deviasi      : 42.27

Ringkasan Statistik:
count      5.000000
mean      24.400000
std       42.270557
min        4.000000
50%        6.000000  <- Median riil
max      100.000000`
    },
    chartType: "stats",
    simType: "stats"
  },
  {
    id: "eda-outlier",
    stage: 1,
    stageName: { id: "1. EDA (Exploratory Data Analysis)", en: "1. EDA (Exploratory Data Analysis)" },
    title: { id: "Deteksi Outlier dengan IQR & Boxplot", en: "Outlier Detection with IQR & Boxplot" },
    icon: "alert-triangle",
    purpose: {
      id: "Menemukan data aneh atau pencilan (misal umur 999 tahun atau harga barang minus) yang dapat merusak akurasi model machine learning.",
      en: "Identify anomalous extreme points (like age 999 or negative prices) that distort machine learning models."
    },
    takeNote: {
      id: "Rumus 1.5x IQR adalah standar industri. Jangan langsung main HAPUS outlier! Selalu pastikan dulu: apakah itu kesalahan ketik (typo) atau fenomena bisnis penting (misal transaksi fraud atau nasabah super kaya).",
      en: "The 1.5x IQR rule is the gold standard. Don't blindly drop outliers! Check if it is a data entry typo or a valuable rare business signal (e.g., fraud)."
    },
    math: {
      id: `
**Langkah Hitung Manual Rumus IQR:**
Diberikan data terurut: [10, 12, 14, 15, 16, 18, 19, 21, 100]

* **Langkah 1 (Kuartil 1 / Q1):** Nilai di posisi 25% data terbawah = **14**
* **Langkah 2 (Kuartil 3 / Q3):** Nilai di posisi 75% data = **19**
* **Langkah 3 (IQR):** $IQR = Q3 - Q1 = 19 - 14 = 5$
* **Langkah 4 (Batas Bawah Aman):** $Q1 - (1.5 \\times 5) = 14 - 7.5 = \\mathbf{6.5}$
* **Langkah 5 (Batas Atas Aman):** $Q3 + (1.5 \\times 5) = 19 + 7.5 = \\mathbf{26.5}$

**Kesimpulan:** Angka di luar rentang [6.5 s/d 26.5] adalah Outlier. Angka **100** resmi dinyatakan Outlier!
      `,
      en: `
**Step-by-Step Manual IQR Calculation:**
Sorted dataset: [10, 12, 14, 15, 16, 18, 19, 21, 100]

* **Step 1 (Q1 - 25th percentile):** = **14**
* **Step 2 (Q3 - 75th percentile):** = **19**
* **Step 3 (IQR):** $IQR = Q3 - Q1 = 19 - 14 = 5$
* **Step 4 (Lower Fence):** $Q1 - (1.5 \\times 5) = 14 - 7.5 = \\mathbf{6.5}$
* **Step 5 (Upper Fence):** $Q3 + (1.5 \\times 5) = 19 + 7.5 = \\mathbf{26.5}$

**Verdict:** Any value outside [6.5 to 26.5] is an outlier. Number **100** is verified as an outlier!
      `
    },
    python: {
      code: `import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt

data = pd.Series([10, 12, 14, 15, 16, 18, 19, 21, 100])

Q1 = data.quantile(0.25)
Q3 = data.quantile(0.75)
IQR = Q3 - Q1

batas_bawah = Q1 - 1.5 * IQR
batas_atas = Q3 + 1.5 * IQR

# Visualisasi Boxplot
plt.figure(figsize=(7, 3))
sns.boxplot(x=data, color='#38bdf8')
plt.title('Deteksi Outlier dengan Boxplot')
plt.show()`,
      output: `Batas Bawah : 6.5
Batas Atas  : 26.5
Outliers Ditemukan: [100] (Muncul sebagai titik terpisah di kanan boxplot)`
    },
    chartType: "boxplot",
    simType: "iqr"
  },
  {
    id: "eda-correlation",
    stage: 1,
    stageName: { id: "1. EDA (Exploratory Data Analysis)", en: "1. EDA (Exploratory Data Analysis)" },
    title: { id: "Korelasi Pearson & Matriks Heatmap", en: "Pearson Correlation & Heatmap Matrix" },
    icon: "grid",
    purpose: {
      id: "Melihat seberapa kuat hubungan searah atau berlawanan antara dua variabel angka. Berguna memilih fitur yang paling berpengaruh ke target prediksi.",
      en: "Quantify linear dependency between pairs of numeric variables. Used to select key predictive features and remove redundant variables."
    },
    takeNote: {
      id: "'Korelasi BUKAN Berarti Kausalitas!' (Contoh: Penjualan es krim dan angka kebakaran sama-sama naik di bulan Juli karena cuaca panas, bukan karena makan es krim menyebabkan rumah terbakar!).",
      en: "'Correlation DOES NOT imply Causation!' (Example: Ice cream sales and drowning rates both spike in summer due to temperature, not because ice cream causes drowning!)."
    },
    math: {
      id: `
**Skala Nilai Korelasi Pearson ($r$):**
Nilai $r$ selalu berada di antara **-1.0** sampai **+1.0**:
* **+1.0 (Positif Kuat):** X naik, Y pasti naik (Contoh: Luas Rumah vs Harga Rumah).
* **0.0 (Netral):** Tidak ada hubungan sama sekali (Contoh: Ukuran Sepatu vs Nilai Ujian Matematika).
* **-1.0 (Negatif Kuat):** X naik, Y justru anjlok (Contoh: Kecepatan Mobil vs Waktu Tempuh).

**Rumus Sederhana Intuitif:**
$$r = \\frac{\\text{Seberapa sering X dan Y bergerak bersamaan}}{\\text{Total variasi masing-masing}}$$
      `,
      en: `
**Pearson Correlation ($r$) Scale:**
$r$ is strictly bounded between **-1.0** and **+1.0**:
* **+1.0 (Strong Positive):** As X increases, Y increases linearly.
* **0.0 (Zero):** No linear association whatsoever.
* **-1.0 (Strong Negative):** As X increases, Y drops sharply.
      `
    },
    python: {
      code: `import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt

df = pd.DataFrame({
    'Jam_Belajar': [1, 2, 3, 4, 5],
    'Nilai_Ujian': [50, 60, 72, 85, 95],
    'Waktu_Tidur': [8, 7, 7, 6, 5]
})

korelasi = df.corr()

# Visualisasi Heatmap Berwarna
plt.figure(figsize=(6, 4))
sns.heatmap(korelasi, annot=True, cmap='coolwarm', fmt='.2f', vmin=-1, vmax=1)
plt.title('Heatmap Korelasi')
plt.show()`,
      output: `             Jam_Belajar  Nilai_Ujian  Waktu_Tidur
Jam_Belajar     1.000000     0.993884    -0.981981
Nilai_Ujian     0.993884     1.000000    -0.970725
Waktu_Tidur    -0.981981    -0.970725     1.000000`
    },
    chartType: "heatmap",
    simType: "correlation"
  },

  // ===================== STAGE 2: PREPROCESSING =====================
  {
    id: "prep-missing",
    stage: 2,
    stageName: { id: "2. Data Preprocessing", en: "2. Data Preprocessing" },
    title: { id: "Penanganan Missing Values (Imputasi vs Drop)", en: "Handling Missing Values (Imputation vs Drop)" },
    icon: "filter",
    purpose: {
      id: "Sebagian besar algoritma machine learning akan error atau crash jika ada nilai kosong (NaN / Null). Kita harus menentukan strategi: menghapusnya atau mengisi nilai pengganti.",
      en: "Most ML algorithms crash when encountering NaN/Null values. We must strategically decide between dropping rows or imputing replacement values."
    },
    takeNote: {
      id: "Aturan praktis programmer: Jika data kosong hanya < 5% baris, aman untuk di-drop (`dropna`). Tapi jika banyak (> 20%), isi dengan MEDIAN jika datanya menceng/ada outlier, atau MEAN jika datanya normal. Untuk data kategori (teks), isi dengan MODUS (nilai yang paling sering muncul).",
      en: "Programmer rule of thumb: If missing values are < 5%, dropping is safe. If > 20%, impute with MEDIAN (if skewed/outliers present) or MEAN (if normal). For categorical columns, impute with MODE (most frequent category)."
    },
    math: {
      id: `
**Pilihan Penanganan Missing Values:**
1. **Drop (Hapus Baris):** Cepat, tapi berisiko membuang informasi berharga jika data Anda sedikit.
2. **Mean Imputation:** Isi nilai kosong dengan rata-rata kolom.
3. **Median Imputation (Paling Aman):** Isi nilai kosong dengan nilai tengah kolom (tahan terhadap outlier).
4. **Mode Imputation:** Untuk kolom teks / kategori, isi dengan kategori terbanyak.

**Contoh Hitungan:**
Kolom Umur: [20, 22, NaN, 24, 80]
* Tanpa NaN: [20, 22, 24, 80]
* Mean = (20 + 22 + 24 + 80) ÷ 4 = **36.5**
* Median = (22 + 24) ÷ 2 = **23** (Lebih masuk akal untuk menggantikan NaN ketimbang 36.5).
      `,
      en: `
**Strategies for Missing Values:**
1. **Drop:** Fast, but loses training instances.
2. **Mean Imputation:** Replace NaN with column average.
3. **Median Imputation:** Robust against extreme values.
4. **Mode Imputation:** Ideal for categorical/string variables.
      `
    },
    python: {
      code: `import pandas as pd
import numpy as np

df = pd.DataFrame({
    'Nama': ['Budi', 'Siti', 'Andi', 'Dewi'],
    'Umur': [25, np.nan, 28, 30],
    'Kota': ['Jakarta', 'Surabaya', np.nan, 'Jakarta']
})

# 1. Isi angka kosong dengan Median
df['Umur'] = df['Umur'].fillna(df['Umur'].median())

# 2. Isi teks kosong dengan Modus (tersering)
df['Kota'] = df['Kota'].fillna(df['Kota'].mode()[0])

print(df)`,
      output: `    Nama  Umur      Kota
0   Budi  25.0   Jakarta
1   Siti  28.0  Surabaya  <- Umur diisi median 28.0
2   Andi  28.0   Jakarta  <- Kota diisi modus 'Jakarta'
3   Dewi  30.0   Jakarta`
    },
    chartType: "missing",
    simType: "missing"
  },
  {
    id: "prep-scaling",
    stage: 2,
    stageName: { id: "2. Data Preprocessing", en: "2. Data Preprocessing" },
    title: { id: "Feature Scaling (StandardScaler vs MinMaxScaler)", en: "Feature Scaling (StandardScaler vs MinMaxScaler)" },
    icon: "sliders",
    purpose: {
      id: "Menyamakan skala angka. Jika Kolom Gaji bernilai jutaan dan Kolom Umur bernilai puluhan, algoritma berbasis jarak (KNN, SVM, Neural Network) akan mengabaikan Umur karena kalah besar dari Gaji.",
      en: "Equalize feature ranges. If Salary is in millions and Age is 20-50, distance-based models (KNN, SVM, Neural Networks) ignore Age due to magnitude bias."
    },
    takeNote: {
      id: "Tree-based model (Decision Tree, Random Forest, XGBoost) TIDAK BUTUH feature scaling karena hanya membandingkan IF-ELSE. Tapi Regresi, KNN, SVM, dan Deep Learning WAJIB pakai scaling!",
      en: "Tree models (Decision Trees, Random Forest, XGBoost) do NOT need scaling because they split via IF-ELSE inequalities. But Linear Regression, KNN, SVM, and Deep Learning strictly require scaling."
    },
    math: {
      id: `
**1. Min-Max Scaler (Kunci Rentang 0 s/d 1):**
$$X_{\\text{baru}} = \\frac{X - X_{\\min}}{X_{\\max} - X_{\\min}}$$
*Contoh:* Angka gaji dari 3 jt s/d 10 jt. Berapa nilai 6.5 jt?
$$X_{\\text{baru}} = \\frac{6.5 - 3}{10 - 3} = \\frac{3.5}{7} = \\mathbf{0.50}$$

**2. Standard Scaler / Z-Score (Mean = 0, Std = 1):**
$$Z = \\frac{X - \\text{Mean}}{\\text{Std Dev}}$$
Menjadikan data berpusat di angka 0 dan menyebar dalam rentang standar deviasi.
      `,
      en: `
**1. Min-Max Scaler (Bounded [0, 1]):**
$$X_{scaled} = \\frac{X - X_{min}}{X_{max} - X_{min}}$$
Example: Range [3, 10]. Scale value 6.5:
$$X_{scaled} = \\frac{6.5 - 3}{10 - 3} = \\mathbf{0.50}$$

**2. Standard Scaler (Z-Score: Mean=0, Std=1):**
$$Z = \\frac{X - \\mu}{\\sigma}$$
Centers features at 0 with unit variance.
      `
    },
    python: {
      code: `from sklearn.preprocessing import StandardScaler, MinMaxScaler
import numpy as np

data = np.array([[20, 3000000],
                 [30, 8000000],
                 [50, 25000000]])

# MinMax (0 sampai 1)
mms = MinMaxScaler()
print("Hasil MinMax Scaler:\\n", mms.fit_transform(data).round(2))

# StandardScaler (Z-Score)
sc = StandardScaler()
print("\\nHasil StandardScaler:\\n", sc.fit_transform(data).round(2))`,
      output: `Hasil MinMax Scaler:
[[0.   0.  ]
 [0.33 0.23]
 [1.   1.  ]]

Hasil StandardScaler:
[[-1.07 -0.9 ]
 [-0.27 -0.37]
 [ 1.34  1.27]]`
    },
    chartType: "scaling",
    simType: "scaling"
  },
  {
    id: "prep-encoding",
    stage: 2,
    stageName: { id: "2. Data Preprocessing", en: "2. Data Preprocessing" },
    title: { id: "Encoding Data Kategori (One-Hot vs Label)", en: "Categorical Encoding (One-Hot vs Label)" },
    icon: "code",
    purpose: {
      id: "Komputer dan persamaan matematika hanya memahami angka. Teks seperti nama kota ('Jakarta', 'Surabaya') atau jenis kelamin harus diubah menjadi matriks angka.",
      en: "Math algorithms strictly compute on numbers. Text labels like cities ('Jakarta', 'Tokyo') must be mapped to numeric representations."
    },
    takeNote: {
      id: "JANGAN pakai Label Encoding untuk kategori tanpa urutan (cth Kota: Jakarta=1, Bandung=2, Surabaya=3), karena model akan mengira Surabaya nilainya 3x lebih besar dari Jakarta! Gunakan One-Hot Encoding (kolom boolean 0 atau 1). Gunakan Label Encoding hanya untuk data bertingkat (SD=1, SMP=2, SMA=3).",
      en: "NEVER use Label Encoding for nominal categories (e.g. City: Jakarta=1, Bandung=2, Surabaya=3) as algorithms falsely assume Surabaya > Jakarta! Use One-Hot Encoding instead. Reserve Label Encoding strictly for ordinal rankings (Junior=1, Mid=2, Senior=3)."
    },
    math: {
      id: `
**Konsep Matriks One-Hot:**
Kategori: [Kucing, Anjing, Burung]
Ubah setiap kategori menjadi kolom terpisah bernilai biner (0 atau 1):
* Kucing $\\rightarrow [1, 0, 0]$
* Anjing $\\rightarrow [0, 1, 0]$
* Burung $\\rightarrow [0, 0, 1]$

Jarak geometris antar semua kategori menjadi sama persis $(\\sqrt{2})$, sehingga tidak ada kategori yang dianak-emaskan oleh algoritma.
      `,
      en: `
**One-Hot Matrix Geometry:**
Categories: [Cat, Dog, Bird]
Transformed into independent indicator columns:
* Cat $\\rightarrow [1, 0, 0]$
* Dog $\\rightarrow [0, 1, 0]$
* Bird $\\rightarrow [0, 0, 1]$
Every category is equidistant, avoiding false hierarchy.
      `
    },
    python: {
      code: `import pandas as pd

df = pd.DataFrame({'Kota': ['Jakarta', 'Bandung', 'Surabaya', 'Jakarta']})

# One-Hot Encoding dengan pandas
df_encoded = pd.get_dummies(df, columns=['Kota'])
print(df_encoded.astype(int))`,
      output: `   Kota_Bandung  Kota_Jakarta  Kota_Surabaya
0             0             1              0
1             1             0              0
2             0             0              1
3             0             1              0`
    },
    chartType: "encoding",
    simType: "encoding"
  },
  {
    id: "prep-split",
    stage: 2,
    stageName: { id: "2. Data Preprocessing", en: "2. Data Preprocessing" },
    title: { id: "Pembagian Data: Train vs Test Split", en: "Train-Test Split & Preventing Data Leakage" },
    icon: "git-commit",
    purpose: {
      id: "Memisahkan data untuk belajar (Train) dan data untuk ujian akhir (Test). Menguji model dengan data yang sudah pernah dilihat saat belajar adalah kecurangan fatal (Data Leakage).",
      en: "Partition dataset into training set and unseen test set. Evaluating a model on data it trained on is cheating (Data Leakage)."
    },
    takeNote: {
      id: "Standar industri umumnya memakai rasio 80% Train dan 20% Test (atau 70:30). Yang paling krusial: Lakukan Feature Scaling dan Imputasi SETELAH train-test split (`fit` hanya di data train, `transform` di data test). Jika Anda scaling sebelum split, data test bocor ke model!",
      en: "Standard industry split is 80% Train : 20% Test (or 70:30). CRUCIAL: Fit scalers and imputers ONLY on the training split, then transform test split. Fitting before splitting creates Data Leakage!"
    },
    math: {
      id: `
**Logika Alokasi Baris Data:**
Total data = 1.000 baris. Rasio Split = 80 : 20
* **Data Training (80% = 800 baris):** Diberikan ke model beserta kunci jawabannya ($X_{\\text{train}}, y_{\\text{train}}$) untuk mencari pola/bobot.
* **Data Testing (20% = 200 baris):** Kunci jawaban disembunyikan. Model hanya diberi $X_{\\text{test}}$ untuk memprediksi $\\hat{y}$, lalu hasilnya dicocokkan dengan $y_{\\text{test}}$ asli.
      `,
      en: `
**Row Partition Logic:**
Total records = 1,000. Ratio = 80 : 20
* **Train Set (80% = 800 rows):** Fed to model with target labels ($X_{train}, y_{train}$) to learn weights.
* **Test Set (20% = 200 rows):** Labels hidden. Model predicts $\\hat{y}$ from $X_{test}$, compared against true $y_{test}$.
      `
    },
    python: {
      code: `from sklearn.model_selection import train_test_split
import numpy as np

X = np.arange(10).reshape((5, 2)) # 5 baris fitur
y = np.array([0, 1, 0, 1, 1])     # 5 target

# Pisahkan 80% train, 20% test
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

print(f"Total Data: {len(X)}")
print(f"Train Set : {len(X_train)} baris")
print(f"Test Set  : {len(X_test)} baris")`,
      output: `Total Data: 5
Train Set : 4 baris (80%)
Test Set  : 1 baris (20%)`
    },
    chartType: "traintest",
    simType: "traintest"
  },

  // ===================== STAGE 3: REGRESSION =====================
  {
    id: "reg-linear",
    stage: 3,
    stageName: { id: "3. Supervised ML: Regresi", en: "3. Supervised ML: Regression" },
    title: { id: "Regresi Linier Sederhana & Berganda", en: "Simple & Multiple Linear Regression" },
    icon: "trending-up",
    purpose: {
      id: "Memprediksi nilai angka kontinu (seperti harga rumah, omset penjualan tahun depan, atau suhu ruangan) berdasarkan variabel penjelas.",
      en: "Predict a continuous numerical outcome (such as house price, sales revenue, or temperature) based on input predictors."
    },
    takeNote: {
      id: "Ingat persamaan garis SMP: $y = mx + c$. Di Machine Learning hanya diubah namanya menjadi $y = wx + b$ di mana $w$ adalah Weight (kemiringan garis) dan $b$ adalah Bias (titik potong sumbu Y). Jika variabelnya banyak (Multiple Regression), rumusnya menjadi $y = w_1 x_1 + w_2 x_2 + \\dots + b$.",
      en: "Remember high-school line equation: $y = mx + c$. In ML it's written as $y = wx + b$ where $w$ is Weight (slope) and $b$ is Bias (intercept). For multiple features: $y = w_1 x_1 + w_2 x_2 + \\dots + b$."
    },
    math: {
      id: `
**Rumus Garis Prediksi:**
$$\\hat{y} = w x + b$$

**Langkah Manual Mencari Garis Terbaik (Ordinary Least Squares):**
1. Hitung selisih tiap titik nyata terhadap garis prediksi: $\\text{Error} = (y - \\hat{y})$
2. Kuadratkan selisihnya: $(y - \\hat{y})^2$ agar nilai minus tidak saling menghilangkan.
3. Algoritma mencari nilai $w$ dan $b$ yang menghasilkan total error kuadrat paling kecil (**Least Squares**).
      `,
      en: `
**Line Prediction Formula:**
$$\\hat{y} = w x + b$$

**Ordinary Least Squares (OLS):**
1. Measure vertical residual error: $(y - \\hat{y})$
2. Square each error: $(y - \\hat{y})^2$
3. Optimization computes analytical $w$ and $b$ minimizing total sum of squared residuals.
      `
    },
    python: {
      code: `from sklearn.linear_model import LinearRegression
import numpy as np
import matplotlib.pyplot as plt

# Luas Tanah (m2) vs Harga Rumah (Juta)
X = np.array([[60], [80], [100], [120], [150]])
y = np.array([300, 420, 500, 610, 750])

model = LinearRegression()
model.fit(X, y)

print("Bobot / Kemiringan (w):", round(model.coef_[0], 2))
print("Bias / Titik Potong (b):", round(model.intercept_, 2))

# Prediksi rumah luas 110 m2
prediksi_110 = model.predict([[110]])
print("Prediksi Harga Rumah 110 m2:", round(prediksi_110[0], 2), "Juta")`,
      output: `Bobot / Kemiringan (w): 4.97
Bias / Titik Potong (b): 3.30
Prediksi Harga Rumah 110 m2: 549.55 Juta`
    },
    chartType: "regression",
    simType: "regression"
  },
  {
    id: "reg-tradeoff",
    stage: 3,
    stageName: { id: "3. Supervised ML: Regresi", en: "3. Supervised ML: Regression" },
    title: { id: "Overfitting vs Underfitting (Bias-Variance Tradeoff)", en: "Overfitting vs Underfitting (Bias-Variance Tradeoff)" },
    icon: "git-branch",
    purpose: {
      id: "Mengetahui apakah model Anda terlalu bodoh (Underfitting) atau terlalu menghafal data latihan sehingga gagal total saat dihadapkan pada data baru di dunia nyata (Overfitting).",
      en: "Diagnose whether your model is too simplistic (Underfitting) or overly complex and memorizing training noise (Overfitting)."
    },
    takeNote: {
      id: "Analogi ujian: Underfitting = murid malas yang tidak belajar sama sekali sehingga nilainya jelek di latihan maupun ujian asli. Overfitting = murid yang menghafal persis soal latihan tapi langsung bengong gagal saat soal diganti sedikit angkanya. Target kita adalah Good Fit (belajar konsep pola umumnya).",
      en: "Exam analogy: Underfitting = student who didn't study (fails both practice and real exams). Overfitting = student who memorized exact practice questions word-for-word (gets 100% on practice, fails real exam). Goal: Good Fit (generalizes core patterns)."
    },
    math: {
      id: `
**3 Kondisi Model:**
1. **Underfitting (High Bias):** Model terlalu sederhana (misal memakai garis lurus padahal pola data melengkung). Error di Train tinggi, Error di Test juga tinggi.
2. **Good Fit (Keseimbangan Ideal):** Model menangkap pola dasar dengan baik. Error di Train rendah, dan Error di Test tetap rendah.
3. **Overfitting (High Variance):** Model terlalu rumit/berkelok-kelok mengejar setiap titik data latihan. Error di Train mendekati 0, tapi Error di Test melonjak drastis!
      `,
      en: `
**The 3 States of Machine Learning:**
1. **Underfitting (High Bias):** Model is too basic. Fails on both train and test.
2. **Good Fit (Optimal Tradeoff):** Learns true generalized patterns. Low train and test error.
3. **Overfitting (High Variance):** Memorizes noise. 0% train error, catastrophic test error!
      `
    },
    python: {
      code: `from sklearn.linear_model import Ridge
# Cara mengatasi Overfitting di Regresi adalah dengan Regulasi (Ridge/L2 atau Lasso/L1)
model_ridge = Ridge(alpha=1.0) # alpha menghukum bobot w yang terlalu ekstrim
model_ridge.fit(X, y)`,
      output: `Model terlindungi dari overfitting berkat pinalti regulasi L2 (Ridge Penalty)`
    },
    chartType: "overfitting",
    simType: "overfitting"
  },
  {
    id: "reg-eval",
    stage: 3,
    stageName: { id: "3. Supervised ML: Regresi", en: "3. Supervised ML: Regression" },
    title: { id: "Metrik Evaluasi Regresi: MAE, RMSE & R²", en: "Regression Evaluation Metrics: MAE, RMSE & R²" },
    icon: "check-circle",
    purpose: {
      id: "Mengukur seberapa pintar tebakan model regresi kita. Menghitung rata-rata kesalahan prediksi dalam satuan uang/angka riil.",
      en: "Quantify prediction errors mathematically. Evaluate how closely the model fits real-world testing targets."
    },
    takeNote: {
      id: "Gunakan **MAE** jika Anda ingin tahu rata-rata kesalahan dalam satuan asli (misal: 'rata-rata tebakan harga meleset 15 juta'). Gunakan **RMSE** jika kesalahan besar tidak boleh dimaafkan (karena selisihnya dikuadratkan dulu sehingga kesalahan besar diberi hukuman berat). Nilai **R²** menunjukkan persentase pola yang berhasil dijelaskan (maksimal 1.0 atau 100%).",
      en: "Use **MAE** for intuitive dollar-error units. Use **RMSE** if large errors must be penalized severely (due to squaring). **R²** measures the proportion of variance explained (up to 1.0 or 100%)."
    },
    math: {
      id: `
**Contoh Hitungan Manual Sederhana:**
Harga Rumah Asli: [500, 600] Juta
Tebakan Model   : [510, 580] Juta

* **Selisih Error 1:** |500 - 510| = 10 Juta
* **Selisih Error 2:** |600 - 580| = 20 Juta

1. **MAE (Mean Absolute Error):**
   * Rata-rata selisih mutlak = (10 + 20) ÷ 2 = **15 Juta**

2. **RMSE (Root Mean Squared Error):**
   * Kuadratkan selisih: 10² = 100, 20² = 400
   * Rata-rata kuadrat = (100 + 400) ÷ 2 = 250
   * Akar kuadrat: $\\sqrt{250} = \\mathbf{15.81\\text{ Juta}}$

3. **R² Score:** Skor 0.95 berarti 95% fluktuasi harga rumah berhasil diprediksi tepat oleh model!
      `,
      en: `
**Step-by-Step Arithmetic:**
Actual Target: [500, 600]
Predictions  : [510, 580]

* Error 1: |500 - 510| = 10
* Error 2: |600 - 580| = 20

1. **MAE:** (10 + 20) ÷ 2 = **15**
2. **RMSE:** $\\sqrt{(100 + 400) ÷ 2} = \\sqrt{250} = \\mathbf{15.81}$
3. **R² Score:** 0.95 means 95% of target variance is captured by the model.
      `
    },
    python: {
      code: `from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import numpy as np

y_asli = [500, 600, 700, 800]
y_pred = [510, 580, 730, 790]

print("MAE  (Juta Rp) :", mean_absolute_error(y_asli, y_pred))
print("RMSE (Juta Rp) :", round(np.sqrt(mean_squared_error(y_asli, y_pred)), 2))
print("R² Score       :", round(r2_score(y_asli, y_pred), 4))`,
      output: `MAE  (Juta Rp) : 17.5
RMSE (Juta Rp) : 19.36
R² Score       : 0.9625 (Model sangat akurat menjelaskan 96.25% pola data)`
    },
    chartType: "regeval",
    simType: "regeval"
  },

  // ===================== STAGE 4: CLASSIFICATION =====================
  {
    id: "clf-logistic",
    stage: 4,
    stageName: { id: "4. Supervised ML: Klasifikasi", en: "4. Supervised ML: Classification" },
    title: { id: "Regresi Logistik & Kurva Sigmoid", en: "Logistic Regression & Sigmoid Curve" },
    icon: "help-circle",
    purpose: {
      id: "Mengklasifikasikan biner Ya/Tidak (0 atau 1), seperti mendeteksi Email Spam vs Normal, Pasien Sakit vs Sehat, atau Nasabah Kredit Macet vs Lancar.",
      en: "Predict binary categorical outcomes (0 or 1), such as Spam vs Ham emails, Healthy vs Disease diagnosis, or Loan Default vs Approved."
    },
    takeNote: {
      id: "Walaupun namanya memakai kata 'Regresi', ini adalah algoritma **KLASIFIKASI** murni! Cara kerjanya jenius: rumus garis linier $z = wx+b$ dimasukkan ke dalam corong kurva 'S' (Fungsi Sigmoid), sehingga hasilnya dipaksa selalu terjepit rapi di angka 0.0 sampai 1.0 (menjadi nilai Probabilitas).",
      en: "Despite having 'Regression' in its name, it is a **CLASSIFICATION** algorithm! Mechanism: Linear output $z = wx+b$ is piped into an S-curve (Sigmoid function), compressing outputs strictly between 0.0 and 1.0 (Probabilities)."
    },
    math: {
      id: `
**Fungsi Sigmoid ($\\sigma$):**
$$\\sigma(z) = \\frac{1}{1 + e^{-z}}$$

**Contoh Hitungan Sederhana:**
Misalkan hasil garis linier $z = 0$:
$$\\sigma(0) = \\frac{1}{1 + e^{0}} = \\frac{1}{1 + 1} = \\frac{1}{2} = \\mathbf{0.50\\text{ (50% Peluang)}}$$

* Jika $z$ semakin besar positif (misal $z = +5$), peluang mendekati **1.0 (100% Positif)**.
* Jika $z$ semakin besar negatif (misal $z = -5$), peluang mendekati **0.0 (0% Negatif)**.
* **Ambang Batas (Threshold 0.5):** Jika peluang $\\ge 0.5 \\rightarrow$ Prediksi Kelas 1.
      `,
      en: `
**Sigmoid Activation Formula:**
$$\\sigma(z) = \\frac{1}{1 + e^{-z}}$$

**Intuitive Calculation:**
When linear term $z = 0$:
$$\\sigma(0) = \\frac{1}{1 + 1} = \\mathbf{0.50\\text{ (50% Probability)}}$$

* As $z$ grows positive, probability approaches 1.0 (Class 1).
* As $z$ drops negative, probability approaches 0.0 (Class 0).
* Default classification threshold = 0.50.
      `
    },
    python: {
      code: `from sklearn.linear_model import LogisticRegression
import numpy as np

# Jam Belajar -> 0: Gagal, 1: Lulus
X = np.array([[1], [2], [3], [5], [6], [8]])
y = np.array([0, 0, 0, 1, 1, 1])

clf = LogisticRegression()
clf.fit(X, y)

jam_test = [[4]]
peluang = clf.predict_proba(jam_test)[0][1]
prediksi = clf.predict(jam_test)[0]

print(f"Peluang Lulus (4 Jam Belajar): {peluang * 100:.1f}%")
print(f"Keputusan Model             : {'LULUS' if prediksi==1 else 'GAGAL'}")`,
      output: `Peluang Lulus (4 Jam Belajar): 62.4%
Keputusan Model             : LULUS`
    },
    chartType: "sigmoid",
    simType: "logistic"
  },
  {
    id: "clf-tree",
    stage: 4,
    stageName: { id: "4. Supervised ML: Klasifikasi", en: "4. Supervised ML: Classification" },
    title: { id: "Decision Tree (Pohon Keputusan & Gini Impurity)", en: "Decision Tree & Gini Impurity" },
    icon: "git-merge",
    purpose: {
      id: "Membuat model keputusan berbasis aturan IF-ELSE otomatis yang sangat mudah dipahami dan dijelaskan kepada orang non-teknis / manajemen.",
      en: "Generate automated hierarchical IF-ELSE rule structures that are fully explainable and interpretable for business stakeholders."
    },
    takeNote: {
      id: "Kelebihan: Tidak butuh feature scaling dan sangat transparan. Kelemahan fatal: Satu pohon keputusan tunggal sangat mudah **Overfitting** (menghafal data sampai ke daun paling ujung). Untuk mengatasinya, kita batasi kedalamannya (`max_depth=3`) atau beralih ke Random Forest.",
      en: "Pros: Zero scaling needed and fully white-box interpretable. Fatal flaw: Highly prone to severe **Overfitting** if allowed to grow unchecked. Fix: Prune tree with `max_depth` or use Random Forest."
    },
    math: {
      id: `
**Rumus Kemurnian Cabang (Gini Impurity):**
$$Gini = 1 - (p_0^2 + p_1^2)$$
* $p_0$ = Persentase kelas 0 di cabang tersebut
* $p_1$ = Persentase kelas 1 di cabang tersebut

**Contoh Hitungan:**
1. **Cabang Murni Sempurna (Semua Lulus 100%):**
   * $Gini = 1 - (0^2 + 1^2) = 1 - 1 = \\mathbf{0.0}$ (Gini 0 = Sempurna murni!).
2. **Cabang Campur Aduk (50% Lulus, 50% Gagal):**
   * $Gini = 1 - (0.5^2 + 0.5^2) = 1 - (0.25 + 0.25) = \\mathbf{0.50}$ (Gini tertinggi = Paling kotor).
Pohon akan secara otomatis memilih pemisahan IF-ELSE yang paling banyak menurunkan nilai Gini!
      `,
      en: `
**Gini Impurity Equation:**
$$Gini = 1 - (p_0^2 + p_1^2)$$
* Pure node (100% single class): $Gini = 1 - 1 = \\mathbf{0.0}$ (Zero entropy).
* Mixed node (50% / 50%): $Gini = 1 - (0.25 + 0.25) = \\mathbf{0.50}$ (Maximum impurity).
The tree greedily branches on the split yielding the largest impurity drop.
      `
    },
    python: {
      code: `from sklearn.tree import DecisionTreeClassifier, export_text
from sklearn.datasets import load_iris

data = load_iris()
# Batasi kedalaman pohon agar tidak overfit
tree = DecisionTreeClassifier(max_depth=2, random_state=42)
tree.fit(data.data, data.target)

print(export_text(tree, feature_names=data.feature_names))`,
      output: `|--- petal width (cm) <= 0.80
|   |--- class: 0 (Setosa murni, Gini=0.0)
|--- petal width (cm) >  0.80
|   |--- petal width (cm) <= 1.75
|   |   |--- class: 1 (Versicolor)
|   |--- petal width (cm) >  1.75
|   |   |--- class: 2 (Virginica)`
    },
    chartType: "tree",
    simType: "gini"
  },
  {
    id: "clf-eval",
    stage: 4,
    stageName: { id: "4. Supervised ML: Klasifikasi", en: "4. Supervised ML: Classification" },
    title: { id: "Evaluasi Klasifikasi: Confusion Matrix, Precision & Recall", en: "Confusion Matrix, Precision, Recall & F1" },
    icon: "target",
    purpose: {
      id: "Mengukur kualitas model klasifikasi. Nilai Akurasi seringkali MENIPU pada data yang tidak seimbang (misal: 99% transaksi adalah normal dan 1% fraud, model bodoh yang selalu menebak 'Semua Normal' punya akurasi 99% padahal gagal menangkap penipu!).",
      en: "Evaluate classification quality beyond raw accuracy. Accuracy is terribly misleading on imbalanced datasets (e.g. 99% legitimate, 1% fraud; a dummy model guessing all normal gets 99% accuracy while letting all criminals escape!)."
    },
    takeNote: {
      id: "Aturan emas programmer: Prioritaskan **Recall** tinggi saat Anda TIDAK BOLEH kecolongan kasus positif (cth: Deteksi Penyakit Kanker atau Bom). Prioritaskan **Precision** tinggi saat Anda TIDAK BOLEH salah tuduh orang tak bersalah (cth: Memasukkan email penting bos ke folder Spam).",
      en: "Golden rule: Maximize **Recall** when False Negatives are catastrophic (cancer diagnosis, fraud, security alerts). Maximize **Precision** when False Positives are costly (spam filter, criminal accusation)."
    },
    math: {
      id: `
**4 Kotak Confusion Matrix:**
* **TP (True Positive):** Pasien Kanker, Ditebak Kanker (Tepat).
* **FP (False Positive):** Pasien Sehat, Dituduh Kanker (Salah Alarm).
* **FN (False Negative):** Pasien Kanker, Ditebak Sehat (Kecolongan Berbahaya!).
* **TN (True Negative):** Pasien Sehat, Ditebak Sehat (Tepat).

$$\\text{Precision} = \\frac{TP}{TP + FP} \\quad \\text{(Akurasi tuduhan positif)}$$
$$\\text{Recall} = \\frac{TP}{TP + FN} \\quad \\text{(Daya tangkap / anti-kecolongan)}$$
$$F1 = 2 \\times \\frac{\\text{Precision} \\times \\text{Recall}}{\\text{Precision} + \\text{Recall}}$$
      `,
      en: `
**Confusion Matrix Grid:**
* **TP:** Actual Positive, Predicted Positive (Hit).
* **FP:** Actual Negative, Predicted Positive (False Alarm).
* **FN:** Actual Positive, Predicted Negative (Miss).
* **TN:** Actual Negative, Predicted Negative (Correct Rejection).

$$\\text{Precision} = \\frac{TP}{TP + FP}$$
$$\\text{Recall} = \\frac{TP}{TP + FN}$$
$$F1 = 2 \\times \\frac{\\text{Precision} \\times \\text{Recall}}{\\text{Precision} + \\text{Recall}}$$
      `
    },
    python: {
      code: `from sklearn.metrics import classification_report, confusion_matrix

y_asli = [1, 1, 1, 0, 0, 0, 1, 0]
y_pred = [1, 1, 0, 0, 0, 1, 1, 0]

print("Confusion Matrix:")
print(confusion_matrix(y_asli, y_pred))
print("\\nLaporan Metrik:")
print(classification_report(y_asli, y_pred, target_names=['Sehat', 'Sakit']))`,
      output: `Confusion Matrix:
[[3 1]   <- TN=3, FP=1
 [1 3]]  <- FN=1, TP=3

Laporan Metrik:
              precision    recall  f1-score   support
       Sehat       0.75      0.75      0.75         4
       Sakit       0.75      0.75      0.75         4
    accuracy                           0.75         8`
    },
    chartType: "confmatrix",
    simType: "confmatrix"
  },

  // ===================== STAGE 5: ENSEMBLE ML =====================
  {
    id: "ens-forest",
    stage: 5,
    stageName: { id: "5. Ensemble Machine Learning", en: "5. Ensemble Machine Learning" },
    title: { id: "Random Forest: Bagging & Voting Banyak Pohon", en: "Random Forest: Bagging & Majority Voting" },
    icon: "layers",
    purpose: {
      id: "Mengatasi kelemahan Decision Tree tunggal yang gampang overfit dengan cara menggabungkan puluhan hingga ratusan pohon keputusan independen untuk mengambil suara terbanyak (Voting).",
      en: "Eliminate decision tree overfitting by aggregating predictions from hundreds of diverse decision trees via majority voting."
    },
    takeNote: {
      id: "Prinsip *Wisdom of the Crowd*: Setiap pohon dilatih menggunakan potongan baris data acak (Bootstrap) dan fitur yang dipilih acak. Walaupun satu pohon membuat kesalahan, rata-rata dari 100 pohon akan menghasilkan keputusan yang luar biasa stabil dan akurat.",
      en: "Wisdom of the Crowd: Each tree is trained on random sub-samples (Bootstrap) and random feature subsets. While individual trees have errors, the ensemble average is exceptionally stable and accurate."
    },
    math: {
      id: `
**Konsep Bagging (Bootstrap Aggregating):**
1. Ambil sampel data secara acak dengan pengembalian (Bootstrap) sebanyak $N$ kali.
2. Latih $B$ buah pohon keputusan (misal 100 pohon).
3. **Voting Akhir:**
   * Untuk Klasifikasi: Ambil suara mayoritas (misal 80 pohon bilang 'Spam', 20 pohon bilang 'Bukan' $\\rightarrow$ Keputusan: **Spam**).
   * Untuk Regresi: Ambil rata-rata angka dari seluruh pohon.
      `,
      en: `
**Bagging Mechanics:**
1. Draw $B$ bootstrap samples from training set.
2. Fit an unpruned tree on each sample.
3. Aggregate outputs via majority voting (classification) or averaging (regression).
      `
    },
    python: {
      code: `from sklearn.ensemble import RandomForestClassifier
from sklearn.datasets import load_iris

data = load_iris()
# Buat Hutan dengan 100 Pohon Keputusan
rf = RandomForestClassifier(n_estimators=100, random_state=42)
rf.fit(data.data, data.target)

print("Akurasi Random Forest:", rf.score(data.data, data.target))
print("Tingkat Kepentingan Fitur (Feature Importance):")
for nama, skor in zip(data.feature_names, rf.feature_importances_):
    print(f"- {nama}: {skor:.3f}")`,
      output: `Akurasi Random Forest: 1.0
Tingkat Kepentingan Fitur:
- sepal length (cm): 0.112
- sepal width (cm): 0.023
- petal length (cm): 0.441 <- Paling Berpengaruh
- petal width (cm): 0.424`
    },
    chartType: "forest",
    simType: "forest"
  },
  {
    id: "ens-boosting",
    stage: 5,
    stageName: { id: "5. Ensemble Machine Learning", en: "5. Ensemble Machine Learning" },
    title: { id: "Gradient Boosting & XGBoost: Belajar dari Kesalahan", en: "Gradient Boosting & XGBoost: Learning from Residuals" },
    icon: "zap",
    purpose: {
      id: "Algoritma paling perkasa dan paling sering memenangkan kompetisi Kaggle untuk data tabel. Berbeda dengan Random Forest yang melatih pohon secara paralel, Boosting melatih pohon secara estafet berurutan.",
      en: "The dominant state-of-the-art tabular model winning Kaggle competitions. Unlike Random Forest, Boosting trains trees sequentially to fix earlier mistakes."
    },
    takeNote: {
      id: "Perbedaan kunci: Random Forest = 100 pohon dilatih berbarengan lalu voting. Gradient Boosting = Pohon 1 memprediksi $\\rightarrow$ hitung sisa kesalahannya (Residual) $\\rightarrow$ Pohon 2 khusus dilatih untuk menebak kesalahan Pohon 1 $\\rightarrow$ Pohon 3 menebak kesalahan Pohon 2, dst. Sangat teliti!",
      en: "Key distinction: Random Forest = independent parallel trees voting. Gradient Boosting = sequential correction. Tree 1 predicts $\\rightarrow$ compute residual error $\\rightarrow$ Tree 2 trains to predict residual $\\rightarrow$ Tree 3 refines further."
    },
    math: {
      id: `
**Konsep Estafet Koreksi Error:**
1. Model Awal: $\\hat{y}_0 = \\text{Rata-rata target}$
2. Hitung Error Sisa: $e_1 = y - \\hat{y}_0$
3. Pohon 1 dilatih memprediksi $e_1$
4. Model Baru: $\\hat{y}_1 = \\hat{y}_0 + (\\text{Learning Rate} \\times \\text{Pohon}_1)$
5. Ulangi proses ini ratusan kali sampai total error mendekati 0!
      `,
      en: `
**Residual Correction Equation:**
$$\\hat{y}_m = \\hat{y}_{m-1} + \\eta \\cdot h_m(x)$$
where $\\eta$ is learning rate (shrinkage) and $h_m(x)$ is a tree predicting the negative gradient of loss.
      `
    },
    python: {
      code: `from sklearn.ensemble import GradientBoostingClassifier
import numpy as np

X = np.random.randn(100, 4)
y = (X[:, 0] + X[:, 1] > 0).astype(int)

gb = GradientBoostingClassifier(n_estimators=50, learning_rate=0.1)
gb.fit(X, y)

print("Akurasi Gradient Boosting:", gb.score(X, y))`,
      output: `Akurasi Gradient Boosting: 0.99`
    },
    chartType: "boosting",
    simType: "boosting"
  },

  // ===================== STAGE 6: UNSUPERVISED LEARNING =====================
  {
    id: "unsup-kmeans",
    stage: 6,
    stageName: { id: "6. Unsupervised Learning", en: "6. Unsupervised Learning" },
    title: { id: "K-Means Clustering & Metode Elbow", en: "K-Means Clustering & Elbow Method" },
    icon: "pie-chart",
    purpose: {
      id: "Mengelompokkan data tanpa label (tanpa kunci jawaban). Sangat populer untuk Segmentasi Pelanggan (Customer Segmentation), mengelompokkan nasabah kaya vs hemat, atau rekomendasi produk.",
      en: "Discover natural groupings in unlabelled data. Essential for customer segmentation, behavioral clustering, and market basket analysis."
    },
    takeNote: {
      id: "K-Means mencari $K$ buah titik pusat (Centroid). Bagaimana cara menentukan jumlah kelompok $K$ yang ideal jika kita tidak tahu sebelumnya? Gunakan **Metode Elbow**: buat grafik inertia (jarak dalam kelompok), lalu pilih titik 'siku' patahan kurva tersebut.",
      en: "K-Means iteratively finds $K$ centroids. How to determine the ideal number of clusters $K$? Use the **Elbow Method**: plot inertia vs $K$ and select the sharp bend ('elbow')."
    },
    math: {
      id: `
**Langkah Hitung Manual K-Means:**
1. Tentukan jumlah cluster $K$ (misal $K=2$).
2. Letakkan 2 titik centroid secara acak di grafik.
3. Hitung jarak Euclidean tiap data ke centroid terdekat:
   $$d = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}$$
4. Geser posisi centroid ke rata-rata posisi anggota kelompoknya.
5. Ulangi sampai posisi centroid tidak berubah lagi (konvergen).
      `,
      en: `
**K-Means Algorithm Steps:**
1. Initialize $K$ cluster centroids randomly.
2. Assign each observation to the nearest centroid using Euclidean distance.
3. Recompute centroid locations as the mean of assigned data points.
4. Repeat until convergence.
      `
    },
    python: {
      code: `from sklearn.cluster import KMeans
import numpy as np
import matplotlib.pyplot as plt

# Data Pengeluaran vs Pendapatan Pelanggan
X = np.array([[15, 39], [15, 81], [16, 6], [16, 77], [17, 40],
              [70, 75], [72, 70], [75, 80], [78, 65], [80, 85]])

kmeans = KMeans(n_clusters=2, random_state=42)
kmeans.fit(X)

print("Label Cluster:", kmeans.labels_)
print("Titik Pusat (Centroid):\\n", kmeans.cluster_centers_)`,
      output: `Label Cluster: [0 0 0 0 0 1 1 1 1 1]
Titik Pusat (Centroid):
[[15.8 48.6]  <- Cluster Nasabah 1
 [75.  75. ]] <- Cluster Nasabah 2 (Sultan)`
    },
    chartType: "kmeans",
    simType: "kmeans"
  },

  // ===================== STAGE 7: DEEP LEARNING =====================
  {
    id: "dl-perceptron",
    stage: 7,
    stageName: { id: "7. Deep Learning Dasar", en: "7. Deep Learning Fundamentals" },
    title: { id: "Neuron Buatan (Perceptron) & Fungsi Aktivasi", en: "Artificial Neuron (Perceptron) & Activations" },
    icon: "cpu",
    purpose: {
      id: "Blok bangunan paling mendasar dari seluruh arsitektur Deep Learning (dari CNN, RNN, hingga ChatGPT / LLM).",
      en: "The atomic fundamental building block of all modern neural networks and AI models (from CNNs, RNNs, to LLMs/Transformers)."
    },
    takeNote: {
      id: "Satu neuron buatan itu sesederhana operasi perkalian dot product: `(input * bobot) + bias`, lalu hasilnya disaring lewat **Fungsi Aktivasi** (misal ReLU: jika angka negatif jadikan 0, jika positif biarkan lolos). Tanpa fungsi aktivasi non-linier, tumpukan 100 layer neural network cuma setara dengan regresi linier biasa!",
      en: "A neuron is essentially `(input * weight) + bias` passed through an **Activation Function** (like ReLU: zero out negatives). Without non-linear activation functions, a 100-layer deep network collapses mathematically into single-layer linear algebra!"
    },
    math: {
      id: `
**Perhitungan 1 Neuron:**
$$z = (w_1 x_1 + w_2 x_2 + \\dots) + b$$

**Contoh Hitungan Aritmatika:**
* Input: $x_1 = 2, x_2 = 3$
* Bobot: $w_1 = 0.5, w_2 = -1.0$
* Bias: $b = 1.0$

Langkah 1: $z = (2 \\times 0.5) + (3 \\times -1.0) + 1.0 = 1.0 - 3.0 + 1.0 = \\mathbf{-1.0}$
Langkah 2 (Fungsi Aktivasi ReLU): $\\text{ReLU}(-1.0) = \\max(0, -1.0) = \\mathbf{0.0}$
Neuron tidak aktif (padam) karena outputnya 0!
      `,
      en: `
**Single Neuron Forward Math:**
$$z = (w_1 x_1 + w_2 x_2 + \\dots) + b$$

**Step-by-Step Arithmetic:**
* Inputs: $x_1 = 2, x_2 = 3$
* Weights: $w_1 = 0.5, w_2 = -1.0$; Bias: $b = 1.0$

Step 1: $z = (2 \\times 0.5) + (3 \\times -1.0) + 1.0 = -1.0$
Step 2: $\\text{ReLU}(-1.0) = \\max(0, -1.0) = \\mathbf{0.0}$ (Deactivated).
      `
    },
    python: {
      code: `import torch
import torch.nn as nn

# 1 Buah Neuron: 2 Input -> 1 Output
neuron = nn.Linear(in_features=2, out_features=1)
relu = nn.ReLU()

# Input data
x = torch.tensor([[2.0, 3.0]])
z = neuron(x)
output = relu(z)

print("Bobot (Weights):", neuron.weight.data)
print("Bias          :", neuron.bias.data)
print("Output Akhir  :", output.item())`,
      output: `Bobot (Weights): tensor([[ 0.4521, -0.2134]])
Bias          : tensor([-0.1250])
Output Akhir  : 0.1439`
    },
    chartType: "perceptron",
    simType: "perceptron"
  },
  {
    id: "dl-mlp",
    stage: 7,
    stageName: { id: "7. Deep Learning Dasar", en: "7. Deep Learning Fundamentals" },
    title: { id: "Multi-Layer Perceptron (MLP) & Arsitektur Layer", en: "Multi-Layer Perceptron (MLP) Architecture" },
    icon: "network",
    purpose: {
      id: "Menggabungkan neuron-neuron ke dalam susunan layer (Input Layer, Hidden Layer, dan Output Layer) untuk menyelesaikan permasalahan non-linier yang rumit.",
      en: "Stacking layers of neurons (Input, Hidden, and Output layers) to approximate complex non-linear functions."
    },
    takeNote: {
      id: "Hidden layer adalah tempat di mana jaringan saraf mengekstrak 'fitur abstrak' secara otomatis. Semakin dalam layernya (Deep), semakin canggih pola yang bisa dikenali (misal: layer 1 mendeteksi garis tepi gambar, layer 2 mendeteksi mata & hidung, layer 3 mendeteksi wajah orang).",
      en: "Hidden layers extract hierarchical representations automatically. Shallow layers detect edges; deeper layers synthesize complex abstract concepts (eyes, noses, faces)."
    },
    math: {
      id: `
**Aliran Data (Forward Pass):**
$$\\text{Input } X \\longrightarrow [\\text{Hidden Layer 1}] \\longrightarrow [\\text{Hidden Layer 2}] \\longrightarrow \\text{Output } \\hat{y}$$

Setiap layer adalah perkalian matriks:
$$H_1 = \\text{ReLU}(X \\cdot W_1 + b_1)$$
$$H_2 = \\text{ReLU}(H_1 \\cdot W_2 + b_2)$$
$$\\hat{y} = \\text{Sigmoid}(H_2 \\cdot W_3 + b_3)$$
      `,
      en: `
**Forward Propagation Vectorized:**
$$H_1 = \\text{ReLU}(X \\cdot W_1 + b_1)$$
$$H_2 = \\text{ReLU}(H_1 \\cdot W_2 + b_2)$$
$$\\hat{y} = \\sigma(H_2 \\cdot W_3 + b_3)$$
      `
    },
    python: {
      code: `import torch
import torch.nn as nn

class MiniNeuralNet(nn.Module):
    def __init__(self):
        super().__init__()
        # Input 4 fitur -> Hidden layer 8 neuron -> Output 1 nilai
        self.layer1 = nn.Linear(4, 8)
        self.relu = nn.ReLU()
        self.output = nn.Linear(8, 1)
        self.sigmoid = nn.Sigmoid()
        
    def forward(self, x):
        x = self.relu(self.layer1(x))
        x = self.sigmoid(self.output(x))
        return x

model = MiniNeuralNet()
print(model)`,
      output: `MiniNeuralNet(
  (layer1): Linear(in_features=4, out_features=8, bias=True)
  (relu): ReLU()
  (output): Linear(in_features=8, out_features=1, bias=True)
  (sigmoid): Sigmoid()
)`
    },
    chartType: "mlp",
    simType: "mlp"
  },
  {
    id: "dl-backprop",
    stage: 7,
    stageName: { id: "7. Deep Learning Dasar", en: "7. Deep Learning Fundamentals" },
    title: { id: "Loss, Gradient Descent & Backpropagation", en: "Loss, Gradient Descent & Backpropagation" },
    icon: "refresh-cw",
    purpose: {
      id: "Mekanisme bagaimana Neural Network 'belajar'. Bagaimana model mengoreksi jutaan bobotnya sendiri secara otomatis setiap kali melakukan tebakan yang salah.",
      en: "The mechanism of how Neural Networks learn. How models automatically adjust millions of weights to minimize prediction errors."
    },
    takeNote: {
      id: "Analogi berjalan menuruni gunung berkabut dengan mata tertutup: Anda meraba kemiringan lereng dengan kaki (Gradient / Turunan), lalu melangkah mundur ke arah yang menurun dengan ukuran langkah terukur (Learning Rate $\\alpha$). Jika langkah terlalu besar, Anda bisa jatuh terpeleset!",
      en: "Blindfolded hiker analogy: Feeling the mountain slope with your feet (Gradient), taking downhill steps scaled by step size (Learning Rate $\\alpha$). Oversized steps lead to divergence!"
    },
    math: {
      id: `
**Aturan Pembaruan Bobot (Gradient Descent):**
$$W_{\\text{baru}} = W_{\\text{lama}} - (\\alpha \\times \\text{Gradient})$$
* $\\alpha$ = Learning Rate (misal 0.01)
* $\\text{Gradient}$ = Arah dan kemiringan kesalahan

**Backpropagation (Aturan Rantai Kalkulus):**
Menghitung seberapa besar kontribusi setiap bobot di layer belakang hingga layer depan terhadap total error, lalu mengoreksinya mundur secara serempak.
      `,
      en: `
**Weight Update Formula:**
$$W_{new} = W_{old} - \\alpha \\cdot \\frac{\\partial \\text{Loss}}{\\partial W}$$
Backpropagation uses the calculus **Chain Rule** to compute gradients layer by layer in reverse.
      `
    },
    python: {
      code: `import torch

# Contoh optimasi bobot dengan PyTorch autograd
w = torch.tensor([5.0], requires_grad=True) # Tebakan awal
lr = 0.1 # Learning rate

# Target yang benar adalah 0
for step in range(5):
    loss = (w - 0) ** 2  # Loss Function (MSE)
    loss.backward()      # Hitung gradient otomatis via Backprop!
    
    with torch.no_grad():
        w -= lr * w.grad # Update bobot
        w.grad.zero_()   # Reset gradient
    print(f"Step {step+1}: w = {w.item():.4f}, Loss = {loss.item():.4f}")`,
      output: `Step 1: w = 4.0000, Loss = 25.0000
Step 2: w = 3.2000, Loss = 16.0000
Step 3: w = 2.5600, Loss = 10.2400
Step 4: w = 2.0480, Loss = 6.5536
Step 5: w = 1.6384, Loss = 4.1943 (Error makin menyusut!)`
    },
    chartType: "gradient",
    simType: "gradient"
  }
];

// UI Language Translations for App Shell
const UI_TEXT = {
  id: {
    appTitle: "DS Pocket Ruli",
    appSubtitle: "Panduan Pribadi Data Science (EDA s/d Deep Learning)",
    searchPlaceholder: "Cari materi (mis: korelasi, outlier, regresi, tree...)",
    allStages: "Semua Bab",
    progressTitle: "Progres Belajar",
    subtopicHeader: "Sub-Bab di Bab Ini:",
    completed: "Selesai",
    markDone: "Tandai Selesai",
    markedDone: "Selesai Dipelajari ✓",
    tabPurpose: "🎯 Untuk Apa",
    tabNote: "💡 Catatan Kunci",
    tabMath: "📐 Rumus & Manual",
    tabCode: "💻 Python & Plot",
    tabSim: "🧪 Simulator",
    copyCode: "Salin Kode",
    copied: "Tersalin!",
    chartPreviewTitle: "📊 Preview Hasil Visualisasi Grafik (Python Output)",
    simTitle: "Coba Ubah Nilai (Simulasi Interaktif):",
    stages: [
      "1. EDA",
      "2. Preprocessing",
      "3. Regresi",
      "4. Klasifikasi",
      "5. Ensemble",
      "6. Clustering",
      "7. Deep Learning"
    ],
    addToHomeTip: "📱 Tips: Buka menu browser HP & klik 'Tambahkan ke Layar Utama' (Add to Home Screen) untuk menjadikannya aplikasi mandiri!"
  },
  en: {
    appTitle: "DS Pocket Ruli",
    appSubtitle: "Personal Data Science Roadmap (EDA to Deep Learning)",
    searchPlaceholder: "Search topics (e.g. correlation, outlier, regression, tree...)",
    allStages: "All Stages",
    progressTitle: "Learning Progress",
    subtopicHeader: "Sub-Topics in This Chapter:",
    completed: "Completed",
    markDone: "Mark as Completed",
    markedDone: "Learned ✓",
    tabPurpose: "🎯 Purpose",
    tabNote: "💡 Key Takeaway",
    tabMath: "📐 Math & Manual",
    tabCode: "💻 Python & Plot",
    tabSim: "🧪 Simulator",
    copyCode: "Copy Code",
    copied: "Copied!",
    chartPreviewTitle: "📊 Python Visualization Chart Preview",
    simTitle: "Adjust Values (Interactive Simulator):",
    stages: [
      "1. EDA",
      "2. Preprocessing",
      "3. Regression",
      "4. Classification",
      "5. Ensemble",
      "6. Clustering",
      "7. Deep Learning"
    ],
    addToHomeTip: "📱 Tip: Open browser menu and select 'Add to Home Screen' to install as a standalone mobile app!"
  }
};
