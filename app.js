const loginView = document.getElementById("loginView");
const dashboardView = document.getElementById("dashboardView");
const loginForm = document.getElementById("loginForm");
const logoutBtn = document.getElementById("logoutBtn");
const menu = document.getElementById("sideMenu");
const sectionTitle = document.getElementById("sectionTitle");
const skeleton = document.getElementById("skeleton");
const screenTitles = {
  plans: "Планы тренировок",
  exercises: "Упражнения",
  progress: "Прогресс",
  notifications: "Уведомления",
  jobs: "Фоновые задачи"
};

const plansData = [
  { name: "Lean Shred 6W", coach: "Игорь Мельников", duration: 42, updated: "2026-03-26", status: "Активный" },
  { name: "Mass Gain 10W", coach: "Сергей Кудрин", duration: 70, updated: "2026-03-25", status: "Черновик" },
  { name: "Mobility Reset", coach: "Елена Соколова", duration: 28, updated: "2026-03-24", status: "Активный" },
  { name: "Endurance Base", coach: "Нина Архипова", duration: 56, updated: "2026-03-21", status: "Черновик" },
  { name: "Posture Rebuild", coach: "Денис Титов", duration: 35, updated: "2026-03-20", status: "Активный" }
];

const exercises = [
  { title: "Barbell Deadlift", category: "Силовые", muscles: "Спина, ягодицы", level: "Advanced" },
  { title: "Incline Push-up", category: "Силовые", muscles: "Грудь, трицепс", level: "Beginner" },
  { title: "Rowing Intervals", category: "Кардио", muscles: "Full body", level: "Intermediate" },
  { title: "Cossack Squat", category: "Мобилити", muscles: "Бёдра, приводящие", level: "Intermediate" },
  { title: "Hollow Body Hold", category: "Силовые", muscles: "Core", level: "Advanced" },
  { title: "Assault Bike Sprint", category: "Кардио", muscles: "Ноги, плечи", level: "Advanced" }
];

let sortState = { key: "updated", asc: false };

function renderPlans() {
  const tbody = document.querySelector("#plansTable tbody");
  const rows = [...plansData].sort((a, b) => {
    const first = a[sortState.key];
    const second = b[sortState.key];
    if (typeof first === "number") return sortState.asc ? first - second : second - first;
    return sortState.asc
      ? String(first).localeCompare(String(second), "ru")
      : String(second).localeCompare(String(first), "ru");
  });

  tbody.innerHTML = rows
    .map((item) => {
      const badgeClass = item.status === "Активный" ? "ok" : "neutral";
      return `<tr>
        <td>${item.name}</td>
        <td>${item.coach}</td>
        <td>${item.duration} дней</td>
        <td>${item.updated.split("-").reverse().join(".")}</td>
        <td><span class="badge ${badgeClass}">${item.status}</span></td>
      </tr>`;
    })
    .join("");
}

function renderExercises() {
  const container = document.getElementById("exerciseCards");
  container.innerHTML = exercises
    .map(
      (ex) => `<article class="exercise-card">
        <strong>${ex.title}</strong>
        <p>${ex.category} • ${ex.level}</p>
        <span class="mono tiny">${ex.muscles}</span>
      </article>`
    )
    .join("");
}

function setAuthState(isAuthenticated) {
  loginView.classList.toggle("hidden", isAuthenticated);
  dashboardView.classList.toggle("hidden", !isAuthenticated);
}

function setScreen(screenKey) {
  skeleton.classList.remove("hidden");
  setTimeout(() => {
    document.querySelectorAll(".screen").forEach((screen) => {
      screen.classList.toggle("active", screen.id === `screen-${screenKey}`);
    });

    menu.querySelectorAll(".menu-item").forEach((item) => {
      item.classList.toggle("active", item.dataset.screen === screenKey);
    });

    sectionTitle.textContent = screenTitles[screenKey] || "Панель";
    skeleton.classList.add("hidden");
  }, 450);
}

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  setAuthState(true);
  setScreen("plans");
});

logoutBtn.addEventListener("click", () => {
  setAuthState(false);
  loginForm.reset();
});

menu.addEventListener("click", (event) => {
  const btn = event.target.closest(".menu-item");
  if (!btn) return;
  setScreen(btn.dataset.screen);
});

document.querySelectorAll("#plansTable th[data-sort]").forEach((th) => {
  th.addEventListener("click", () => {
    const key = th.dataset.sort;
    if (sortState.key === key) {
      sortState.asc = !sortState.asc;
    } else {
      sortState.key = key;
      sortState.asc = true;
    }
    renderPlans();
  });
});

renderPlans();
renderExercises();
setAuthState(false);
