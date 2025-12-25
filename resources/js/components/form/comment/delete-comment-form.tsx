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
      const response = await axios.delete(CommentController.delete.url({ commentId }));
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
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ['comments-count'], exact: true });
      queryClient.setQueryData<Array<Comment>>(['comments'], (comments = []) => {
        return comments.filter((c) => c.id !== commentId);
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
