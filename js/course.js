function qs(param) {
  return new URLSearchParams(window.location.search).get(param);
}

function listPanel(title, items) {
  if (!items || !items.length) return "";
  return `<div class="panel"><h2>${title}</h2><ul>${items.map((i) => `<li>${i}</li>`).join("")}</ul></div>`;
}

function faqPanel(faq) {
  if (!faq || !faq.length) return "";
  return `<div class="panel faq"><h2>Часті питання</h2>${faq.map((f) => `
    <details><summary>${f.q}</summary><div class="a">${f.a}</div></details>
  `).join("")}</div>`;
}

function detailHeroHTML(course) {
  const status = statusMeta(course);
  return `
    <div class="eyebrow" style="margin-bottom:6px">${course.format}</div>
    <h1>${course.title}</h1>
    <p style="color:var(--muted); font-size:15px; max-width:640px; margin:0 0 12px">${course.short}</p>
    <span class="tag ${status.tone}">${status.label}</span>
  `;
}

function applyPanelHTML(course) {
  const disabled = ctaDisabled(course);
  const type = COURSE_TYPE_META[course.courseType];

  const rows = [];
  rows.push(["Дати", formatDateRange(course)]);
  if (course.applyDeadline) rows.push(["Дедлайн подачі заявки", formatDate(course.applyDeadline)]);
  if (course.registrationDeadline) rows.push(["Дедлайн реєстрації", formatDate(course.registrationDeadline)]);
  if (course.seats) rows.push(["Місць", course.seats]);
  if (course.seatsLeft != null) rows.push(["Вільних місць", course.seatsLeft]);
  if (course.accessDuration) rows.push(["Доступ", course.accessDuration]);

  const ctaHref = disabled ? null : `apply.html?slug=${encodeURIComponent(course.slug)}`;

  return `
    <div class="panel apply-panel">
      <div class="course-price-lg">${formatPrice(course)}</div>
      <dl>${rows.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join("")}</dl>
      ${ctaHref
        ? `<a class="btn btn-primary btn-block" href="${ctaHref}">${ctaLabel(course)}</a>`
        : `<span class="btn btn-primary btn-block disabled">${ctaLabel(course)}</span>`}
      ${course.afterPayment ? `<p style="font-size:12.5px;color:var(--muted);margin-top:10px">${course.afterPayment}</p>` : ""}
    </div>
  `;
}

function courseHTML(course) {
  return `
    <div class="detail-hero">${detailHeroHTML(course)}</div>
    <div class="detail-layout">
      <div>
        ${listPanel("Про курс", course.about)}
        ${listPanel("Програма", course.program)}
        ${listPanel("Кому підійде", course.whoFor)}
        ${listPanel("Як відбувається відбір", course.selectionSteps)}
        ${faqPanel(course.faq)}
      </div>
      <div>${applyPanelHTML(course)}</div>
    </div>
  `;
}

async function init() {
  const slug = qs("slug");
  const courses = await loadCourses();
  const course = getCourseBySlug(courses, slug);
  const root = document.getElementById("courseRoot");
  if (!course) {
    root.innerHTML = `<p style="color:var(--red)">Курс не знайдено. <a href="index.html">До каталогу</a></p>`;
    return;
  }
  document.title = `${course.title} — ProMedia Labs`;
  root.innerHTML = courseHTML(course);
}

init();
