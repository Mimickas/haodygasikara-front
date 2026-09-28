# Guide d'utilisation — Haodygasikara

Haodygasikara est le site vitrine d'un tour-opérateur malgache : on y
découvre les circuits de l'agence, on compose son propre voyage, et on
demande un **devis personnalisé**. Aucun paiement ni réservation en ligne :
l'agence répond par un devis, puis un conseiller finalise le voyage avec le
voyageur.

- **Première partie** — le voyageur (le site public).
- **Seconde partie** — l'agence (l'administration, `/admin/haodygasikara`).

---

# Partie 1 — Le voyageur

## 1.1 Créer son compte et se connecter

On peut tout parcourir **sans compte**. Il devient nécessaire pour
enregistrer un voyage, demander un devis et suivre ses demandes.

| Action | Où | Ce qui se passe |
|---|---|---|
| S'inscrire | **Se connecter** → *Créer un compte* | Un **code à six chiffres** part par e-mail ; on le saisit sur la page de vérification (15 minutes de validité, renvoi possible). |
| Se connecter | **Se connecter** | Adresse et mot de passe, ou **Continuer avec Google** (quand l'agence l'a activé). |
| Mot de passe oublié | Lien sous le formulaire | Un **lien valable 30 minutes** arrive par e-mail ; il ne sert qu'une fois. |

Un mauvais mot de passe affiche un message sur la page, sans la recharger.

## 1.2 Découvrir les circuits de l'agence

- **Circuits** (`/circuit`) : les circuits de l'agence qui ont un **départ
  programmé à venir**.
- La **fiche d'un circuit** détaille le programme jour par jour, les
  hébergements, les repas, les visites et la fiche technique (niveau, âges,
  taille du groupe, langues, transports).
- **Demander un devis** ouvre le formulaire de demande (§ 1.5).
- **Personnaliser ce circuit** en fait une **copie** dans le créateur : on
  peut la modifier librement, l'original de l'agence ne change pas.

## 1.3 Composer son voyage (le créateur)

`/composer`, ou **Créer mon circuit** depuis l'accueil.

1. **Les dates** : arrivée et départ. Le créateur en déduit le nombre de
   nuits à répartir.
2. **Les destinations** : l'atlas se filtre par thèmes et par nom, et se
   trie. On ajoute une destination avec **+** sur sa photo, ou en la
   **glissant** dans l'itinéraire.
3. **L'ordre des étapes** : saisir le **numéro** d'une étape et la faire
   glisser. Les jours se recalculent seuls.
4. **Les nuits** : chaque étape a son nombre de nuits ; la jauge montre ce
   qui reste à répartir.
5. **Les suggestions** : « Suggérée · 83 % » signale une destination qui va
   bien avec celles déjà choisies (souvent associées par les autres
   voyageurs, même esprit, à proximité). Le pourcentage est le score de la
   suggestion ; sa raison s'affiche sur la carte. Un voyage vide propose
   d'abord les destinations qui correspondent à **vos envies** (§ 1.7).
6. **La cohérence** : le créateur signale ce qui ne tient pas (nuits en trop
   ou en moins, dates impossibles, trajets trop longs). Un brouillon peut
   être incohérent ; un voyage **finalisé**, non.

