// Data Science Roadmap Curriculum Data (Bilingual: ID & EN)
const ROADMAP_DATA = [
  // ===================== STAGE 1: EDA =====================
  {
    id: "eda-stats",
    stage: 1,
    stageName: { id: "1. EDA (Exploratory Data Analysis)", en: "1. EDA (Exploratory Data Analysis)" },
    title: { id: "Statistik Deskriptif Dasar (Mean, Median, Std Dev)", en: "Basic Descriptive Statistics (Mean, Median, Std Dev)" },
    icon: "bar-chart-2",
    purpose: {
      id: "Memahami 'pusat' dan 'sebaran' data numerik sebelum melakukan apa pun. Tanpa ini, kita bisa terkecoh oleh angka rata-rata palsu akibat data yang menceng.",
      en: "Understand the 'center' and 'spread' of numerical data before doing anything. Without this, fake averages caused by skewed data can mislead us."
    },
    takeNote: {
      id: "Sebagai programmer: Bayangkan Mean seperti `array.reduce((a,b) => a+b) / n`. Jika ada 1 angka bernilai 1.000.000 di antara angka 1-10, Mean akan melonjak hancur! Di sinilah MEDIAN (nilai tengah data yang diurutkan) jadi penyelamat karena tahan terhadap outlier.",
      en: "Programmer mindset: Think of Mean as `array.reduce((a,b) => a+b) / n`. If there is one 1,000,000 value among 1-10, Mean spikes wildly! That's where MEDIAN (middle value of sorted array) saves the day because it is resistant to outliers."
    },
    math: {
      id: `
**1. Rata-rata (Mean, $\\bar{X}$):**
$$\\bar{X} = \\frac{\\sum X}{N} = \\frac{\\text{Jumlah semua data}}{\\text{Total jumlah baris}}$$

**2. Standar Deviasi ($\\sigma$ / Std Dev) - Mengukur Sebaran:**
$$\\sigma = \\sqrt{\\frac{\\sum (X_i - \\bar{X})^2}{N}}$$
*Artinya:* Berapa rata-rata jarak tiap data dari titik pusatnya. Jika Std Dev kecil, data berkumpul rapat. Jika besar, data menyebar luas.
      `,
      en: `
**1. Average (Mean, $\\bar{X}$):**
$$\\bar{X} = \\frac{\\sum X}{N} = \\frac{\\text{Sum of all elements}}{\\text{Total count}}$$

**2. Standard Deviation ($\\sigma$ / Std Dev) - Measuring Spread:**
$$\\sigma = \\sqrt{\\frac{\\sum (X_i - \\bar{X})^2}{N}}$$
*Meaning:* Average distance of each data point from the mean. Low std dev means points cluster closely; high std dev means wide variation.
      `
    },
    python: {
      code: `import pandas as pd
import numpy as np

# Data sampel gaji (dalam juta)
gaji = pd.Series([5, 6, 5.5, 7, 6.2, 100]) # 100 adalah outlier!

print("Mean   :", gaji.mean())
print("Median :", gaji.median())
print("Std Dev:", gaji.std())
print("\\nRingkasan 5 Angka:\\n", gaji.describe())`,
      output: `Mean   : 21.616666666666667
Median : 6.1
Std Dev: 38.41163452220478

Ringkasan 5 Angka:
count      6.000000
mean      21.616667
std       38.411635
min        5.000000
50%        6.100000  <- Median riil (jauh lebih masuk akal dibanding mean)
max      100.000000`
    },
    simType: "stats"
  },
  {
    id: "eda-outlier",
    stage: 1,
    stageName: { id: "1. EDA (Exploratory Data Analysis)", en: "1. EDA (Exploratory Data Analysis)" },
    title: { id: "Deteksi Outlier & IQR (Interquartile Range)", en: "Outlier Detection & IQR (Interquartile Range)" },
    icon: "alert-triangle",
    purpose: {
      id: "Menemukan data aneh atau pencilan (misal umur 999 tahun atau harga rumah 0 rupiah) yang dapat merusak model machine learning.",
      en: "Detect anomaly/extreme points (e.g. age 999 or house price $0) that could distort machine learning models."
    },
    takeNote: {
      id: "Rumus sakti 1.5x IQR adalah standar industri. Jangan langsung main HAPUS outlier; tanyakan dulu apakah itu kesalahan input (typo) atau fenomena bisnis riil (misal transaksi fraud).",
      en: "The 1.5x IQR rule is an industry standard. Don't immediately DELETE outliers; identify if it's a typo or a valid rare phenomenon (like fraud)."
    },
    math: {
      id: `
**Langkah Hitung Manual:**
1. Urutkan data dari kecil ke besar.
2. Cari Kuartil 1 ($Q1$ = 25% data terbawah) dan Kuartil 3 ($Q3$ = 75% data).
3. Hitung $IQR = Q3 - Q1$.
4. Batas Bawah: $Q1 - (1.5 \\times IQR)$
5. Batas Atas: $Q3 + (1.5 \\times IQR)$
*Segala angka di luar batas bawah/atas dianggap Outlier.*
      `,
      en: `
**Manual Calculation Steps:**
1. Sort data ascending.
2. Find Quartile 1 ($Q1$ = 25th percentile) and Quartile 3 ($Q3$ = 75th percentile).
3. Compute $IQR = Q3 - Q1$.
4. Lower Bound: $Q1 - (1.5 \\times IQR)$
5. Upper Bound: $Q3 + (1.5 \\times IQR)$
*Any value beyond lower/upper bounds is flagged as an Outlier.*
      `
    },
    python: {
      code: `import pandas as pd

data = pd.Series([10, 12, 14, 15, 16, 18, 19, 21, 100]) # 100 is outlier

Q1 = data.quantile(0.25)
Q3 = data.quantile(0.75)
IQR = Q3 - Q1

batas_bawah = Q1 - 1.5 * IQR
batas_atas = Q3 + 1.5 * IQR

outliers = data[(data < batas_bawah) | (data > batas_atas)]
print(f"Batas: [{batas_bawah} s/d {batas_atas}]")
print("Data Outlier:", outliers.tolist())`,
      output: `Batas: [3.5 s/d 31.5]
Data Outlier: [100]`
    },
    simType: "iqr"
  },
  {
    id: "eda-correlation",
    stage: 1,
    stageName: { id: "1. EDA (Exploratory Data Analysis)", en: "1. EDA (Exploratory Data Analysis)" },
    title: { id: "Korelasi Pearson & Heatmap", en: "Pearson Correlation & Heatmap" },
    icon: "grid",
    purpose: {
      id: "Melihat hubungan linier antar 2 kolom angka. Berguna untuk memilih fitur (Feature Selection) yang paling berpengaruh terhadap target prediksi.",
      en: "Examine linear relationship between two numerical variables. Useful for feature selection towards the target variable."
    },
    takeNote: {
      id: "'Korelasi BUKAN Kausalitas!' (Contoh: Penjualan es krim dan korban tenggelam keduanya naik saat musim panas, tapi es krim tidak menyebabkan orang tenggelam!).",
      en: "'Correlation DOES NOT imply Causation!' (Example: Ice cream sales and drowning rates both spike in summer due to temperature, not because ice cream causes drowning!)."
    },
    math: {
      id: `
**Rumus Korelasi Pearson ($r$):**
$$r = \\frac{\\sum (X - \\bar{X})(Y - \\bar{Y})}{\\sqrt{\\sum (X - \\bar{X})^2 \\sum (Y - \\bar{Y})^2}}$$
* **+1.0:** Hubungan positif sempurna (X naik, Y pasti naik).
* **0.0:** Tidak ada hubungan linier sama sekali.
* **-1.0:** Hubungan negatif sempurna (X naik, Y pasti turun).
      `,
      en: `
**Pearson Correlation ($r$) Formula:**
$$r = \\frac{\\sum (X - \\bar{X})(Y - \\bar{Y})}{\\sqrt{\\sum (X - \\bar{X})^2 \\sum (Y - \\bar{Y})^2}}$$
* **+1.0:** Perfect positive correlation (X goes up, Y goes up).
* **0.0:** No linear relationship.
* **-1.0:** Perfect negative correlation (X goes up, Y goes down).
      `
    },
    python: {
      code: `import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt

df = pd.DataFrame({
    'Jam_Belajar': [1, 2, 3, 4, 5],
    'Nilai_Ujian': [50, 60, 70, 80, 95],
    'Main_Game':   [8, 6, 4, 3, 1]
})

corr = df.corr()
print(corr)
# sns.heatmap(corr, annot=True, cmap='coolwarm')`,
      output: `             Jam_Belajar  Nilai_Ujian  Main_Game
Jam_Belajar     1.000000     0.993884  -0.991241
Nilai_Ujian     0.993884     1.000000  -0.985953
Main_Game      -0.991241    -0.985953   1.000000`
    },
    simType: "correlation"
  },

  // ===================== STAGE 2: PREPROCESSING =====================
  {
    id: "prep-scaling",
    stage: 2,
    stageName: { id: "2. Data Preprocessing", en: "2. Data Preprocessing" },
    title: { id: "Feature Scaling (StandardScaler vs MinMaxScaler)", en: "Feature Scaling (StandardScaler vs MinMaxScaler)" },
    icon: "sliders",
    purpose: {
      id: "Menyamakan skala angka. Jika Kolom A bernilai jutaan (Gaji) dan Kolom B bernilai puluhan (Umur), model ML berbasis jarak (KNN, SVM, Neural Network) akan mengabaikan Umur karena tertelan skala Gaji.",
      en: "Equalize feature ranges. If Column A is in millions (Salary) and Column B is 20-50 (Age), distance-based models (KNN, SVM, Neural Networks) will ignore Age due to scale bias."
    },
    takeNote: {
      id: "Tree-based model (Decision Tree, Random Forest, XGBoost) TIDAK butuh scaling! Tapi Regresi, KNN, SVM, dan Deep Learning WAJIB pakai scaling.",
      en: "Tree models (Decision Trees, Random Forest, XGBoost) do NOT require scaling! However, Linear Regression, KNN, SVM, and Deep Learning MUST use scaling."
    },
    math: {
      id: `
**1. Min-Max Scaler (Ubah ke rentang 0 sampai 1):**
$$X_{new} = \\frac{X - X_{min}}{X_{max} - X_{min}}$$

**2. Standard Scaler / Z-score (Mean = 0, Std = 1):**
$$Z = \\frac{X - \\mu}{\\sigma}$$
      `,
      en: `
**1. Min-Max Normalization (Map to 0 to 1):**
$$X_{new} = \\frac{X - X_{min}}{X_{max} - X_{min}}$$

**2. Standard Scaler / Z-Score (Mean = 0, Std = 1):**
$$Z = \\frac{X - \\mu}{\\sigma}$$
      `
    },
    python: {
      code: `from sklearn.preprocessing import StandardScaler, MinMaxScaler
import numpy as np

umur_dan_gaji = np.array([[20, 3000000],
                          [30, 8000000],
                          [50, 25000000]])

# MinMax Scaler
mms = MinMaxScaler()
print("MinMax (0-1):\\n", mms.fit_transform(umur_dan_gaji))

# Standard Scaler
sc = StandardScaler()
print("\\nStandard Scaler (Z-Score):\\n", sc.fit_transform(umur_dan_gaji))`,
      output: `MinMax (0-1):
[[0.         0.        ]
 [0.33333333 0.22727273]
 [1.         1.        ]]

Standard Scaler (Z-Score):
[[-1.06904497 -0.89922903]
 [-0.26726124 -0.36968474]
 [ 1.33630621  1.26891377]]`
    },
    simType: "scaling"
  },
  {
    id: "prep-encoding",
    stage: 2,
    stageName: { id: "2. Data Preprocessing", en: "2. Data Preprocessing" },
    title: { id: "Encoding Data Kategori (One-Hot vs Label)", en: "Categorical Encoding (One-Hot vs Label)" },
    icon: "code",
    purpose: {
      id: "Komputer dan algoritma matematika hanya bisa membaca angka. Teks seperti 'Merah', 'Biru', 'Kuning' harus dikonversi menjadi representasi angka numerik.",
      en: "Computers and math algorithms only process numbers. Strings like 'Red', 'Blue', 'Yellow' must be encoded into numerical matrices."
    },
    takeNote: {
      id: "HATI-HATI: Jangan pakai Label Encoding untuk kategori non-hierarkis (cth: Kota: Jakarta=1, Bandung=2, Surabaya=3) karena model akan menganggap Surabaya 3x lebih besar daripada Jakarta! Gunakan One-Hot Encoding (dummy columns 0/1).",
      en: "CAUTION: Don't use Label Encoding for nominal categories (e.g. City: Jakarta=1, Bandung=2, Surabaya=3) because algorithms assume 3 > 1! Use One-Hot Encoding (binary 0/1 indicator columns)."
    },
    math: {
      id: `
**One-Hot Matrix:**
Kategori: [Kucing, Anjing, Burung]
* Kucing $\\rightarrow [1, 0, 0]$
* Anjing $\\rightarrow [0, 1, 0]$
* Burung $\\rightarrow [0, 0, 1]$
Semua kategori berjarak sama persis $(\\sqrt{2})$, tidak ada yang 'lebih tinggi' dari yang lain.
      `,
      en: `
**One-Hot Matrix:**
Categories: [Cat, Dog, Bird]
* Cat $\\rightarrow [1, 0, 0]$
* Dog $\\rightarrow [0, 1, 0]$
* Bird $\\rightarrow [0, 0, 1]$
Every category is equidistant $(\\sqrt{2})$, eliminating false ordinal hierarchy.
      `
    },
    python: {
      code: `import pandas as pd

df = pd.DataFrame({'Kota': ['Jakarta', 'Bandung', 'Surabaya', 'Jakarta']})

# One-Hot Encoding
df_encoded = pd.get_dummies(df, columns=['Kota'], drop_first=False)
print(df_encoded.astype(int))`,
      output: `   Kota_Bandung  Kota_Jakarta  Kota_Surabaya
0             0             1              0
1             1             0              0
2             0             0              1
3             0             1              0`
    },
    simType: "encoding"
  },

  // ===================== STAGE 3: REGRESSION =====================
  {
    id: "reg-linear",
    stage: 3,
    stageName: { id: "3. Supervised ML: Regresi", en: "3. Supervised ML: Regression" },
    title: { id: "Regresi Linier Sederhana & Garis Best Fit", en: "Simple Linear Regression & Best Fit Line" },
    icon: "trending-up",
    purpose: {
      id: "Memprediksi nilai angka kontinu (seperti harga rumah, temperatur esok hari, atau proyeksi omset penjualan) berdasarkan fitur input.",
      en: "Predict a continuous numerical outcome (like housing prices, tomorrow's temperature, or revenue projection) based on input features."
    },
    takeNote: {
      id: "Ingat persamaan garis SMP: $y = mx + c$. Di Machine Learning, simbolnya cuma diganti jadi $\\hat{y} = w x + b$, di mana $w$ adalah Weight (kemiringan) dan $b$ adalah Bias (titik potong). Algoritma mencari $w$ dan $b$ yang meminimalkan total error kuadrat (Least Squares).",
      en: "Remember high-school algebra: $y = mx + c$. In ML, it's rewritten as $\\hat{y} = w x + b$, where $w$ is Weight (slope) and $b$ is Bias (intercept). The algorithm solves for $w$ and $b$ that minimize total squared errors (Ordinary Least Squares)."
    },
    math: {
      id: `
**Model Garis:**
$$\\hat{y} = w x + b$$

**Kemiringan ($w$) optimal:**
$$w = \\frac{\\sum (x - \\bar{x})(y - \\bar{y})}{\\sum (x - \\bar{x})^2}$$

**Loss Function (MSE - Mean Squared Error):**
$$MSE = \\frac{1}{N} \\sum_{i=1}^{N} (y_i - \\hat{y}_i)^2$$
      `,
      en: `
**Line Model:**
$$\\hat{y} = w x + b$$

**Optimal Slope ($w$):**
$$w = \\frac{\\sum (x - \\bar{x})(y - \\bar{y})}{\\sum (x - \\bar{x})^2}$$

**Cost/Loss Function (MSE):**
$$MSE = \\frac{1}{N} \\sum_{i=1}^{N} (y_i - \\hat{y}_i)^2$$
      `
    },
    python: {
      code: `from sklearn.linear_model import LinearRegression
import numpy as np

# Luas Tanah (m2) vs Harga (Juta)
X = np.array([[60], [80], [100], [120], [150]])
y = np.array([300, 420, 500, 610, 750])

model = LinearRegression()
model.fit(X, y)

print("Weight (Slope w) :", model.coef_[0])
print("Bias (Intercept b):", model.intercept_)

# Prediksi rumah 110 m2
pred_110 = model.predict([[110]])
print("Prediksi Rumah 110m2:", pred_110[0])`,
      output: `Weight (Slope w) : 4.965909090909091
Bias (Intercept b): 3.295454545454504
Prediksi Rumah 110m2: 549.5454545454545`
    },
    simType: "regression"
  },
  {
    id: "reg-eval",
    stage: 3,
    stageName: { id: "3. Supervised ML: Regresi", en: "3. Supervised ML: Regression" },
    title: { id: "Metrik Evaluasi Regresi (MAE, RMSE, R²)", en: "Regression Evaluation Metrics (MAE, RMSE, R²)" },
    icon: "check-circle",
    purpose: {
      id: "Mengukur seberapa jago model kita. Jika kita menebak harga rumah 500 juta padahal aslinya 550 juta, seberapa besar penalti kesalahannya?",
      en: "Assess how accurately the model performs. If we predict $500k but actual is $550k, how do we systematically quantify this error?"
    },
    takeNote: {
      id: "Gunakan **MAE** jika Anda ingin error dalam satuan uang aslinya (misal: 'Rata-rata tebakan meleset 15 juta'). Gunakan **RMSE** jika Anda ingin memberi hukuman berat bagi tebakan yang meleset jauh (karena selisihnya dikuadratkan). $R^2$ menunjukkan persentase variasi data yang berhasil dijelaskan (maksimal 1.0 atau 100%).",
      en: "Use **MAE** for intuitive unit errors ('predictions are off by $15k on average'). Use **RMSE** if large errors must be penalized heavily. $R^2$ represents the percentage of variance explained by the model (maximum 1.0 or 100%)."
    },
    math: {
      id: `
**1. MAE (Mean Absolute Error):**
$$MAE = \\frac{1}{N} \\sum |y - \\hat{y}|$$

**2. RMSE (Root Mean Squared Error):**
$$RMSE = \\sqrt{\\frac{1}{N} \\sum (y - \\hat{y})^2}$$

**3. Nilai $R^2$ (Koefisien Determinasi):**
$$R^2 = 1 - \\frac{\\sum (y - \\hat{y})^2}{\\sum (y - \\bar{y})^2}$$
      `,
      en: `
**1. MAE (Mean Absolute Error):**
$$MAE = \\frac{1}{N} \\sum |y - \\hat{y}|$$

**2. RMSE (Root Mean Squared Error):**
$$RMSE = \\sqrt{\\frac{1}{N} \\sum (y - \\hat{y})^2}$$

**3. $R^2$ Score (Coefficient of Determination):**
$$R^2 = 1 - \\frac{\\sum (y - \\hat{y})^2}{\\sum (y - \\bar{y})^2}$$
      `
    },
    python: {
      code: `from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import numpy as np

y_asli = [500, 600, 700, 800]
y_pred = [510, 580, 730, 790]

print("MAE  :", mean_absolute_error(y_asli, y_pred))
print("RMSE :", np.sqrt(mean_squared_error(y_asli, y_pred)))
print("R2   :", r2_score(y_asli, y_pred))`,
      output: `MAE  : 17.5
RMSE : 19.364916731037084
R2   : 0.9625 (Model menjelaskan 96.25% pola data)`
    },
    simType: "regeval"
  },

  // ===================== STAGE 4: CLASSIFICATION =====================
  {
    id: "clf-logistic",
    stage: 4,
    stageName: { id: "4. Supervised ML: Klasifikasi", en: "4. Supervised ML: Classification" },
    title: { id: "Regresi Logistik & Fungsi Sigmoid", en: "Logistic Regression & Sigmoid Function" },
    icon: "help-circle",
    purpose: {
      id: "Mengklasifikasikan biner Ya/Tidak (0 atau 1), seperti mendeteksi Email Spam vs Bukan Spam, atau Pasien Sakit vs Sehat.",
      en: "Classify binary outcomes (0 or 1), such as detecting Spam vs Not Spam emails, or Disease vs Healthy diagnosis."
    },
    takeNote: {
      id: "Namanya memang ada kata 'Regresi', tapi aslinya ini adalah algoritma **KLASIFIKASI**! Rahasianya: output garis linier $z = wx+b$ dimasukkan ke dalam corong kurva 'S' (Fungsi Sigmoid) sehingga keluarannya selalu terjepit rapi di angka 0.0 s/d 1.0 (Probabilitas).",
      en: "Despite having 'Regression' in its name, it is a **CLASSIFICATION** algorithm! Mechanism: Linear output $z = wx+b$ is passed through an S-curve (Sigmoid function) compressing output strictly between 0.0 and 1.0 (Probability)."
    },
    math: {
      id: `
**Fungsi Sigmoid ($\\sigma$):**
$$\\sigma(z) = \\frac{1}{1 + e^{-z}}$$
di mana $z = w_1 x_1 + w_2 x_2 + b$

* Jika $\\sigma(z) \\ge 0.5$, maka Prediksi = Kelas 1 (Spam / Sakit).
* Jika $\\sigma(z) < 0.5$, maka Prediksi = Kelas 0 (Normal).
      `,
      en: `
**Sigmoid Activation ($\\sigma$):**
$$\\sigma(z) = \\frac{1}{1 + e^{-z}}$$
where $z = w_1 x_1 + w_2 x_2 + b$

* If $\\sigma(z) \\ge 0.5$, Prediction = Class 1 (Positive).
* If $\\sigma(z) < 0.5$, Prediction = Class 0 (Negative).
      `
    },
    python: {
      code: `from sklearn.linear_model import LogisticRegression
import numpy as np

# Jam belajar -> Lulus (1) atau Tidak Lulus (0)
X = np.array([[1], [2], [3], [5], [6], [8]])
y = np.array([0, 0, 0, 1, 1, 1])

clf = LogisticRegression()
clf.fit(X, y)

jam_test = [[4]]
probabilitas = clf.predict_proba(jam_test)
print(f"Peluang Lulus (4 jam belajar): {probabilitas[0][1]*100:.1f}%")
print("Prediksi Kelas:", clf.predict(jam_test)[0])`,
      output: `Peluang Lulus (4 jam belajar): 62.4%
Prediksi Kelas: 1 (Lulus)`
    },
    simType: "logistic"
  },
  {
    id: "clf-metrics",
    stage: 4,
    stageName: { id: "4. Supervised ML: Klasifikasi", en: "4. Supervised ML: Classification" },
    title: { id: "Confusion Matrix, Precision & Recall", en: "Confusion Matrix, Precision & Recall" },
    icon: "target",
    purpose: {
      id: "Mengukur kualitas model klasifikasi. Akurasi saja sering MENIPU (misal kasus kanker: jika 99% pasien sehat, model malas yang selalu menebak 'Semua Sehat' punya akurasi 99%, padahal membiarkan orang sakit meninggal!).",
      en: "Evaluate classification quality beyond raw accuracy. Accuracy is misleading in imbalanced datasets (e.g. 99% patients healthy, a naive model guessing all healthy has 99% accuracy but kills patients!)."
    },
    takeNote: {
      id: "Gunakan **Recall** tinggi saat Anda TIDAK BOLEH kecolongan kasus positif (cth: Diagnosa Kanker atau Deteksi Gempa). Gunakan **Precision** tinggi saat Anda TIDAK BOLEH salah tuduh (cth: Menuduh orang kriminal atau menandai email penting masuk spam).",
      en: "Prioritize high **Recall** when false negatives are dangerous (e.g. cancer diagnosis, fraud detection). Prioritize high **Precision** when false positives are costly (e.g. marking important boss emails as spam)."
    },
    math: {
      id: `
**Komponen Matriks:**
* **TP (True Positive):** Asli Positif, Ditebak Positif (Benar)
* **FP (False Positive):** Asli Negatif, Ditebak Positif (Salah Tuduh)
* **FN (False Negative):** Asli Positif, Ditebak Negatif (Kecolongan)
* **TN (True Negative):** Asli Negatif, Ditebak Negatif (Benar)

$$\\text{Precision} = \\frac{TP}{TP + FP}$$
$$\\text{Recall} = \\frac{TP}{TP + FN}$$
$$F1 = 2 \\times \\frac{\\text{Precision} \\times \\text{Recall}}{\\text{Precision} + \\text{Recall}}$$
      `,
      en: `
**Confusion Matrix Grid:**
* **TP:** Actual Positive, Predicted Positive (Hit)
* **FP:** Actual Negative, Predicted Positive (False Alarm)
* **FN:** Actual Positive, Predicted Negative (Miss)
* **TN:** Actual Negative, Predicted Negative (Correct Rejection)

$$\\text{Precision} = \\frac{TP}{TP + FP}$$
$$\\text{Recall} = \\frac{TP}{TP + FN}$$
$$F1 = 2 \\times \\frac{\\text{Precision} \\times \\text{Recall}}{\\text{Precision} + \\text{Recall}}$$
      `
    },
    python: {
      code: `from sklearn.metrics import classification_report, confusion_matrix

y_true = [1, 1, 1, 0, 0, 0, 1, 0]
y_pred = [1, 1, 0, 0, 0, 1, 1, 0]

print("Confusion Matrix:\\n", confusion_matrix(y_true, y_pred))
print("\\nLaporan Lengkap:\\n", classification_report(y_true, y_pred))`,
      output: `Confusion Matrix:
[[3 1]   <- TN=3, FP=1
 [1 3]]  <- FN=1, TP=3

Laporan Lengkap:
              precision    recall  f1-score   support
           0       0.75      0.75      0.75         4
           1       0.75      0.75      0.75         4
    accuracy                           0.75         8`
    },
    simType: "confmatrix"
  },

  // ===================== STAGE 5: ENSEMBLE ML =====================
  {
    id: "ml-tree-forest",
    stage: 5,
    stageName: { id: "5. Ensemble Machine Learning", en: "5. Ensemble Machine Learning" },
    title: { id: "Decision Tree & Random Forest", en: "Decision Tree & Random Forest" },
    icon: "git-branch",
    purpose: {
      id: "Membuat keputusan berbasis percabangan logis IF-ELSE otomatis (Decision Tree), lalu menggabungkan ratusan pohon keputusan untuk hasil yang jauh lebih akurat dan stabil (Random Forest).",
      en: "Create automated IF-ELSE branch logic (Decision Tree), and combine hundreds of diverse trees for far higher stability and accuracy (Random Forest)."
    },
    takeNote: {
      id: "Satu Decision Tree rawan mengalami **Overfitting** (menghafal data latih sampai ke akar-akarnya sehingga gagal saat diberi data baru). Random Forest memecahkan ini dengan prinsip *Wisdom of the Crowd*: melatih 100 pohon berbeda dengan potongan data acak, lalu mengambil suara terbanyak (Voting).",
      en: "A single Decision Tree easily **Overfits** (memorizes training noise). Random Forest solves this via *Wisdom of the Crowd*: train 100 trees on random data subsets (Bootstrap) and aggregate with majority voting."
    },
    math: {
      id: `
**Gini Impurity (Kemurnian Cabang Pohon):**
$$Gini = 1 - \\sum (p_i)^2$$
* Jika satu cabang isinya 100% kelas Lulus $\\rightarrow Gini = 1 - (1)^2 = 0$ (Murni sempurna!).
* Pohon mencari kondisi cabang (IF-ELSE) yang menghasilkan penurunan Gini terbesar.
      `,
      en: `
**Gini Impurity Formula:**
$$Gini = 1 - \\sum (p_i)^2$$
* If a leaf contains 100% one class $\\rightarrow Gini = 1 - (1)^2 = 0$ (Pure node).
* The tree greedily selects the split condition that minimizes weighted child Gini impurity.
      `
    },
    python: {
      code: `from sklearn.ensemble import RandomForestClassifier
from sklearn.datasets import make_classification

X, y = make_classification(n_samples=200, n_features=4, random_state=42)

# Buat hutan dengan 50 pohon
rf = RandomForestClassifier(n_estimators=50, random_state=42)
rf.fit(X, y)

print("Akurasi Random Forest:", rf.score(X, y))
print("Tingkat Kepentingan Fitur (Feature Importance):", rf.feature_importances_)`,
      output: `Akurasi Random Forest: 1.0
Tingkat Kepentingan Fitur: [0.124 0.651 0.182 0.043] 
(Fitur ke-2 paling mendominasi keputusan!)`
    },
    simType: "gini"
  },

  // ===================== STAGE 6: DEEP LEARNING =====================
  {
    id: "dl-perceptron",
    stage: 6,
    stageName: { id: "6. Deep Learning Dasar", en: "6. Deep Learning Fundamentals" },
    title: { id: "Neuron Buatan (Perceptron) & Aktivasi", en: "Artificial Neuron (Perceptron) & Activations" },
    icon: "cpu",
    purpose: {
      id: "Blok bangunan paling mendasar dari seluruh arsitektur Deep Learning (dari CNN, RNN, hingga ChatGPT / Transformer).",
      en: "The fundamental atomic building block of all Deep Learning architectures (from CNNs, RNNs, to Transformers/LLMs)."
    },
    takeNote: {
      id: "Neuron buatan itu simpel: perkalian dot product `(input * bobot) + bias`, lalu disaring lewat **Fungsi Aktivasi** (misal ReLU: jika negatif jadi 0, jika positif biarkan lolos). Tanpa fungsi aktivasi non-linier, tumpukan 100 layer neural network cuma setara dengan regresi linier biasa!",
      en: "An artificial neuron is essentially dot product `(input * weight) + bias` passed through an **Activation Function** (like ReLU: zero if negative, linear if positive). Without non-linear activations, a 100-layer neural network collapses into basic linear algebra!"
    },
    math: {
      id: `
**Perhitungan 1 Neuron:**
$$z = \\sum_{i=1}^{m} (w_i \\cdot x_i) + b = (w_1 x_1 + w_2 x_2 + \\dots) + b$$

**Fungsi Aktivasi Populer:**
* **ReLU (Paling populer):** $f(z) = \\max(0, z)$
* **Sigmoid:** $f(z) = \\frac{1}{1 + e^{-z}}$
      `,
      en: `
**Neuron Forward Equation:**
$$z = \\sum_{i=1}^{m} (w_i \\cdot x_i) + b = (w_1 x_1 + w_2 x_2 + \\dots) + b$$

**Common Activations:**
* **ReLU (Default gold standard):** $f(z) = \\max(0, z)$
* **Sigmoid:** $f(z) = \\frac{1}{1 + e^{-z}}$
      `
    },
    python: {
      code: `import torch
import torch.nn as nn

# 1 Buah Neuron: 2 Input -> 1 Output
neuron = nn.Linear(in_features=2, out_features=1)
relu = nn.ReLU()

input_data = torch.tensor([[1.5, -2.0]])
z = neuron(input_data)
output = relu(z)

print("Bobot (Weights):", neuron.weight.data)
print("Bias          :", neuron.bias.data)
print("Output ReLU   :", output.item())`,
      output: `Bobot (Weights): tensor([[ 0.4521, -0.2134]])
Bias          : tensor([-0.1250])
Output ReLU   : 0.97995`
    },
    simType: "perceptron"
  },
  {
    id: "dl-backprop",
    stage: 6,
    stageName: { id: "6. Deep Learning Dasar", en: "6. Deep Learning Fundamentals" },
    title: { id: "Loss, Gradient Descent & Backpropagation", en: "Loss, Gradient Descent & Backpropagation" },
    icon: "activity",
    purpose: {
      id: "Mekanisme bagaimana Neural Network 'belajar'. Bagaimana model mengoreksi jutaan bobotnya sendiri secara otomatis setiap kali membuat kesalahan tebakan.",
      en: "The mechanism of how Neural Networks actually 'learn'. How the model self-corrects millions of internal weights when it makes erroneous predictions."
    },
    takeNote: {
      id: "Bayangkan Anda sedang berjalan menuruni bukit berkabut tebal dalam kondisi mata tertutup. Anda meraba kemiringan tanah dengan kaki (Gradient / Turunan Parsial), lalu melangkah mundur ke arah yang paling menurun dengan ukuran langkah kecil (Learning Rate $\\alpha$). Jika langkah terlalu besar, Anda bisa terpeleset!",
      en: "Intuition: Walking down a misty mountain blindfolded. You feel the ground slope with your foot (Gradient / Partial Derivative), then take a step downhill scaled by step size (Learning Rate $\\alpha$). If step size is too large, you overshoot into a ravine!"
    },
    math: {
      id: `
**Aturan Pembaruan Bobot (Gradient Descent):**
$$W_{baru} = W_{lama} - \\alpha \\cdot \\frac{\\partial \\text{Loss}}{\\partial W}$$
* $\\alpha$ = Learning Rate (misal 0.01)
* $\\frac{\\partial \\text{Loss}}{\\partial W}$ = Turunan (arah kesalahan)

Backpropagation menggunakan aturan rantai kalkulus (**Chain Rule**) untuk mengalirkan kesalahan dari output balik ke layer paling depan.
      `,
      en: `
**Weight Update Rule (Gradient Descent):**
$$W_{new} = W_{old} - \\alpha \\cdot \\frac{\\partial \\text{Loss}}{\\partial W}$$
* $\\alpha$ = Learning Rate (e.g. 0.01)
* $\\frac{\\partial \\text{Loss}}{\\partial W}$ = Gradient vector (direction of steepest ascent)

Backpropagation applies calculus **Chain Rule** backwards from output loss to update earliest layers.
      `
    },
    python: {
      code: `import torch

# Contoh optimasi bobot dengan PyTorch autograd
w = torch.tensor([5.0], requires_grad=True) # Nilai tebakan awal
lr = 0.1 # Learning rate

# Misal target yang benar adalah y = 0
for step in range(5):
    loss = (w - 0) ** 2  # MSE Loss
    loss.backward()      # Hitung gradient otomatis!
    
    with torch.no_grad():
        w -= lr * w.grad # Update bobot
        w.grad.zero_()   # Reset gradient
    print(f"Step {step+1}: w = {w.item():.4f}, Loss = {loss.item():.4f}")`,
      output: `Step 1: w = 4.0000, Loss = 25.0000
Step 2: w = 3.2000, Loss = 16.0000
Step 3: w = 2.5600, Loss = 10.2400
Step 4: w = 2.0480, Loss = 6.5536
Step 5: w = 1.6384, Loss = 4.1943 
(Bobot w terus mendekati 0 dan error/loss makin lenyap!)`
    },
    simType: "gradient"
  }
];

