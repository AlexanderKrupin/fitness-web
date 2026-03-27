const loginView = document.getElementById("loginView");
const dashboardView = document.getElementById("dashboardView");
const loginForm = document.getElementById("loginForm");
const logoutBtn = document.getElementById("logoutBtn");
const sideMenu = document.getElementById("sideMenu");
const sectionTitle = document.getElementById("sectionTitle");
const skeleton = document.getElementById("skeleton");
const sidebar = document.getElementById("sidebar");
const sidebarOpen = document.getElementById("sidebarOpen");
const sidebarClose = document.getElementById("sidebarClose");
const sidebarOverlay = document.getElementById("sidebarOverlay");
const toast = document.getElementById("toast");

const screenTitles = {
  plans: "Пользователи",
  exercises: "Диалоги",
  progress: "Аналитика",
  notifications: "Рассылки",
  jobs: "Автоматизации"
};

const plans = [
  { name: "@alex_store_owner", category: "Администратор", duration: "RU", sessions: 184, author: "Telegram Organic", updated: "2026-03-27", status: "Активный" },
  { name: "@mila_support", category: "Оператор", duration: "RU", sessions: 129, author: "Deep Link", updated: "2026-03-25", status: "Активный" },
  { name: "@john_trial_user", category: "Пользователь", duration: "EN", sessions: 42, author: "Referral", updated: "2026-03-24", status: "Черновик" },
  { name: "@kate_marketing", category: "Маркетолог", duration: "RU", sessions: 88, author: "Ad Campaign", updated: "2026-03-22", status: "Активный" },
  { name: "@silent_client", category: "Пользователь", duration: "RU", sessions: 4, author: "QR Bot", updated: "2026-03-10", status: "Отключен" },
  { name: "@oleg_partner", category: "Партнер", duration: "UA", sessions: 23, author: "Manual Import", updated: "2026-03-18", status: "Архив" }
];

const exercises = [
  { title: "/start", category: "Onboarding", muscles: "Приветствие + меню", level: "High", work: "2 шага", preview: "CMD" },
  { title: "/faq", category: "FAQ", muscles: "Частые вопросы", level: "High", work: "12 ответов", preview: "FAQ" },
  { title: "Статус заказа", category: "Support", muscles: "Проверка трека", level: "Medium", work: "API call", preview: "FLOW" },
  { title: "Промокод дня", category: "Promo", muscles: "Выдача купона", level: "Medium", work: "1 сообщение", preview: "SALE" },
  { title: "Смена языка", category: "Settings", muscles: "RU/EN/UA", level: "Medium", work: "inline", preview: "LANG" },
  { title: "Передача оператору", category: "Support", muscles: "handoff", level: "High", work: "SLA 2m", preview: "LIVE" }
];

const notifications = [
  { title: "Скидка на повторный заказ", channel: "Telegram", audience: "Покупатели 30d", time: "2026-03-27 12:00", status: "Scheduled", metric: "CTR 18.2%" },
  { title: "Дайджест обновлений", channel: "Telegram", audience: "All active", time: "2026-03-26 10:00", status: "Sent", metric: "CTR 14.7%" },
  { title: "Напоминание о брошенной корзине", channel: "Telegram", audience: "Cart abandon", time: "2026-03-25 19:00", status: "Delivered", metric: "CTR 21.5%" },
  { title: "Реактивация неактивных", channel: "Telegram", audience: "Inactive 14d", time: "2026-03-24 11:30", status: "Failed", metric: "CTR 1.1%" },
  { title: "Черновик welcome-серии", channel: "Telegram", audience: "N/A", time: "—", status: "Draft", metric: "—" }
];

const jobs = [
  { id: "JOB-1108", name: "webhook_dispatch", type: "Webhook", started: "2026-03-27 09:41", duration: "00:03:18", status: "Выполняется", progress: 62, logs: ["webhook received", "validated signature", "queued response", "batch 12 delivered"] },
  { id: "JOB-1102", name: "digest_scheduler", type: "Cron", started: "2026-03-27 09:35", duration: "00:02:01", status: "Завершено", progress: 100, logs: ["cron tick", "segment loaded", "messages pushed"] },
  { id: "JOB-1093", name: "crm_sync", type: "Integration", started: "2026-03-27 09:21", duration: "00:00:44", status: "Ошибка", progress: 14, logs: ["sync started", "CRM timeout", "retry in 60 sec"] },
  { id: "JOB-1072", name: "cleanup_archives", type: "Storage", started: "2026-03-27 09:04", duration: "00:01:18", status: "Завершено", progress: 100, logs: ["old files found", "archives removed", "storage ok"] },
  { id: "JOB-1060", name: "segment_rebuild", type: "Segmentation", started: "2026-03-27 08:59", duration: "—", status: "В очереди", progress: 0, logs: ["waiting free worker"] }
];

