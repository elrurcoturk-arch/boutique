// Logique commune : chargement du catalogue, panier, paiement.
document.documentElement.classList.add("js");
// Filet de sécurité : si quelque chose échoue, tout s'affiche quand même.
setTimeout(() => document.querySelectorAll(".reveal").forEach((e) => e.classList.add("in")), 4000);
const Shop = (() => {
  let data = null;
  const KEY = "panier";

  const load = async () => {
    if (!data) data = await (await fetch("products.json")).json();
    return data;
  };
  const fmt = (n) => n.toLocaleString("fr-FR", { style: "currency", currency: (data?.boutique.devise || "eur").toUpperCase() });
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const getCart = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } };
  const saveCart = (c) => { try { localStorage.setItem(KEY, JSON.stringify(c)); } catch {} renderCart(); };
  const add = (id, qty = 1, btn) => {
    const c = getCart(); c[id] = Math.min(99, (c[id] || 0) + qty); saveCart(c); toast("Ajouté au panier ✓");
    document.querySelectorAll(".cart-btn .badge").forEach((b) => { b.classList.remove("bump"); void b.offsetWidth; b.classList.add("bump"); });
    if (btn) { const t = btn.textContent; btn.classList.add("done"); btn.textContent = "✓ Ajouté"; setTimeout(() => { btn.classList.remove("done"); btn.textContent = t; }, 1300); }
  };

  // Fait apparaître en douceur les éléments .reveal quand ils arrivent à l'écran.
  let io;
  const reveal = (root = document) => {
    const els = root.querySelectorAll(".reveal:not(.in)");
    if (!("IntersectionObserver" in window)) return els.forEach((e) => e.classList.add("in"));
    io ||= new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px" });
    els.forEach((e) => io.observe(e));
  };
  const setQty = (id, qty) => { const c = getCart(); if (qty <= 0) delete c[id]; else c[id] = Math.min(99, qty); saveCart(c); };
  const clear = () => saveCart({});

  const toast = (msg) => {
    let t = document.querySelector(".toast");
    if (!t) { t = document.createElement("div"); t.className = "toast"; document.body.appendChild(t); }
    t.textContent = msg; t.classList.add("show");
    clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove("show"), 1800);
  };

  const totals = () => {
    const c = getCart(); const b = data.boutique;
    const lines = Object.entries(c).map(([id, q]) => ({ p: data.produits.find((p) => p.id === id), q })).filter((l) => l.p);
    const sub = lines.reduce((s, l) => s + l.p.prix * l.q, 0);
    const ship = sub === 0 || sub >= b.livraisonGratuiteDes ? 0 : b.fraisLivraison;
    return { lines, sub, ship, total: sub + ship, count: lines.reduce((s, l) => s + l.q, 0) };
  };

  // Carte produit réutilisée par l'accueil et la fiche produit.
  const card = (p) => {
    const url = `produit.html?id=${encodeURIComponent(p.id)}`;
    const promo = p.ancienPrix && p.ancienPrix > p.prix;
    const tag = !p.stock ? `<span class="tag">Épuisé</span>` : p.badge ? `<span class="tag ${promo ? "promo" : ""}">${esc(p.badge)}</span>` : "";
    const btn = (cls) => p.stock ? `<button class="btn dark ${cls}" data-add="${esc(p.id)}">Ajouter au panier</button>` : "";
    return `<article class="card reveal">
      <a class="img" href="${url}">${tag}<img src="${esc(p.image)}" alt="${esc(p.nom)}" loading="lazy">${btn("quick")}</a>
      <div class="body">
        <div class="cat">${esc(p.categorie)}</div>
        <h3><a href="${url}">${esc(p.nom)}</a></h3>
        <span class="price">${fmt(p.prix)}</span>${promo ? `<span class="old">${fmt(p.ancienPrix)}</span>` : ""}
        ${btn("mob")}
      </div>
    </article>`;
  };

  const renderCart = () => {
    if (!data) return;
    const t = totals(); const b = data.boutique;
    document.querySelectorAll("[data-count]").forEach((el) => { el.textContent = t.count; el.hidden = !t.count; });
    const box = document.querySelector(".items");
    if (!box) return;
    const reste = b.livraisonGratuiteDes - t.sub;
    document.querySelector(".progress").innerHTML = t.count
      ? `${reste > 0 ? `Plus que <b>${fmt(reste)}</b> pour la livraison offerte` : `🎉 La livraison est <b>offerte</b>`}<div class="bar"><i style="width:${Math.min(100, (t.sub / b.livraisonGratuiteDes) * 100)}%"></i></div>`
      : "";
    box.innerHTML = t.lines.length ? t.lines.map(({ p, q }) => `
      <div class="item">
        <img src="${esc(p.image)}" alt="">
        <div><div class="n">${esc(p.nom)}</div><div class="muted">${fmt(p.prix)}</div>
          <div class="qty" style="margin-top:8px"><button data-dec="${esc(p.id)}" aria-label="Moins">−</button><span>${q}</span><button data-inc="${esc(p.id)}" aria-label="Plus">+</button></div></div>
        <div style="text-align:right"><div class="n">${fmt(p.prix * q)}</div><button class="rm" data-rm="${esc(p.id)}">Retirer</button></div>
      </div>`).join("") : `<div class="empty"><div class="big">🛍️</div><p>Votre panier est vide.</p><button class="btn" data-close>Découvrir la boutique</button></div>`;
    document.querySelector(".foot").innerHTML = t.count ? `
      <div class="line"><span>Sous-total</span><span>${fmt(t.sub)}</span></div>
      <div class="line"><span>Livraison</span><span>${t.ship ? fmt(t.ship) : "Offerte"}</span></div>
      <div class="line total"><span>Total TTC</span><span>${fmt(t.total)}</span></div>
      <button class="btn" id="pay">🔒 Payer en toute sécurité</button>
      <div class="muted" style="text-align:center">Carte bancaire · Apple Pay · Google Pay — paiement sécurisé par Stripe</div>
      <div class="muted" style="text-align:center">Livraison estimée : ${esc(b.delaiLivraison)}</div>
      <div class="err" id="payerr"></div>` : "";
    const pay = document.getElementById("pay");
    if (pay) pay.onclick = checkout;
  };

  const checkout = async () => {
    const btn = document.getElementById("pay"), err = document.getElementById("payerr");
    btn.disabled = true; btn.textContent = "Redirection vers le paiement…"; err.textContent = "";
    try {
      const items = Object.entries(getCart()).map(([id, quantity]) => ({ id, quantity }));
      const r = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.url) throw new Error(j.error || "Le paiement n'est pas encore activé sur cette boutique.");
      location.href = j.url;
    } catch (e) {
      err.textContent = e.message; btn.disabled = false; btn.textContent = "🔒 Payer en toute sécurité";
    }
  };

  const openCart = (open) => {
    document.querySelector(".drawer").classList.toggle("open", open);
    document.querySelector(".overlay").classList.toggle("open", open);
  };

  // Construit l'en-tête, le panier et le pied de page sur chaque page.
  const init = async () => {
    await load();
    const b = data.boutique;
    document.title = document.title ? `${document.title} · ${b.nom}` : `${b.nom} · ${b.slogan}`;
    const cats = [...new Set(data.produits.map((p) => p.categorie))];
    document.body.insertAdjacentHTML("afterbegin", `
      <div class="banner">✦ Livraison offerte dès ${fmt(b.livraisonGratuiteDes)} · Retours sous ${b.retours} jours ✦</div>
      <header class="top"><div class="wrap">
        <a class="logo" href="index.html">${esc(b.nom)}</a>
        <nav class="menu"><a href="index.html#boutique">Boutique</a>${cats.slice(0, 3).map((c) => `<a href="index.html?cat=${encodeURIComponent(c)}#boutique">${esc(c)}</a>`).join("")}<a href="index.html#faq">Aide</a></nav>
        <button class="cart-btn" data-open>Panier <span class="badge" data-count hidden>0</span></button>
      </div></header>`);
    document.body.insertAdjacentHTML("beforeend", `
      <footer><div class="wrap">
        <div class="cols">
          <div><a class="logo" href="index.html">${esc(b.nom)}</a><p style="max-width:28em">${esc(b.slogan)}</p>
            <div class="pay"><span>VISA</span><span>Mastercard</span><span>CB</span><span>Apple Pay</span><span>Google Pay</span></div></div>
          <div><h4>Boutique</h4>${cats.map((c) => `<a href="index.html?cat=${encodeURIComponent(c)}#boutique">${esc(c)}</a>`).join("")}</div>
          <div><h4>Informations</h4><a href="index.html#faq">Questions fréquentes</a><a href="cgv.html">Livraison & retours (CGV)</a><a href="mentions.html">Mentions légales</a><a href="confidentialite.html">Confidentialité</a><a href="mailto:${esc(b.email)}">Nous contacter</a></div>
        </div>
        <div class="legal"><span>© ${new Date().getFullYear()} ${esc(b.nom)}. Tous droits réservés.</span><span>Paiements sécurisés par Stripe</span></div>
      </div></footer>
      <div class="overlay" data-close></div>
      <aside class="drawer" aria-label="Panier"><div class="dh"><h2>Votre panier</h2><button class="x" data-close aria-label="Fermer">×</button></div>
        <div class="progress"></div><div class="items"></div><div class="foot"></div></aside>`);
    document.addEventListener("click", (e) => {
      const el = e.target.closest("[data-open],[data-close],[data-add],[data-inc],[data-dec],[data-rm]");
      if (!el) return;
      const d = el.dataset;
      if ("open" in d) openCart(true);
      else if ("close" in d) openCart(false);
      else if (d.add) { e.preventDefault(); add(d.add, Number(d.qty || 1), el); }
      else if (d.inc) setQty(d.inc, (getCart()[d.inc] || 0) + 1);
      else if (d.dec) setQty(d.dec, (getCart()[d.dec] || 0) - 1);
      else if (d.rm) setQty(d.rm, 0);
    });
    document.addEventListener("keydown", (e) => e.key === "Escape" && openCart(false));
    const head = document.querySelector("header.top");
    addEventListener("scroll", () => head.classList.toggle("scrolled", scrollY > 10), { passive: true });
    renderCart();
    return data;
  };

  return { init, fmt, esc, card, clear, openCart, reveal };
})();
