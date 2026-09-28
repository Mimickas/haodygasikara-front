# Récapitulatif — cahier des charges `claude.txt`

> Document tenu à jour à chaque passe. Il enregistre ce qui est **fait et
> mesuré**, ce qui **reste**, et surtout **pourquoi** chaque décision a été
> prise — un choix non écrit se refait à l'identique six mois plus tard.

Dernière mise à jour : 22 septembre 2026.

---

## État d'avancement

| # | Chantier | État |
|---|----------|------|
| 4 | Réserver — écran refait, lisible pour tous | ✅ **Fait et vérifié** |
| 5 | Règle typographique du site entier | ✅ **Appliquée et mesurée** |
| 1a | Espace client — e-mail, mot de passe, photo | ✅ **Fait et vérifié** |
| 1b | Espace client — suppression du compte | ⬜ **À faire** |
| 2 | Liste des réservations — « trop simple et old, pas premium » | ✅ **Refaite et vérifiée** |
| 3 | CircuitDetail — animations, galerie, flèches | ✅ **Fait et vérifié** |
| — | Ce récapitulatif en Markdown | ✅ Ce fichier |

**Passes précédentes, déjà livrées et conservées plus bas** : le header, le
retour en haut à chaque changement de page, la page des réservations et son
endpoint.

---

## 5. La règle typographique ✅

> « seulement les titres grands ou importants en font-title, sinon on utilise
> les fonts Barlow »

La règle est désormais écrite en tête d'`index.css`, et elle tient en une
phrase : **la serif nomme, la sans mesure.**

- **Abhaya** — les **titres** (page, section, rangée) et les nombres qui
  **ordonnent** : 01, 02, 03, le numéro d'une étape, celui d'une halte.
- **Barlow** — tout le reste, et en particulier toute **donnée** : une date, un
  montant, une durée, un compteur, la valeur d'une mention. **Quelle que soit
  sa taille.**

La distinction ordonner / mesurer n'est pas une subtilité gratuite. « 01 »
devant une étape est un repère de lecture, il appartient au titre ; « 18 »
devant « jours » est une quantité, elle appartient au texte — et elle a besoin
de `tabular-nums`, ce qu'une serif de titrage rend mal.

**Ce qui est passé en Barlow :** valeur d'une mention, chiffre du décompte,
titre de volet, date de départ, montant d'un tarif, date de réservation, valeur
et durée du panneau circuit, compteur de l'espace voyageur, pourcentage de
chargement, valeur d'un indicateur d'administration, message de table vide.

**Ce qui reste en Abhaya :** tous les titres, et les numéros d'ordre.

### Un piège dans le thème, trouvé en mesurant

`--font-medium`, `--font-heading` et `--font-reg` déclaraient des **familles
Abhaya sous des noms qui ressemblent à des utilitaires de graisse Tailwind**.

Conséquence : tout `font-medium` — **onze endroits**, dont le composant
`Button` et les étiquettes des formulaires d'administration — rendait son texte
**en serif à 14 px**, alors que l'auteur demandait simplement une graisse
moyenne. C'est ce qui produisait « Créer mon circuit » en Abhaya sur l'accueil.

Les trois alias sont retirés : `font-medium` retrouve son sens standard, les
deux autres n'étaient employés nulle part. Les onze appels sont passés à
`font-body-strong`.

Au passage : **`body` n'avait aucune `font-family`.** Tout élément qui n'en
déclarait pas tombait donc sur la serif du *navigateur* — Times —, pas sur
celle du site. Barlow y est désormais posée par défaut.

**Vérifié dans le navigateur**, page par page, après avoir parcouru chaque page
pour déclencher les révélations : accueil, liste des circuits, fiche circuit,
réservation — **« Abhaya sous 24 px : aucun »** partout, et les titres intacts.

> Une seule exception subsiste, et elle est volontaire : « Itinéraire » reste en
> Barlow Light à 120 px. C'est la dérogation déjà documentée, décidée avant ce
> chantier. Je ne l'ai pas touchée.

---

## 4. Réserver — l'écran refait ✅

> « regarde bien notre homme, bien clean sans trop de border comme tu l'as
> fait, c'est trop un site sans style » · « rends-le bien UX/UI très très facile
> à lire sans que le client perde de vue, imagine que le client est très très
> vieux, qui vient de la brousse »

