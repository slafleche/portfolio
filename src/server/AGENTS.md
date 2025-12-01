# Agent Instructions for `src/server`

This directory contains server-side utilities and handlers (contact form delivery, rate limiting, Turnstile verification, telemetry, etc.).

## Responsibilities (`server-layer`)

- Must: Treat this layer as the source of truth for validation, rate limiting, Turnstile checks, and contact message delivery.
- Must: Keep server logic focused on request handling, security, and coordination; push UI concerns and view models into modules or components.

## Constraints (`server-layer`, `contact-forms`)

- Must: Do not bypass or weaken rate limiting, Turnstile checks, or other guardrails from components or modules without explicit instruction.
- Must: Access secrets and credentials via environment variables or configuration, not hard-coded values in source files.
- Must: Avoid coupling server code to React components; use plain functions and types that can be tested independently.

