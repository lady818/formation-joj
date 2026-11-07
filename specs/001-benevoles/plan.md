# 001 — Bénévoles : ouvrir un créneau et s'y inscrire : plan

**Statut** : Validé

## 1. Résumé

On construit un nouveau module d'API, `volunteers`, qui gère les créneaux d'accueil d'une discipline et les inscriptions des bénévoles. Une fois les tâches terminées, un responsable pourra ouvrir un créneau (début, fin, capacité) pour une discipline existante, et un bénévole pourra s'y inscrire avec son nom et son email ; l'inscription de trop sera refusée avec un statut 409 et le code `SLOT_FULL`, même si deux bénévoles s'inscrivent au même instant. Le travail tient en six tâches, dans l'ordre des couches : les schémas partagés, le domaine (le créneau, puis l'inscription), l'application, la persistance, puis les routes HTTP. La consultation d'un créneau, le refus d'un email déjà inscrit, la désinscription et tout écran sont laissés aux tranches suivantes.

Les mots de la spec et leur nom dans le code :

| Dans la spec          | Dans le code         | Ce que c'est                                                         |
| --------------------- | -------------------- | -------------------------------------------------------------------- |
| bénévoles (le module) | `volunteers`         | Le module d'API qui regroupe créneaux et inscriptions.               |
| créneau               | `Slot`               | Une plage horaire d'accueil d'une discipline, avec une capacité.     |
| début, fin            | `startsAt`, `endsAt` | Les instants de début et de fin du créneau, en ISO 8601 avec fuseau. |
| capacité              | `capacity`           | Le nombre maximal d'inscrits du créneau, entier d'au moins 1.        |
| nombre d'inscrits     | `registeredCount`    | Le nombre d'inscriptions déjà enregistrées sur le créneau.           |
| inscription           | `Registration`       | L'inscription d'un bénévole (nom, email) sur un créneau.             |
| ouvrir un créneau     | `OpenSlot`           | Le cas d'usage qui crée un créneau pour une discipline.              |
| s'inscrire            | `RegisterVolunteer`  | Le cas d'usage qui inscrit un bénévole sur un créneau.               |

## 2. Fichiers par couche

On crée le module `volunteers`, organisé comme le module Disciplines : un dossier par couche (`domain`, `application`, `infra`, `http`) sous `apps/api/src/modules/volunteers/`. Les chemins ci-dessous partent de ce dossier, sauf mention contraire.

