import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { dataDir } from '@/lib/store';
export const runtime = 'nodejs';
export async function GET(request:Request) {
  const file = new URL(request.url).searchParams.get('file') || '';
  if (!/^[0-9a-f-]{36}-[0-9a-f-]{36}\.img$/.test(file)) return new Response('Not found',{status:404});
  try {
    const bytes = await readFile(path.join(dataDir(),'images',file));
    const type = bytes[0]===0xff ? 'image/jpeg' : bytes.toString('ascii',0,4)==='RIFF' ? 'image/webp' : 'image/png';
    return new Response(bytes,{headers:{'Content-Type':type,'Cache-Control':'private, max-age=31536000','X-Content-Type-Options':'nosniff'}});
  } catch {return new Response('Not found',{status:404});}
}
