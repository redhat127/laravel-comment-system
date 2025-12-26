import CommentController from '@/actions/App/Http/Controllers/CommentController';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import type { CommentsTable } from '@/types';
import { useMutation, useQueryClient, type InfiniteData } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { Heart } from 'lucide-react';
import { toast } from 'sonner';
import z from 'zod';
import { Button } from '../ui/button';
import type { Comment } from './comment-list';

export const CommentLikes = ({
  commentId,
  likes_count,
  is_liked_by_auth,
}: {
  commentId: CommentsTable['id'];
  likes_count: number;
  is_liked_by_auth: boolean;
}) => {
  const queryClient = useQueryClient();
  const auth = useAuth();

  const mutation = useMutation({
    async mutationFn() {
      const res = await axios.post(CommentController.likes.url(), {
        commentId,
      });
      return res.data;
    },
    // Optimistic update for instant UI feedback
    onMutate: async () => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['comments'], exact: true });
      await queryClient.cancelQueries({ queryKey: ['comment-replies'] });

      // Snapshot previous values
      const previousComments = queryClient.getQueryData<InfiniteData<{ comments: Array<Comment>; next_cursor: string | null }>>(['comments']);
      const previousReplies = queryClient.getQueriesData<Array<Comment>>({ queryKey: ['comment-replies'] });

      // Optimistically update top-level comments
      queryClient.setQueryData<InfiniteData<{ comments: Array<Comment>; next_cursor: string | null }>>(['comments'], (old) => {
        if (!old) return old;

        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            comments: page.comments.map((comment) => {
              if (comment.id === commentId) {
                return {
                  ...comment,
                  is_liked_by_auth: !is_liked_by_auth,
                  likes_count: is_liked_by_auth ? likes_count - 1 : likes_count + 1,
                };
              }
              return comment;
            }),
          })),
        };
      });

      // Optimistically update ALL reply caches
      queryClient.setQueriesData<Array<Comment>>({ queryKey: ['comment-replies'] }, (replies) => {
        if (!replies) return replies;

        return replies.map((reply) => {
          if (reply.id === commentId) {
            return {
              ...reply,
              is_liked_by_auth: !is_liked_by_auth,
              likes_count: is_liked_by_auth ? likes_count - 1 : likes_count + 1,
            };
          }
          return reply;
        });
      });

      return { previousComments, previousReplies };
    },
    onError(error, _, context) {
      // Revert to previous state
      if (context?.previousComments) {
        queryClient.setQueryData(['comments'], context.previousComments);
      }
      if (context?.previousReplies) {
        context.previousReplies.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }

      if (error instanceof AxiosError) {
        if (error.status === 422) {
          const zodValidation = z
            .object({
              errors: z.object({ commentId: z.array(z.string()).optional() }),
            })
            .safeParse(error.response?.data);
          if (zodValidation.success && zodValidation.data.errors.commentId?.length) {
            toast.error(zodValidation.data.errors.commentId[0]);
          }
          return;
        }
        if (error.status === 404) {
          toast.error('Comment not found.');
          return;
        }
      }
      toast.error('Failed to update like.');
    },
  });

  const likesDisplay = (
    <div className="flex items-center gap-1.5 text-sm">
      <Heart
        className={cn('size-4 transition-all duration-200', {
          'scale-110 fill-red-600 text-red-600': is_liked_by_auth,
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
        navigator.vibrate?.(10); // Subtle vibration on mobile
        mutation.mutate();
      }}
      disabled={mutation.isPending}
    >
      {likesDisplay}
    </Button>
  );
};
