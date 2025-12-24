import CommentController from '@/actions/App/Http/Controllers/CommentController';
import type { CommentsTable } from '@/types';
import { router } from '@inertiajs/react';
import { Trash } from 'lucide-react';
import { useState } from 'react';

export const DeleteCommentForm = ({ commentId }: { commentId: CommentsTable['id'] }) => {
  const [isFormDisabled, setIsFormDisabled] = useState(false);
  return (
    <form
      className="w-full"
      onSubmit={(e) => {
        e.preventDefault();
        router.delete(CommentController.delete({ commentId }), {
          preserveScroll: true,
          preserveState: 'errors',
          onBefore() {
            if (!confirm('Are you sure you want to delete this comment?')) return false;
            setIsFormDisabled(true);
          },
          onFinish() {
            setIsFormDisabled(false);
          },
          onSuccess() {
            localStorage.removeItem(`comment-${commentId}-expanded`);
          },
        });
      }}
    >
      <button type="submit" disabled={isFormDisabled} className="flex w-full items-center gap-1.5 px-2 py-1.5 text-red-600 dark:text-red-300">
        <Trash className="text-inherit" />
        Delete
      </button>
    </form>
  );
};
