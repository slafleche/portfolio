export const NAME_LIMIT = { min: 2, max: 80 } as const;
export const EMAIL_MAX_LENGTH = 254;
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const URL_PATTERN = /\b(?:https?:\/\/|www\.)[^\s/$.?#].[^\s]*/gi;
export const MESSAGE_URL_LIMIT = 2;
