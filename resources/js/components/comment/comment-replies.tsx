import CommentController from '@/actions/App/Http/Controllers/CommentController';
import type { CommentsTable } from '@/types';
import { useSuspenseQuery } from '@tanstack/react-query';
import axios from 'axios';
import { CommentCard, type Comment } from './comment-list';

export const CommentReplies = ({ commentId }: { commentId: CommentsTable['id'] }) => {
  const { data: replies } = useSuspenseQuery({
    queryKey: ['comment-replies', commentId],
    async queryFn({ signal }) {
      const res = await axios.get<{
        replies: Array<Comment>;
      }>(CommentController.replies.url(commentId), { signal });
      return res.data.replies;
    },
    staleTime: 60 * 1000, // 1 minute
  });

  return (
    <div className="mt-4 space-y-4">
      {replies.map((reply) => (
        <CommentCard key={reply.id} comment={reply} isReply={true} />
      ))}
    </div>
  );
};
