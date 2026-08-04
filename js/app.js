let ALL_COURSES = [];
let activeFilter = "all";

function courseCardHTML(course) {
  const status = statusMeta(course);
  const disabled = ctaDisabled(course);
  return `
    <a class="course-card type-${course.courseType}" href="course.html?slug=${encodeURIComponent(course.slug)}">
      <span class="tag ${status.tone}">${status.label}</span>
      <h3>${course.title}</h3>
      <div class="format-tag">${course.format} · ${course.cadence || ""}</div>
      <p class="desc">${course.short}</p>
      <div class="course-meta">
        <span>${formatDateRange(course)}</span>
        <span class="course-price">${formatPriceShort(course)}</span>
      </div>
      <div class="cta-row">
        <span class="btn btn-primary${disabled ? " disabled" : ""}">${ctaLabel(course)}</span>
      </div>
    </a>
  `;
}

function renderCourses() {
  const grid = document.getElementById("courseGrid");
  const count = document.getElementById("resultCount");
  const filtered = activeFilter === "all"
    ? ALL_COURSES
    : ALL_COURSES.filter((c) => c.courseType === activeFilter);

  count.textContent = `${filtered.length} курс${filtered.length === 1 ? "" : filtered.length >= 2 && filtered.length <= 4 ? "и" : "ів"}`;

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
