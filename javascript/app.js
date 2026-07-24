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

function parseEmbedding(rawValue) {
  if (!rawValue) {
    return [];
  }

  return String(rawValue)
    .split(",")
    .map((value) => Number(value.trim()))
    .filter((value) => Number.isFinite(value));
}

function buildCaptureSample(modality, rawSignal, frameCount, captureDuration, sensorConfidence) {
  const parsedSignal = parseEmbedding(rawSignal);
  if (parsedSignal.length < 4) {
    return null;
  }

  return {
    modality,
    raw_signal: parsedSignal,
    frame_count: Number(frameCount) || 12,
    capture_duration: Number(captureDuration) || 1,
    sensor_confidence: Number(sensorConfidence) || 0.9,
    quality_context: {
      lighting: 0.9,
      occlusion: 0,
      motion_blur: 0,
      noise: 0,
      risk_level: 0
    }
  };
}

function parseOptionalNumber(value) {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : undefined;
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
  const usersTable = document.getElementById("users-table");

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

  if (createForm || loadButton || usersTable) {
    loadUsers().catch(() => null);
  }
}

function bindEnrolmentPage() {
  const createSubjectForm = document.getElementById("create-subject-form");
  const createEnrolmentForm = document.getElementById("create-enrolment-form");
  const loadSubjectsButton = document.getElementById("load-subjects");
  const loadEnrolmentsButton = document.getElementById("load-enrolments");
  const subjectsTable = document.getElementById("subjects-table");
  const enrolmentsTable = document.getElementById("enrolments-table");

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
      const captureSamples = [];

      const faceCaptureSample = buildCaptureSample(
        "face",
        formData.get("captureRawSignal"),
        formData.get("captureFrameCount"),
        formData.get("captureDuration"),
        formData.get("captureSensorConfidence")
      );

      if (faceCaptureSample && payload.modality === "face") {
        captureSamples.push(faceCaptureSample);
      }

      const gaitCaptureSample = buildCaptureSample(
        "gait",
        formData.get("captureRawSignal"),
        formData.get("captureFrameCount"),
        formData.get("captureDuration"),
        formData.get("captureSensorConfidence")
      );

      if (gaitCaptureSample && payload.modality === "gait") {
        captureSamples.push(gaitCaptureSample);
      }

      payload.templateQuality = parseOptionalNumber(payload.templateQuality);
      payload.featureVector = parseEmbedding(formData.get("featureVector"));
      payload.captureSamples = captureSamples;

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

  if (
    createSubjectForm ||
    createEnrolmentForm ||
    loadSubjectsButton ||
    loadEnrolmentsButton ||
    subjectsTable ||
    enrolmentsTable
  ) {
    loadSubjects().catch(() => null);
    loadEnrolments().catch(() => null);
  }
}

function bindAuthenticationPage() {
  const form = document.getElementById("run-authentication-form");
  const loadButton = document.getElementById("load-attempts");
  const output = document.getElementById("authentication-result");
  const attemptsTable = document.getElementById("attempts-table");

  async function loadAttempts() {
    const response = await apiRequest("/authentication/attempts");
    renderTable("attempts-table", response.attempts);
  }

  if (form) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      const faceEmbedding = parseEmbedding(formData.get("faceEmbedding"));
      const gaitEmbedding = parseEmbedding(formData.get("gaitEmbedding"));
      const samples = [];
      const captureSamples = [];

      if (faceEmbedding.length > 0) {
        samples.push({ modality: "face", embedding: faceEmbedding });
      }

      if (gaitEmbedding.length > 0) {
        samples.push({ modality: "gait", embedding: gaitEmbedding });
      }

      const faceCaptureSample = buildCaptureSample(
        "face",
        formData.get("faceRawSignal"),
        formData.get("faceFrameCount"),
        formData.get("faceCaptureDuration"),
        formData.get("faceSensorConfidence")
      );
      const gaitCaptureSample = buildCaptureSample(
        "gait",
        formData.get("gaitRawSignal"),
        formData.get("gaitFrameCount"),
        formData.get("gaitCaptureDuration"),
        formData.get("gaitSensorConfidence")
      );

      if (faceCaptureSample) {
        captureSamples.push(faceCaptureSample);
      }

      if (gaitCaptureSample) {
        captureSamples.push(gaitCaptureSample);
      }

      const payload = {
        subjectId: formData.get("subjectId"),
        primaryModality: formData.get("primaryModality"),
        confidenceScore: Number(formData.get("confidenceScore")),
        sourceChannel: formData.get("sourceChannel"),
        isOffHours: formData.get("isOffHours") === "on",
        targetResource: formData.get("targetResource") || undefined,
        modalityScores: {
          face: Number(formData.get("faceScore") || 0),
          gait: Number(formData.get("gaitScore") || 0)
        },
        biometricEvaluationRequest: samples.length > 0 || captureSamples.length > 0 ? {
          samples,
          captureSamples,
          strategy: "score_level",
          baseThreshold: 0.75,
          adaptationWindow: 3,
          riskScore: Number(formData.get("confidenceScore") || 0) / 100,
          environmentQuality: 1
        } : undefined
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

  if (form || loadButton || output || attemptsTable) {
    loadAttempts().catch(() => null);
  }
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
  const controllerButton = document.getElementById("load-controller-overview");
  const monitoringTable = document.getElementById("monitoring-table");
  const controllerDeviceTable = document.getElementById("controller-device-table");
  const controllerEventsTable = document.getElementById("controller-events-table");

  async function loadEvents() {
    const response = await apiRequest("/monitoring/events");
    renderTable("monitoring-table", response.events);
  }

  async function loadControllerOverview() {
    const response = await apiRequest("/monitoring/controller/overview?limit=25");
    renderTable("controller-device-table", response.deviceStates);
    renderTable("controller-events-table", response.controllerEvents);
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

  if (controllerButton) {
    controllerButton.addEventListener("click", () => loadControllerOverview().catch((error) => alert(error.message)));
  }

  if (form || button || monitoringTable) {
    loadEvents().catch(() => null);
  }

  if (controllerButton || controllerDeviceTable || controllerEventsTable) {
    loadControllerOverview().catch(() => null);
  }
}

function bindSettingsPage() {
  const form = document.getElementById("update-configuration-form");
  const button = document.getElementById("load-configuration");
  const configurationTable = document.getElementById("configuration-table");

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

  if (form || button || configurationTable) {
    loadConfig().catch(() => null);
  }
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
