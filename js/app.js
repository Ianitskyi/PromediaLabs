let ALL_COURSES = [];
let activeFilter = "all";

function courseCardHTML(course) {
  const status = statusMeta(course);
  const disabled = ctaDisabled(course);
  return `
    <a class="course-card" href="course.html?slug=${encodeURIComponent(course.slug)}">
      <span class="badge status-${status.tone}">${status.label}</span>
      <div class="format-tag">${course.format} · ${course.cadence || ""}</div>
      <h3>${course.title}</h3>
      <p class="desc">${course.short}</p>
      <div class="course-meta">
        <span>${formatDateRange(course)}</span>
        <span class="course-price">${formatPriceShort(course)}</span>
      </div>
      <div class="cta-row">
        <span class="btn${disabled ? " disabled" : ""}">${ctaLabel(course)}</span>
      </div>
    </a>
  `;
}

function renderCourses() {
  const grid = document.getElementById("courseGrid");
  const filtered = activeFilter === "all"
    ? ALL_COURSES
    : ALL_COURSES.filter((c) => c.courseType === activeFilter);

  if (!filtered.length) {
    grid.innerHTML = `<p style="color:var(--muted)">Курсів у цій категорії поки немає.</p>`;
    return;
  }
  grid.innerHTML = filtered.map(courseCardHTML).join("");
}

function setupFilters() {
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      activeFilter = btn.dataset.filter;
      renderCourses();
    });
  });
}

async function init() {
  setupFilters();
  ALL_COURSES = await loadCourses();
  renderCourses();
}

init().catch((err) => {
  document.getElementById("courseGrid").innerHTML =
    `<p style="color:var(--red)">Не вдалося завантажити курси: ${err.message}</p>`;
});
