import type { SharedFlashMessage } from '@/types';
import { usePage } from '@inertiajs/react';

export const useFlashMessage = () => {
  return usePage<SharedFlashMessage>().props.flashMessage;
};
