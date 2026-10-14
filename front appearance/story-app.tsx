'use client';
import { useState, useEffect, useRef } from 'react';
import { Languages as LanguagesIcon, Moon, Stars, ArrowUpRight, ArrowLeft, ArrowRight, BookOpen, Sparkles, WandSparkles, Flag, Bug, X, Download, RefreshCw, Clock3, Check, LoaderCircle, Volume2, Square, Plus, ChevronDown, Leaf } from 'lucide-react';
import { localizeTree, translateUI, type Language } from '@/lib/i18n';
import { imageProgress } from '@/lib/image-progress';
import StarVoyage from './star-voyage';
import type { Story, Page, Action } from '@/lib/schema';

type Config = {textReady:boolean;imageReady:boolean;textModel:string;imageModel:string};
const seed='一只怕黑的小狐狸，戴着蓝色围巾，和一只温柔的猫头鹰一起寻找藏起来的月亮。';
const prompts=[['🌙','寻找月亮',seed],['🐋','云上的鲸鱼','一只迷路的小鲸鱼，游进了天空中的云海，寻找回家的星星。'],['🌟','种一颗星星','小兔子在花园里捡到一颗星星种子，决定陪它慢慢长大。']];
const seconds=(ms:number)=>`${(ms/1000).toFixed(1)}s`;

