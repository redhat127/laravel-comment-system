import CommentController from '@/actions/App/Http/Controllers/CommentController';
import { useSuspenseQuery } from '@tanstack/react-query';
import axios from 'axios';

export const CommentsCount = () => {
  const query = useSuspenseQuery({
    queryKey: ['comments-count'],
    async queryFn({ signal }) {
      const response = await axios.get<{ comments_count: string }>(CommentController.commentsCount.url(), {
        signal,
      });
      return parseInt(response.data.comments_count);
    },
    staleTime: 60 * 1000, // 1 minute
  });
  return query.data;
};
