'use client';

import { useState } from 'react';
import { uploadImage } from './image-utils';

/** Uma imagem (capa do pacote, logotipo). Grava a URL num campo oculto. */
export function ImageField({ name, defaultValue = '', folder, label }: { name: string; defaultValue?: string; folder: string; label: string }) {
  const [url, setUrl] = useState(defaultValue);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  return (
    <div className="field">
      <span className="label">{label}</span>
      <input type="hidden" name={name} value={url} />
      {url && (
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="" className="thumb-sm" style={{ width: 96, height: 96, objectFit: 'contain', background: 'var(--navy)' }} />
          <button type="button" className="btn btn-sm btn-danger" onClick={() => setUrl('')}>Remover</button>
        </div>
      )}
      <label className="upload-box">
        {busy ? <><span className="spinner" /> Enviando…</> : <>{url ? 'Trocar imagem' : 'Toque para escolher uma imagem'}<span className="small">JPG, PNG ou WebP — reduzimos automaticamente</span></>}
        <input
          type="file"
          accept="image/*"
          className="sr-only"
          disabled={busy}
          onChange={async (e) => {
            const file = e.target.files?.[0];
            e.target.value = '';
            if (!file) return;
            setBusy(true);
            setError('');
            try {
              setUrl(await uploadImage(file, folder));
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Falha no envio.');
            } finally {
              setBusy(false);
            }
          }}
        />
      </label>
      {error && <span className="err">{error}</span>}
    </div>
  );
}
