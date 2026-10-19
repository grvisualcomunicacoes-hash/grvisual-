import type { Metadata } from 'next';
import { ThemePage } from '@/components/ThemePage';
import { THEME_PAGES } from '@/lib/categories';

export const metadata: Metadata = {
  title: 'Identidade visual e criação de artes',
  description: THEME_PAGES['identidade-visual'].intro,
  alternates: { canonical: '/identidade-visual' },
};

export default function Page() {
  return <ThemePage theme="identidade-visual" />;
}