### Le diagnostic

Un formulaire nu sur le sable, séparé par **cinq filets horizontaux**, tout au
même poids. Un filet sépare bien deux choses **de même nature** — deux haltes,
deux réglages. Il ne **hiérarchise** pas. Empilés, cinq filets donnent cinq
blocs d'égale importance : l'œil n'a plus aucun point d'entrée.

### Ce qui a changé

- **Un héro photographique** : le voyageur **voit** le circuit qu'il réserve, et
  la date de départ est écrite en grand, tout de suite. C'est la seule chose
  qu'on ne peut plus corriger ensuite sans recommencer.
- **Trois étapes numérotées** sur des panneaux clairs posés sur le sable — c'est
  la **surface** qui sépare, plus le trait. Angles vifs, aucune ombre : la règle
  du site ne bouge pas, c'est le moyen de séparation qui change.
- **Un récapitulatif toujours visible** : colonne collante à droite, barre
  collante en bas sur téléphone. C'est ce qui répond à « sans perdre de vue ».
  Mesuré à 430 px : la barre tient le bas de l'écran à `0px du bas`.

### Ce que « très vieux, qui vient de la brousse » a changé concrètement

Ce n'est pas une coquetterie : c'est le vrai public d'un tour-opérateur
malgache. Chaque point ci-dessous en découle directement.

| Avant | Maintenant |
|---|---|
| corps 15 px, étiquettes 11 px | **17 px** et **13 px** |
| « Adulte » à gauche, son compteur à 1 400 px de là | le compteur **collé** à sa catégorie |
| boutons − / + de 32 px, à peine visibles | **52 × 52 px**, cadre franc (la limite du doigt est 44) |
| « 250 000 MGA » seul dans une colonne | « 250 000 MGA **par personne** », écrit |
| bouton gris, sans explication | il **dit ce qui manque** : « il reste à indiquer au moins un voyageur, écrire votre nom et écrire votre adresse e-mail » |
| « Total 0 MGA » | « Indiquez d'abord combien de personnes voyagent » — un zéro suivi d'une devise ressemble à un prix |
| étapes implicites | **1, 2, 3**, avec une phrase d'aide en français simple |

### Un vrai bug trouvé en testant

**Deux appuis rapides sur « + » ne comptaient qu'une personne.** Le compteur
calculait `valeur + 1` à partir de sa prop — donc d'un nombre pas encore
rafraîchi. Il annonce maintenant un **écart** (`+1`, `−1`) et c'est le parent
qui applique le changement à partir de son état courant.

Ce n'est pas un cas tordu : appuyer deux fois vite sur « + » est exactement le
geste de quelqu'un qui compte deux personnes — et c'est le public de cette page.
Vérifié : trois appuis rapides donnent bien **« 3 × Adulte — 750 000 MGA »**.

---

## 1a. Les paramètres du compte ✅

`/mon-compte` — e-mail, mot de passe, photo de profil, identité.

### Le dessin : une seconde version, après un refus

> « c'est ergonomique c'est de la merde regarde dans home une espace très très
> luxe et premium et riche moderne là c'est direct un bas de gamme »

Première version : un portrait de 112 px, deux lignes de texte sur le fond
clair, puis trois volets. Le reproche est juste — un écran de compte composé
comme un formulaire **est** un formulaire, même bien composé.

Ce qui fait la richesse de l'accueil tient à trois choses, et **aucune des
trois n'y était** :

1. de la **photographie plein cadre**, à `0.75` d'opacité sur du noir ;
2. un **titre en très grand corps**, ligne par ligne sous son masque ;
3. un **filet d'un pixel en pied**, qui porte la méta.

La page ouvre donc sur un héro photographique qui porte **le nom du voyageur en
titre de une** — exactement comme l'accueil ouvre sur « Composez votre
Madagascar », et comme le panneau de l'espace voyageur le fait déjà. Et les
réglages reprennent **le rythme éditorial de « Votre voyage en trois gestes »** :
douze colonnes, le numéro en Abhaya clair sur deux, le titre sur quatre, le
propos sur cinq, un filet entre chaque rangée et un filet de fermeture.

