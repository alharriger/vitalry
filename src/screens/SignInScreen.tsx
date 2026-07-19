import { useState, type FormEvent } from 'react';
import { Button, Logo } from '../components';
import { useAuth } from '../lib/auth';
import './SignInScreen.css';

/**
 * True only on preview/local origins — never on the production domain. Gates the
 * dev password sign-in so it can never appear to real users (who are
 * passwordless). The bundle is identical across builds, so this is a runtime
 * host check, not a build flag.
 */
function isDevOrigin(): boolean {
  if (typeof window === 'undefined') return false;
  const h = window.location.hostname;
  return h === 'localhost' || h === '127.0.0.1' || h.endsWith('.pages.dev');
}

/**
 * Passwordless sign-in. One field, one button: enter your email, get a magic
 * link, tap it. No design reference exists for auth (plan §8) — built on-brand
 * from tokens. Meets the hard rules: ≥16px body, 44px+ targets, WCAG AA.
 */
export function SignInScreen() {
  const { signInWithOtp, signInWithPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState<string | null>(null);

  // Dev-only testing shortcut (preview/localhost). Not shown to real users.
  const devMode = isDevOrigin();
  const [devEmail, setDevEmail] = useState('alharriger@gmail.com');
  const [devPw, setDevPw] = useState('');
  const [devBusy, setDevBusy] = useState(false);
  const [devError, setDevError] = useState<string | null>(null);

  async function handleDevSignIn(e: FormEvent) {
    e.preventDefault();
    setDevError(null);
    setDevBusy(true);
    try {
      await signInWithPassword(devEmail.trim(), devPw);
      // On success the auth listener swaps in the app; nothing else to do.
    } catch (err) {
      setDevBusy(false);
      setDevError(err instanceof Error ? err.message : 'Sign-in failed.');
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setStatus('sending');
    try {
      await signInWithOtp(email.trim());
      setStatus('sent');
    } catch (err) {
      setStatus('idle');
      setError(err instanceof Error ? err.message : 'Something went wrong. Try again.');
    }
  }

  return (
    <main className="vt-signin">
      <div className="vt-signin__card">
        <h1 className="vt-signin__title">
          <Logo orientation="stacked" size="xl" tagline />
        </h1>

        {status === 'sent' ? (
          <div className="vt-signin__sent" role="status">
            <i className="ph-bold ph-paper-plane-tilt" aria-hidden="true" />
            <p className="vt-signin__lead">Check your email</p>
            <p className="vt-signin__hint">
              We sent a sign-in link to <strong>{email.trim()}</strong>. Tap it on this device to
              get in — no password needed.
            </p>
            <Button
              variant="ghost"
              size="md"
              onClick={() => {
                setStatus('idle');
                setError(null);
              }}
            >
              Use a different email
            </Button>
          </div>
        ) : (
          <form className="vt-signin__form" onSubmit={handleSubmit} noValidate>
            <p className="vt-signin__lead">Win by consistency, not intensity.</p>
            <label className="vt-signin__label" htmlFor="signin-email">
              Email address
            </label>
            <input
              id="signin-email"
              className="vt-signin__input"
              type="email"
              inputMode="email"
              autoComplete="email"
              autoCapitalize="none"
              spellCheck={false}
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? 'signin-error' : undefined}
            />
            {error ? (
              <p id="signin-error" className="vt-signin__error" role="alert">
                {error}
              </p>
            ) : null}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              block
              icon="ph-bold ph-envelope-simple"
              disabled={status === 'sending' || email.trim().length === 0}
            >
              {status === 'sending' ? 'Sending…' : 'Email me a link'}
            </Button>
          </form>
        )}

        {devMode ? (
          <details className="vt-signin__dev">
            <summary>Developer sign-in (preview only)</summary>
            <form className="vt-signin__form" onSubmit={handleDevSignIn} noValidate>
              <label className="vt-signin__label" htmlFor="dev-email">
                Email
              </label>
              <input
                id="dev-email"
                className="vt-signin__input"
                type="email"
                inputMode="email"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                value={devEmail}
                onChange={(e) => setDevEmail(e.target.value)}
              />
              <label className="vt-signin__label" htmlFor="dev-pw">
                Password
              </label>
              <input
                id="dev-pw"
                className="vt-signin__input"
                type="password"
                autoComplete="current-password"
                value={devPw}
                onChange={(e) => setDevPw(e.target.value)}
              />
              {devError ? (
                <p className="vt-signin__error" role="alert">
                  {devError}
                </p>
              ) : null}
              <Button
                type="submit"
                variant="secondary"
                size="lg"
                block
                icon="ph-bold ph-sign-in"
                disabled={devBusy || devPw.length === 0}
              >
                {devBusy ? 'Signing in…' : 'Dev sign in'}
              </Button>
            </form>
          </details>
        ) : null}
      </div>
    </main>
  );
}
