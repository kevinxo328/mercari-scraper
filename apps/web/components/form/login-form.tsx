'use client';

import { signIn } from 'next-auth/react';
import { Button } from '../shadcn/button';
import { FcGoogle } from 'react-icons/fc';
import { useSearchParams } from 'next/navigation';

const DEFAULT_CALLBACK_URL = '/dashboard';

export default function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');
  const onClick = (provider: 'google') => {
    signIn(provider, {
      callbackUrl: callbackUrl || DEFAULT_CALLBACK_URL
    });
  };

  return (
    <div className="max-w-[500px] w-full flex flex-col gap-6 items-center">
      <h3 className="text-2xl font-bold">Login</h3>
      <Button className="w-full" onClick={() => onClick('google')}>
        <FcGoogle className="size-6" />
        Continue with Google
      </Button>
    </div>
  );
}
