/**
 * Secure logging utility that masks sensitive fields and credentials
 * to prevent sensitive data leakage into PM2 logs (Poin 15: Log jangan bocor).
 */

const SENSITIVE_KEYS = [
  'password',
  'admin_password',
  'accesscode',
  'secret',
  'token',
  'credential',
  'authorization',
  'cookie',
  'phonenumber',
  'creditcard',
  'cvv',
];

/**
 * Recursively redacts sensitive keys from objects before logging.
 */
export function redactSensitiveData(data: any): any {
  if (data === null || data === undefined) return data;

  if (typeof data === 'string') {
    // If it looks like a bearer token or secret
    if (data.length > 32 && /^[a-zA-Z0-9_\-\.]+$/.test(data)) {
      return data.slice(0, 4) + '***REDACTED***';
    }
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(redactSensitiveData);
  }

  if (typeof data === 'object') {
    const sanitized: Record<string, any> = {};
    for (const [key, val] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();
      if (SENSITIVE_KEYS.some((sensitive) => lowerKey.includes(sensitive))) {
        sanitized[key] = '***REDACTED***';
      } else {
        sanitized[key] = redactSensitiveData(val);
      }
    }
    return sanitized;
  }

  return data;
}

export const logger = {
  info(message: string, context?: any) {
    if (context) {
      console.log(`[INFO] ${message}`, redactSensitiveData(context));
    } else {
      console.log(`[INFO] ${message}`);
    }
  },

  warn(message: string, context?: any) {
    if (context) {
      console.warn(`[WARN] ${message}`, redactSensitiveData(context));
    } else {
      console.warn(`[WARN] ${message}`);
    }
  },

  error(message: string, err?: any) {
    // In production, suppress raw stack traces that might leak internal filesystem paths
    if (process.env.NODE_ENV === 'production') {
      const safeErr = err instanceof Error ? { name: err.name, message: err.message } : redactSensitiveData(err);
      console.error(`[ERROR] ${message}`, safeErr);
    } else {
      console.error(`[ERROR] ${message}`, redactSensitiveData(err));
    }
  },
};
