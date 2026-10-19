import { Flash } from '@/components/admin/Flash';
import { ImageField } from '@/components/admin/ImageField';
import { SubmitButton } from '@/components/admin/SubmitButton';
import { requireAdmin } from '@/lib/admin-auth';
import { mergeContent } from '@/lib/data';
import { DEFAULT_CONTENT } from '@/lib/defaults';
import type { Faq, SiteContent } from '@/lib/types';
import { deleteFaq, saveContent, saveFaq } from '../../actions';

const pad = <T,>(list: T[], extra: number, empty: T): T[] => [...list, ...Array.from({ length: extra }, () => empty)];

export default async function ConteudoAdmin({ searchParams }: { searchParams: Promise<{ ok?: string; erro?: string }> }) {
  const sp = await searchParams;
  const { supabase } = await requireAdmin();
  const [{ data: settings }, { data: faqData }] = await Promise.all([
    supabase.from('site_settings').select('content').eq('id', 1).maybeSingle(),
    supabase.from('faqs').select('*').order('sort_order'),
  ]);
  const c: SiteContent = mergeContent(DEFAULT_CONTENT, settings?.content);
  const faqs = (faqData ?? []) as Faq[];
  const difs = pad(c.differentials, 2, { title: '', text: '' }).slice(0, 8);
  const steps = pad(c.howItWorks, 1, { title: '', text: '' }).slice(0, 6);
  const tests = pad(c.testimonials, 2, { name: '', business: '', text: '', authorized: false }).slice(0, 12);

  return (
    <>
      <div className="admin-top"><h1>Conteúdo do site</h1></div>
      <Flash {...sp} />

      <form action={saveContent} className="form">
        <fieldset className="fieldset">
          <legend>Marca</legend>
          <div className="form-row two">
            <div className="field"><label htmlFor="brand_name">Nome</label><input id="brand_name" name="brand_name" className="input" defaultValue={c.brand.name} /></div>
            <div className="field"><label htmlFor="slogan">Slogan</label><input id="slogan" name="slogan" className="input" defaultValue={c.brand.slogan} /></div>
          </div>
          <ImageField name="logo_url" defaultValue={c.brand.logoUrl} folder="marca" label="Símbolo do logotipo (usado no topo do site; prefira PNG com fundo transparente)" />
        </fieldset>

        <fieldset className="fieldset">
          <legend>Contatos e redes sociais</legend>
          <div className="form-row two">
            <div className="field"><label htmlFor="whatsapp">WhatsApp comercial (DDD + número)</label><input id="whatsapp" name="whatsapp" className="input" inputMode="tel" defaultValue={c.contact.whatsapp} /><span className="hint">Recebe os pedidos do site.</span></div>
            <div className="field"><label htmlFor="whatsapp_display">WhatsApp como aparece no site</label><input id="whatsapp_display" name="whatsapp_display" className="input" defaultValue={c.contact.whatsappDisplay} /></div>
          </div>
          <div className="form-row two">
            <div className="field"><label htmlFor="email">E-mail comercial</label><input id="email" name="email" type="email" className="input" defaultValue={c.contact.email} /></div>
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
          <div className="field">
            <textarea name="notices" className="textarea" defaultValue={c.notices.join('\n')} />
            <span className="hint">Um aviso por linha. Aparecem no carrinho, na finalização e nas páginas de serviço.</span>
          </div>
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

        <div className="sticky-save"><SubmitButton>Salvar conteúdo</SubmitButton></div>
      </form>

      <section id="faq" style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: '1.3rem' }}>Perguntas frequentes</h2>
        <div className="list">
          {faqs.map((f) => (
            <div key={f.id} className={`row-card ${f.active ? '' : 'inactive'}`}>
              <form action={saveFaq} className="form">
                <input type="hidden" name="id" value={f.id} />
                <input name="question" className="input" defaultValue={f.question} aria-label="Pergunta" />
                <textarea name="answer" className="textarea" style={{ minHeight: 80 }} defaultValue={f.answer} aria-label="Resposta" />
                <div className="toggle-row">
                  <label className="check"><input type="checkbox" name="active" defaultChecked={f.active} /> Visível</label>
                  <input name="sort_order" type="number" className="input" defaultValue={f.sort_order} aria-label="Ordem" />
                </div>
                <div className="row-actions"><SubmitButton className="btn btn-sm btn-primary">Salvar</SubmitButton></div>
              </form>
              <form action={deleteFaq}>
                <input type="hidden" name="id" value={f.id} />
                <SubmitButton className="btn btn-sm btn-danger" pendingText="…" confirm="Remover esta pergunta?">Remover</SubmitButton>
              </form>
            </div>
          ))}
          <form action={saveFaq} className="row-card form">
            <strong>Nova pergunta</strong>
            <input name="question" className="input" placeholder="Pergunta" />
            <textarea name="answer" className="textarea" style={{ minHeight: 80 }} placeholder="Resposta" />
            <input type="hidden" name="active" value="on" />
            <input type="hidden" name="sort_order" value={(faqs.at(-1)?.sort_order ?? 0) + 1} />
            <SubmitButton className="btn btn-sm btn-primary">Adicionar pergunta</SubmitButton>
          </form>
        </div>
      </section>
    </>
  );
}
