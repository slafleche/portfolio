import { describe } from 'vitest';

// NOTE:
// These tests will cover *recoverable* error states for the contact form —
// situations where the user can reasonably fix the problem or try again
// later from the same form view.
//
// The intent is to verify that:
// - The form view (`data-form="form"`) remains visible.
// - Appropriate status / banner messages are shown.
// - The submit helper is called (or not) according to the error type.
// - Retryability (e.g., after fixing fields or waiting) behaves as expected.

describe('ContactForm — recoverable error flows (form view)', () => {
  /*
   * TODO: client-side validation_error (invalid fields)
   *
   * Scenario:
   * - Leave required fields empty and submit.
   *
   * Expectations:
   * - No fetch call is made.
   * - Message centre shows validation_error summary.
   * - Jump-to-first-issue control appears and focuses the priority field.
   * - Form remains on screen and can be corrected.
   */

  /*
   * TODO: server-side validation_error
   *
   * Scenario:
   * - Fill fields with values that are invalid only from the server
   *   perspective (e.g., Brevo validation error mapped to validation_error).
   *
   * Expectations:
   * - fetchMock is called once and returns validation_error.
   * - Message centre shows the server-provided validation_error summary.
   * - Form remains visible with updated inline field errors.
   */

  /*
   * TODO: rate_limited
   *
   * Scenario:
   * - Mock /api/contact to return { code: 'rate_limited' }.
   *
   * Expectations:
   * - The form view stays visible.
   * - Status text matches copy.statuses.rate_limited and/or countdown copy.
   * - Submit button is disabled while rate-limited, but the error view
   *   is NOT shown.
   */

  /*
   * TODO: service_unavailable
   *
   * Scenario:
   * - Mock /api/contact to return { code: 'service_unavailable' }.
   *
   * Expectations:
   * - Form remains visible.
   * - A service_unavailable status message is rendered in the message centre.
   * - The user can attempt to submit again later (no catastrophic view).
   */

  /*
   * TODO: generic_error
   *
   * Scenario:
   * - Mock /api/contact to return { code: 'generic_error' }, or throw from
   *   submitHelper.
   *
   * Expectations:
   * - Form view remains visible.
   * - A generic_error status message is shown.
   * - No error view is displayed; the user can try again.
   */
});

