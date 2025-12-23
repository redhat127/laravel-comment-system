import { useAuth } from '@/hooks/use-auth';
import type { HomePageProps } from '@/pages/home';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { UserAvatar } from '../user-avatar';
import { CommentDropdown } from './comment-dropdown';

export const CommentList = ({ comments }: { comments: HomePageProps['comments']['data'] }) => {
  const auth = useAuth();
  return comments.map((comment) => (
    <Card key={comment.id} className="gap-2">
      <CardHeader>
        <CardTitle className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <UserAvatar widthHeightClassNames="h-12 w-12 min-w-12" user={comment.user} />
            <div className="mt-1 flex flex-col items-start sm:flex-row sm:items-center sm:gap-2">
              <h3 className="max-w-30 truncate text-sm font-medium capitalize">{comment.user.name}</h3>
              <span className="hidden sm:inline-block">•</span>
              <span className="text-xs text-muted-foreground">{comment.created_at_for_human}</span>
            </div>
          </div>
          {auth?.id === comment.user_id && <CommentDropdown comment={comment} />}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-[0.94rem] wrap-break-word whitespace-pre-wrap text-primary">{comment.body}</CardContent>
    </Card>
  ));
};
