async function init() {
  const site = await loadSite();
  const form = document.getElementById("statusForm");
  const statusBox = document.getElementById("formStatus");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const submitBtn = e.target.querySelector("button[type=submit]");
    submitBtn.disabled = true;
    submitBtn.textContent = "Надсилаємо…";

    const payload = {
      applicationId: document.getElementById("f_applicationId").value,
      email: document.getElementById("f_email").value
    };

    try {
      await submitForm({
        endpoint: null,
        to: site.footer.contactEmail,
        subject: `Запит статусу заявки ${payload.applicationId}`,
        payload
      });
      statusBox.className = "form-status info";
      statusBox.textContent = `Запит надіслано на ${site.footer.contactEmail}. Відповімо протягом 1–2 робочих днів.`;
      form.style.display = "none";
    } catch (err) {
      statusBox.className = "form-status error";
      statusBox.textContent = `Не вдалося надіслати запит: ${err.message}. Напишіть напряму на ${site.footer.contactEmail}.`;
      submitBtn.disabled = false;
      submitBtn.textContent = "Запитати статус";
    }
  });
}

init();
