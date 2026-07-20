const storageKey = "ambs.auth.token";
const apiBase = "/api";

function getToken() {
  return localStorage.getItem(storageKey);
}

function setToken(token) {
  localStorage.setItem(storageKey, token);
}

function clearToken() {
  localStorage.removeItem(storageKey);
}

async function apiRequest(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  const token = getToken();
  if (token) {
    headers.Authorization = "Bearer " + token;
  }

  const response = await fetch(`${apiBase}${path}`, {
    ...options,
    headers
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401) {
      clearToken();
    }

    throw new Error(payload.error || "Request failed.");
  }

  return payload;
}

function renderTable(targetId, rows) {
  const target = document.getElementById(targetId);
  if (!target) {
    return;
  }

  if (!rows || rows.length === 0) {
    target.innerHTML = "<p class='muted'>No records found.</p>";
    return;
  }

  const columns = Object.keys(rows[0]);
  const header = columns.map((column) => `<th>${column}</th>`).join("");
  const body = rows
    .map((row) => {
      const cells = columns.map((column) => `<td>${typeof row[column] === "object" ? JSON.stringify(row[column]) : row[column] ?? ""}</td>`).join("");
      return `<tr>${cells}</tr>`;
    })
    .join("");

  target.innerHTML = `<table><thead><tr>${header}</tr></thead><tbody>${body}</tbody></table>`;
}

function bindLoginPage() {
  const form = document.getElementById("login-form");
  if (!form) {
    return;
  }

  const resultBox = document.getElementById("login-result");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const body = {
      username: formData.get("username"),
      password: formData.get("password")
    };

    try {
      const response = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify(body)
      });

      setToken(response.token);
      resultBox.textContent = `Login successful. Welcome ${response.user.fullName || response.user.full_name || response.user.username}.`;
      window.setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 600);
    } catch (error) {
      resultBox.textContent = error.message;
    }
  });
}

function bindDashboardPage() {
  const button = document.getElementById("load-dashboard");
  const container = document.getElementById("dashboard-summary");
  if (!button || !container) {
    return;
  }

  async function loadSummary() {
    const summary = await apiRequest("/dashboard/summary");
    container.innerHTML = Object.entries(summary)
      .map(([key, value]) => `<section class="card"><h3>${key}</h3><p>${value}</p></section>`)
      .join("");
  }

  button.addEventListener("click", () => loadSummary().catch((error) => alert(error.message)));
  loadSummary().catch((error) => {
    container.innerHTML = `<p>${error.message}</p>`;
  });
}

function bindUsersPage() {
  const createForm = document.getElementById("create-user-form");
  const loadButton = document.getElementById("load-users");

  async function loadUsers() {
    const response = await apiRequest("/users");
    renderTable("users-table", response.users);
  }

  if (loadButton) {
    loadButton.addEventListener("click", () => loadUsers().catch((error) => alert(error.message)));
  }

  if (createForm) {
    createForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(createForm);
      await apiRequest("/users", {
        method: "POST",
        body: JSON.stringify(Object.fromEntries(formData.entries()))
      });
      createForm.reset();
      await loadUsers();
    });
  }

  loadUsers().catch(() => null);
}

function bindEnrolmentPage() {
  const createSubjectForm = document.getElementById("create-subject-form");
  const createEnrolmentForm = document.getElementById("create-enrolment-form");
  const loadSubjectsButton = document.getElementById("load-subjects");
  const loadEnrolmentsButton = document.getElementById("load-enrolments");

  async function loadSubjects() {
    const response = await apiRequest("/enrolment/subjects");
    renderTable("subjects-table", response.subjects);
  }

  async function loadEnrolments() {
    const response = await apiRequest("/enrolment/records");
    renderTable("enrolments-table", response.enrolments);
  }

  if (createSubjectForm) {
    createSubjectForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(createSubjectForm);
      await apiRequest("/enrolment/subjects", {
        method: "POST",
        body: JSON.stringify(Object.fromEntries(formData.entries()))
      });
      createSubjectForm.reset();
      await loadSubjects();
    });
  }

  if (createEnrolmentForm) {
    createEnrolmentForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(createEnrolmentForm);
      const payload = Object.fromEntries(formData.entries());
      if (payload.templateQuality) {
        payload.templateQuality = Number(payload.templateQuality);
      }
      await apiRequest("/enrolment/records", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      createEnrolmentForm.reset();
      await loadEnrolments();
    });
  }

  if (loadSubjectsButton) {
    loadSubjectsButton.addEventListener("click", () => loadSubjects().catch((error) => alert(error.message)));
  }

  if (loadEnrolmentsButton) {
    loadEnrolmentsButton.addEventListener("click", () => loadEnrolments().catch((error) => alert(error.message)));
  }

  loadSubjects().catch(() => null);
  loadEnrolments().catch(() => null);
}

