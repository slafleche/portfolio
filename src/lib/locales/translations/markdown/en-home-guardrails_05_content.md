Nothing reaches main without passing the same pipeline every time. Lint and
cycle checks first, then build and renders, then visual regression. Even if
a local guardrail were bypassed, the merge gate catches it. Visual
regression catches what eyes miss.