Rien d'inventé : c'est la grammaire de l'accueil, posée sur un autre contenu.

**Trois défauts trouvés en regardant la capture, et corrigés :**

- l'accroche ocre et les légendes tombaient **au point le plus faible des deux
  voiles** et devenaient illisibles — le héro d'accueil n'a pas le problème
  parce que sa photographie est sombre en bas, celle-ci est une plage en plein
  jour. Le voile du bas monte maintenant sur toute la hauteur du bloc de texte ;
- « Changer la photo » / « Retirer » étaient empilés en corps 10 sur la
  photographie : côte à côte, séparés d'un filet vertical ;
- **la barre d'en-tête restait sombre sur le héro sombre**. `useHeaderTextColor`
  recense les sections au changement de route, une seule fois ; le héro
  n'existant pas encore à cet instant n'était jamais observé. Mesuré :
  `rgb(43,33,26)` là où il fallait du clair. Le héro est désormais monté dès que
  le compte est connecté, avant ses données.

### Une collision de noms, invisible dans le code

`.cx-compte` **existait déjà** dans `index.css` — c'est le décompte de la fiche
circuit, et il est en `display: grid`. Ma section en héritait sans qu'on la voie
faire : la rangée commençait à **814 px au lieu de 64**, et les douze colonnes
faisaient 29 px chacune. Tout le bloc est passé sous le préfixe **`.cx-param`**.

> Une collision de nom ne se voit pas dans le code, seulement à l'écran. C'est
> ce qui justifie de mesurer une mise en page au lieu de la regarder.

### Ce qui protège le compte

**Le mot de passe est exigé** pour changer l'adresse et pour changer le mot de
passe, même connecté. Un jeton de session prouve qu'on s'est connecté, pas qu'on
est encore devant l'écran — un portable resté ouvert suffirait sinon à prendre
un compte : on change l'adresse de reprise, on demande un nouveau mot de passe,
et le propriétaire est dehors. La photo, elle, n'exige rien de plus : la
remplacer ne donne la main sur rien.

**L'adresse change en deux temps.** Le code part vers la **nouvelle** adresse —
seule façon de savoir que celui qui la saisit la relève vraiment. Tant qu'il
n'est pas saisi, le compte vit sur l'ancienne, et l'écran le dit. Un avis part
en même temps vers l'**ancienne** adresse : inutile dans le cas normal, c'est la
sonnette d'alarme dans le seul cas qui compte.

**L'adresse est le sujet du JWT** : à l'instant où elle change, le jeton en main
et le cookie de renouvellement ne désignent plus personne. Le serveur rend donc
une paire de jetons neufs dans la même réponse. Vérifié : l'ancien jeton répond
401 juste après, le neuf passe.

**L'URL de la photo est vérifiée** côté serveur : elle doit venir de notre cloud
Cloudinary **et** du dossier `avatars`. Une URL libre dans ce champ serait un
pixel espion servi depuis nos pages à chaque affichage. Le dossier est imposé
par le serveur, jamais lu dans la requête — sinon la signature vaudrait droit
d'écriture sur tout le compte Cloudinary.

### Trois défauts de mon propre code, trouvés par les tests

1. **Le compteur de tentatives ne montait jamais.** Sous `@Transactional`,
   l'incrément était annulé par le rollback de l'exception levée juste après :
   le message répétait « il vous reste 4 tentatives » indéfiniment et le plafond
   de cinq n'était jamais atteint — la protection contre la force brute sur un
   code à 6 chiffres **n'existait pas**. La méthode n'est plus transactionnelle,
   comme `AuthService.verifyEmail` et pour la même raison. Vérifié : 4 → 3 → 2 →
   1 → abandon.
2. **Le plafond par IP se consommait avant la vérification du mot de passe** :
   cinq fautes de frappe interdisaient tout changement d'adresse depuis cette
   connexion pendant une heure, sans qu'un seul e-mail soit parti. Derrière le
   NAT d'un bureau, ça touche des gens qui n'ont rien demandé. Il compte
   désormais les **envois**, pas les tentatives.
