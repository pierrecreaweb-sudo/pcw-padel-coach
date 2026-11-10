// Annuaire des coachs PCW Padel Coach (pcwpadel.fr/coachs/).
// Les coachs viennent de la base (fonction public_coach_directory) : seuls ceux dont le site est en ligne
// et qui n'ont pas désactivé l'annuaire dans leur espace apparaissent.
(() => {
  "use strict";
// Cadrage choisi par le coach (point gardé au centre, zoom), appliqué par variables CSS.
function cropStyle(c) {
  if (!c || typeof c !== "object") return "";
  const n = (v, lo, hi, d) => { v = Number(v); return Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : d; };
  return ` style="--fx:${n(c.x, 0, 100, 50)}%;--fy:${n(c.y, 0, 100, 50)}%;--fz:${n(c.z, 1, 3, 1)}"`;
}
  const CFG = window.PCW_SUPABASE || { url: "", anonKey: "" };
  const $ = (id) => document.getElementById(id);
  const grid = $("dir-grid"), count = $("dir-count"), qInput = $("dir-q"), sortSel = $("dir-sort"), citiesBox = $("dir-cities"), countrySel = $("dir-country");
  const params = new URLSearchParams(location.search);
  const state = { q: params.get("q") || "", type: params.get("type") || "", country: (params.get("pays") || "").toUpperCase(), sort: params.get("tri") || "reco", coaches: null };
  qInput.value = state.q;
  sortSel.value = ["reco", "note", "prix", "nom", "pays"].includes(state.sort) ? state.sort : "reco";
  // Noms de pays dans la langue choisie (Intl), à partir du code ISO envoyé par la base.
  let regionNames = null; try { regionNames = new Intl.DisplayNames([window.PCW_LANG || "fr"], { type: "region" }); } catch (e) { /* ancien navigateur */ }
  const countryName = (code) => (regionNames && code && regionNames.of(code)) || code || "";

  const esc = (t) => String(t ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const norm = (t) => String(t || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
  const ALL_COUNTRIES = "Tous les pays";
  const price = (c) => (c / 100) % 1 ? (c / 100).toFixed(2).replace(".", ",") + " €" : (c / 100) + " €";
  const hexOk = (h) => /^#[0-9a-f]{6}$/i.test(String(h || ""));
  const safeUrl = (u) => /^https:\/\/[a-z0-9.-]+\.[a-z]{2,}(\/|$)/i.test(String(u || "")) ? u : "";
  const initials = (n) => String(n).split(/\s+/).map((w) => w[0] || "").join("").slice(0, 2).toUpperCase();

  // Types de cours déduits des prestations : nombre de joueurs et niveau.
  function typesOf(c) {
    const t = new Set();
    for (const s of c.services || []) {
      if (s.capacity <= 1) t.add("individuel");
      else if (s.capacity === 2) t.add("duo");
      else t.add("collectif");
      if (/comp[ée]t|\bp\s?\d{2,4}\b|tournoi/i.test(`${s.name} ${s.level || ""}`)) t.add("competition");
    }
    return t;
  }
  const TYPE_LABEL = { individuel: "Individuel", duo: "Duo", collectif: "Collectif", competition: "Compétition" };

  function prepare(list) {
    return list.filter((c) => c && c.name && safeUrl(c.url)).map((c) => ({
      ...c,
      types: typesOf(c),
      hay: norm([c.name, c.city, countryName(c.country), (c.clubs || []).join(" "), (c.services || []).map((s) => s.name).join(" ")].join(" ")),
    }));
  }

  function stars(n) {
    const k = Math.round(n || 0);
    return `<span class="cstars" aria-hidden="true">${"<i></i>".repeat(k)}${'<i class="off"></i>'.repeat(5 - k)}</span>`;
  }

  function card(c, i) {
    const color = hexOk(c.color) ? c.color : "#0E2A52", accent = hexOk(c.accent) ? c.accent : "#E4F55B";
    const url = safeUrl(c.url), book = url.replace(/\/?$/, "/") + "#reserver";
    const photo = safeUrl(c.photo);
    const tags = [...c.types].map((t) => `<span>${TYPE_LABEL[t]}</span>`).join("");
    const clubs = (c.clubs || []).slice(0, 3);
    return `<article class="coach-card" style="--c:${color};--a:${accent};--i:${Math.min(i, 8)}">
      <a class="coach-card__media" href="${esc(url)}" tabindex="-1" aria-hidden="true">
        ${photo ? `<img src="${esc(photo)}" alt="" loading="lazy"${cropStyle(c.photo_crop)}>` : `<span class="coach-card__ini">${esc(initials(c.name))}</span>`}
        ${c.city ? `<span class="coach-card__city">${esc(c.city)}${state.multi && c.country ? `, ${esc(countryName(c.country))}` : ""}</span>` : ""}
      </a>
      <div class="coach-card__body">
        <h3><a href="${esc(url)}">${esc(c.name)}</a></h3>
        ${c.rating_count > 0
          ? `<p class="coach-card__rating" aria-label="Note ${String(c.rating).replace(".", ",")} sur 5, ${c.rating_count} avis">${stars(c.rating)}<b>${String(c.rating).replace(".", ",")}</b><span>(${c.rating_count} avis vérifiés)</span></p>`
          : `<p class="coach-card__rating coach-card__rating--new">Nouveau sur PCW</p>`}
        ${c.tagline ? `<p class="coach-card__tagline">${esc(c.tagline)}</p>` : ""}
        ${tags ? `<div class="coach-card__tags">${tags}</div>` : ""}
        ${clubs.length ? `<p class="coach-card__clubs"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>${clubs.map(esc).join(" · ")}${c.clubs.length > 3 ? ` +${c.clubs.length - 3}` : ""}</p>` : ""}
      </div>
      <div class="coach-card__foot">
        <p class="coach-card__price">${c.price_from ? `<small>À partir de</small><b>${price(c.price_from)}</b>` : `<small>Tarifs</small><b>sur son site</b>`}</p>
        <a class="btn btn--ball btn--sm" href="${esc(book)}">Réserver</a>
      </div>
    </article>`;
  }

  function render() {
    if (state.coaches === null) return;
    if (state.error) {
      count.textContent = "";
      grid.innerHTML = `<div class="dir-empty"><h2>L'annuaire ne répond pas</h2>
        <p>Vérifiez votre connexion internet, puis réessayez.</p>
        <button type="button" class="btn btn--ball" onclick="location.reload()">Réessayer</button></div>`;
      return;
    }
    const all = state.coaches;
    if (!all.length) {
      count.textContent = "";
      grid.innerHTML = `<div class="dir-empty"><span class="dir-empty__ball" aria-hidden="true"></span>
        <h2>L'annuaire ouvre avec nos premiers coachs</h2>
        <p>Les coachs PCW Padel Coach apparaîtront ici dès la mise en ligne de leur site. Revenez très bientôt pour réserver votre cours.</p>
        <a class="btn btn--ball" href="https://pcwpadel.fr/">Vous êtes coach ? Rejoignez l'annuaire</a></div>`;
      citiesBox.innerHTML = "";
      return;
    }
    const q = norm(state.q).split(" ").filter(Boolean);
    let list = all.filter((c) => (!state.type || c.types.has(state.type)) && (!state.country || c.country === state.country) && q.every((w) => c.hay.includes(w)));
    const byName = (a, b) => a.name.localeCompare(b.name, "fr");
    const score = (c) => (c.rating || 0) * Math.min(1, (c.rating_count || 0) / 5) + (c.rating_count ? .5 : 0);
    if (state.sort === "note") list.sort((a, b) => (b.rating || 0) - (a.rating || 0) || (b.rating_count || 0) - (a.rating_count || 0) || byName(a, b));
    else if (state.sort === "prix") list.sort((a, b) => (a.price_from || 1e9) - (b.price_from || 1e9) || byName(a, b));
    else if (state.sort === "nom") list.sort(byName);
    else if (state.sort === "pays") list.sort((a, b) => countryName(a.country).localeCompare(countryName(b.country), window.PCW_LANG || "fr") || score(b) - score(a) || byName(a, b));
    else list.sort((a, b) => score(b) - score(a) || byName(a, b));
    count.textContent = list.length
      ? `${list.length} coach${list.length > 1 ? "s" : ""}${state.q ? ` pour « ${state.q} »` : ""}${state.type ? ` · ${TYPE_LABEL[state.type]}` : ""}${state.country ? ` · ${countryName(state.country)}` : ""}`
      : "";
    grid.innerHTML = list.length ? list.map(card).join("")
      : `<div class="dir-empty"><h2>Aucun coach ne correspond</h2>
          <p>Essayez une ville voisine, un autre type de cours, ou affichez tous les coachs.</p>
          <button type="button" class="btn btn--ball" id="dir-reset">Voir tous les coachs</button></div>`;
    // Pays présents dans l'annuaire : liste déroulante avec le nombre de coachs.
    const byCountry = {};
    all.forEach((c) => { if (c.country) byCountry[c.country] = (byCountry[c.country] || 0) + 1; });
    const codes = Object.keys(byCountry).sort((a, b) => countryName(a).localeCompare(countryName(b), window.PCW_LANG || "fr"));
    state.multi = codes.length > 1;
    if (countrySel.dataset.n !== codes.join()) {
      countrySel.dataset.n = codes.join();
      countrySel.innerHTML = `<option value="">${esc(ALL_COUNTRIES)}</option>` + codes.map((k) => `<option value="${k}">${esc(countryName(k))} (${byCountry[k]})</option>`).join("");
    }
    countrySel.value = codes.includes(state.country) ? state.country : "";
    countrySel.closest(".dir-sort").hidden = !codes.length;
    // Villes les plus représentées, en raccourcis de recherche.
    const cities = {};
    all.forEach((c) => { if (c.city) cities[c.city] = (cities[c.city] || 0) + 1; });
    const top = Object.entries(cities).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "fr")).slice(0, 8);
    citiesBox.innerHTML = top.length > 1 ? top.map(([city, n]) =>
      `<button type="button" data-city="${esc(city)}" aria-pressed="${norm(state.q) === norm(city)}">${esc(city)} <small>${n}</small></button>`).join("") : "";
    document.querySelectorAll(".dir-filters [data-type]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.type === state.type)));
  }

  function syncUrl() {
    const p = new URLSearchParams();
    if (state.q) p.set("q", state.q);
    if (state.type) p.set("type", state.type);
    if (state.country) p.set("pays", state.country);
    if (state.sort !== "reco") p.set("tri", state.sort);
    history.replaceState(null, "", `${location.pathname}${p.toString() ? "?" + p : ""}${location.hash}`);
  }
  const update = () => { syncUrl(); render(); };

  $("dir-search").addEventListener("submit", (e) => {
    e.preventDefault(); state.q = qInput.value.trim(); update();
    document.getElementById("resultats").scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  });
  let typing;
  qInput.addEventListener("input", () => { clearTimeout(typing); typing = setTimeout(() => { state.q = qInput.value.trim(); update(); }, 200); });
  countrySel.addEventListener("change", () => { state.country = countrySel.value; update(); });
  sortSel.addEventListener("change", () => { state.sort = sortSel.value; update(); });
  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-type], [data-city], #dir-reset");
    if (!t) return;
    if (t.id === "dir-reset") { state.q = ""; state.type = ""; state.country = ""; qInput.value = ""; }
    else if (t.dataset.city !== undefined) { state.q = norm(state.q) === norm(t.dataset.city) ? "" : t.dataset.city; qInput.value = state.q; }
    else state.type = t.dataset.type;
    update();
  });

  async function load() {
    if (!CFG.url || !CFG.anonKey) { state.coaches = []; render(); return; }
    try {
      const r = await fetch(`${CFG.url.replace(/\/$/, "")}/rest/v1/rpc/public_coach_directory`, {
        method: "POST",
        headers: { apikey: CFG.anonKey, Authorization: `Bearer ${CFG.anonKey}`, "Content-Type": "application/json" },
        body: "{}",
      });
      if (!r.ok) throw new Error(String(r.status));
      const rows = await r.json();
      state.coaches = prepare(Array.isArray(rows) ? rows : []);
    } catch {
      state.coaches = []; state.error = true;
    }
    render();
  }
  load();
})();
