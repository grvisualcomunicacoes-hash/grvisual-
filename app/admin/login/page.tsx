'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { browserClient } from '@/lib/supabase/browser';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setInfo('');
    setBusy(true);
    try {
      const { error } = await browserClient().auth.signInWithPassword({ email: email.trim(), password });
      if (error) {
        setError(error.message.includes('Invalid') ? 'E-mail ou senha incorretos.' : 'Não foi possível entrar. Tente novamente.');
        return;
      }
      router.replace('/admin');
      router.refresh();
    } catch {
      setError('Sem conexão. Verifique a internet e tente de novo.');
    } finally {
      setBusy(false);
    }
  }

  async function forgot() {
    setError('');
    if (!email.trim()) {
      setError('Digite seu e-mail acima e toque em "Esqueci a senha" de novo.');
      return;
    }
    setBusy(true);
    const { error } = await browserClient().auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/admin/redefinir-senha`,
    });
    setBusy(false);
    if (error) setError('Não foi possível enviar o e-mail agora.');
    else setInfo('Se este e-mail tiver acesso, você receberá um link para criar uma nova senha.');
  }

  return (
    <main className="login-wrap">
      <div className="card login-card">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/gr-mark.png" alt="GR Visual" width={88} height={48} style={{ margin: '0 auto 12px' }} />
        <h1 style={{ fontSize: '1.4rem', textAlign: 'center' }}>Painel GR Visual</h1>
        {!configured && (
          <div className="alert alert-info" style={{ marginBottom: 12 }}>
            O painel ainda não está conectado ao banco de dados. Configure as variáveis do Supabase (veja o LEIA-ME).
          </div>
        )}
        <form className="form" onSubmit={onSubmit}>
          <div className="field">
            <label htmlFor="email">E-mail</label>
            <input id="email" className="input" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="field">
            <label htmlFor="password">Senha</label>
            <input id="password" className="input" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {error && <div className="alert alert-error" role="alert">{error}</div>}
          {info && <div className="alert alert-success" role="status">{info}</div>}
          <button className="btn btn-primary btn-block" disabled={busy || !configured}>
            {busy ? <><span className="spinner" /> Entrando…</> : 'Entrar'}
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={forgot} disabled={busy || !configured}>Esqueci a senha</button>
        </form>
      </div>
    </main>
  );
}
