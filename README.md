# Haodygasikara — site (React + Vite)

Le site vitrine et l'administration de Haodygasikara. L'API est dans le dépôt
voisin `backhaodygasikara` (Spring Boot, port 8000).

## Démarrer en local

```bash
cp .env.example .env        # puis renseigner VITE_API_URL et VITE_MAPBOX_TOKEN
npm install
npm run dev                 # http://localhost:5173 (l'API autorise cette origine)
```

| Commande | Rôle |
|---|---|
| `npm run dev` | serveur de développement |
| `npm run build` | build de production dans `dist/` |
| `npm run lint` | vérification (oxlint) |

## Documentation

- [Guide d'utilisation](docs/guide-utilisateur.md) — le voyageur, puis l'agence (administration).
- [Déploiement sur le serveur de test](docs/deploiement.md) — base, API, site, nginx, HTTPS, variables.
- Fichiers de déploiement : [`deploiement/`](deploiement/) (nginx, service systemd, modèle des variables de l'API).