export default function StoryApp(){
  const [language,setLanguage]=useState<Language>('zh');
  const [translation,setTranslation]=useState<{source:Story;language:Language;story:Story}|null>(null);
  const [translationError,setTranslationError]=useState('');
  const [translationAttempt,setTranslationAttempt]=useState(0);
  const translationCache=useRef(new Map<string,Story>());
  const [config,setConfig]=useState<Config>();
  const [mode,setMode]=useState<'demo'|'live'>('demo');
  const [idea,setIdea]=useState(seed);
  const [style,setStyle]=useState('温暖水彩');
  const [customStyle,setCustomStyle]=useState('');
  const selectedStyle=style==='custom'?customStyle.trim():style;
  const [sourceStory,setStory]=useState<Story|null>(null);
  const [index,setIndex]=useState(0);
  const [busy,setBusy]=useState(false);
  const [stopped,setStopped]=useState(false);
  const [progressIds,setProgressIds]=useState<string[]|null>(null);
  const pendingStoryId=useRef<string|null>(null);
  const stoppedRef=useRef(false);
  const [status,setStatus]=useState('');
  const [error,setError]=useState('');
  const [debug,setDebug]=useState(false);
  const [tab,setTab]=useState('世界状态');
  const [custom,setCustom]=useState('');
  const [speaking,setSpeaking]=useState(false);
  const [hydrated,setHydrated]=useState(false);
  const [elapsed,setElapsed]=useState(0);
  const controller=useRef<AbortController|null>(null);
  const storyRef=useRef<Story|null>(null);
  storyRef.current=sourceStory;
  const needsTranslation=!!sourceStory && (language==='en' ? sourceStory.mode==='demo'||sourceStory.pages.some(p=>p.language!=='en') : sourceStory.language==='en'||sourceStory.pages.some(p=>p.language==='en'));
  const readyTranslation=translation?.source===sourceStory && translation.language===language;
  const translating=needsTranslation&&!readyTranslation;
  const story=readyTranslation?translation.story:sourceStory;
  const t=(text:string)=>translateUI(text,language);
  useEffect(()=>{
    try{const saved=localStorage.getItem('moonbook-language');if(saved==='en'||saved==='zh')setLanguage(saved);}catch{}
  },[]);
  useEffect(()=>{
    document.documentElement.lang=language==='en'?'en':'zh-CN';
    document.title=language==='en'?'Beyond the Dream · AI Picture Books':'梦之彼岸 · AI 睡前绘本';
    window.speechSynthesis?.cancel();setSpeaking(false);
    try{localStorage.setItem('moonbook-language',language);}catch{}
    setIdea(current=>{const known=prompts.find(p=>p[2]===current||translateUI(p[2],'en')===current);return known?translateUI(known[2],language):current;});
  },[language]);
  useEffect(()=>{
    if(!sourceStory||!needsTranslation||busy)return;
    const abort=new AbortController();
    const key=JSON.stringify([sourceStory,language]);
    setTranslationError('');
    const cached=translationCache.current.get(key);
    if(cached){setTranslation({source:sourceStory,language,story:cached});return;}
    fetch('/api/translate',{method:'POST',signal:abort.signal,headers:{'Content-Type':'application/json'},body:JSON.stringify({id:sourceStory.id,language})})
      .then(async r=>{if(!r.ok)throw new Error('translation');return r.json();})
      .then(data=>{if(abort.signal.aborted)return;if(translationCache.current.size>=20)translationCache.current.delete(translationCache.current.keys().next().value!);translationCache.current.set(key,data.story);setTranslation({source:sourceStory,language,story:data.story});})
      .catch(()=>{if(!abort.signal.aborted)setTranslationError('翻译失败，请重试。');});
    return()=>abort.abort();
  },[sourceStory,language,needsTranslation,busy,translationAttempt]);
  const page=story?.pages[index];
  const lastTiming=story?.timings.at(-1);
  const progress=imageProgress(sourceStory?.pages||[],progressIds);
  const retryPage=sourceStory?.pages.find(p=>(!progressIds||progressIds.includes(p.id))&&p.imageStatus!=='ready');
  function stopWaiting(){
    stoppedRef.current=true;setStopped(true);setError('');setStatus('已停止等待');
    controller.current?.abort();
  }

  useEffect(()=>{
    fetch('/api/config').then(r=>r.json()).then(setConfig).catch(()=>{});
    let stored:string|null=null;
    try{stored=localStorage.getItem('moonbook-id');}catch{}
    if(stored) fetch(`/api/story?id=${encodeURIComponent(stored)}`).then(r=>r.ok?r.json():null).then(data=>{
      if(data){setStory(data.story);setProgressIds(data.story.pages.slice(-3).map((p:Page)=>p.id));if(data.story.pages.some((p:Page)=>p.imageStatus!=='ready'))setStatus('已恢复服务器保存的进度。');setIndex(Math.max(0,data.story.pages.length-1));if(data.busy)setStatus('上次生成仍在进行，稍后点击恢复最新进度。');}
    }).catch(()=>{}).finally(()=>setHydrated(true));
    else setHydrated(true);
    return()=>{controller.current?.abort();window.speechSynthesis?.cancel();};
  },[]);
  useEffect(()=>{if(story){try{localStorage.setItem('moonbook-id',story.id);}catch{}}},[story]);
  useEffect(()=>{window.speechSynthesis?.cancel();setSpeaking(false);if(story?.id)window.scrollTo({top:0,behavior:'smooth'});},[index,story?.id]);
  useEffect(()=>{if(!debug)return;const onKey=(event:KeyboardEvent)=>{if(event.key==='Escape')setDebug(false);};window.addEventListener('keydown',onKey);return()=>window.removeEventListener('keydown',onKey);},[debug]);
  useEffect(()=>{if(!busy)return;setElapsed(0);const start=Date.now();const timer=setInterval(()=>setElapsed(Date.now()-start),500);return()=>clearInterval(timer);},[busy]);

  async function refresh(){
    const id=storyRef.current?.id||pendingStoryId.current;if(!id)return;
    try{const r=await fetch(`/api/story?id=${id}`);if(!r.ok)throw new Error('restore');{const data=await r.json();setStory(data.story);setProgressIds(data.story.pages.slice(-3).map((p:Page)=>p.id));setIndex(i=>Math.min(i,data.story.pages.length-1));setStopped(false);stoppedRef.current=false;setError('');setStatus(data.busy?'服务仍在生成，请稍后再次恢复。':'已恢复服务器保存的进度。');}}
    catch{setError('暂时无法恢复，请检查本地服务是否运行。');}
  }
  async function generate(action:Action){
    if(busy)return;
    if(action==='start'&&!selectedStyle){setError('请先描述你想要的画风。');return;}
    stoppedRef.current=false;setStopped(false);setProgressIds(null);setError('');setBusy(true);setStatus('正在打开今晚的故事…');
    const before=story?.pages.length || 0;
    const abort=new AbortController();controller.current=abort;
    let completed=false;
    try{
      const response=await fetch('/api/story',{method:'POST',signal:abort.signal,headers:{'Content-Type':'application/json'},body:JSON.stringify({
        action,id:action==='start'?undefined:story?.id,idea:action==='start'?idea:undefined,style:selectedStyle,mode,language,instruction:custom,
      })});
      if(!response.ok){const data=await response.json();throw new Error(data.error || '生成失败');}
      if(!response.body)throw new Error('浏览器不支持流式响应');
      const reader=response.body.getReader();const decoder=new TextDecoder();let buffer='';
      function consume(line:string){
        if(!line.trim()||stoppedRef.current)return;
        const event=JSON.parse(line);
        if(event.type==='status'){setStatus(event.message);if(event.id){pendingStoryId.current=event.id;try{localStorage.setItem('moonbook-id',event.id);}catch{}}}
        if(event.type==='story'){setProgressIds(event.story.pages.slice(action==='start'?0:before).map((p:Page)=>p.id));setStory(event.story);setIndex(action==='start'?0:before);}
        if(event.type==='page')setStory(current=>current?{...current,pages:current.pages.map(p=>p.id===event.page.id?event.page:p)}:current);
        if(event.type==='done'){setStory(event.story);setStatus('这一章已经准备好了。');setCustom('');completed=true;}
        if(event.type==='error')throw new Error(event.error);
      }
      while(true){const {value,done}=await reader.read();if(done)break;buffer+=decoder.decode(value,{stream:true});let newline;while((newline=buffer.indexOf('\n'))>=0){consume(buffer.slice(0,newline));buffer=buffer.slice(newline+1);}}
      buffer+=decoder.decode();if(buffer.trim())consume(buffer);
      if(!completed)throw new Error('连接提前结束。已保存的页面可通过“恢复进度”找回。');
    }catch(e){
      if(abort.signal.aborted&&stoppedRef.current){setStatus('已停止等待');setError('');}
      else{setStatus('');setError(e instanceof Error?e.message:'生成失败，请重试。');}
    }
    finally{if(controller.current===abort){setBusy(false);controller.current=null;}}
  }
  async function retryImage(p:Page){
    if(!sourceStory||busy)return;
    stoppedRef.current=false;setStopped(false);setProgressIds([p.id]);setBusy(true);setError('');setStatus(`正在重新绘制第 ${p.number} 页…`);
    const abort=new AbortController();controller.current=abort;
    try{
      const response=await fetch('/api/image',{method:'POST',signal:abort.signal,headers:{'Content-Type':'application/json'},body:JSON.stringify({id:sourceStory.id,pageId:p.id})});
      const data=await response.json();if(stoppedRef.current)return;if(!response.ok)throw new Error(data.error);
      setStory(s=>s?{...s,pages:s.pages.map(x=>x.id===data.page.id?data.page:x)}:s);
      if(data.page.imageError){setError(data.page.imageError);setStatus('插画尚未完成，可重试。');}else setStatus('插画已更新。');
    }catch(e){if(abort.signal.aborted&&stoppedRef.current){setStatus('已停止等待');setError('');}else{setStatus('');setError(e instanceof Error?e.message:'插画重试失败。');}}
    finally{if(controller.current===abort){setBusy(false);controller.current=null;}}
  }

  function download(){if(!story)return;const url=URL.createObjectURL(new Blob([JSON.stringify({...story,language},null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=`moonbook-${story.id}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  function narrate(){
    if(!page||translating)return;
    if(!window.speechSynthesis){setError('当前浏览器不支持朗读。');return;}
    if(speaking){window.speechSynthesis.cancel();setSpeaking(false);return;}
    const utterance=new SpeechSynthesisUtterance(page.text);utterance.lang=language==='en'?'en-US':'zh-CN';const voice=window.speechSynthesis.getVoices().find(v=>v.lang.toLowerCase().startsWith(language));if(voice)utterance.voice=voice;utterance.rate=language==='en'?0.85:0.8;utterance.onend=()=>setSpeaking(false);utterance.onerror=()=>setSpeaking(false);setSpeaking(true);window.speechSynthesis.speak(utterance);
  }
  function reset(){setStopped(false);stoppedRef.current=false;pendingStoryId.current=null;setProgressIds(null);setStory(null);setIndex(0);setError('');setStatus('');window.speechSynthesis?.cancel();setSpeaking(false);try{localStorage.removeItem('moonbook-id');}catch{}}

  return localizeTree(<div className="app-shell">
    <div className="night-sky" aria-hidden="true"><i/><i/><i/></div>
    <header className="topbar">
      <a className="brand" href="/" aria-label="梦之彼岸首页"><span className="brand-icon"><Moon size={23}/></span><span>梦之彼岸<small>BEYOND THE DREAM</small></span></a>
      <nav><div className="language-switch" role="group" aria-label={language==='en'?'Language':'语言'}><button type="button" aria-pressed={language==='zh'} disabled={busy} onClick={()=>setLanguage('zh')}>中文</button><button type="button" aria-pressed={language==='en'} disabled={busy} onClick={()=>setLanguage('en')}>EN</button></div><span className="quiet hidden-mobile">每个小小念头，都值得一个故事</span><button className={`icon-button ${debug?'active':''}`} onClick={()=>setDebug(!debug)} aria-label="打开 Debug 面板"><Bug size={17}/><span>创作幕后</span></button></nav>
    </header>
    <main>
      {(busy||status||stopped)&&<section className={`generation-progress ${stopped||progress.percent===100?'is-green':''}`} aria-label={t('插画生成进度')}>
        <div className="generation-progress-heading" role="status" aria-live="polite">{stopped||!busy?<Check size={20}/>:<LoaderCircle size={20} className="spin"/>}<strong>{stopped?'已停止等待':status}</strong>{busy&&!stopped&&<small>{seconds(elapsed)}</small>}</div>
        <div className="generation-progress-track" role="progressbar" aria-label={t('插画生成进度')} aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress.percent} aria-valuetext={language==='en'?`${progress.ready} of ${progress.total} illustrations ready${stopped?'. Stopped waiting':''}`:`已完成 ${progress.ready}/${progress.total} 张插画${stopped?'，已停止等待':''}`}><div style={{width:`${progress.percent}%`}}/></div>
        <div className="generation-progress-details"><span>{language==='en'?`Illustrations ready: ${progress.ready}/${progress.total}`:`插画已完成：${progress.ready}/${progress.total}`}</span><span>{progress.percent}%</span></div>
        {stopped&&<p>已完成的页面仍会保留，可恢复进度或重试插画。</p>}
        {!stopped&&progress.failed>0&&<p>{language==='en'?`${progress.failed} illustration(s) need a retry.`:`${progress.failed} 张插画尚未成功，可重试。`}</p>}
        <div className="generation-progress-actions">{busy&&!stopped?<button onClick={stopWaiting}>停止等待</button>:<>{(sourceStory||pendingStoryId.current)&&<button disabled={busy} onClick={refresh}><RefreshCw size={14}/>恢复进度</button>}{retryPage&&<button disabled={busy} onClick={()=>retryImage(retryPage)}><RefreshCw size={14}/>重试插画</button>}</>}</div>
      </section>}

      {story&&translating&&<section className="translation-notice" role="status" aria-live="polite"><LanguagesIcon/><h2>{translationError||'正在翻译绘本…'}</h2>{translationError&&<button className="primary" onClick={()=>setTranslationAttempt(n=>n+1)}>重试翻译</button>}<p>{language==='en'?'Your illustrations and story progress stay unchanged.':'插画与剧情进度保持不变。'}</p></section>}
      {!story && <>
        <section className="hero">
          <div className="hero-copy"><div className="eyebrow"><span/> 生命因何而沉睡？</div><h1>今夜，驶向<br/>梦中的<span>璀璨群星。</span><Stars className="title-stars" size={33}/></h1><p>一小段灵感，一场温柔的冒险。<br/>让我们陪你天马行空，翻成一页页绘本。</p><div className="hero-note"><span className="tiny-moon">☾</span> 故事会记得，每一次小小的勇敢。</div></div>
          <div className="hero-art"><StarVoyage language={language}/><div className="art-caption"><span>DESTINATION · THE STARS</span><b>把今夜，交给想象。</b><Stars size={19}/></div><span className="art-corner">A VOYAGE BEYOND THE DREAM</span></div>
        </section>
        <section className="creation-panel">
          <div className="section-heading"><div><span className="section-number">01</span><h2>你的故事，从哪里开始？</h2></div><span className="quiet">写一句话就好，剩下的交给想象力</span></div>
          <label className="sr-only" htmlFor="idea">故事灵感</label><textarea id="idea" value={idea} onChange={e=>setIdea(e.target.value)} maxLength={1000} placeholder="比如，一只怕黑的小狐狸，决定出发寻找月亮…"/>
          <div className="prompt-row"><span>试试这些灵感</span>{prompts.map(([emoji,name,text])=><button key={name} onClick={()=>setIdea(t(text))}><span>{emoji}</span>{name}<ArrowUpRight size={12}/></button>)}<small>{idea.length}/1000</small></div>
          <div className="creation-bottom"><div><label className="field-label" id="style-label">给故事一种颜色</label><div className="styles" role="group" aria-labelledby="style-label">{['温暖水彩','梦幻剪纸','柔软蜡笔','custom'].map((s,i)=><button key={s} onClick={()=>setStyle(s)} className={style===s?'selected':''} aria-pressed={style===s}><span className={`swatch swatch-${i}`}/>{s==='custom'?'自定义画风':s}{style===s&&<Check size={13}/>}</button>)}</div>{style==='custom'&&<div className="custom-style-field"><label htmlFor="custom-style">描述你的画风</label><textarea id="custom-style" value={customStyle} onChange={e=>setCustomStyle(e.target.value)} maxLength={200} placeholder="例如：彩色铅笔手绘，奶油色纸张，柔和的蓝紫色，像童年的故事书"/><div><small>{customStyle.length}/200</small><span>画风会沿用到后续章节；离线样例仍使用固定示意插画。</span></div></div>}</div><div className="start-controls"><label className="mode-select"><select aria-label="生成模式" value={mode} onChange={e=>setMode(e.target.value as 'demo'|'live')}><option value="demo">离线样例 · 不调用 API</option><option value="live">真实 AI · 使用 API</option></select><ChevronDown size={14}/></label><button className="primary" disabled={busy||!hydrated||idea.trim().length<3||!selectedStyle} onClick={()=>generate('start')}>{busy?<LoaderCircle className="spin" size={18}/>:<Sparkles size={18}/>} {busy?'正在酝酿故事':'生成我的绘本'}<ArrowRight size={18}/></button></div></div>
          <p className="mode-note">{mode==='demo'?'离线样例演示固定的「栗栗与月亮」故事和三张示意插画；自选主题、画风和自由改写在真实 AI 模式生效。':`故事 ${config?.textReady?'已配置':'待配置 OPENAI_API_KEY'} · 插画 ${config?.imageReady?'已配置':'待配置 OPENOX_API_KEY'} · 每轮 3 页，将调用付费模型。`}</p>
        </section>
        <div className="features"><span><BookOpen size={17}/> 欢迎使用梦之彼岸，愿您有一段难忘的体验！</span><span><Leaf size={17}/> 让我们在想象的浩瀚里触摸星穹</span><span><Moon size={17}/> 给睡前，多一点温柔</span></div>
      </>}
      {story&&!translating&&<section className="reading-space">
        <div className="book-top"><div><div className="eyebrow">{story.mode==='demo'?'离线样例 · 固定故事与示意插画':'AI 原创绘本'}<span className="dot"/>{story.style}</div><h1>{story.title}</h1></div><div className="book-actions"><button className="icon-button" onClick={download}><Download size={16}/>导出故事</button><button className="icon-button" disabled={busy} onClick={reset}><Plus size={16}/>新故事</button></div></div>
        {page&&<div className="storybook" key={page.id}>
          <div className="illustration">
            {page.imageUrl?<img src={page.imageUrl} alt={page.heading+'：'+page.scene} onError={()=>setError('图片链接加载失败。服务商 URL 可能已过期；本地 base64 图片不会受此影响。')}/>:<div className="image-placeholder"><Moon size={42}/><span>可以先读故事，再等一会儿</span><small>{stopped?'已停止等待':busy?'画笔正在追赶想象力…':'这一页的插画还没准备好'}</small></div>}
            <span className="image-label">{story.mode==='demo'?'示意插画 / DEMO ART':`ILLUSTRATION ${String(page.number).padStart(2,'0')}`}</span>
            {page.imageStatus!=='ready'&&!busy&&<button className="image-retry" onClick={()=>retryImage(page)}><RefreshCw size={15}/> {page.imageStatus==='error'?'重试插画':'生成插画'}</button>}
          </div>
          <article className="page-copy"><div className="page-eyebrow">CHAPTER {String(Math.ceil(page.number/3)).padStart(2,'0')} <span>✦</span> PAGE {String(page.number).padStart(2,'0')}</div><h2>{page.heading}</h2><p>{page.text}</p>{page.imageError&&<small className="inline-error">{page.imageError}</small>}<div className="page-bottom"><button className="listen-button" onClick={narrate}>{speaking?<Square size={15}/>:<Volume2 size={17}/>} {speaking?'停止朗读':'读给我听'}</button><span className="page-flower">✳</span></div></article>
        </div>}
        <div className="pagination"><button aria-label="上一页" disabled={index===0} onClick={()=>setIndex(index-1)}><ArrowLeft size={18}/></button><div className="page-dots">{story.pages.map((p,i)=><button aria-label={`第 ${i+1} 页`} aria-current={i===index?'page':undefined} className={i===index?'current':''} key={p.id} onClick={()=>setIndex(i)}>{i===index?`${i+1} / ${story.pages.length}`:''}</button>)}</div><button aria-label="下一页" disabled={index===story.pages.length-1} onClick={()=>setIndex(index+1)}><ArrowRight size={18}/></button></div>
        {!story.ended&&story.pages.length<30?<section className="continuation"><div><span className="eyebrow">THE STORY GOES ON</span><h2>下一页，让什么发生？</h2></div><div className="continue-actions"><button disabled={busy} onClick={()=>generate('continue')}><ArrowRight size={17}/>继续冒险</button><button disabled={busy} onClick={()=>generate('twist')}><WandSparkles size={17}/>来个小转折</button><button disabled={busy} onClick={()=>generate('ending')}><Flag size={17}/>温柔地说晚安</button></div><form onSubmit={e=>{e.preventDefault();generate('custom');}}><input aria-label="自定义剧情" placeholder={story.mode==='demo'?'自由改写需要在新故事中选择真实 AI 模式':'或者，让你的想法加入故事…'} value={custom} onChange={e=>setCustom(e.target.value)} maxLength={500} disabled={busy||story.mode==='demo'}/><button aria-label="生成自定义剧情" disabled={busy||!custom.trim()||story.mode==='demo'}><ArrowUpRight size={20}/></button></form></section>:<div className="ending-note"><Moon size={23}/><h2>{story.ended?'故事落幕了，想象还没有。':'这本绘本已经写满了。'}</h2><p>把今晚的温柔收藏好，我们下个故事见。</p><button className="primary" onClick={reset} disabled={busy}>开始一个新故事<ArrowRight size={16}/></button></div>}
        <div className="metrics"><span><Clock3 size={14}/>文字 {lastTiming?seconds(lastTiming.textMs):'—'}</span><span>本轮总耗时 {lastTiming?.totalMs?seconds(lastTiming.totalMs):'生成中'}</span><span>世界状态 v{story.state.revision}</span><button onClick={()=>setDebug(true)}>查看创作幕后 <ArrowUpRight size={12}/></button></div>
      </section>}

      {error&&<div className="error-box" role="alert"><span>{language==='en'&&/[\u3400-\u9fff]/.test(t(error))?'The request could not finish. Check your connection, API settings and account balance, then retry.':error}</span><button onClick={()=>setError('')} aria-label="关闭提示"><X size={16}/></button></div>}
    </main>
    <footer><span><Moon size={13}/> 梦之彼岸</span><span>MADE FOR LITTLE DREAMERS</span><span>晚安，愿你有一个好梦。</span></footer>
    {debug&&!translating&&<div className="debug-overlay" onClick={()=>setDebug(false)}><aside className="debug-panel" role="dialog" aria-modal="true" aria-label="创作幕后 Debug" onClick={e=>e.stopPropagation()}><div className="debug-heading"><div><span className="eyebrow">BEHIND THE PAGES</span><h2>创作幕后 <small>Debug</small></h2></div><button className="icon-button" onClick={()=>setDebug(false)} aria-label="关闭幕后"><X size={20}/></button></div><p>看见故事如何记住世界。事实、历史和计划分别保存；人物外观在创建后固定。</p><div className="debug-tabs">{['世界状态','人物设定','本页补丁','生成计时'].map(t=><button className={tab===t?'selected':''} key={t} onClick={()=>setTab(t)}>{t}</button>)}</div>{!story?<div className="debug-empty">先生成一本绘本，即可查看状态和调用耗时。<br/>故事接口：{config?.textReady?'已配置':'未配置'}<br/>插画接口：{config?.imageReady?'已配置':'未配置'}</div>:<>
      {tab==='世界状态'&&<><h3>当前事实 · State v{story.state.revision}</h3><div className="fact-list">{Object.entries(story.state.facts).map(([key,value])=><div key={key}><code>{key}</code><b>{value}</b></div>)}</div><h3>已经发生 · History</h3><ol className="history-list">{story.state.history.map(h=><li key={h.page}><small>P{h.page}</small>{h.event}</li>)}</ol><h3>尚未发生 · Plan</h3><ul>{story.state.plan.length?story.state.plan.map((p,i)=><li key={i}>{p}</li>):<li>故事已结束，暂无后续计划</li>}</ul></>}
      {tab==='人物设定'&&story.characters.map(c=><div className="character-card" key={c.id}><span>不可变设定 · {c.id}</span><h3>{c.name}</h3><p>{c.appearance}</p><small>{c.personality}</small></div>)}
      {tab==='本页补丁'&&page&&<><h3>第 {page.number} 页 · State Patch</h3><pre>{JSON.stringify(page.patch,null,2)}</pre><h3>这一页结束时的事实</h3><pre>{JSON.stringify(page.state.facts,null,2)}</pre><details><summary>图片提示词</summary><pre>{page.imagePrompt}</pre></details><p>程序校验补丁前置值与角色 ID；自然语言及图片的语义一致性仍需人工检查。</p></>}
      {tab==='生成计时'&&<><p>记录实际服务耗时；离线样例耗时仅用于展示流程。</p>{story.timings.map(t=><div className="timing-card" key={t.round}><h3>第 {t.round} 轮</h3><div><span>文字 + 校验</span><b>{seconds(t.textMs)}</b></div><div><span>整轮</span><b>{t.totalMs?seconds(t.totalMs):'生成中'}</b></div><div><span>状态修复</span><b>{t.repaired?'触发一次':'未触发'}</b></div>{t.imageMs.map((ms,i)=><div key={i}><span>插画 {i+1}</span><b>{seconds(ms)}</b></div>)}</div>)}<h3>模型</h3><pre>{JSON.stringify({mode:story.mode,textModel:config?.textModel,imageModel:config?.imageModel},null,2)}</pre></>}
    </>}</aside></div>}
  </div>,language);
}
