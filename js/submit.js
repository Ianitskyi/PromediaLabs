/* Відправка форм заявки/реєстрації.
   Поки не підключено serverless-бекенд (Google Sheets/email API), site.json
   forms.endpoint == null — тоді submitForm() чесно збирає дані в лист на
   labs@promedia.report замість того, щоб вдавати, ніби заявку кудись
   збережено. Щойно з'явиться реальний endpoint (Cloudflare Worker / Google
   Apps Script), достатньо прописати його в content/site.json — код форм
   міняти не треба. */

function generateApplicationId() {
  return "PML-" + Date.now().toString(36).toUpperCase();
}

async function submitForm({ endpoint, to, subject, payload }) {
  const applicationId = generateApplicationId();
  const fullPayload = { ...payload, applicationId, submittedAt: new Date().toISOString() };

  if (endpoint) {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fullPayload)
    });
    if (!res.ok) throw new Error(`Сервер повернув помилку: ${res.status}`);
    return { applicationId, via: "endpoint" };
  }

  const body = Object.entries(fullPayload)
    .map(([key, value]) => `${key}: ${value}`)
    .join("\n");
  const mailto = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = mailto;
  return { applicationId, via: "mailto" };
}
