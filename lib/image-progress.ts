import type { Page } from './schema';
export function imageProgress(pages:Page[],ids:string[]|null){
 const selected=ids?pages.filter(p=>ids.includes(p.id)):[];
 const total=ids?.length||3;
 const ready=selected.filter(p=>p.imageStatus==='ready').length;
 const failed=selected.filter(p=>p.imageStatus==='error').length;
 return {ready,failed,total,percent:Math.round(ready/total*100)};
}
