"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useExtraction } from "@/features/extraction-workflow/context/ExtractionContext";

/** True when the Initiate is signed in or has completed extraction Connect. */
export function useSecuredConnection() {
  const { connected: extractionConnected } = useExtraction();
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setAuthed(!!data.session));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthed(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return extractionConnected || authed;
}

export const SECURED_STATUS_LABEL = "Secured & Connected";
export const AWAITING_STATUS_LABEL = "Awaiting Connection";