3. **Le motif d'un échec d'envoi était avalé.** L'écran disait « vérifiez
   l'adresse » quelle que soit la cause. La cause est maintenant journalisée —
   et c'est ce qui a permis de trouver le point suivant.

### ⚠️ Un problème d'environnement, pas de code

Le serveur de mail répond **`Authentication failed`** : le mot de passe
d'application Gmail de `application.properties` n'est plus valide. **Aucun
e-mail ne part de cette machine** — ni les miens, ni le code de vérification à
l'inscription. Et comme `AuthService.register` **supprime le compte** quand
l'envoi échoue, l'inscription est actuellement impossible en local.

Pour vérifier quand même la chaîne complète, les trois e-mails ont été envoyés
vers un serveur SMTP local de test. Les trois arrivent, et leur rendu est juste :
code affiché « 274 912 », adresse visée **masquée** dans l'avis
(`fa***@…` — la donner en clair ferait de cet avis une fuite le jour où il part
chez la mauvaise personne), contact de secours présent.

---

## Un bug ANTÉRIEUR, trouvé en route et corrigé 🔧

> Il ne vient pas de ce chantier, mais il passait par la même porte.

**Un jeton d'accès expiré répondait `403` avec un corps vide.** Or
l'intercepteur du front ne renouvelle le jeton **que sur un 401**. Un jeton
d'accès vit quinze minutes : passé ce délai, chaque appel échouait en silence et
le renouvellement automatique **ne partait jamais**. Le mécanisme était écrit et
ne se déclenchait pas — invisible tant qu'on recharge la page souvent, puisque
`restoreSession` redonne un jeton neuf au chargement.

Deux causes, deux corrections :

- **le filtre JWT laissait s'échapper toute exception** (jeton expiré, signature
  invalide, sujet qui ne désigne plus personne). Il n'authentifie plus, et
  laisse la requête continuer comme anonyme ;
- **aucun point d'entrée n'était configuré**, d'où le 403 sans corps. Il y en a
  un maintenant, et il déduit le statut **du contexte de sécurité**, pas du
  chemin qu'a pris Spring : personne d'identifié → **401** ; quelqu'un
  d'identifié sans le rôle → **403**.

> Ce dernier point est une subtilité de Spring Security 7 : `sendStartAuthentication`
> est appelé **même** pour un refus d'autorisation. Déduire le statut du dispatch
> donnait 401 à un utilisateur parfaitement identifié à qui il manquait seulement
> le rôle.

Vérifié : jeton expiré → 401 · sujet inconnu → 401 · signature invalide → 401 ·
aucun jeton → 401 · **USER identifié sur une route ADMIN → 403**. Et le corps
n'est plus vide — il l'était parce que Jackson échouait sur l'`Instant` du
timestamp et tronquait le JSON en plein milieu.

Ce correctif servira aussi à la suppression de compte : le jeton d'un compte
supprimé tombe exactement dans le même cas.

---

## ⚠️ Une erreur à ne pas refaire

> « NE CHANGE STRICTEMENT PAS MES DESIGN DÉJÀ ÉTABLIS […] j'ai dit ajoute des
> animations du page complète, pas changer le design »

À la passe précédente, pour « ajouter des animations premium », j'avais
**remplacé le héro de la fiche circuit** par un autre composant
(`CircuitShowcase`, qui dormait dans le projet). C'était une refonte du dessin,
pas un ajout de mouvement. Le reproche est fondé, et le héro d'origine a été
remis.

**La règle qui en découle, et qui tient pour la suite du projet :**

> *Ajouter des animations* ne veut jamais dire *changer le dessin*. Une
> animation ne fait bouger que `opacity` et `transform`, et elle retire ses
> styles une fois jouée. Si l'écran au repos n'est pas rigoureusement identique
> avant et après, ce n'était pas une animation.

C'est ce qui explique la forme prise par le chantier 3 ci-dessous.

---

## 3. CircuitDetail ✅

### Les animations — toute la page, sans toucher au dessin

Tout vit dans un seul fichier,
`hooks/design/animations/circuit/useCircuitDetailAnimations.js`, appelé par une
ligne dans `CircuitDetail.jsx`.

Trois garanties, tenues par construction :

