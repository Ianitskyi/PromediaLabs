function qs(param) {
  return new URLSearchParams(window.location.search).get(param);
}

function fieldHTML(key) {
  const meta = FIELD_META[key];
  const req = meta.required ? "required" : "";
  const input = meta.type === "textarea"
    ? `<textarea id="f_${key}" name="${key}" ${req}></textarea>`
    : `<input type="${meta.type}" id="f_${key}" name="${key}" placeholder="${meta.placeholder || ""}" ${req} />`;
  return `<div class="field"><label for="f_${key}">${meta.label}${meta.required ? "" : " (необов'язково)"}</label>${input}</div>`;
}

function nextStepsCopy(course) {
  if (course.courseType === "offline_selection") {
    return "Заявку надіслано. Редакційна рада розгляне її й повідомить рішення на вашу пошту — зазвичай протягом 10 днів після дедлайну подачі.";
  }
  if (course.courseType === "online_paid_cohort") {
    return course.paymentLink
      ? "Заявку прийнято. Зараз перенаправимо вас на сторінку оплати — місце бронюється одразу після оплати."
      : "Заявку прийнято. Провайдера оплати ще не підключено — ми зв'яжемось з вами на email протягом 1–2 днів, щоб завершити реєстрацію й прийняти оплату.";
  }
  return course.paymentLink
    ? "Заявку прийнято. Зараз перенаправимо вас на сторінку оплати — доступ відкриється одразу після оплати."
    : "Заявку прийнято. Провайдера оплати ще не підключено — ми зв'яжемось з вами на email протягом 1–2 днів, щоб надіслати посилання на оплату та доступ.";
}

async function init() {
  const slug = qs("slug");
  const root = document.getElementById("formRoot");
  const [courses, site] = await Promise.all([loadCourses(), loadSite()]);
  const course = getCourseBySlug(courses, slug);

  if (!course) {
    root.innerHTML = `<p style="color:var(--red)">Курс не знайдено. <a href="index.html">До каталогу</a></p>`;
    return;
  }
  if (ctaDisabled(course)) {
    root.innerHTML = `<p style="color:var(--muted)">Наразі подати заявку на «${course.title}» не можна: ${statusMeta(course).label.toLowerCase()}. <a href="course.html?slug=${slug}">Повернутися до курсу</a></p>`;
    return;
  }

  const type = COURSE_TYPE_META[course.courseType];
  document.title = `${type.formTitle} — ${course.title}`;

  root.innerHTML = `
    <a class="back-link" href="course.html?slug=${slug}">← ${course.title}</a>
    <h1>${type.formTitle}</h1>
    <p class="lead">${type.formLead}</p>
    <div class="panel">
      <div class="form-status" id="formStatus"></div>
      <form id="applyForm">
        ${type.fields.map(fieldHTML).join("")}
        <button class="btn btn-primary btn-block" type="submit">Надіслати</button>
      </form>
    </div>
  `;

  document.getElementById("applyForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const statusBox = document.getElementById("formStatus");
    const submitBtn = e.target.querySelector("button[type=submit]");
    submitBtn.disabled = true;
    submitBtn.textContent = "Надсилаємо…";

    const payload = { course: course.slug, courseTitle: course.title };
    type.fields.forEach((key) => {
      payload[key] = document.getElementById(`f_${key}`).value;
    });

    try {
      const { applicationId } = await submitForm({
        endpoint: site.forms.endpoint,
        to: site.footer.contactEmail,
        subject: `${type.formTitle}: ${course.title}`,
        payload
      });

      statusBox.className = "form-status success";
      statusBox.textContent = `${nextStepsCopy(course)} Номер заявки: ${applicationId} — збережіть його для звернень.`;

      if (course.paymentLink) {
        window.location.href = course.paymentLink;
        return;
      }

      e.target.style.display = "none";
    } catch (err) {
      statusBox.className = "form-status error";
      statusBox.textContent = `Не вдалося надіслати заявку: ${err.message}. Спробуйте ще раз або напишіть на ${site.footer.contactEmail}.`;
      submitBtn.disabled = false;
      submitBtn.textContent = "Надіслати";
    }
  });
}

init();
