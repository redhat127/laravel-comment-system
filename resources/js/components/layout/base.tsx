import { useAuth } from '@/hooks/use-auth';
import { useFlashMessage } from '@/hooks/use-flash-message';
import { clientEnv } from '@/lib/env';
import { cn } from '@/lib/utils';
import { home } from '@/routes';
import authRoute from '@/routes/auth';
import { Link, usePage } from '@inertiajs/react';
import { MessageSquareMore } from 'lucide-react';
import { useEffect, type ReactNode } from 'react';
import { toast } from 'sonner';
import { CustomToaster } from '../custom-toaster';
import { ToggleTheme, ToggleThemeProvider } from '../theme-provider';
import { Button } from '../ui/button';
import { UserDropdown } from '../user-dropdown';

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
          <Link href={home()} className="flex items-center gap-2 text-2xl font-bold">
            <MessageSquareMore />
            <span className="text-sky-600 dark:text-sky-500">{clientEnv.VITE_APP_NAME}</span>
          </Link>
          <div className="flex items-center gap-2">
            {!auth ? (
              <Button asChild size="sm">
                <Link href={authRoute.login.get()}>Login</Link>
              </Button>
            ) : (
              <UserDropdown />
            )}
            <ToggleTheme />
          </div>
        </header>
      )}
      <main
        className={cn({
          'flex min-h-full items-center justify-center p-4': isErrorPage || isAuthPage,
          'mt-16': !isErrorPage && !isAuthPage,
        })}
      >
        {children}
        <CustomToaster />
      </main>
    </ToggleThemeProvider>
  );
};
