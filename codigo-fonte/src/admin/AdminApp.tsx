import { createContext, useContext, useEffect, useRef, useState, type CSSProperties, type FormEvent, type ReactNode } from 'react';
import * as ops from '@/lib/admin-ops';
import { PORTFOLIO_CATEGORY_SUGGESTIONS, SERVICE_CATEGORIES, categoryLabel } from '@/lib/categories';
import { formatBRL } from '@/lib/format';
import { bySort, normalizeSiteData, type SiteData } from '@/lib/site-data';
import type { Faq, Package, PortfolioItem } from '@/lib/types';
import { GitHubError, checkAccess, guessRepo, loadData, saveData, uploadImage, type Repo } from './github';

const STORAGE = 'grvisual-painel-v1';
const DEFAULT_REPO = { owner: 'grvisualcomunicacoes-hash', repo: 'grvisual-' };

type Tab = 'pacotes' | 'portfolio' | 'conteudo' | 'faq' | 'conta';
type Flash = { kind: 'ok' | 'erro'; text: string } | null;

interface Ctx {
  repo: Repo;
  previews: Record<string, string>;
  addPreview: (path: string, url: string) => void;
}
const AdminCtx = createContext<Ctx | null>(null);
const useAdmin = () => useContext(AdminCtx)!;

function readSession(): Repo | null {
  try {
    const s = JSON.parse(localStorage.getItem(STORAGE) || 'null');
    return s && s.token && s.owner && s.repo ? s : null;
  } catch {
    return null;
  }
}

// =====================================================================
export function AdminApp() {
  const [session, setSession] = useState<Repo | null>(() => readSession());
  if (!session) return <Login onLogin={setSession} />;
  return (
    <Panel
      session={session}
      onLogout={() => {
        try { localStorage.removeItem(STORAGE); } catch { /* ignora */ }
        setSession(null);
      }}
    />
  );
}

// ---------------------------------------------------------------------
function Login({ onLogin }: { onLogin: (r: Repo) => void }) {
  const guess = guessRepo(window.location, DEFAULT_REPO);
  const [token, setToken] = useState('');
  const [owner, setOwner] = useState(guess.owner);
  const [repo, setRepo] = useState(guess.repo);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    const r: Repo = { owner: owner.trim(), repo: repo.trim(), branch: 'main', token: token.trim() };
    if (!r.token) return setError('Cole o token do GitHub.');
    setBusy(true);
    try {
      await checkAccess(r);
      try { localStorage.setItem(STORAGE, JSON.stringify(r)); } catch { /* navegação privada */ }
      onLogin(r);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível entrar.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="login-wrap">
      <div className="card login-card">
        <img src="imagens/marca/gr-mark.png" alt="GR Visual" width={88} height={48} style={{ margin: '0 auto 12px' }} />
        <h1 style={{ fontSize: '1.4rem', textAlign: 'center' }}>Painel GR Visual</h1>
        <form className="form" onSubmit={submit}>
          <div className="field">
            <label htmlFor="token">Token do GitHub</label>
            <input id="token" className="input" type="password" autoComplete="current-password" value={token} onChange={(e) => setToken(e.target.value)} placeholder="github_pat_…" />
            <span className="hint">Fica salvo só neste aparelho. Funciona como a sua senha do painel.</span>
          </div>
          <details>
            <summary className="small muted" style={{ cursor: 'pointer' }}>Repositório: {owner}/{repo} (alterar)</summary>
            <div className="form-row two" style={{ marginTop: 10 }}>
              <input className="input" value={owner} onChange={(e) => setOwner(e.target.value)} aria-label="Usuário do GitHub" />
              <input className="input" value={repo} onChange={(e) => setRepo(e.target.value)} aria-label="Repositório" />
            </div>
          </details>
          {error && <div className="alert alert-error" role="alert">{error}</div>}
          <button className="btn btn-primary btn-block" disabled={busy}>{busy ? <><span className="spinner" /> Verificando…</> : 'Entrar'}</button>
        </form>
        <details style={{ marginTop: 16 }}>
          <summary className="small" style={{ cursor: 'pointer', color: 'var(--cyan-2)' }}>Como criar o token (uma vez só)</summary>
          <ol className="small muted" style={{ paddingLeft: 18, marginTop: 8 }}>
            <li>Abra <a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noopener noreferrer">github.com/settings/personal-access-tokens/new</a></li>
            <li>Nome: <b>Painel do site</b> · Validade: <b>1 ano</b></li>
            <li>Repository access: <b>Only select repositories</b> → escolha <b>{repo}</b></li>
            <li>Permissions → Repository permissions → <b>Contents</b>: <b>Read and write</b></li>
            <li>Toque em <b>Generate token</b>, copie e cole aqui.</li>
          </ol>
        </details>
      </div>
    </main>
  );
}

