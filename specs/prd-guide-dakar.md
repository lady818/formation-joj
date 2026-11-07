# PRD — Guide JOJ Dakar

**Statut** : Validé

## Problème

Des milliers de visiteurs et supporters sont à Dakar pour les Jeux, souvent pour la première fois : un supporter venu de Thiès a trois heures libres entre deux épreuves à Diamniadio. Les animations sont annoncées un peu partout (réseaux sociaux, affiches, bouche-à-oreille) : il ne sait ni ce qui se passe maintenant, ni où, ni comment y aller, et finit par attendre sur place.

## Utilisateurs

- Visiteur ou supporter de passage : savoir quoi faire maintenant, où, et combien de temps il lui faut pour y aller.
- Admin du guide : charger le programme officiel dans le guide et retirer ce qui est annulé, pour que le visiteur ne se déplace pas pour rien.

## Proposition

Un guide qui reprend le programme officiel des JOJ et répond à « qu'est-ce que je peux faire maintenant, où, et comment y aller ? ». Un seul endroit remplace les annonces dispersées : un admin y charge le programme officiel et le garde fiable. Un assistant IA répond ensuite à une question en langage courant : le visiteur n'a pas à connaître les noms des animations. Chaque tranche apporte au visiteur son propre écran.

## Mesure du succès

Pendant la démo : à 15 h, seules les animations en cours s'affichent, et l'agenda du jour est trié par heure avec les lieux ; le programme officiel chargé par l'admin apparaît dans le guide, et un mauvais code d'accès est refusé ; une animation retirée par l'admin disparaît ; un temps à pied et en voiture s'affiche depuis un site connu, un site inconnu est refusé ; une question renvoie au plus trois animations réelles, une question vide est refusée.

## Tranches

### TR1 — Agenda du jour, avec filtre « en cours »

Le visiteur consulte l'agenda d'une journée : les animations triées par heure de début, avec leur lieu. Un filtre « en cours à telle heure » ne garde que ce qui se passe à ce moment-là. Règle : une animation est en cours si l'heure est au moins son début et avant sa fin (début inclus, fin exclue).

### TR2 — L'admin charge le programme officiel

L'admin, avec son code d'accès, charge dans le guide le programme publié sur le site officiel des JOJ. Règles : sans le bon code d'accès, l'admin est refusé ; une animation dont la fin n'est pas après le début, ou hors des Jeux (31 octobre – 13 novembre 2026), est écartée.

### TR3 — L'admin retire une animation annulée

L'admin, avec son code d'accès, retire une animation annulée ou erronée. Règles : sans le bon code d'accès, le retrait est refusé ; une animation retirée n'apparaît plus nulle part dans le guide.

### TR4 — Itinéraire vers une animation

Le visiteur choisit une animation et indique son site de départ parmi les lieux connus du guide (et non sa position exacte). Il voit sur une carte l'itinéraire, avec le temps de trajet à pied et en voiture. Règle : un site de départ inconnu est refusé.

### TR5 — Question en langage courant

Le visiteur pose une question en langage courant et reçoit jusqu'à trois animations du jour, expliquées par un assistant IA. Règles : une question vide est refusée ; seules des animations qui existent dans le guide sont proposées.

## Hors périmètre

- Les comptes (l'admin a un code d'accès, le visiteur reste anonyme), la réservation, les traductions, le transport en commun, la saisie animation par animation et la publication par les organisateurs.

## Hypothèses et risques

- Supposé : en TR1, un extrait du programme officiel est recopié pour la démo ; les heures sont celles de Dakar ; une animation tient dans une journée. Risque : on n'a pas le droit de reprendre le programme officiel, à vérifier avant TR2 ; un code d'accès partagé peut fuiter.
