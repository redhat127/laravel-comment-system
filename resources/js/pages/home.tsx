import { CommentList } from '@/components/comment-list';
import { CreateCommentForm } from '@/components/form/create-comment-form';
import { BaseLayout } from '@/components/layout/base';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { generateTitle } from '@/lib/utils';
import type { CommentsTable, UsersTable } from '@/types';
import { Head } from '@inertiajs/react';
import { MessageSquare } from 'lucide-react';
import type { ReactNode } from 'react';

export interface HomePageProps {
  comments: { data: Array<CommentsTable & { created_at_for_human: string; user: Pick<UsersTable, 'name' | 'avatar'> }> };
  comments_count: number;
}

export default function Home({ comments: { data: comments }, comments_count }: HomePageProps) {
  const auth = useAuth();
  return (
    <>
      <Head>
        <title>{generateTitle('Start Commenting')}</title>
      </Head>
      <div className="mx-auto max-w-6xl space-y-4 p-8 pb-12">
        <Card>
          <CardHeader className="gap-0">
            <CardTitle>
              <h1 className="flex items-center gap-2 text-2xl font-bold">
                <MessageSquare />
                Comments
                <Badge className="ml-2 h-5 min-w-5 rounded-full tabular-nums">{comments_count}</Badge>
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
              <CreateCommentForm />
            </CardContent>
          </Card>
        )}
        <div className="mt-8">
          {comments.length > 0 ? <CommentList comments={comments} /> : <p className="text-muted-foreground">No comment found.</p>}
        </div>
      </div>
    </>
  );
}

Home.layout = (page: ReactNode) => <BaseLayout>{page}</BaseLayout>;
