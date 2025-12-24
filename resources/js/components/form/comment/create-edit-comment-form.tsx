import CommentController from '@/actions/App/Http/Controllers/CommentController';
import { Button } from '@/components/ui/button';
import { cn, showServerValidationErrors } from '@/lib/utils';
import { commentBodyRule } from '@/zod/fields';
import { zodResolver } from '@hookform/resolvers/zod';
import type { VisitHelperOptions } from '@inertiajs/core';
import { router } from '@inertiajs/react';
import { Edit, Send } from 'lucide-react';
import { useState, type KeyboardEvent } from 'react';
import { useForm, type ControllerProps, type FieldValues } from 'react-hook-form';
import z from 'zod';
import { SubmitBtn } from '../../submit-btn';
import { Textbox } from '../../textbox';
import { FieldGroup } from '../../ui/field';
import { UserAvatar } from '../../user-avatar';

const commentSchema = z.object({
  body: commentBodyRule,
});

type CreateModeProps = {
  mode: 'create';
  isReply?: false;
  commentId?: never;
  parentId?: never;
  body?: never;
  closeEditCommentBox?: never;
  closeReplyBox?: never;
};

type ReplyModeProps = {
  mode: 'create';
  isReply: true;
  parentId: string;
  closeReplyBox: () => void;
  commentId?: never;
  body?: never;
  closeEditCommentBox?: never;
};

type EditModeProps = {
  mode: 'edit';
  commentId: string;
  body: string;
  closeEditCommentBox: () => void;
  isReply?: never;
  parentId?: never;
  closeReplyBox?: never;
};

type CommentFormProps = CreateModeProps | ReplyModeProps | EditModeProps;

const BodyTextBox = <TFieldValues extends FieldValues = FieldValues>({
  name,
  control,
  bodyCharactersLeft,
  onKeyDown,
}: {
  bodyCharactersLeft: number;
  onKeyDown: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
} & Pick<ControllerProps<TFieldValues>, 'name' | 'control'>) => (
  <div className="w-full space-y-1.5">
    <Textbox
      control={control}
      name={name}
      label="Body"
      textareaProps={{
        className: 'h-32 resize-none p-4 break-all',
        placeholder: 'What are your thoughts?',
        onKeyDown,
      }}
      hideLabel
    />
    <div className="flex items-center justify-between">
      <p
        className={cn('text-sm', {
          'text-muted-foreground': bodyCharactersLeft >= 0,
          'text-destructive': bodyCharactersLeft < 0,
        })}
      >
        Characters left: {bodyCharactersLeft}
      </p>
      <p className="text-xs text-muted-foreground">Press Shift+Enter for new line</p>
    </div>
  </div>
);

export const CreateEditCommentForm = (props: CommentFormProps) => {
  const { mode } = props;

  const isReplyMode = mode === 'create' && props.isReply === true;
  const isEditMode = mode === 'edit';
  const isCreateMode = mode === 'create' && !props.isReply;

  const form = useForm({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      body: isEditMode ? props.body : '',
    },
  });

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
    watch,
  } = form;

  const [isPending, setIsPending] = useState(false);
  const isFormDisabled = isSubmitting || isPending;

  const bodyValue = watch('body') || '';
  const bodyCharactersLeft = 500 - bodyValue.trim().length;

  const handleFormSubmit = handleSubmit((data) => {
    const config: VisitHelperOptions<z.infer<typeof commentSchema>> = {
      preserveScroll: true,
      preserveState: 'errors',
      onBefore: () => {
        setIsPending(true);
      },
      onFinish: () => {
        setIsPending(false);
      },
      onError: (errors) => {
        showServerValidationErrors(errors);
      },
    };

    if (isReplyMode) {
      router.post(CommentController.replyTo({ commentId: props.parentId }), data, config);
    } else if (isCreateMode) {
      router.post(CommentController.post(), data, config);
    } else if (isEditMode) {
      router.patch(CommentController.patch({ commentId: props.commentId }), data, config);
    }
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
          {/* Avatar is now visible in all scenarios */}
          <UserAvatar widthHeightClassNames="h-12 w-12 min-w-12" />

          <BodyTextBox control={control} name="body" onKeyDown={onKeyDown} bodyCharactersLeft={bodyCharactersLeft} />
        </div>

        <div className="flex items-center justify-end gap-2">
          {(isEditMode || isReplyMode) && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={isEditMode ? props.closeEditCommentBox : props.closeReplyBox}
              disabled={isFormDisabled}
            >
              Cancel
            </Button>
          )}
          <SubmitBtn disabled={isFormDisabled} size="sm">
            <span className="flex items-center gap-1">
              {isEditMode ? (
                <>
                  <Edit className="size-4" />
                  Edit
                </>
              ) : (
                <>
                  <Send className="size-4" />
                  {isReplyMode ? 'Reply' : 'Comment'}
                </>
              )}
            </span>
          </SubmitBtn>
        </div>
      </FieldGroup>
    </form>
  );
};
