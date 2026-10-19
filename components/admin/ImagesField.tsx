'use client';

import { useState } from 'react';
import { uploadImage } from './image-utils';

/** Várias imagens (portfólio): enviar, reordenar e remover. A 1ª é a capa. */
export function ImagesField({ name, defaultValue = [], folder }: { name: string; defaultValue?: string[]; folder: string }) {
  const [images, setImages] = useState<string[]>(defaultValue);
  const [busy, setBusy] = useState(0);
  const [error, setError] = useState('');

  const move = (i: number, d: number) =>
    setImages((list) => {
      const j = i + d;
      if (j < 0 || j >= list.length) return list;
      const next = [...list];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  return (
    <div className="field">
      <span className="label">Imagens do projeto</span>
      <span className="hint">A primeira imagem é a capa. Use as setas para reordenar.</span>
      <input type="hidden" name={name} value={JSON.stringify(images)} />
      <div className="img-grid">
        {images.map((src, i) => (
          <div className="img-tile" key={src}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={`Imagem ${i + 1}`} />
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
          <input
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            disabled={busy > 0}
            onChange={async (e) => {
              const files = (Array.from(e.target.files || []) as File[]).slice(0, 15);
              e.target.value = '';
              if (!files.length) return;
              setError('');
              setBusy(files.length);
              for (const f of files) {
                try {
                  const url = await uploadImage(f, folder);
                  setImages((l) => [...l, url]);
                } catch (err) {
                  setError(err instanceof Error ? err.message : 'Falha no envio.');
                }
                setBusy((n) => n - 1);
              }
            }}
          />
        </label>
      </div>
      {error && <span className="err">{error}</span>}
    </div>
  );
}
