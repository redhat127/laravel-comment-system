import CommentController from '@/actions/App/Http/Controllers/CommentController';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import type { CommentsTable } from '@/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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

      // Snapshot previous value
      const previousComments = queryClient.getQueryData<Array<Comment>>(['comments']);

      // Optimistically update
      queryClient.setQueryData<Array<Comment>>(['comments'], (old = []) => {
        return old.map((comment) => {
          if (comment.id === commentId) {
            return {
              ...comment,
              is_liked_by_auth: !is_liked_by_auth,
              likes_count: is_liked_by_auth ? likes_count - 1 : likes_count + 1,
            };
          }
          return comment;
        });
      });

      return { previousComments };
    },
    onError(error, _, context) {
      // Rollback on error
      if (context?.previousComments) {
        queryClient.setQueryData<Array<Comment>>(['comments'], context.previousComments);
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
