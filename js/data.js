/* Єдиний словник статусів набору. Бейдж на картці й підпис кнопки CTA
   завжди беруться звідси — тому вони ніколи не суперечать одне одному. */
const STATUS_META = {
  not_started:        { label: "Набір ще не почався",  tone: "not_started",        ctaOverride: "Ще не відкрито", disabled: true },
  open:                { label: "Набір відкрито",        tone: "open" },
  selection:           { label: "Відбір триває",         tone: "selection",          ctaOverride: "Заявки на розгляді", disabled: true },
  closed:              { label: "Набір закрито",         tone: "closed",             ctaOverride: "Набір закрито", disabled: true },
  enrolled:            { label: "Групу сформовано",      tone: "enrolled",           ctaOverride: "Набір закрито", disabled: true },
  registration_open:   { label: "Реєстрація відкрита",   tone: "registration_open" },
  few_seats:           { label: "Місця закінчуються",    tone: "few_seats" },
  full:                { label: "Місць немає",           tone: "full",               ctaOverride: "Список очікування" },
  available:           { label: "Доступно",              tone: "available" }
};

/* Тип курсу визначає, яка форма й яка кнопка-дія йому належить. */
const COURSE_TYPE_META = {
  offline_selection: {
    ctaVerb: "Подати заявку",
    formTitle: "Заявка на відбір",
    formLead: "Розкажіть коротко про себе — редакційна рада розгляне заявку й повідомить рішення на email.",
    fields: ["name", "email", "phone", "affiliation", "motivation"]
  },
  online_paid_cohort: {
    ctaVerb: "Зареєструватися",
    formTitle: "Реєстрація на потік",
    formLead: "Заповніть форму — далі покажемо крок оплати. Місце бронюється після оплати.",
    fields: ["name", "email", "phone", "affiliation"]
  },
  recorded_paid: {
    ctaVerb: "Купити доступ",
    formTitle: "Купівля доступу",
    formLead: "Заповніть форму — далі покажемо крок оплати. Доступ відкриється одразу після оплати.",
    fields: ["name", "email", "phone"]
  }
};

const FIELD_META = {
  name:        { label: "Ім'я та прізвище", type: "text", required: true },
  email:       { label: "Email", type: "email", required: true },
  phone:       { label: "Телефон", type: "tel", required: false, placeholder: "+380..." },
  affiliation: { label: "Медіа / організація", type: "text", required: false },
  motivation:  { label: "Мотиваційний лист: чому цей курс і що плануєте змінити після нього", type: "textarea", required: true }
};

async function loadJSON(path) {
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) throw new Error(`Не вдалося завантажити ${path}: ${res.status}`);
  return res.json();
}

async function loadCourses() {
  const data = await loadJSON("content/courses.json");
  return data.courses;
}

async function loadSite() {
  return loadJSON("content/site.json");
}

function getCourseBySlug(courses, slug) {
  return courses.find((c) => c.slug === slug) || null;
}

function statusMeta(course) {
  return STATUS_META[course.admissionStatus] || { label: course.admissionStatus, tone: "" };
}

function ctaLabel(course) {
  const status = statusMeta(course);
  if (status.ctaOverride) return status.ctaOverride;
  const type = COURSE_TYPE_META[course.courseType];
  return type ? type.ctaVerb : "Детальніше";
}

function ctaDisabled(course) {
  return !!statusMeta(course).disabled;
}

function formatPrice(course) {
  if (course.price == null) return course.priceNote || "Безкоштовно";
  return `${course.price.toLocaleString("uk-UA")} ${course.currency || "UAH"}`;
}

function formatDateRange(course) {
  if (course.startDate && course.endDate) {
    return `${formatDate(course.startDate)} – ${formatDate(course.endDate)}`;
  }
  if (course.startDate) return `Старт ${formatDate(course.startDate)}`;
  return course.cadence || "";
}

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("uk-UA", { day: "numeric", month: "long", year: "numeric" });
}
