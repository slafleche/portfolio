Husky pre-commit hooks block AI from shipping unsupervised. Every commit runs
lint, locale checks, and a scan for debugging artifacts. Even when a hurried
day or a confident-but-wrong AI tries to ship something half-baked, the hook
says no and the bad change never leaves my machine.
