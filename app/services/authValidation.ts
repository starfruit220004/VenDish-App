export type AuthMode = 'signup' | 'login';

type SignupValidationInput = {
  firstName: string;
  middleName?: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type LoginValidationInput = {
  username: string;
  password: string;
};

const NAME_REGEX = /^[A-Za-z][A-Za-z .'-]*$/;
const USERNAME_REGEX = /^(?=.{3,}$)[A-Za-z0-9._@+-]+$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PASSWORD_SPECIAL_REGEX = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/;

const FIELD_LABELS: Record<string, string> = {
  username: 'Username',
  email: 'Email',
  password: 'Password',
  first_name: 'First name',
  middle_name: 'Middle name',
  last_name: 'Last name',
  non_field_errors: 'Validation',
  detail: 'Authentication',
  error: 'Error',
};

const compactSpaces = (value: string) => value.replace(/\s+/g, ' ').trim();

export const normalizeName = (value: string) => compactSpaces(value);
export const normalizeUsername = (value: string) => value.trim();
export const normalizeEmail = (value: string) => value.trim().toLowerCase();

const firstMessage = (value: unknown): string | null => {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) {
    for (const item of value) {
      const nested = firstMessage(item);
      if (nested) return nested;
    }
    return null;
  }

  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>);
    for (const [, nestedValue] of entries) {
      const nested = firstMessage(nestedValue);
      if (nested) return nested;
    }
  }

  return null;
};

const humanizeField = (field: string) => {
  if (FIELD_LABELS[field]) return FIELD_LABELS[field];
  return field
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const objectErrorMessage = (data: Record<string, unknown>): string | null => {
  const prioritizedKeys = ['detail', 'error', 'non_field_errors'];

  for (const key of prioritizedKeys) {
    if (key in data) {
      const message = firstMessage(data[key]);
      if (message) return message;
    }
  }

  for (const [key, value] of Object.entries(data)) {
    const message = firstMessage(value);
    if (!message) continue;
    return `${humanizeField(key)}: ${message}`;
  }

  return null;
};

export const extractAuthErrorMessage = (
  error: any,
  fallback: string,
  mode: AuthMode
): string => {
  const status = error?.response?.status;
  const data = error?.response?.data;

  if (!error?.response) {
    if (error?.request) {
      return 'Unable to reach the server. Please check your internet connection and try again.';
    }
    return fallback;
  }

  let message: string | null = null;
  if (typeof data === 'string') {
    message = data;
  } else if (data && typeof data === 'object') {
    message = objectErrorMessage(data);
  }

  if (mode === 'login' && status === 401) {
    if (message && /(blocked|verify|verification|activate|pending)/i.test(message)) return message;
    return 'Invalid username or password.';
  }

  if (status === 429) {
    return 'Too many attempts. Please wait a moment and try again.';
  }

  if (status && status >= 500) {
    return 'Server error. Please try again in a moment.';
  }

  return message || fallback;
};

export const validateSignupInput = (input: SignupValidationInput): string | null => {
  const firstName = normalizeName(input.firstName);
  const middleName = normalizeName(input.middleName || '');
  const lastName = normalizeName(input.lastName);
  const username = normalizeUsername(input.username);
  const email = normalizeEmail(input.email);
  const password = input.password;
  const confirmPassword = input.confirmPassword;

  if (!firstName || !lastName || !username || !email || !password || !confirmPassword) {
    return 'Please complete all required fields.';
  }

  if (firstName.length < 2 || firstName.length > 50) {
    return 'First name must be between 2 and 50 characters.';
  }

  if (!NAME_REGEX.test(firstName)) {
    return 'First name can only contain letters, spaces, apostrophes, dots, and hyphens.';
  }

  if (middleName) {
    if (middleName.length > 50) {
      return 'Middle name must be 50 characters or fewer.';
    }

    if (!NAME_REGEX.test(middleName)) {
      return 'Middle name can only contain letters, spaces, apostrophes, dots, and hyphens.';
    }
  }

  if (lastName.length < 2 || lastName.length > 50) {
    return 'Last name must be between 2 and 50 characters.';
  }

  if (!NAME_REGEX.test(lastName)) {
    return 'Last name can only contain letters, spaces, apostrophes, dots, and hyphens.';
  }

  if (!USERNAME_REGEX.test(username)) {
    return 'Username must be at least 3 characters and can only include letters, numbers, and . _ @ + - symbols.';
  }

  if (email.length > 254 || !EMAIL_REGEX.test(email)) {
    return 'Please enter a valid email address.';
  }

  if (password.length < 8 || password.length > 64) {
    return 'Password must be between 8 and 64 characters.';
  }

  if (/\s/.test(password)) {
    return 'Password cannot contain spaces.';
  }

  if (!/[a-z]/.test(password)) {
    return 'Password must include at least one lowercase letter.';
  }

  if (!/[A-Z]/.test(password)) {
    return 'Password must include at least one uppercase letter.';
  }

  if (!/\d/.test(password)) {
    return 'Password must include at least one number.';
  }

  if (!PASSWORD_SPECIAL_REGEX.test(password)) {
    return 'Password must include at least one special character.';
  }

  if (password.toLowerCase().includes(username.toLowerCase())) {
    return 'Password must not contain your username.';
  }

  if (password !== confirmPassword) {
    return 'Password and confirm password do not match.';
  }

  return null;
};

export const validateLoginInput = (input: LoginValidationInput): string | null => {
  const username = normalizeUsername(input.username);
  const password = input.password;

  if (!username || !password) {
    return 'Please enter both username and password.';
  }

  if (!USERNAME_REGEX.test(username)) {
    return 'Enter a valid username (at least 3 characters, letters, numbers, and . _ @ + - only).';
  }

  if (password.length < 8 || password.length > 64) {
    return 'Password must be between 8 and 64 characters.';
  }

  if (/\r|\n|\t/.test(password)) {
    return 'Password contains invalid characters.';
  }

  return null;
};