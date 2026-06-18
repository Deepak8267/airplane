import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useSessionStore } from "@/stores/session-store";

export function AuthBootstrap() {
  const setSession = useSessionStore((state) => state.setSession);
  const setHydrated = useSessionStore((state) => state.setHydrated);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (mounted) {
        setSession(data.session);
        setHydrated(true);
      }
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setHydrated(true);
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, [setHydrated, setSession]);

  return null;
}
