/**
 * Conversa com a API do GitHub para salvar o site.
 * O "login" do painel é um token pessoal do GitHub, guardado só neste aparelho.
 */
export interface Repo {
  owner: string;
  repo: string;
  branch: string;
  token: string;
}

const API = 'https://api.github.com';
export const DATA_PATH = 'dados/site.json';

export class GitHubError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

async function gh(repo: Repo, path: string, init: RequestInit = {}) {
  let res: Response;
  try {
    res = await fetch(`${API}${path}`, {
      ...init,
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${repo.token}`,
        'X-GitHub-Api-Version': '2022-11-28',
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      },
    });
  } catch {
    throw new GitHubError('Sem conexão com o GitHub. Verifique a internet e tente de novo.', 0);
  }
  if (!res.ok) {
    const msgs: Record<number, string> = {
      401: 'Token inválido ou expirado. Gere um novo token no GitHub.',
      403: 'Este token não tem permissão para alterar o repositório (precisa de "Contents: Read and write").',
      404: 'Repositório ou arquivo não encontrado. Confira o nome do repositório e as permissões do token.',
      409: 'O site foi alterado em outro lugar ao mesmo tempo. Recarregue o painel e tente de novo.',
      422: 'O GitHub recusou a alteração. Recarregue o painel e tente de novo.',
    };
    throw new GitHubError(msgs[res.status] || `Erro do GitHub (${res.status}).`, res.status);
  }
  return res.status === 204 ? null : res.json();
}

export function utf8ToBase64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  return bytesToBase64(bytes);
}
export function base64ToUtf8(b64: string): string {
  const bin = atob(b64.replace(/\s/g, ''));
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}
export function bytesToBase64(bytes: Uint8Array): string {
  let bin = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) bin += String.fromCharCode(...bytes.subarray(i, i + chunk));
  return btoa(bin);
}

/** Confere se o token funciona e pode gravar no repositório. */
export async function checkAccess(repo: Repo): Promise<void> {
  const info = await gh(repo, `/repos/${repo.owner}/${repo.repo}`);
  if (!info?.permissions?.push) throw new GitHubError('Este token só tem permissão de leitura. Ele precisa de "Contents: Read and write".', 403);
}

export async function loadData(repo: Repo): Promise<{ json: unknown; sha: string }> {
  const file = await gh(repo, `/repos/${repo.owner}/${repo.repo}/contents/${DATA_PATH}?ref=${encodeURIComponent(repo.branch)}&t=${Date.now()}`);
  return { json: JSON.parse(base64ToUtf8(file.content)), sha: file.sha };
}

export async function saveData(repo: Repo, json: unknown, sha: string, message: string): Promise<string> {
  const res = await gh(repo, `/repos/${repo.owner}/${repo.repo}/contents/${DATA_PATH}`, {
    method: 'PUT',
    body: JSON.stringify({ message: `Painel: ${message}`, content: utf8ToBase64(JSON.stringify(json, null, 2) + '\n'), sha, branch: repo.branch }),
  });
  return res.content.sha as string;
}

/** Reduz a imagem no próprio celular (máx. 1600 px, WebP). */
export async function compressImage(file: File, maxSide = 1600, quality = 0.84): Promise<Blob> {
  if (file.type === 'image/gif') return file;
  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return file;
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/webp', quality));
  return blob && blob.size < file.size ? blob : file;
}

/** Envia a imagem para a pasta imagens/uploads do repositório e devolve o caminho. */
export async function uploadImage(repo: Repo, file: File, folder: string): Promise<string> {
  if (!file.type.startsWith('image/')) throw new GitHubError('Envie apenas imagens (JPG, PNG ou WebP).', 0);
  if (file.size > 25 * 1024 * 1024) throw new GitHubError('Imagem muito grande (máx. 25 MB).', 0);
  const blob = await compressImage(file);
  const ext = blob.type === 'image/webp' ? 'webp' : (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
  const path = `imagens/uploads/${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
  const bytes = new Uint8Array(await blob.arrayBuffer());
  await gh(repo, `/repos/${repo.owner}/${repo.repo}/contents/${path}`, {
    method: 'PUT',
    body: JSON.stringify({ message: `Painel: nova imagem ${path}`, content: bytesToBase64(bytes), branch: repo.branch }),
  });
  return path;
}

/** Descobre usuário/repositório pelo endereço do GitHub Pages (ex.: fulano.github.io/meu-site). */
export function guessRepo(loc: Location, fallback: { owner: string; repo: string }) {
  const host = loc.hostname;
  if (host.endsWith('.github.io')) {
    const owner = host.replace('.github.io', '');
    const first = loc.pathname.split('/').filter(Boolean)[0];
    const repo = first && !first.endsWith('.html') ? first : `${owner}.github.io`;
    return { owner, repo };
  }
  return fallback;
}
