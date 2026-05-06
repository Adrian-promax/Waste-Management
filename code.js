/* ================= STORAGE ================= */
const STORAGE_KEY = "greencycle.reports.v1";

function getReports() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedReports();

    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch (e) {
    return [];
  }
}

function saveReports(reports) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
}

function addReport(report) {
  const full = {
    id: (crypto.randomUUID && crypto.randomUUID()) || String(Date.now()),
    createdAt: new Date().toISOString(),
    ...report,
  };

  const all = getReports();
  all.unshift(full);
  saveReports(all);
  return full;
}

function deleteReport(id) {
  saveReports(getReports().filter((r) => r.id !== id));
}

function seedReports() {
  const sample = [
    {
      id: "1",
      title: "Overflowing bin at market",
      location: "Main St & 5th Ave",
      category: "General",
      urgency: "High",
      description: "The bin has not been emptied for days",
      reporter: "Jane Doe",
      email: "jane@example.com",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: "2",
      title: "E-waste dumped in alley",
      location: "Oak Lane",
      category: "E-Waste",
      urgency: "Medium",
      description: "Old monitors and wires on the curb",
      reporter: "Sam Lee",
      email: "sam@example.com",
      createdAt: new Date(Date.now() - 18000000).toISOString(),
    },
  ];

  saveReports(sample);
  return sample;
}

/* ================= FOOTER YEAR ================= */
document.addEventListener("DOMContentLoaded", () => {
  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
});

/* ================= HOME PAGE ================= */
document.addEventListener("DOMContentLoaded", () => {
  const reports = getReports();

  const totalEl = document.getElementById("stat-total");
  const highEl = document.getElementById("stat-high");
  const recycledEl = document.getElementById("stat-recycled");

  if (totalEl) totalEl.textContent = reports.length;

  if (highEl) {
    highEl.textContent = reports.filter((r) => r.urgency === "High").length;
  }

  if (recycledEl) {
    recycledEl.textContent = reports.filter(
      (r) => r.category !== "General",
    ).length;
  }
});

/* ================= REPORT FORM ================= */
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("report-form");
  const successEl = document.getElementById("success");

  if (!form) return;

  function setError(field, msg) {
    const el = form.querySelector(`.error[data-for="${field}"]`);
    if (el) el.textContent = msg || "";
  }

  function validate(data) {
    let ok = true;

    ["title", "location", "reporter", "email"].forEach((f) => setError(f, ""));

    if (!data.title || data.title.length < 3) {
      setError("title", "Title must be at least 3 characters.");
      ok = false;
    }

    if (!data.location) {
      setError("location", "Location is required.");
      ok = false;
    }

    if (!data.reporter) {
      setError("reporter", "Your name is required.");
      ok = false;
    }

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(data.email)) {
      setError("email", "Enter a valid email.");
      ok = false;
    }

    return ok;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const fd = new FormData(form);
    const data = Object.fromEntries(fd.entries());

    if (!validate(data)) return;

    addReport(data);

    if (successEl) successEl.classList.remove("hidden");

    form.reset();

    setTimeout(() => {
      window.location.href = "reports.html";
    }, 900);
  });
});

/* ================= SERVICES PAGE ================= */
document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("services-grid");
  if (!grid) return;

  const SERVICES = [
    {
      key: "General",
      icon: "🗑️",
      title: "General Waste Collection",
      desc: "Scheduled pickups for household waste.",
    },
    {
      key: "Plastic",
      icon: "♻️",
      title: "Plastic Recycling",
      desc: "Collection of plastic materials.",
    },
    {
      key: "Organic",
      icon: "🌱",
      title: "Organic Composting",
      desc: "Turn food waste into compost.",
    },
    {
      key: "E-Waste",
      icon: "💻",
      title: "E-Waste Disposal",
      desc: "Safe electronics disposal.",
    },
    {
      key: "Hazardous",
      icon: "☣️",
      title: "Hazardous Waste",
      desc: "Handling dangerous waste.",
    },
  ];

  const reports = getReports();

  grid.innerHTML = SERVICES.map((s) => {
    const count = reports.filter((r) => r.category === s.key).length;

    return `
      <article class="card">
        <div class="card-head">
          <div class="icon">${s.icon}</div>
          <span class="badge">${count} reports</span>
        </div>
        <h2>${s.title}</h2>
        <p>${s.desc}</p>
      </article>
    `;
  }).join("");
});
