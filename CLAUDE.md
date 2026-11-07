# CLAUDE.md

Application d'organisation des JOJ Dakar 2026 : une API NestJS (`apps/api`), un front React (`apps/web`) et des schémas partagés (`packages/shared`), dans un monorepo pnpm. Commandes et structure détaillée : `README.md`.

## Méthodologie

- Toute fonctionnalité suit le cycle `/spec` → `/spec-plan` → `/tdd-task` → `/converge`, avec une validation humaine après la spec et après le plan. Les règles communes sont dans `specs/constitution.md`.
- La spec (`specs/NNN-nom/spec.md`) dit le quoi et le pourquoi, sans technique ; le plan dit le comment, six tâches au plus, un test prévu par scénario.
- Test d'abord : aucun code de production sans un test vu en échec pour la bonne raison (`pnpm tdd:red <fichier>`), puis le code minimal pour le faire passer.
- Une tâche = un commit. `pnpm verify` tourne avant chaque commit (lefthook) ; `pnpm check` valide tout le dépôt.
- Celui qui produit ne valide pas : le sous-agent `relecteur` relit avec seulement la base git et le dossier de la spec.

## Architecture

- Un module Nest par domaine dans `apps/api/src/modules/<domaine>/`, sur le modèle de `disciplines` : `domain/` (entités, règles, erreurs), `application/` (port repository + cas d'usage), `infra/` (table Drizzle, mapper, repository), `http/` (controller).
- `domain/` reste du TypeScript pur : ni NestJS, ni Drizzle, ni `pg`/PGlite (vérifié par oxlint), ni horloge ni hasard : l'identifiant et la date sont passés par le cas d'usage.
- Le repository est un port (classe abstraite) dans `application/`, implémenté en Drizzle dans `infra/` et en mémoire dans `application/testing/` ; le module Nest relie le port à son implémentation.
- Le controller est fin : valider (DTO `createZodDto`), appeler un cas d'usage, sérialiser. Aucune règle métier, aucun accès au repository.
- Les schémas Zod d'entrée et de réponse vivent dans `packages/shared` et servent à l'API comme au front.
- Front : pages dans `apps/web/src/routes/` (TanStack Router, un fichier = une route), fonctionnalités dans `src/features/<nom>/` avec `api/` (appels HTTP + hooks TanStack Query) et `components/` ; composants shadcn dans `src/components/ui/`.
- Transverse API dans `src/core/` (config, base, erreurs, santé). Migrations générées par `pnpm db:generate`, jamais éditées à la main.

## Concepts appréciés

- Typage strict (`strict`, `noUncheckedIndexedAccess`) : pas de `any`, types dérivés des schémas (`z.infer`).
- Entités au constructeur privé : `create()` applique les règles, `restore()` relit la base sans les rejouer ; état encapsulé derrière des getters et des méthodes métier (`rename()`).
- Une classe par cas d'usage, avec une seule méthode `execute()`.
- Listes fermées en `as const` (`DISCIPLINE_CATEGORIES`) et unions littérales plutôt que des chaînes libres.
- Fonctions courtes ; commentaires JSDoc en français qui disent le pourquoi, pas le comment.
- Clés de cache TanStack Query regroupées par fonctionnalité (`disciplineKeys`) ; après une mutation, on invalide plutôt que de patcher le cache.

## Bonnes pratiques

- Toute erreur métier est une sous-classe d'`AppError` (code stable + catégorie VALIDATION, NOT_FOUND, CONFLICT ou BUSINESS_RULE). Seul `ProblemDetailsFilter` la transforme en HTTP (RFC 9457). Jamais de `HttpException`, ni de `throw new Error()` hors `infra/`.
- Le domaine revalide ses invariants : il ne fait pas confiance à la validation HTTP.
- Chaque scénario d'acceptation a un test dont le titre commence par son identifiant.
- Tests API par niveau : domaine (`*.spec.ts`), cas d'usage avec le repository en mémoire, repository Drizzle sur PGlite en mémoire (`*.int.spec.ts`), e2e supertest (`test/*.e2e.spec.ts`).
- Front : une seule fausse API MSW (`src/mocks/`) au même contrat que l'API ; tests à côté du fichier testé, ouverts par un commentaire qui dit ce qu'ils prouvent ; un audit d'accessibilité (`*.a11y.test.tsx`) par état d'écran.
- Aucun secret dans le code : les valeurs vont dans `apps/api/.env` (un hook le refuse). Jamais de `--no-verify`.

## Nommage

- Fichiers en kebab-case : `create-discipline.ts`, `drizzle-discipline.repository.ts`, `disciplines.errors.ts`, `discipline.mapper.ts`.
- Classes en PascalCase ; cas d'usage nommés par un verbe : `CreateDiscipline`, `ListDisciplines`. Erreur de domaine : `DisciplineError`.
- Codes d'erreur en SCREAMING_SNAKE_CASE préfixés par le domaine : `DISCIPLINE_NAME_TAKEN`.
- Schémas Zod en camelCase suffixés `Schema` (`createDisciplineSchema`), types en PascalCase (`CreateDisciplineInput`, `DisciplineResponse`).
- Titres de tests en anglais, préfixés par le scénario : `it('001-AS2: rejects a full slot')` (`AS2:` seul pour `disciplines`).
- Commits Conventional Commits en anglais, citant la tâche et le scénario : `feat(benevoles): T03 refuse a full slot (001-AS2)`.
- Code et messages d'erreur en anglais ; commentaires et documentation en français.