1. **Aucun composant de section n'est modifié.** Le hook se branche sur les
   classes **qui existent déjà** (`.cx-tete`, `.cx-leg`, `.cx-voyage__cadre`,
   `.cx-depliant`, `.cx-departs > li`…). Aucun `data-` semé dans les fichiers,
   donc aucun fichier de section touché.
2. **Seuls `opacity` et `transform` bougent** — les deux propriétés que le
   compositeur traite seul, sans refaire la mise en page.
3. **`clearProps` à la fin de chaque entrée.** GSAP retire ses styles en ligne
   et l'élément revient exactement à ce que la feuille de style dit de lui.

Retirer l'appel retire toute la chorégraphie, et il ne reste rien.

**Ce qui bouge :**

| Moment | Geste |
|---|---|
| Ouverture du héro | la photo se pose depuis `scale 1.08` · le nom monte · la ligne de méta suit · **le filet se trace** depuis la gauche · les vignettes se posent en décalé |
| Défilement du héro | parallaxe courte — la photo descend moins vite que la page (8 %, au-delà on voit le bord du cadre arriver) |
| Chaque section | l'en-tête monte **d'un bloc**, puis la planche photo, la fiche, les volets, les haltes, les départs, en décalé |

Rien ne clignote, rien ne rebondit, rien ne tourne : un seul geste décliné,
c'est ce qui fait qu'une page paraît chère plutôt qu'animée. Et
`prefers-reduced-motion` reçoit **zéro** mouvement.

**Deux pièges traités :**

- `once: true` partout — une section qui rejoue son entrée à chaque passage
  donne le mal de mer et fait bon marché.
- `ScrollTrigger.refresh()` après la pose — les images arrivent après coup et
  changent les hauteurs ; sans ce recalage, les déclencheurs des sections
  basses sont posés sur des positions périmées et se jouent trop tôt, ou jamais.

**Vérifié dans le navigateur, après avoir parcouru toute la page :**

```
invisibles        : aucun ✓
residusDeStyle    : aucun ✓          ← clearProps tient sa promesse
debordementX      : aucun
styleEnLigneTitre : (aucun)
```

> Le vrai risque d'une chorégraphie, c'est l'élément resté à `opacity: 0` parce
> que son déclencheur ne s'est jamais joué. C'est exactement ce que ce test
> cherche.

### La galerie et les flèches

**Le héro est intact.** Même section plein écran, même photo en `opacity-75`
sur du noir, même titre en `text-8xl`, même ligne de méta à droite, même filet.
Pas une classe changée.

Ce qui s'ajoute, **sous le filet** :

- **à gauche**, la bande des visuels du circuit — trois colonnes au plus, qui
  défilent au-delà ;
- **à droite**, les flèches en **icône nue** : ni cadre, ni fond, ni rayon.

La photo du haut est devenue une pile de calques : changer de visuel fait un
fondu au lieu d'un remplacement sec. Le calque actif est à `0.75` — la valeur
exacte d'`opacity-75`. **Au repos, l'écran est celui d'avant.**

**« deux ou trois colonnes max qui suivent entre eux »**

```css
max-width: calc(
    var(--vignettes, 3) * var(--largeur-vignette)
    + (var(--vignettes, 3) - 1) * var(--gap-vignette)
);
```

Une seule valeur à changer pour en montrer deux ou quatre. La vignette active
se ramène d'elle-même dans la fenêtre (`inline: nearest` — `center`
recentrerait à chaque pas et donnerait un mouvement permanent).

**« pas de bg ni de quoi que ce soit, l'icône flèche, pas de div »**

Mesuré dans le navigateur : `background: rgba(0,0,0,0)`, `border: 0px none`,
`border-radius: 0px`, et le bouton ne contient **qu'un `<svg>`**.

> C'est resté un `<button>`, et c'est délibéré : c'est lui qui rend la commande
> cliquable au clavier et nommable pour un lecteur d'écran. Un `<span>`
> cliquable n'est ni l'un ni l'autre. Mais il ne **dessine** plus rien — un
> `margin: -12px; padding: 12px` donne 44 px de zone de clic sans rien montrer.

Seul retour au survol : la flèche avance de 3 px **dans son sens**. Une flèche
qui recule dirait le contraire de ce qu'elle fait.

### Vérifié

