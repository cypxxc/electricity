import { z } from 'zod';

const DEFAULT_INSECURE_SECRET = 'super-secret-jwt-key-min-32-chars-long-12345';

/**
 * Standard 12-Factor App Environment Schema
 * Validates, types, and enforces configuration integrity across all environments.
 */
const envSchema = z.object({
  DATABASE_URL: z
    .string()
    .min(1, 'DATABASE_URL is required')
    .default('postgresql://postgres:postgrespassword@localhost:5432/electricity_db'),

  JWT_SECRET: z
    .string()
    .default(DEFAULT_INSECURE_SECRET)
    .refine(
      (secret) => {
        // Enforce strong secret in production at runtime (excluding static build phase)
        if (
          process.env.NODE_ENV === 'production' &&
          process.env.NEXT_PHASE !== 'phase-production-build'
        ) {
          return secret !== DEFAULT_INSECURE_SECRET && secret.length >= 32;
        }
        return true;
      },
      {
        message:
          'In production, JWT_SECRET must be at least 32 characters long and not use the default insecure key.',
      }
    ),

  COOKIE_SECURE: z
    .string()
    .default('false')
    .transform((val) => val === 'true'),

  ADMIN_USERNAME: z.string().default('admin'),
  ADMIN_PASSWORD: z.string().default('adminpassword123'),

  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),

  PORT: z.coerce.number().default(3000),
});

export type Env = z.infer<typeof envSchema>;

function parseEnv(): Env {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('❌ [ENVIRONMENT CONFIGURATION ERROR]:', result.error.format());

    // Fail-fast in production: prevent the application from starting in an insecure or misconfigured state
    if (
      process.env.NODE_ENV === 'production' &&
      process.env.NEXT_PHASE !== 'phase-production-build'
    ) {
      throw new Error(
        'Critical environment variables are missing or invalid. Check your environment configuration.'
      );
    }

    return envSchema.parse({});
  }

  return result.data;
}

export const env = parseEnv();
