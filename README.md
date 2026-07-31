# ProMedia Labs

Сайт курсів ProMedia NGO — `labs.promedia.report`. Каталог курсів трьох
форматів (офлайн з конкурсним відбором, онлайн-потоки з реєстрацією та
оплатою, курси в записі з платним доступом) з єдиною прозорою логікою
подачі заявки для всіх трьох.

🔗 Локально: `python -m http.server 8080` і відкрити http://localhost:8080

## Механіка набору (чому саме так)

Проаналізовано референси: kyivmediaschool.com, courses.kse.ua, prjctr.com,
laba.ua, tdschool.tdhub.com.ua, ninjaacademy.com.ua, mate.academy,
choice31.com. Спільний робочий патерн — конкурсний відбір для дорогих
офлайн-програм і пряма покупка/реєстрація для онлайн — адаптовано під три
типи курсів (`courseType` у `content/courses.json`):

| Тип | Приклад | CTA | Що відбувається |
|---|---|---|---|
| `offline_selection` | Офлайн-інтенсив, набір раз на рік | «Подати заявку» | Форма з мотиваційним листом → розгляд редакційною радою → лист-рішення на email |
| `online_paid_cohort` | Онлайн-потік | «Зареєструватися» | Форма реєстрації → оплата → підтвердження одразу, запрошення (Zoom/матеріали) ближче до старту |
| `recorded_paid` | Курс у записі | «Купити доступ» | Форма → оплата → миттєвий доступ до платформи з відео |

**Принцип прозорості**: один статус набору (`admissionStatus`) на курс — і
бейдж на картці, і підпис кнопки CTA беруться з одного словника
(`STATUS_META` у `js/data.js`), тому вони ніколи не суперечать одне
одному ("Набір відкрито" + кнопка "Набір закрито" на одній картці — саме
той різнобій, якого це усуває). Сторінка «Мій статус» — єдина точка входу
для запитів про будь-який тип заявки.

## Структура

| Файл | Призначення |
|---|---|
| `index.html` + `js/app.js` | Каталог курсів з фільтром за типом |
| `course.html` + `js/course.js` | Сторінка курсу: програма, вимоги, FAQ, сайдбар з датами/ціною/CTA |
| `apply.html` + `js/apply.js` | Форма заявки/реєстрації/купівлі — поля й текст підлаштовуються під `courseType` |
| `status.html` + `js/status.js` | «Мій статус» — запит про стан заявки за її номером |
| `js/data.js` | `STATUS_META`, `COURSE_TYPE_META`, `FIELD_META` — єдині словники логіки набору; завантаження `content/*.json` |
| `js/submit.js` | Відправка форм: POST на `content/site.json → forms.endpoint`, якщо він налаштований, інакше — чесний `mailto:` fallback (без вдавання, що дані десь "збережені", коли бекенду ще нема) |
| `content/courses.json` | Дані курсів — єдине джерело правди, редагується через адмінку |
| `content/site.json` | Тексти хіро/footer, налаштування форм |
| `css/style.css` | Брендинг ProMedia (navy `#0d0c5c` + accent `#ffac33`, Playfair Display + Montserrat) — ті самі токени, що й у `ratings.promedia.report` |

## Редагування з адмінки ProMedia

Той самий контракт, що й у `ratings.promedia.report`: `content/courses.json`
і `content/site.json` — прості JSON-файли, які адмінка `promedia.report/admins`
редагує через GitHub API (форма → commit). Щоб додати новий курс чи потік —
достатньо додати об'єкт у масив `courses`, код міняти не треба.

Схема курсу — див. приклади трьох типів у `content/courses.json`. Ключові
поля: `courseType` (`offline_selection` / `online_paid_cohort` /
`recorded_paid`), `admissionStatus` (значення з `STATUS_META` у
`js/data.js`), `paymentLink` (посилання на checkout — поки `null`, див.
нижче).

## Що ще не підключено (навмисно, до вибору провайдерів)

- **Оплата.** `paymentLink`/`paymentProvider` у `courses.json` поки `null`.
  Коли оберете провайдера (LiqPay/WayForPay/Fondy/Stripe), достатньо
  прописати посилання на checkout у полі курсу — `js/apply.js` після
  успішної відправки форми автоматично редіректить туди, якщо `paymentLink`
  заповнено.
- **Бекенд заявок.** `content/site.json → forms.endpoint` поки `null`, тому
  форми чесно відправляють дані через `mailto:` на `labs@promedia.report`
  замість того, щоб вдавати робочу автоматизацію. Коли з'явиться серверна
  функція (наприклад, Cloudflare Worker чи Google Apps Script Web App, що
  пише рядок у Google Sheet і шле email-підтвердження) — досить вказати її
  URL в `forms.endpoint`, форми одразу почнуть слати туди POST-запити.
  Код форм (`js/apply.js`, `js/status.js`, `js/submit.js`) для цього
  переписувати не треба.
- **Реальна перевірка статусу.** Сторінка `status.html` поки лише формує
  запит на email (бо немає бази заявок для пошуку). Коли з'явиться
  `forms.endpoint`, тут можна додати GET-запит до того самого бекенду за
  `applicationId`.
- **i18n.** На відміну від `ratings.promedia.report`, поки без UA/EN
  перемикача — цільова аудиторія курсів україномовна. Додати можна за тим
  самим патерном (`js/i18n.js`), якщо знадобиться.

## Деплой

GitHub Pages, `.github/workflows/deploy-pages.yml` — деплой при push у
`main`. `CNAME` → `labs.promedia.report` (додайте CNAME-запис у DNS
`promedia.report`, що вказує на `ianitskyi.github.io`, і ввімкніть Pages з
кастомним доменом у Settings репозиторію).
