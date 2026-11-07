# 002 — Guide Dakar : agenda du jour, avec filtre « en cours » : plan

**Statut** : Validé

## 1. Résumé

On construit un nouveau module d'API, `animations`, qui lit les animations enregistrées et renvoie l'agenda d'une journée, ainsi qu'un écran « Agenda » dans le front. Une fois les tâches terminées, le visiteur choisit un jour et voit les animations de ce jour triées par heure de début, avec leur lieu et leurs horaires. S'il indique une heure, il ne voit que les animations en cours à cette heure, début inclus et fin exclue. Un jour ou une heure illisible est refusé avec un message qui nomme le champ en cause. Le travail tient en six tâches, dans l'ordre des couches : les schémas partagés, le domaine, l'application, la persistance avec les données de démo, la route HTTP, puis l'écran. Charger le programme officiel (TR2), retirer une animation (TR3), l'itinéraire (TR4) et les questions en langage courant (TR5) sont laissés aux tranches suivantes : aucune route n'écrit d'animation dans cette tranche.

Les mots de la spec et leur nom dans le code :

| Dans la spec           | Dans le code         | Ce que c'est                                                                          |
| ---------------------- | -------------------- | ------------------------------------------------------------------------------------- |
| animations (le module) | `animations`         | Le module d'API qui lit les animations du guide.                                      |
| animation              | `Animation`          | Un événement du programme : un nom, un lieu, une heure de début et de fin.            |
| nom de l'animation     | `title`              | Le nom affiché, par exemple « Concert de sabar ».                                     |
| lieu                   | `place`              | Le lieu en texte, par exemple « Place de l'Obélisque ».                               |
| heure de début, de fin | `startsAt`, `endsAt` | Les instants de début et de fin, en ISO 8601.                                         |
| jour                   | `date`               | Le jour demandé, au format `AAAA-MM-JJ` (par exemple `2026-11-01`).                   |
| heure donnée (filtre)  | `at`                 | L'heure du filtre « en cours », au format `HH:MM` (par exemple `15:00`).              |
| agenda du jour         | `GetDayAgenda`       | Le cas d'usage qui renvoie les animations d'un jour, triées, filtrées ou non.         |
| en cours               | `isInProgressAt`     | Vrai si l'instant est au moins le début et strictement avant la fin.                  |
| heure de Dakar         | UTC                  | Dakar est à UTC+0 toute l'année, sans heure d'été : un jour de Dakar est un jour UTC. |

## 2. Fichiers par couche

On crée le module `animations`, organisé comme le module Disciplines : un dossier par couche (`domain`, `application`, `infra`, `http`) sous `apps/api/src/modules/animations/`. Les chemins ci-dessous partent de ce dossier, sauf mention contraire.

- **shared** :
  - `packages/shared/src/animations.ts` contient les schémas Zod des données échangées. `agendaQuerySchema` décrit les paramètres de la requête : `date` est un jour qui existe au format `AAAA-MM-JJ` (`z.iso.date()`, qui refuse le 31 novembre), et `at`, facultatif, est une heure `HH:MM` entre `00:00` et `23:59` (`z.iso.time({ precision: -1 })`, qui refuse `25:00`). `animationSchema` décrit une animation renvoyée (`id`, `title`, `place`, `startsAt`, `endsAt`), et `animationListSchema` une liste d'animations.
  - `packages/shared/src/index.ts` réexporte ce nouveau fichier.
- **domain** :
  - `domain/animation.ts` définit l'entité `Animation`. `Animation.restore` la reconstruit depuis la persistance. `animation.isInProgressAt(instant)` renvoie vrai si `startsAt <= instant < endsAt` : c'est la règle « début inclus, fin exclue ».
  - `domain/agenda.ts` contient les règles de l'agenda, en fonctions pures. `agendaDay(date)` vérifie le jour et renvoie ses bornes (minuit inclus, minuit du lendemain exclu, en UTC), ou lève `AGENDA_DATE_INVALID`. `instantOf(date, at)` vérifie l'heure et renvoie l'instant correspondant, ou lève `AGENDA_TIME_INVALID`. `sortByStart(animations)` trie par heure de début, puis par nom dans l'ordre alphabétique quand deux animations commencent à la même heure.
  - `domain/animations.errors.ts` déclare la classe `AnimationError`, qui dérive de `AppError`, ses codes et leurs catégories (voir la section 4).
- **application** :
  - `application/animation.repository.ts` est le port de persistance `AnimationRepository`, avec une seule méthode : `listStartingBetween(from, to)`, qui renvoie les animations dont le début est dans `[from, to)`.
  - `application/testing/in-memory-animation.repository.ts` est un faux fidèle au contrat du port, pour tester l'application sans base.
  - `application/use-cases/get-day-agenda.ts` est le cas d'usage `GetDayAgenda`. `execute({ date, at })` calcule les bornes du jour, lit les animations qui commencent ce jour-là, les trie, puis, si `at` est donné, ne garde que celles qui sont en cours à cet instant.
