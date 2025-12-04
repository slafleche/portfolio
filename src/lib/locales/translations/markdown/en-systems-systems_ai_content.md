[abbr:AI] is part of the workflow, not a shortcut. I built a system that lets it
operate under the same rules I do—structured, type-safe, and traceable.

Each session starts with a brief: ai.md for context and rules.yaml for hard rules.
[abbr:ESLint] and lint-staged load that file directly, enforcing layer boundaries,
import limits, and emission rules automatically. The [abbr:AI] runs a
pause-before-coding checklist, generates a [abbr:TODO] plan with numbered steps, and
ships changes behind its own branch or refactor task (like the [abbr:CSS] Calipers
migration of the measurement helpers).

Because the structure is deterministic, collaboration stays clean. The [abbr:AI] can
move fast—writing boilerplate, expanding helpers, or testing refactors—without
ever crossing boundaries or breaking type safety. The same guards that keep
humans honest keep it honest too.

The result isn’t automation for its own sake; it’s a faster, verifiable
development loop where both human and [abbr:AI] work inside the same architecture.