const appState = {
  auth: false,
  activeScreen: "plans",
  planSort: { key: "updated", asc: false },
  notificationFilter: "all",
  jobFilter: "all",
  openLogsRow: null,
  exerciseView: "cards"
};

function badgeClassByStatus(status) {
  const map = {
    Активный: "active",
    Черновик: "draft",
    Архив: "archived",
    Отключен: "failed",
    Scheduled: "scheduled",
    Sent: "sent",
    Delivered: "delivered",
    Failed: "failed",
    Draft: "draft",
    "В очереди": "queue",
    "Выполняется": "running",
    Завершено: "active",
    Ошибка: "error"
  };
  return map[status] || "draft";
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 1800);
}

function renderPlans() {
  const tbody = document.querySelector("#plansTable tbody");
  const search = document.getElementById("planSearch").value.trim().toLowerCase();
  const statusFilter = document.getElementById("planStatusFilter").value;

  const filtered = plans
    .filter((item) => {
      const byStatus = statusFilter === "all" || item.status === statusFilter;
      const bySearch = `${item.name} ${item.author}`.toLowerCase().includes(search);
      return byStatus && bySearch;
    })
    .sort((a, b) => {
      const first = a[appState.planSort.key];
      const second = b[appState.planSort.key];
      const sign = appState.planSort.asc ? 1 : -1;
      return String(first).localeCompare(String(second), "ru") * sign;
    });

  tbody.innerHTML = filtered
    .map(
      (item) => `<tr>
      <td>${item.name}</td>
      <td>${item.category}</td>
      <td>${item.duration}</td>
      <td>${item.sessions}</td>
      <td>${item.author}</td>
      <td>${item.updated.split("-").reverse().join(".")}</td>
      <td><span class="badge ${badgeClassByStatus(item.status)}">${item.status}</span></td>
      <td>
        <div class="kebab">
          <button class="btn btn-ghost kebab-toggle" type="button">⋯</button>
          <div class="kebab-menu">
            <button type="button">Редактировать</button>
            <button type="button">Дублировать</button>
            <button type="button">Архивировать</button>
          </div>
        </div>
      </td>
    </tr>`
    )
    .join("");
}

function renderExercises() {
  const search = document.getElementById("exerciseSearch").value.trim().toLowerCase();
  const category = document.getElementById("exerciseCategoryFilter").value;
  const container = document.getElementById("exerciseGrid");

  const filtered = exercises.filter((item) => {
    const bySearch = `${item.title} ${item.muscles}`.toLowerCase().includes(search);
    const byCategory = category === "all" || item.category === category;
    return bySearch && byCategory;
  });

  container.innerHTML = filtered
    .map(
      (item) => `<article class="exercise-card" data-view="${appState.exerciseView}">
      <div class="exercise-preview">${item.preview}</div>
      <strong>${item.title}</strong>
      <p class="exercise-meta">${item.category} • ${item.level}</p>
      <p class="exercise-meta">${item.muscles} • ${item.work}</p>
      <button class="btn btn-secondary" type="button">Действия</button>
    </article>`
    )
    .join("");
}

function renderNotifications() {
  const tbody = document.querySelector("#notificationsTable tbody");
  const empty = document.getElementById("notificationEmpty");

  const filtered = notifications.filter((n) => {
    if (appState.notificationFilter === "all") return true;
    if (["Telegram"].includes(appState.notificationFilter)) {
      return n.channel === appState.notificationFilter;
    }
    return n.status === appState.notificationFilter;
  });

  tbody.innerHTML = filtered
    .map(
      (item) => `<tr>
      <td>${item.title}</td>
      <td>${item.channel}</td>
      <td>${item.audience}</td>
      <td>${item.time}</td>
      <td><span class="badge ${badgeClassByStatus(item.status)}">${item.status}</span></td>
      <td>${item.metric}</td>
      <td><button class="btn btn-ghost" type="button">Открыть</button></td>
    </tr>`
    )
    .join("");

  empty.classList.toggle("hidden", !(appState.notificationFilter === "Draft" && filtered.length === 0));
}

