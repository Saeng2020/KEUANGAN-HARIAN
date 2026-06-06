(function () {
  "use strict";

  var STORAGE_KEY = "cashflow-harian-state-v1";

  function toInputDate(date) {
    var localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return localDate.toISOString().slice(0, 10);
  }

  function addDays(dateString, offset) {
    var date = new Date(dateString + "T12:00:00");
    date.setDate(date.getDate() + offset);
    return toInputDate(date);
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function buildDefaultState() {
    var today = toInputDate(new Date());

    return {
      categories: [
        { id: "cat-inc-sales", name: "Penjualan", type: "income", default: true },
        { id: "cat-inc-service", name: "Jasa", type: "income", default: true },
        { id: "cat-inc-investment", name: "Investasi", type: "income", default: true },
        { id: "cat-inc-other", name: "Pemasukan Lain", type: "income", default: true },
        { id: "cat-exp-material", name: "Bahan Baku", type: "expense", default: true },
        { id: "cat-exp-operation", name: "Operasional", type: "expense", default: true },
        { id: "cat-exp-transport", name: "Transportasi", type: "expense", default: true },
        { id: "cat-exp-payroll", name: "Gaji", type: "expense", default: true },
        { id: "cat-exp-meal", name: "Makan", type: "expense", default: false },
        { id: "cat-exp-other", name: "Pengeluaran Lain", type: "expense", default: true },
      ],
      paymentMethods: [
        { id: "pay-cash", name: "Cash", label: "CS", active: true, default: true },
        { id: "pay-bank", name: "Transfer Bank", label: "TB", active: true, default: true },
        { id: "pay-qris", name: "QRIS", label: "QR", active: true, default: true },
        { id: "pay-ewallet", name: "E-Wallet", label: "EW", active: true, default: true },
        { id: "pay-debit", name: "Kartu Debit", label: "KD", active: true, default: true },
        { id: "pay-credit", name: "Kartu Kredit", label: "KK", active: false, default: true },
        { id: "pay-marketplace", name: "Saldo Marketplace", label: "MP", active: true, default: false },
      ],
      transactions: [
        {
          id: "trx-1001",
          date: today,
          type: "income",
          categoryId: "cat-inc-sales",
          methodId: "pay-qris",
          amount: 1850000,
          note: "Penjualan toko pagi",
          status: "Selesai",
          createdAt: today + "T09:20:00",
        },
        {
          id: "trx-1002",
          date: today,
          type: "expense",
          categoryId: "cat-exp-material",
          methodId: "pay-bank",
          amount: 520000,
          note: "Belanja bahan baku",
          status: "Selesai",
          createdAt: today + "T10:15:00",
        },
        {
          id: "trx-1003",
          date: today,
          type: "expense",
          categoryId: "cat-exp-transport",
          methodId: "pay-ewallet",
          amount: 85000,
          note: "Ongkir kurir harian",
          status: "Pending",
          createdAt: today + "T13:05:00",
        },
        {
          id: "trx-1004",
          date: addDays(today, -1),
          type: "income",
          categoryId: "cat-inc-service",
          methodId: "pay-bank",
          amount: 1250000,
          note: "Pembayaran proyek desain",
          status: "Selesai",
          createdAt: addDays(today, -1) + "T15:45:00",
        },
        {
          id: "trx-1005",
          date: addDays(today, -1),
          type: "expense",
          categoryId: "cat-exp-operation",
          methodId: "pay-cash",
          amount: 310000,
          note: "Listrik dan perlengkapan toko",
          status: "Selesai",
          createdAt: addDays(today, -1) + "T16:20:00",
        },
        {
          id: "trx-1006",
          date: addDays(today, -2),
          type: "income",
          categoryId: "cat-inc-sales",
          methodId: "pay-marketplace",
          amount: 2150000,
          note: "Pencairan marketplace",
          status: "Selesai",
          createdAt: addDays(today, -2) + "T11:05:00",
        },
        {
          id: "trx-1007",
          date: addDays(today, -3),
          type: "expense",
          categoryId: "cat-exp-payroll",
          methodId: "pay-bank",
          amount: 900000,
          note: "Kasbon staf paruh waktu",
          status: "Selesai",
          createdAt: addDays(today, -3) + "T14:35:00",
        },
        {
          id: "trx-1008",
          date: addDays(today, -4),
          type: "income",
          categoryId: "cat-inc-other",
          methodId: "pay-cash",
          amount: 375000,
          note: "Penjualan aset kecil",
          status: "Selesai",
          createdAt: addDays(today, -4) + "T17:10:00",
        },
        {
          id: "trx-1009",
          date: addDays(today, -5),
          type: "expense",
          categoryId: "cat-exp-meal",
          methodId: "pay-ewallet",
          amount: 145000,
          note: "Konsumsi rapat vendor",
          status: "Selesai",
          createdAt: addDays(today, -5) + "T12:05:00",
        },
        {
          id: "trx-1010",
          date: addDays(today, -6),
          type: "income",
          categoryId: "cat-inc-investment",
          methodId: "pay-bank",
          amount: 600000,
          note: "Dividen reksa dana",
          status: "Selesai",
          createdAt: addDays(today, -6) + "T08:50:00",
        },
      ],
      settings: {
        businessName: "Toko Sinar Rejeki",
        currency: "IDR",
        dateFormat: "dd MMM yyyy",
        monthlyTarget: 15000000,
        theme: "light",
      },
    };
  }

  function readStorage() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  function writeStorage(state) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      return false;
    }

    return true;
  }

  function hydrateState(defaultState) {
    var stored = readStorage();

    if (!stored) {
      return clone(defaultState);
    }

    return {
      categories: Array.isArray(stored.categories) ? stored.categories : clone(defaultState.categories),
      paymentMethods: Array.isArray(stored.paymentMethods) ? stored.paymentMethods : clone(defaultState.paymentMethods),
      transactions: Array.isArray(stored.transactions) ? stored.transactions : clone(defaultState.transactions),
      settings: Object.assign({}, defaultState.settings, stored.settings || {}),
    };
  }

  var defaultState = buildDefaultState();
  var state = hydrateState(defaultState);

  function formatCurrency(amount) {
    var currency = state.settings.currency || "IDR";
    var fractionDigits = currency === "IDR" ? 0 : 2;

    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: currency,
      maximumFractionDigits: fractionDigits,
      minimumFractionDigits: fractionDigits,
    }).format(Number(amount) || 0);
  }

  function formatDate(dateString) {
    if (!dateString) {
      return "-";
    }

    var date = new Date(dateString + "T12:00:00");
    var format = state.settings.dateFormat;

    if (format === "yyyy-mm-dd") {
      return dateString;
    }

    if (format === "dd/mm/yyyy") {
      return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(date);
    }

    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  }

  function today() {
    return toInputDate(new Date());
  }

  function nextId(prefix) {
    return prefix + "-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7);
  }

  function resetSettings() {
    state.settings = clone(defaultState.settings);
    writeStorage(state);
  }

  window.CashflowStore = {
    state: state,
    defaultState: defaultState,
    addDays: addDays,
    formatCurrency: formatCurrency,
    formatDate: formatDate,
    nextId: nextId,
    resetSettings: resetSettings,
    save: function () {
      return writeStorage(state);
    },
    today: today,
  };
})();
