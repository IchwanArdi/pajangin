'use client';

import { useEffect, useState } from 'react';
import { createClient } from './supabase/client';

export function useAuthSession() {
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      setLoggedIn(Boolean(data.session));
      setLoading(false);
    });
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoggedIn(Boolean(session));
      setLoading(false);
    });
    return () => subscription.subscription.unsubscribe();
  }, []);

  return { loading, loggedIn };
}
