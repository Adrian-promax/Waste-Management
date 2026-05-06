// ================= STORAGE =================
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
      id: "seed-1",
      title: "Overflowing bin near market",
      location: "Main St & 5th Ave",
      category: "General",
      urgency: "High",
      description: "The bin has not been emptied for days.",
      reporter: "Jane Doe",
      email: "jane@example.com",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: "seed-2",
      title: "E-waste dumped in alley",
      location: "Oak Lane",
      category: "E-Waste",
      urgency: "Medium",
      description: "Old monitors and wires on the curb.",
      reporter: "Sam Lee",
      email: "sam@example.com",
      createdAt: new Date(Date.now() - 18000000).toISOString(),
    },
  ];

  saveReports(sample);
  return sample;
}

// ================= FOOTER YEAR =================
document.addEventListener("DOMContentLoaded", () => {
  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
});

// ================= HOME STATS =================
document.addEventListener("DOMContentLoaded", () => {
  const reports = getReports();

  const total = document.getElementById("stat-total");
  const high = document.getElementById("stat-high");
  const recycled = document.getElementById("stat-recycled");

  if (total) total.textContent = reports.length;
  if (high)
    high.textContent = reports.filter((r) => r.urgency === "High").length;
  if (recycled)
    recycled.textContent = reports.filter(
      (r) => r.category !== "General",
    ).length;
});

// ================= SERVICES PAGE =================
const SERVICES = [
  {
    key: "General",
    icon: "🗑️",
    title: "General Waste Collection",
    desc: "Scheduled pickups for household and street waste.",
  },
  {
    key: "Plastic",
    icon: "🧴",
    title: "Plastic Recycling",
    desc: "Drop-off and curbside collection of plastics.",
  },
  {
    key: "Organic",
    icon: "🌱",
    title: "Organic Composting",
    desc: "Turn food and garden waste into rich compost.",
  },
  {
    key: "E-Waste",
    icon: "💻",
    title: "E-Waste Disposal",
    desc: "Safe handling of electronics and batteries.",
  },
  {
    key: "Hazardous",
    icon: "☣️",
    title: "Hazardous Waste",
    desc: "Specialized removal of chemicals.",
  },
];

document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("services-grid");
  if (!grid) return;

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

// ================= REPORTS PAGE =================
document.addEventListener("DOMContentLoaded", () => {
  const listEl = document.getElementById("reports-list");
  const emptyEl = document.getElementById("empty");
  const searchEl = document.getElementById("search");
  const filterEl = document.getElementById("filter");

  if (!listEl) return;

  function escapeHtml(str = "") {
    return String(str).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  }

  function render() {
    const q = searchEl.value.toLowerCase();
    const cat = filterEl.value;

    const reports = getReports().filter((r) => {
      const matchQ =
        !q || (r.title + r.location + r.description).toLowerCase().includes(q);
      const matchC = cat === "All" || r.category === cat;
      return matchQ && matchC;
    });

    if (reports.length === 0) {
      listEl.innerHTML = "";
      emptyEl.classList.remove("hidden");
      return;
    }

    emptyEl.classList.add("hidden");

    listEl.innerHTML = reports
      .map(
        (r) => `
      <article class="report-card">
        <div class="report-head">
          <div>
            <h2>${escapeHtml(r.title)}</h2>
            <p class="report-loc">📍 ${escapeHtml(r.location)}</p>
          </div>
          <span class="urg ${r.urgency}">${r.urgency}</span>
        </div>

        <p class="report-desc">${escapeHtml(r.description || "")}</p>

        <div class="chips">
          <span class="chip">${escapeHtml(r.category)}</span>
          <span class="chip muted">By ${escapeHtml(r.reporter)}</span>
          <span class="chip muted">${new Date(r.createdAt).toLocaleDateString()}</span>
        </div>

        <button class="delete-btn" data-id="${r.id}">Delete</button>
      </article>
    `,
      )
      .join("");

    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (confirm("Delete this report?")) {
          deleteReport(btn.dataset.id);
          render();
        }
      });
    });
  }

  searchEl.addEventListener("input", render);
  filterEl.addEventListener("change", render);

  render();
});

// ================= REPORT FORM =================
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

    const data = Object.fromEntries(new FormData(form).entries());

    if (!validate(data)) return;

    addReport(data);

    successEl.classList.remove("hidden");
    form.reset();

    setTimeout(() => {
      window.location.href = "reports.html";
    }, 900);
  });
});
