# Agent Instructions for `src/styles/measurementKit`

This directory contains MeasurementKit utilities and units used by tokens, helpers, and styles.

## Measurement math (`style-helpers`, `architecture-layers`)

- Must: Keep all measurement math in MeasurementKit space; do not coerce values to primitive numbers or strings in this directory.
- Must: Use MeasurementKit APIs for operations (for example, add, subtract, multiply, divide, clamp) instead of manual arithmetic or CSS math strings.

## Adapters and coercion (`style-helpers`)

- Must: Only dedicated adapter functions at explicit boundaries may coerce MeasurementKit values to primitives for CSS or external libraries.
- Must: Use sanctioned MeasurementKit coercion helpers in adapters; do not access internal fields or rely on implicit string coercion.

## Imports and ownership (`architecture-layers`)

- Must: Keep MeasurementKit helpers centralized here; tokens, helpers, and styles should import from this directory instead of re-implementing measurement logic.
- Must: Treat this directory as a pure utility layer; do not import React components, app code, or modules from here.

