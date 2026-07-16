import { useState, type FormEvent } from 'react';
import { Button } from '../components';
import { useAuth } from '../lib/auth';
import './SignInScreen.css';

/**
 * Passwordless sign-in. One field, one button: enter your email, get a magic
 * link, tap it. No design reference exists for auth (plan §8) — built on-brand
 * from tokens. Meets the hard rules: ≥16px body, 44px+ targets, WCAG AA.
 */
export function SignInScreen() {
  const { signInWithOtp } = useAuth();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState<string | null>(null);

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
        <span className="vt-signin__mark" aria-hidden="true">
          <i className="ph-bold ph-leaf" />
        </span>
        <h1 className="vt-signin__title">Vitalry</h1>

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
      </div>
    </main>
  );
}
