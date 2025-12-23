import { ProfileDetailsForm } from '@/components/form/account/profile-details-form';
import { BaseLayout } from '@/components/layout/base';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { generateTitle } from '@/lib/utils';
import { Head } from '@inertiajs/react';
import type { ReactNode } from 'react';

export default function Account() {
  return (
    <>
      <Head>
        <title>{generateTitle('Account')}</title>
      </Head>
      <div className="space-y-4 p-4 px-8">
        <Card>
          <CardHeader className="gap-0">
            <CardTitle>
              <h1 className="font-bold">Account</h1>
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>
              <h2 className="font-bold">Profile Details</h2>
            </CardTitle>
            <CardDescription>Keep your profile information up to date</CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileDetailsForm />
          </CardContent>
        </Card>
      </div>
    </>
  );
}

Account.layout = (page: ReactNode) => <BaseLayout>{page}</BaseLayout>;
