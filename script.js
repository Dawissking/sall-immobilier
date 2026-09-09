/* ============================================================
   Sall Immobilier — script.js
   Logo, navigation mobile, toggle thème clair/sombre
   ============================================================ */

const logoPath = "Logo.png";

/* ── Favicon du site ───────────────────────────────────────── */
function initFavicon() {
  if (!document.querySelector("link[rel*='icon']")) {
    const link = document.createElement("link");
    link.rel = "icon";
    link.type = "image/png";
    link.href = logoPath;
    document.head.appendChild(link);
  }
}
initFavicon();

/* ── Gestion du thème ──────────────────────────────────────── */
function getStoredTheme() {
  return localStorage.getItem("si-theme");
}

function applyTheme(theme) {
  if (theme === "light") {
    document.documentElement.setAttribute("data-theme", "light");
  } else if (theme === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
  } else {
    document.documentElement.removeAttribute("data-theme");
  }
}

function getEffectiveTheme() {
  const stored = getStoredTheme();
  if (stored) return stored;
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function initTheme() {
  const stored = getStoredTheme();
  if (stored) applyTheme(stored);
}

function toggleTheme() {
  const current = getEffectiveTheme();
  const next = current === "light" ? "dark" : "light";
  localStorage.setItem("si-theme", next);
  applyTheme(next);
  updateThemeIcon();
}

function updateThemeIcon() {
  const btn = document.getElementById("theme-toggle");
  if (!btn) return;
  const isDark = getEffectiveTheme() === "dark";
  btn.setAttribute("aria-label", isDark ? "Passer en mode clair" : "Passer en mode sombre");
  btn.textContent = isDark ? "☀️" : "🌙";
}

/* Appliquer le thème dès que possible */
initTheme();

/* ── Rendu du Header ───────────────────────────────────────── */
function renderHeader() {
  const headerRoot = document.querySelector("[data-site-header]");
  if (!headerRoot || !window.siteData) return;

  const page = document.body.dataset.page || "";

  const desktopNav = siteData.nav
    .map((item) => {
      const current = item.key === page ? ' aria-current="page"' : "";
      return `<a href="${item.href}"${current}>${item.label}</a>`;
    })
    .join("");

  const mobileNavLinks = siteData.nav
    .map((item) => {
      const current = item.key === page ? ' aria-current="page"' : "";
      return `<a href="${item.href}"${current}>${item.label}</a>`;
    })
    .join("");

  headerRoot.innerHTML = `
    <div class="header-bar fade-in">
      <a class="brand" href="index.html" aria-label="Accueil Sall Immobilier">
        <img src="${logoPath}" alt="Logo Sall Immobilier" />
        <div>
          <strong>${siteData.company.name}</strong>
          <span>${siteData.company.tagline}</span>
        </div>
      </a>
      <div class="header-nav">
        <nav class="nav" aria-label="Navigation principale">${desktopNav}</nav>
        <a class="button button-gold" href="${siteData.company.whatsappUrl}" target="_blank" rel="noreferrer" aria-label="Contacter sur WhatsApp">WhatsApp</a>
        <button class="theme-toggle" id="theme-toggle" type="button" aria-label="Changer le thème">☀️</button>
        <button class="nav-toggle" id="nav-toggle" type="button" aria-label="Ouvrir le menu" aria-expanded="false" aria-controls="nav-overlay">
          <span></span><span></span><span></span>
        </button>
      </div>
    </div>

    <div class="nav-overlay" id="nav-overlay" role="dialog" aria-modal="true" aria-label="Menu navigation">
      <div class="nav-overlay-header">
        <a class="nav-overlay-logo" href="index.html" aria-label="Accueil">
          <img src="${logoPath}" alt="Logo Sall Immobilier" />
          <strong>${siteData.company.name}</strong>
        </a>
        <button class="nav-close" id="nav-close" type="button" aria-label="Fermer le menu">✕</button>
      </div>
      <nav class="nav-mobile" aria-label="Navigation mobile">${mobileNavLinks}</nav>
      <div class="nav-mobile-cta">
        <a class="button button-gold" href="${siteData.company.whatsappUrl}" target="_blank" rel="noreferrer">💬 Ouvrir WhatsApp</a>
        <a class="button button-outline" href="tel:${siteData.company.phoneDial}">${siteData.company.phoneDisplay}</a>
      </div>
    </div>
  `;

  /* Attacher les événements */
  attachNavToggle();
  updateThemeIcon();

  const themeBtn = document.getElementById("theme-toggle");
  if (themeBtn) {
    themeBtn.addEventListener("click", toggleTheme);
  }
}

/* ── Logique du menu mobile ────────────────────────────────── */
function attachNavToggle() {
  const toggle = document.getElementById("nav-toggle");
  const overlay = document.getElementById("nav-overlay");
  const closeBtn = document.getElementById("nav-close");

  if (!toggle || !overlay) return;

  function openMenu() {
    overlay.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
    closeBtn && closeBtn.focus();
  }

  function closeMenu() {
    overlay.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
    toggle.focus();
  }

  toggle.addEventListener("click", () => {
    const isOpen = overlay.classList.contains("is-open");
    isOpen ? closeMenu() : openMenu();
  });

  closeBtn && closeBtn.addEventListener("click", closeMenu);

  /* Fermer au clic sur un lien dans l'overlay */
  overlay.querySelectorAll(".nav-mobile a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  /* Fermer avec la touche Escape */
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.classList.contains("is-open")) {
      closeMenu();
    }
  });

  /* Fermer si clic en dehors de l'overlay (sur le fond) */
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeMenu();
  });
}

