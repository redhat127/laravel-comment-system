import LoginController from '@/actions/App/Http/Controllers/Auth/LoginController';
import { showServerValidationErrors } from '@/lib/utils';
import { codeRule } from '@/zod/fields';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from '@inertiajs/react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import z from 'zod';
import { SubmitBtn } from '../../submit-btn';
import { TextInput } from '../../text-input';
import { FieldGroup } from '../../ui/field';

const loginVerifyCodeSchema = z.object({
  code: codeRule,
});

export const LoginVerifyCodeForm = () => {
  const form = useForm({
    resolver: zodResolver(loginVerifyCodeSchema),
    defaultValues: {
      code: '',
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
        router.post(LoginController.verifyCodePost(), data, {
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
        <TextInput control={control} name="code" label="Code" />
        <SubmitBtn disabled={isFormDisabled}>Verify</SubmitBtn>
      </FieldGroup>
    </form>
  );
};
