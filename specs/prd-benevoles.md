# PRD — Bénévoles

**Statut** : Validé

## Problème

Chaque discipline a besoin de bénévoles pour accueillir le public. Les responsables de discipline gèrent les inscriptions sur papier, et des créneaux débordent : plus de bénévoles inscrits que de places prévues.

## Utilisateurs

- Responsable de discipline : ouvre des créneaux d'accueil et sait qui y viendra.
- Bénévole : s'inscrit à un créneau, et s'en retire s'il ne peut plus venir.

## Proposition

Le responsable ouvre un créneau avec une capacité ; les bénévoles s'y inscrivent ; l'application refuse toute inscription au-delà de la capacité. Contrairement à la feuille papier, la limite est appliquée au moment de l'inscription, et non constatée après coup.

## Mesure du succès

Pendant la démo, un créneau de capacité 2 accepte deux bénévoles et refuse le troisième.

## Tranches

### TR1 — Ouvrir un créneau et s'y inscrire

Le responsable ouvre un créneau avec une capacité ; un bénévole s'y inscrit. Règle : jamais plus d'inscrits que la capacité ; l'inscription de trop est refusée.

### TR2 — Consulter un créneau et ses inscrits

Le responsable consulte un créneau et la liste de ses inscrits. Règle : un même email ne peut pas être inscrit deux fois au même créneau.

### TR3 — Se désinscrire, et un écran pour le bénévole

Le bénévole se désinscrit d'un créneau, ce qui libère sa place. Un écran permet de voir un créneau, de s'y inscrire et de s'en désinscrire.

## Hors périmètre

- La modification ou la suppression d'un créneau.
- Les emails de confirmation.
- Les comptes des bénévoles.

## Hypothèses et risques

- Hypothèse : un créneau appartient à une discipline et se décrit par une date et un horaire. Si le responsable a besoin d'autres informations (lieu, poste), il faudra les ajouter.
- Hypothèse : le bénévole est identifié par son nom et son email, sans compte. Risque : n'importe qui peut désinscrire un autre bénévole en connaissant son email.
- Hypothèse : n'importe qui peut ouvrir un créneau, faute de comptes. Risque : un créneau ouvert par erreur ne peut être ni corrigé ni supprimé.
