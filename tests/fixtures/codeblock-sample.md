before
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
    right: externalDesignTokens.borders,
    bottom: externalDesignTokens.borders,
    left: externalDesignTokens.borders,
    radius: {
      north: m(0),
      south: externalDesignTokens.borders.radius,
    },
  },
};

// In your [abbr:CSS] files (note: using Vanilla-Extract here, but agnostic of [abbr:CSS]-in-[abbr:JS] library)

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
after
