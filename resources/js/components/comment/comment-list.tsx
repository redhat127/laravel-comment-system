import CommentController from '@/actions/App/Http/Controllers/CommentController';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import type { CommentsTable, UsersTable } from '@/types';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Loader2, Reply } from 'lucide-react';
import { Fragment, Suspense, useEffect, useState } from 'react';
import { CommentForm } from '../form/comment/comment-form';
import { ErrorBoundary } from '../react-query-error-boundary';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { UserAvatar } from '../user-avatar';
import { CommentDropdown } from './comment-dropdown';
import { CommentLikes } from './comment-likes';
import { CommentReplies } from './comment-replies';
import { CommentRepliesSkeleton } from './comment-skeleton';

export type Comment = CommentsTable & {
  created_at_for_human: string;
  user?: Pick<UsersTable, 'id' | 'name' | 'avatar'>;
  is_liked_by_auth?: boolean;
  likes_count?: number;
  replies_count?: number;
};

export const CommentCard = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => {
  const auth = useAuth();

  const [commentEditing, setCommentEditing] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [replyTo, setReplyTo] = useState(false);

  const toggleReplies = () => setShowReplies((prev) => !prev);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setCommentEditing(false);
        setReplyTo(false);
      }
    };
    if (commentEditing || replyTo) {
      window.addEventListener('keydown', onKeyDown);
    }
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [commentEditing, replyTo]);

  useEffect(() => {
    if (comment.replies_count === 0 && showReplies) {
      setShowReplies(false);
    }
  }, [comment.replies_count, showReplies]);

  const hasReplies = comment.replies_count! > 0;

  return (
    <div className={cn(isReply && 'ml-8 border-l-2 pl-4')}>
      <Card className="gap-2">
        <CardHeader>
          <CardTitle className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <UserAvatar widthHeightClassNames="h-12 w-12 min-w-12" user={comment.user} />
              <div className="mt-1">
                <div className="flex flex-col">
                  <h3 className="max-w-30 truncate text-sm font-medium capitalize">{comment.user!.name}</h3>
                  <div className="flex gap-1">
                    <span className="text-xs text-muted-foreground">{comment.created_at_for_human}</span>
                    {comment.created_at !== comment.updated_at && <span className="text-xs text-muted-foreground">(edited)</span>}
                  </div>
                </div>
              </div>
            </div>
            {auth?.id === comment.user_id && <CommentDropdown comment={comment} openEditCommentBox={() => setCommentEditing(true)} />}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {commentEditing ? (
            <CommentForm mode="edit" defaultBody={comment.body} closeEditBox={() => setCommentEditing(false)} commentId={comment.id} />
          ) : (
            <div className="text-[0.94rem] wrap-break-word whitespace-pre-wrap text-primary">{comment.body}</div>
          )}
          <div className="flex items-center gap-2">
            <CommentLikes commentId={comment.id} likes_count={comment.likes_count!} is_liked_by_auth={comment.is_liked_by_auth!} />
            {auth && auth.id !== comment.user_id && !replyTo && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setReplyTo(true);
                }}
              >
                <Reply />
                Reply
              </Button>
            )}
            {hasReplies && (
              <Button variant="outline" size="sm" onClick={toggleReplies}>
                {showReplies ? 'Hide' : 'Show'} {comment.replies_count} {comment.replies_count === 1 ? 'reply' : 'replies'}
              </Button>
            )}
          </div>
          {replyTo && (
            <div className="pt-2">
              <CommentForm mode="reply-to" closeReplyToBox={() => setReplyTo(false)} commentId={comment.id} />
            </div>
          )}
        </CardContent>
      </Card>
      {showReplies && (
        <div className="mt-4">
          <ErrorBoundary
            fallbackRender={({ resetErrorBoundary }) => (
              <div className="ml-8 border-l-2 pl-4">
                <Card>
                  <CardContent className="flex flex-col items-center justify-center space-y-3 py-8 text-center">
                    <p className="text-sm text-muted-foreground">Failed to load replies.</p>
                    <Button onClick={() => resetErrorBoundary()} variant="outline" size="sm">
                      Try again
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          >
            <Suspense fallback={<CommentRepliesSkeleton />}>
              <CommentReplies commentId={comment.id} />
            </Suspense>
          </ErrorBoundary>
        </div>
      )}
    </div>
  );
};

export const CommentList = () => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useSuspenseInfiniteQuery({
    queryKey: ['comments'],
    async queryFn({ pageParam, signal }) {
      const res = await axios.get<{
        comments: Array<Comment>;
        next_cursor: string | null;
      }>(CommentController.topLevelComments.url(), {
        params: { cursor: pageParam },
        signal,
      });
      return res.data;
    },
    getNextPageParam: (lastPage) => lastPage.next_cursor,
    initialPageParam: undefined as string | undefined,
    staleTime: 60 * 1000, // 1 minute
  });

  return (
    <div className="space-y-4">
      {data.pages.map((page, pageIndex) => (
        <Fragment key={pageIndex}>
          {page.comments.map((comment) => (
            <CommentCard key={comment.id} comment={comment} />
          ))}
        </Fragment>
      ))}

      {hasNextPage && (
        <div className="flex justify-center pt-4">
          <Button onClick={() => fetchNextPage()} disabled={isFetchingNextPage} variant="outline">
            {isFetchingNextPage ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              'Load More'
            )}
          </Button>
        </div>
      )}
    </div>
  );
};
