'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components';

export default function ConfirmEmailPage() {
  return (
    <div className="space-y-2xl text-center">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-md">Check your email</h1>
        <p className="text-gray-600 max-w-xs mx-auto">
          We've sent you a confirmation link. Click it to activate your account.
        </p>
      </div>

      <Link href="/auth/login" className="block">
        <Button variant="secondary" className="w-full">
          Back to login
        </Button>
      </Link>
    </div>
  );
}
