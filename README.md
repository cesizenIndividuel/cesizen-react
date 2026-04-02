# CESIZen React Admin

Interface d'administration de CESIZen construite avec React, TypeScript et Vite.

## Fonctionnalites

- Connexion admin avec validation des champs (React Hook Form + Zod)
- Protection des routes d'administration selon token, role et statut utilisateur
- Tableau de bord admin (stats + activite recente)
- Gestion des utilisateurs (liste, details, creation, mise a jour, activation/desactivation, suppression)
- Gestion des articles (liste, creation, edition, publication, restauration, suppression)
- Upload d'image de couverture et d'images dans le contenu d'article
- Gestion des categories (CRUD)
- Rafraichissement automatique du token en cas d'expiration (intercepteur Axios)

## Stack technique

- React 19
- TypeScript
- Vite
- React Router
- Axios
- TanStack Query
- React Hook Form
- Zod
- TipTap (editeur riche)

## Prerequis

- Node.js 20+ recommande
- npm 10+ recommande
- Une API backend CESIZen accessible

## Installation

```bash
npm install
```

## Configuration

Le front utilise la variable d'environnement suivante:

- `VITE_API_URL` : URL de base du backend (ex: `http://localhost:3000`)

Creer un fichier `.env` a la racine du projet:

```env
VITE_API_URL=http://localhost:3000
```

Le client HTTP cible ensuite automatiquement `VITE_API_URL/api`.

## Lancer le projet

Mode developpement:

```bash
npm run dev
```

Build de production:

```bash
npm run build
```

Previsualiser le build:

```bash
npm run preview
```

## Scripts disponibles

- `npm run dev` : demarre le serveur Vite
- `npm run build` : compile TypeScript puis genere le build Vite
- `npm run preview` : sert le build localement

## Structure du projet

```text
src/
  api/          # Appels HTTP vers le backend
  components/   # Composants reutilisables (ex: editeur riche)
  layouts/      # Layouts d'ecran (ex: AdminLayout)
  pages/        # Pages metier (login, dashboard, users, articles, categories)
  router/       # Configuration des routes + protection d'acces
  types/        # Types TypeScript metier
  utils/        # Utilitaires (auth localStorage, etc.)
```

## Notes

- Ce projet est le front office admin. Il depend du backend CESIZen pour fonctionner correctement.
