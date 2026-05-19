J’ai écrit un système de qualité du développement assisté par IA en couches,
spécifique à la stack de l’agence. Les skills Claude Code et Cursor couvrent
les conventions qu’une session IA fraîche doit connaître : où vivent les
styles, comment les tokens sont nommés, quand utiliser Tailwind plutôt qu’un
CSS Module, ce qui appartient à `globals.css`, comment les contrats UI du
CMS sont typés. Les hooks pre-commit Husky attrapent les artefacts de
débogage et appliquent les règles avant que le code arrive en revue. Les
skills voyagent avec le dépôt, donc quiconque rejoint le projet, humain ou
IA, adopte les mêmes conventions dès le premier jour.
