### Converge on the project’s needs

I focus on front-end infrastructure: component APIs, theming systems, and design
tokens that keep mockups and code aligned. This reduces technical debt from
frameworks chosen for early velocity over long-term fit.

I start with lightweight constraints to establish a baseline. When the work
needs more structure, I add it deliberately. When components share clear
contracts and inherit from stable foundations, teams can move fast without
accumulating one-off solutions that resist change.

### Design for change, clear boundaries

Interface systems should let you change direction without rebuilding everything.
They stay composable and keep boundaries explicit: tokens inherit globals but
can override them. When requirements shift, you extend or branch off
deliberately without fragile dependencies.

My approach: cascade where it's expected, stay explicit otherwise, and allow
overrides and inherit global defaults. Well-designed primitives compose
naturally. Components can be bypassed or forked when you need to without
worrying about unintended side-effects.

