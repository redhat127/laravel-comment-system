import { LoginForm } from '@/components/form/login/login-form';
import { BaseLayout } from '@/components/layout/base';
import { ToggleTheme } from '@/components/theme-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { generateTitle } from '@/lib/utils';
import { home } from '@/routes';
import { Head, Link } from '@inertiajs/react';
import { type ReactNode } from 'react';

export default function Login() {
  return (
    <>
      <Head>
        <title>{generateTitle('Login')}</title>
      </Head>
      <div className="flex w-full max-w-sm flex-col gap-2">
        <div className="self-end">
          <ToggleTheme />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>
              <h1 className="font-bold">Login</h1>
            </CardTitle>
            <CardDescription>Enter your email to receive a secure login code</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <LoginForm />
            <Button asChild variant="outline" className="w-full">
              <Link href={home()}>Go back home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

Login.layout = (page: ReactNode) => <BaseLayout>{page}</BaseLayout>;
