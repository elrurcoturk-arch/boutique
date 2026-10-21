// Logique commune : chargement du catalogue, panier, paiement.
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
  const add = (id, qty = 1) => { const c = getCart(); c[id] = Math.min(99, (c[id] || 0) + qty); saveCart(c); toast("Ajouté au panier"); };
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

  const renderCart = () => {
    if (!data) return;
    const t = totals();
    document.querySelectorAll("[data-count]").forEach((el) => { el.textContent = t.count; el.hidden = !t.count; });
    const box = document.querySelector(".items");
    if (!box) return;
    box.innerHTML = t.lines.length ? t.lines.map(({ p, q }) => `
      <div class="item">
        <img src="${esc(p.image)}" alt="">
        <div><div class="n">${esc(p.nom)}</div><div class="muted">${fmt(p.prix)}</div>
          <div class="qty" style="margin-top:6px"><button data-dec="${esc(p.id)}" aria-label="Moins">−</button><span>${q}</span><button data-inc="${esc(p.id)}" aria-label="Plus">+</button></div></div>
        <div style="text-align:right"><div class="n">${fmt(p.prix * q)}</div><button class="rm" data-rm="${esc(p.id)}">Retirer</button></div>
      </div>`).join("") : `<div class="empty">Votre panier est vide.</div>`;
    const b = data.boutique;
    document.querySelector(".foot").innerHTML = `
      <div class="line"><span>Sous-total</span><span>${fmt(t.sub)}</span></div>
      <div class="line"><span>Livraison</span><span>${t.ship ? fmt(t.ship) : "Offerte"}</span></div>
      ${t.sub && t.sub < b.livraisonGratuiteDes ? `<div class="muted">Plus que ${fmt(b.livraisonGratuiteDes - t.sub)} pour la livraison offerte</div>` : ""}
      <div class="line total"><span>Total</span><span>${fmt(t.total)}</span></div>
      <button class="btn" id="pay" ${t.count ? "" : "disabled"}>Payer en toute sécurité</button>
      <div class="muted center">Paiement sécurisé par Stripe · CB, Apple Pay, Google Pay</div>
      <div class="err" id="payerr"></div>`;
    document.getElementById("pay").onclick = checkout;
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
      err.textContent = e.message; btn.disabled = false; btn.textContent = "Payer en toute sécurité";
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
    document.title = document.title ? `${document.title} · ${b.nom}` : b.nom;
    document.body.insertAdjacentHTML("afterbegin", `
      <div class="banner">Livraison offerte dès ${fmt(b.livraisonGratuiteDes)} d'achat</div>
      <header><div class="wrap"><a class="logo" href="index.html">${esc(b.nom)}</a>
        <button class="cart-btn" data-open>Panier<span class="badge" data-count hidden>0</span></button></div></header>`);
    document.body.insertAdjacentHTML("beforeend", `
      <footer><div class="wrap"><span>© ${new Date().getFullYear()} ${esc(b.nom)}</span>
        <span><a href="mentions.html">Mentions légales & CGV</a> · <a href="mailto:${esc(b.email)}">${esc(b.email)}</a></span></div></footer>
      <div class="overlay" data-close></div>
      <aside class="drawer" aria-label="Panier"><header><h2>Votre panier</h2><button class="x" data-close aria-label="Fermer">×</button></header>
        <div class="items"></div><div class="foot"></div></aside>`);
    document.addEventListener("click", (e) => {
      const d = e.target.dataset;
      if ("open" in d) openCart(true);
      else if ("close" in d) openCart(false);
      else if (d.add) { add(d.add, Number(d.qty || 1)); }
      else if (d.inc) setQty(d.inc, (getCart()[d.inc] || 0) + 1);
      else if (d.dec) setQty(d.dec, (getCart()[d.dec] || 0) - 1);
      else if (d.rm) setQty(d.rm, 0);
    });
    document.addEventListener("keydown", (e) => e.key === "Escape" && openCart(false));
    renderCart();
    return data;
  };

  return { init, fmt, esc, clear, openCart };
})();
