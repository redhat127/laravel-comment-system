import AccountController from '@/actions/App/Http/Controllers/AccountController';
import { SubmitBtn } from '@/components/submit-btn';
import { TextInput } from '@/components/text-input';
import { Button } from '@/components/ui/button';
import { FieldGroup } from '@/components/ui/field';
import { useAuth } from '@/hooks/use-auth';
import { showServerValidationErrors } from '@/lib/utils';
import { home } from '@/routes';
import { nameRule, usernameRule } from '@/zod/fields';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import z from 'zod';

const profileDetailsForm = z.object({
  name: nameRule,
  username: usernameRule,
});

export const ProfileDetailsForm = () => {
  const { name, username, username_changed_at } = useAuth()!;
  const form = useForm<z.infer<typeof profileDetailsForm>>({
    resolver: zodResolver(profileDetailsForm),
    defaultValues: {
      name,
      username,
    },
  });
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = form;
  const [isPending, setIsPending] = useState(false);
  const isFormDisabled = isSubmitting || isPending;
  return (
    <form
      className="max-w-lg"
      onSubmit={handleSubmit((data) => {
        router.post(AccountController.profileDetails(), data, {
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
        <TextInput control={control} name="name" label="Name" />
        <div className="space-y-1">
          <TextInput control={control} name="username" label="Username" />
          {username_changed_at && (
            <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
              Username last changed on {new Date(username_changed_at).toLocaleString()}
            </p>
          )}
        </div>
        <div className="space-x-2">
          <SubmitBtn disabled={isFormDisabled} className="self-start">
            Update
          </SubmitBtn>
          <Button asChild variant="outline">
            <Link href={home()}>Cancel</Link>
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
};