| | 1600 px | 430 px |
|---|---|---|
| Bande à gauche, sous le filet | ✓ (x = 64) | ✓ |
| Vignettes visibles | 3 | 2, le reste défile |
| Flèches à droite, icône nue | ✓ | ✓ |
| Clic « suivant » | `Visuel 1 sur 3` → `Visuel 2 sur 3` | ✓ |

> ℹ️ `components/showcase/CircuitShowcase.jsx` reste dans le projet et n'est
> **branché nulle part** — c'est l'état d'avant. Je ne l'ai pas supprimé : ce
> n'est pas à moi de retirer du code déjà écrit.

### La référence Avatr

`vision.avatr.com` répond **403** à une requête automatisée — je n'ai pas pu la
regarder, et je ne vais pas prétendre le contraire. Le travail s'appuie sur ce
que le projet dit déjà d'elle (les commentaires d'`index.css` la citent avec
Rennsport : grotesque en grand corps, chasse serrée, photographie plein cadre,
aucun ornement) et sur la page Rennsport, que j'ai pu rendre.

---

## 2. La liste des réservations ✅

> « trop simple et old je sens pas le luxe et premium […] c'est trop moche trop
> vide pas premium »

### Le diagnostic

**Aucune photographie.** Toutes les listes du site en portent une — une halte
d'itinéraire a sa vignette, une carte de circuit son cliché plein cadre — et
celle-ci alignait des lignes de texte sur du papier.

Un écran de compte n'est pas un tableau de bord : le voyageur vient y revoir
**son voyage**, pas consulter un registre.

### Ce qui a changé

- **La couverture du circuit** sur chaque ligne. Elle manquait côté API :
  `circuitImageUrl` ajouté à `ReservationResponse` (l'image marquée couverture,
  sinon la première).
- **La grammaire d'une halte d'itinéraire** : vignette 16/10, grande date en
  Abhaya, nom du circuit, date de retour en petites capitales.
- **L'aplat de survol**, repris de l'itinéraire : il sort de la gouttière et
  file d'un bord de l'écran à l'autre. Un `scaleX`, donc aucune surface
  repeinte. Et la vignette prend un souffle d'échelle.
- **Le compte en exposant** à côté du titre, comme l'en-tête de l'itinéraire :
  c'est la signature des listes du site.
- **Les révélations au défilement** — hook `hooks/design/useRevelation.js`,
  écrit générique pour être réutilisé : l'en-tête se pose, puis les
  réservations montent une à une.

Rien d'inventé : chaque geste existait déjà ailleurs dans la feuille de style.

**Deux détails qui comptent :**

- `@media (hover: none)` annule l'aplat et le souffle — sur tactile ils
  resteraient accrochés à la dernière ligne touchée.
- `.cx-mesresa { overflow: clip }` — l'aplat sort de la gouttière, la section
  doit le laisser filer sans que la page se mette à défiler de côté.

**Vérifié** en 1600 et 430 px : deux lignes, états correctement encrés, dépli à
3 étapes et 2 lignes de tarif, sous la barre, aucun débordement.

---

## 1b. Ce qui reste — supprimer le compte ⬜

> « supprimer le compte lui-même donc tous les réservations et ses actions
> durant le site sera tout supprimé »

C'est le seul point du cahier des charges encore ouvert, et il a été gardé pour
une passe dédiée à dessein.

> ⚠️ La suppression détruit des données de façon **irréversible** et touche
> plusieurs tables : `reservation`, `reservation_ligne`,
> `reservation_statut_history`, favoris, historique, circuits composés. Elle
> demande une confirmation explicite côté écran **et** une transaction propre
> côté serveur.

Deux questions à trancher avant d'écrire une ligne, et elles ne sont pas
techniques :

- **une réservation confirmée et payée doit-elle disparaître ?** Une agence a
  des obligations comptables ; effacer une vente n'est pas la même chose
  qu'effacer un compte. L'usage est d'**anonymiser** la réservation et de
  détacher le compte, pas de supprimer la ligne ;
- **que devient un circuit composé par le voyageur** et repris depuis par
  l'agence ?

