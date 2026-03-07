'use client';

import { FcGoogle } from 'react-icons/fc';

import { signIn } from '@/lib/auth-client';

import { Button } from '../shadcn/button';

interface LoginFormProps {
  redirect: string;
}

export default function LoginForm({ redirect }: LoginFormProps) {
  return (
    <div className="max-w-[500px] w-full flex flex-col gap-6 items-center">
      <h3 className="text-2xl font-bold">Login</h3>
      <div className="w-full flex flex-col gap-3">
        <Button
          className="w-full"
          onClick={() =>
            signIn.social({
              callbackURL: redirect.startsWith('/') ? redirect : '/',
              provider: 'google'
            })
          }
        >
          <FcGoogle className="size-6" />
          Continue with Google
        </Button>
      </div>
    </div>
  );
}
