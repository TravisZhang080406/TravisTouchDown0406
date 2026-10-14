import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {title:'梦之彼岸 · AI 睡前绘本',description:'把一个小小的念头，变成今晚的绘本。'};
export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
