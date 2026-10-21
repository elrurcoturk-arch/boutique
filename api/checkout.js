// Fonction serveur (Vercel) : crée une session de paiement Stripe Checkout.
// Les prix sont relus ici depuis products.json : un client ne peut pas les modifier.
const catalogue = require("../products.json");

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "Méthode non autorisée" });

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return res.status(503).json({ error: "Paiement pas encore activé : ajoutez STRIPE_SECRET_KEY dans les réglages de l'hébergeur." });

  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
  const items = Array.isArray(body.items) ? body.items : [];
  const { boutique, produits } = catalogue;
  const devise = boutique.devise || "eur";

  const params = new URLSearchParams();
  let sous_total = 0, n = 0;
  for (const it of items) {
    const p = produits.find((x) => x.id === it.id);
    const q = Math.floor(Number(it.quantity));
    if (!p || !p.stock || !(q >= 1 && q <= 99)) continue;
    const base = `line_items[${n}]`;
    params.append(`${base}[quantity]`, q);
    params.append(`${base}[price_data][currency]`, devise);
    params.append(`${base}[price_data][unit_amount]`, Math.round(p.prix * 100));
    params.append(`${base}[price_data][product_data][name]`, p.nom);
    sous_total += p.prix * q; n++;
  }
  if (!n) return res.status(400).json({ error: "Panier vide ou produits indisponibles." });

  const origin = process.env.SITE_URL || `https://${req.headers.host}`;
  const livraison = sous_total >= boutique.livraisonGratuiteDes ? 0 : boutique.fraisLivraison;
  params.append("mode", "payment");
  params.append("success_url", `${origin}/succes.html?session_id={CHECKOUT_SESSION_ID}`);
  params.append("cancel_url", `${origin}/index.html`);
  params.append("locale", "fr");
  params.append("phone_number_collection[enabled]", "true");
  (boutique.paysLivraison || ["FR"]).forEach((c, i) => params.append(`shipping_address_collection[allowed_countries][${i}]`, c));
  params.append("shipping_options[0][shipping_rate_data][type]", "fixed_amount");
  params.append("shipping_options[0][shipping_rate_data][display_name]", livraison ? "Livraison standard" : "Livraison offerte");
  params.append("shipping_options[0][shipping_rate_data][fixed_amount][amount]", Math.round(livraison * 100));
  params.append("shipping_options[0][shipping_rate_data][fixed_amount][currency]", devise);

  try {
    const r = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/x-www-form-urlencoded" },
      body: params,
    });
    const j = await r.json();
    if (!r.ok) {
      console.error("Stripe:", j.error);
      return res.status(502).json({ error: "Le paiement est momentanément indisponible. Réessayez dans un instant." });
    }
    return res.status(200).json({ url: j.url });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Erreur serveur, réessayez." });
  }
};
