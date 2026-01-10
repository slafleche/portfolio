import { style } from "@vanilla-extract/css";

export const root = style({
  display: "flex",
  justifyContent: "center",
  width: '100%',
});

export const inner = style({
  display: 'inline-block',
  maxWidth: '100%',
});
