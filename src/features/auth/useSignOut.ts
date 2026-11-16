import { useState } from 'react';
import { useAuth } from './AuthProvider';

/** Confirmation state and the one-shot sign-out shared by the client and technician profiles. */
export function useSignOut() {
  const { logout } = useAuth();
  const [confirming, setConfirming] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  async function signOut() {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await logout();
    } finally {
      // The screen unmounts when the session ends; this only matters if logout failed.
      setSigningOut(false);
    }
  }

  return { confirming, signingOut, ask: () => setConfirming(true), cancel: () => setConfirming(false), signOut };
}
