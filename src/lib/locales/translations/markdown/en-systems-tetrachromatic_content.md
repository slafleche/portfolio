[MockCode|ts] Most teams choose frameworks for early velocity. When those
frameworks don't fit the project's actual needs, you end up with mounting
technical debt and increasingly ugly workarounds as the project matures.

The Tetrachromatic Approach solves this by letting you discover your project's
architecture progressively. Like
<dfn title="People with four types of color receptors in their eyes, allowing them to perceive colours most humans cannot see">tetrachromats</dfn>
the system reveals patterns and constraints
that most systems obscure or push you in a direction that doesn't fit your
project.

Start with a good structure. Type your CSS variables, and have our output allow the full [abbr:CSS] spec (not a subset). With [CSS Calipers](#css-calipers), you can have all your [abbr:CSS] vars typed and checked in [abbr:TS] and even do your own custom validation in [abbr:JS].

Globals are good, but always use them as overridable defaults for components.
As complexity emerges, you can have more complex tokens or pipelines for getting
your variables through to the style. Components own their concerns. Boundaries
stay explicit. Dependencies remain traceable.

Here's what this looks like in practice. Complex styles are output via helpers, but they are optional to use. Using `borders()`, `paddings()`, or `margins()` allows you to add
complexity to your styles by only editing your tokens:

```ts
// In a *.tokens.ts file
const simpleConf = {
  borders: {
    color: color('#fff'),
  },
};

const complexConf = {
  borders: {
    top: {
      ...externalDesignTokens.borders,
      color: externalDesignTokens.borders.color.alpha(0.3),
    },
    horitonzal: externalDesignTokens.borders,
    bottom: externalDesignTokens.borders,
    radius: {
      north: m(0),
      south: externalDesignTokens.borders.radius,
    },
  },
};

// Vanilla-Extract is used here, but [abbr:CSS]-Calipers is agnostic of [abbr:CSS]-in-[abbr:JS] library)

// Example A: Use defaults directly
export const useDefaults = style(borders()); // gets default width, style and color

// Example B: Set your overwrite in your stylesheet
export const hardCoded = style({
  ...borders({
    width: m(20),
  }), // will use default color and style
});

// Example C: Get all tokens from external object
export const fromVarsSimple = style({
  ...borders(simpleConf.borders),
}); // will use default width and style from global config

// Example D: Get complex tokens from external object
export const fromVarsComplex = style({
  ...borders(complexConf.borders),
});

// ⚠️ Important note: there's no difference between C and D. You can just change your tokens and it works, no edits to CSS needed!
// In CSS Calipers, the plural is used to differentiate the CSS value from our helper, so "borders" is the helper for border, "margins" for margin, etc.
```

The result: a system where changes have predictable, local impact. You can
diverge safely and refactor with confidence. Changes are clearly scoped, and you
always know what depends on what.

Below, I'll break down the tools and patterns that make this possible.
[/MockCode]
