import { LoginResendCodeForm } from '@/components/form/login/login-resend-code-form';
import { LoginVerifyCodeForm } from '@/components/form/login/login-verify-code-form';
import { BaseLayout } from '@/components/layout/base';
import { ToggleTheme } from '@/components/theme-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRateLimitCountdown } from '@/hooks/use-rate-limit-countdown';
import { generateTitle } from '@/lib/utils';
import { home } from '@/routes';
import auth from '@/routes/auth';
import { Head, Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import { type ReactNode } from 'react';

type Props = {
  rateLimitExpiresAt?: number;
  email: string;
};

export default function LoginVerifyCode({ rateLimitExpiresAt, email }: Props) {
  const { seconds, isFinished } = useRateLimitCountdown(rateLimitExpiresAt);
  return (
    <>
      <Head>
        <title>{generateTitle('Login - Verify Code')}</title>
      </Head>
      <div className="flex w-full max-w-sm flex-col gap-2">
        <div className="self-end">
          <ToggleTheme />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>
              <h1 className="font-bold">Login - Verify Code</h1>
            </CardTitle>
            <CardDescription>Check your email and enter the code below</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-primary">
                Code sent to <strong>{email}</strong>
              </p>
              <LoginVerifyCodeForm />
              <div className="space-y-4">
                {!isFinished ? (
                  <p className="text-sm text-muted-foreground">
                    You can try again in <strong>{seconds}</strong> seconds.
                  </p>
                ) : (
                  <LoginResendCodeForm />
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Button asChild variant="outline" className="w-full">
                <Link href={auth.login.get()}>
                  <ArrowRight />
                  Back to login
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href={home()}>
                  <ArrowRight />
                  Go back home
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

LoginVerifyCode.layout = (page: ReactNode) => <BaseLayout>{page}</BaseLayout>;