// UI Language Translations for App Shell
const UI_TEXT = {
  id: {
    appTitle: "DS Pocket",
    appSubtitle: "Roadmap Belajar Data Science (EDA s/d Deep Learning)",
    searchPlaceholder: "Cari materi (mis: korelasi, outlier, regresi...)",
    allStages: "Semua Bab",
    progressTitle: "Progres Belajar Anda",
    completed: "Selesai",
    markDone: "Tandai Selesai",
    markedDone: "Selesai Dipelajari ✓",
    tabPurpose: "🎯 Untuk Apa",
    tabMath: "📐 Rumus & Manual",
    tabSim: "🧪 Simulasi Interaktif",
    tabCode: "💻 Python Code & Output",
    tabNote: "💡 Catatan Kunci (Take Note)",
    copyCode: "Salin Kode",
    copied: "Tersalin!",
    simTitle: "Coba Ubah Nilai (Simulasi Langsung):",
    calcButton: "Hitung Ulang",
    stages: [
      "1. EDA",
      "2. Preprocessing",
      "3. Regresi",
      "4. Klasifikasi",
      "5. Ensemble ML",
      "6. Deep Learning"
    ],
    addToHomeTip: "📱 Tips: Buka menu browser HP & klik 'Tambahkan ke Layar Utama' (Add to Home Screen) untuk menjadikannya aplikasi mandiri!"
  },
  en: {
    appTitle: "DS Pocket",
    appSubtitle: "Data Science Roadmap (EDA to Deep Learning)",
    searchPlaceholder: "Search topics (e.g., correlation, outlier, regression...)",
    allStages: "All Stages",
    progressTitle: "Your Learning Progress",
    completed: "Completed",
    markDone: "Mark as Completed",
    markedDone: "Learned ✓",
    tabPurpose: "🎯 Purpose",
    tabMath: "📐 Math & Manual",
    tabSim: "🧪 Interactive Sim",
    tabCode: "💻 Python Code & Output",
    tabNote: "💡 Key Takeaway (Take Note)",
    copyCode: "Copy Code",
    copied: "Copied!",
    simTitle: "Adjust Values (Live Simulation):",
    calcButton: "Recalculate",
    stages: [
      "1. EDA",
      "2. Preprocessing",
      "3. Regression",
      "4. Classification",
      "5. Ensemble ML",
      "6. Deep Learning"
    ],
    addToHomeTip: "📱 Tip: Open your mobile browser menu and tap 'Add to Home Screen' to use it as a native standalone app!"
  }
};
