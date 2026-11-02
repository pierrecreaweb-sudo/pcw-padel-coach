// Page de vente PCW Padel Coach.
// Cadrage choisi par le coach (point gardé au centre, zoom), appliqué par variables CSS.
function cropStyle(c) {
  if (!c || typeof c !== "object") return "";
  const n = (v, lo, hi, d) => { v = Number(v); return Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : d; };
  return ` style="--fx:${n(c.x, 0, 100, 50)}%;--fy:${n(c.y, 0, 100, 50)}%;--fz:${n(c.z, 1, 3, 1)}"`;
}

// Les demandes du formulaire sont envoyées par email via Web3Forms (gratuit, sans serveur).
// Clé d'accès : à créer sur https://web3forms.com avec l'adresse qui doit recevoir les demandes.
const WEB3FORMS_KEY = "4273a7e4-66ef-4071-9618-dbbcfd80f02b";

// Base Supabase de PCW Padel Coach : se règle dans pcw-config.js.
// Les avis que les coachs écrivent depuis leur espace, une fois validés, s'affichent automatiquement.
const PCW_SUPABASE = window.PCW_SUPABASE || { url: "", anonKey: "" };

// Avis de vos clients (section « Ils l'utilisent »), en plus de ceux écrits par les coachs dans leur espace.
// La section reste cachée tant qu'il n'y a aucun avis : ajoutez uniquement de vrais avis,
// avec l'accord du coach, et vérifiez qu'il est d'accord pour être cité avec son nom et sa photo.
// Exemple d'avis (à copier entre les crochets, un bloc par coach, séparés par une virgule) :
//   {
//     nom: "Prénom N.",
//     metier: "Coach de padel",
//     lieu: "Toulouse · Padel Club Garonne",
//     note: 5,                              // de 1 à 5
//     texte: "Ce que le coach dit du service, dans ses mots.",
//     photo: "media/avis/prenom.jpg",       // facultatif : sans photo, les initiales s'affichent
//     depuis: "mars 2027",                  // facultatif : client depuis…
//   },
const AVIS = [
];

