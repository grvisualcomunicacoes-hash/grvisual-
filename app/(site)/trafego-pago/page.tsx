import type { Metadata } from 'next';
import { ThemePage } from '@/components/ThemePage';
import { THEME_PAGES } from '@/lib/categories';

export const metadata: Metadata = {
  title: 'Tráfego pago e divulgação',
  description: THEME_PAGES['trafego-pago'].intro,
  alternates: { canonical: '/trafego-pago' },
};

export default function Page() {
  return <ThemePage theme="trafego-pago" />;
}
