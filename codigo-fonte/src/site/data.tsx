import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { defaultSiteData, normalizeSiteData, type SiteData } from '@/lib/site-data';

const DataContext = createContext<{ data: SiteData; loading: boolean; offline: boolean }>({ data: defaultSiteData(), loading: true, offline: false });

export function DataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState({ data: defaultSiteData(), loading: true, offline: false });
  useEffect(() => {
    // ?v= evita a versão antiga em cache depois que você salva no painel
    fetch(`dados/site.json?v=${Date.now()}`, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((json) => setState({ data: normalizeSiteData(json), loading: false, offline: false }))
      .catch(() => setState((s) => ({ ...s, loading: false, offline: true })));
  }, []);
  return <DataContext.Provider value={state}>{children}</DataContext.Provider>;
}

export const useData = () => useContext(DataContext);