// ---------------------------------------------------------------------
function Panel({ session, onLogout }: { session: Repo; onLogout: () => void }) {
  const [data, setData] = useState<SiteData | null>(null);
  const [sha, setSha] = useState('');
  const [loadError, setLoadError] = useState('');
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState<Flash>(null);
  const [tab, setTab] = useState<Tab>('pacotes');
  const [editPkg, setEditPkg] = useState<string | null>(null);
  const [editPort, setEditPort] = useState<string | null>(null);
  const [previews, setPreviews] = useState<Record<string, string>>({});

  async function reload() {
    setLoadError('');
    try {
      const { json, sha } = await loadData(session);
      setData(normalizeSiteData(json));
      setSha(sha);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Erro ao carregar.');
      if (err instanceof GitHubError && err.status === 401) onLogout();
    }
  }
  useEffect(() => { void reload(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!flash) return;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const t = setTimeout(() => setFlash(null), 6000);
    return () => clearTimeout(t);
  }, [flash]);

  /** Aplica uma operação e publica no GitHub. Retorna true se deu certo. */
  async function apply(result: ops.OpResult): Promise<boolean> {
    if (!result.ok) {
      setFlash({ kind: 'erro', text: result.error });
      return false;
    }
    setBusy(true);
    try {
      const newSha = await saveData(session, result.data, sha, result.message);
      setSha(newSha);
      setData(result.data);
      setFlash({ kind: 'ok', text: `${result.message} O site atualiza em cerca de 1 minuto.` });
      return true;
    } catch (err) {
      setFlash({ kind: 'erro', text: err instanceof Error ? err.message : 'Erro ao salvar.' });
      if (err instanceof GitHubError && err.status === 409) await reload();
      return false;
    } finally {
      setBusy(false);
    }
  }

  const ctx: Ctx = { repo: session, previews, addPreview: (p, u) => setPreviews((m) => ({ ...m, [p]: u })) };
  const go = (t: Tab) => { setTab(t); setEditPkg(null); setEditPort(null); window.scrollTo(0, 0); };
  const NAV: [Tab, string, string][] = [['pacotes', 'Pacotes', '▦'], ['portfolio', 'Portfólio', '◩'], ['conteudo', 'Conteúdo', '✎'], ['faq', 'Dúvidas', '?'], ['conta', 'Conta', '⚙']];

  return (
    <AdminCtx.Provider value={ctx}>
      <div className="admin-shell">
        <aside className="admin-side">
          <a href="./" className="brand" style={{ marginBottom: 18 }}>
            <img src="imagens/marca/gr-mark.png" alt="" width={44} height={24} />
            <span className="brand-text"><span className="brand-name">PAINEL</span><span className="brand-sub">GR VISUAL</span></span>
          </a>
          {NAV.map(([t, label]) => (
            <a key={t} href={`#${t}`} aria-current={tab === t ? 'page' : undefined} onClick={(e) => { e.preventDefault(); go(t); }}>{label}</a>
          ))}
          <div style={{ marginTop: 'auto', display: 'grid', gap: 8 }}>
            <a href="./" target="_blank" rel="noopener">Ver site ↗</a>
            <button className="btn btn-sm btn-block" onClick={onLogout}>Sair</button>
          </div>
        </aside>
        <main className="admin-main">
          {busy && <div className="alert alert-info" role="status" style={{ marginBottom: 12 }}><span className="spinner" style={{ display: 'inline-block', verticalAlign: '-3px' }} /> Salvando no GitHub…</div>}
          {flash && <div className={`alert ${flash.kind === 'erro' ? 'alert-error' : 'alert-success'}`} role={flash.kind === 'erro' ? 'alert' : 'status'} style={{ marginBottom: 12 }}>{flash.text}</div>}
          {loadError && (
            <div className="alert alert-error" style={{ marginBottom: 12 }}>
              {loadError} <button className="btn btn-sm" style={{ marginLeft: 8 }} onClick={() => void reload()}>Tentar de novo</button>
            </div>
          )}
          {!data ? (
            !loadError && <div className="empty-state muted"><span className="spinner" style={{ display: 'inline-block' }} /> Carregando dados do site…</div>
          ) : (
            <>
              {tab === 'pacotes' && (editPkg ? (
                <PackageForm key={editPkg} pkg={data.packages.find((p) => p.id === editPkg) ?? null} busy={busy}
                  onCancel={() => setEditPkg(null)}
                  onSubmit={async (fd) => { if (await apply(ops.savePackage(data, fd))) setEditPkg(null); }} />
              ) : (
                <PackageList data={data} busy={busy} onEdit={setEditPkg} apply={apply} />
              ))}
              {tab === 'portfolio' && (editPort ? (
                <PortfolioForm key={editPort} data={data} item={data.portfolio.find((p) => p.id === editPort) ?? null} busy={busy}
                  onCancel={() => setEditPort(null)}
                  onSubmit={async (fd, images) => { if (await apply(ops.savePortfolio(data, fd, images))) setEditPort(null); }} />
              ) : (
                <PortfolioList data={data} busy={busy} onEdit={setEditPort} apply={apply} />
              ))}
              {tab === 'conteudo' && <ContentForm key={data.updatedAt} data={data} busy={busy} onSubmit={(fd) => void apply(ops.saveContent(data, fd))} />}
              {tab === 'faq' && <FaqEditor data={data} busy={busy} apply={apply} />}
              {tab === 'conta' && <Account session={session} onLogout={onLogout} data={data} />}
            </>
          )}
        </main>
        <nav className="admin-bottom-nav" aria-label="Painel">
          {NAV.map(([t, label, icon]) => (
            <a key={t} href={`#${t}`} aria-current={tab === t ? 'page' : undefined} onClick={(e) => { e.preventDefault(); go(t); }}>
              <span aria-hidden="true" style={{ fontSize: '1.1rem' }}>{icon}</span>{label}
            </a>
          ))}
        </nav>
      </div>
    </AdminCtx.Provider>
  );
}