**Enregistrer** garde le voyage dans votre compte (sans compte, il est gardé
sur l'appareil et enregistré dès la connexion).

## 1.4 Mes circuits

`/mes-circuits` : tous vos voyages, du plus récent au plus ancien.

- **Brouillon** : à reprendre quand vous voulez (**Reprendre**).
- **Finalisé** : prêt pour une demande de devis.
- **Dupliquer** : une copie en brouillon, pour tenter une variante.
- **Supprimer** : impossible pour un voyage qui a fait l'objet d'une demande
  de devis — il est conservé pour que le conseiller puisse s'y référer.

## 1.5 Demander un devis

Depuis la fiche d'un circuit, ou **Demander un devis** dans le créateur (le
voyage est alors finalisé, ce qui exige qu'il soit cohérent).

1. **Quand partir** : un départ programmé, ou une date souhaitée.
2. **Combien de voyageurs**.
3. **Les hébergements** : pour chaque séjour, l'agence propose un hébergement
   conseillé et, parfois, d'autres au choix. Seuls les hébergements
   disponibles sont proposés.
4. **Un message** : vos envies, contraintes, questions.
5. **Envoyer** : la connexion est demandée à ce moment-là si besoin ; le
   formulaire est conservé pendant le détour.

L'agence reçoit votre demande avec un **récapitulatif PDF** complet du
voyage. Vous recevez un accusé de réception.

## 1.6 Suivre ses devis

`/mes-devis` : chaque demande porte une frise — *Envoyée → À l'étude →
Devis reçu → Accepté*.

- **Devis reçu** : le montant, poste par poste, et sa date limite.
  **Accepter** (un conseiller vous appelle pour finaliser ; aucun paiement
  en ligne) ou **Refuser** (le motif est facultatif).
- **Retirer ma demande** : possible tant que l'agence n'a pas envoyé son devis.
- **Télécharger le récapitulatif (PDF)** : le voyage et la demande, et le
  devis une fois chiffré.

### Pourquoi mon voyage n'est plus modifiable ?

Tant qu'une demande de devis est **en cours** (envoyée, à l'étude, devis
reçu non expiré, ou accepté), le voyage est **verrouillé** : le devis de
l'agence porte sur ce parcours précis. Le créateur l'affiche en lecture
seule et propose :

- **Voir et confirmer le devis** / **Suivre ma demande** ;
- **Dupliquer** pour composer une variante.

Le voyage redevient modifiable si la demande est **retirée**, **refusée**,
**déclinée** par l'agence ou si le devis **expire**. Une seule demande en
cours par voyage : le bouton « Demander un devis » laisse alors place au
suivi de la demande.

## 1.7 Mon compte

`/mon-compte` :

| Réglage | Détail |
|---|---|
| Photo | Dans l'en-tête de la page : ajouter, changer ou retirer. |
| 01 · Identité | Prénom, nom, téléphone. |
| 02 · Adresse e-mail | Un code part à la **nouvelle** adresse ; l'ancienne reste active jusqu'à sa saisie. Le mot de passe est demandé. |
| 03 · Mot de passe | L'actuel est demandé. Compte ouvert avec Google : **Recevoir le lien** pour en créer un. |
| 04 · Vos envies de voyage | Les thèmes qui vous attirent. Le créateur vous propose d'abord les destinations qui leur ressemblent. |

---

# Partie 2 — L'agence (administration)

Adresse : `/admin/haodygasikara`, connexion sur
`/admin/haodygasikara/login`. Le menu est à gauche (bouton ☰ sur mobile) ;
votre compte et **la déconnexion** sont en bas du menu.

Toutes les listes fonctionnent de la même façon : **recherche** (champ
souligné), **tri** (menu déroulant), **filtres** en étiquettes quand la
liste en a, **Exporter** (fichier CSV des lignes affichées, ouvrable dans
Excel) et **pagination** en pied de tableau. Une suppression demande
toujours confirmation ; un refus du serveur (élément encore utilisé
ailleurs, par exemple) s'affiche en bandeau en tête de page.

## 2.1 Le tableau de bord

- **Quatre indicateurs** : demandes à traiter, délai moyen de réponse (la
  promesse faite au voyageur est de 48 h), taux d'acceptation, part des
  suggestions ajoutées par les voyageurs.
- **Qui attend une réponse ?** : les demandes non traitées, les plus
  anciennes d'abord ; en terre, celles qui dépassent 48 h. Un clic ouvre
  le dossier.
- **Les suggestions servent-elles ?** : sur les suggestions montrées dans le
  créateur, la part ajoutée au voyage, par origine (souvent associées, même
  esprit, à proximité, préférences, coups de cœur) puis par destination.
- **Les destinations qui vont ensemble** : les paires les plus fortes
  (circuits communs, confiance, lift). Elles se recalculent chaque nuit à
  3 h et autour d'un circuit dès qu'il est enregistré ;
  **Recalculer maintenant** force le calcul complet.

La **cloche** en haut à droite indique le nombre de demandes à traiter et
mène à la liste.

## 2.2 Les demandes de devis