function jobRow(item) {
  const progressBlock =
    item.status === "Выполняется"
      ? `<div class="progress-track"><span style="width:${item.progress}%"></span></div><div class="muted">${item.progress}%</div>`
      : "<span class='muted'>—</span>";

  return `<tr data-id="${item.id}">
    <td>${item.id}</td>
    <td>${item.name}</td>
    <td>${item.type}</td>
    <td>${item.started}</td>
    <td>${item.duration}</td>
    <td><span class="badge ${badgeClassByStatus(item.status)}">${item.status}</span></td>
    <td>${progressBlock}</td>
    <td><button class="btn btn-ghost" data-log-id="${item.id}" type="button">Логи</button></td>
  </tr>`;
}

function renderJobs() {
  const tbody = document.querySelector("#jobsTable tbody");
  const empty = document.getElementById("jobsEmpty");
  const search = document.getElementById("jobSearch").value.trim().toLowerCase();
  const status = document.getElementById("jobStatusFilter").value;

  const filtered = jobs.filter((job) => {
    const bySearch = `${job.id} ${job.name}`.toLowerCase().includes(search);
    const byStatus = status === "all" || job.status === status;
    return bySearch && byStatus;
  });

  tbody.innerHTML = filtered.map(jobRow).join("");
  empty.classList.toggle("hidden", !(status === "Ошибка" && filtered.length === 0));

  document.getElementById("kpiQueue").textContent = jobs.filter((item) => item.status === "В очереди").length;
  document.getElementById("kpiRunning").textContent = jobs.filter((item) => item.status === "Выполняется").length;
  document.getElementById("kpiDone").textContent = jobs.filter((item) => item.status === "Завершено").length;
  document.getElementById("kpiError").textContent = jobs.filter((item) => item.status === "Ошибка").length;
}

function renderChart() {
  const svg = document.getElementById("activityChart");
  const values = [1280, 1470, 1690, 1580, 1820, 2010, 2140];
  const labels = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
  const width = 900;
  const height = 280;
  const padding = { top: 20, right: 20, bottom: 42, left: 50 };
  const min = 1100;
  const max = 2300;

  const mapX = (i) => padding.left + (i * (width - padding.left - padding.right)) / (values.length - 1);
  const mapY = (value) => padding.top + ((max - value) * (height - padding.top - padding.bottom)) / (max - min);
  const path = values.map((v, i) => `${i ? "L" : "M"}${mapX(i)} ${mapY(v)}`).join(" ");

  svg.innerHTML = `
    <line x1="${padding.left}" y1="${height - padding.bottom}" x2="${width - padding.right}" y2="${height - padding.bottom}" stroke="#b8c5d8"/>
    <line x1="${padding.left}" y1="${padding.top}" x2="${padding.left}" y2="${height - padding.bottom}" stroke="#b8c5d8"/>
    <path d="${path}" fill="none" stroke="#2a66ff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    ${values
      .map(
        (v, i) => `<circle cx="${mapX(i)}" cy="${mapY(v)}" r="4" fill="#2a66ff"/>\n<text x="${mapX(i)}" y="${height - 16}" text-anchor="middle" fill="#667383" font-size="12">${labels[i]}</text>`
      )
      .join("")}
  `;
}

function setAuthState(isAuth) {
  appState.auth = isAuth;
  loginView.classList.toggle("hidden", isAuth);
  dashboardView.classList.toggle("hidden", !isAuth);
}

function closeSidebar() {
  sidebar.classList.remove("show");
  sidebarOverlay.classList.remove("show");
}

function setScreen(screenKey, withLoading = true) {
  appState.activeScreen = screenKey;
  const render = () => {
    document.querySelectorAll(".screen").forEach((screen) => {
      screen.classList.toggle("active", screen.id === `screen-${screenKey}`);
    });

    sideMenu.querySelectorAll(".menu-item").forEach((item) => {
      item.classList.toggle("active", item.dataset.screen === screenKey);
    });

    sectionTitle.textContent = screenTitles[screenKey] || "Панель";
    location.hash = screenKey;
    closeSidebar();
  };

  if (!withLoading) {
    render();
    return;
  }

  skeleton.classList.remove("hidden");
  setTimeout(() => {
    render();
    skeleton.classList.add("hidden");
  }, 260);
}

