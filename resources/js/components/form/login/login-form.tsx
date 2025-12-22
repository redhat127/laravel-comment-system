import LoginController from '@/actions/App/Http/Controllers/Auth/LoginController';
import { showServerValidationErrors } from '@/lib/utils';
import { emailRule, remember_meRule } from '@/zod/fields';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from '@inertiajs/react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import z from 'zod';
import { CheckboxInput } from '../../checkbox-input';
import { SubmitBtn } from '../../submit-btn';
import { TextInput } from '../../text-input';
import { FieldGroup } from '../../ui/field';

const loginSchema = z.object({
  email: emailRule,
  remember_me: remember_meRule,
});

export const LoginForm = () => {
  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      remember_me: false,
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
      onSubmit={handleSubmit((data) => {
        router.post(LoginController.post(), data, {
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
        <TextInput control={control} name="email" label="Email" inputProps={{ type: 'email' }} />
        <CheckboxInput control={control} name="remember_me" label="Remember me?" />
        <SubmitBtn disabled={isFormDisabled}>Login</SubmitBtn>
      </FieldGroup>
    </form>
  );
};
