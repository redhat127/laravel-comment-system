import z from 'zod';

export const emailRule = z.email().max(50, 'email is more than 50 characters.');

export const remember_meRule = z.boolean();

export const codeRule = z.string().trim().min(1, { error: 'code is required.' }).max(50, 'code is more than 50 characters.');

export const usernameRule = z
  .string()
  .trim()
  .min(6, 'minimum for username is 6 characters.')
  .max(50, 'username is more than 50 characters.')
  .regex(/^[a-z0-9][a-z0-9_-]*$/, {
    message: 'username must start with a letter or number, and can only contain english lowercase letters, numbers, underscores and hyphens.',
  })
  .refine((val) => !['admin', 'root', 'system', 'support', 'api', 'www', 'mail', 'help'].includes(val), {
    message: 'this username is reserved and cannot be used.',
  });

export const nameRule = z
  .string()
  .trim()
  .min(3, 'minimum for name is 3 characters.')
  .max(50, 'name is more than 50 characters.')
  .regex(/^[a-zA-Z0-9 _-]+$/, {
    error: 'allowed characters: english letters and numbers, underscores, hyphens and spaces.',
  });

export const commentBodyRule = z.string().trim().min(10, 'minimum for body is 10 characters.').max(500, 'body is more than 500 characters.');
