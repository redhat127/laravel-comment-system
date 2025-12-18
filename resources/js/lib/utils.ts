import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { clientEnv } from './env';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const generateTitle = (title: string) => {
  return `${clientEnv.VITE_APP_NAME} - ${title}`;
};
