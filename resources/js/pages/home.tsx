import { CommentList } from '@/components/comment/comment-list';
import { CommentListSkeleton } from '@/components/comment/comment-skeleton';
import { CommentsCount } from '@/components/comment/comments-count';
import { CommentForm } from '@/components/form/comment/comment-form';
import { BaseLayout } from '@/components/layout/base';
import { ErrorBoundary } from '@/components/react-query-error-boundary';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { generateTitle } from '@/lib/utils';
import { Head } from '@inertiajs/react';
import { Loader2Icon } from 'lucide-react';
import { Suspense, type ReactNode } from 'react';

export default function Home() {
  const auth = useAuth();
  return (
    <>
      <Head>
        <title>{generateTitle('Start Commenting')}</title>
      </Head>
      <div className="mx-auto max-w-7xl space-y-4 p-8 pb-12">
        <Card>
          <CardHeader className="gap-0">
            <CardTitle>
              <h1 className="flex items-center gap-2 text-2xl font-bold">
                <ErrorBoundary
                  fallbackRender={({ resetErrorBoundary }) => (
                    <Button onClick={() => resetErrorBoundary()} variant="outline" size="sm">
                      Try again
                    </Button>
                  )}
                >
                  <Suspense fallback={<Loader2Icon className="animate-spin" />}>
                    <CommentsCount />
                  </Suspense>
                </ErrorBoundary>{' '}
                Comments
              </h1>
            </CardTitle>
          </CardHeader>
        </Card>
        {auth && (
          <Card>
            <CardHeader>
              <CardTitle>
                <h2 className="font-bold">Join the discussion</h2>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CommentForm mode="create" />
            </CardContent>
          </Card>
        )}
        <div className="mt-8">
          <ErrorBoundary
            fallbackRender={({ resetErrorBoundary }) => (
              <Card>
                <CardContent className="flex flex-col items-center justify-center space-y-3 py-8 text-center">
                  <p className="text-sm text-muted-foreground">Failed to load comments.</p>
                  <Button onClick={() => resetErrorBoundary()} variant="outline" size="sm">
                    Try again
                  </Button>
                </CardContent>
              </Card>
            )}
          >
            <Suspense fallback={<CommentListSkeleton />}>
              <CommentList />
            </Suspense>
          </ErrorBoundary>
        </div>
      </div>
    </>
  );
}

Home.layout = (page: ReactNode) => <BaseLayout>{page}</BaseLayout>;
