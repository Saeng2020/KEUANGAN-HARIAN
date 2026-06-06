(function () {
  "use strict";

  var icons = {
    dashboard:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 13h6V4H4v9Z"/><path d="M14 20h6V4h-6v16Z"/><path d="M4 20h6v-3H4v3Z"/></svg>',
    transactions:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 7h12"/><path d="M6 12h12"/><path d="M6 17h8"/><path d="M4 4h16v16H4z"/></svg>',
    form:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 5v14"/><path d="M5 12h14"/><path d="M4 4h16v16H4z"/></svg>',
    categories:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 5h7v7H4z"/><path d="M13 5h7v7h-7z"/><path d="M4 14h7v5H4z"/><path d="M13 14h7v5h-7z"/></svg>',
    methods:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 7h18v10H3z"/><path d="M3 10h18"/><path d="M7 15h4"/></svg>',
    reports:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 19V5"/><path d="M5 19h14"/><path d="M9 16V9"/><path d="M13 16V7"/><path d="M17 16v-4"/></svg>',
    settings:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/><path d="M19 12a7 7 0 0 0-.08-1l2.08-1.6-2-3.46-2.44.98a7.9 7.9 0 0 0-1.74-1L14.45 3h-4l-.37 2.92a7.9 7.9 0 0 0-1.74 1L5.9 5.94l-2 3.46L6 11a7 7 0 0 0 0 2l-2.1 1.6 2 3.46 2.44-.98c.54.42 1.12.75 1.74 1l.37 2.92h4l.37-2.92c.62-.25 1.2-.58 1.74-1l2.44.98 2-3.46L18.92 13c.05-.33.08-.66.08-1Z"/></svg>',
  };

  var items = [
    {
      id: "dashboard",
      label: "Dashboard",
      shortLabel: "Dashboard",
      eyebrow: "Ringkasan",
      page: "pages/dashboard.html",
      icon: icons.dashboard,
    },
    {
      id: "transactions",
      label: "Transaksi",
      shortLabel: "Transaksi",
      eyebrow: "Daftar harian",
      page: "pages/transactions.html",
      icon: icons.transactions,
    },
    {
      id: "transaction-form",
      label: "Tambah/Edit Transaksi",
      shortLabel: "Tambah",
      eyebrow: "Form transaksi",
      page: "pages/transaction-form.html",
      icon: icons.form,
    },
    {
      id: "categories",
      label: "Kategori",
      shortLabel: "Kategori",
      eyebrow: "Master data",
      page: "pages/categories.html",
      icon: icons.categories,
    },
    {
      id: "payment-methods",
      label: "Metode Pembayaran",
      shortLabel: "Metode",
      eyebrow: "Master data",
      page: "pages/payment-methods.html",
      icon: icons.methods,
    },
    {
      id: "reports",
      label: "Laporan",
      shortLabel: "Laporan",
      eyebrow: "Analisis cashflow",
      page: "pages/reports.html",
      icon: icons.reports,
    },
    {
      id: "settings",
      label: "Pengaturan",
      shortLabel: "Setelan",
      eyebrow: "Preferensi",
      page: "pages/settings.html",
      icon: icons.settings,
    },
  ];

  window.CashflowMenu = {
    items: items,
    find: function (id) {
      return items.find(function (item) {
        return item.id === id;
      });
    },
  };
})();
