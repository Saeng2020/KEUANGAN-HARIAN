# docs/implementation-plan.md

# Implementation Plan — Front-End Cashflow Harian

## Phase 1 — Setup Project

Buat struktur project:

```txt
index.html
README.md
docs/
assets/css/custom.css
assets/js/app.js
assets/js/menu.js
assets/js/data.js
pages/
components/
```

Tambahkan TailwindCSS Play CDN di `index.html`:

```html
<script src="https://cdn.tailwindcss.com"></script>
```

Tambahkan konfigurasi tema Tailwind di dalam `index.html`.

---

## Phase 2 — Shell Layout

Bangun `index.html` sebagai shell utama aplikasi.

Elemen wajib:

```html
<div id="sidebar"></div>
<div id="topbar"></div>
<main id="app-content"></main>
<div id="mobile-nav"></div>
```

Layout:

* Sidebar untuk desktop
* Topbar untuk semua ukuran layar
* Bottom navigation untuk mobile
* Content area responsif

---

## Phase 3 — Dynamic Menu

Buat `assets/js/menu.js`.

Menu aplikasi:

```js
const menus = [
  {
    label: "Dashboard",
    page: "dashboard",
    url: "pages/dashboard.html",
    icon: "layout-dashboard"
  },
  {
    label: "Transaksi",
    page: "transactions",
    url: "pages/transactions.html",
    icon: "receipt"
  },
  {
    label: "Tambah Transaksi",
    page: "transaction-form",
    url: "pages/transaction-form.html",
    icon: "plus-circle"
  },
  {
    label: "Kategori",
    page: "categories",
    url: "pages/categories.html",
    icon: "tags"
  },
  {
    label: "Metode Bayar",
    page: "payment-methods",
    url: "pages/payment-methods.html",
    icon: "credit-card"
  },
  {
    label: "Laporan",
    page: "reports",
    url: "pages/reports.html",
    icon: "bar-chart"
  },
  {
    label: "Pengaturan",
    page: "settings",
    url: "pages/settings.html",
    icon: "settings"
  }
];
```

Menu harus dirender secara dinamis ke sidebar dan mobile nav.

---

## Phase 4 — Dynamic Page Loading

Buat fungsi di `assets/js/app.js`:

```js
async function loadPage(pageUrl) {
  const appContent = document.getElementById("app-content");
  const response = await fetch(pageUrl);
  const html = await response.text();
  appContent.innerHTML = html;
}
```

Behavior:

* Default load: dashboard
* Klik menu akan mengganti konten `#app-content`
* Active menu state harus berubah
* Gunakan hash route sederhana, contoh `#dashboard`

---

## Phase 5 — Dummy Data

Buat `assets/js/data.js`.

Data dummy minimal:

* Transactions
* Categories
* Payment methods
* Business settings

Data transaksi harus memiliki:

```js
{
  id: 1,
  date: "2026-06-06",
  type: "income",
  category: "Penjualan",
  paymentMethod: "QRIS",
  amount: 250000,
  note: "Penjualan harian",
  status: "completed"
}
```

Data kategori harus memiliki:

```js
{
  id: 1,
  name: "Penjualan",
  type: "income",
  isDefault: true
}
```

Data metode pembayaran harus memiliki:

```js
{
  id: 1,
  name: "Cash",
  isDefault: true,
  isActive: true
}
```

---

## Phase 6 — Dashboard Page

Buat `pages/dashboard.html`.

Komponen:

* Welcome card
* Total saldo card
* Total pemasukan card
* Total pengeluaran card
* Laba/rugi card
* Chart placeholder
* Recent transaction list
* Quick action button

Aksi:

* Tombol tambah transaksi membuka halaman form transaksi.
* Item transaksi terbaru bisa membuka detail visual.
* Link laporan membuka halaman laporan.

---

## Phase 7 — Transactions Page

Buat `pages/transactions.html`.

Komponen:

* Page header
* Tombol tambah transaksi
* Search input
* Filter tipe transaksi
* Table desktop
* Card list mobile
* Action dropdown/button

