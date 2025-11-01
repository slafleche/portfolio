# Modules

- Bridge tokens and helpers to prepare data for specific components or features.
- Keep module outputs CSS-free; styles should still be emitted from `*.css.ts`.
- Prefer placing component-scoped helpers under `modules/helpers/<name>.helper.ts`.
- Dependencies should flow from tokens/helpers into modules, never the other way around.
- If a module begins to contain shared logic, promote that logic back into `/styles/helpers`.
