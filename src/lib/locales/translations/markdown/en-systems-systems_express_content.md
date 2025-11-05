### Gradients

Gradients look simple, but small shifts can cause banding, unwanted
desaturation, or uneven contrast.  
For this project, I built a repeatable recipe that keeps them smooth and
predictable while letting me add one color at a time and stay in control of the
result.

The recipe separates two parts:

- **Linear stops** with explicit positions (0–100) and optional blend strength.
- **Spots** (soft overlays) with color, alpha, x/y position, scale, optional
  softening, and blend mode.

A small helper applies the same rules every time — direction, stop ordering,
softening, and layering — allowing complex gradients to be composed one variable
at a time.

---

### Shape

The arch shape was chosen precisely because it’s impractical in CSS.  
It started as an early test in AI collaboration — it took work, but we ended up
with something interesting.

The arch is SVG-based but calculated, not drawn, which gives it surprising
flexibility.  
Changing a few numbers reshapes the curve without breaking alignment or
proportion.

---

### Motion

The contact button is the most complex piece of motion on the site.  
I wanted it to feel like classic animation, so I applied the same principles:
squash and stretch, anticipation, overshoot.  
It may not look like much, but it’s built from about a dozen layers that work
together to make it feel right.  
Each layer handles a specific part: timing, easing, depth, or shape, so the
motion stays smooth and believable.
