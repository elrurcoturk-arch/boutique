# Lancer ta boutique en dropshipping, dans les règles

Ta boutique NOVA est prête techniquement (site en ligne, paiement Stripe en mode test). Ce guide explique ce qu'il reste à faire pour vendre de vrais produits en dropshipping, légalement.

> ⚠️ Les 8 produits actuellement sur le site sont des **exemples de design**. Il faut les remplacer par de vrais produits de ton fournisseur **avant** de passer Stripe en mode réel.

---

## 1. Comment ça marche, concrètement

1. Un client paie sur ton site → l'argent arrive sur ton compte Stripe.
2. Tu reçois un e-mail de Stripe avec le produit commandé et l'adresse du client.
3. Tu commandes ce produit chez ton fournisseur (CJ Dropshipping) en mettant **l'adresse du client**, et tu le paies au prix fournisseur.
4. Le fournisseur expédie directement chez le client et te donne un numéro de suivi.
5. Tu envoies ce numéro de suivi au client par e-mail.

Ton bénéfice = prix de vente − prix fournisseur − frais de livraison fournisseur − commission Stripe (~1,5 % + 0,25 €).

**Temps nécessaire :** environ 5 minutes par commande.

---

## 2. Niche conseillée : la déco maison « cosy »

Pourquoi : le site est déjà designé pour ça, les produits sont légers (livraison pas chère), peu fragiles, sans taille à gérer, et on peut se faire une bonne marge (×2,5 à ×3).

**À éviter quand on débute :**
- **Appareils électriques** (lampes, diffuseurs électriques…) : il faut le marquage CE et des notices en français, sinon c'est toi qui es responsable.
- **Cosmétiques, compléments, produits pour bébés** : réglementation très stricte.
- **Copies de marques** (Nike, Disney…) : c'est de la contrefaçon, interdit.

**Bons exemples de produits :** vases en céramique, plaids, housses de coussin, bougies, diffuseurs à bâtonnets (non électriques), mugs, carafes, fleurs séchées, cadres, paniers en osier.

---

## 3. Fournisseur conseillé : CJ Dropshipping

- Inscription gratuite sur **cjdropshipping.com** (le plan gratuit suffit).
- **Entrepôts en Europe** (Allemagne + partenaires) : livraison vers la France en **3 à 7 jours** environ, au lieu de 2 à 3 semaines depuis la Chine.
- Comme la marchandise part de l'UE, **pas de frais de douane surprise** pour tes clients.

**Pour choisir tes produits :**
1. Crée ton compte CJ.
2. Cherche un produit (ex. « ceramic vase »), puis filtre par **entrepôt : Germany / France / Europe**.
3. Prends 6 à 10 produits qui vont bien ensemble.
4. **Commande-toi 1 ou 2 échantillons** pour vérifier la qualité avant de vendre. C'est ce que font les vendeurs sérieux.
5. Envoie-moi les liens CJ (ou des captures avec le prix, les photos et la description). Je les mets sur le site avec des prix de vente qui te laissent une marge.

---

## 4. Ce que la loi demande (France)

1. **Un statut** : la micro-entreprise suffit. Inscription gratuite sur **autoentrepreneur.urssaf.fr** (activité : vente de marchandises en ligne). Tu reçois un **SIRET**.
2. **Compléter les pages légales du site** (`mentions.html`, `cgv.html`, `confidentialite.html`) : remplace tout ce qui est entre [crochets] par ton nom, ton adresse, ton SIRET…
3. **Un médiateur de la consommation** : c'est obligatoire. Il y a des offres à partir d'environ 50 € par an (CM2C, Medicys…). Mets son nom dans les CGV.
4. **Des délais de livraison honnêtes** : le site affiche « 7 à 12 jours ouvrés ». Ajuste-les dans `products.json` (`delaiLivraison`) selon ce que ton fournisseur annonce.
5. **Le droit de retour de 14 jours** : tu dois l'accepter, même si c'est le fournisseur qui expédie. Prévois une adresse de retour (la tienne, ou celle que CJ te donne).
6. **Tu es responsable** des produits que tu vends : descriptions exactes, pas de fausses promos, pas de faux avis.
7. **Déclarer ton chiffre d'affaires** chaque mois ou trimestre sur le site de l'URSSAF.

*Ce guide n'est pas un avis juridique. En cas de doute, renseigne-toi auprès de l'URSSAF ou d'un expert-comptable.*

---

## 5. Passer en mode réel (encaisser de vrai argent)

Quand les vrais produits sont en ligne et les pages légales remplies :
1. Dans Stripe, clique **Activer votre compte** et complète ton profil (identité, SIRET, IBAN).
2. Désactive le **mode test**, puis va dans **Développeurs → Clés API** et crée une clé secrète `sk_live_...`.
3. Sur Vercel : **Settings → Environment Variables**, remplace la valeur de `STRIPE_SECRET_KEY` par la clé `sk_live_...`, puis **Deployments → ⋯ → Redeploy**.
4. Dans Stripe → **Paramètres → E-mails clients**, active l'envoi des reçus. Dans **Notifications**, active l'e-mail à chaque paiement réussi.

C'est fini : chaque vente arrive sur ton compte Stripe, et Stripe te vire l'argent sur ton compte bancaire.
