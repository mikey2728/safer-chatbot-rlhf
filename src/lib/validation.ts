import { z } from 'zod';

export const messageSchema = z.string()
  .trim()
  .min(1, 'Message cannot be empty')
  .max(4000, 'Message too long (max 4000 characters)')
  .refine(
    val => !/[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(val),
    'Message contains invalid control characters'
  );
