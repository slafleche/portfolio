GitHub Actions est le dernier filtre avant que le code n’atteigne main.
Chaque pull request exécute le même pipeline dans le même ordre : lint et
vérifications de cycles d’abord, ensuite build et rendus, puis Chromatic pour
la régression visuelle. Même si un garde-fou était contourné localement, la
CI l’attrape avant le merge. Chromatic attrape ce que les yeux ratent.
