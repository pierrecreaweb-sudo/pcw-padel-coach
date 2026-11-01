// Page de vente PCW Padel Coach.
// Les demandes du formulaire sont envoyées par email via Web3Forms (gratuit, sans serveur).
// Clé d'accès : à créer sur https://web3forms.com avec l'adresse qui doit recevoir les demandes.
const WEB3FORMS_KEY = "4273a7e4-66ef-4071-9618-dbbcfd80f02b";

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
    play.addEventListener("click", () => { play.hidden = true; vid.controls = true; vid.play().catch(showOverlay); vid.focus(); });
    vid.addEventListener("play", () => { play.hidden = true; vid.controls = true; });
    vid.addEventListener("ended", showOverlay);
  }

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
