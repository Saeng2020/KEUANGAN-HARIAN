# docs/ui-guidelines.md

# UI Guidelines — Modern Finance SaaS 2026

## 1. Design Direction

Gunakan gaya desain:

**Modern Finance SaaS 2026**

Karakter visual:

* Clean
* Modern
* Premium
* Responsive
* Data-focused
* Mobile-first
* Rounded layout
* Soft shadow
* Spacious whitespace
* Kontras jelas untuk data keuangan

---

## 2. Color System

### Primary

```txt
Emerald / Green Finance
```

Digunakan untuk:

* Button utama
* Saldo positif
* Pemasukan
* Active menu
* Highlight utama

Contoh class:

```html
bg-emerald-600
text-emerald-700
bg-emerald-50
border-emerald-200
```

### Expense / Danger

```txt
Rose / Red
```

Digunakan untuk:

* Pengeluaran
* Tombol hapus
* Warning delete
* Saldo negatif

Contoh class:

```html
bg-rose-600
text-rose-700
bg-rose-50
border-rose-200
```

### Neutral

```txt
Slate
```

Digunakan untuk:

* Background
* Text
* Border
* Table
* Card

Contoh class:

```html
bg-slate-50
text-slate-900
text-slate-500
border-slate-200
```

### Accent

```txt
Sky Blue
```

Digunakan untuk:

* Info card
* Link sekunder
* Chart placeholder

Contoh class:

```html
bg-sky-50
text-sky-700
border-sky-200
```

---

## 3. Layout Rules

### Desktop

* Sidebar fixed di kiri.
* Content area di kanan.
* Table digunakan untuk daftar data.
* Summary card menggunakan grid 4 kolom.

### Tablet

* Sidebar boleh tetap tampil atau compact.
* Summary card menggunakan grid 2 kolom.
* Table tetap bisa digunakan dengan horizontal scroll.

### Mobile

* Sidebar disembunyikan.
* Bottom navigation ditampilkan.
* List data menggunakan card.
* Tombol aksi menggunakan icon button/dropdown.
* Form full width.

---

## 4. Card Component

Gunakan style default berikut:

```html
<div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
  ...
</div>
```

Hover card:

```html
hover:border-emerald-200 hover:shadow-md transition
```

---

## 5. Button Styles

### Primary Button

```html
<button class="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700">
  Simpan
</button>
```

### Secondary Button

```html
<button class="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
  Batal
</button>
```

### Danger Button

```html
<button class="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-rose-700">
  Hapus
</button>
```

### Icon Action Button

Untuk edit/hapus pada tabel atau card:

```html
<button class="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-900">
  Edit
</button>
```

Edit button:

```html
<button class="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-700 hover:bg-sky-100">
  Edit
</button>
```

Delete button:

```html
<button class="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100">
  Hapus
</button>
```

---

## 6. Badge Styles

### Income Badge

```html
<span class="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
  Pemasukan
</span>
```

### Expense Badge

```html
<span class="rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700">
  Pengeluaran
</span>
```

### Default Badge

```html
<span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
  Default
</span>
```

### Active Badge

```html
<span class="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
  Aktif
</span>
```

### Inactive Badge

```html
<span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
  Nonaktif
</span>
```

---

## 7. Form Styles

Input:

```html
<input class="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-50">
```

Select:

```html
<select class="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-50">
```

Textarea:

```html
<textarea class="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-50"></textarea>
```

---

## 8. Table Rules

Table desktop:

```html
<div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
  <table class="min-w-full divide-y divide-slate-200">
    ...
  </table>
</div>
```

Table header:

```html
<thead class="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
```

Table action column wajib ada pada modul:

* Transaksi
* Kategori
* Metode pembayaran
* Laporan

Isi action column:

* Edit
* Hapus
* Detail jika diperlukan

---

## 9. Modal Rules

Modal digunakan untuk:

* Tambah kategori
* Edit kategori
* Tambah metode pembayaran
* Edit metode pembayaran
* Konfirmasi hapus transaksi
* Konfirmasi hapus kategori
* Konfirmasi hapus metode pembayaran

Modal wrapper:

```html
<div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
```

Modal card:

```html
<div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
```

Modal delete harus memiliki:

* Judul konfirmasi
* Deskripsi data yang akan dihapus
* Tombol batal
* Tombol hapus berwarna rose

---

## 10. Empty State

Gunakan empty state jika data kosong.

```html
<div class="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
  <h3 class="text-base font-semibold text-slate-900">Belum ada data</h3>
  <p class="mt-2 text-sm text-slate-500">Tambahkan data pertama untuk mulai menggunakan aplikasi.</p>
</div>
```

---

## 11. Typography

Heading page:

```html
<h1 class="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
```

Section title:

```html
<h2 class="text-lg font-semibold text-slate-900">
```

Body text:

```html
<p class="text-sm leading-6 text-slate-600">
```

Muted text:

```html
<p class="text-sm text-slate-500">
```

---

## 12. UX Rules untuk Aksi Edit/Hapus

### Edit

* Tombol edit harus jelas terlihat.
* Edit transaksi membuka form edit.
* Edit kategori membuka modal edit.
* Edit metode pembayaran membuka modal edit.
* Edit pengaturan dilakukan langsung di form pengaturan.

### Hapus

* Semua aksi hapus wajib menggunakan modal konfirmasi.
* Tombol hapus harus menggunakan warna rose.
* Data default tidak boleh dihapus.
* Setelah hapus berhasil, tampilkan toast sukses.
* Jika hapus gagal karena data default, tampilkan toast error.

Contoh pesan:

```txt
Transaksi berhasil dihapus.
Kategori berhasil dihapus.
Metode pembayaran berhasil dihapus.
Kategori default tidak dapat dihapus.
Metode pembayaran default tidak dapat dihapus.
```
