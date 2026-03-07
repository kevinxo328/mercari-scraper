export const AUTH_ERROR_CODES = {
  UNAUTHORIZED: 'unauthorized',
  UNKNOWN: 'unknown'
} as const;

export type AuthErrorCode =
  (typeof AUTH_ERROR_CODES)[keyof typeof AUTH_ERROR_CODES];

// Maps better-auth internal error strings to our error codes
const AUTH_ERROR_MAP: Record<string, AuthErrorCode> = {
  Email_is_not_in_whitelist: AUTH_ERROR_CODES.UNAUTHORIZED
};

// Maps our error codes to user-facing messages
export const AUTH_ERROR_MESSAGES: Record<AuthErrorCode, string> = {
  [AUTH_ERROR_CODES.UNAUTHORIZED]:
    'You do not have access to this application.',
  [AUTH_ERROR_CODES.UNKNOWN]: 'An error occurred. Please try again.'
};

export function resolveAuthError(raw: string | null): AuthErrorCode {
  if (!raw) return AUTH_ERROR_CODES.UNKNOWN;
  return AUTH_ERROR_MAP[raw] ?? AUTH_ERROR_CODES.UNKNOWN;
}
