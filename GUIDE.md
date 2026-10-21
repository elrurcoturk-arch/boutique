# Mettre ta boutique en ligne et encaisser l'argent

Ta boutique est complète : catalogue, fiches produits, panier, paiement par carte (CB, Apple Pay, Google Pay), frais de livraison, page de confirmation, version mobile. Il te reste 3 étapes, environ 30 minutes, tout est gratuit (Stripe prend seulement une commission sur chaque vente, environ 1,5 % + 0,25 € par carte européenne).

---

## Étape 1 : Mettre tes produits (5 min)

Tout se règle dans **un seul fichier : `products.json`**.

- `nom`, `slogan`, `email` : le nom de ta boutique, ta phrase d'accroche, ton e-mail de contact.
- `livraisonGratuiteDes` : montant à partir duquel la livraison est offerte (ex. `50`).
- `fraisLivraison` : prix de la livraison en dessous de ce montant (ex. `4.9`).
- `paysLivraison` : pays où tu livres (FR = France, BE = Belgique, CH = Suisse, LU = Luxembourg).
- Pour chaque produit : `id` (sans espace ni accent), `nom`, `prix` (avec un point : `24.9`), `categorie`, `image`, `description`, `stock` (`true` = en vente, `false` = rupture).

**Photos** : mets tes photos (format carré de préférence) dans le dossier `images/` et écris leur nom dans `image`, par exemple `"images/ma-photo.jpg"`.

Pour ajouter un produit, copie une ligne `{ ... },` existante et modifie-la. Attention aux virgules : chaque produit est séparé par une virgule, sauf le dernier.

Pense aussi à compléter **`mentions.html`** (ton nom, SIRET, adresse) : c'est obligatoire en France pour vendre en ligne.

---

## Étape 2 : Créer ton compte Stripe (10 min)

Stripe est le service qui encaisse les paiements et les vire sur ton compte bancaire.

1. Va sur **https://dashboard.stripe.com/register** et crée ton compte.
2. Clique sur **« Activer les paiements »** et remplis : ton identité, ton statut (particulier, micro-entreprise…), ton **IBAN** (là où l'argent arrivera).
3. Va dans **Développeurs → Clés API** (https://dashboard.stripe.com/apikeys).
4. Copie la **Clé secrète** (elle commence par `sk_live_...`).

⚠️ Cette clé est comme le mot de passe de ta caisse : **ne la donne à personne, ne la colle dans aucun chat, ni dans les fichiers du site.** Tu la colleras uniquement dans Vercel à l'étape 3.

💡 Pour tester sans vrai argent d'abord : active le **mode test** dans Stripe (bouton en haut à droite) et prends la clé `sk_test_...`. Paie avec la carte de test `4242 4242 4242 4242`, n'importe quelle date future et n'importe quel code. Quand tout marche, remplace par la clé `sk_live_...`.

---

## Étape 3 : Mettre le site en ligne gratuitement avec Vercel (10 min)

1. Crée un compte sur **https://vercel.com/signup** (le plus simple : « Continue with GitHub »).
2. Mets le dossier `boutique` sur GitHub (je peux le faire pour toi si tu me le demandes), puis dans Vercel clique **Add New → Project** et choisis ce dépôt.
   - Sans GitHub : installe l'outil Vercel (`npm i -g vercel`) puis lance `vercel` dans le dossier `boutique`.
3. Avant de cliquer **Deploy**, ouvre **Environment Variables** et ajoute :
   - Nom : `STRIPE_SECRET_KEY`
   - Valeur : ta clé secrète Stripe
4. Clique **Deploy**. Ton site est en ligne sur une adresse du type `ta-boutique.vercel.app`.

Si tu ajoutes la clé après le déploiement : **Settings → Environment Variables**, puis **Deployments → … → Redeploy**.

**Nom de domaine perso** (ex. `maboutique.fr`, environ 10 €/an) : dans Vercel, **Settings → Domains**.

---

## Au quotidien

- **Tes commandes** : dans Stripe → **Paiements**. Tu y vois le client, son adresse de livraison, son téléphone et ce qu'il a acheté. Stripe envoie aussi un reçu au client si tu actives **Paramètres → E-mails clients → Paiements réussis**.
- **Recevoir un e-mail à chaque vente** : Stripe → Paramètres → Notifications → active « Paiements réussis ».
- **Ton argent** : Stripe vire automatiquement tes ventes sur ton compte bancaire (premier virement après environ 7 jours, puis tous les quelques jours).
- **Rembourser** : dans Stripe, ouvre le paiement → **Rembourser**.
- **Modifier un prix ou un produit** : modifie `products.json` sur GitHub, Vercel met le site à jour tout seul en 1 minute.

## Sécurité

Les prix sont vérifiés côté serveur : un petit malin ne peut pas modifier le prix dans son navigateur pour payer moins cher. Aucune donnée bancaire ne passe par ton site, tout est géré par Stripe.
