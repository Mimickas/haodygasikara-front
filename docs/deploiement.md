# Déploiement sur le serveur de test

Ce guide met en ligne **Haodygasikara** (site React + API Spring Boot + base
PostgreSQL/PostGIS) sur un serveur Linux, par exemple Ubuntu 22.04 ou 24.04.
Les fichiers cités se trouvent dans le dossier `deploiement/` de ce dépôt.

La procédure a été rejouée de bout en bout sur une base **neuve** : le jar de
production crée le schéma, le jeu de démonstration se charge, le site
fonctionne derrière un relais `/api` et la session survit à un rechargement.

---

## 1. Architecture

```
Navigateur ──HTTPS──▶ nginx ─┬─ /        → fichiers du site (build Vite)
                             └─ /api/…   → API Spring Boot (127.0.0.1:8000)
                                              │
                                              ├─ PostgreSQL 16 + PostGIS
                                              ├─ Cloudinary (images, vidéos)
                                              ├─ SMTP Gmail (e-mails, PDF joint)
                                              └─ Google (connexion, facultatif)
```

Le site et l'API partagent **un seul domaine** : le site appelle `/api`
(même origine). Pas de réglage CORS, et le cookie de session
(`HttpOnly`, `SameSite=Lax`, chemin `/api/auth/refresh`) reste un cookie
« maison ».

Sur Render, où le site et l'API sont deux services d'adresses différentes, cette
condition n'est PAS remplie d'office — voir le § 9 bis, qui explique pourquoi et
comment la rétablir.

Les cartes utilisent Mapbox (jeton public dans le build du site).

## 2. Prérequis sur le serveur

```bash
sudo apt update
sudo apt install -y openjdk-21-jre-headless nginx postgresql postgresql-16-postgis-3 certbot python3-certbot-nginx
```

Pour construire (sur le serveur ou sur un poste) : **Java 21 + Maven 3.9**
pour l'API, **Node 20+** pour le site.

## 3. La base de données

```bash
sudo -u postgres psql <<'SQL'
CREATE USER haodygasikara WITH PASSWORD 'un-mot-de-passe-solide';
CREATE DATABASE haodygasikara OWNER haodygasikara;
\c haodygasikara
CREATE EXTENSION IF NOT EXISTS postgis;
SQL
```

- **PostGIS s'active à la main, en super-utilisateur** : l'utilisateur de
  l'application n'a pas le droit de créer l'extension, et la colonne
  `destination.location` en a besoin.
- **Le schéma est créé par l'API** au premier démarrage
  (`spring.jpa.hibernate.ddl-auto=update`) : il suit les entités, sans
  migrations. Les scripts de `db/manuel` ne servaient qu'à faire évoluer
  l'ancienne base de développement : **rien à jouer** sur une base neuve.
