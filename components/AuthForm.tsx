'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from './Button';
import { Input } from './Input';
import { Mail, Lock, ArrowRight } from 'lucide-react';

interface AuthFormProps {
  onSubmit: (email: string, password: string) => Promise<void>;
  isLoading?: boolean;
  error?: string;
}

export interface LoginFormProps extends AuthFormProps {
  type: 'login';
}

export interface SignupFormProps extends AuthFormProps {
  type: 'signup';
}

export function AuthForm({ onSubmit, isLoading = false, error }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!email || !password) {
      setLocalError('Please fill in all fields');
      return;
    }

    try {
      await onSubmit(email, password);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const displayError = error || localError;

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-lg">
      <div>
        <Input
          type="email"
          label="Email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          error={displayError ? 'Invalid email or password' : undefined}
        />
      </div>

      <div>
        <Input
          type="password"
          label="Password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
        />
      </div>

      {displayError && (
        <div className="rounded-pill bg-red-50 p-lg border-2 border-red-200">
          <p className="text-sm text-red-700">{displayError}</p>
        </div>
      )}

      <Button type="submit" isLoading={isLoading} size="lg" className="w-full">
        <span>Continue</span>
        <ArrowRight size={16} />
      </Button>
    </form>
  );
}

interface LoginProps extends AuthFormProps {
  type: 'login';
}

interface SignupProps extends AuthFormProps {
  type: 'signup';
}

export function LoginForm(props: LoginProps) {
  return (
    <div className="space-y-2xl text-center">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-md">Welcome back</h1>
        <p className="text-gray-600">Log in to your food journal</p>
      </div>
      <AuthForm {...props} />
      <p className="text-sm text-gray-600">
        Don&apos;t have an account?{' '}
        <Link href="/auth/signup" className="font-semibold text-lilac-600 hover:text-lilac-700">
          Sign up
        </Link>
      </p>
    </div>
  );
}

export function SignupForm(props: SignupProps) {
  return (
    <div className="space-y-2xl text-center">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-md">Start journaling</h1>
        <p className="text-gray-600">No judgment, just awareness</p>
      </div>
      <AuthForm {...props} />
      <p className="text-sm text-gray-600">
        Already have an account?{' '}
        <Link href="/auth/login" className="font-semibold text-lilac-600 hover:text-lilac-700">
          Log in
        </Link>
      </p>
    </div>
  );
}
