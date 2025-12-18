import { useFlashMessage } from '@/hooks/use-flash-message';
import { cn } from '@/lib/utils';
import { usePage } from '@inertiajs/react';
import { useEffect, type ReactNode } from 'react';
import { toast } from 'sonner';
import { CustomToaster } from '../custom-toaster';
import { ToggleTheme, ToggleThemeProvider } from '../theme-provider';

export const BaseLayout = ({ children }: { children: ReactNode }) => {
  const { component } = usePage();
  const isErrorPage = component === 'error';
  const flashMessage = useFlashMessage();
  useEffect(() => {
    if (flashMessage) {
      toast[flashMessage.type](flashMessage.text);
    }
  }, [flashMessage]);
  return (
    <ToggleThemeProvider>
      {!isErrorPage && (
        <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between border-b bg-white p-4 px-8 dark:bg-slate-950">
          <div></div>
          <div className="flex items-center gap-2">
            <ToggleTheme />
          </div>
        </header>
      )}
      <main
        className={cn({
          'flex min-h-full items-center justify-center p-4': isErrorPage,
        })}
      >
        {children}
        <CustomToaster />
      </main>
    </ToggleThemeProvider>
  );
};
