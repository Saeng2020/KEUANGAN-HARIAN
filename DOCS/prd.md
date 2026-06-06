# docs/PRD.md

# PRD — Aplikasi Keuangan Harian

## 1. Nama Produk

**Cashflow Harian**

## 2. Tujuan Produk

Membangun tampilan front-end aplikasi keuangan harian untuk membantu pengguna mencatat pemasukan, pengeluaran, saldo, kategori transaksi, metode pembayaran, serta melihat laporan cashflow harian secara mudah.

## 3. Scope Tahap Pertama

Tahap pertama hanya membangun **front-end** menggunakan:

* HTML responsive
* TailwindCSS Play CDN
* JavaScript native
* Dynamic menu dari `index.html`
* Dynamic page loading menggunakan `fetch()`
* Data dummy/local dari JavaScript
* Belum menggunakan backend
* Belum menggunakan database

## 4. Target Pengguna

* Pemilik usaha kecil
* Freelancer
* UMKM
* Pengguna pribadi
* Admin keuangan sederhana

## 5. Modul Aplikasi

### 5.1 Dashboard

Menampilkan:

* Total saldo
* Total pemasukan hari ini
* Total pengeluaran hari ini
* Laba/rugi harian
* Grafik ringkas cashflow
* Transaksi terbaru
* Shortcut tambah transaksi

Aksi yang tersedia:

* Lihat detail transaksi terbaru
* Masuk ke halaman tambah transaksi
* Masuk ke laporan

---

### 5.2 Transaksi

Menampilkan daftar transaksi harian.

Data transaksi:

* Tanggal
* Tipe transaksi
* Kategori
* Metode pembayaran
* Nominal
* Catatan
* Status
* Aksi

Aksi yang tersedia:

* Tambah transaksi
* Edit transaksi
* Hapus transaksi
* Filter transaksi berdasarkan tipe
* Search transaksi
* Lihat detail transaksi

Catatan:

* Tombol edit membuka form edit transaksi.
* Tombol hapus menampilkan modal konfirmasi.
* Pada tahap front-end, aksi edit/hapus cukup berupa simulasi UI menggunakan data dummy/local.

---

### 5.3 Tambah/Edit Transaksi

Form transaksi digunakan untuk tambah dan edit data.

Field:

* Tipe transaksi: pemasukan / pengeluaran
* Nominal
* Kategori
* Metode pembayaran
* Tanggal
* Catatan

Validasi UI:

* Nominal wajib diisi
* Tanggal wajib diisi
* Kategori wajib dipilih
* Metode pembayaran wajib dipilih

Aksi:

* Simpan transaksi
* Batalkan
* Reset form
* Kembali ke daftar transaksi

---

### 5.4 Kategori

Digunakan untuk mengelola kategori pemasukan dan pengeluaran.

Data kategori:

* Nama kategori
* Tipe kategori
* Status default/custom
* Jumlah transaksi terkait
* Aksi

Aksi yang tersedia:

* Tambah kategori
* Edit kategori
* Hapus kategori
* Filter kategori berdasarkan tipe

Catatan:

* Kategori default tidak boleh dihapus.
* Kategori custom boleh diedit dan dihapus.
* Hapus kategori menampilkan modal konfirmasi.

---

### 5.5 Metode Pembayaran

Digunakan untuk mengelola metode pembayaran.

Contoh metode:

* Cash
* Transfer Bank
* QRIS
* E-Wallet
* Kartu Debit
* Kartu Kredit

Data metode pembayaran:

* Nama metode
* Ikon/label
* Status aktif/nonaktif
* Jumlah transaksi terkait
* Aksi

Aksi yang tersedia:

* Tambah metode pembayaran
* Edit metode pembayaran
* Hapus metode pembayaran
* Aktifkan/nonaktifkan metode pembayaran

Catatan:

* Metode pembayaran default tidak boleh dihapus.
* Metode custom boleh diedit dan dihapus.

---

### 5.6 Laporan

Menampilkan laporan cashflow.

Konten:

* Filter tanggal
* Total pemasukan
* Total pengeluaran
* Selisih cashflow
* Grafik ringkas
* Tabel laporan transaksi

Aksi yang tersedia:

* Filter laporan
* Reset filter
* Export visual
* Lihat detail transaksi
* Edit transaksi dari tabel laporan
* Hapus transaksi dari tabel laporan

---

### 5.7 Pengaturan

Digunakan untuk mengatur informasi bisnis.

Field:

* Nama bisnis
* Mata uang
* Format tanggal
* Target saldo bulanan
* Tema tampilan

Aksi:

* Edit pengaturan
* Simpan pengaturan
* Reset pengaturan

---

## 6. Struktur File

```txt
cashflow-harian/
│
├── index.html
├── README.md
│
├── docs/
│   ├── PRD.md
│   ├── implementation-plan.md
│   └── ui-guidelines.md
│
├── assets/
│   ├── css/
│   │   └── custom.css
│   ├── js/
│   │   ├── app.js
│   │   ├── menu.js
│   │   └── data.js
│   └── img/
│
├── pages/
│   ├── dashboard.html
│   ├── transactions.html
│   ├── transaction-form.html
│   ├── categories.html
│   ├── payment-methods.html
│   ├── reports.html
│   └── settings.html
│
└── components/
    ├── sidebar.html
    ├── topbar.html
    └── mobile-nav.html
```

## 7. Batasan Teknis

Codex wajib mengikuti batasan berikut:

* Tidak membuat backend.
* Tidak membuat database.
* Tidak menggunakan React, Vue, Next.js, Laravel, Bootstrap, atau framework lain.
* Tidak menggunakan build tools.
* Gunakan HTML, TailwindCSS Play CDN, dan JavaScript native.
* Semua halaman harus responsive.
* Semua menu harus dinamis dari JavaScript.
* Semua halaman dimuat ke `#app-content`.
