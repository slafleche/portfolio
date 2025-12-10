# Agent Modules Overview

This folder describes the “modules” used by `AGENTS.md` files in this repo. It
is **documentation for automated agents**, not a rule file itself.

## What Are Modules?

- A **module** is a named topic that groups related rules and rationale (for
  example: `git-staging`, `workflow-and-todos`, `architecture-layers`,
  `localization`).
- Modules live as Markdown files under `agents/` (for example:
  `agents/workflow-and-todos.md`) and provide background, examples, and edge
  cases.
- Modules are **not** automatically loaded by the tooling; only `AGENTS.md`
  files are treated as special.

## How AGENTS Use Modules

- Each `AGENTS.md` stays **short and scoped to its directory**. It:
  - Lists a few **Must/Should** rules in its own words.
  - Optionally lists relevant modules, e.g.
    `Modules: git-staging, workflow-and-todos, architecture-layers`.
  - May include 1–2 lines of extra detail where that directory needs more
    specificity.
- The **non-negotiable rules always live in `AGENTS.md`**.  
  Modules add depth and context, but an agent should not need to open them to
  behave correctly.

## Why This Pattern

- Keeps `AGENTS.md` files **small and high-signal**, so agents actually read and
  follow them.
- Uses module names to highlight **which concepts matter** in each directory
  (e.g., `localization` in contact components, `styles-system` in `src/styles`).
- Gives a single place per topic (`agents/<module>.md`) where you can:
  - Document rationale and examples.
  - Tighten guidance over time if a particular area keeps breaking.

## When Editing Modules or AGENTS

- When you add or change a module:
  - Update the relevant `AGENTS.md` files to reference it (or stop referencing
    it).
  - Keep AGENTS bullets as the **minimal contract**; move longer explanations
    into the module doc.
- Avoid chains of indirection:
  - `AGENTS.md` should list the real modules directly (e.g., `localization`),
    not “meta-modules” that only point to other modules.

## Design Goals for AGENTS and Modules

- AGENTS files are the **canonical contracts** for each directory; modules
  provide background, not additional hidden rules.
- Mission-critical rules (the ones that break workflows or architecture if
  ignored) stay as short Must/Should bullets in the relevant `AGENTS.md`.
- Modules group related concepts (git-staging, workflow, architecture,
  localization, etc.) and can carry rationale, examples, and edge cases.
- Each scoped `AGENTS.md` only references the modules that are truly relevant
  for its subtree, to highlight what matters there.
- Prefer concise, high-signal AGENTS over long narrative; move prose-heavy
  explanations into `agents/*.md`.
- Avoid rules that live only in module docs—if a behavior is non-negotiable,
  surface it explicitly in the corresponding `AGENTS.md`.
