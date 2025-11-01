# Vars Directory

- Aggregates and re-exports token objects (`fontVars`, `colorVars`, etc.) for ease of consumption.
- Avoid defining new tokens here; instead, import them from `/tokens` and re-export as needed.
- Keep this directory free from helper logic—no calculations beyond simple re-exports.
- If a var requires computation, move that logic into a helper or module and expose the result back here.