- **infra** :
  - `infra/animations.schema.ts` décrit la table `animations` pour Drizzle (voir la section 3).
  - `infra/animation.mapper.ts` convertit une ligne de la table en entité.
  - `infra/drizzle-animation.repository.ts` implémente le port avec une requête `starts_at >= from and starts_at < to`.
  - `apps/api/migrations/0002_create_animations.sql` est la migration générée par `pnpm db:generate --name=create_animations`.
  - `apps/api/data/animations.json` contient l'extrait du programme officiel recopié pour la démo, chargé par `pnpm db:seed`. Il reprend les animations des scénarios (« Initiation au breaking », « Atelier lutte traditionnelle », « Concert de sabar » le 1er novembre, « Tournoi de dames » le 2 novembre).
- **http** :
  - `http/animations.controller.ts` est le controller fin : il valide la requête avec le DTO Zod, appelle `GetDayAgenda`, puis sérialise la réponse.
    - `GET /api/animations?date=2026-11-01` renvoie l'agenda du jour. Il répond 200 avec la liste triée `[{ id, title, place, startsAt, endsAt }]`, vide s'il n'y a aucune animation.
    - `GET /api/animations?date=2026-11-01&at=15:00` renvoie seulement les animations de ce jour en cours à 15 h. Il répond 200 avec la liste triée, vide si rien n'est en cours.
  - `animations.module.ts` relie le port `AnimationRepository` à `DrizzleAnimationRepository` et déclare `GetDayAgenda`.
  - `apps/api/src/app.module.ts` importe `AnimationsModule`.
- **web** : on crée la fonctionnalité `apps/web/src/features/animations/`, organisée comme `features/disciplines/`.
  - `api/animations.api.ts` fait l'appel `GET /animations` avec `date` et `at`, et valide la réponse avec `animationListSchema`.
  - `api/animations.queries.ts` déclare les clés de cache et le hook `useDayAgenda(date, at)`.
  - `components/agenda-page.tsx` est la page « Agenda » : un champ « Jour », un champ facultatif « En cours à », puis la liste. Elle affiche « Chargement… », un message d'erreur, ou la liste.
  - `components/animation-list.tsx` affiche chaque animation avec son nom, son lieu et ses horaires (heure de Dakar), ou « Aucune animation. » si la liste est vide.
  - `apps/web/src/routes/agenda.tsx` déclare la route `/agenda`, et `apps/web/src/routes/__root.tsx` ajoute le lien « Agenda » dans la navigation.
  - `apps/web/src/mocks/fixture.ts` ajoute les animations des scénarios, et `apps/web/src/mocks/handlers.ts` ajoute `GET */api/animations`, avec le même contrat que l'API.

## 3. Données

On stocke les animations dans une nouvelle table. Migration : `pnpm db:generate --name=create_animations`.

- Table `animations` :
  - `id` est un `uuid` et la clé primaire.
  - `title` est un `varchar(150)` non nul : une animation a toujours un nom à afficher (AS1).
  - `place` est un `varchar(150)` non nul : une animation a toujours un lieu à afficher (AS1).
  - `starts_at` et `ends_at` sont des `timestamptz(3)` non nuls : sans eux, ni le tri (AS1) ni le filtre « en cours » (AS3, AS4) ne sont possibles.
  - `created_at` est un `timestamptz(3)` non nul.
  - Un index sur `starts_at` sert la lecture d'un jour (AS2).

La règle « la fin est après le début » et la période des Jeux appartiennent à TR2, qui écrit les animations : on ne les ajoute pas ici.

## 4. Erreurs

Chaque refus de la spec devient une erreur métier (`AppError`), avec un code stable et un statut HTTP. Comme pour les disciplines, une requête invalide est d'abord refusée par la validation Zod de la couche HTTP (400, code `VALIDATION_FAILED`, avec le champ `date` ou `at` en cause) ; les codes du domaine le protègent quand il est appelé sans passer par HTTP. Une journée ou une heure sans animation n'est pas une erreur : la réponse est une liste vide (AS5).

| Code AppError         | Catégorie  | HTTP | Quand                                                     | Scénario |
| --------------------- | ---------- | ---- | --------------------------------------------------------- | -------- |
| `AGENDA_DATE_INVALID` | VALIDATION | 400  | Le jour n'existe pas ou n'est pas au format `AAAA-MM-JJ`. | AS6      |
| `AGENDA_TIME_INVALID` | VALIDATION | 400  | L'heure n'est pas une heure `HH:MM` entre 00:00 et 23:59. | AS6      |

## 5. Tests par scénario

Chaque scénario de la spec est prouvé par au moins un test, au niveau le plus bas qui suffit. Le test e2e vérifie en plus ce que l'appelant de l'API observe, et le test d'écran ce que le visiteur voit.

