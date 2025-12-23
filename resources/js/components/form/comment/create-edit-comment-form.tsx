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
  commentId?: never;
  body?: never;
  closeEditCommentBox?: never;
};

type EditModeProps = {
  mode: 'edit';
  commentId: string;
  body: string;
  closeEditCommentBox: () => void;
};

type CommentFormProps = CreateModeProps | EditModeProps;

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
    <p
      className={cn('text-sm', {
        'text-muted-foreground': bodyCharactersLeft >= 0,
        'text-destructive': bodyCharactersLeft < 0,
      })}
    >
      Characters left: {bodyCharactersLeft}
    </p>
  </div>
);

export const CreateEditCommentForm = (props: CommentFormProps) => {
  const { mode } = props;

  const body = mode === 'edit' ? props.body : '';
  const closeEditCommentBox = mode === 'edit' ? props.closeEditCommentBox : undefined;

  const form = useForm({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      body,
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

  const bodyLength = watch('body').trim().length;
  const bodyCharactersLeft = 500 - bodyLength;

  const isCreateMode = mode === 'create';

  const handleFormSubmit = handleSubmit((data) => {
    const config: VisitHelperOptions<z.infer<typeof commentSchema>> = {
      preserveScroll: true,
      preserveState: 'errors',
      onBefore() {
        setIsPending(true);
      },
      onFinish() {
        setIsPending(false);
      },
      onError(errors) {
        showServerValidationErrors(errors);
      },
    };

    if (isCreateMode) {
      router.post(CommentController.post(), data, config);
    } else {
      if (props.commentId) {
        router.patch(CommentController.patch({ commentId: props.commentId }), data, config);
      }
    }
  });
  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleFormSubmit();
    }
  };

  return (
    <form onSubmit={handleFormSubmit}>
      <FieldGroup className="gap-4">
        {isCreateMode && (
          <div className="flex items-start gap-2">
            <UserAvatar widthHeightClassNames="h-12 w-12 min-w-12" />
            <BodyTextBox control={control} name="body" onKeyDown={onKeyDown} bodyCharactersLeft={bodyCharactersLeft} />
          </div>
        )}

        {!isCreateMode && <BodyTextBox control={control} name="body" onKeyDown={onKeyDown} bodyCharactersLeft={bodyCharactersLeft} />}

        <div className={cn('self-end', { 'flex items-center gap-2': !isCreateMode })}>
          {!isCreateMode && (
            <Button type="button" variant="outline" onClick={closeEditCommentBox} disabled={isFormDisabled}>
              Cancel
            </Button>
          )}
          <SubmitBtn disabled={isFormDisabled}>
            <span className="flex items-center gap-1">
              {isCreateMode ? (
                <>
                  <Send />
                  Comment
                </>
              ) : (
                <>
                  <Edit />
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
