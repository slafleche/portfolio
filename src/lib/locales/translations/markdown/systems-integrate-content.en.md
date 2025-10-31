### Fonts

Font setup starts from a single configuration file used for both CSS and Google
Fonts requests.  
Weights are defined as percentages (0–100), so variable fonts can share the same
scale and stay stable when swapped.

**Config (shared by CSS and font requests):**

```
# src/data/fonts.config.json
{
  "Titan One": { "weights": ["400", "700"], "ital": true }
}
```

````ts
style({
  ...composeFontStyles({ token: fontVars.hero, weightPercent: 0 }),
})
````

---

### Localization

Each section loads only the copy it needs.
Bundles map directly to UI sections, so payloads stay small and ownership is obvious.
A single translator is created per locale and used to compose plain data objects for components — no runtime i18n layer, no `t()` calls in the UI.

```ts
const t = await loadTranslator(locale);
const heroCopy = buildHeroCopy(t);

<Hero copy={heroCopy} />
```

Markdown is compiled to HTML at build time for specific keys, so rich text stays
localized without adding runtime parsing.  
Missing or mismatched keys surface immediately in development, and a pre-commit
check ensures that invalid keys or missing files can’t be pushed by accident.  
It keeps translations stable, transparent, and easy to maintain as content
evolves.

---

### Assets Pipeline

Media isn’t checked into the repo.  
Small JSON maps point to remote originals, and scripts handle downloading,
optimization, and manifest generation for direct use in components.

```
src/assets/videos/videoSources.json
{
  "hero": { "src": "https://dropbox.com/…?dl=1", "speed": 2 }
}
```

```
src/data/generated/videos.manifest.gen.json
{
  "hero": {
    "width": 3840,
    "height": 2160,
    "masterUrl": "/videos/hero/master.m3u8",
    "posterUrl": "/videos/hero/poster.png"
  }
}
```

```
<VideoByName name="hero" kind="hero" autoPlay loop muted playsInline />
```

The process keeps large files out of version control and produces deterministic
outputs that components can consume directly.  
SVGs follow the same principle, cleaned with SVGO and formatted with Prettier
for safe IDs and consistent diffs.

