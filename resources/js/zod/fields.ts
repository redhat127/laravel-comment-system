import z from 'zod';

export const emailRule = z.email().max(50, 'email is more than 50 characters.');

export const remember_meRule = z.boolean();

export const codeRule = z.string().trim().min(1, { error: 'code is required.' }).max(50, 'code is more than 50 characters.');
