import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import './SignInScreen.css';

/** Supabase returns auth errors in the query string (PKCE flow) or the hash
 *  (implicit flow) depending on the flow — check both. */
function readAuthError(): string | null {
  const fromQuery = new URLSearchParams(window.location.search).get('error_description');
  const fromHash = new URLSearchParams(window.location.hash.replace(/^#/, '')).get(
    'error_description',
  );
  return fromQuery ?? fromHash;
}

/**
 * Landing route for the magic link. The Supabase client (detectSessionInUrl)
 * consumes the token from the URL and fires onAuthStateChange; once a session
 * exists we replace the history entry with Today so the token-bearing URL is
 * not left in history. Until then, a minimal "signing you in" state — with a
 * timeout so a silent failure surfaces instead of spinning forever.
 */
export function AuthCallback() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const [timedOut, setTimedOut] = useState(false);

  const explicitError = readAuthError();

  useEffect(() => {
    if (session) navigate('/', { replace: true });
  }, [session, navigate]);

  // If the exchange neither yields a session nor an explicit error within a few
  // seconds (e.g. a malformed or already-consumed link), stop spinning.
  useEffect(() => {
    if (session || explicitError) return;
    const t = setTimeout(() => setTimedOut(true), 8000);
    return () => clearTimeout(t);
  }, [session, explicitError]);

  const errorMessage = explicitError ?? (timedOut ? "We couldn't sign you in from that link." : null);
  const showError = errorMessage && !loading && !session;

  return (
    <main className="vt-signin">
      <div className="vt-signin__card">
        <span className="vt-signin__mark" aria-hidden="true">
          <i className="ph-bold ph-leaf" />
        </span>
        {showError ? (
          <>
            <p className="vt-signin__lead">That link didn't work</p>
            <p className="vt-signin__hint">{errorMessage} Head back and request a fresh one.</p>
            <a href="/">Back to sign in</a>
          </>
        ) : (
          <p className="vt-signin__lead" role="status">
            Signing you in…
          </p>
        )}
      </div>
    </main>
  );
}