| Scénario | Fichier de test                                                                  | Niveau      | Ce que le test vérifie                                                                                               |
| -------- | -------------------------------------------------------------------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------- |
| AS1      | `apps/api/src/modules/animations/domain/agenda.spec.ts`                          | unitaire    | `sortByStart` renvoie breaking, lutte, sabar ; à heure égale, l'ordre alphabétique des noms.                         |
| AS1      | `apps/api/test/animations.e2e.spec.ts`                                           | e2e         | `GET /api/animations?date=2026-11-01` répond 200 avec les trois animations dans cet ordre, lieu et horaires compris. |
| AS1      | `apps/web/src/features/animations/components/agenda-page.test.tsx`               | écran       | La liste affiche les trois animations dans l'ordre, chacune avec son lieu et ses horaires.                           |
| AS2      | `apps/api/src/modules/animations/infra/drizzle-animation.repository.int.spec.ts` | intégration | `listStartingBetween` sur le 1er novembre renvoie « Initiation au breaking » et pas « Tournoi de dames ».            |
| AS2      | `apps/api/test/animations.e2e.spec.ts`                                           | e2e         | L'agenda du 1er novembre ne contient pas « Tournoi de dames ».                                                       |
| AS3      | `apps/api/src/modules/animations/application/animations.application.spec.ts`     | unitaire    | `GetDayAgenda` avec `at: '15:00'` renvoie seulement « Atelier lutte traditionnelle ».                                |
| AS3      | `apps/api/test/animations.e2e.spec.ts`                                           | e2e         | `GET …&at=15:00` répond 200 avec seulement « Atelier lutte traditionnelle » et son lieu.                             |
| AS3      | `apps/web/src/features/animations/components/agenda-page.test.tsx`               | écran       | Après saisie de 15:00 dans « En cours à », seule « Atelier lutte traditionnelle » reste affichée.                    |
| AS4      | `apps/api/src/modules/animations/domain/animation.spec.ts`                       | unitaire    | À 15 h, une animation 14 h – 15 h n'est pas en cours, une animation 15 h – 16 h l'est.                               |
| AS5      | `apps/api/src/modules/animations/application/animations.application.spec.ts`     | unitaire    | Un jour sans animation, ou une heure sans animation en cours, renvoie une liste vide sans erreur.                    |
| AS5      | `apps/web/src/features/animations/components/agenda-page.test.tsx`               | écran       | Une liste vide affiche « Aucune animation. », sans message d'erreur.                                                 |
| AS6      | `packages/shared/src/animations.spec.ts`                                         | unitaire    | Le schéma refuse `2026-11-31` sur `date` et `25:00` sur `at`.                                                        |
| AS6      | `apps/api/src/modules/animations/domain/agenda.spec.ts`                          | unitaire    | `agendaDay` lève `AGENDA_DATE_INVALID` et `instantOf` lève `AGENDA_TIME_INVALID`.                                    |
| AS6      | `apps/api/test/animations.e2e.spec.ts`                                           | e2e         | Réponse 400 `VALIDATION_FAILED` qui nomme le champ `date`, ou le champ `at`.                                         |

## 6. Tâches

Six tâches, dans l'ordre des couches. Chaque tâche nomme le test à écrire d'abord et cite les scénarios qu'elle couvre ; elle tient dans un commit.

- [x] T01 [002-AS6] Écrire d'abord `packages/shared/src/animations.spec.ts` (« 002-AS6: rejects a day that does not exist or an unreadable time »), puis `packages/shared/src/animations.ts` et son export dans `index.ts`
- [ ] T02 [002-AS1, AS4, AS6] Écrire d'abord `apps/api/src/modules/animations/domain/agenda.spec.ts` (« 002-AS1: sorts by start time, then by title », « 002-AS6: rejects an invalid day or time ») et `domain/animation.spec.ts` (« 002-AS4: in progress from the start, until the end excluded »), puis `domain/animation.ts`, `domain/agenda.ts` et `domain/animations.errors.ts`
- [ ] T03 [002-AS1, AS3, AS5] Écrire d'abord `application/animations.application.spec.ts` (« 002-AS3: keeps only the animations in progress at the given time », « 002-AS5: returns an empty agenda without error »…), puis le port `AnimationRepository`, `InMemoryAnimationRepository` et `GetDayAgenda`
- [ ] T04 [002-AS2] Écrire d'abord `infra/drizzle-animation.repository.int.spec.ts` (« 002-AS2: lists only the animations starting on the requested day »), puis `animations.schema.ts`, la migration générée, `animation.mapper.ts`, `DrizzleAnimationRepository` et `apps/api/data/animations.json`
- [ ] T05 [002-AS1, AS2, AS3, AS5, AS6] Écrire d'abord `apps/api/test/animations.e2e.spec.ts` (« 002-AS3: returns only the animations in progress at 15:00 », « 002-AS6: rejects an unreadable time (400, VALIDATION_FAILED) »…), qui insère ses animations directement en base, puis `animations.controller.ts`, `animations.module.ts` et l'import dans `app.module.ts`
- [ ] T06 [002-AS1, AS3, AS5] Écrire d'abord `apps/web/src/features/animations/components/agenda-page.test.tsx` (« 002-AS1: shows the day agenda sorted by start time, with places », « 002-AS3: keeps only what is in progress at 15:00 », « 002-AS5: says there is no animation ») et la route ajoutée dans `mocks/handlers.test.ts`, puis la fausse API, `animations.api.ts`, `animations.queries.ts`, `agenda-page.tsx`, `animation-list.tsx`, la route `/agenda` et le lien de navigation
