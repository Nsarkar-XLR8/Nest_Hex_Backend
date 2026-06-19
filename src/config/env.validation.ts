import { envSchema, Env } from './env.schema';

export const validateEnv = (config: Record<string, unknown>): Env => {
  const parsed = envSchema.safeParse(config);

  if (!parsed.success) {
    const formatted = JSON.stringify(parsed.error.format(), null, 2);
    throw new Error(`Invalid environment variables:\n${formatted}`);
  }

  return parsed.data;
};
