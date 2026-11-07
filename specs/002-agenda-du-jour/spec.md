# 002 — Guide Dakar : agenda du jour, avec filtre « en cours »

**Statut** : Implémentée
**PRD** : specs/prd-guide-dakar.md, TR1

## Contexte

Un supporter a quelques heures libres entre deux épreuves, mais les animations sont annoncées un peu partout : il ne sait ni ce qui se passe maintenant, ni où. Cette première tranche lui donne l'agenda d'une journée, trié par heure avec les lieux, et un filtre qui ne garde que ce qui est en cours à une heure donnée. Les animations sont un extrait du programme officiel, recopié pour la démo.

## User stories

- En tant que visiteur, je veux voir l'agenda d'une journée trié par heure de début avec le lieu de chaque animation, afin de choisir où aller.
- En tant que visiteur, je veux ne garder que les animations en cours à une heure donnée, afin de savoir ce que je peux faire maintenant.

## Scénarios d'acceptation

### AS1 — Agenda d'une journée trié par heure

- **Étant donné** le 1er novembre 2026, « Concert de sabar » (Place de l'Obélisque, 16 h – 18 h), « Initiation au breaking » (Village des Jeux, Diamniadio, 10 h – 12 h) et « Atelier lutte traditionnelle » (Arène nationale, 14 h – 15 h 30)
- **Quand** le visiteur consulte l'agenda du 1er novembre 2026
- **Alors** il voit, dans cet ordre, « Initiation au breaking », « Atelier lutte traditionnelle » puis « Concert de sabar », chacune avec son lieu, son heure de début et son heure de fin

### AS2 — Seules les animations du jour demandé

- **Étant donné** « Initiation au breaking » le 1er novembre 2026 et « Tournoi de dames » le 2 novembre 2026
- **Quand** le visiteur consulte l'agenda du 1er novembre 2026
- **Alors** il voit « Initiation au breaking », et pas « Tournoi de dames »

### AS3 — Filtre « en cours »

- **Étant donné** les trois animations du 1er novembre 2026 de l'AS1
- **Quand** le visiteur filtre l'agenda du 1er novembre 2026 sur ce qui est en cours à 15 h
- **Alors** il voit uniquement « Atelier lutte traditionnelle », avec son lieu

### AS4 — Début inclus, fin exclue

- **Étant donné** le 1er novembre 2026, « Atelier lutte traditionnelle » (14 h – 15 h) et « Démonstration de taekwondo » (15 h – 16 h)
- **Quand** le visiteur filtre sur ce qui est en cours à 15 h
- **Alors** il voit uniquement « Démonstration de taekwondo » : une animation est en cours à partir de son début et jusqu'à sa fin, fin non comprise

### AS5 — Aucune animation

- **Étant donné** une journée sans animation, ou une heure où rien n'est en cours
- **Quand** le visiteur consulte l'agenda ou le filtre « en cours »
- **Alors** il voit une liste vide et un message qui dit qu'il n'y a aucune animation, sans erreur

### AS6 — Jour ou heure illisible

- **Étant donné** un jour qui n'existe pas (« 31 novembre 2026 ») ou une heure illisible (« 25 h »)
- **Quand** le visiteur consulte l'agenda ou le filtre « en cours »
- **Alors** c'est refusé avec un message qui dit quel jour ou quelle heure est en cause

## Hors périmètre

- Charger le programme officiel dans le guide (TR2) ; retirer une animation (TR3).
- L'itinéraire vers une animation (TR4) ; les questions en langage courant (TR5).
- Les animations qui commencent bientôt, les catégories, la recherche par lieu.

## Questions ouvertes

- Deux animations commencent à la même heure : dans quel ordre ? Hypothèse : par nom, dans l'ordre alphabétique.
- Un jour hors des Jeux (avant le 31 octobre ou après le 13 novembre 2026) est-il refusé ? Hypothèse : non, l'agenda est simplement vide (AS5).
- Le filtre « en cours » sans heure précisée prend-il l'heure actuelle ? Hypothèse : non, l'heure est toujours donnée, pour que la démo soit reproductible.
- Les heures sont celles de Dakar, et une animation tient dans une seule journée (hypothèse du PRD).
- L'écran se limite à une liste lisible : jour, filtre « en cours », animations avec lieu et horaires.
