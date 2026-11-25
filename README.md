# Smart Life Planner — Customs Shift & Full Stack Student

Application web responsive, en français, sans dépendance ni compilation. Elle fonctionne dans un navigateur moderne et sauvegarde les données dans `localStorage`.

## Démarrage

1. Décompresser le dossier.
2. Ouvrir un terminal dans le dossier `smart-life-planner`.
3. Lancer `npm start` (ou `python3 -m http.server 8080`).
4. Ouvrir `http://localhost:8080`.

Le projet utilise des modules JavaScript ES ; il est recommandé de servir le dossier via HTTP local plutôt que d'ouvrir directement le fichier HTML.

## Cycle de travail

Le cycle dure 5 jours :

1. Service de jour, 09h00–21h00.
2. Repos avant nuit.
3. Service de nuit, 21h00–09h00 le lendemain.
4. Récupération après nuit.
5. Deuxième journée de repos.

Dans Paramètres, sélectionner la date de référence et la phase réelle à cette date. Le calcul utilise la différence de dates civiles et ne dépend pas du jour de la semaine. Les dérogations journalières (échange, renfort, congé/repos) peuvent être réglées dans le planning professionnel.

## Fonctions incluses

- Tableau de bord avec prochain service, compte à rebours, cours, activités et objectifs.
- Calendrier mensuel avec détails par date.
- Liste professionnelle sur 31 jours, ajustements de phase, statistiques mensuelles.
- Cours fixes lundi et mardi de 19h à 21h ; détection de conflit et cours après nuit.
- Suivi de présence et création de tâches de rattrapage.
- Activités CRUD, filtres, statut terminé, suggestions adaptées aux phases du cycle.
- Objectifs hebdomadaires : français 2h, anglais 2h, IA 2h, sport 2 séances, Full Stack 4h.
- Mode clair/sombre, sauvegarde locale, export/import JSON.

## Tests

`npm test` exécute les tests unitaires de cycle, dates, chevauchement d'intervalles et cours fixes.

## Notes

- Le stockage local est propre à ce navigateur/appareil. Utiliser Exporter pour créer une sauvegarde.
- Les cours restent fixes ; la détection ne les déplace jamais.
- Le planning suggéré est une aide à l'organisation. Vérifier les horaires exceptionnels de service avant de valider une activité.
