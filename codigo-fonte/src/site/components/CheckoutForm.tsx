import { Link } from '../router';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { formatBRL } from '@/lib/format';
import type { CustomerInput } from '@/lib/types';
import { validateOrderPayload } from '@/lib/validation';
import { sendOrderEmail } from '@/lib/formsubmit';
import { buildOrderLines, generateOrderCode } from '@/lib/order-build';
import { useData } from '../data';
import { buildWhatsAppMessage, whatsappLink } from '@/lib/whatsapp';
import { useCart } from './CartProvider';
import { IconMail, IconWhatsApp } from './Icons';
import { Notices } from './Notices';

type Result =
  | { kind: 'whatsapp'; code: string | null; url: string; registered: boolean; reason?: string }
  | { kind: 'email-sent'; code: string }
  | { kind: 'email-failed'; code: string; url: string };

const EMPTY: CustomerInput = {
  name: '',
  business: '',
  whatsapp: '',
  email: '',
  city: '',
  objective: '',
  projectNotes: '',
  contactChannel: 'whatsapp',
  privacyAccepted: false,
};

export function CheckoutForm({
  mode,
  businessWhatsApp,
  notices,
}: {
  mode: 'cart' | 'custom';
  businessWhatsApp: string;
  notices: string[];
}) {
  const cart = useCart();
  const { data } = useData();
  const [form, setForm] = useState<CustomerInput>(EMPTY);
  const [sendMethod, setSendMethod] = useState<'whatsapp' | 'email'>('whatsapp');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [whatsOpened, setWhatsOpened] = useState(false);
  const startedAt = useRef(Date.now());
  const honeypot = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const items = mode === 'cart' ? cart.items : [];

  useEffect(() => {
    if (result) resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [result]);

  const set = <K extends keyof CustomerInput>(key: K, value: CustomerInput[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key as string]) setErrors((e) => ({ ...e, [key as string]: '' }));
  };

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage(null);
    const payload = {
      customer: form,
      items: items.map((i) => ({ packageId: i.slug, quantity: i.quantity, notes: i.notes })),
      sendMethod,
    };
    const check = validateOrderPayload(payload);
    if (!check.ok) {
      setErrors(check.errors);
      setMessage('Confira os campos destacados.');
      const first = Object.keys(check.errors)[0];
      document.getElementById(`f-${first}`)?.focus();
      return;
    }
    // Proteção simples contra robôs: campo invisível ou envio instantâneo
    const bot = (honeypot.current?.value || '') !== '' || Date.now() - startedAt.current < 2500;
    if (bot) {
      setMessage('Não foi possível enviar. Tente novamente em alguns segundos.');
      return;
    }

    // Preços sempre tirados do catálogo publicado (não do que ficou salvo no carrinho)
    const built = buildOrderLines(check.data.items, data.packages);
    if (built.missing.length) {
      built.missing.forEach((slug) => cart.remove(slug));
      setMessage('Alguns serviços do carrinho não estão mais disponíveis e foram removidos. Revise e envie novamente.');
      return;
    }

    const code = generateOrderCode();
    const customer = check.data.customer;
    const text = buildWhatsAppMessage({ code, customer, lines: built.lines, estimatedTotal: built.estimatedTotal, hasQuoteItems: built.hasQuoteItems });
    const url = whatsappLink(data.content.contact.whatsapp, text);
    const email = {
      to: data.content.contact.email,
      code,
      customer,
      lines: built.lines,
      estimatedTotal: built.estimatedTotal,
      hasQuoteItems: built.hasQuoteItems,
      sendMethod,
    };

    if (sendMethod === 'whatsapp') {
      // Cópia do pedido no e-mail da GR Visual (se falhar, o WhatsApp continua valendo)
      void sendOrderEmail(email);
      setResult({ kind: 'whatsapp', code, url, registered: true });
      return;
    }

    setSending(true);
    const res = await sendOrderEmail(email);
    setSending(false);
    if (res.ok) {
      setResult({ kind: 'email-sent', code });
      if (mode === 'cart') cart.clear();
    } else {
      setResult({ kind: 'email-failed', code, url });
    }
  }

  if (result) {
    return (
      <div ref={resultRef} className="card" style={{ display: 'grid', gap: 16, scrollMarginTop: 90 }} aria-live="polite">
        {result.kind === 'whatsapp' && (
          <>
            <div className="eyebrow">Falta só um passo</div>
            <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Envie a mensagem no WhatsApp</h2>
            {result.registered ? (
              <p className="muted" style={{ margin: 0 }}>
                Preparamos sua solicitação{result.code ? <> com o código <strong style={{ color: 'var(--text)' }}>{result.code}</strong></> : null}.
                Toque no botão abaixo e, no WhatsApp, <strong>aperte enviar</strong> para que ela chegue até a GR Visual.
              </p>
            ) : (
              <p className="muted" style={{ margin: 0 }}>
                {result.reason} Sua mensagem já está pronta: toque no botão abaixo e, no WhatsApp, <strong>aperte enviar</strong>.
              </p>
            )}
            <a
              className="btn btn-whatsapp btn-block"
              href={result.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                setWhatsOpened(true);
                if (mode === 'cart') cart.clear();
              }}
            >
              <IconWhatsApp /> Enviar pedido pelo WhatsApp
            </a>
            {whatsOpened && (
              <p className="small muted" style={{ margin: 0 }}>
                O WhatsApp não abriu? Toque no botão de novo ou chame no {businessWhatsApp.replace(/^55/, '')}.
              </p>
            )}
          </>
        )}
        {result.kind === 'email-sent' && (
          <>
            <div className="eyebrow">Pedido enviado</div>
            <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Recebemos sua solicitação por e-mail</h2>
            <p className="muted" style={{ margin: 0 }}>
              Código <strong style={{ color: 'var(--text)' }}>{result.code}</strong>. A GR Visual vai conferir o escopo, o prazo e as
              condições e retornar pelo canal que você escolheu. O envio não garante disponibilidade imediata.
            </p>
            <Link to="/" className="btn">Voltar ao início</Link>
          </>
        )}
        {result.kind === 'email-failed' && (
          <>
            <div className="eyebrow">Envio por e-mail indisponível</div>
            <h2 style={{ fontSize: '1.4rem', margin: 0 }}>Envie também pelo WhatsApp</h2>
            <p className="muted" style={{ margin: 0 }}>
              O envio por e-mail não funcionou agora (pedido <strong style={{ color: 'var(--text)' }}>{result.code}</strong>). Sua mensagem já está pronta: envie pelo WhatsApp para garantir o atendimento.
            </p>
            <a
              className="btn btn-whatsapp btn-block"
              href={result.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => mode === 'cart' && cart.clear()}
            >
              <IconWhatsApp /> Enviar pedido pelo WhatsApp
            </a>
          </>
        )}
      </div>
    );
  }

  const err = (k: string) => (errors[k] ? <span className="err" id={`e-${k}`}>{errors[k]}</span> : null);
  const aria = (k: string) => (errors[k] ? { 'aria-invalid': true as const, 'aria-describedby': `e-${k}` } : {});

  return (
    <form className="form" onSubmit={onSubmit} noValidate>
      {mode === 'cart' && (
        <div className="card" style={{ display: 'grid', gap: 10 }}>
          <div className="summary-row"><strong>Serviços selecionados</strong><Link to="/carrinho" className="small">Editar</Link></div>
          {items.length === 0 ? (
            <p className="muted small" style={{ margin: 0 }}>
              Seu carrinho está vazio. Você pode <Link to="/servicos">escolher serviços</Link> ou descrever abaixo o que precisa.
            </p>
          ) : (
            items.map((i) => (
              <div key={i.slug} className="summary-row small">
                <span>
                  {i.name}
                  {i.allowQuantity && i.quantity > 1 ? ` × ${i.quantity}` : ''}
                </span>
                <span>{i.unitPrice === null ? 'Sob orçamento' : formatBRL(i.unitPrice * i.quantity)}</span>
              </div>
            ))
          )}
          {items.length > 0 && (
            <div className="summary-row" style={{ borderTop: '1px solid var(--line)', paddingTop: 10 }}>
              <strong>Total estimado</strong>
              <strong>
                {cart.estimatedTotal > 0 ? formatBRL(cart.estimatedTotal) : 'A definir'}
                {cart.estimatedTotal > 0 && cart.hasQuoteItems ? ' + orçamento' : ''}
              </strong>
            </div>
          )}
        </div>
      )}

      <div className="form-row two">
        <div className="field">
          <label htmlFor="f-name">Seu nome *</label>
          <input id="f-name" className="input" autoComplete="name" value={form.name} onChange={(e) => set('name', e.target.value)} maxLength={100} {...aria('name')} />
          {err('name')}
        </div>
        <div className="field">
          <label htmlFor="f-business">Empresa ou negócio</label>
          <input id="f-business" className="input" autoComplete="organization" value={form.business} onChange={(e) => set('business', e.target.value)} maxLength={120} />
        </div>
      </div>
      <div className="form-row two">
        <div className="field">
          <label htmlFor="f-whatsapp">WhatsApp com DDD *</label>
          <input id="f-whatsapp" className="input" type="tel" inputMode="tel" autoComplete="tel" placeholder="(27) 90000-0000" value={form.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} maxLength={20} {...aria('whatsapp')} />
          {err('whatsapp')}
        </div>
        <div className="field">
          <label htmlFor="f-email">E-mail {form.contactChannel === 'email' ? '*' : '(opcional)'}</label>
          <input id="f-email" className="input" type="email" inputMode="email" autoComplete="email" value={form.email} onChange={(e) => set('email', e.target.value)} maxLength={160} {...aria('email')} />
          {err('email')}
        </div>
      </div>
      <div className="field">
        <label htmlFor="f-city">Cidade *</label>
        <input id="f-city" className="input" autoComplete="address-level2" placeholder="Ex.: Vila Velha" value={form.city} onChange={(e) => set('city', e.target.value)} maxLength={80} {...aria('city')} />
        {err('city')}
      </div>
      <div className="field">
        <label htmlFor="f-objective">{mode === 'custom' ? 'O que você precisa? *' : 'Qual é o seu objetivo?'}</label>
        <textarea
          id="f-objective"
          className="textarea"
          placeholder={mode === 'custom' ? 'Ex.: preciso de um logotipo e artes para o Instagram da minha loja.' : 'Ex.: atrair mais clientes pelo Instagram, divulgar uma inauguração…'}
          value={form.objective}
          onChange={(e) => set('objective', e.target.value)}
          maxLength={1000}
          {...aria('objective')}
        />
        {err('objective')}
      </div>
      <div className="field">
        <label htmlFor="f-notes">Observações sobre o projeto</label>
        <textarea id="f-notes" className="textarea" placeholder="Prazos, referências, redes sociais do seu negócio…" value={form.projectNotes} onChange={(e) => set('projectNotes', e.target.value)} maxLength={2000} />
      </div>

      <fieldset className="field" style={{ border: 0, padding: 0, margin: 0 }}>
        <legend className="label" style={{ marginBottom: 6 }}>Melhor canal para retorno</legend>
        <div className="radio-group">
          {([['whatsapp', 'WhatsApp'], ['ligacao', 'Ligação'], ['email', 'E-mail']] as const).map(([v, l]) => (
            <label key={v} className="radio-card">
              <input type="radio" name="channel" value={v} checked={form.contactChannel === v} onChange={() => set('contactChannel', v)} /> {l}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="field" style={{ border: 0, padding: 0, margin: 0 }}>
        <legend className="label" style={{ marginBottom: 6 }}>Como deseja enviar o pedido?</legend>
        <div className="radio-group">
          <label className="radio-card">
            <input type="radio" name="send" checked={sendMethod === 'whatsapp'} onChange={() => setSendMethod('whatsapp')} />
            <IconWhatsApp /> WhatsApp
          </label>
          <label className="radio-card">
            <input type="radio" name="send" checked={sendMethod === 'email'} onChange={() => setSendMethod('email')} />
            <IconMail /> E-mail
          </label>
        </div>
      </fieldset>

      <input ref={honeypot} className="hp" type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />

      <Notices notices={notices} />

      <div className="field">
        <label className="check">
          <input id="f-privacyAccepted" type="checkbox" checked={form.privacyAccepted} onChange={(e) => set('privacyAccepted', e.target.checked)} {...aria('privacyAccepted')} />
          <span>
            Li e concordo com a <Link to="/privacidade" target="_blank">política de privacidade</Link>. Meus dados serão usados apenas
            para responder a esta solicitação. *
          </span>
        </label>
        {err('privacyAccepted')}
      </div>

      {message && <div className="alert alert-error" role="alert">{message}</div>}

      <button type="submit" className={`btn btn-block ${sendMethod === 'whatsapp' ? 'btn-whatsapp' : 'btn-primary'}`} disabled={sending}>
        {sending ? <><span className="spinner" /> Preparando…</> : sendMethod === 'whatsapp' ? <><IconWhatsApp /> Continuar para o WhatsApp</> : <><IconMail /> Enviar pedido por e-mail</>}
      </button>
      <p className="small muted" style={{ margin: 0, textAlign: 'center' }}>Nenhum pagamento é feito pelo site.</p>
    </form>
  );
}
