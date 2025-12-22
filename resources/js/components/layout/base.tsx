import { useAuth } from '@/hooks/use-auth';
import { useFlashMessage } from '@/hooks/use-flash-message';
import { cn } from '@/lib/utils';
import authRoute from '@/routes/auth';
import { Link, usePage } from '@inertiajs/react';
import { useEffect, type ReactNode } from 'react';
import { toast } from 'sonner';
import { CustomToaster } from '../custom-toaster';
import { ToggleTheme, ToggleThemeProvider } from '../theme-provider';
import { Button } from '../ui/button';

export const BaseLayout = ({ children }: { children: ReactNode }) => {
  const { component } = usePage();
  const isErrorPage = component === 'error';
  const isAuthPage = component.startsWith('auth/');
  const auth = useAuth();
  const flashMessage = useFlashMessage();
  useEffect(() => {
    if (flashMessage) {
      toast[flashMessage.type](flashMessage.text);
    }
  }, [flashMessage]);
  return (
    <ToggleThemeProvider>
      {!isErrorPage && !isAuthPage && (
        <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between border-b bg-white p-4 px-8 dark:bg-slate-950">
          <div></div>
          <div className="flex items-center gap-2">
            {!auth && (
              <Button asChild size="sm">
                <Link href={authRoute.login.get()}>Login</Link>
              </Button>
            )}
            <ToggleTheme />
          </div>
        </header>
      )}
      <main
        className={cn({
          'flex min-h-full items-center justify-center p-4': isErrorPage || isAuthPage,
        })}
      >
        {children}
        <CustomToaster />
      </main>
    </ToggleThemeProvider>
  );
};
