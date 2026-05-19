The agency's sister product is Whereabouts, a SaaS widget platform for
tourism. Client sites embed Whereabouts widgets, each with their own props,
GraphQL endpoints, and CSS theming via `::part()` and `--wa-*` variables. I
built an AI-aware integration layer: a Claude skill encoding the widget
integration patterns, a local docs cache mirroring the live product
documentation, and a sync skill that refreshes the cache without re-crawling
every session. When I found bugs in the widget surface during integration
work, I filed issues with the Whereabouts team to improve the product.
