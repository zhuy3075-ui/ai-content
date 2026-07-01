export interface RuntimeEnv {
  [key: string]: string | undefined;
  NODE_ENV?: string;
  CORS_ORIGIN?: string;
  ENABLE_SWAGGER?: string;
}

export function resolveCorsOrigins(env: RuntimeEnv = process.env) {
  const defaultOrigins = env.NODE_ENV === 'production'
    ? ''
    : 'http://localhost:3000,http://127.0.0.1:3000';

  return (env.CORS_ORIGIN || defaultOrigins)
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export function isSwaggerEnabled(env: RuntimeEnv = process.env) {
  return env.NODE_ENV !== 'production' || env.ENABLE_SWAGGER === 'true';
}
