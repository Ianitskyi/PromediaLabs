function qs(param) {
  return new URLSearchParams(window.location.search).get(param);
}

function listBlock(title, items) {
  if (!items || !items.length) return "";
  return `<div class="block"><h2>${title}</h2><ul>${items.map((i) => `<li>${i}</li>`).join("")}</ul></div>`;
}

function faqBlock(faq) {
  if (!faq || !faq.length) return "";
  return `<div class="block"><h2>Часті питання</h2>${faq.map((f) => `
    <div class="faq-item"><div class="q">${f.q}</div><div class="a">${f.a}</div></div>
  `).join("")}</div>`;
}

function sidebarHTML(course) {
  const status = statusMeta(course);
  const disabled = ctaDisabled(course);
  const type = COURSE_TYPE_META[course.courseType];

  const rows = [];
  rows.push(["Формат", course.format]);
  rows.push(["Дати", formatDateRange(course)]);
  if (course.applyDeadline) rows.push(["Дедлайн подачі заявки", formatDate(course.applyDeadline)]);
  if (course.registrationDeadline) rows.push(["Дедлайн реєстрації", formatDate(course.registrationDeadline)]);
  if (course.seats) rows.push(["Місць", course.seats]);
  if (course.seatsLeft != null) rows.push(["Вільних місць", course.seatsLeft]);
  rows.push(["Вартість", formatPrice(course)]);
  if (course.accessDuration) rows.push(["Доступ", course.accessDuration]);

  const ctaHref = disabled ? null : `apply.html?slug=${encodeURIComponent(course.slug)}`;

  return `
    <div class="sidebar-card">
      <span class="badge status-${status.tone}">${status.label}</span>
      <dl>
        ${rows.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join("")}
      </dl>
      ${ctaHref
        ? `<a class="btn" href="${ctaHref}">${ctaLabel(course)}</a>`
        : `<span class="btn disabled">${ctaLabel(course)}</span>`}
      ${course.afterPayment ? `<p class="sidebar-note">${course.afterPayment}</p>` : ""}
    </div>
  `;
}

function courseHTML(course) {
  return `
    <div class="course-header wrap">
      <a class="breadcrumb" href="index.html#catalog">← Усі курси</a>
      <h1>${course.title}</h1>
      <p style="color:var(--muted); font-size:15px; max-width:640px">${course.short}</p>
    </div>
    <div class="course-body">
      <div class="course-main">
        ${listBlock("Про курс", course.about)}
        ${listBlock("Програма", course.program)}
        ${listBlock("Кому підійде", course.whoFor)}
        ${listBlock("Як відбувається відбір", course.selectionSteps)}
        ${faqBlock(course.faq)}
      </div>
      <aside>${sidebarHTML(course)}</aside>
    </div>
  `;
}

async function init() {
  const slug = qs("slug");
  const courses = await loadCourses();
  const course = getCourseBySlug(courses, slug);
  const root = document.getElementById("courseRoot");
  if (!course) {
    root.innerHTML = `<p class="wrap" style="color:var(--red)">Курс не знайдено. <a href="index.html">До каталогу</a></p>`;
    return;
  }
  document.title = `${course.title} — ProMedia Labs`;
  root.innerHTML = courseHTML(course);
}

init();
