import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Flash } from '@/components/admin/Flash';
import { ImageField } from '@/components/admin/ImageField';
import { SubmitButton } from '@/components/admin/SubmitButton';
import { requireAdmin } from '@/lib/admin-auth';
import { SERVICE_CATEGORIES } from '@/lib/categories';
import { normalizePackage } from '@/lib/data';
import type { Package } from '@/lib/types';
import { savePackage } from '../../../actions';

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string; erro?: string }> };

const money = (n: number | null) => (n === null ? '' : n.toFixed(2).replace('.', ','));

export default async function PacoteForm({ params, searchParams }: Props) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const { supabase } = await requireAdmin();
  let p: Package | null = null;
  if (id !== 'novo') {
    const { data } = await supabase.from('packages').select('*').eq('id', id).maybeSingle();
    if (!data) notFound();
    p = normalizePackage(data);
  }

  return (
    <>
      <div className="admin-top">
        <h1>{p ? 'Editar pacote' : 'Novo pacote'}</h1>
        <div className="btn-row">
          {p?.active && <Link href={`/servicos/${p.slug}`} target="_blank" className="btn btn-sm">Ver no site ↗</Link>}
          <Link href="/admin/pacotes" className="btn btn-sm btn-ghost">← Voltar</Link>
        </div>
      </div>
      <Flash {...sp} />
      <form action={savePackage} className="form">
        <input type="hidden" name="id" value={p?.id ?? ''} />
        <fieldset className="fieldset">
          <legend>Básico</legend>
          <div className="field">
            <label htmlFor="name">Nome do pacote *</label>
            <input id="name" name="name" className="input" defaultValue={p?.name} required maxLength={120} />
          </div>
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
              <span className="hint">Ex.: /servicos/<b>{p?.slug || 'nome-do-pacote'}</b>. Evite mudar depois de divulgar o link.</span>
            </div>
          </div>
          <div className="field">
            <label htmlFor="description">Descrição comercial</label>
            <textarea id="description" name="description" className="textarea" defaultValue={p?.description} maxLength={1500} />
          </div>
        </fieldset>

        <fieldset className="fieldset">
          <legend>Preço</legend>
          <div className="radio-group">
            <label className="radio-card"><input type="radio" name="pricing_mode" value="fixo" defaultChecked={p?.pricing_mode !== 'orcamento'} /> Preço fixo</label>
            <label className="radio-card"><input type="radio" name="pricing_mode" value="orcamento" defaultChecked={p?.pricing_mode === 'orcamento'} /> Sob orçamento</label>
          </div>
          <div className="form-row two">
            <div className="field">
              <label htmlFor="price">Preço (R$)</label>
              <input id="price" name="price" className="input" inputMode="decimal" defaultValue={money(p?.price ?? null)} placeholder="140,00" />
            </div>
            <div className="field">
              <label htmlFor="promo_price">Preço promocional (opcional)</label>
              <input id="promo_price" name="promo_price" className="input" inputMode="decimal" defaultValue={money(p?.promo_price ?? null)} placeholder="deixe vazio se não houver" />
            </div>
          </div>
          <div className="toggle-row">
            <label className="check"><input type="checkbox" name="allow_quantity" defaultChecked={p?.allow_quantity} /> Cliente pode escolher quantidade</label>
            <div className="field">
              <label htmlFor="max_quantity" className="small">Quantidade máxima</label>
              <input id="max_quantity" name="max_quantity" type="number" min={1} max={99} className="input" defaultValue={p?.max_quantity ?? 1} />
            </div>
          </div>
        </fieldset>

        <fieldset className="fieldset">
          <legend>Detalhes</legend>
          <div className="field">
            <label htmlFor="includes">O que está incluído</label>
            <textarea id="includes" name="includes" className="textarea" defaultValue={p?.includes.join('\n')} placeholder={'Um item por linha\n2 publicações\n3 stories'} />
            <span className="hint">Um item por linha.</span>
          </div>
          <div className="field">
            <label htmlFor="excludes">O que NÃO está incluído</label>
            <textarea id="excludes" name="excludes" className="textarea" style={{ minHeight: 80 }} defaultValue={p?.excludes.join('\n')} placeholder="Um item por linha" />
          </div>
          <div className="form-row two">
            <div className="field">
              <label htmlFor="duration">Duração</label>
              <input id="duration" name="duration" className="input" defaultValue={p?.duration} placeholder="30 dias" />
            </div>
            <div className="field">
              <label htmlFor="deliverables">Publicações / entregáveis</label>
              <input id="deliverables" name="deliverables" className="input" defaultValue={p?.deliverables} placeholder="Ex.: 8 posts + 8 stories" />
            </div>
          </div>
          <div className="form-row two">
            <div className="field">
              <label htmlFor="start_estimate">Prazo estimado de início</label>
              <input id="start_estimate" name="start_estimate" className="input" defaultValue={p?.start_estimate} placeholder="Ex.: até 3 dias úteis após aprovação" />
            </div>
            <div className="field" style={{ alignContent: 'end' }}>
              <label className="check"><input type="checkbox" name="needs_ad_budget" defaultChecked={p?.needs_ad_budget} /> Exige verba de anúncios (paga à parte)</label>
            </div>
          </div>
          <div className="field">
            <label htmlFor="notes">Observações e condições comerciais</label>
            <textarea id="notes" name="notes" className="textarea" style={{ minHeight: 80 }} defaultValue={p?.notes} />
          </div>
          <ImageField name="image_url" defaultValue={p?.image_url} folder="pacotes" label="Imagem de capa (opcional)" />
        </fieldset>

        <fieldset className="fieldset">
          <legend>Exibição</legend>
          <div className="toggle-row">
            <label className="check"><input type="checkbox" name="active" defaultChecked={p ? p.active : true} /> Ativo (aparece no site)</label>
            <label className="check"><input type="checkbox" name="featured" defaultChecked={p?.featured} /> Destaque na página inicial</label>
            <div className="field">
              <label htmlFor="sort_order" className="small">Ordem de exibição</label>
              <input id="sort_order" name="sort_order" type="number" min={0} max={9999} className="input" defaultValue={p?.sort_order ?? 100} />
            </div>
          </div>
        </fieldset>

        <div className="sticky-save">
          <SubmitButton>Salvar pacote</SubmitButton>
          <Link href="/admin/pacotes" className="btn btn-ghost">Cancelar</Link>
        </div>
      </form>
    </>
  );
}
