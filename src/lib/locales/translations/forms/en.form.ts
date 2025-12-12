export const enFormCopy = {
  'form-heading': "Let's work together",
  'form-success-heading': 'Message sent',
  'form-error-heading': "We couldn't send your message",
  'form-success-body': "I'll get back to you as soon as possible.",
  'form-name-label': 'Name',
  'form-email-label': 'Email',
  'form-message-label': 'Message',
  'form-submit-label': 'Send message',
  'form-counter-remaining': '{count} characters remaining',
  'form-message-max_chars': 'Maximum characters reached.',
  'form-message-url_usage': 'Links used: {used} of {limit}',
  'form-message-max_links': 'Maximum links reached.',
  'form-privacy-text': 'We only use this to reply.',
  'form-required-indicator': 'Required field',
  'form-privacy-link-label': 'Privacy policy',
  'form-privacy-close-label': 'Back to form',
  'form-honeypot-label': 'Leave this field blank',
  'form-turnstile-label': 'Human verification',
  'form-error-name-required': 'Please enter your name.',
  'form-error-name-too_long': 'Name is too long.',
  'form-error-email-invalid': 'Please enter a valid email address.',
  'form-error-message-required':
    'Please write a message before sending.',
  'form-error-message-too_short':
    'Please write a longer message (at least {min} characters).',
  'form-error-message-too_long': 'Message is too long.',
  'form-error-message-too_many_links':
    'Please remove extra links (limit two [abbr:URL]s).',
  'form-error-token-missing': "Please confirm you're not a bot.",
  'form-status-sending': 'Sending your message…',
  'form-status-success': 'Message sent!',
  'form-status-generic_error':
    "We couldn't send your message right now. Please try again.",
  'form-status-validation_error':
    'Please check the fields and try again.',
  'form-status-rate_limited': 'Too many attempts. Please retry soon.',
  'form-status-rate_limited-countdown':
    'Too many attempts. Please retry in {seconds}s.',
  'form-status-service_unavailable':
    "Email service is temporarily unavailable. We'll retry soon.",
  'form-status-not_configured':
    "Email service isn't configured yet. Please try again later.",
  'form-status-blocked': "We couldn't send your message right now.",
  'form-turnstile-loading': 'Loading human verification…',
  'form-turnstile-ready':
    'Complete the verification above to enable submission.',
  'form-turnstile-verified': 'Verified — you can send your message.',
  'form-turnstile-expired': 'Verification expired. Please try again.',
  'form-turnstile-error':
    'Verification is unavailable. Please retry.',
  'form-turnstile-disabled':
    'Human verification is disabled in this environment.',
  'form-turnstile-button-pending': "Verify you're human",
  'form-turnstile-button-error': 'Verification unavailable',
  'form-turnstile-preview': 'Human verification preview (debug).',
  'form-turnstile-summary-missing':
    'Please complete the human verification.',
  'form-turnstile-summary-expired':
    'Human verification expired. Please try again.',
  'form-turnstile-summary-error':
    'Human verification is unavailable. Please retry.',
  'form-category_error-required_input':
    'Please fill all required field(s).',
  'form-category_error-invalid_input':
    'Please correct the flagged field(s).',
  'form-category_error-submission_error':
    "Unfortunately, we couldn't send your message because:",
} as const;