/* ── Rendu du Footer ───────────────────────────────────────── */
function renderFooter() {
  const footerRoot = document.querySelector("[data-site-footer]");
  if (!footerRoot || !window.siteData) return;

  const links = siteData.nav
    .filter((item) => item.showInFooter !== false)
    .map((item) => `<a href="${item.href}">${item.label}</a>`)
    .join("");

  const social = siteData.company.social || {};
  const socialLinks = [];
  if (social.facebook) socialLinks.push(`<a href="${social.facebook}" target="_blank" rel="noreferrer" aria-label="Facebook"><svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></a>`);
  if (social.instagram) socialLinks.push(`<a href="${social.instagram}" target="_blank" rel="noreferrer" aria-label="Instagram"><svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg></a>`);
  if (social.tiktok) socialLinks.push(`<a href="${social.tiktok}" target="_blank" rel="noreferrer" aria-label="TikTok"><svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.73a8.19 8.19 0 004.76 1.52v-3.4a4.85 4.85 0 01-1-.16z"/></svg></a>`);
  if (social.linkedin) socialLinks.push(`<a href="${social.linkedin}" target="_blank" rel="noreferrer" aria-label="LinkedIn"><svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></a>`);

  const year = new Date().getFullYear();

  footerRoot.innerHTML = `
    <div class="footer-shell fade-in">
      <div class="footer-top">
        <div class="footer-brand">
          <img src="${logoPath}" alt="Logo Sall Immobilier" />
          <div>
            <strong>${siteData.company.name}</strong>
            <p class="footer-tagline">${siteData.company.tagline}</p>
          </div>
        </div>
        <nav class="footer-nav">${links}</nav>
        <div class="footer-contact-info">
          <a href="tel:${siteData.company.phoneDial}">${siteData.company.phoneDisplay}</a>
          <a href="${siteData.company.whatsappUrl}" target="_blank" rel="noreferrer">WhatsApp</a>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; ${year} ${siteData.company.name}. Tous droits réservés.</p>
        <div class="footer-social">${socialLinks.join("")}</div>
      </div>
    </div>
  `;
}

/* ── Rendu des annonces ────────────────────────────────────── */
function formatHighlights(items) {
  return items.map((item) => `<li>${item}</li>`).join("");
}

function createListingCard(listing) {
  return `
    <article class="listing-card fade-in">
      <span class="pill">${listing.category}</span>
      <h3>${listing.title}</h3>
      <div class="listing-price">${listing.price}</div>
      <div class="listing-meta">
        <span>📍 ${listing.location}</span>
        <span>📐 ${listing.surface}</span>
        <span>🟢 ${listing.status}</span>
      </div>
      <p>${listing.description}</p>
      <ul class="listing-highlights">${formatHighlights(listing.highlights)}</ul>
      <div class="listing-actions">
        <a class="button button-dark" href="demande-visite.html">Demander une visite</a>
        <a class="button button-outline" href="${siteData.company.whatsappUrl}" target="_blank" rel="noreferrer">WhatsApp</a>
      </div>
    </article>
  `;
}

function renderListings() {
  const listingRoots = document.querySelectorAll("[data-listings]");
  listingRoots.forEach((root) => {
    const key = root.dataset.listings;
    const items = siteData.listings[key] || [];
    root.innerHTML = items.map(createListingCard).join("");
  });
}

/* ── Rendu des articles conseils ───────────────────────────── */
function createArticleCard(article) {
  return `
    <article class="article-card fade-in">
      <span class="pill">${article.tag}</span>
      <h3>${article.title}</h3>
      <p>${article.summary}</p>
      <a class="text-link" href="contact.html">Demander un accompagnement →</a>
    </article>
  `;
}

function renderArticles() {
  const articleRoot = document.querySelector("[data-articles]");
  if (!articleRoot) return;
  articleRoot.innerHTML = siteData.articles.map(createArticleCard).join("");
}

/* ── Liens WhatsApp dynamiques ─────────────────────────────── */
function setDynamicLinks() {
  document.querySelectorAll("[data-whatsapp-link]").forEach((node) => {
    node.href = siteData.company.whatsappUrl;
    node.target = "_blank";
    node.rel = "noreferrer";
  });
}

/* ── Formulaires de contact ────────────────────────────────── */
function attachLeadForms() {
  document.querySelectorAll(".lead-form").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      const title = form.dataset.formTitle || "Demande de contact";
      const lines = [title];

      for (const [key, value] of formData.entries()) {
        if (!String(value).trim()) continue;
        const label = form.querySelector(`[name="${key}"]`)?.dataset?.label || key;
        lines.push(`${label}: ${value}`);
      }

      const text = encodeURIComponent(lines.join("\n"));
      window.open(`${siteData.company.whatsappUrl}?text=${text}`, "_blank", "noopener");
    });
  });
}

/* ── Initialisation ────────────────────────────────────────── */
renderHeader();
renderFooter();
renderListings();
renderArticles();
setDynamicLinks();
attachLeadForms();
