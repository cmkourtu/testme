import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

export const Env = z
  .object({
    PORT: z.string().default('3000'),
    NODE_ENV: z.string().optional(),
    DEEPSEEK_API_KEY: z.string().optional(),
  })
  .parse(process.env);
