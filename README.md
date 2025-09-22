Texas Hold’em 3D – React/Three.js

Un jeu de Texas Hold’em poker interactif en 3D construit avec React, React Three Fiber, et Zustand. Les joueurs peuvent affronter des bots, suivre le pot, et voir les cartes se dévoiler en temps réel.

#Fonctionnalités

🎮 Jeu complet de Texas Hold’em (préflop → flop → turn → river → showdown)

🤖 IA simple pour les bots, avec prise de décision basée sur la force de la main

🃏 Affichage des cartes du joueur et des bots, ainsi que des cartes communes

💰 Gestion du pot et distribution correcte aux gagnants

🔄 Possibilité de relancer une nouvelle partie sans recharger la page

🌐 Affichage 3D interactif avec React Three Fiber

🎨 Overlay pour suivre le pot et les gagnants

#Installation

1/ Cloner le projet : git clone https://github.com/votre-username/texas-holdem-3d.git
                  cd texas-holdem-3d
                  
2/ Installer les dépendances :  npm install

3/ npm run dev

#Utilisation

Cliquez sur Nouvelle Partie pour commencer un nouveau jeu.

Les cartes se distribuent automatiquement.

Les bots jouent automatiquement après votre tour.

À la fin de la partie, le gagnant et sa main sont affichés, ainsi que le montant gagné.

#Structure du projet

src/game/ – Logique du jeu, évaluation des mains, deck de cartes

src/store/useGameStore.ts – Zustand store pour la gestion du jeu

src/components/ – Composants React Three Fiber pour les cartes, overlay et interactions

public/ – Ressources statiques





             

                  
                  
