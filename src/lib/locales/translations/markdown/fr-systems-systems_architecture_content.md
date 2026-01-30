[MockCode|ts] Le système a des frontières claires : des entrées typées au début,
du [abbr:CSS] brut à la fin, et une composition flexible entre les deux. Ce n’est pas
une question de structure rigide. Il s’agit d’éviter deux modes d’échec que je
vois le plus souvent : le bricolage de chaînes à l’écriture, et des couches
d’abstraction qui prennent du retard sur la plateforme. [/MockCode]

### Entrées typées à la frontière

Les valeurs de style entrent dans le système sous forme de primitives typées,
pas comme des chaînes brutes. Ça évite l’enfer de concaténation décrit dans la
section [CSS Calipers](#css-calipers). C’est fini les erreur de style
`"12px" + "40vh"` qui devient `"12px40vh"`, fini la perte de typage dès qu’un
nombre devient une chaîne, fini les surprises à l’exécution causées par des
unités incompatibles.

Les types imposent la cohérence au moment d’écrire. Vous ne pouvez pas mélanger
des unités incompatibles par accident, ni passer des valeurs invalides. Les
erreurs apparaissent tout de suite, pas quand un utilisateur signale un
espacement brisé.

### Début clair et fin claire

La structure et les contraintes existent à l’écriture. La sortie finale est du
CSS conforme à la spécification. C’est important, parce que j’ai déjà travaillé
sur des projets où le modèle de composants ne pouvait pas exprimer toute
l’étendue du HTML/CSS. On était en retard sur la spécification, à
dépendre de hacks en JavaScript pour modifier le rendu après coup, juste pour
utiliser des fonctionnalités que les navigateurs supportaient déjà.

Le CSS reste la source de vérité, pas un dialecte abstrait. Vous pouvez
inspecter ce qui est livré, le déboguer avec les outils standards, et adopter de
nouvelles fonctionnalités CSS dès que les navigateurs les supportent. Pas besoin
d’attendre que votre framework rattrape la plateforme.

### Intention sémantique, CSS réel

Des abstractions de domaine comme `borders()` ou `spacing()` donnent du sens aux
valeurs sans changer la plateforme. Elles rendent l’intention explicite et
réduisent la répétition, mais la sortie reste des propriétés CSS
reconnaissables. La couche d’abstraction ajoute de la clarté, pas du mystère. Si
vous inspectez le résultat, vous voyez `border: 1px solid #fff`, pas une
représentation intermédiaire.

### Conçu pour être inspecté et remplacé

Des morceaux peuvent être remplacés ou retirés au fil du temps sans déstabiliser
l’ensemble. Aucun outil unique ni un seul style d’écriture n’est requis. Si un
meilleur outil apparaît, ou si les besoins du projet changent, vous pouvez
remplacer des pièces de manière incrémentale. Rien ne devient une impasse.

Le site portfolio que vous lisez est open source sur
[element:GitHubWordmark|site-fr], et CSS Calipers est sur
<span data-white-space="no-wrap">[element:NPMWordmark|fr].</span>

### Composition flexible au milieu

C’est ici que la comparaison avec un framework compte. La plupart des «
frameworks » CSS sont en réalité des bibliothèques : des collections
d’utilitaires ou de composants. Mon approche tétrachromatique ressemble
davantage à un framework de programmation comme PHP. Vous avez des entrées
attendues (valeurs typées) et des sorties (CSS conforme à la spécification),
mais le milieu vous appartient.

J’ai des helpers et des opinions pour vous y amener, mais vous pouvez structurer
comme vous voulez. Vous n’aimez pas mon `colorWrapper` ? Écrivez le vôtre, en
gardant les types. Vous n’aimez pas le helper `borders()` ? Écrivez vos bordures
à la main. Le système se soucie des **bornes** (entrées typées et sortie CSS
réelle), pas de la façon dont vous organisez le milieu.
