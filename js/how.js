async function init() {
  const site = await loadSite();
  document.getElementById("howGrid").innerHTML = site.howItWorks.steps.map((s, i) => `
    <div class="step"><div class="num">${i + 1}</div><h3>${s.title}</h3><p>${s.text}</p></div>
  `).join("");
}

init();
