'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SignupForm } from '@/components';
import { createClient } from '@/lib/supabase';
import { reportError, trackEvent } from '@/lib/monitoring';

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async (email: string, password: string) => {
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    trackEvent('signup_attempt', { emailDomain: email.split('@')[1] || 'unknown' }, '/auth/signup');

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (authError) throw authError;

      trackEvent('signup_success', { emailDomain: email.split('@')[1] || 'unknown' }, '/auth/signup');

      // For development: auto-confirm and redirect
      // In production, redirect to confirmation page
      router.push('/auth/confirm-email');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
      reportError(err, '/auth/signup', { action: 'signup' });
    } finally {
      setIsLoading(false);
    }
  };

  return <SignupForm type="signup" onSubmit={handleSignup} isLoading={isLoading} error={error ?? undefined} />;
}