function bootstrapHashRoute() {
  const route = location.hash.replace("#", "");
  const isScreen = Boolean(screenTitles[route]);
  setScreen(isScreen ? route : "plans", false);
}

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  setAuthState(true);
  bootstrapHashRoute();
  showToast("Вход выполнен");
});

logoutBtn.addEventListener("click", () => {
  setAuthState(false);
  loginForm.reset();
  closeSidebar();
  location.hash = "";
  showToast("Сессия завершена");
});

sideMenu.addEventListener("click", (event) => {
  const btn = event.target.closest(".menu-item");
  if (!btn) return;
  setScreen(btn.dataset.screen);
});

document.querySelectorAll("#plansTable th[data-sort]").forEach((th) => {
  th.addEventListener("click", () => {
    const key = th.dataset.sort;
    if (appState.planSort.key === key) {
      appState.planSort.asc = !appState.planSort.asc;
    } else {
      appState.planSort = { key, asc: true };
    }
    renderPlans();
  });
});

["planSearch", "planStatusFilter"].forEach((id) => {
  document.getElementById(id).addEventListener("input", renderPlans);
  document.getElementById(id).addEventListener("change", renderPlans);
});

document.getElementById("planSortPreset").addEventListener("change", (event) => {
  const [key, dir] = event.target.value.split("_");
  appState.planSort = { key, asc: dir === "asc" };
  renderPlans();
});

["exerciseSearch", "exerciseCategoryFilter"].forEach((id) => {
  document.getElementById(id).addEventListener("input", renderExercises);
  document.getElementById(id).addEventListener("change", renderExercises);
});

document.getElementById("exerciseReset").addEventListener("click", () => {
  document.getElementById("exerciseSearch").value = "";
  document.getElementById("exerciseCategoryFilter").value = "all";
  renderExercises();
});

document.querySelectorAll("#screen-exercises .chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    document.querySelectorAll("#screen-exercises .chip").forEach((item) => item.classList.remove("active"));
    chip.classList.add("active");
    appState.exerciseView = chip.dataset.view;
    renderExercises();
  });
});

document.getElementById("notificationFilter").addEventListener("click", (event) => {
  const chip = event.target.closest(".chip");
  if (!chip) return;
  document.querySelectorAll("#notificationFilter .chip").forEach((item) => item.classList.remove("active"));
  chip.classList.add("active");
  appState.notificationFilter = chip.dataset.filter;
  renderNotifications();
});

["jobSearch", "jobStatusFilter"].forEach((id) => {
  document.getElementById(id).addEventListener("input", renderJobs);
  document.getElementById(id).addEventListener("change", renderJobs);
});

document.querySelector("#jobsTable tbody").addEventListener("click", (event) => {
  const logBtn = event.target.closest("[data-log-id]");
  if (!logBtn) return;

  const jobId = logBtn.dataset.logId;
  const row = logBtn.closest("tr");
  const currentOpened = document.querySelector(".log-row");

  if (currentOpened) {
    currentOpened.remove();
    if (appState.openLogsRow === jobId) {
      appState.openLogsRow = null;
      return;
    }
  }

  const item = jobs.find((job) => job.id === jobId);
  if (!item) return;

  const logRow = document.createElement("tr");
  logRow.className = "log-row";
  logRow.innerHTML = `<td colspan="8"><div class="log-block">${item.logs.map((log) => `<div>${log}</div>`).join("")}</div></td>`;
  row.after(logRow);
  appState.openLogsRow = jobId;
});

document.body.addEventListener("click", (event) => {
  const toggle = event.target.closest(".kebab-toggle");
  const openMenu = document.querySelector(".kebab-menu.show");

  if (toggle) {
    const menu = toggle.nextElementSibling;
    if (openMenu && openMenu !== menu) openMenu.classList.remove("show");
    menu.classList.toggle("show");
    return;
  }

  if (openMenu && !event.target.closest(".kebab")) {
    openMenu.classList.remove("show");
  }
});

sidebarOpen.addEventListener("click", () => {
  sidebar.classList.add("show");
  sidebarOverlay.classList.add("show");
});

sidebarClose.addEventListener("click", closeSidebar);
sidebarOverlay.addEventListener("click", closeSidebar);

window.addEventListener("hashchange", () => {
  if (!appState.auth) return;
  bootstrapHashRoute();
});

renderPlans();
renderExercises();
renderNotifications();
renderJobs();
renderChart();
setAuthState(false);
