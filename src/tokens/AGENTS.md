# Agent Instructions for `src/tokens`
	
This directory contains design tokens: pure data for measurements, colors, and other design constants.
	
## Responsibilities (`tokens`)
	
- Must: Provide structured, typed token objects for the rest of the system.
- Must: Keep values in measurement space (css-calipers measurement objects, color objects, etc.) until helpers emit CSS.
	
## Constraints (`tokens`, `architecture-layers`)
	
- Must: Do not import from `app/`, `modules/`, or `styles/` here.
- Must: Do not call `.css()` or emit CSS strings from tokens.
- Must: Prefer grouped, pluralized bundles (`paddings`, `borders`, `boxShadows`, `fonts`, etc.) that feed directly into helpers.
- Must: Do not coerce measurement values to primitive numbers/strings inside tokens; coercion only happens at adapter/emission boundaries using the sanctioned css-calipers measurement APIs.
	
## Consumption patterns (`tokens`, `styles-layer`, `style-helpers`)
	
- Must: Consumers should reference token paths directly (for example, `menuVars.hover.boxShadows`) instead of re-aliasing values without transformation.
- Must: Avoid mixing raw CSS strings/numbers with css-calipers measurement instances inside the same token object.
