# EcoPanier

Une plateforme de vente de paniers anti-gaspillage destinée aux étudiants. Achetez des invendus à prix réduit tout en contribuant à réduire le gaspillage alimentaire. lien demo: https://ecopanier.netlify.app/

![EcoPanier](./public/ecopanier_logo.png)

## Fonctionnalités

### Pour les utilisateurs
- **Navigation des paniers** : Parcourez les paniers disponibles par catégorie (alimentaire, hygiène, fournitures, mixte)
- **Système de commande** : Commandez facilement vos paniers et suivez vos commandes
- **Tableau de bord utilisateur** :
  - Suivez votre impact écologique (CO2 économisé, repas sauvés)
  - Gagnez des badges pour vos actions
  - Participez à des défis communautaires
  - Consultez l'historique de vos commandes
- **Système de points** : Gagnez 10 points par euro dépensé

### Pour les administrateurs
- **Gestion des paniers** : Créez, modifiez et supprimez des paniers
- **Gestion des stocks** : Suivez et mettez à jour les stocks en temps réel
- **Vue d'ensemble** : Consultez les statistiques et gérez toutes les commandes

## Technologies utilisées

- **Frontend** :
  - React 18 avec TypeScript
  - Vite pour le build
  - Tailwind CSS pour le styling
  - Lucide React pour les icônes

- **Backend & Base de données** :
  - Supabase (PostgreSQL)
  - Authentification Supabase
  - Row Level Security (RLS) pour la sécurité des données

## Installation

### Prérequis
- Node.js 18+ et npm
- Un compte Supabase

### Étapes d'installation

1. **Cloner le repository**
```bash
git clone https://github.com/ayinin-cherifdine/ecopanier.git
cd ecopanier
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer Supabase**

Créez un fichier `.env` à la racine du projet en vous basant sur `.env.example` :

```bash
cp .env.example .env
```

Puis remplissez les valeurs avec vos clés Supabase :

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Appliquer les migrations**

Les migrations se trouvent dans le dossier `supabase/migrations/`. Elles créent :
- Les tables (baskets, orders, profiles, badges, challenges)
- Les politiques RLS
- Les fonctions nécessaires

Appliquez-les via le dashboard Supabase ou la CLI Supabase.

5. **Créer un compte administrateur**

Utilisez la fonction Edge `create-admin` en appelant l'endpoint avec l'email de l'utilisateur à promouvoir admin.

## Lancement

### Mode développement
```bash
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

### Build de production
```bash
npm run build
```

### Prévisualiser le build
```bash
npm run preview
```

## Structure du projet

```
ecopanier/
├── src/
│   ├── components/
│   │   ├── Admin/           # Composants administrateur
│   │   ├── Auth/            # Composants d'authentification
│   │   ├── BasketCard.tsx
│   │   ├── Header.tsx
│   │   ├── OrderModal.tsx
│   │   └── UserDashboard.tsx
│   ├── contexts/
│   │   └── AuthContext.tsx  # Contexte d'authentification
│   ├── lib/
│   │   └── supabase.ts      # Client Supabase
│   ├── types/
│   │   └── database.types.ts
│   ├── App.tsx
│   └── main.tsx
├── supabase/
│   ├── functions/           # Edge Functions
│   └── migrations/          # Migrations SQL
└── public/                  # Assets statiques
```

## Schéma de base de données

### Tables principales

- **profiles** : Informations utilisateur et type (admin/user)
- **baskets** : Paniers disponibles avec prix, stock, catégorie
- **orders** : Commandes effectuées par les utilisateurs
- **badges** : Badges à débloquer
- **user_badges** : Association utilisateurs-badges
- **challenges** : Défis communautaires
- **user_challenges** : Progression des utilisateurs dans les défis

## Sécurité

Le projet utilise Row Level Security (RLS) de Supabase pour sécuriser toutes les données :
- Les utilisateurs ne peuvent voir que leurs propres commandes
- Seuls les administrateurs peuvent gérer les paniers
- Toutes les requêtes sont validées côté base de données

## Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

## Licence

Ce projet est sous licence MIT.

## Support

Pour toute question ou problème, ouvrez une issue sur GitHub.
