import CommentController from '@/actions/App/Http/Controllers/CommentController';
import { BodyTextBox } from '@/components/comment/comment-body-textbox';
import type { Comment } from '@/components/comment/comment-list';
import { SubmitBtn } from '@/components/submit-btn';
import { Button } from '@/components/ui/button';
import { FieldGroup } from '@/components/ui/field';
import { UserAvatar } from '@/components/user-avatar';
import { cn, removeNulls } from '@/lib/utils';
import type { CommentsTable } from '@/types';
import { commentBodyRule } from '@/zod/fields';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { Edit, Send } from 'lucide-react';
import { useState, type KeyboardEvent } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';

export const commentSchema = z.object({
  body: commentBodyRule,
});

export type CommentSchema = z.infer<typeof commentSchema>;

type CommentFormProps =
  | { mode: 'create' }
  | {
      mode: 'reply-to';
      defaultBody?: never;
      closeReplyToBox(): void;
      commentId: CommentsTable['id'];
    }
  | {
      mode: 'edit';
      defaultBody: string;
      closeEditBox(): void;
      commentId: CommentsTable['id'];
    };

export const CommentForm = (props: CommentFormProps) => {
  const form = useForm<CommentSchema>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      body: props.mode === 'edit' ? props.defaultBody : '',
    },
  });

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
    watch,
    setError,
    reset,
  } = form;

  const [isPending, setIsPending] = useState(false);
  const isFormDisabled = isSubmitting || isPending;

  const bodyValue = watch('body') || '';
  const bodyCharactersLeft = 500 - bodyValue.trim().length;

  const queryClient = useQueryClient();

  const mutation = useMutation({
    async mutationFn(data: CommentSchema) {
      if (props.mode === 'create') {
        const response = await axios.post<{ new_comment: Comment }>(CommentController.post.url(), data);
        return response.data.new_comment;
      }
      if (props.mode === 'reply-to') {
        const response = await axios.post<{ new_comment: Comment }>(CommentController.replyTo.url(), {
          ...data,
          commentId: props.commentId,
        });
        return response.data.new_comment;
      }
      if (props.mode === 'edit') {
        const response = await axios.patch<{ updated_comment: Comment }>(CommentController.update.url({ commentId: props.commentId }), data);
        return response.data.updated_comment;
      }
    },
    onMutate() {
      setIsPending(true);
    },
    onError(error) {
      if (error instanceof AxiosError) {
        if (error.status === 422) {
          const zodValidation = z
            .object({
              errors: z.object({ commentId: z.array(z.string()).optional(), body: z.array(z.string()).optional() }),
            })
            .safeParse(error.response?.data);
          if (zodValidation.success) {
            const errors = zodValidation.data.errors;
            if (errors.commentId?.length) {
              toast.error(errors.commentId[0]);
            }
            if (errors.body?.length) {
              setError('body', { message: errors.body[0] });
            }
          }
          return;
        }
        if (error.status === 404) {
          toast.error('Comment not found.');
          return;
        }
        if (props.mode === 'create') {
          toast.error('Failed to create comment.');
          return;
        }
        if (props.mode === 'reply-to') {
          toast.error('Failed to reply to comment.');
          return;
        }
        if (props.mode === 'edit') {
          toast.error('Failed to edit comment.');
          return;
        }
      }
    },
    onSuccess(comment) {
      if (!comment) return;
      if (props.mode === 'reply-to' || props.mode === 'create') {
        queryClient.setQueryData<number>(['comments-count'], (commentsCount = 0) => commentsCount + 1);
      }
      queryClient.setQueryData<Array<Comment>>(['comments'], (comments = []) => {
        if (props.mode === 'create') {
          return [{ ...comment, is_liked_by_auth: false, replies_count: 0, likes_count: 0 }, ...comments];
        }
        if (props.mode === 'reply-to') {
          return comments.map((c) => (c.id === comment.parent_id ? { ...c, replies_count: c.replies_count! + 1 } : c));
        }
        if (props.mode === 'edit') {
          return comments.map((c) => (c.id === comment.id ? { ...c, ...removeNulls(comment) } : c));
        }
        return comments;
      });

      if (props.mode === 'reply-to') {
        const existingReplies = queryClient.getQueryData<Array<Comment>>(['comment-replies', comment.parent_id]);
        if (existingReplies) {
          queryClient.setQueryData<Array<Comment>>(['comment-replies', comment.parent_id], (replies = []) => {
            // Add to the end instead of the beginning to match backend order (oldest to newest)
            return [...replies, { ...comment, is_liked_by_auth: false, replies_count: 0, likes_count: 0 }];
          });
        }

        // Update ALL reply caches to increment replies_count for nested replies
        queryClient.setQueriesData<Array<Comment>>({ queryKey: ['comment-replies'] }, (replies) => {
          if (!replies) return replies;

          return replies.map((reply) => {
            if (reply.id === comment.parent_id) {
              return { ...reply, replies_count: reply.replies_count! + 1 };
            }
            return reply;
          });
        });
      }

      if (props.mode === 'edit') {
        // Update ALL reply caches for edited comments
        queryClient.setQueriesData<Array<Comment>>({ queryKey: ['comment-replies'] }, (replies) => {
          if (!replies) return replies;

          return replies.map((reply) => {
            if (reply.id === comment.id) {
              return { ...reply, ...removeNulls(comment) };
            }
            return reply;
          });
        });
      }

      if (props.mode === 'create') {
        reset();
      }
      if (props.mode === 'reply-to') {
        props.closeReplyToBox();
      }
      if (props.mode === 'edit') {
        props.closeEditBox();
      }
      toast.success(props.mode === 'create' ? 'Comment added.' : props.mode === 'reply-to' ? 'Reply added.' : 'Comment edited.');
    },
    onSettled() {
      setIsPending(false);
    },
  });

  const handleFormSubmit = handleSubmit((data: CommentSchema) => {
    mutation.mutate(data);
  });

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleFormSubmit();
    }
  };

  return (
    <form onSubmit={handleFormSubmit} className="w-full">
      <FieldGroup className="gap-4">
        <div className="flex items-start gap-2">
          <UserAvatar widthHeightClassNames="h-12 w-12 min-w-12" />
          <BodyTextBox control={control} name="body" onKeyDown={onKeyDown} bodyCharactersLeft={bodyCharactersLeft} />
        </div>
        <div
          className={cn('flex items-center justify-end', {
            'gap-2': props.mode !== 'create',
          })}
        >
          {props.mode !== 'create' && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isFormDisabled}
              onClick={() => {
                if (props.mode === 'reply-to') {
                  props.closeReplyToBox();
                }
                if (props.mode === 'edit') {
                  props.closeEditBox();
                }
              }}
            >
              Cancel
            </Button>
          )}
          <SubmitBtn disabled={isFormDisabled} size="sm">
            <span className="flex items-center gap-1">
              {props.mode !== 'edit' && (
                <>
                  <Send className="size-4" />
                  {props.mode === 'create' ? 'Comment' : 'Reply'}
                </>
              )}
              {props.mode === 'edit' && (
                <>
                  <Edit className="size-4" />
                  Edit
                </>
              )}
            </span>
          </SubmitBtn>
        </div>
      </FieldGroup>
    </form>
  );
};