Ce qui est déjà en place et servira : le correctif du filtre JWT ci-dessus fait
qu'un jeton dont le sujet n'existe plus rend un **401** propre — donc un onglet
resté ouvert ailleurs se déconnecte au lieu d'échouer en silence.

---

## Les passes précédentes

### Le header ✅

**Une fausse piste écartée.** Une bande grise de 12 px à droite venait de mon
propre outil de capture (`--hide-scrollbars` masque la barre mais garde sa
gouttière), **pas du site**. La corriger aurait cassé un comportement correct.

**Défaut 1 — la page sautait de 12 px à l'ouverture d'un panneau.** Le blocage
du défilement était posé sur `<body>` ; la barre disparaissait, la page
s'élargissait (`clientWidth` 1588 → 1600). `scrollbar-gutter: stable` ne
l'empêche pas : il ne réserve la gouttière que tant qu'une barre **peut**
s'afficher. Corrigé en compensant la largeur reprise, **mesurée** juste avant
le blocage plutôt que codée en dur. Vérifié : header à `1588 px` fermé **et**
ouvert.

**Défaut 2 — les 85 premiers pixels d'une page passaient sous la barre.**
Écarté : un `padding-top` global sur `<main>`, qui aurait réparé une page en
cassant trois — les héros plein écran doivent passer sous la barre, c'est ce
qui la rend transparente. Le retrait est donc en **opt-in** :
`.cx-sous-entete { padding-top: var(--entete-hauteur, 85px) }`.

**Un défaut découvert en vérifiant** : la barre **grandit de 8 px à la
connexion** (85 → 93) — le bouton passe de « Se connecter » au monogramme et au
prénom. La variable n'était mesurée qu'au montage. Corrigé par un
**`ResizeObserver`** sur la barre.

### Le retour en haut ✅

`PUSH`/`REPLACE` remontent, `POP` restaure : quelqu'un qui ouvre une fiche
depuis le milieu de la liste puis revient doit retrouver sa place. Piège
évité — **Lenis tient sa propre position**, remettre `window.scrollY` à zéro ne
suffit pas. Vérifié : 1186 → 0.

### La page des réservations et son endpoint ✅

`GET /api/client/reservations/mes`. Sous `/api/client/**`, donc ouvert par la
configuration : c'est le **service** qui exige le compte et répond `401`. La
requête rattache les réservations du compte **et** celles prises avec la même
adresse avant qu'il existe — la connexion exigeant un compte **vérifié**, ce
n'est pas une faille, et sans cela quelqu'un qui réserve en visiteur puis crée
son compte ne retrouverait jamais sa demande.

**Pas de `ProtectedRoute`** sur la route : la page se charge sans compte et
invite à se connecter. Une redirection sèche vers `/login` ferait perdre
l'adresse qu'on vient de partager.

---

## Décisions déjà prises, à ne pas refaire

**Une animation ne change pas un dessin.** `opacity` et `transform` seulement,
`clearProps` à la fin. Si l'écran au repos diffère, ce n'était pas une
animation. *(Voir l'erreur en tête de document.)*

**Rythme de la page détail** — chaque section porte sa respiration **en haut**,
rien en bas ; `.cx-detail` ferme la page une seule fois. Sans cette règle, deux
sections voisines additionnent leurs marges. Une section ajoutée ne règle que
son `padding-top`. L'intervalle vit dans `--cx-section`.

**Typographie des titres** — Abhaya (`font-title`) partout. Barlow Light en
grand titre n'existe **qu'une fois**, sur « Itinéraire », et c'est une
dérogation assumée. Une dérogation qui se répète cesse d'en être une.

**Rien n'est inventé à l'écran** — un champ que l'administration n'a pas rempli
ne devient jamais une phrase. « Tous âges » se coche, il ne se déduit pas de
deux champs vides.

**Les montants ne voyagent pas par le client** — le formulaire de réservation
n'envoie que des identifiants et des quantités. Le serveur relit les prix en
base et recalcule. Même règle pour le paiement le jour venu : le statut vient
du webhook du prestataire, jamais de l'URL de retour.

**Les états d'une réservation sont une table, pas un enum** — `nom` est la
valeur gravée sur laquelle le code route, `libelle` le texte d'affichage qui se
reformule librement. Les encres de la liste routent sur le **nom**.
