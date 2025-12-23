import type { SharedPropAuth } from '@/types';
import { usePage } from '@inertiajs/react';

export const useAuth = () => {
  return usePage<SharedPropAuth>().props.auth?.data;
};
