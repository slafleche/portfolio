AI is part of the workflow, not a shortcut. I built a system that lets it
operate under the same rules I do—structured, type-safe, and traceable.

Each session starts with a brief: ai.md for context and ai.yaml for hard rules.
ESLint and lint-staged load that file directly, enforcing layer boundaries,
import limits, and emission rules automatically. The AI runs a
pause-before-coding checklist, generates a TODO plan with numbered steps, and
ships changes behind its own branch or refactor task (like the MeasurementKit →
CSS Calipers migration).

Because the structure is deterministic, collaboration stays clean. The AI can
move fast—writing boilerplate, expanding helpers, or testing refactors—without
ever crossing boundaries or breaking type safety. The same guards that keep
humans honest keep it honest too.

The result isn’t automation for its own sake; it’s a faster, verifiable
development loop where both human and AI work inside the same architecture.