- **shared** :
  - `packages/shared/src/volunteers.ts` contient les schémas Zod des données échangées : le corps d'ouverture d'un créneau (`openSlotSchema` : `startsAt`, `endsAt`, `capacity` entier d'au moins 1, fin après le début), le corps d'inscription (`registerVolunteerSchema` : `name` de 1 à 100 caractères après suppression des espaces, `email` au format email de 254 caractères au plus), les paramètres de route (`disciplineId`, `slotId` en UUID) et les réponses (`slotSchema`, `registrationSchema`). Il exporte aussi les longueurs maximales.
  - `packages/shared/src/index.ts` réexporte ce nouveau fichier.
- **domain** :
  - `domain/slot.ts` définit l'entité `Slot`. `Slot.create` vérifie que la capacité est un entier d'au moins 1 et que la fin est après le début. `slot.register(...)` refuse avec `SLOT_FULL` quand `registeredCount` a atteint `capacity`, sinon crée l'inscription et augmente le compte. `Slot.restore` reconstruit un créneau lu en base.
  - `domain/registration.ts` définit l'entité `Registration`. `Registration.create` supprime les espaces autour du nom, refuse un nom vide ou trop long, et refuse un email mal formé ou trop long.
  - `domain/volunteers.errors.ts` déclare la classe `VolunteerError`, qui dérive de `AppError`, ses codes et leurs catégories (voir la section 4).
- **application** :
  - `application/slot.repository.ts` est le port de persistance `SlotRepository` : `insert(slot)`, `findById(id)` et `registerInSlot(slotId, register)`. Cette dernière méthode verrouille le créneau, le passe à `register` (qui applique la règle de capacité du domaine), puis enregistre l'inscription renvoyée. Elle renvoie `null` si le créneau n'existe pas. Elle sert aussi à compter les inscrits sans risque de course.
  - `application/testing/in-memory-slot.repository.ts` est un faux fidèle au contrat du port, pour tester l'application sans base.
  - `application/use-cases/open-slot.ts` est le cas d'usage `OpenSlot`. Il cherche la discipline avec le `DisciplineRepository` du module Disciplines, lève `DISCIPLINE_NOT_FOUND` si elle n'existe pas, puis crée le créneau et l'enregistre.
  - `application/use-cases/register-volunteer.ts` est le cas d'usage `RegisterVolunteer`. Il appelle `registerInSlot` et lève `SLOT_NOT_FOUND` si le créneau n'existe pas.
- **infra** :
  - `infra/volunteers.schema.ts` décrit les tables `slots` et `registrations` pour Drizzle (voir la section 3).
  - `infra/slot.mapper.ts` convertit une ligne de la table en entité, et inversement.
  - `infra/drizzle-slot.repository.ts` implémente le port. `registerInSlot` ouvre une transaction, lit le créneau avec `SELECT … FOR UPDATE`, compte ses inscriptions, appelle `register`, insère l'inscription, puis valide la transaction.
  - `apps/api/migrations/0001_create_volunteers.sql` est la migration générée par `pnpm db:generate --name=create_volunteers`.
- **http** :
  - `http/volunteers.controller.ts` est le controller fin : il valide l'entrée avec les DTO Zod, appelle un cas d'usage, puis sérialise la réponse.
    - `POST /api/disciplines/:disciplineId/slots` ouvre un créneau pour la discipline. Il répond 201 avec le créneau `{ id, disciplineId, startsAt, endsAt, capacity, registeredCount: 0 }`.
    - `POST /api/slots/:slotId/registrations` inscrit un bénévole sur le créneau. Il répond 201 avec l'inscription `{ id, slotId, name, email, createdAt }`.
  - `volunteers.module.ts` relie le port `SlotRepository` à `DrizzleSlotRepository`, déclare les cas d'usage et importe `DisciplinesModule`.
  - `apps/api/src/modules/disciplines/disciplines.module.ts` exporte `DisciplineRepository`, pour que `OpenSlot` puisse vérifier qu'une discipline existe.
  - `apps/api/src/app.module.ts` importe `VolunteersModule`.
- **web** : rien. La spec ne demande que l'API ; l'écran arrive avec TR3.

## 3. Données

On stocke les créneaux et les inscriptions dans deux nouvelles tables. Migration : `pnpm db:generate --name=create_volunteers`.

- Table `slots` :
  - `id` est un `uuid` et la clé primaire.
  - `discipline_id` est un `uuid` non nul, clé étrangère vers `disciplines.id` avec `on delete cascade`. Cette contrainte protège la règle « un créneau appartient à une discipline existante » (AS3), même si une requête contourne le cas d'usage.
  - `starts_at` et `ends_at` sont des `timestamptz(3)` non nuls. La contrainte de vérification `slots_ends_after_starts` (`ends_at > starts_at`) protège la règle de AS2.
  - `capacity` est un `integer` non nul. La contrainte de vérification `slots_capacity_positive` (`capacity >= 1`) protège la règle de AS2.
  - `created_at` est un `timestamptz(3)` non nul.
- Table `registrations` :
  - `id` est un `uuid` et la clé primaire.
  - `slot_id` est un `uuid` non nul, clé étrangère vers `slots.id` avec `on delete cascade`. Cette contrainte protège la règle « une inscription porte sur un créneau existant » (AS7).
  - `name` est un `varchar(100)` non nul, et `email` un `varchar(254)` non nul.
  - `created_at` est un `timestamptz(3)` non nul.
  - Il n'y a pas d'index unique sur `(slot_id, email)` : le refus d'un email déjà inscrit appartient à TR2.

La capacité ne peut pas s'exprimer par une contrainte de table. Elle est protégée par le verrou `FOR UPDATE` sur la ligne du créneau, pris pendant toute l'inscription : deux inscriptions simultanées au même créneau passent l'une après l'autre (AS6).

## 4. Erreurs

Chaque refus de la spec devient une erreur métier (`AppError`), avec un code stable et un statut HTTP. Comme pour les disciplines, un corps de requête invalide est d'abord refusé par la validation Zod de la couche HTTP (400, code `VALIDATION_FAILED`, avec la liste des champs en cause) ; les codes `VALIDATION` du domaine le protègent quand il est appelé sans passer par HTTP.

| Code AppError                | Catégorie  | HTTP | Quand                                                           | Scénario |
| ---------------------------- | ---------- | ---- | --------------------------------------------------------------- | -------- |
| `SLOT_CAPACITY_INVALID`      | VALIDATION | 400  | La capacité n'est pas un entier d'au moins 1.                   | AS2      |
| `SLOT_ENDS_BEFORE_START`     | VALIDATION | 400  | La fin n'est pas strictement après le début.                    | AS2      |
| `DISCIPLINE_NOT_FOUND`       | NOT_FOUND  | 404  | La discipline du créneau n'existe pas (code déjà existant).     | AS3      |
| `REGISTRATION_NAME_REQUIRED` | VALIDATION | 400  | Le nom est vide ou fait seulement d'espaces.                    | AS5      |
| `REGISTRATION_NAME_TOO_LONG` | VALIDATION | 400  | Le nom dépasse 100 caractères.                                  | AS5      |
| `REGISTRATION_EMAIL_INVALID` | VALIDATION | 400  | L'email n'a pas la forme d'un email, ou dépasse 254 caractères. | AS5      |
| `SLOT_FULL`                  | CONFLICT   | 409  | Le créneau compte déjà autant d'inscrits que sa capacité.       | AS6      |
| `SLOT_NOT_FOUND`             | NOT_FOUND  | 404  | Aucun créneau n'a cet identifiant.                              | AS7      |

## 5. Tests par scénario

Chaque scénario de la spec est prouvé par au moins un test, au niveau le plus bas qui suffit. Le test e2e de chaque scénario vérifie en plus le statut HTTP et le code d'erreur que l'appelant observe.

| Scénario | Fichier de test                                                              | Niveau      | Ce que le test vérifie                                                                                                                     |
| -------- | ---------------------------------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| AS1      | `apps/api/src/modules/volunteers/domain/slot.spec.ts`                        | unitaire    | Le créneau créé porte la discipline, le début, la fin, la capacité 2 et 0 inscrit.                                                         |
| AS1      | `apps/api/test/volunteers.e2e.spec.ts`                                       | e2e         | `POST …/slots` répond 201 avec ce créneau et `registeredCount: 0`.                                                                         |
| AS2      | `packages/shared/src/volunteers.spec.ts`                                     | unitaire    | Le schéma refuse une capacité de 0, une capacité non entière, et une fin égale ou antérieure au début.                                     |
| AS2      | `apps/api/src/modules/volunteers/domain/slot.spec.ts`                        | unitaire    | `Slot.create` lève `SLOT_CAPACITY_INVALID` ou `SLOT_ENDS_BEFORE_START`.                                                                    |
| AS2      | `apps/api/test/volunteers.e2e.spec.ts`                                       | e2e         | Réponse 400 `VALIDATION_FAILED` qui nomme le champ en cause.                                                                               |
| AS3      | `apps/api/src/modules/volunteers/application/volunteers.application.spec.ts` | unitaire    | `OpenSlot` lève `DISCIPLINE_NOT_FOUND` et aucun créneau n'est enregistré.                                                                  |
| AS3      | `apps/api/test/volunteers.e2e.spec.ts`                                       | e2e         | Réponse 404 avec le code `DISCIPLINE_NOT_FOUND`.                                                                                           |
| AS4      | `apps/api/src/modules/volunteers/application/volunteers.application.spec.ts` | unitaire    | L'inscription porte le nom et l'email d'Awa Diop, et le créneau compte 1 inscrit.                                                          |
| AS4      | `apps/api/src/modules/volunteers/infra/drizzle-slot.repository.int.spec.ts`  | intégration | Après `registerInSlot`, relire le créneau donne 1 inscrit.                                                                                 |
| AS4      | `apps/api/test/volunteers.e2e.spec.ts`                                       | e2e         | `POST …/registrations` répond 201 avec le nom et l'email.                                                                                  |
| AS5      | `packages/shared/src/volunteers.spec.ts`                                     | unitaire    | Le schéma refuse un nom vide ou fait d'espaces, et un email sans forme d'email.                                                            |
| AS5      | `apps/api/src/modules/volunteers/domain/registration.spec.ts`                | unitaire    | `Registration.create` lève `REGISTRATION_NAME_REQUIRED`, `REGISTRATION_NAME_TOO_LONG` ou `REGISTRATION_EMAIL_INVALID`.                     |
| AS5      | `apps/api/test/volunteers.e2e.spec.ts`                                       | e2e         | Réponse 400 `VALIDATION_FAILED`, et le créneau compte toujours 0 inscrit.                                                                  |
| AS6      | `apps/api/src/modules/volunteers/domain/slot.spec.ts`                        | unitaire    | `slot.register` lève `SLOT_FULL` (catégorie CONFLICT) sur un créneau plein, et le compte reste à 2.                                        |
| AS6      | `apps/api/src/modules/volunteers/infra/drizzle-slot.repository.int.spec.ts`  | intégration | Trois inscriptions lancées en même temps sur un créneau de capacité 2 : deux réussissent, une lève `SLOT_FULL`, la base compte 2 inscrits. |
| AS6      | `apps/api/test/volunteers.e2e.spec.ts`                                       | e2e         | Le troisième `POST …/registrations` répond 409 avec le code `SLOT_FULL`.                                                                   |
| AS7      | `apps/api/src/modules/volunteers/application/volunteers.application.spec.ts` | unitaire    | `RegisterVolunteer` lève `SLOT_NOT_FOUND` sur un créneau inconnu.                                                                          |
| AS7      | `apps/api/test/volunteers.e2e.spec.ts`                                       | e2e         | Réponse 404 avec le code `SLOT_NOT_FOUND`.                                                                                                 |

## 6. Tâches

Six tâches, dans l'ordre des couches. Chaque tâche nomme le test à écrire d'abord et cite les scénarios qu'elle couvre ; elle tient dans un commit.

- [x] T01 [001-AS1, AS2, AS4, AS5] Écrire d'abord `packages/shared/src/volunteers.spec.ts` (« 001-AS2: rejects a capacity below 1 or an end before the start », « 001-AS5: rejects an empty name or a malformed email »), puis `packages/shared/src/volunteers.ts` et son export dans `index.ts`
- [ ] T02 [001-AS1, AS2] Écrire d'abord `apps/api/src/modules/volunteers/domain/slot.spec.ts` (« 001-AS1: opens a slot with no registration », « 001-AS2: rejects an invalid capacity or time range »), puis `domain/slot.ts` (création seulement) et `domain/volunteers.errors.ts`
- [ ] T03 [001-AS4, AS5, AS6] Écrire d'abord `domain/registration.spec.ts` (« 001-AS5: rejects an empty name or a malformed email ») et compléter `domain/slot.spec.ts` (« 001-AS4: registers a volunteer and counts one », « 001-AS6: refuses a full slot »), puis `domain/registration.ts` et `Slot.register`
- [ ] T04 [001-AS1, AS3, AS4, AS7] Écrire d'abord `application/volunteers.application.spec.ts` (« 001-AS3: refuses a slot for an unknown discipline », « 001-AS7: refuses an unknown slot »…), puis le port `SlotRepository`, `InMemorySlotRepository`, `OpenSlot` et `RegisterVolunteer`
- [ ] T05 [001-AS4, AS6] Écrire d'abord `infra/drizzle-slot.repository.int.spec.ts` (« 001-AS6: never registers more volunteers than the capacity, even concurrently »), puis `volunteers.schema.ts`, la migration générée, `slot.mapper.ts` et `DrizzleSlotRepository`
- [ ] T06 [001-AS1, AS2, AS3, AS4, AS5, AS6, AS7] Écrire d'abord `apps/api/test/volunteers.e2e.spec.ts` (« 001-AS6: rejects a third registration (409, SLOT_FULL) »…), puis `volunteers.controller.ts`, `volunteers.module.ts`, l'export de `DisciplineRepository` et l'import dans `app.module.ts`
