import { PublicError } from './providers';
export function sameOrigin(request: Request) {
  const origin = request.headers.get('origin');
  // Next's internal Request URL may use localhost while the browser uses 127.0.0.1.
  // Compare with the actual incoming Host, not the framework's internal hostname.
  if (origin) {
    let parsed: URL;
    try {parsed=new URL(origin);} catch {throw new PublicError('不允许跨站请求');}
    if (parsed.host !== request.headers.get('host') || !['http:','https:'].includes(parsed.protocol)) throw new PublicError('不允许跨站请求');
  }
}
export async function bodyJSON(request: Request) {
  const reader = request.body?.getReader();
  if (!reader) throw new PublicError('请求内容不能为空');
  let length = 0; const chunks: Uint8Array[] = [];
  while (true) {
    const {done,value} = await reader.read(); if (done) break;
    length += value.byteLength;
    if (length > 16000) { await reader.cancel(); throw new PublicError('输入内容过长'); }
    chunks.push(value);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw new PublicError('请求 JSON 无效'); }
}
