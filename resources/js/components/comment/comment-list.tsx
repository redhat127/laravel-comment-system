import CommentController from '@/actions/App/Http/Controllers/CommentController';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import type { HomePageProps } from '@/pages/home';
import { router } from '@inertiajs/react';
import { Heart, Reply } from 'lucide-react';
import { useEffect, useState } from 'react';
import { CreateEditCommentForm } from '../form/comment/create-edit-comment-form';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { LoadingSwap } from '../ui/loading-swap';
import { UserAvatar } from '../user-avatar';
import { CommentDropdown } from './comment-dropdown';

type Comment = HomePageProps['comments']['data'][0];

// Load initial state from localStorage
const getInitialShowReplies = (commentId: string) => {
  try {
    return localStorage.getItem(`comment-${commentId}-expanded`) === 'true';
  } catch {
    return false;
  }
};

// Add this helper function at the top of your file, outside the component
const cleanupOldExpandedStates = () => {
  try {
    const keys = Object.keys(localStorage);
    const commentExpandedKeys = keys.filter((key) => key.startsWith('comment-') && key.endsWith('-expanded'));

    // Keep only the last 50 expanded states to prevent localStorage bloat
    if (commentExpandedKeys.length > 50) {
      commentExpandedKeys.slice(0, commentExpandedKeys.length - 50).forEach((key) => {
        localStorage.removeItem(key);
      });
    }
  } catch {
    // Ignore errors
  }
};

const CommentCard = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => {
  const auth = useAuth();
  const [commentEditing, setCommentEditing] = useState(false);

  const [showReplies, setShowReplies] = useState(() => getInitialShowReplies(comment.id));

  const toggleReplies = () => {
    const newValue = !showReplies;
    setShowReplies(newValue);
    try {
      if (newValue) {
        localStorage.setItem(`comment-${comment.id}-expanded`, 'true');
      } else {
        localStorage.removeItem(`comment-${comment.id}-expanded`);
      }
    } catch {
      // Ignore localStorage errors
    }
  };

  const openEditCommentBox = () => {
    if (!commentEditing) setCommentEditing(true);
  };
  const closeEditCommentBox = () => setCommentEditing(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setCommentEditing(false);
    };
    if (commentEditing) {
      window.addEventListener('keydown', onKeyDown);
    }
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [commentEditing]);

  useEffect(() => {
    // Cleanup on mount (only runs once when component first loads)
    cleanupOldExpandedStates();
  }, []);

  const hasReplies = comment.replies.length > 0;

  const [replyTo, setReplyTo] = useState(false);

  return (
    <div className={cn(isReply && 'ml-8 border-l-2 pl-4')}>
      <Card className="gap-2">
        <CardHeader>
          <CardTitle className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <UserAvatar widthHeightClassNames="h-12 w-12 min-w-12" user={comment.user} />
              <div className="mt-1">
                <div className="flex flex-col">
                  <h3 className="max-w-30 truncate text-sm font-medium capitalize">{comment.user.name}</h3>
                  <div className="flex gap-1">
                    <span className="text-xs text-muted-foreground">{comment.created_at_for_human}</span>
                    {comment.created_at !== comment.updated_at && <span className="text-xs text-muted-foreground">(edited)</span>}
                  </div>
                </div>
              </div>
            </div>
            {auth?.id === comment.user_id && <CommentDropdown comment={comment} openEditCommentBox={openEditCommentBox} />}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {commentEditing ? (
            <CreateEditCommentForm mode="edit" commentId={comment.id} body={comment.body} closeEditCommentBox={closeEditCommentBox} />
          ) : (
            <div className="text-[0.94rem] wrap-break-word whitespace-pre-wrap text-primary">{comment.body}</div>
          )}
          <div className="flex items-center gap-2">
            <Likes commentId={comment.id} likes_count={comment.likes_count} is_liked_by_auth={comment.is_liked_by_auth} />
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
                {showReplies ? 'Hide' : 'Show'} {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
              </Button>
            )}
          </div>
          {replyTo && (
            <div className="pt-2">
              <CreateEditCommentForm mode="create" isReply={true} closeReplyBox={() => setReplyTo(false)} parentId={comment.id} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Render nested replies only when showReplies is true */}
      {hasReplies && showReplies && (
        <div className="mt-4 space-y-4">
          {comment.replies.map((reply) => (
            <CommentCard key={reply.id} comment={reply} isReply={true} />
          ))}
        </div>
      )}
    </div>
  );
};

const Likes = ({ commentId, likes_count, is_liked_by_auth }: { commentId: Comment['id']; likes_count: number; is_liked_by_auth: boolean }) => {
  const [isPending, setIsPending] = useState(false);
  const auth = useAuth();
  const likesDisplay = (
    <div className="flex items-center gap-1.5 text-sm">
      <Heart
        className={cn('size-4', {
          'fill-red-600 text-red-600': is_liked_by_auth,
        })}
      />
      {likes_count}
    </div>
  );
  return !auth ? (
    likesDisplay
  ) : (
    <Button
      size="sm"
      variant="outline"
      onClick={() => {
        router.post(CommentController.likeComment({ commentId }), undefined, {
          preserveScroll: true,
          preserveState: 'errors',
          onBefore() {
            setIsPending(true);
          },
          onFinish() {
            setIsPending(false);
          },
        });
      }}
    >
      <LoadingSwap isLoading={isPending}>{likesDisplay}</LoadingSwap>
    </Button>
  );
};

export const CommentList = ({ comments }: { comments: Array<Comment> }) => {
  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <CommentCard key={comment.id} comment={comment} />
      ))}
    </div>
  );
};
