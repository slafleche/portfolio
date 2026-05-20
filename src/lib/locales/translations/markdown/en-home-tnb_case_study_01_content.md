I refactored disconnected sources of truth into a single `tokens.json`. A
build step generates `tailwind-theme.js`, `variables.css`, and
`tokens-responsive.css` from that one file. A separate sync script reads the
designer's Figma variables and propagates them into the tokens. Any token
change flows from one file to every place it's used.

I aligned the agency's existing client projects to this pipeline
incrementally. Every file I touched got moved over while shipping the work I
was there to deliver.
