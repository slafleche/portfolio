L’[abbr:AI] fait partie du flux de travail, pas un raccourci. J’ai construit un
système qui lui impose les mêmes règles qu’à moi — structuré, typé et traçable.

Chaque session commence par un brief : ai.md pour le contexte et rules.yaml pour
les règles strictes. [abbr:ESLint] et lint-staged chargent directement ces
fichiers et imposent automatiquement les frontières de couches, limites d’import
et règles d’émission. L’[abbr:AI] exécute la checklist « pause-before-coding »,
génère un plan [abbr:TODO] numéroté et livre ses changements dans sa propre
branche ou tâche de refactor (comme la migration de la couche de mesures vers
[abbr:CSS] Calipers).

Parce que la structure est déterministe, la collaboration reste nette.
L’[abbr:AI] peut aller vite — écrire le boilerplate, étendre des helpers ou
tester des refactors — sans franchir les frontières ni casser la sécurité de
types. Les mêmes garde-fous qui encadrent les humains s’appliquent aussi à elle.

Le but n’est pas l’automatisation pour l’automatisation, mais une boucle de
développement plus rapide et vérifiable où humain et [abbr:AI] travaillent dans
la même architecture.
