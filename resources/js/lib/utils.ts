import { clsx, type ClassValue } from 'clsx';
import { toast } from 'sonner';
import { twMerge } from 'tailwind-merge';
import { clientEnv } from './env';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const generateTitle = (title: string) => {
  return `${clientEnv.VITE_APP_NAME} - ${title}`;
};

export const showServerValidationErrors = (errors: Record<string, string>) => {
  const values = Object.values(errors);
  if (values.length > 0) {
    const message = values[0];
    toast.error(message);
  }
};
