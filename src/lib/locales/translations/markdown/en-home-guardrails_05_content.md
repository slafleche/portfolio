GitHub Actions is the last gate before code reaches main. Every pull request
runs the same pipeline in the same order: lint and cycle checks first, then
build and renders, then Chromatic for visual regression. Even if a guardrail
were bypassed locally, CI catches it before merge. Chromatic catches what eyes
miss.
