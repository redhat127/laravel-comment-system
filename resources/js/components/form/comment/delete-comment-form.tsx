import CommentController from '@/actions/App/Http/Controllers/CommentController';
import type { Comment } from '@/components/comment/comment-list';
import type { CommentsTable } from '@/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { Trash } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import z from 'zod';

export const DeleteCommentForm = ({ commentId }: { commentId: CommentsTable['id'] }) => {
  const [isFormDisabled, setIsFormDisabled] = useState(false);
  const queryClient = useQueryClient();
  const mutation = useMutation({
    async mutationFn() {
      const response = await axios.delete<{ parent_id: CommentsTable['parent_id']; deleted_count: number }>(
        CommentController.delete.url({ commentId }),
      );
      return response.data;
    },
    onMutate() {
      setIsFormDisabled(true);
    },
    onError(error) {
      if (error instanceof AxiosError) {
        if (error.status === 422) {
          const zodValidation = z
            .object({
              errors: z.object({ commentId: z.array(z.string()).optional() }),
            })
            .safeParse(error.response?.data);
          if (zodValidation.success) {
            const errors = zodValidation.data.errors;
            if (errors.commentId?.length) {
              toast.error(errors.commentId[0]);
            }
          }
          return;
        }
        if (error.status === 404) {
          toast.error('Comment not found.');
          return;
        }
      }
      toast.error('Failed to delete the comment.');
    },
    onSuccess({ deleted_count: deletedCount, parent_id: parentId }) {
      // Decrement comments count by the total number of deleted comments
      queryClient.setQueryData<number>(['comments-count'], (commentsCount = 0) => Math.max(0, commentsCount - deletedCount));

      // Remove from top-level comments and decrement parent's replies_count
      queryClient.setQueryData<Array<Comment>>(['comments'], (comments = []) => {
        const filtered = comments.filter((c) => c.id !== commentId);

        if (parentId) {
          return filtered.map((c) => {
            if (c.id === parentId) {
              return { ...c, replies_count: Math.max(0, c.replies_count! - 1) };
            }
            return c;
          });
        }

        return filtered;
      });

      // Remove from ALL reply caches and decrement parent's replies_count
      queryClient.setQueriesData<Array<Comment>>({ queryKey: ['comment-replies'] }, (replies) => {
        if (!replies) return replies;

        const filtered = replies.filter((reply) => reply.id !== commentId);

        if (parentId) {
          return filtered.map((reply) => {
            if (reply.id === parentId) {
              return { ...reply, replies_count: Math.max(0, reply.replies_count! - 1) };
            }
            return reply;
          });
        }

        return filtered;
      });

      toast.success('Comment deleted.');
    },
    onSettled() {
      setIsFormDisabled(false);
    },
  });
  return (
    <form
      className="w-full"
      onSubmit={(e) => {
        e.preventDefault();
        if (!confirm('Are you sure you want to delete this comment?')) return false;
        mutation.mutate();
      }}
    >
      <button type="submit" disabled={isFormDisabled} className="flex w-full items-center gap-1.5 px-2 py-1.5 text-red-600 dark:text-red-300">
        <Trash className="text-inherit" />
        Delete
      </button>
    </form>
  );
};
