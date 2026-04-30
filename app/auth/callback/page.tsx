'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      const supabase = createClient();
      
      // This handles the magic link callback
      const { error } = await supabase.auth.exchangeCodeForSession(
        new URL(window.location.href).searchParams.get('code') || ''
      );

      if (error) {
        console.error('Auth callback error:', error);
        router.push('/auth/login');
      } else {
        router.push('/');
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-lilac-200 border-t-lilac-600 mx-auto mb-lg" />
        <p className="text-sm text-gray-600">Confirming your email...</p>
      </div>
    </div>
  );
}