Aksi wajib:

* Tambah transaksi
* Edit transaksi
* Hapus transaksi
* Lihat detail transaksi

Behavior:

* Klik edit mengarahkan ke `transaction-form` dengan mode edit.
* Klik hapus membuka modal konfirmasi.
* Setelah konfirmasi hapus, item boleh dihapus dari array dummy/local state.
* Jika tidak benar-benar menghapus data, tampilkan toast simulasi berhasil.

---

## Phase 8 — Transaction Form Page

Buat `pages/transaction-form.html`.

Mode form:

* Add mode
* Edit mode

Field:

* Tipe transaksi
* Nominal
* Kategori
* Metode pembayaran
* Tanggal
* Catatan

Aksi:

* Simpan
* Batal
* Reset
* Kembali

Behavior:

* Pada add mode, judul: `Tambah Transaksi`
* Pada edit mode, judul: `Edit Transaksi`
* Pada edit mode, form terisi data dummy berdasarkan id.
* Submit menampilkan toast sukses.
* Setelah submit, arahkan ke halaman transaksi.

---

## Phase 9 — Categories Page

Buat `pages/categories.html`.

Komponen:

* Page header
* Tombol tambah kategori
* Filter income/expense
* Card kategori
* Badge tipe kategori
* Action edit/hapus

Aksi wajib:

* Tambah kategori
* Edit kategori
* Hapus kategori

Behavior:

* Tambah/edit menggunakan modal visual.
* Hapus menggunakan modal konfirmasi.
* Kategori default tidak boleh dihapus.
* Jika user mencoba hapus kategori default, tampilkan alert/toast:
  `Kategori default tidak dapat dihapus.`

---

## Phase 10 — Payment Methods Page

Buat `pages/payment-methods.html`.

Komponen:

* Page header
* Tombol tambah metode pembayaran
* Card metode pembayaran
* Status aktif/nonaktif
* Action edit/hapus

Aksi wajib:

* Tambah metode pembayaran
* Edit metode pembayaran
* Hapus metode pembayaran
* Toggle aktif/nonaktif

Behavior:

* Tambah/edit menggunakan modal visual.
* Hapus menggunakan modal konfirmasi.
* Metode default tidak boleh dihapus.
* Jika user mencoba hapus metode default, tampilkan alert/toast:
  `Metode pembayaran default tidak dapat dihapus.`

---

## Phase 11 — Reports Page

Buat `pages/reports.html`.

Komponen:

* Filter tanggal
* Summary cards
* Chart placeholder
* Tabel laporan transaksi

Aksi wajib:

* Filter laporan
* Reset filter
* Export visual
* Edit transaksi
* Hapus transaksi

Behavior:

* Edit transaksi dari laporan mengarah ke form edit transaksi.
* Hapus transaksi dari laporan membuka modal konfirmasi.
* Export cukup berupa tombol visual atau toast simulasi.

---

## Phase 12 — Settings Page

Buat `pages/settings.html`.

Komponen:

* Business profile form
* Currency setting
* Date format setting
* Monthly target setting
* Theme setting

Aksi wajib:

* Edit pengaturan
* Simpan pengaturan
* Reset pengaturan

Behavior:

* Simpan menampilkan toast sukses.
* Reset mengembalikan form ke data dummy awal.

---

## Phase 13 — Shared UI Utilities

Tambahkan fungsi reusable di `app.js`:

* `showToast(message, type)`
* `showConfirmModal(message, onConfirm)`
* `formatCurrency(amount)`
* `formatDate(date)`
* `navigateTo(page)`
* `setActiveMenu(page)`

---

## Phase 14 — Final QA

Checklist:

* Semua menu berjalan.
* Semua halaman berhasil dimuat.
* Semua tombol tambah/edit/hapus tampil.
* Semua modal konfirmasi tampil.
* Semua halaman responsive.
* Tidak ada error console.
* UI konsisten.
* Tidak ada dependency tambahan.
* Tailwind Play CDN berjalan.