Filtres : *À traiter*, *Proposés*, *Acceptés*, *Clos*, *Tous*, et une
recherche (référence, voyageur, circuit). Une ligne ouvre le **dossier** :

1. **Le voyageur** (e-mail, téléphone), **sa demande** (dates, nombre de
   voyageurs, hébergements choisis, message) et **le parcours** étape par
   étape.
2. **Prendre en charge** : la demande passe « à l'étude ».
3. **Rédiger le devis** : poste par poste (libellé, quantité, prix unitaire).
   **Reprendre les hébergements choisis** ajoute une ligne par séjour, à
   chiffrer. Le total est la somme des postes. Devise, date de validité et
   message au voyageur, puis envoi : le voyageur reçoit un e-mail.
4. **Décliner** : avec un motif, transmis au voyageur.
5. **Notes internes** : jamais visibles du voyageur.
6. **Récapitulatif PDF ↓** : le récapitulatif complet de la demande.

Règles :

- Un devis **envoyé ne se modifie plus** tant que le voyageur peut y
  répondre : il accepterait un prix différent de celui qu'il a lu.
- Un devis **expiré** se **renouvelle** (nouveau montant, nouvelle date).

## 2.3 Les circuits des voyageurs

Ce que les voyageurs composent, **en lecture seule** (le voyage appartient à
son auteur). Filtres : *Brouillons*, *Finalisés*, *Devis en cours*, la
période (départ à venir, voyage passé, dates non fixées) et une recherche
(voyageur, voyage, destination). Un voyage s'ouvre sur le côté : itinéraire,
nuits, distances, messages de cohérence et lien vers sa demande de devis.

## 2.4 Les utilisateurs

La liste des comptes : rôle, mode de connexion (adresse, Google), adresse
vérifiée ou non, nombre de voyages et de demandes. **Créer un
administrateur** ouvre le formulaire (bouton *Créer un admin* du menu) : le
nouveau compte reçoit un code de vérification à saisir à sa première
connexion.

## 2.5 Le catalogue

| Écran | À savoir |
|---|---|
| **Destinations** | Nom, description, coordonnées, étoiles (note de l'agence), photos (la première est la couverture), vidéo, étiquettes. |
| **Points d'intérêt** | Visites, activités et hébergements d'une destination. Un hébergement se **retire de la vente** d'un clic (*Disponible / Indisponible*) : il disparaît de tous les choix proposés aux voyageurs, sans toucher aux programmes. |
| **Catégories de POI** | « Hébergement : oui » pour les catégories où l'on dort. |
| **Étiquettes** et **groupes** | Thématique, région, type d'activité… Elles alimentent les filtres du créateur, les suggestions « même esprit » et les envies des voyageurs. |

## 2.6 Les circuits de l'agence et leur programme

- **Circuits** : nom, **Modèle** (*Oui* pour le proposer dans le catalogue
  public), notes, photos, vidéo, étapes (destination et nombre de jours),
  fiche technique, thèmes, inclusions.
  Seuls les circuits de l'agence y figurent ; ceux des voyageurs ont leur
  propre écran (§ 2.3).
- **Programme → Jour par jour** : pour chaque jour d'une étape, un titre, une
  description, les repas, l'**hébergement du soir** conseillé et les
  **autres hébergements au choix** proposés au voyageur.
- **Programme → Visites et activités** : les visites de chaque jour,
  incluses ou en option.
- **Programme → Départs** : les dates de départ de chaque circuit.
  ⚠️ Un circuit n'apparaît dans le catalogue public **que s'il a une date
  de départ à venir**.

---

## Questions fréquentes

**« Demander un devis » est grisé dans le créateur.** Le voyage n'est pas
cohérent (nuits mal réparties, dates manquantes) : le message au survol dit
pourquoi.

**Je ne trouve pas le formulaire de devis de mon voyage.** Un brouillon doit
d'abord être finalisé : la page du devis renvoie vers le créateur.

**Le voyageur dit ne pas avoir reçu le code.** Il peut en redemander un
(délai d'une minute entre deux envois) ; vérifier aussi ses courriers
indésirables.

**Un circuit a disparu du site.** Sa dernière date de départ est passée :
en ajouter une dans *Programme → Départs*.
