import type { Config } from 'drizzle-kit';

export default {
  schema: ['./src/lib/schema.ts', './src/lib/recommendation-schema.ts', './src/lib/payment-schema.ts'],
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || '',
  },
} satisfies Config;
