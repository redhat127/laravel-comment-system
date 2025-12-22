import { BaseLayout } from '@/components/layout/base';
import { generateTitle } from '@/lib/utils';
import { Head } from '@inertiajs/react';
import type { ReactNode } from 'react';

export default function Home() {
  return (
    <Head>
      <title>{generateTitle('Start Commenting')}</title>
    </Head>
  );
}

Home.layout = (page: ReactNode) => <BaseLayout>{page}</BaseLayout>;
