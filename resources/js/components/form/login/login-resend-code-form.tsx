import LoginController from '@/actions/App/Http/Controllers/Auth/LoginController';
import { router } from '@inertiajs/core';
import { useState } from 'react';
import { SubmitBtn } from '../../submit-btn';

export const LoginResendCodeForm = () => {
  const [isPending, setIsPending] = useState(false);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        router.post(LoginController.resendCode(), undefined, {
          preserveState: 'errors',
          onBefore() {
            setIsPending(true);
          },
          onFinish() {
            setIsPending(false);
          },
        });
      }}
    >
      <SubmitBtn disabled={isPending} className="w-full">
        Resend code
      </SubmitBtn>
    </form>
  );
};
