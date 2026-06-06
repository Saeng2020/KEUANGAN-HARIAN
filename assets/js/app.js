(function () {
  "use strict";

  var Store = window.CashflowStore;
  var Menu = window.CashflowMenu;
  var appContent = null;
  var modalRoot = null;
  var toastRoot = null;
  var currentRoute = { id: "dashboard", params: new URLSearchParams() };
  var pendingDelete = null;
  var confirmCallback = null;
  var routeRequest = 0;

  var filters = {
    transactions: { search: "", type: "all" },
    categories: { type: "all" },
    reports: { start: Store.addDays(Store.today(), -6), end: Store.today() },
  };

  document.addEventListener("DOMContentLoaded", init);

  async function init() {
    appContent = document.getElementById("app-content");
    modalRoot = document.getElementById("modal-root");
    toastRoot = document.getElementById("toast-root");

    await loadComponents();
    bindEvents();

    if (!window.location.hash) {
      window.history.replaceState(null, "", "#dashboard");
    }

    await loadRoute();
    window.addEventListener("hashchange", loadRoute);
  }

  async function loadComponents() {
    var components = [
      { target: "sidebar", path: "components/sidebar.html" },
      { target: "topbar", path: "components/topbar.html" },
      { target: "mobile-nav", path: "components/mobile-nav.html" },
    ];

    try {
      var htmlParts = await Promise.all(
        components.map(function (component) {
          return fetch(component.path).then(function (response) {
            if (!response.ok) {
              throw new Error("Gagal memuat " + component.path);
            }
            return response.text();
          });
        })
      );

      components.forEach(function (component, index) {
        var target = document.getElementById(component.target);
        if (target) {
          target.innerHTML = htmlParts[index];
        }
      });

      setActiveMenu("dashboard");
      updateShellStats();
    } catch (error) {
      if (appContent) {
        appContent.innerHTML = errorState(
          "Komponen gagal dimuat",
          "Jalankan aplikasi melalui server statis agar fetch() dapat memuat komponen dan halaman."
        );
      }
    }
  }

  function bindEvents() {
    document.addEventListener("click", handleClick);
    document.addEventListener("submit", handleSubmit);
    document.addEventListener("input", handleInput);
    document.addEventListener("change", handleChange);
  }

  async function loadRoute() {
    var requestId = ++routeRequest;
    var route = parseRoute();
    var item = Menu.find(route.id) || Menu.find("dashboard");

    currentRoute = { id: item.id, params: route.params };
    setActiveMenu(item.id);
    updateTopbar(item);
    renderLoading();

    try {
      var response = await fetch(item.page);
      if (!response.ok) {
        throw new Error("Gagal memuat halaman " + item.page);
      }

      var html = await response.text();
      if (requestId !== routeRequest) {
        return;
      }

      appContent.innerHTML = html;
      appContent.focus({ preventScroll: true });
      runPageRenderer(item.id, route.params);
    } catch (error) {
      appContent.innerHTML = errorState(
        "Halaman gagal dimuat",
        "Pastikan aplikasi dijalankan melalui server statis, bukan langsung dari file system."
      );
    }
  }

  function parseRoute() {
    var raw = window.location.hash.replace(/^#/, "") || "dashboard";
    var splitIndex = raw.indexOf("?");
    var id = splitIndex >= 0 ? raw.slice(0, splitIndex) : raw;
    var query = splitIndex >= 0 ? raw.slice(splitIndex + 1) : "";

    return {
      id: id || "dashboard",
      params: new URLSearchParams(query),
    };
  }

  function navigateTo(id, params) {
    var item = Menu.find(id) || Menu.find("dashboard");
    var query = params ? new URLSearchParams(params).toString() : "";
    var nextHash = "#" + item.id + (query ? "?" + query : "");

    if (window.location.hash === nextHash) {
      loadRoute();
      return;
    }

    window.location.hash = nextHash;
  }

  function runPageRenderer(id, params) {
    var renderers = {
      dashboard: renderDashboard,
      transactions: renderTransactions,
      "transaction-form": renderTransactionForm,
      categories: renderCategories,
      "payment-methods": renderPaymentMethods,
      reports: renderReports,
      settings: renderSettings,
    };

    if (renderers[id]) {
      renderers[id](params || new URLSearchParams());
    }
  }

  function refreshCurrentRoute() {
    runPageRenderer(currentRoute.id, currentRoute.params);
    updateShellStats();
  }

  function setActiveMenu(page) {
    renderNavigation(page);
  }

  function formatCurrency(amount) {
    return Store.formatCurrency(amount);
  }

  function formatDate(date) {
    return Store.formatDate(date);
  }

  function renderNavigation(activeId) {
    var sidebarMenu = document.getElementById("sidebar-menu");
    var mobileMenu = document.getElementById("mobile-menu");

    if (sidebarMenu) {
      sidebarMenu.innerHTML = Menu.items
        .map(function (item) {
          var active = item.id === activeId;
          var classes = active
            ? "border-emerald-100 bg-emerald-50 text-emerald-700"
            : "border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-950";

          return (
            '<a href="#' +
            item.id +
            '" class="flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-semibold transition ' +
            classes +
            '">' +
            iconMarkup(item.icon, "h-5 w-5 shrink-0") +
            '<span class="truncate">' +
            escapeHtml(item.label) +
            "</span></a>"
          );
        })
        .join("");
    }

    if (mobileMenu) {
      mobileMenu.innerHTML = Menu.items
        .map(function (item) {
          var active = item.id === activeId;
          var classes = active ? "bg-emerald-50 text-emerald-700" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900";

          return (
            '<a href="#' +
            item.id +
            '" class="flex min-w-[4.75rem] flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-[11px] font-semibold transition ' +
            classes +
            '">' +
            iconMarkup(item.icon, "h-5 w-5") +
            '<span class="max-w-full truncate">' +
            escapeHtml(item.shortLabel) +
            "</span></a>"
          );
        })
        .join("");
    }
  }

  function updateTopbar(item) {
    var title = document.getElementById("page-title");
    var eyebrow = document.getElementById("page-eyebrow");

    if (title) {
      title.textContent = item.label;
    }

    if (eyebrow) {
      eyebrow.textContent = item.eyebrow;
    }

    document.title = item.label + " - Cashflow Harian";
  }

  function updateShellStats() {
    var target = document.getElementById("sidebar-balance");
    if (!target) {
      return;
    }

      target.textContent = formatCurrency(summarizeTransactions(Store.state.transactions).balance);
  }

  function renderLoading() {
    if (!appContent) {
      return;
    }

    appContent.innerHTML =
      '<div class="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">' +
      '<p class="text-sm font-semibold text-emerald-700">Memuat halaman...</p>' +
      "</div>";
  }

  function handleClick(event) {
    var navTarget = event.target.closest("[data-nav-target]");
    if (navTarget) {
      event.preventDefault();
      navigateTo(navTarget.dataset.navTarget);
      return;
    }

    var actionTarget = event.target.closest("[data-action]");
    if (!actionTarget) {
      return;
    }

    var action = actionTarget.dataset.action;
    var id = actionTarget.dataset.id;

    if (action !== "report-export") {
      event.preventDefault();
    }

    if (action === "transaction-detail") {
      openTransactionDetail(id);
    } else if (action === "transaction-edit") {
      closeModal();
      navigateTo("transaction-form", { mode: "edit", id: id });
    } else if (action === "transaction-delete") {
      openDeleteModal("transaction", id);
    } else if (action === "category-add") {
      openCategoryModal();
    } else if (action === "category-edit") {
      openCategoryModal(id);
    } else if (action === "category-delete") {
      openDeleteModal("category", id);
    } else if (action === "method-add") {
      openMethodModal();
    } else if (action === "method-edit") {
      openMethodModal(id);
    } else if (action === "method-delete") {
      openDeleteModal("method", id);
    } else if (action === "method-toggle") {
      togglePaymentMethod(id);
    } else if (action === "delete-confirm") {
      confirmDelete();
    } else if (action === "confirm-callback") {
      if (typeof confirmCallback === "function") {
        confirmCallback();
      }
    } else if (action === "modal-close") {
      closeModal();
    } else if (action === "report-reset") {
      resetReportFilters();
    } else if (action === "report-export") {
      exportReportVisual();
    } else if (action === "settings-reset") {
      resetSettings();
    }
  }

  function handleSubmit(event) {
    if (event.target.id === "transaction-form") {
      saveTransaction(event);
    } else if (event.target.id === "category-form") {
      saveCategory(event);
    } else if (event.target.id === "method-form") {
      savePaymentMethod(event);
    } else if (event.target.id === "report-filter-form") {
      applyReportFilters(event);
    } else if (event.target.id === "settings-form") {
      saveSettings(event);
    }
  }

  function handleInput(event) {
    if (event.target.id === "transactions-search") {
      filters.transactions.search = event.target.value.trim().toLowerCase();
      renderTransactionsList();
    }
  }

  function handleChange(event) {
    if (event.target.id === "transactions-type-filter") {
      filters.transactions.type = event.target.value;
      renderTransactionsList();
    } else if (event.target.id === "transaction-type") {
      renderTransactionCategoryOptions(event.target.value, "");
    } else if (event.target.id === "categories-type-filter") {
      filters.categories.type = event.target.value;
      renderCategoriesList();
    }
  }

  function renderDashboard() {
    var allTransactions = Store.state.transactions;
    var today = Store.today();
    var todaySummary = summarizeTransactions(
      allTransactions.filter(function (transaction) {
        return transaction.date === today;
      })
    );
    var totalSummary = summarizeTransactions(allTransactions);
    var profitTone = todaySummary.balance >= 0 ? "emerald" : "rose";
    var summaryCards = [
      {
        label: "Total saldo",
        value: Store.formatCurrency(totalSummary.balance),
        caption: "Akumulasi seluruh transaksi",
        tone: totalSummary.balance >= 0 ? "emerald" : "rose",
      },
      {
        label: "Pemasukan hari ini",
        value: Store.formatCurrency(todaySummary.income),
        caption: "Total transaksi masuk",
        tone: "emerald",
      },
      {
        label: "Pengeluaran hari ini",
        value: Store.formatCurrency(todaySummary.expense),
        caption: "Total transaksi keluar",
        tone: "rose",
      },
      {
        label: "Laba/rugi harian",
        value: Store.formatCurrency(todaySummary.balance),
        caption: profitTone === "emerald" ? "Cashflow positif" : "Cashflow negatif",
        tone: profitTone,
      },
    ];

    var summaryContainer = document.getElementById("dashboard-summary");
    if (summaryContainer) {
      summaryContainer.innerHTML = summaryCards.map(renderSummaryCard).join("");
    }

    var dates = getDateRange(Store.addDays(today, -6), today);
    renderCashflowChart(document.getElementById("dashboard-chart"), allTransactions, dates);
    renderRecentTransactions();
  }

  function renderTransactions() {
    var search = document.getElementById("transactions-search");
    var typeFilter = document.getElementById("transactions-type-filter");

    if (search) {
      search.value = filters.transactions.search;
    }

    if (typeFilter) {
      typeFilter.value = filters.transactions.type;
    }

    renderTransactionsList();
  }

  function renderTransactionsList() {
    var list = getFilteredTransactions();
    var count = document.getElementById("transactions-count");
    var empty = document.getElementById("transactions-empty");
    var table = document.getElementById("transactions-table");
    var cards = document.getElementById("transactions-cards");

    if (count) {
      count.textContent = list.length + " transaksi ditampilkan dari " + Store.state.transactions.length + " data.";
    }

    if (!table || !cards || !empty) {
      return;
    }

    if (!list.length) {
      empty.innerHTML = emptyState("Belum ada transaksi", "Ubah filter atau tambahkan transaksi pertama.");
      table.innerHTML = "";
      cards.innerHTML = "";
      return;
    }

    empty.innerHTML = "";
    table.innerHTML = renderTransactionsTable(list, false);
    cards.innerHTML = list.map(renderTransactionCard).join("");
  }

  function renderTransactionForm(params) {
    var mode = params.get("mode");
    var id = params.get("id");
    var transaction = mode === "edit" ? getTransaction(id) : null;
    var isEdit = Boolean(transaction);
    var heading = document.getElementById("transaction-form-heading");
    var form = document.getElementById("transaction-form");

    if (!form) {
      return;
    }

    if (heading) {
      heading.textContent = isEdit ? "Edit Transaksi" : "Tambah Transaksi";
    }

    document.getElementById("transaction-id").value = isEdit ? transaction.id : "";
    document.getElementById("transaction-type").value = isEdit ? transaction.type : "income";
    document.getElementById("transaction-amount").value = isEdit ? transaction.amount : "";
    document.getElementById("transaction-date").value = isEdit ? transaction.date : Store.today();
    document.getElementById("transaction-status").value = isEdit ? transaction.status : "Selesai";
    document.getElementById("transaction-note").value = isEdit ? transaction.note : "";

    renderTransactionCategoryOptions(isEdit ? transaction.type : "income", isEdit ? transaction.categoryId : "");
    renderPaymentOptions(isEdit ? transaction.methodId : "");
  }

  function renderCategories() {
    var filter = document.getElementById("categories-type-filter");
    if (filter) {
      filter.value = filters.categories.type;
    }

    renderCategoriesList();
  }

  function renderCategoriesList() {
    var list = Store.state.categories.filter(function (category) {
      return filters.categories.type === "all" || category.type === filters.categories.type;
    });
    var count = document.getElementById("categories-count");
    var empty = document.getElementById("categories-empty");
    var table = document.getElementById("categories-table");
    var cards = document.getElementById("categories-cards");

    if (count) {
      count.textContent = list.length + " kategori ditampilkan.";
    }

    if (!empty || !table || !cards) {
      return;
    }

    if (!list.length) {
      empty.innerHTML = emptyState("Belum ada kategori", "Tambahkan kategori pertama untuk mulai mengelompokkan transaksi.");
      table.innerHTML = "";
      cards.innerHTML = "";
      return;
    }

    empty.innerHTML = "";
    table.innerHTML = renderCategoriesTable(list);
    cards.innerHTML = list.map(renderCategoryCard).join("");
  }

  function renderPaymentMethods() {
    var list = Store.state.paymentMethods;
    var count = document.getElementById("payment-methods-count");
    var empty = document.getElementById("payment-methods-empty");
    var table = document.getElementById("payment-methods-table");
    var cards = document.getElementById("payment-methods-cards");

    if (count) {
      count.textContent = list.length + " metode pembayaran tersedia.";
    }

    if (!empty || !table || !cards) {
      return;
    }

    if (!list.length) {
      empty.innerHTML = emptyState("Belum ada metode pembayaran", "Tambahkan metode pembayaran pertama untuk mencatat transaksi.");
      table.innerHTML = "";
      cards.innerHTML = "";
      return;
    }

    empty.innerHTML = "";
    table.innerHTML = renderPaymentMethodsTable(list);
    cards.innerHTML = list.map(renderPaymentMethodCard).join("");
  }

  function renderReports() {
    var startInput = document.getElementById("report-start-date");
    var endInput = document.getElementById("report-end-date");

    if (startInput) {
      startInput.value = filters.reports.start;
    }

    if (endInput) {
      endInput.value = filters.reports.end;
    }

    renderReportsContent();
  }

  function renderReportsContent() {
    var list = getReportTransactions();
    var summary = summarizeTransactions(list);
    var summaryContainer = document.getElementById("reports-summary");
    var rangeLabel = document.getElementById("reports-range-label");
    var empty = document.getElementById("reports-empty");
    var table = document.getElementById("reports-table");
    var cards = document.getElementById("reports-cards");

    if (summaryContainer) {
      summaryContainer.innerHTML = [
        {
          label: "Total pemasukan",
          value: Store.formatCurrency(summary.income),
          caption: list.length + " transaksi dalam rentang",
          tone: "emerald",
        },
        {
          label: "Total pengeluaran",
          value: Store.formatCurrency(summary.expense),
          caption: "Biaya dan pembayaran keluar",
          tone: "rose",
        },
        {
          label: "Selisih cashflow",
          value: Store.formatCurrency(summary.balance),
          caption: summary.balance >= 0 ? "Surplus periode" : "Defisit periode",
          tone: summary.balance >= 0 ? "emerald" : "rose",
        },
      ]
        .map(renderSummaryCard)
        .join("");
    }

    if (rangeLabel) {
      rangeLabel.textContent = Store.formatDate(filters.reports.start) + " - " + Store.formatDate(filters.reports.end);
    }

    renderCashflowChart(document.getElementById("reports-chart"), list, getDateRange(filters.reports.start, filters.reports.end));

    if (!empty || !table || !cards) {
      return;
    }

    if (!list.length) {
      empty.innerHTML = emptyState("Belum ada data laporan", "Tidak ada transaksi pada rentang tanggal yang dipilih.");
      table.innerHTML = "";
      cards.innerHTML = "";
      return;
    }

    empty.innerHTML = "";
    table.innerHTML = renderTransactionsTable(list, true);
    cards.innerHTML = list.map(renderTransactionCard).join("");
  }

  function renderSettings() {
    var settings = Store.state.settings;
    document.getElementById("settings-business-name").value = settings.businessName || "";
    document.getElementById("settings-currency").value = settings.currency || "IDR";
    document.getElementById("settings-date-format").value = settings.dateFormat || "dd MMM yyyy";
    document.getElementById("settings-monthly-target").value = settings.monthlyTarget || "";
    document.getElementById("settings-theme").value = settings.theme || "light";
  }

  function renderSummaryCard(card) {
    var toneMap = {
      emerald: {
        badge: "bg-emerald-50 text-emerald-700",
        value: "text-emerald-700",
      },
      rose: {
        badge: "bg-rose-50 text-rose-700",
        value: "text-rose-700",
      },
      sky: {
        badge: "bg-sky-50 text-sky-700",
        value: "text-sky-700",
      },
    };
    var tone = toneMap[card.tone] || toneMap.sky;

    return (
      '<div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-200 hover:shadow-md">' +
      '<div class="flex items-start justify-between gap-3">' +
      '<p class="text-sm font-medium text-slate-500">' +
      escapeHtml(card.label) +
      "</p>" +
      '<span class="rounded-full px-3 py-1 text-xs font-medium ' +
      tone.badge +
      '">Live</span></div>' +
      '<p class="mt-4 break-words text-2xl font-bold tracking-tight ' +
      tone.value +
      '">' +
      escapeHtml(card.value) +
      "</p>" +
      '<p class="mt-2 text-sm text-slate-500">' +
      escapeHtml(card.caption) +
      "</p></div>"
    );
  }

  function renderCashflowChart(container, transactions, dates) {
    if (!container) {
      return;
    }

    var rows = dates.map(function (date) {
      var daily = transactions.filter(function (transaction) {
        return transaction.date === date;
      });
      var summary = summarizeTransactions(daily);
      return {
        date: date,
        income: summary.income,
        expense: summary.expense,
      };
    });
    var maxValue = Math.max.apply(
      null,
      rows
        .map(function (row) {
          return [row.income, row.expense];
        })
        .reduce(function (all, pair) {
          return all.concat(pair);
        }, [])
        .concat([1])
    );

    container.innerHTML =
      '<div class="thin-scrollbar overflow-x-auto">' +
      '<div class="flex min-w-[620px] items-end gap-4 rounded-2xl bg-slate-50 px-4 pb-4 pt-6">' +
      rows
        .map(function (row) {
          var incomeHeight = Math.max(10, Math.round((row.income / maxValue) * 150));
          var expenseHeight = Math.max(10, Math.round((row.expense / maxValue) * 150));

          return (
            '<div class="flex flex-1 flex-col items-center gap-3">' +
            '<div class="flex h-40 items-end gap-1.5">' +
            '<div class="chart-column w-3 rounded-t-md bg-emerald-500" title="Pemasukan ' +
            escapeAttr(Store.formatCurrency(row.income)) +
            '" style="height:' +
            incomeHeight +
            'px"></div>' +
            '<div class="chart-column w-3 rounded-t-md bg-rose-500" title="Pengeluaran ' +
            escapeAttr(Store.formatCurrency(row.expense)) +
            '" style="height:' +
            expenseHeight +
            'px"></div></div>' +
            '<div class="text-center"><p class="text-xs font-semibold text-slate-700">' +
            escapeHtml(shortDate(row.date)) +
            '</p><p class="mt-1 text-[11px] text-slate-400">' +
            escapeHtml(compactAmount(row.income - row.expense)) +
            "</p></div></div>"
          );
        })
        .join("") +
      "</div></div>" +
      '<div class="mt-4 flex flex-wrap gap-3 text-xs font-medium text-slate-500">' +
      '<span class="inline-flex items-center gap-2"><span class="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>Pemasukan</span>' +
      '<span class="inline-flex items-center gap-2"><span class="h-2.5 w-2.5 rounded-full bg-rose-500"></span>Pengeluaran</span>' +
      "</div>";
  }

  function renderRecentTransactions() {
    var container = document.getElementById("dashboard-recent");
    if (!container) {
      return;
    }

    var recent = sortTransactions(Store.state.transactions).slice(0, 5);

    if (!recent.length) {
      container.innerHTML = emptyState("Belum ada transaksi", "Tambahkan transaksi pertama untuk melihat aktivitas terbaru.");
      return;
    }

    container.innerHTML = recent
      .map(function (transaction) {
        var amountClass = transaction.type === "income" ? "text-emerald-700" : "text-rose-700";

        return (
          '<button data-action="transaction-detail" data-id="' +
          escapeAttr(transaction.id) +
          '" class="w-full rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:border-emerald-200 hover:shadow-sm">' +
          '<div class="flex items-start justify-between gap-3">' +
          '<div class="min-w-0"><p class="truncate text-sm font-semibold text-slate-900">' +
          escapeHtml(transaction.note || getCategoryName(transaction.categoryId)) +
          '</p><p class="mt-1 text-xs text-slate-500">' +
          escapeHtml(Store.formatDate(transaction.date)) +
          " - " +
          escapeHtml(getMethodName(transaction.methodId)) +
          "</p></div>" +
          '<p class="shrink-0 text-sm font-bold ' +
          amountClass +
          '">' +
          escapeHtml(transaction.type === "income" ? "+" : "-") +
          escapeHtml(Store.formatCurrency(transaction.amount)) +
          "</p></div></button>"
        );
      })
      .join("");
  }

  function renderTransactionsTable(list, isReport) {
    return (
      '<div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">' +
      '<div class="thin-scrollbar overflow-x-auto"><table class="min-w-full divide-y divide-slate-200">' +
      '<thead class="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr>' +
      '<th class="px-4 py-3 text-left font-semibold">Tanggal</th>' +
      '<th class="px-4 py-3 text-left font-semibold">Tipe</th>' +
      '<th class="px-4 py-3 text-left font-semibold">Kategori</th>' +
      '<th class="px-4 py-3 text-left font-semibold">Metode Pembayaran</th>' +
      '<th class="px-4 py-3 text-right font-semibold">Nominal</th>' +
      '<th class="px-4 py-3 text-left font-semibold">Catatan</th>' +
      '<th class="px-4 py-3 text-left font-semibold">Status</th>' +
      '<th class="px-4 py-3 text-right font-semibold">Aksi</th>' +
      "</tr></thead>" +
      '<tbody class="divide-y divide-slate-100 bg-white">' +
      list
        .map(function (transaction) {
          return renderTransactionRow(transaction, isReport);
        })
        .join("") +
      "</tbody></table></div></div>"
    );
  }

  function renderTransactionRow(transaction, isReport) {
    var amountClass = transaction.type === "income" ? "text-emerald-700" : "text-rose-700";

    return (
      '<tr class="text-sm text-slate-600">' +
      '<td class="whitespace-nowrap px-4 py-4 font-medium text-slate-900">' +
      escapeHtml(Store.formatDate(transaction.date)) +
      "</td>" +
      '<td class="px-4 py-4">' +
      typeBadge(transaction.type) +
      "</td>" +
      '<td class="px-4 py-4">' +
      escapeHtml(getCategoryName(transaction.categoryId)) +
      "</td>" +
      '<td class="px-4 py-4">' +
      escapeHtml(getMethodName(transaction.methodId)) +
      "</td>" +
      '<td class="whitespace-nowrap px-4 py-4 text-right font-bold ' +
      amountClass +
      '">' +
      escapeHtml(transaction.type === "income" ? "+" : "-") +
      escapeHtml(Store.formatCurrency(transaction.amount)) +
      "</td>" +
      '<td class="max-w-xs px-4 py-4"><span class="line-clamp-2">' +
      escapeHtml(transaction.note || "-") +
      "</span></td>" +
      '<td class="px-4 py-4">' +
      statusBadge(transaction.status) +
      "</td>" +
      '<td class="px-4 py-4 text-right">' +
      transactionActions(transaction.id, isReport) +
      "</td></tr>"
    );
  }

  function renderTransactionCard(transaction) {
    var amountClass = transaction.type === "income" ? "text-emerald-700" : "text-rose-700";

    return (
      '<article class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">' +
      '<div class="flex items-start justify-between gap-3">' +
      '<div class="min-w-0">' +
      '<p class="truncate text-sm font-semibold text-slate-900">' +
      escapeHtml(transaction.note || getCategoryName(transaction.categoryId)) +
      "</p>" +
      '<p class="mt-1 text-xs text-slate-500">' +
      escapeHtml(Store.formatDate(transaction.date)) +
      " - " +
      escapeHtml(getMethodName(transaction.methodId)) +
      "</p></div>" +
      '<p class="shrink-0 text-sm font-bold ' +
      amountClass +
      '">' +
      escapeHtml(transaction.type === "income" ? "+" : "-") +
      escapeHtml(Store.formatCurrency(transaction.amount)) +
      "</p></div>" +
      '<div class="mt-3 flex flex-wrap gap-2">' +
      typeBadge(transaction.type) +
      statusBadge(transaction.status) +
      '<span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">' +
      escapeHtml(getCategoryName(transaction.categoryId)) +
      "</span></div>" +
      '<div class="mt-4 flex flex-wrap justify-end gap-2">' +
      transactionActions(transaction.id, true) +
      "</div></article>"
    );
  }

  function transactionActions(id, includeDetail) {
    return (
      '<div class="inline-flex flex-wrap justify-end gap-2">' +
      (includeDetail
        ? '<button data-action="transaction-detail" data-id="' +
          escapeAttr(id) +
          '" class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">Detail</button>'
        : "") +
      '<button data-action="transaction-edit" data-id="' +
      escapeAttr(id) +
      '" class="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-700 hover:bg-sky-100">Edit</button>' +
      '<button data-action="transaction-delete" data-id="' +
      escapeAttr(id) +
      '" class="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100">Hapus</button>' +
      "</div>"
    );
  }

  function renderCategoriesTable(list) {
    return (
      '<div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">' +
      '<div class="thin-scrollbar overflow-x-auto"><table class="min-w-full divide-y divide-slate-200">' +
      '<thead class="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr>' +
      '<th class="px-4 py-3 text-left font-semibold">Nama Kategori</th>' +
      '<th class="px-4 py-3 text-left font-semibold">Tipe</th>' +
      '<th class="px-4 py-3 text-left font-semibold">Status</th>' +
      '<th class="px-4 py-3 text-right font-semibold">Transaksi Terkait</th>' +
      '<th class="px-4 py-3 text-right font-semibold">Aksi</th>' +
      "</tr></thead>" +
      '<tbody class="divide-y divide-slate-100 bg-white">' +
      list.map(renderCategoryRow).join("") +
      "</tbody></table></div></div>"
    );
  }

  function renderCategoryRow(category) {
    return (
      '<tr class="text-sm text-slate-600">' +
      '<td class="px-4 py-4 font-semibold text-slate-900">' +
      escapeHtml(category.name) +
      "</td>" +
      '<td class="px-4 py-4">' +
      typeBadge(category.type) +
      "</td>" +
      '<td class="px-4 py-4">' +
      defaultBadge(category.default) +
      "</td>" +
      '<td class="px-4 py-4 text-right font-medium text-slate-900">' +
      categoryTransactionCount(category.id) +
      "</td>" +
      '<td class="px-4 py-4 text-right">' +
      categoryActions(category) +
      "</td></tr>"
    );
  }

  function renderCategoryCard(category) {
    return (
      '<article class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">' +
      '<div class="flex items-start justify-between gap-3">' +
      '<div><p class="text-sm font-semibold text-slate-900">' +
      escapeHtml(category.name) +
      '</p><p class="mt-1 text-xs text-slate-500">' +
      categoryTransactionCount(category.id) +
      " transaksi terkait</p></div>" +
      defaultBadge(category.default) +
      "</div>" +
      '<div class="mt-3">' +
      typeBadge(category.type) +
      "</div>" +
      '<div class="mt-4 flex flex-wrap justify-end gap-2">' +
      categoryActions(category) +
      "</div></article>"
    );
  }

  function categoryActions(category) {
    var editButton = category.default
      ? '<button disabled class="cursor-not-allowed rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-400">Edit</button>'
      : '<button data-action="category-edit" data-id="' +
        escapeAttr(category.id) +
        '" class="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-700 hover:bg-sky-100">Edit</button>';

    return (
      '<div class="inline-flex flex-wrap justify-end gap-2">' +
      editButton +
      '<button data-action="category-delete" data-id="' +
      escapeAttr(category.id) +
      '" class="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100">Hapus</button>' +
      "</div>"
    );
  }

  function renderPaymentMethodsTable(list) {
    return (
      '<div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">' +
      '<div class="thin-scrollbar overflow-x-auto"><table class="min-w-full divide-y divide-slate-200">' +
      '<thead class="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr>' +
      '<th class="px-4 py-3 text-left font-semibold">Nama Metode</th>' +
      '<th class="px-4 py-3 text-left font-semibold">Ikon/Label</th>' +
      '<th class="px-4 py-3 text-left font-semibold">Status</th>' +
      '<th class="px-4 py-3 text-left font-semibold">Tipe</th>' +
      '<th class="px-4 py-3 text-right font-semibold">Transaksi Terkait</th>' +
      '<th class="px-4 py-3 text-right font-semibold">Aksi</th>' +
      "</tr></thead>" +
      '<tbody class="divide-y divide-slate-100 bg-white">' +
      list.map(renderPaymentMethodRow).join("") +
      "</tbody></table></div></div>"
    );
  }

  function renderPaymentMethodRow(method) {
    return (
      '<tr class="text-sm text-slate-600">' +
      '<td class="px-4 py-4 font-semibold text-slate-900">' +
      escapeHtml(method.name) +
      "</td>" +
      '<td class="px-4 py-4">' +
      methodLabel(method) +
      "</td>" +
      '<td class="px-4 py-4">' +
      activeBadge(method.active) +
      "</td>" +
      '<td class="px-4 py-4">' +
      defaultBadge(method.default) +
      "</td>" +
      '<td class="px-4 py-4 text-right font-medium text-slate-900">' +
      paymentMethodTransactionCount(method.id) +
      "</td>" +
      '<td class="px-4 py-4 text-right">' +
      paymentMethodActions(method) +
      "</td></tr>"
    );
  }

  function renderPaymentMethodCard(method) {
    return (
      '<article class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">' +
      '<div class="flex items-start justify-between gap-3">' +
      '<div class="flex min-w-0 items-center gap-3">' +
      methodLabel(method) +
      '<div class="min-w-0"><p class="truncate text-sm font-semibold text-slate-900">' +
      escapeHtml(method.name) +
      '</p><p class="mt-1 text-xs text-slate-500">' +
      paymentMethodTransactionCount(method.id) +
      " transaksi terkait</p></div></div>" +
      activeBadge(method.active) +
      "</div>" +
      '<div class="mt-3">' +
      defaultBadge(method.default) +
      "</div>" +
      '<div class="mt-4 flex flex-wrap justify-end gap-2">' +
      paymentMethodActions(method) +
      "</div></article>"
    );
  }

  function paymentMethodActions(method) {
    var editButton = method.default
      ? '<button disabled class="cursor-not-allowed rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-400">Edit</button>'
      : '<button data-action="method-edit" data-id="' +
        escapeAttr(method.id) +
        '" class="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-700 hover:bg-sky-100">Edit</button>';
    var toggleText = method.active ? "Nonaktifkan" : "Aktifkan";

    return (
      '<div class="inline-flex flex-wrap justify-end gap-2">' +
      '<button data-action="method-toggle" data-id="' +
      escapeAttr(method.id) +
      '" class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">' +
      toggleText +
      "</button>" +
      editButton +
      '<button data-action="method-delete" data-id="' +
      escapeAttr(method.id) +
      '" class="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100">Hapus</button>' +
      "</div>"
    );
  }

  function renderTransactionCategoryOptions(type, selectedId) {
    var select = document.getElementById("transaction-category");
    if (!select) {
      return;
    }

    var options = Store.state.categories
      .filter(function (category) {
        return category.type === type;
      })
      .map(function (category) {
        return '<option value="' + escapeAttr(category.id) + '">' + escapeHtml(category.name) + "</option>";
      })
      .join("");

    select.innerHTML = '<option value="">Pilih kategori</option>' + options;
    select.value = selectedId || "";
  }

  function renderPaymentOptions(selectedId) {
    var select = document.getElementById("transaction-method");
    if (!select) {
      return;
    }

    var options = Store.state.paymentMethods
      .filter(function (method) {
        return method.active || method.id === selectedId;
      })
      .map(function (method) {
        return '<option value="' + escapeAttr(method.id) + '">' + escapeHtml(method.name) + "</option>";
      })
      .join("");

    select.innerHTML = '<option value="">Pilih metode pembayaran</option>' + options;
    select.value = selectedId || "";
  }

  function saveTransaction(event) {
    event.preventDefault();

    var id = document.getElementById("transaction-id").value;
    var type = document.getElementById("transaction-type").value;
    var amount = Number(document.getElementById("transaction-amount").value);
    var categoryId = document.getElementById("transaction-category").value;
    var methodId = document.getElementById("transaction-method").value;
    var date = document.getElementById("transaction-date").value;
    var status = document.getElementById("transaction-status").value;
    var note = document.getElementById("transaction-note").value.trim();
    var errors = [];

    if (!amount || amount <= 0) {
      errors.push("Nominal wajib diisi dengan angka lebih dari 0.");
    }
    if (!date) {
      errors.push("Tanggal wajib diisi.");
    }
    if (!categoryId) {
      errors.push("Kategori wajib dipilih.");
    }
    if (!methodId) {
      errors.push("Metode pembayaran wajib dipilih.");
    }

    if (errors.length) {
      showFormErrors("transaction-form-errors", errors);
      return;
    }

    var payload = {
      date: date,
      type: type,
      categoryId: categoryId,
      methodId: methodId,
      amount: amount,
      note: note,
      status: status,
    };

    if (id) {
      var existing = getTransaction(id);
      if (existing) {
        Object.assign(existing, payload);
        showToast("Transaksi berhasil diperbarui.", "success");
      }
    } else {
      Store.state.transactions.push(
        Object.assign({}, payload, {
          id: Store.nextId("trx"),
          createdAt: new Date().toISOString(),
        })
      );
      showToast("Transaksi berhasil disimpan.", "success");
    }

    Store.save();
    updateShellStats();
    navigateTo("transactions");
  }

  function openCategoryModal(id) {
    var category = id ? getCategory(id) : null;
    if (category && category.default) {
      showToast("Kategori default tidak dapat diedit.", "error");
      return;
    }

    openModal(
      '<form id="category-form" data-id="' +
        escapeAttr(id || "") +
        '">' +
        '<div class="flex items-start justify-between gap-4">' +
        '<div><h3 class="text-lg font-semibold text-slate-900">' +
        (category ? "Edit Kategori" : "Tambah Kategori") +
        '</h3><p class="mt-1 text-sm text-slate-500">Atur kategori pemasukan atau pengeluaran.</p></div>' +
        '<button type="button" data-action="modal-close" class="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-900">X</button>' +
        "</div>" +
        '<div id="category-form-errors" class="mt-4 hidden rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700"></div>' +
        '<label class="mt-5 block"><span class="text-sm font-semibold text-slate-700">Nama kategori</span>' +
        '<input id="category-name" class="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-50" type="text" value="' +
        escapeAttr(category ? category.name : "") +
        '" placeholder="Contoh: Bonus Klien" /></label>' +
        '<label class="mt-4 block"><span class="text-sm font-semibold text-slate-700">Tipe kategori</span>' +
        '<select id="category-type" class="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-50">' +
        '<option value="income"' +
        (category && category.type === "income" ? " selected" : "") +
        ">Pemasukan</option>" +
        '<option value="expense"' +
        (category && category.type === "expense" ? " selected" : "") +
        ">Pengeluaran</option>" +
        "</select></label>" +
        '<div class="mt-6 flex justify-end gap-3">' +
        '<button type="button" data-action="modal-close" class="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Batal</button>' +
        '<button type="submit" class="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700">Simpan</button>' +
        "</div></form>"
    );
  }

  function saveCategory(event) {
    event.preventDefault();

    var id = event.target.dataset.id;
    var name = document.getElementById("category-name").value.trim();
    var type = document.getElementById("category-type").value;
    var errors = [];

    if (!name) {
      errors.push("Nama kategori wajib diisi.");
    }

    if (errors.length) {
      showFormErrors("category-form-errors", errors);
      return;
    }

    if (id) {
      var category = getCategory(id);
      if (!category || category.default) {
        showToast("Kategori default tidak dapat diedit.", "error");
        return;
      }
      category.name = name;
      category.type = type;
      showToast("Kategori berhasil diperbarui.", "success");
    } else {
      Store.state.categories.push({
        id: Store.nextId("cat"),
        name: name,
        type: type,
        default: false,
      });
      showToast("Kategori berhasil ditambahkan.", "success");
    }

    Store.save();
    closeModal();
    refreshCurrentRoute();
  }

  function openMethodModal(id) {
    var method = id ? getPaymentMethod(id) : null;
    if (method && method.default) {
      showToast("Metode pembayaran default tidak dapat diedit.", "error");
      return;
    }

    openModal(
      '<form id="method-form" data-id="' +
        escapeAttr(id || "") +
        '">' +
        '<div class="flex items-start justify-between gap-4">' +
        '<div><h3 class="text-lg font-semibold text-slate-900">' +
        (method ? "Edit Metode Pembayaran" : "Tambah Metode Pembayaran") +
        '</h3><p class="mt-1 text-sm text-slate-500">Atur nama, label, dan status metode.</p></div>' +
        '<button type="button" data-action="modal-close" class="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-900">X</button>' +
        "</div>" +
        '<div id="method-form-errors" class="mt-4 hidden rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700"></div>' +
        '<label class="mt-5 block"><span class="text-sm font-semibold text-slate-700">Nama metode</span>' +
        '<input id="method-name" class="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-50" type="text" value="' +
        escapeAttr(method ? method.name : "") +
        '" placeholder="Contoh: Kas Kecil" /></label>' +
        '<label class="mt-4 block"><span class="text-sm font-semibold text-slate-700">Ikon/label</span>' +
        '<input id="method-label" class="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-50" type="text" maxlength="3" value="' +
        escapeAttr(method ? method.label : "") +
        '" placeholder="Contoh: KK" /></label>' +
        '<label class="mt-4 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-700">' +
        '<input id="method-active" type="checkbox" class="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"' +
        (!method || method.active ? " checked" : "") +
        " />Aktif</label>" +
        '<div class="mt-6 flex justify-end gap-3">' +
        '<button type="button" data-action="modal-close" class="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Batal</button>' +
        '<button type="submit" class="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700">Simpan</button>' +
        "</div></form>"
    );
  }

  function savePaymentMethod(event) {
    event.preventDefault();

    var id = event.target.dataset.id;
    var name = document.getElementById("method-name").value.trim();
    var label = document.getElementById("method-label").value.trim().toUpperCase();
    var active = document.getElementById("method-active").checked;
    var errors = [];

    if (!name) {
      errors.push("Nama metode pembayaran wajib diisi.");
    }
    if (!label) {
      errors.push("Label wajib diisi.");
    }

    if (errors.length) {
      showFormErrors("method-form-errors", errors);
      return;
    }

    if (id) {
      var method = getPaymentMethod(id);
      if (!method || method.default) {
        showToast("Metode pembayaran default tidak dapat diedit.", "error");
        return;
      }
      method.name = name;
      method.label = label.slice(0, 3);
      method.active = active;
      showToast("Metode pembayaran berhasil diperbarui.", "success");
    } else {
      Store.state.paymentMethods.push({
        id: Store.nextId("pay"),
        name: name,
        label: label.slice(0, 3),
        active: active,
        default: false,
      });
      showToast("Metode pembayaran berhasil ditambahkan.", "success");
    }

    Store.save();
    closeModal();
    refreshCurrentRoute();
  }

  function openTransactionDetail(id) {
    var transaction = getTransaction(id);
    if (!transaction) {
      showToast("Transaksi tidak ditemukan.", "error");
      return;
    }

    var amountClass = transaction.type === "income" ? "text-emerald-700" : "text-rose-700";

    openModal(
      '<div class="flex items-start justify-between gap-4">' +
        '<div><h3 class="text-lg font-semibold text-slate-900">Detail Transaksi</h3>' +
        '<p class="mt-1 text-sm text-slate-500">Informasi lengkap transaksi lokal.</p></div>' +
        '<button type="button" data-action="modal-close" class="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-900">X</button>' +
        "</div>" +
        '<dl class="mt-6 grid gap-4 text-sm">' +
        detailRow("Tanggal", Store.formatDate(transaction.date)) +
        detailRow("Tipe", transaction.type === "income" ? "Pemasukan" : "Pengeluaran") +
        detailRow("Kategori", getCategoryName(transaction.categoryId)) +
        detailRow("Metode pembayaran", getMethodName(transaction.methodId)) +
        detailRow("Status", transaction.status) +
        '<div class="rounded-xl border border-slate-200 bg-slate-50 p-4"><dt class="text-xs font-semibold uppercase tracking-wide text-slate-400">Nominal</dt><dd class="mt-1 text-lg font-bold ' +
        amountClass +
        '">' +
        escapeHtml(transaction.type === "income" ? "+" : "-") +
        escapeHtml(Store.formatCurrency(transaction.amount)) +
        "</dd></div>" +
        detailRow("Catatan", transaction.note || "-") +
        "</dl>" +
        '<div class="mt-6 flex justify-end gap-3">' +
        '<button type="button" data-action="modal-close" class="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Tutup</button>' +
        '<button type="button" data-action="transaction-edit" data-id="' +
        escapeAttr(transaction.id) +
        '" class="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700">Edit</button>' +
        "</div>"
    );
  }

  function openDeleteModal(type, id) {
    pendingDelete = { type: type, id: id };

    var labels = {
      transaction: getTransactionLabel(id),
      category: getCategoryLabel(id),
      method: getPaymentMethodLabel(id),
    };
    var titles = {
      transaction: "Hapus transaksi?",
      category: "Hapus kategori?",
      method: "Hapus metode pembayaran?",
    };

    openModal(
      '<div><h3 class="text-lg font-semibold text-slate-900">' +
        titles[type] +
        '</h3><p class="mt-2 text-sm leading-6 text-slate-500">Data "' +
        escapeHtml(labels[type]) +
        '" akan dihapus dari data lokal aplikasi.</p></div>' +
        '<div class="mt-6 flex justify-end gap-3">' +
        '<button type="button" data-action="modal-close" class="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Batal</button>' +
        '<button type="button" data-action="delete-confirm" class="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-rose-700">Hapus</button>' +
        "</div>"
    );
  }

  function confirmDelete() {
    if (!pendingDelete) {
      closeModal();
      return;
    }

    if (pendingDelete.type === "transaction") {
      Store.state.transactions = Store.state.transactions.filter(function (transaction) {
        return transaction.id !== pendingDelete.id;
      });
      Store.save();
      closeModal();
      showToast("Transaksi berhasil dihapus.", "success");
      refreshCurrentRoute();
      return;
    }

    if (pendingDelete.type === "category") {
      var category = getCategory(pendingDelete.id);
      if (category && category.default) {
        closeModal();
        showToast("Kategori default tidak dapat dihapus.", "error");
        return;
      }

      Store.state.categories = Store.state.categories.filter(function (item) {
        return item.id !== pendingDelete.id;
      });
      Store.save();
      closeModal();
      showToast("Kategori berhasil dihapus.", "success");
      refreshCurrentRoute();
      return;
    }

    if (pendingDelete.type === "method") {
      var method = getPaymentMethod(pendingDelete.id);
      if (method && method.default) {
        closeModal();
        showToast("Metode pembayaran default tidak dapat dihapus.", "error");
        return;
      }

      Store.state.paymentMethods = Store.state.paymentMethods.filter(function (item) {
        return item.id !== pendingDelete.id;
      });
      Store.save();
      closeModal();
      showToast("Metode pembayaran berhasil dihapus.", "success");
      refreshCurrentRoute();
    }
  }

  function togglePaymentMethod(id) {
    var method = getPaymentMethod(id);
    if (!method) {
      return;
    }

    method.active = !method.active;
    Store.save();
    showToast(method.active ? "Metode pembayaran diaktifkan." : "Metode pembayaran dinonaktifkan.", "success");
    refreshCurrentRoute();
  }

  function applyReportFilters(event) {
    event.preventDefault();

    var start = document.getElementById("report-start-date").value;
    var end = document.getElementById("report-end-date").value;

    if (!start || !end) {
      showToast("Tanggal mulai dan akhir wajib diisi.", "error");
      return;
    }

    if (start > end) {
      showToast("Tanggal mulai tidak boleh melewati tanggal akhir.", "error");
      return;
    }

    filters.reports.start = start;
    filters.reports.end = end;
    renderReportsContent();
    showToast("Filter laporan diterapkan.", "success");
  }

  function resetReportFilters() {
    filters.reports.start = Store.addDays(Store.today(), -6);
    filters.reports.end = Store.today();
    renderReports();
    showToast("Filter laporan direset.", "success");
  }

  function exportReportVisual() {
    showToast("Laporan siap dicetak atau disimpan sebagai PDF.", "success");
    window.print();
  }

  function saveSettings(event) {
    event.preventDefault();

    Store.state.settings.businessName = document.getElementById("settings-business-name").value.trim() || "Cashflow Harian";
    Store.state.settings.currency = document.getElementById("settings-currency").value;
    Store.state.settings.dateFormat = document.getElementById("settings-date-format").value;
    Store.state.settings.monthlyTarget = Number(document.getElementById("settings-monthly-target").value) || 0;
    Store.state.settings.theme = document.getElementById("settings-theme").value;

    Store.save();
    updateShellStats();
    showToast("Pengaturan berhasil disimpan.", "success");
  }

  function resetSettings() {
    Store.resetSettings();
    renderSettings();
    updateShellStats();
    showToast("Pengaturan berhasil direset.", "success");
  }

  function getFilteredTransactions() {
    var search = filters.transactions.search;
    var type = filters.transactions.type;

    return sortTransactions(
      Store.state.transactions.filter(function (transaction) {
        var typeMatch = type === "all" || transaction.type === type;
        var haystack = [
          transaction.note,
          transaction.status,
          transaction.date,
          getCategoryName(transaction.categoryId),
          getMethodName(transaction.methodId),
          transaction.type === "income" ? "pemasukan" : "pengeluaran",
        ]
          .join(" ")
          .toLowerCase();

        return typeMatch && (!search || haystack.indexOf(search) >= 0);
      })
    );
  }

  function getReportTransactions() {
    return sortTransactions(
      Store.state.transactions.filter(function (transaction) {
        return transaction.date >= filters.reports.start && transaction.date <= filters.reports.end;
      })
    );
  }

  function summarizeTransactions(list) {
    return list.reduce(
      function (summary, transaction) {
        if (transaction.type === "income") {
          summary.income += Number(transaction.amount) || 0;
        } else {
          summary.expense += Number(transaction.amount) || 0;
        }
        summary.balance = summary.income - summary.expense;
        return summary;
      },
      { income: 0, expense: 0, balance: 0 }
    );
  }

  function sortTransactions(list) {
    return list.slice().sort(function (a, b) {
      var dateCompare = String(b.date).localeCompare(String(a.date));
      if (dateCompare !== 0) {
        return dateCompare;
      }
      return String(b.createdAt || b.id).localeCompare(String(a.createdAt || a.id));
    });
  }

  function getDateRange(start, end) {
    var dates = [];
    var cursor = new Date(start + "T12:00:00");
    var last = new Date(end + "T12:00:00");

    while (cursor <= last && dates.length < 31) {
      dates.push(Store.addDays(Store.today(), Math.round((cursor - new Date(Store.today() + "T12:00:00")) / 86400000)));
      cursor.setDate(cursor.getDate() + 1);
    }

    return dates;
  }

  function getTransaction(id) {
    return Store.state.transactions.find(function (transaction) {
      return transaction.id === id;
    });
  }

  function getCategory(id) {
    return Store.state.categories.find(function (category) {
      return category.id === id;
    });
  }

  function getPaymentMethod(id) {
    return Store.state.paymentMethods.find(function (method) {
      return method.id === id;
    });
  }

  function getCategoryName(id) {
    var category = getCategory(id);
    return category ? category.name : "Tanpa kategori";
  }

  function getMethodName(id) {
    var method = getPaymentMethod(id);
    return method ? method.name : "Tanpa metode";
  }

  function categoryTransactionCount(id) {
    return Store.state.transactions.filter(function (transaction) {
      return transaction.categoryId === id;
    }).length;
  }

  function paymentMethodTransactionCount(id) {
    return Store.state.transactions.filter(function (transaction) {
      return transaction.methodId === id;
    }).length;
  }

  function getTransactionLabel(id) {
    var transaction = getTransaction(id);
    return transaction ? transaction.note || getCategoryName(transaction.categoryId) : "Transaksi";
  }

  function getCategoryLabel(id) {
    var category = getCategory(id);
    return category ? category.name : "Kategori";
  }

  function getPaymentMethodLabel(id) {
    var method = getPaymentMethod(id);
    return method ? method.name : "Metode pembayaran";
  }

  function typeBadge(type) {
    if (type === "income") {
      return '<span class="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">Pemasukan</span>';
    }

    return '<span class="rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700">Pengeluaran</span>';
  }

  function statusBadge(status) {
    var active = status === "Selesai";
    return (
      '<span class="rounded-full px-3 py-1 text-xs font-medium ' +
      (active ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700") +
      '">' +
      escapeHtml(status || "Pending") +
      "</span>"
    );
  }

  function defaultBadge(isDefault) {
    return isDefault
      ? '<span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">Default</span>'
      : '<span class="rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">Custom</span>';
  }

  function activeBadge(isActive) {
    return isActive
      ? '<span class="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">Aktif</span>'
      : '<span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">Nonaktif</span>';
  }

  function methodLabel(method) {
    return (
      '<span class="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 bg-slate-50 text-xs font-black text-slate-600">' +
      escapeHtml(method.label || method.name.slice(0, 2).toUpperCase()) +
      "</span>"
    );
  }

  function detailRow(label, value) {
    return (
      '<div class="rounded-xl border border-slate-200 bg-slate-50 p-4"><dt class="text-xs font-semibold uppercase tracking-wide text-slate-400">' +
      escapeHtml(label) +
      '</dt><dd class="mt-1 font-semibold text-slate-900">' +
      escapeHtml(value) +
      "</dd></div>"
    );
  }

  function emptyState(title, description) {
    return (
      '<div class="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">' +
      '<h3 class="text-base font-semibold text-slate-900">' +
      escapeHtml(title) +
      "</h3>" +
      '<p class="mt-2 text-sm text-slate-500">' +
      escapeHtml(description) +
      "</p></div>"
    );
  }

  function errorState(title, description) {
    return (
      '<div class="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center">' +
      '<h2 class="text-base font-semibold text-rose-900">' +
      escapeHtml(title) +
      "</h2>" +
      '<p class="mt-2 text-sm text-rose-700">' +
      escapeHtml(description) +
      "</p></div>"
    );
  }

  function showFormErrors(targetId, errors) {
    var target = document.getElementById(targetId);
    if (!target) {
      return;
    }

    target.classList.remove("hidden");
    target.innerHTML = errors
      .map(function (error) {
        return "<p>" + escapeHtml(error) + "</p>";
      })
      .join("");
  }

  function openModal(content) {
    if (!modalRoot) {
      return;
    }

    modalRoot.innerHTML =
      '<div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" role="dialog" aria-modal="true">' +
      '<div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">' +
      content +
      "</div></div>";

    var focusable = modalRoot.querySelector("input, select, textarea, button");
    if (focusable) {
      focusable.focus();
    }
  }

  function closeModal() {
    if (modalRoot) {
      modalRoot.innerHTML = "";
    }
    pendingDelete = null;
  }

  function showToast(message, type) {
    if (!toastRoot) {
      return;
    }

    var id = "toast-" + Date.now();
    var tone =
      type === "error"
        ? "border-rose-200 bg-rose-50 text-rose-800"
        : "border-emerald-200 bg-emerald-50 text-emerald-800";

    toastRoot.insertAdjacentHTML(
      "beforeend",
      '<div id="' +
        id +
        '" class="rounded-2xl border px-4 py-3 text-sm font-semibold shadow-sm ' +
        tone +
        '">' +
        escapeHtml(message) +
        "</div>"
    );

    window.setTimeout(function () {
      var toast = document.getElementById(id);
      if (toast) {
        toast.remove();
      }
    }, 3200);
  }

  function iconMarkup(icon, classes) {
    return icon.replace("<svg", '<svg class="' + classes + '"');
  }

  function shortDate(dateString) {
    return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short" }).format(new Date(dateString + "T12:00:00"));
  }

  function compactAmount(amount) {
    var absolute = Math.abs(Number(amount) || 0);
    var prefix = amount < 0 ? "-" : "";

    if (absolute >= 1000000) {
      return prefix + "Rp" + (absolute / 1000000).toFixed(1).replace(".0", "") + "jt";
    }

    if (absolute >= 1000) {
      return prefix + "Rp" + Math.round(absolute / 1000) + "rb";
    }

    return prefix + "Rp" + absolute;
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function escapeAttr(value) {
    return escapeHtml(value);
  }
})();
