import { style } from "@vanilla-extract/css";

export const container = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "100vh",
  fontFamily: "sans-serif",
  background: "#f4f4f4",
});

export const title = style({
  color: "#333",
  fontSize: "3rem",
  marginBottom: "1rem",
});
