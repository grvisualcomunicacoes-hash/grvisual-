'use client';

import { browserClient } from '@/lib/supabase/browser';

/** Reduz a imagem no próprio celular antes de enviar (máx. 1600 px, WebP). */
export async function compressImage(file: File, maxSide = 1600, quality = 0.85): Promise<Blob> {
  if (file.type === 'image/gif') return file;
  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return file;
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, w, h);
  const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/webp', quality));
  if (!blob) return file;
  return blob.size < file.size ? blob : file;
}

export async function uploadImage(file: File, folder: string): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('Envie apenas imagens (JPG, PNG ou WebP).');
  if (file.size > 25 * 1024 * 1024) throw new Error('Imagem muito grande (máx. 25 MB).');
  const blob = await compressImage(file);
  const ext = blob.type === 'image/webp' ? 'webp' : (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const supabase = browserClient();
  const { error } = await supabase.storage.from('media').upload(path, blob, {
    contentType: blob.type || file.type,
    cacheControl: '31536000',
    upsert: false,
  });
  if (error) throw new Error('Falha ao enviar a imagem. Verifique a conexão e tente de novo.');
  return supabase.storage.from('media').getPublicUrl(path).data.publicUrl;
}
