# 001 — Bénévoles : ouvrir un créneau et s'y inscrire

**Statut** : Validée
**PRD** : specs/prd-benevoles.md, TR1

## Contexte

Les responsables de discipline gèrent les bénévoles d'accueil sur papier, et des créneaux débordent. Cette première tranche permet d'ouvrir un créneau avec une capacité et d'y inscrire des bénévoles, en refusant toute inscription au-delà de la capacité. Elle s'utilise par l'API, sans écran.

## User stories

- En tant que responsable de discipline, je veux ouvrir un créneau d'accueil avec un début, une fin et une capacité, afin de recruter le bon nombre de bénévoles.
- En tant que bénévole, je veux m'inscrire à un créneau avec mon nom et mon email, afin de réserver ma place.

## Scénarios d'acceptation

### AS1 — Ouvrir un créneau

- **Étant donné** la discipline « Lutte »
- **Quand** le responsable ouvre un créneau de 9 h à 12 h le 1er novembre, de capacité 2
- **Alors** le créneau est enregistré pour « Lutte » avec ce début, cette fin, la capacité 2 et aucun inscrit

### AS2 — Créneau invalide

- **Étant donné** une capacité inférieure à 1, ou une fin qui n'est pas après le début
- **Quand** le responsable ouvre le créneau
- **Alors** c'est refusé avec un message qui dit pourquoi, et aucun créneau n'est enregistré

### AS3 — Discipline introuvable

- **Étant donné** une discipline qui n'existe pas
- **Quand** le responsable ouvre un créneau pour elle
- **Alors** l'application dit que la discipline est introuvable, et aucun créneau n'est enregistré

### AS4 — S'inscrire à un créneau

- **Étant donné** un créneau de capacité 2 sans inscrit
- **Quand** Awa Diop (awa@example.org) s'y inscrit
- **Alors** son inscription est enregistrée avec son nom et son email, et le créneau compte 1 inscrit

### AS5 — Inscription invalide

- **Étant donné** un nom vide, ou un email sans forme d'email
- **Quand** le bénévole s'inscrit à un créneau
- **Alors** c'est refusé avec un message qui dit pourquoi, et rien n'est enregistré

### AS6 — Créneau complet

- **Étant donné** un créneau de capacité 2 qui compte déjà 2 inscrits
- **Quand** un troisième bénévole s'y inscrit
- **Alors** c'est refusé : refus 409 avec le code SLOT_FULL, et le créneau compte toujours 2 inscrits

### AS7 — Créneau introuvable

- **Étant donné** un créneau qui n'existe pas
- **Quand** un bénévole s'y inscrit
- **Alors** l'application dit que le créneau est introuvable, et rien n'est enregistré

## Hors périmètre

- Consulter un créneau et ses inscrits, et refuser un email déjà inscrit (TR2).
- Se désinscrire, et tout écran (TR3).
- Modifier ou supprimer un créneau, les emails de confirmation, les comptes.

## Questions ouvertes

- Deux créneaux d'une même discipline peuvent-ils se chevaucher ? Hypothèse : oui, rien ne l'interdit.
- Un créneau peut-il commencer dans le passé ? Hypothèse : oui, aucune règle sur la date.
- Nom et email ont-ils une longueur maximale ? Hypothèse : 100 caractères pour le nom, comme pour les disciplines ; le plan fixe celle de l'email.
