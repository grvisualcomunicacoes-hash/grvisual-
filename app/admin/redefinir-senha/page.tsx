'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { browserClient } from '@/lib/supabase/browser';

export default function ResetPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const supabase = browserClient();
    const code = new URLSearchParams(window.location.search).get('code');
    (async () => {
      if (code) await supabase.auth.exchangeCodeForSession(code).catch(() => null);
      const { data } = await supabase.auth.getSession();
      setReady(Boolean(data.session));
      if (!data.session) setError('Link inválido ou expirado. Peça um novo em "Esqueci a senha".');
    })();
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (password.length < 10) return setError('Use pelo menos 10 caracteres.');
    if (password !== confirm) return setError('As senhas não conferem.');
    setBusy(true);
    const { error } = await browserClient().auth.updateUser({ password });
    setBusy(false);
    if (error) return setError('Não foi possível salvar a nova senha.');
    router.replace('/admin');
    router.refresh();
  }

  return (
    <main className="login-wrap">
      <div className="card login-card">
        <h1 style={{ fontSize: '1.4rem' }}>Criar nova senha</h1>
        <form className="form" onSubmit={onSubmit}>
          <div className="field">
            <label htmlFor="p1">Nova senha (mín. 10 caracteres)</label>
            <input id="p1" className="input" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={!ready} />
          </div>
          <div className="field">
            <label htmlFor="p2">Repita a senha</label>
            <input id="p2" className="input" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} disabled={!ready} />
          </div>
          {error && <div className="alert alert-error" role="alert">{error}</div>}
          <button className="btn btn-primary btn-block" disabled={!ready || busy}>{busy ? 'Salvando…' : 'Salvar nova senha'}</button>
        </form>
      </div>
    </main>
  );
}