function bindAuthenticationPage() {
  const form = document.getElementById("run-authentication-form");
  const loadButton = document.getElementById("load-attempts");
  const output = document.getElementById("authentication-result");

  async function loadAttempts() {
    const response = await apiRequest("/authentication/attempts");
    renderTable("attempts-table", response.attempts);
  }

  if (form) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      const payload = {
        subjectId: formData.get("subjectId"),
        primaryModality: formData.get("primaryModality"),
        confidenceScore: Number(formData.get("confidenceScore")),
        sourceChannel: formData.get("sourceChannel"),
        modalityScores: {
          fingerprint: Number(formData.get("fingerprintScore") || 0),
          facial: Number(formData.get("facialScore") || 0),
          iris: Number(formData.get("irisScore") || 0)
        }
      };

      const response = await apiRequest("/authentication/attempts", {
        method: "POST",
        body: JSON.stringify(payload)
      });

      if (output) {
        output.textContent = JSON.stringify(response, null, 2);
      }

      await loadAttempts();
    });
  }

  if (loadButton) {
    loadButton.addEventListener("click", () => loadAttempts().catch((error) => alert(error.message)));
  }

  loadAttempts().catch(() => null);
}

function bindAuditPage() {
  const loadButton = document.getElementById("load-audit-logs");
  if (!loadButton) {
    return;
  }

  async function loadLogs() {
    const response = await apiRequest("/audit/logs");
    renderTable("audit-table", response.logs);
  }

  loadButton.addEventListener("click", () => loadLogs().catch((error) => alert(error.message)));
  loadLogs().catch(() => null);
}

function bindMonitoringPage() {
  const form = document.getElementById("create-monitoring-event-form");
  const button = document.getElementById("load-monitoring-events");

  async function loadEvents() {
    const response = await apiRequest("/monitoring/events");
    renderTable("monitoring-table", response.events);
  }

  if (form) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      await apiRequest("/monitoring/events", {
        method: "POST",
        body: JSON.stringify({
          eventType: formData.get("eventType"),
          severity: formData.get("severity"),
          sourceComponent: formData.get("sourceComponent"),
          message: formData.get("message")
        })
      });
      form.reset();
      await loadEvents();
    });
  }

  if (button) {
    button.addEventListener("click", () => loadEvents().catch((error) => alert(error.message)));
  }

  loadEvents().catch(() => null);
}

function bindSettingsPage() {
  const form = document.getElementById("update-configuration-form");
  const button = document.getElementById("load-configuration");

  async function loadConfig() {
    const response = await apiRequest("/configuration");
    renderTable("configuration-table", response.configuration);
  }

  if (form) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      const key = formData.get("key");
      const valueRaw = formData.get("value");
      const description = formData.get("description");
      const value = JSON.parse(valueRaw);

      await apiRequest(`/configuration/${encodeURIComponent(key)}`, {
        method: "PUT",
        body: JSON.stringify({ value, description })
      });

      await loadConfig();
    });
  }

  if (button) {
    button.addEventListener("click", () => loadConfig().catch((error) => alert(error.message)));
  }

  loadConfig().catch(() => null);
}

function bindReportsPage() {
  const button = document.getElementById("load-reports");

  if (!button) {
    return;
  }

  async function loadReports() {
    const response = await apiRequest("/reports/analytics");

    renderTable("reports-status-table", response.attemptStatusDistribution);
    renderTable("reports-risk-table", response.riskLevelDistribution);
    renderTable("reports-modality-table", response.modalityUsage);
    renderTable("reports-decisions-table", response.decisionOutcomes);

    const generatedAt = document.getElementById("reports-generated-at");
    if (generatedAt) {
      generatedAt.textContent = response.generatedAt;
    }
  }

  button.addEventListener("click", () => loadReports().catch((error) => alert(error.message)));
  loadReports().catch((error) => {
    const generatedAt = document.getElementById("reports-generated-at");
    if (generatedAt) {
      generatedAt.textContent = error.message;
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  bindLoginPage();
  bindDashboardPage();
  bindUsersPage();
  bindEnrolmentPage();
  bindAuthenticationPage();
  bindAuditPage();
  bindMonitoringPage();
  bindSettingsPage();
  bindReportsPage();
});
