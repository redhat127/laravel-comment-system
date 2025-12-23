import CommentController from '@/actions/App/Http/Controllers/CommentController';
import { cn, showServerValidationErrors } from '@/lib/utils';
import { commentBodyRule } from '@/zod/fields';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from '@inertiajs/react';
import { Send } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import z from 'zod';
import { SubmitBtn } from '../submit-btn';
import { Textbox } from '../textbox';
import { FieldGroup } from '../ui/field';
import { UserAvatar } from '../user-avatar';

const createCommentSchema = z.object({
  body: commentBodyRule,
});

export const CreateCommentForm = () => {
  const form = useForm({
    resolver: zodResolver(createCommentSchema),
    defaultValues: {
      body: '',
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
  const bodyCharactersLeft = 200 - bodyLength;
  return (
    <form
      onSubmit={handleSubmit((data) => {
        router.post(CommentController.post(), data, {
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
        });
      })}
    >
      <FieldGroup className="gap-4">
        <div className="flex items-start gap-2">
          <UserAvatar widthHeightClassNames="h-12 w-12 min-w-12" />
          <div className="w-full space-y-1.5">
            <Textbox
              control={control}
              name="body"
              label="Body"
              textareaProps={{
                className: 'h-32 resize-none p-4 break-all',
                placeholder: 'What are your thoughts?',
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
        </div>
        <div className="self-end">
          <SubmitBtn disabled={isFormDisabled}>
            <span className="flex items-center gap-1">
              <Send />
              Comment
            </span>
          </SubmitBtn>
        </div>
      </FieldGroup>
    </form>
  );
};
