async function init() {
  const site = await loadSite();
  document.getElementById("howGrid").innerHTML = site.howItWorks.steps.map((s) => `
    <div class="how-card"><h3>${s.title}</h3><p>${s.text}</p></div>
  `).join("");
}

init();
