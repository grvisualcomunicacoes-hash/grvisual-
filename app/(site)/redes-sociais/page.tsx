import type { Metadata } from 'next';
import { ThemePage } from '@/components/ThemePage';
import { THEME_PAGES } from '@/lib/categories';

export const metadata: Metadata = {
  title: 'Gestão de redes sociais',
  description: THEME_PAGES['redes-sociais'].intro,
  alternates: { canonical: '/redes-sociais' },
};

export default function Page() {
  return <ThemePage theme="redes-sociais" />;
}
