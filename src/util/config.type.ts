import { z } from 'zod';
import { configSchema, environmentSchema } from '@src/util/config.schema';

export type Environment = z.infer<typeof environmentSchema>;

export type Config = z.infer<typeof configSchema>;