- **Base antérieure à la finalisation (25/09/2026)** : elle contient encore
  les tables de l'ancienne tarification, des réservations, des favoris et
  des historiques, que l'API ne lit plus. Elles se retirent avec le script
  de nettoyage remis avec le rapport de finalisation (sauvegarde `pg_dump`
  d'abord). Tant qu'il n'est pas joué, l'API fonctionne : ces tables sont
  simplement ignorées.

### Jeu de démonstration (facultatif, recommandé pour un serveur de test)

Après le **premier démarrage de l'API** (le schéma doit exister) :

```bash
cd backhaodygasikara/src/main/resources/db/test
PGPASSWORD='…' psql -h localhost -U haodygasikara -d haodygasikara -v ON_ERROR_STOP=1 -f 99_seed_all.sql
```

35 destinations réelles, 8 circuits de l'agence, 10 comptes, 6 voyages de
voyageurs et 4 demandes de devis. Détail dans `db/test/README.md`.

> ⚠️ Les comptes de démonstration ont des **mots de passe publics**
> (`Admin@123`, `password123`). Sur un serveur accessible depuis Internet,
> changez-les tout de suite, ou ne chargez pas `05_user.sql`.
>
> ⚠️ `00_reset.sql` (appelé par `99_seed_all.sql`) **vide toutes les tables**.
> Jamais sur une base qui contient de vraies données.

## 4. L'API

### Construire

```bash
cd backhaodygasikara
mvn -DskipTests package            # → target/backhaodygasikara-0.0.1-SNAPSHOT.jar
```

### Installer

```bash
sudo useradd --system --home /opt/haodygasikara --shell /usr/sbin/nologin haodygasikara
sudo mkdir -p /opt/haodygasikara /etc/haodygasikara
sudo cp target/backhaodygasikara-0.0.1-SNAPSHOT.jar /opt/haodygasikara/api.jar
sudo cp ../fronthaodygasikara/deploiement/api.env.example /etc/haodygasikara/api.env
sudo nano /etc/haodygasikara/api.env                      # remplir toutes les valeurs
sudo chown root:haodygasikara /etc/haodygasikara/api.env
sudo chmod 640 /etc/haodygasikara/api.env
sudo cp ../fronthaodygasikara/deploiement/haodygasikara-api.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now haodygasikara-api
journalctl -u haodygasikara-api -f                        # attendre « Started BackhaodygasikaraApplication »
```

### Les variables

Le profil `prod` (`application-prod.properties`) lit **tout** dans
l'environnement ; aucun secret n'est dans le dépôt. Une variable obligatoire
absente fait échouer le démarrage avec son nom, par exemple
`Could not resolve placeholder 'JWT_SECRET'`.

| Variable | Obligatoire | Rôle |
|---|---|---|
| `SPRING_PROFILES_ACTIVE` | oui | `prod` |
| `DB_URL`, `DB_USER`, `DB_PASSWORD` | oui | connexion PostgreSQL |
| `JWT_SECRET`, `JWT_REFRESH_SECRET` | oui | deux secrets différents, 64 caractères et plus (`openssl rand -base64 64`) |
| `MAIL_USERNAME`, `MAIL_PASSWORD` | oui | compte SMTP ; avec Gmail, un **mot de passe d'application** |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | oui | téléversement des photos et vidéos |
| `APP_FRONT_URL` | oui | adresse publique du site (liens des e-mails) |
| `AGENCE_EMAIL` | non | reçoit les demandes de devis (défaut : `MAIL_USERNAME`) |
| `APP_COOKIE_SECURE` | non | `true` par défaut ; `false` seulement pour un serveur de test en HTTP simple |
| `GOOGLE_CLIENT_ID` | non | active « Continuer avec Google » |
| `APP_CORS_ORIGINS` | non | seulement si site et API sont sur deux domaines différents |
| `PORT` | non | `8000` par défaut |

## 5. Le site

### Construire

```bash
cd fronthaodygasikara
npm ci
VITE_API_URL=/api VITE_MAPBOX_TOKEN=pk.… npm run build     # → dist/
```

- `VITE_API_URL=/api` : l'adresse est **relative**, le site appelle l'API sur
  son propre domaine (nginx relaie).
- Sous Git Bash (Windows), préfixer par `MSYS_NO_PATHCONV=1`, sinon `/api`
  devient `C:/Program Files/Git/api` dans le build.

### Installer

```bash
sudo mkdir -p /var/www/haodygasikara
sudo rsync -a --delete dist/ /var/www/haodygasikara/
sudo cp deploiement/nginx.conf /etc/nginx/sites-available/haodygasikara   # adapter server_name
sudo ln -s /etc/nginx/sites-available/haodygasikara /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d test.haodygasikara.com                            # HTTPS
```

**HTTPS est nécessaire** : le cookie de session est `Secure`. Sans
certificat (serveur de test joint par son adresse IP), mettre
`APP_COOKIE_SECURE=false` dans `api.env` — jamais en production.

## 6. Le premier administrateur

Sur une base **sans aucun administrateur**, la page
`https://<domaine>/admin/haodygasikara/re` crée le premier compte. Un code de
vérification part par e-mail ; il se saisit à la première connexion sur
`/admin/haodygasikara/login`.

Dès qu'un administrateur existe, cette création est **réservée aux
administrateurs connectés** : les suivants se créent depuis
**Administration → Utilisateurs → Créer un administrateur**.

## 7. La connexion Google (facultative)

1. Console Google Cloud → API et services → Identifiants → **Créer un
   identifiant client OAuth**, type « Application Web ».
2. Origine JavaScript autorisée : `https://<domaine>` (et
   `http://localhost:5173` pour le développement).
3. Copier l'identifiant client dans `GOOGLE_CLIENT_ID`, redémarrer l'API.

Tant que la variable est vide, le bouton explique que la connexion Google
n'est pas encore disponible.

## 8. Vérifications après déploiement

- [ ] `https://<domaine>/` s'affiche ; `https://<domaine>/api/client/tags` répond `200`.
- [ ] Une adresse inconnue (`/nimporte-quoi`) affiche la page « Cette page s'est perdue en chemin ».
- [ ] Connexion voyageur, puis **rechargement** : on reste connecté.
- [ ] Mauvais mot de passe : le message s'affiche, la page ne se recharge pas.
- [ ] Mot de passe oublié : l'e-mail arrive, le lien fonctionne.
- [ ] Créateur : composer, enregistrer, demander un devis. L'agence reçoit l'e-mail **avec le PDF joint**.
- [ ] Administration : tableau de bord, dossier du devis, bouton « Récapitulatif PDF ↓ ».
- [ ] Un circuit de l'agence n'apparaît sur `/circuit` **que s'il a une date de départ à venir**.

## 9. Mettre à jour

```bash
# API
cd backhaodygasikara && git pull && mvn -DskipTests package
sudo cp target/backhaodygasikara-0.0.1-SNAPSHOT.jar /opt/haodygasikara/api.jar
sudo systemctl restart haodygasikara-api

# Site
cd fronthaodygasikara && git pull && npm ci
VITE_API_URL=/api VITE_MAPBOX_TOKEN=pk.… npm run build
sudo rsync -a --delete dist/ /var/www/haodygasikara/
```

## 9 bis. Déploiement sur Render (deux services)

Render héberge le site et l'API dans **deux services séparés**, chacun avec sa
propre adresse :

```
haodygasikara-front.onrender.com     site (Static Site)
backend-haodygasikara.onrender.com   API  (Docker)
```

Et c'est là qu'est le piège : `onrender.com` figure dans la **Public Suffix
List**, la liste des domaines « publics » embarquée dans tous les navigateurs —
Render l'y a inscrit lui-même, pour que ses clients ne puissent pas se lire
entre eux. Conséquence : ces deux adresses sont **deux sites différents** pour
le navigateur, exactement comme deux domaines sans rapport.

Le cookie de session appartient alors à l'API et devient un **cookie tiers** sur
les pages du site. Le navigateur ne l'envoie pas, et refuse même de
l'enregistrer. Le symptôme est déroutant : tout fonctionne pendant exactement
la durée du jeton d'accès (quinze minutes), puis le renouvellement répond
« Aucune session » et le site renvoie sur la page de connexion. Allonger
`JWT_REFRESH_EXPIRATION` n'y change rien — le jeton n'arrive jamais au serveur.

### Le relais : une seule adresse pour le navigateur

Dans le tableau de bord du **Static Site** → *Redirects / Rewrites* :

| Source | Destination | Action |
|---|---|---|
| `/api/*` | `https://backend-haodygasikara.onrender.com/api/*` | **Rewrite** |

Cette règle doit être **AVANT** celle qui renvoie tout vers `/index.html` (la
règle des applications à page unique) : Render les applique dans l'ordre, et
celle de l'index avalerait `/api/…`.

Puis on rebuild le site avec une adresse **relative** :

```bash
VITE_API_URL=/api VITE_MAPBOX_TOKEN=pk.… npm run build
```

Le navigateur n'appelle plus que `haodygasikara-front.onrender.com` : même
origine, plus de cookie tiers, plus de CORS. C'est l'architecture du § 1, tenue
par Render au lieu de nginx.

### Les variables de l'API, une fois le relais en place

| Variable | Valeur | Pourquoi |
|---|---|---|
| `APP_COOKIE_SAME_SITE` | `Lax` | même origine : plus besoin de `None` |
| `APP_COOKIE_SECURE` | `true` | Render sert en HTTPS |
| `APP_FRONT_URL` | l'adresse du site | liens des e-mails |
| `APP_CORS_ORIGINS` | *(inutile)* | il n'y a plus d'appel entre origines |

Sans le relais, il faut au contraire `APP_COOKIE_SAME_SITE=None` **et**
`APP_CORS_ORIGINS` à l'adresse exacte du site. Cela fonctionne sur Chrome et
Firefox, mais **pas sur Safari**, qui bloque les cookies tiers par défaut : le
relais reste la seule solution qui marche partout.

### Le service gratuit s'endort

Une offre gratuite Render met le service en veille après quinze minutes sans
trafic, et son réveil prend près d'une minute. C'est très exactement le moment
où le jeton d'accès expire. Le site sait désormais faire la différence entre
« session morte » et « serveur injoignable » (cf. `src/api/renouvellement.js`) :
il attend le réveil au lieu de déconnecter. Le premier geste après une longue
absence peut donc prendre une trentaine de secondes.

---

## 10. Sécurité : à faire avant la mise en ligne

`backhaodygasikara/src/main/resources/application.properties` (configuration
de **développement**) contient des secrets **en clair, et ce fichier est
suivi par git** : ils sont dans l'historique du dépôt. Avant toute mise en
ligne :

1. **Changer** le mot de passe d'application Gmail, le secret d'API
   Cloudinary, les deux secrets JWT et le mot de passe de la base.
2. Ne mettre les nouveaux **que** dans `/etc/haodygasikara/api.env` (serveur)
   — jamais dans le dépôt.
3. Idéalement, remplacer en développement les valeurs du fichier par des
   variables d'environnement, puis purger l'historique git.

## 11. Dépannage

| Symptôme | Cause probable |
|---|---|
| Déconnecté à chaque rechargement | Site en HTTP avec un cookie `Secure` → HTTPS, ou `APP_COOKIE_SECURE=false` (test uniquement) |
| Erreur CORS dans la console | Site et API sur deux domaines → `APP_CORS_ORIGINS`, ou passer par le relais nginx |
| Déconnecté toutes les 15 min | Site et API sur deux adresses : le cookie de session est refusé comme cookie tiers → § 9 bis (relais) |
| Premier geste très lent après une pause | Service gratuit endormi : le réveil prend ~1 min, le site l'attend au lieu de déconnecter |
| `Could not resolve placeholder 'X'` au démarrage | Variable `X` absente de `api.env` |
| `type "geometry" does not exist` | Extension PostGIS non créée (étape 3) |
| Aucun e-mail envoyé | `MAIL_PASSWORD` n'est pas un mot de passe d'application Gmail ; voir `journalctl -u haodygasikara-api` |
| Le site affiche du blanc sur `/circuit/3` après rechargement | `try_files … /index.html` absent de la configuration nginx |
| Un circuit n'apparaît pas dans le catalogue | Pas de date de départ à venir (Administration → Programme → Départs) |
