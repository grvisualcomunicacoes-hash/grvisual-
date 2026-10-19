import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Flash } from '@/components/admin/Flash';
import { ImagesField } from '@/components/admin/ImagesField';
import { SubmitButton } from '@/components/admin/SubmitButton';
import { requireAdmin } from '@/lib/admin-auth';
import { PORTFOLIO_CATEGORY_SUGGESTIONS } from '@/lib/categories';
import type { PortfolioItem } from '@/lib/types';
import { savePortfolio } from '../../../actions';

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string; erro?: string }> };

export default async function PortfolioForm({ params, searchParams }: Props) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const { supabase } = await requireAdmin();
  let p: PortfolioItem | null = null;
  if (id !== 'novo') {
    const { data } = await supabase.from('portfolio_items').select('*').eq('id', id).maybeSingle();
    if (!data) notFound();
    p = data as PortfolioItem;
  }
  const { data: cats } = await supabase.from('portfolio_items').select('category');
  const suggestions = [...new Set([...PORTFOLIO_CATEGORY_SUGGESTIONS, ...(cats ?? []).map((c) => c.category as string).filter(Boolean)])];

  return (
    <>
      <div className="admin-top">
        <h1>{p ? 'Editar projeto' : 'Novo projeto'}</h1>
        <Link href="/admin/portfolio" className="btn btn-sm btn-ghost">← Voltar</Link>
      </div>
      <Flash {...sp} />
      <form action={savePortfolio} className="form">
        <input type="hidden" name="id" value={p?.id ?? ''} />
        <input type="hidden" name="slug" value={p?.slug ?? ''} />
        <fieldset className="fieldset">
          <legend>Projeto</legend>
          <div className="field">
            <label htmlFor="title">Título *</label>
            <input id="title" name="title" className="input" defaultValue={p?.title} required maxLength={160} placeholder="Ex.: Cardápio — Acarajé do Iran" />
          </div>
          <div className="form-row two">
            <div className="field">
              <label htmlFor="client_name">Cliente</label>
              <input id="client_name" name="client_name" className="input" defaultValue={p?.client_name} maxLength={120} />
            </div>
            <div className="field">
              <label htmlFor="category">Categoria</label>
              <input id="category" name="category" className="input" list="cats" defaultValue={p?.category} maxLength={80} />
              <datalist id="cats">{suggestions.map((c) => <option key={c} value={c} />)}</datalist>
            </div>
          </div>
          <div className="field">
            <label htmlFor="description">Descrição</label>
            <textarea id="description" name="description" className="textarea" defaultValue={p?.description} maxLength={3000} />
          </div>
          <div className="field">
            <label htmlFor="services">Serviços realizados</label>
            <textarea id="services" name="services" className="textarea" style={{ minHeight: 80 }} defaultValue={p?.services.join('\n')} placeholder="Um por linha" />
          </div>
          <div className="field">
            <label htmlFor="highlights">Destaques / resultados (opcional)</label>
            <textarea id="highlights" name="highlights" className="textarea" style={{ minHeight: 80 }} defaultValue={p?.highlights.join('\n')} placeholder="Um por linha. Use só números reais e autorizados." />
          </div>
        </fieldset>
        <fieldset className="fieldset">
          <legend>Imagens</legend>
          <ImagesField name="images" defaultValue={p?.images ?? []} folder="portfolio" />
        </fieldset>
        <fieldset className="fieldset">
          <legend>Exibição</legend>
          <div className="toggle-row">
            <label className="check"><input type="checkbox" name="published" defaultChecked={p ? p.published : true} /> Publicado no site</label>
            <div className="field">
              <label htmlFor="sort_order" className="small">Ordem</label>
              <input id="sort_order" name="sort_order" type="number" min={0} max={9999} className="input" defaultValue={p?.sort_order ?? 100} />
            </div>
          </div>
        </fieldset>
        <div className="sticky-save">
          <SubmitButton>Salvar projeto</SubmitButton>
          <Link href="/admin/portfolio" className="btn btn-ghost">Cancelar</Link>
        </div>
      </form>
    </>
  );
}
