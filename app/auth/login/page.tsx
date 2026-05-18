'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoginForm } from '@/components';
import { createClient } from '@/lib/supabase';
import { reportError, trackEvent } from '@/lib/monitoring';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (email: string, password: string) => {
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    trackEvent('login_attempt', { emailDomain: email.split('@')[1] || 'unknown' }, '/auth/login');

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;
      if (!data.session) throw new Error('No session returned');

      trackEvent('login_success', { emailDomain: email.split('@')[1] || 'unknown' }, '/auth/login');

      router.push('/');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      reportError(err, '/auth/login', { action: 'login' });
    } finally {
      setIsLoading(false);
    }
  };

  return <LoginForm type="login" onSubmit={handleLogin} isLoading={isLoading} error={error ?? undefined} />;
}
