const STORAGE_KEY = "cleanco.reports.v1";

// Get all reports. If none, start with two stories to get things going.
function getReports() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedReports();
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
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

function seedReports() {
  const sample = [
    {
      id: "1",
      title: "Bin imejaa soko, flies wanakula party",
      location: "Kando ya boda stage",
      category: "General chaos",
      urgency: "Do something now, please",
      description: "Hakuna mtu anaangalia bin hapa, imejaa hadi inatiririka.",
      reporter: "Mama Mboga",
      email: "",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: "2",
      title: "TV za kale zimetupwa kwa alley",
      location: "Nyuma ya duka ya Otieno",
      category: "Electronics? (E-Waste)",
      urgency: "Medium tu",
      description: "Kuna TV mbili na wires mingi, watoto wanachezea hapo.",
      reporter: "Stano",
      email: "",
      createdAt: new Date(Date.now() - 18000000).toISOString(),
    },
  ];
  saveReports(sample);
  return sample;
}

// Set the year at the bottom, just to show we care about time
document.addEventListener("DOMContentLoaded", () => {
  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
});

// Handle the report form, human-style
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
      setError("title", "Andika kitu hapa, hata kama ni maneno machache tu.");
      ok = false;
    }
    if (!data.location) {
      setError(
        "location",
        "Hata 'hapo kwa kona' inatosha. Tupa location yoyote.",
      );
      ok = false;
    }
    if (data.reporter && data.reporter.trim().length < 2) {
      setError("reporter", "Andika jina la ukweli au acha tu blank.");
      ok = false;
    }
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      setError("email", "Email hiyo haikai sawa. Sawa tu ukiacha blank.");
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
    }, 1200);
  });
});

// Show stats on homepage—if the elements exist
document.addEventListener("DOMContentLoaded", () => {
  const reports = getReports();
  const totalEl = document.getElementById("stat-total");
  const highEl = document.getElementById("stat-high");
  const recycledEl = document.getElementById("stat-recycled");

  if (totalEl) totalEl.textContent = reports.length;
  if (highEl)
    highEl.textContent = reports.filter(
      (r) => r.urgency === "Do something now, please" || r.urgency === "High",
    ).length;
  if (recycledEl)
    recycledEl.textContent = reports.filter(
      (r) =>
        r.category &&
        r.category !== "General chaos" &&
        r.category !== "General",
    ).length;
});