// ---------------------------------------------------------------------
function Img({ src, className, style }: { src: string; className?: string; style?: CSSProperties }) {
  const { previews } = useAdmin();
  return <img src={previews[src] || src} alt="" className={className} style={style} loading="lazy" />;
}

function Confirm({ children, msg, onYes, className = 'btn btn-sm btn-danger', disabled }: { children: ReactNode; msg: string; onYes: () => void; className?: string; disabled?: boolean }) {
  return <button type="button" className={className} disabled={disabled} onClick={() => window.confirm(msg) && onYes()}>{children}</button>;
}

// ---------- Pacotes ----------
function PackageList({ data, busy, onEdit, apply }: { data: SiteData; busy: boolean; onEdit: (id: string) => void; apply: (r: ops.OpResult) => Promise<boolean> }) {
  const list = [...data.packages].sort(bySort);
  return (
    <>
      <div className="admin-top">
        <h1>Pacotes e serviços</h1>
        <button className="btn btn-primary btn-sm" onClick={() => onEdit('novo')} disabled={busy}>+ Novo pacote</button>
      </div>
      <div className="alert alert-info small" style={{ marginBottom: 14 }}>
        Os pedidos dos clientes chegam no seu <b>WhatsApp</b> e no <b>e-mail</b> comercial. Aqui você cuida do que aparece no site.
      </div>
      <p className="small muted">Ordem de exibição: número menor aparece primeiro. Pacotes inativos não aparecem no site.</p>
      <div className="list">
        {list.map((p) => (
          <div key={p.id} className={`row-card ${p.active ? '' : 'inactive'}`}>
            <div className="row-head">
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                {p.image_url && <Img src={p.image_url} className="thumb-sm" />}
                <div>
                  <h3><a href="#pacotes" onClick={(e) => { e.preventDefault(); onEdit(p.id); }}>{p.name}</a></h3>
                  <span className="small muted">
                    #{p.sort_order} · {categoryLabel(p.category)} · {p.pricing_mode === 'orcamento' ? 'Sob orçamento' : formatBRL(p.promo_price ?? p.price)}
                    {p.promo_price !== null && p.price !== null && <> (de {formatBRL(p.price)})</>}
                    {p.includes.length === 0 && <span style={{ color: 'var(--warning)' }}> · sem lista do que inclui</span>}
                  </span>
                </div>
              </div>
              <div className="meta-list" style={{ justifyContent: 'flex-end' }}>
                {p.featured && <span className="badge badge-magenta">Destaque</span>}
                <span className={`badge ${p.active ? 'badge-green' : ''}`}>{p.active ? 'Ativo' : 'Inativo'}</span>
              </div>
            </div>
            <div className="row-actions">
              <button className="btn btn-sm" onClick={() => onEdit(p.id)} disabled={busy}>Editar</button>
              <button className="btn btn-sm btn-ghost" disabled={busy} onClick={() => void apply(ops.togglePackage(data, p.id, 'active'))}>{p.active ? 'Desativar' : 'Ativar'}</button>
              <button className="btn btn-sm btn-ghost" disabled={busy} onClick={() => void apply(ops.togglePackage(data, p.id, 'featured'))}>{p.featured ? 'Tirar destaque' : 'Destacar'}</button>
              <button className="btn btn-sm btn-ghost" disabled={busy} onClick={() => void apply(ops.duplicatePackage(data, p.id))}>Duplicar</button>
              <Confirm disabled={busy} msg={`Excluir "${p.name}" definitivamente?`} onYes={() => void apply(ops.deletePackage(data, p.id))}>Excluir</Confirm>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

const money = (n: number | null) => (n === null ? '' : n.toFixed(2).replace('.', ','));

function PackageForm({ pkg: p, busy, onSubmit, onCancel }: { pkg: Package | null; busy: boolean; onSubmit: (fd: FormData) => void; onCancel: () => void }) {
  return (
    <>
      <div className="admin-top">
        <h1>{p ? 'Editar pacote' : 'Novo pacote'}</h1>
        <button className="btn btn-sm btn-ghost" onClick={onCancel}>← Voltar</button>
      </div>
      <form className="form" onSubmit={(e) => { e.preventDefault(); onSubmit(new FormData(e.currentTarget)); }}>
        <input type="hidden" name="id" value={p?.id ?? ''} />
        <fieldset className="fieldset">
          <legend>Básico</legend>
          <div className="field"><label htmlFor="name">Nome do pacote *</label><input id="name" name="name" className="input" defaultValue={p?.name} required maxLength={120} /></div>
          <div className="form-row two">
            <div className="field">
              <label htmlFor="category">Categoria</label>
              <select id="category" name="category" className="select input" defaultValue={p?.category ?? 'redes-sociais'}>
                {SERVICE_CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="slug">Endereço no site</label>
              <input id="slug" name="slug" className="input" defaultValue={p?.slug} placeholder="gerado a partir do nome" maxLength={80} />
              <span className="hint">Evite mudar depois de divulgar o link.</span>
            </div>
          </div>
          <div className="field"><label htmlFor="description">Descrição comercial</label><textarea id="description" name="description" className="textarea" defaultValue={p?.description} maxLength={1500} /></div>
        </fieldset>
        <fieldset className="fieldset">
          <legend>Preço</legend>
          <div className="radio-group">
            <label className="radio-card"><input type="radio" name="pricing_mode" value="fixo" defaultChecked={p?.pricing_mode !== 'orcamento'} /> Preço fixo</label>
            <label className="radio-card"><input type="radio" name="pricing_mode" value="orcamento" defaultChecked={p?.pricing_mode === 'orcamento'} /> Sob orçamento</label>
          </div>
          <div className="form-row two">
            <div className="field"><label htmlFor="price">Preço (R$)</label><input id="price" name="price" className="input" inputMode="decimal" defaultValue={money(p?.price ?? null)} placeholder="140,00" /></div>
            <div className="field"><label htmlFor="promo_price">Preço promocional (opcional)</label><input id="promo_price" name="promo_price" className="input" inputMode="decimal" defaultValue={money(p?.promo_price ?? null)} placeholder="vazio se não houver" /></div>
          </div>
          <div className="toggle-row">
            <label className="check"><input type="checkbox" name="allow_quantity" defaultChecked={p?.allow_quantity} /> Cliente pode escolher quantidade</label>
            <div className="field"><label htmlFor="max_quantity" className="small">Quantidade máxima</label><input id="max_quantity" name="max_quantity" type="number" min={1} max={99} className="input" defaultValue={p?.max_quantity ?? 1} /></div>
          </div>
        </fieldset>
        <fieldset className="fieldset">
          <legend>Detalhes</legend>
          <div className="field"><label htmlFor="includes">O que está incluído</label><textarea id="includes" name="includes" className="textarea" defaultValue={p?.includes.join('\n')} placeholder={'Um item por linha\n2 publicações\n3 stories'} /><span className="hint">Um item por linha.</span></div>
          <div className="field"><label htmlFor="excludes">O que NÃO está incluído</label><textarea id="excludes" name="excludes" className="textarea" style={{ minHeight: 80 }} defaultValue={p?.excludes.join('\n')} placeholder="Um item por linha" /></div>
          <div className="form-row two">
            <div className="field"><label htmlFor="duration">Duração</label><input id="duration" name="duration" className="input" defaultValue={p?.duration} placeholder="30 dias" /></div>
            <div className="field"><label htmlFor="deliverables">Publicações / entregáveis</label><input id="deliverables" name="deliverables" className="input" defaultValue={p?.deliverables} placeholder="Ex.: 8 posts + 8 stories" /></div>
          </div>
          <div className="form-row two">
            <div className="field"><label htmlFor="start_estimate">Prazo estimado de início</label><input id="start_estimate" name="start_estimate" className="input" defaultValue={p?.start_estimate} placeholder="Ex.: até 3 dias úteis após aprovação" /></div>
            <div className="field" style={{ alignContent: 'end' }}><label className="check"><input type="checkbox" name="needs_ad_budget" defaultChecked={p?.needs_ad_budget} /> Exige verba de anúncios (paga à parte)</label></div>
          </div>
          <div className="field"><label htmlFor="notes">Observações e condições comerciais</label><textarea id="notes" name="notes" className="textarea" style={{ minHeight: 80 }} defaultValue={p?.notes} /></div>
          <ImageField name="image_url" defaultValue={p?.image_url ?? ''} folder="pacotes" label="Imagem de capa (opcional)" />
        </fieldset>
        <fieldset className="fieldset">
          <legend>Exibição</legend>
          <div className="toggle-row">
            <label className="check"><input type="checkbox" name="active" defaultChecked={p ? p.active : true} /> Ativo (aparece no site)</label>
            <label className="check"><input type="checkbox" name="featured" defaultChecked={p?.featured} /> Destaque na página inicial</label>
            <div className="field"><label htmlFor="sort_order" className="small">Ordem de exibição</label><input id="sort_order" name="sort_order" type="number" min={0} max={9999} className="input" defaultValue={p?.sort_order ?? 100} /></div>
          </div>
        </fieldset>
        <div className="sticky-save">
          <button className="btn btn-primary" disabled={busy}>{busy ? 'Salvando…' : 'Salvar pacote'}</button>
          <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancelar</button>
        </div>
      </form>
    </>
  );
}

// ---------- Imagens ----------
function useUploader(folder: string) {
  const { repo, addPreview } = useAdmin();
  const [busy, setBusy] = useState(0);
  const [error, setError] = useState('');
  async function upload(files: File[]): Promise<string[]> {
    setError('');
    setBusy(files.length);
    const out: string[] = [];
    for (const f of files) {
      try {
        const path = await uploadImage(repo, f, folder);
        addPreview(path, URL.createObjectURL(f));
        out.push(path);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Falha no envio.');
      }
      setBusy((n) => n - 1);
    }
    return out;
  }
  return { busy, error, upload };
}

function ImageField({ name, defaultValue, folder, label }: { name: string; defaultValue: string; folder: string; label: string }) {
  const [url, setUrl] = useState(defaultValue);
  const { busy, error, upload } = useUploader(folder);
  return (
    <div className="field">
      <span className="label">{label}</span>
      <input type="hidden" name={name} value={url} />
      {url && (
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Img src={url} className="thumb-sm" style={{ width: 96, height: 96, objectFit: 'contain', background: 'var(--navy)' }} />
          <button type="button" className="btn btn-sm btn-danger" onClick={() => setUrl('')}>Remover</button>
        </div>
      )}
      <label className="upload-box">
        {busy ? <><span className="spinner" /> Enviando…</> : <>{url ? 'Trocar imagem' : 'Toque para escolher uma imagem'}<span className="small">reduzimos automaticamente</span></>}
        <input type="file" accept="image/*" className="sr-only" disabled={busy > 0} onChange={async (e) => {
          const f = e.target.files?.[0];
          e.target.value = '';
          if (!f) return;
          const [path] = await upload([f]);
          if (path) setUrl(path);
        }} />
      </label>
      {error && <span className="err">{error}</span>}
    </div>
  );
}

function ImagesField({ images, setImages, folder }: { images: string[]; setImages: (fn: (l: string[]) => string[]) => void; folder: string }) {
  const { busy, error, upload } = useUploader(folder);
  const move = (i: number, d: number) => setImages((list) => {
    const j = i + d;
    if (j < 0 || j >= list.length) return list;
    const next = [...list];
    [next[i], next[j]] = [next[j], next[i]];
    return next;
  });
  return (
    <div className="field">
      <span className="label">Imagens do projeto</span>
      <span className="hint">A primeira é a capa. Use as setas para reordenar.</span>
      <div className="img-grid">
        {images.map((src, i) => (
          <div className="img-tile" key={src}>
            <Img src={src} />
            {i === 0 && <span className="badge badge-cyan cover-tag">Capa</span>}
            <div className="tools">
              <button type="button" onClick={() => move(i, -1)} aria-label="Mover para a esquerda" disabled={i === 0}>◀</button>
              <button type="button" onClick={() => setImages((l) => l.filter((x) => x !== src))} aria-label="Remover imagem">✕</button>
              <button type="button" onClick={() => move(i, 1)} aria-label="Mover para a direita" disabled={i === images.length - 1}>▶</button>
            </div>
          </div>
        ))}
        <label className="upload-box" style={{ aspectRatio: '1' }}>
          {busy ? <><span className="spinner" /> Enviando {busy}…</> : <>+ Adicionar<span className="small">pode escolher várias</span></>}
          <input type="file" accept="image/*" multiple className="sr-only" disabled={busy > 0} onChange={async (e) => {
            const files = (Array.from(e.target.files || []) as File[]).slice(0, 15);
            e.target.value = '';
            if (!files.length) return;
            const paths = await upload(files);
            setImages((l) => [...l, ...paths]);
          }} />
        </label>
      </div>
      {error && <span className="err">{error}</span>}
    </div>
  );
}

// ---------- Portfólio ----------
function PortfolioList({ data, busy, onEdit, apply }: { data: SiteData; busy: boolean; onEdit: (id: string) => void; apply: (r: ops.OpResult) => Promise<boolean> }) {
  const list = [...data.portfolio].sort(bySort);
  return (
    <>
      <div className="admin-top">
        <h1>Portfólio</h1>
        <button className="btn btn-primary btn-sm" onClick={() => onEdit('novo')} disabled={busy}>+ Novo projeto</button>
      </div>
      <div className="list">
        {list.map((p, i) => (
          <div key={p.id} className={`row-card ${p.published ? '' : 'inactive'}`}>
            <div className="row-head">
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                {p.images[0] && <Img src={p.images[0]} className="thumb-sm" />}
                <div>
                  <h3><a href="#portfolio" onClick={(e) => { e.preventDefault(); onEdit(p.id); }}>{p.title}</a></h3>
                  <span className="small muted">{p.category || 'Sem categoria'} · {p.images.length} imagem(ns)</span>
                </div>
              </div>
              <span className={`badge ${p.published ? 'badge-green' : ''}`}>{p.published ? 'Publicado' : 'Oculto'}</span>
            </div>
            <div className="row-actions">
              <button className="btn btn-sm" onClick={() => onEdit(p.id)} disabled={busy}>Editar</button>
              <button className="btn btn-sm btn-ghost" disabled={busy || i === 0} onClick={() => void apply(ops.movePortfolio(data, p.id, -1))}>↑ Subir</button>
              <button className="btn btn-sm btn-ghost" disabled={busy || i === list.length - 1} onClick={() => void apply(ops.movePortfolio(data, p.id, 1))}>↓ Descer</button>
              <button className="btn btn-sm btn-ghost" disabled={busy} onClick={() => void apply(ops.togglePortfolio(data, p.id))}>{p.published ? 'Ocultar' : 'Publicar'}</button>
              <Confirm disabled={busy} msg={`Remover "${p.title}" do portfólio?`} onYes={() => void apply(ops.deletePortfolio(data, p.id))}>Remover</Confirm>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function PortfolioForm({ data, item: p, busy, onSubmit, onCancel }: { data: SiteData; item: PortfolioItem | null; busy: boolean; onSubmit: (fd: FormData, images: string[]) => void; onCancel: () => void }) {
  const [images, setImages] = useState<string[]>(p?.images ?? []);
  const suggestions = [...new Set([...PORTFOLIO_CATEGORY_SUGGESTIONS, ...data.portfolio.map((x) => x.category).filter(Boolean)])];
  return (
    <>
      <div className="admin-top">
        <h1>{p ? 'Editar projeto' : 'Novo projeto'}</h1>
        <button className="btn btn-sm btn-ghost" onClick={onCancel}>← Voltar</button>
      </div>
      <form className="form" onSubmit={(e) => { e.preventDefault(); onSubmit(new FormData(e.currentTarget), images); }}>
        <input type="hidden" name="id" value={p?.id ?? ''} />
        <fieldset className="fieldset">
          <legend>Projeto</legend>
          <div className="field"><label htmlFor="title">Título *</label><input id="title" name="title" className="input" defaultValue={p?.title} required maxLength={160} placeholder="Ex.: Cardápio — Acarajé do Iran" /></div>
          <div className="form-row two">
            <div className="field"><label htmlFor="client_name">Cliente</label><input id="client_name" name="client_name" className="input" defaultValue={p?.client_name} maxLength={120} /></div>
            <div className="field">
              <label htmlFor="category">Categoria</label>
              <input id="category" name="category" className="input" list="cats" defaultValue={p?.category} maxLength={80} />
              <datalist id="cats">{suggestions.map((c) => <option key={c} value={c} />)}</datalist>
            </div>
          </div>
          <div className="field"><label htmlFor="description">Descrição</label><textarea id="description" name="description" className="textarea" defaultValue={p?.description} maxLength={3000} /></div>
          <div className="field"><label htmlFor="services">Serviços realizados</label><textarea id="services" name="services" className="textarea" style={{ minHeight: 80 }} defaultValue={p?.services.join('\n')} placeholder="Um por linha" /></div>
          <div className="field"><label htmlFor="highlights">Destaques / resultados (opcional)</label><textarea id="highlights" name="highlights" className="textarea" style={{ minHeight: 80 }} defaultValue={p?.highlights.join('\n')} placeholder="Um por linha. Use só números reais e autorizados." /></div>
        </fieldset>
        <fieldset className="fieldset">
          <legend>Imagens</legend>
          <ImagesField images={images} setImages={setImages} folder="portfolio" />
        </fieldset>
        <fieldset className="fieldset">
          <legend>Exibição</legend>
          <label className="check"><input type="checkbox" name="published" defaultChecked={p ? p.published : true} /> Publicado no site</label>
        </fieldset>
        <div className="sticky-save">
          <button className="btn btn-primary" disabled={busy}>{busy ? 'Salvando…' : 'Salvar projeto'}</button>
          <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancelar</button>
        </div>
      </form>
    </>
  );
}

// ---------- Conteúdo ----------
const pad = <T,>(list: T[], extra: number, empty: T): T[] => [...list, ...Array.from({ length: extra }, () => empty)];

function ContentForm({ data, busy, onSubmit }: { data: SiteData; busy: boolean; onSubmit: (fd: FormData) => void }) {
  const c = data.content;
  const difs = pad(c.differentials, 2, { title: '', text: '' }).slice(0, 8);
  const steps = pad(c.howItWorks, 1, { title: '', text: '' }).slice(0, 6);
  const tests = pad(c.testimonials, 2, { name: '', business: '', text: '', authorized: false }).slice(0, 12);
  return (
    <>
      <div className="admin-top"><h1>Conteúdo do site</h1></div>
      <form className="form" onSubmit={(e) => { e.preventDefault(); onSubmit(new FormData(e.currentTarget)); }}>
        <fieldset className="fieldset">
          <legend>Marca</legend>
          <div className="form-row two">
            <div className="field"><label htmlFor="brand_name">Nome</label><input id="brand_name" name="brand_name" className="input" defaultValue={c.brand.name} /></div>
            <div className="field"><label htmlFor="slogan">Slogan</label><input id="slogan" name="slogan" className="input" defaultValue={c.brand.slogan} /></div>
          </div>
          <ImageField name="logo_url" defaultValue={c.brand.logoUrl} folder="marca" label="Símbolo do logotipo (topo do site; prefira PNG com fundo transparente)" />
        </fieldset>
        <fieldset className="fieldset">
          <legend>Contatos e redes sociais</legend>
          <div className="form-row two">
            <div className="field"><label htmlFor="whatsapp">WhatsApp comercial (DDD + número)</label><input id="whatsapp" name="whatsapp" className="input" inputMode="tel" defaultValue={c.contact.whatsapp} /><span className="hint">Recebe os pedidos do site.</span></div>
            <div className="field"><label htmlFor="whatsapp_display">WhatsApp como aparece no site</label><input id="whatsapp_display" name="whatsapp_display" className="input" defaultValue={c.contact.whatsappDisplay} /></div>
          </div>
          <div className="form-row two">
            <div className="field"><label htmlFor="email">E-mail comercial (recebe os pedidos)</label><input id="email" name="email" type="email" className="input" defaultValue={c.contact.email} /></div>
            <div className="field"><label htmlFor="region">Região de atendimento</label><input id="region" name="region" className="input" defaultValue={c.contact.region} /></div>
          </div>
          <div className="field"><label htmlFor="instagram">Instagram (link completo)</label><input id="instagram" name="instagram" className="input" defaultValue={c.contact.instagram} placeholder="https://www.instagram.com/…" /></div>
          <div className="form-row two">
            <div className="field"><label htmlFor="facebook">Facebook</label><input id="facebook" name="facebook" className="input" defaultValue={c.contact.facebook} placeholder="https://…" /></div>
            <div className="field"><label htmlFor="tiktok">TikTok</label><input id="tiktok" name="tiktok" className="input" defaultValue={c.contact.tiktok} placeholder="https://…" /></div>
          </div>
        </fieldset>
        <fieldset className="fieldset">
          <legend>Página inicial</legend>
          <div className="field"><label htmlFor="hero_kicker">Frase acima do título</label><input id="hero_kicker" name="hero_kicker" className="input" defaultValue={c.hero.kicker} /></div>
          <div className="field"><label htmlFor="hero_title">Título principal</label><input id="hero_title" name="hero_title" className="input" defaultValue={c.hero.title} /><span className="hint">O que vier depois da vírgula aparece em degradê.</span></div>
          <div className="field"><label htmlFor="hero_subtitle">Subtítulo</label><textarea id="hero_subtitle" name="hero_subtitle" className="textarea" style={{ minHeight: 80 }} defaultValue={c.hero.subtitle} /></div>
          <label className="check"><input type="checkbox" name="banner_active" defaultChecked={c.banner.active} /> Mostrar faixa de aviso no topo do site</label>
          <div className="form-row two">
            <div className="field"><label htmlFor="banner_text">Texto da faixa</label><input id="banner_text" name="banner_text" className="input" defaultValue={c.banner.text} placeholder="Ex.: Promoção de inauguração até sexta!" /></div>
            <div className="field"><label htmlFor="banner_link">Link da faixa (opcional)</label><input id="banner_link" name="banner_link" className="input" defaultValue={c.banner.link} placeholder="/servicos ou https://…" /></div>
          </div>
        </fieldset>
        <fieldset className="fieldset">
          <legend>Diferenciais</legend>
          <span className="hint">Deixe o título vazio para remover.</span>
          {difs.map((d, i) => (
            <div className="form-row two" key={`dif-${i}`}>
              <input name={`dif_title_${i}`} className="input" defaultValue={d.title} placeholder="Título" />
              <input name={`dif_text_${i}`} className="input" defaultValue={d.text} placeholder="Texto curto" />
            </div>
          ))}
        </fieldset>
        <fieldset className="fieldset">
          <legend>Como funciona (passos)</legend>
          {steps.map((d, i) => (
            <div className="form-row two" key={`step-${i}`}>
              <input name={`step_title_${i}`} className="input" defaultValue={d.title} placeholder={`Passo ${i + 1}`} />
              <input name={`step_text_${i}`} className="input" defaultValue={d.text} placeholder="Descrição" />
            </div>
          ))}
        </fieldset>
        <fieldset className="fieldset">
          <legend>Condições comerciais (avisos)</legend>
          <textarea name="notices" className="textarea" defaultValue={c.notices.join('\n')} />
          <span className="hint">Um aviso por linha. Aparecem no carrinho, na finalização e nas páginas de serviço.</span>
        </fieldset>
        <fieldset className="fieldset">
          <legend>Sobre a GR Visual</legend>
          <div className="field"><label htmlFor="about_title">Título</label><input id="about_title" name="about_title" className="input" defaultValue={c.about.title} /></div>
          <div className="field"><label htmlFor="about_paragraphs">Texto</label><textarea id="about_paragraphs" name="about_paragraphs" className="textarea" style={{ minHeight: 160 }} defaultValue={c.about.paragraphs.join('\n\n')} /><span className="hint">Separe os parágrafos com uma linha em branco.</span></div>
        </fieldset>
        <fieldset className="fieldset">
          <legend>Depoimentos</legend>
          <span className="hint">Só aparecem no site os marcados como autorizados pelo cliente.</span>
          {tests.map((t, i) => (
            <div key={`t-${i}`} style={{ display: 'grid', gap: 8, paddingBottom: 12, borderBottom: '1px solid var(--line)' }}>
              <div className="form-row two">
                <input name={`t_name_${i}`} className="input" defaultValue={t.name} placeholder="Nome" />
                <input name={`t_business_${i}`} className="input" defaultValue={t.business} placeholder="Negócio (opcional)" />
              </div>
              <textarea name={`t_text_${i}`} className="textarea" style={{ minHeight: 70 }} defaultValue={t.text} placeholder="Depoimento" />
              <label className="check"><input type="checkbox" name={`t_auth_${i}`} defaultChecked={t.authorized} /> Cliente autorizou a publicação</label>
            </div>
          ))}
        </fieldset>
        <fieldset className="fieldset">
          <legend>SEO e compartilhamento</legend>
          <div className="field"><label htmlFor="seo_title">Título para o Google</label><input id="seo_title" name="seo_title" className="input" defaultValue={c.seo.title} maxLength={120} /></div>
          <div className="field"><label htmlFor="seo_description">Descrição para o Google e WhatsApp</label><textarea id="seo_description" name="seo_description" className="textarea" style={{ minHeight: 80 }} defaultValue={c.seo.description} maxLength={300} /></div>
        </fieldset>
        <fieldset className="fieldset">
          <legend>Política de privacidade</legend>
          <textarea name="privacy" className="textarea" style={{ minHeight: 220 }} defaultValue={c.privacy.join('\n\n')} />
          <span className="hint">Parágrafos separados por linha em branco.</span>
        </fieldset>
        <div className="sticky-save"><button className="btn btn-primary" disabled={busy}>{busy ? 'Salvando…' : 'Salvar conteúdo'}</button></div>
      </form>
    </>
  );
}

// ---------- FAQ ----------
function FaqEditor({ data, busy, apply }: { data: SiteData; busy: boolean; apply: (r: ops.OpResult) => Promise<boolean> }) {
  const faqs = [...data.faqs].sort(bySort);
  const newForm = useRef<HTMLFormElement>(null);
  return (
    <>
      <div className="admin-top"><h1>Perguntas frequentes</h1></div>
      <div className="list">
        {faqs.map((f: Faq) => (
          <div key={f.id + data.updatedAt} className={`row-card ${f.active ? '' : 'inactive'}`}>
            <form className="form" onSubmit={(e) => { e.preventDefault(); void apply(ops.saveFaq(data, new FormData(e.currentTarget))); }}>
              <input type="hidden" name="id" value={f.id} />
              <input name="question" className="input" defaultValue={f.question} aria-label="Pergunta" />
              <textarea name="answer" className="textarea" style={{ minHeight: 80 }} defaultValue={f.answer} aria-label="Resposta" />
              <div className="toggle-row">
                <label className="check"><input type="checkbox" name="active" defaultChecked={f.active} /> Visível</label>
                <input name="sort_order" type="number" className="input" defaultValue={f.sort_order} aria-label="Ordem" />
              </div>
              <div className="row-actions">
                <button className="btn btn-sm btn-primary" disabled={busy}>Salvar</button>
                <Confirm disabled={busy} msg="Remover esta pergunta?" onYes={() => void apply(ops.deleteFaq(data, f.id))}>Remover</Confirm>
              </div>
            </form>
          </div>
        ))}
        <form ref={newForm} className="row-card form" onSubmit={async (e) => {
          e.preventDefault();
          if (await apply(ops.saveFaq(data, new FormData(e.currentTarget)))) newForm.current?.reset();
        }}>
          <strong>Nova pergunta</strong>
          <input name="question" className="input" placeholder="Pergunta" />
          <textarea name="answer" className="textarea" style={{ minHeight: 80 }} placeholder="Resposta" />
          <input type="hidden" name="active" value="on" />
          <button className="btn btn-sm btn-primary" disabled={busy}>Adicionar pergunta</button>
        </form>
      </div>
    </>
  );
}

// ---------- Conta ----------
function Account({ session, onLogout, data }: { session: Repo; onLogout: () => void; data: SiteData }) {
  return (
    <>
      <div className="admin-top"><h1>Conta e pedidos</h1></div>
      <div className="card" style={{ display: 'grid', gap: 10 }}>
        <h2 style={{ fontSize: '1.1rem', margin: 0 }}>Onde chegam os pedidos</h2>
        <p className="muted small" style={{ margin: 0 }}>
          WhatsApp: <b>{data.content.contact.whatsappDisplay}</b> · E-mail: <b>{data.content.contact.email || 'não configurado'}</b>
        </p>
        <p className="muted small" style={{ margin: 0 }}>
          Na primeira vez que alguém pedir por e-mail, o FormSubmit manda para esse endereço um e-mail de <b>ativação</b>. Abra e clique em
          <b> Activate Form</b> — a partir daí todos os pedidos chegam no Gmail.
        </p>
      </div>
      <div className="card" style={{ display: 'grid', gap: 10, marginTop: 16 }}>
        <h2 style={{ fontSize: '1.1rem', margin: 0 }}>Repositório</h2>
        <p className="muted small" style={{ margin: 0 }}>{session.owner}/{session.repo} · última alteração: {new Date(data.updatedAt).toLocaleString('pt-BR')}</p>
        <div className="btn-row">
          <a className="btn btn-sm" href="./" target="_blank" rel="noopener">Ver site ↗</a>
          <button className="btn btn-sm btn-danger" onClick={onLogout}>Sair deste aparelho</button>
        </div>
        <p className="small muted" style={{ margin: 0 }}>Perdeu o celular? Apague o token em github.com/settings/personal-access-tokens.</p>
      </div>
    </>
  );
}
