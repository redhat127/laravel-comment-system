import { CommentList } from '@/components/comment/comment-list';
import { CreateEditCommentForm } from '@/components/form/comment/create-edit-comment-form';
import { BaseLayout } from '@/components/layout/base';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { generateTitle } from '@/lib/utils';
import type { CommentsTable, UsersTable } from '@/types';
import { Head } from '@inertiajs/react';
import { MessageSquare } from 'lucide-react';
import type { ReactNode } from 'react';

type ExtraCommentPropsFromCommentResource = {
  created_at_for_human: string;
  user: Pick<UsersTable, 'name' | 'avatar'>;
  likes_count: number;
  is_liked_by_auth: boolean;
  replies: Array<CommentsTable & ExtraCommentPropsFromCommentResource>;
};

export interface HomePageProps {
  comments: {
    data: Array<CommentsTable & ExtraCommentPropsFromCommentResource>;
  };
  comments_count: number;
}

export default function Home({ comments: { data: comments }, comments_count }: HomePageProps) {
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
              <CreateEditCommentForm mode="create" />
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
