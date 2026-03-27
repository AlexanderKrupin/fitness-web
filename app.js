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
  plans: "Планы тренировок",
  exercises: "Упражнения",
  progress: "Прогресс",
  notifications: "Уведомления",
  jobs: "Фоновые задачи"
};

const plans = [
  { name: "Strength Base 6W", category: "Силовые", duration: "6 недель", sessions: 24, author: "Alex Mercer", updated: "2026-03-24", status: "Активный" },
  { name: "Lean Cut Phase", category: "Кардио + дефицит", duration: "8 недель", sessions: 32, author: "Nina Volkov", updated: "2026-03-19", status: "Черновик" },
  { name: "Hypertrophy Reload", category: "Гипертрофия", duration: "10 недель", sessions: 40, author: "Daniel Ross", updated: "2026-03-21", status: "Активный" },
  { name: "Morning Mobility Reset", category: "Мобилити", duration: "4 недели", sessions: 20, author: "Kate Orlov", updated: "2026-03-10", status: "Архив" },
  { name: "Athlete Engine", category: "Функционал", duration: "12 недель", sessions: 48, author: "Alex Mercer", updated: "2026-03-27", status: "Активный" },
  { name: "Core Recovery Track", category: "Core", duration: "5 недель", sessions: 18, author: "Nina Volkov", updated: "2026-03-12", status: "Черновик" }
];

const exercises = [
  { title: "Deadlift", category: "Силовые", muscles: "Спина / Ягодицы", level: "Advanced", work: "5×5", preview: "BARBELL" },
  { title: "Bulgarian Split Squat", category: "Силовые", muscles: "Квадрицепс / Ягодицы", level: "Intermediate", work: "4×8", preview: "UNILATERAL" },
  { title: "Hollow Body Hold", category: "Core", muscles: "Core", level: "Intermediate", work: "4×45s", preview: "ISOMETRIC" },
  { title: "Assault Bike Sprint", category: "Кардио", muscles: "Ноги / Плечи", level: "Advanced", work: "8×20s", preview: "HIIT" },
  { title: "Incline Push-Up", category: "Силовые", muscles: "Грудь / Трицепс", level: "Beginner", work: "3×15", preview: "BODYWEIGHT" },
  { title: "90/90 Hip Flow", category: "Мобилити", muscles: "Тазобедренные", level: "Beginner", work: "6 min", preview: "MOBILITY" },
  { title: "Toe Touch Stretch", category: "Растяжка", muscles: "Задняя линия", level: "Beginner", work: "3×40s", preview: "FLEX" }
];

const notifications = [
  { title: "Напоминание о вечерней тренировке", channel: "Push", audience: "RU / Active 7d", time: "2026-03-27 18:00", status: "Scheduled", metric: "OR 32%" },
  { title: "Weekly Progress Digest", channel: "Email", audience: "Global / All paid", time: "2026-03-26 09:00", status: "Sent", metric: "CTR 9.4%" },
  { title: "Промо: новый план Strength Base", channel: "Push", audience: "New users", time: "2026-03-25 12:30", status: "Delivered", metric: "OR 41%" },
  { title: "Re-engagement 14d inactive", channel: "Email", audience: "Dormant cohort", time: "2026-03-24 07:00", status: "Failed", metric: "CTR 0.8%" },
  { title: "Черновик welcome-flow", channel: "Email", audience: "N/A", time: "—", status: "Draft", metric: "—" }
];

const jobs = [
  { id: "JOB-94108", name: "delivery_batch_push_12", type: "Notification", started: "2026-03-27 09:41", duration: "00:03:18", status: "Выполняется", progress: 62, logs: ["job picked by worker-03", "fetching user segment", "payload prepared", "delivery batch #12 completed"] },
  { id: "JOB-94102", name: "report_retention_weekly", type: "Analytics", started: "2026-03-27 09:35", duration: "00:02:01", status: "Завершено", progress: 100, logs: ["aggregate started", "loading cohorts", "export complete"] },
  { id: "JOB-94093", name: "mail_provider_sync", type: "Email", started: "2026-03-27 09:21", duration: "00:00:44", status: "Ошибка", progress: 14, logs: ["job picked by worker-02", "timeout while connecting to mail provider", "retry scheduled"] },
  { id: "JOB-94072", name: "plan_snapshot_archive", type: "Storage", started: "2026-03-27 09:04", duration: "00:01:18", status: "Завершено", progress: 100, logs: ["preparing archive", "storage write complete", "checksum valid"] },
  { id: "JOB-94060", name: "segment_rebuild_global", type: "Segmentation", started: "2026-03-27 08:59", duration: "—", status: "В очереди", progress: 0, logs: ["waiting for available worker"] }
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
    if (["Push", "Email"].includes(appState.notificationFilter)) {
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
  const values = [4200, 4700, 5100, 4900, 5600, 6100, 6500];
  const labels = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
  const width = 900;
  const height = 280;
  const padding = { top: 20, right: 20, bottom: 42, left: 50 };
  const min = 3800;
  const max = 6800;

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

    sectionTitle.textContent = screenTitles[screenKey] || "Dashboard";
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
