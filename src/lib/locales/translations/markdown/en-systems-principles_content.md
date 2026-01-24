[MockCode|ts] User Interface systems fail when they optimize for the wrong thing. Most
optimize for initial setup speed or maximum reusability. I optimize for
**predictable change over time**. [/MockCode]

### Design for change

The system's value compounds as the project matures. Early velocity matters, but
not at the cost of painted-into-corner decisions. New requirements shouldn't
trigger rewrites. They should feel like natural extensions of what's already
there.

### Composition over rigidity

Encode decisions once, compose them everywhere. When a spacing value needs to
change, you change one token, not fifty components. When a pattern needs to
diverge, you branch it cleanly without orphaning the original.

### Respect the platform

The [abbr:CSS] spec is the contract. Abstractions can make authoring easier, but the
output must be inspectable, debuggable that any developer can reason about.
No magic runtimes, no opaque transformations.

### People over abstractions

Systems serve teams, not the other way around. A "clever" abstraction that
confuses your team is a liability. Tools are chosen for project fit, not
architectural purity. The goal is maintainability, not picking the trendy library because it demos well.

### Clear boundaries and constraints

Explicit boundaries make change predictable. You know what depends on what. You
know what a refactor will affect. The blast radius of each change is clear and obvious. Constraints are deliberate. They’re chosen for the project and what we want to build, not arbitrary limits inherited from a framework someone picked before they understood the problem.