(() => {
  const form = document.getElementById("lead-form");
  const alertBox = document.getElementById("lead-alert");
  const submit = document.getElementById("lead-submit");
  const sent = document.getElementById("lead-sent");

  const showError = (msg, field) => {
    alertBox.textContent = msg;
    alertBox.hidden = false;
    if (field) { field.setAttribute("aria-invalid", "true"); field.focus(); }
  };
  form.addEventListener("input", (e) => { e.target.removeAttribute("aria-invalid"); alertBox.hidden = true; });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    alertBox.hidden = true;
    const f = form.elements;

    for (const name of ["prenom", "nom", "email", "telephone", "ville"]) {
      if (!f[name].value.trim()) return showError("Merci de remplir les champs marqués d'une étoile.", f[name]);
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.value.trim())) return showError("L'adresse email ne semble pas valide.", f.email);
    if (f.telephone.value.replace(/\D/g, "").length < 9) return showError("Le numéro de téléphone ne semble pas complet.", f.telephone);
    if (!f.consentement.checked) return showError("Merci de cocher la case d'accord pour qu'on puisse vous recontacter.", f.consentement);
    if (f.botcheck.value) return; // robot

    if (!WEB3FORMS_KEY) return showError("Le formulaire n'est pas encore relié. Réessayez un peu plus tard.");

    const v = (n) => f[n].value.trim();
    const habitudes = [...form.querySelectorAll('input[name="reservation_actuelle"]:checked')].map((i) => i.value).join(", ");
    const payload = {
      access_key: WEB3FORMS_KEY,
      subject: `PCW Padel Coach : demande de ${v("prenom")} ${v("nom")} (${v("ville")})`,
      from_name: "Page de vente PCW Padel Coach",
      replyto: v("email"),
      "Prénom": v("prenom"),
      "Nom": v("nom"),
      "Email": v("email"),
      "Téléphone": v("telephone"),
      "Ville": v("ville"),
      "Club(s)": v("clubs") || "—",
      "Statut": v("statut") || "—",
      "Séances par semaine": v("seances_semaine") || "—",
      "Réservations aujourd'hui": habitudes || "—",
      "Site actuel": v("site_actuel") || "—",
      "Instagram": v("instagram") || "—",
      "Priorité": v("message") || "—",
      "Rappel": v("rappel"),
      botcheck: "",
    };

    submit.disabled = true;
    submit.textContent = "Envoi…";
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.success === false) throw new Error(data.message || "send");
      form.hidden = true;
      sent.hidden = false;
      sent.focus();
    } catch {
      showError("L'envoi n'a pas fonctionné. Vérifiez votre connexion et réessayez.");
    } finally {
      submit.disabled = false;
      submit.textContent = "Envoyer ma demande";
    }
  });

  // Vidéo : grand bouton de lecture par-dessus l'aperçu.
  const vid = document.querySelector(".video video");
  const play = document.querySelector(".video__play");
  if (vid && play) {
    // Les commandes natives reviennent dès que la vidéo démarre.
    const showOverlay = () => { play.hidden = false; vid.controls = false; };
    showOverlay();
    // Les étiquettes autour de la vidéo s'effacent dès qu'elle démarre.
    const stage = document.querySelector(".video-stage");
    // Fait aussi en style direct : fonctionne même si le navigateur garde une ancienne feuille de style en cache.
    const chips = Array.from(document.querySelectorAll(".vchip"));
    const playing = (on) => {
      if (stage) stage.classList.toggle("is-playing", on);
      chips.forEach((c) => {
        c.style.transition = "opacity .35s ease, scale .4s ease";
        c.style.opacity = on ? "0" : "";
        c.style.scale = on ? ".6" : "";
        c.style.pointerEvents = on ? "none" : "";
      });
    };
    play.addEventListener("click", () => { play.hidden = true; vid.controls = true; playing(true); vid.play().catch(() => { showOverlay(); playing(false); }); vid.focus(); });
    vid.addEventListener("play", () => { play.hidden = true; vid.controls = true; playing(true); });
    vid.addEventListener("ended", () => { showOverlay(); playing(false); });
  }

  // Avis clients : ceux validés dans l'espace coach + ceux de la liste AVIS. Section cachée s'il n'y en a aucun.
  const avisSec = document.getElementById("avis");
  const esc = (t) => String(t ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const initials = (n) => String(n).split(/\s+/).map((w) => w[0] || "").join("").slice(0, 2).toUpperCase();
  const safePhoto = (u) => /^(https:\/\/|media\/)/.test(String(u || "")) ? u : "";
  const stars = (n) => {
    const k = Math.max(1, Math.min(5, Math.round(n || 5)));
    return `<span class="review__stars" role="img" aria-label="${k} sur 5">${"<i></i>".repeat(k)}${'<i class="off"></i>'.repeat(5 - k)}</span>`;
  };
  const renderAvis = (list) => {
    list = list.filter((a) => a && a.nom && a.texte);
    if (!avisSec || !list.length) return;
    const avg = list.reduce((s, a) => s + Math.max(1, Math.min(5, a.note || 5)), 0) / list.length;
    document.getElementById("avis-score").innerHTML =
      `<b>${avg.toFixed(1).replace(".", ",")}</b><span>${stars(avg)}<small>${list.length} avis de coach${list.length > 1 ? "s" : ""}</small></span>`;
    document.getElementById("avis-list").innerHTML = list.map((a) => `<figure class="review">
        ${stars(a.note)}
        <blockquote>${esc(a.texte)}</blockquote>
        <figcaption>
          ${safePhoto(a.photo) ? `<img class="review__ph" src="${esc(a.photo)}" alt="" width="48" height="48" loading="lazy"${cropStyle(a.photo_crop)}>` : `<span class="review__ph" aria-hidden="true">${esc(initials(a.nom))}</span>`}
          <span><b>${esc(a.nom)}</b><small>${esc([a.metier, a.lieu].filter(Boolean).join(" · "))}</small>${a.depuis ? `<small>Client depuis ${esc(a.depuis)}</small>` : ""}</span>
        </figcaption>
      </figure>`).join("");
    avisSec.hidden = false;
    if (window.__motionReveal) window.__motionReveal(avisSec);
  };
  renderAvis(AVIS.slice());
  if (PCW_SUPABASE.url && PCW_SUPABASE.anonKey) {
    fetch(`${PCW_SUPABASE.url.replace(/\/$/, "")}/rest/v1/rpc/public_coach_testimonials`, {
      method: "POST",
      headers: { apikey: PCW_SUPABASE.anonKey, Authorization: `Bearer ${PCW_SUPABASE.anonKey}`, "Content-Type": "application/json" },
      body: "{}",
    }).then((r) => (r.ok ? r.json() : [])).then((rows) => {
      if (Array.isArray(rows) && rows.length) renderAvis(rows.concat(AVIS));
    }).catch(() => { /* la page reste complète sans les avis */ });
  }

  // Lien discret vers l'annuaire des coachs (site séparé), seulement s'il est en ligne.
  const dirUrl = String(window.PCW_DIRECTORY_URL || "");
  const footDir = document.getElementById("foot-annuaire");
  if (footDir && /^https:\/\//.test(dirUrl)) { footDir.querySelector("a").href = dirUrl; footDir.hidden = false; }

  // Bouton fixe sur téléphone : masqué tant que l'accroche ou le formulaire sont visibles.
  const cta = document.querySelector(".mobile-cta");
  const watched = [document.querySelector(".hero"), document.getElementById("contact")];
  const visible = new Set();
  new IntersectionObserver((entries) => {
    for (const en of entries) en.isIntersecting ? visible.add(en.target) : visible.delete(en.target);
    cta.classList.toggle("is-hidden", visible.size > 0);
  }, { threshold: 0.15 }).observe(watched[0]);
  // observe() ne prend qu'une cible à la fois
  new IntersectionObserver((entries) => {
    for (const en of entries) en.isIntersecting ? visible.add(en.target) : visible.delete(en.target);
    cta.classList.toggle("is-hidden", visible.size > 0);
  }, { threshold: 0.05 }).observe(watched[1]);
})();
