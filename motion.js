// Animations de la page de vente PCW Padel Coach.
// Tout est décoratif : sans ce fichier (ou avec « réduire les animations »), la page reste complète.
(() => {
  "use strict";
  const root = document.documentElement;
  if (!root.classList.contains("anim")) return;
  window.__motion = true;
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;

  // ---------- Titre : découpe en mots pour une entrée mot à mot ----------
  const h1 = document.querySelector(".hero h1");
  if (h1) {
    let i = 0;
    const walk = (node) => {
      for (const child of Array.from(node.childNodes)) {
        if (child.nodeType === 3) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            const w = document.createElement("span");
            w.className = "w"; w.style.setProperty("--i", i++); w.textContent = part;
            frag.appendChild(w);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === 1 && child.tagName !== "BR") walk(child);
      }
    };
    walk(h1);
    h1.classList.add("is-split");
  }
  // Lance l'entrée de l'accroche au prochain affichage.
  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add("is-loaded")));

  // ---------- Compteurs ----------
  const fmt = new Intl.NumberFormat("fr-FR");
  const countUp = (el, to, suffix, dur = 1200, grouped = false) => {
    const start = performance.now();
    const step = (t) => {
      const k = Math.min(1, (t - start) / dur);
      const e = 1 - Math.pow(1 - k, 3);
      const v = Math.round(to * e);
      el.textContent = (grouped ? fmt.format(v) : v) + suffix;
      if (k < 1) requestAnimationFrame(step);
    };
    el.textContent = "0" + suffix;
    requestAnimationFrame(step);
  };
  const counterOf = (el) => {
    const m = el.textContent.match(/^(\d+)(.*)$/s);
    return m && +m[1] > 0 ? { to: +m[1], suffix: m[2] } : null;
  };
  // Chiffres de l'accroche, une fois le texte apparu.
  $$(".hero__proof b").forEach((b, k) => {
    const c = counterOf(b);
    if (!c) return;
    b.textContent = "0" + c.suffix;
    setTimeout(() => countUp(b, c.to, c.suffix, 1100), 1050 + k * 120);
  });

  // ---------- Apparition au défilement ----------
  const mark = (els, type, stagger = 0, base = 0) => els.forEach((el, k) => {
    if (el.hasAttribute("data-reveal")) return;
    el.setAttribute("data-reveal", type);
    el.style.setProperty("--d", `${base + k * stagger}ms`);
  });
  $$(".sec").forEach((sec) => mark($$(".kicker, .h2", sec), "up", 90));
  mark($$(".pain"), "up", 130, 100);
  mark($$(".video-stage"), "up");
  mark($$("#video .center"), "up", 0, 150);
  $$(".feat").forEach((f) => {
    const rev = f.classList.contains("feat--rev");
    mark($$(".h3", f), rev ? "right" : "left");
    mark($$(".checks li", f), "up", 70, 120);
    mark($$(".feat__media", f), rev ? "left" : "right", 0, 150);
  });
  $$(".wide").forEach((w) => { mark($$(".wide__text", w), "left"); mark($$(".browser", w), "tilt", 0, 120); });
  mark($$(".mini"), "pop", 100);
  mark($$(".steps li"), "up", 180, 100);
  mark($$(".price"), "up");
  mark($$(".checks--price li"), "up", 45, 300);
  mark($$(".price__math"), "zoom", 0, 500);
  mark($$(".faq details"), "up", 55);
  mark($$(".contact__intro"), "left");
  mark($$(".contact__list li"), "left", 110, 300);
  mark($$("#lead-form"), "right", 0, 120);

  const io = new IntersectionObserver((entries) => {
    for (const en of entries) {
      if (!en.isIntersecting) continue;
      const el = en.target;
      el.classList.add("is-in");
      io.unobserve(el);
      // Après l'entrée, plus de délai : les survols restent instantanés.
      const d = parseFloat(el.style.getPropertyValue("--d")) || 0;
      setTimeout(() => el.style.setProperty("--d", "0ms"), d + 1300);
      const stat = el.querySelector(".fx-stat b[data-count]");
      if (stat) setTimeout(() => countUp(stat, +stat.dataset.count, " €", 1400, true), 700);
      if (el.classList.contains("price")) {
        const span = el.querySelector(".price__amount span");
        const c = span && counterOf(span);
        if (c) setTimeout(() => countUp(span, c.to, c.suffix, 1300), 250);
      }
    }
  }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
  $$("[data-reveal]").forEach((el) => io.observe(el));

  // ---------- Barre de progression et en-tête ----------
  const bar = document.querySelector(".progress");
  const top = document.querySelector(".top");
  let ticking = false;
  const clamp = (v) => Math.max(0, Math.min(1, v));
  const video = document.querySelector(".video");
  const steps = document.querySelector(".steps");
  const stepItems = steps ? $$("li", steps) : [];
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const max = document.documentElement.scrollHeight - innerHeight;
      bar.style.setProperty("--p", max > 0 ? (scrollY / max).toFixed(4) : 0);
      top.classList.toggle("is-scrolled", scrollY > 20);
      // Vidéo : s'agrandit en arrivant au centre de l'écran.
      if (video) {
        const r = video.getBoundingClientRect();
        video.style.setProperty("--vp", clamp((innerHeight - r.top) / (innerHeight * 0.65)).toFixed(3));
      }
      // Étapes : la ligne se remplit au fil du défilement et allume chaque étape.
      if (steps) {
        const r = steps.getBoundingClientRect();
        const sp = clamp((innerHeight * 0.78 - r.top) / (r.height * 0.75));
        steps.style.setProperty("--sp", sp.toFixed(3));
        const n = stepItems.length;
        stepItems.forEach((li, k) => li.classList.toggle("is-active", sp >= (n > 1 ? k / (n - 1) : 0) - 0.02 && sp > 0.02));
      }
      ticking = false;
    });
  };
  addEventListener("scroll", onScroll, { passive: true });
  // Téléphone : fin de la ligne verticale sur le dernier numéro.
  const setLineEnd = () => {
    if (!steps || !stepItems.length) return;
    const last = stepItems[stepItems.length - 1];
    steps.style.setProperty("--lend", `${steps.offsetHeight - (last.offsetTop + 49)}px`);
  };
  addEventListener("resize", () => { setLineEnd(); onScroll(); });
  setLineEnd();
  onScroll();

  // ---------- Téléphones de l'accroche qui suivent la souris ----------
  const phones = document.querySelector(".hero__phones");
  const hero = document.querySelector(".hero");
  if (phones && hero && finePointer) {
    hero.addEventListener("pointermove", (e) => {
      const r = hero.getBoundingClientRect();
      phones.style.setProperty("--mx", (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
      phones.style.setProperty("--my", (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3));
    });
    hero.addEventListener("pointerleave", () => { phones.style.setProperty("--mx", 0); phones.style.setProperty("--my", 0); });
  }

  // ---------- Téléphones des fonctions : inclinaison 3D au survol ----------
  if (finePointer) {
    $$(".feat__media").forEach((fig) => {
      fig.addEventListener("pointermove", (e) => {
        const r = fig.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        fig.style.transition = "transform .15s ease-out";
        fig.style.transform = `perspective(900px) rotateY(${(x * 14).toFixed(2)}deg) rotateX(${(-y * 10).toFixed(2)}deg)`;
      });
      fig.addEventListener("pointerleave", () => { fig.style.transition = "transform .6s cubic-bezier(.2,.75,.2,1)"; fig.style.transform = ""; });
    });
  }

  // ---------- Carte de notification : plusieurs messages à la suite ----------
  const card = document.querySelector(".float-card");
  if (card) {
    const icon = card.querySelector(".float-card__icon");
    const text = card.querySelector(".float-card__text");
    const msgs = [
      { cls: "", icon: "✓", title: "Nouvelle réservation", sub: "Mardi 19 h 30 · Coaching individuel" },
      { cls: "float-card--star", icon: "★", title: "Nouvel avis 5/5", sub: "« Super séance, merci ! » · Léa F." },
      { cls: "float-card--bell", icon: "⏰", title: "Rappel envoyé", sub: "Demain 10 h · Lucas P." },
      { cls: "float-card--euro", icon: "€", title: "1 840 € ce mois-ci", sub: "dont 320 € à encaisser" },
    ];
    let n = 0;
    const swap = () => {
      if (document.hidden) return;
      card.classList.add("is-swapping");
      setTimeout(() => {
        n = (n + 1) % msgs.length;
        const m = msgs[n];
        card.classList.remove("float-card--star", "float-card--bell", "float-card--euro");
        if (m.cls) card.classList.add(m.cls);
        icon.textContent = m.icon;
        text.innerHTML = "";
        const b = document.createElement("b"); b.textContent = m.title;
        const s = document.createElement("small"); s.textContent = m.sub;
        text.append(b, s);
        card.classList.remove("is-swapping");
      }, 320);
    };
    setTimeout(() => setInterval(swap, 3400), 1800);
  }
})();
