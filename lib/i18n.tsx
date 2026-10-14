import { Children, cloneElement, isValidElement, type ReactNode, type ReactElement } from 'react';
export type Language = 'zh' | 'en';
// Display-only translations: internal state keys and patch values are never changed.
export const english: Record<string,string> = {
'已停止等待':'Stopped waiting','插画生成进度':'Illustration progress','已完成的页面仍会保留，可恢复进度或重试插画。':'Completed pages are kept. Restore progress or retry an illustration.','插画尚未完成，可重试。':'The illustration is not ready. You can retry.',
'自定义画风':'Custom style','描述你的画风':'Describe your visual style','请先描述你想要的画风。':'Please describe your visual style first.',
'例如：彩色铅笔手绘，奶油色纸张，柔和的蓝紫色，像童年的故事书':'For example: colored pencil on cream paper, soft blue and violet tones, like a childhood storybook',
'画风会沿用到后续章节；离线样例仍使用固定示意插画。':'This style carries into future chapters. Offline samples still use fixed illustrations.',

'梦之彼岸':'Beyond the Dream','梦之彼岸首页':'Beyond the Dream home','每个小小念头，都值得一个故事':'Every little idea deserves a story',
'打开 Debug 面板':'Open behind the pages','创作幕后':'Behind the pages','生命因何而沉睡？':'Why does life fall into slumber?',
'今夜，驶向':'Tonight, sail toward','梦中的':'the dreams of ','璀璨群星。':'shining stars.',
'一小段灵感，一场温柔的冒险。':'A little spark. A gentle adventure.','让我们陪你天马行空，翻成一页页绘本。':'Let your imagination wander with us, one picture-book page at a time.',
'故事会记得，每一次小小的勇敢。':'The story remembers every little act of courage.','把今夜，交给想象。':'Let imagination take the helm tonight.',
'你的故事，从哪里开始？':'Where does your story begin?','写一句话就好，剩下的交给想象力':'One sentence is enough. Imagination will do the rest.',
'故事灵感':'Story idea','比如，一只怕黑的小狐狸，决定出发寻找月亮…':'A little fox afraid of the dark sets out to find the moon…',
'试试这些灵感':'Try a little inspiration','寻找月亮':'Find the moon','云上的鲸鱼':'A whale in the clouds','种一颗星星':'Plant a star',
'给故事一种颜色':'Choose a story palette','温暖水彩':'Warm watercolor','梦幻剪纸':'Dreamy paper cut','柔软蜡笔':'Soft crayon',
'生成模式':'Generation mode','离线样例 · 不调用 API':'Offline sample · No API calls','真实 AI · 使用 API':'Live AI · Uses API',
'正在酝酿故事':'Dreaming up your story','生成我的绘本':'Create my picture book',
'离线样例演示固定的「栗栗与月亮」故事和三张示意插画；自选主题、画风和自由改写在真实 AI 模式生效。':'The offline sample uses a fixed story and three sample illustrations. Choose Live AI for custom themes, styles and story directions.',
'欢迎使用梦之彼岸，愿您有一段难忘的体验！':'Welcome to Beyond the Dream. May your journey be unforgettable!',
'让我们在想象的浩瀚里触摸星穹':'Let us reach the stars in the vastness of imagination','给睡前，多一点温柔':'A little more tenderness before bedtime',
'离线样例 · 固定故事与示意插画':'Offline sample · Fixed story and sample art','AI 原创绘本':'AI-created picture book',
'导出故事':'Export story','新故事':'New story','画笔正在追赶想象力…':'The brush is catching up with your imagination…','这一页的插画还没准备好':'This illustration is not ready yet','可以先读故事，再等一会儿':'Read the story while the illustration arrives',
'示意插画 / DEMO ART':'SAMPLE ILLUSTRATION','重试插画':'Retry illustration','生成插画':'Create illustration','停止朗读':'Stop reading','读给我听':'Read to me','上一页':'Previous page','下一页':'Next page',
'下一页，让什么发生？':'What happens on the next page?','继续冒险':'Continue the adventure','来个小转折':'Add a little twist','温柔地说晚安':'A gentle goodnight',
'自定义剧情':'Your story direction','生成自定义剧情':'Create your story direction','自由改写需要在新故事中选择真实 AI 模式':'Start a new story in Live AI mode for custom directions','或者，让你的想法加入故事…':'Or add your own idea to the story…',
'故事落幕了，想象还没有。':'The story ends. Imagination goes on.','这本绘本已经写满了。':'This picture book is full.','把今晚的温柔收藏好，我们下个故事见。':'Keep tonight’s tenderness. See you in the next story.','开始一个新故事':'Begin a new story',
'文字':'Text','本轮总耗时':'Round duration','世界状态 v':'World state v','查看创作幕后':'Look behind the pages','生成中':'Generating','停止等待':'Stop waiting','恢复进度':'Restore progress','关闭提示':'Dismiss message','晚安，愿你有一个好梦。':'Goodnight. May your dreams be kind.',
'创作幕后 Debug':'Behind the pages · Debug','关闭幕后':'Close behind the pages','看见故事如何记住世界。事实、历史和计划分别保存；人物外观在创建后固定。':'See how the story remembers its world. Facts, history and plans are stored separately; character appearances remain fixed.',
'世界状态':'World state','人物设定':'Characters','本页补丁':'Page patch','生成计时':'Timing','先生成一本绘本，即可查看状态和调用耗时。':'Create a picture book to inspect its state and timing.','故事接口：':'Story service: ','插画接口：':'Illustration service: ','已配置':'Ready','未配置':'Not configured',
'当前事实 · State v':'Current facts · State v','已经发生 · History':'What happened · History','尚未发生 · Plan':'What comes next · Plan','故事已结束，暂无后续计划':'The story has ended; there are no further plans','不可变设定 ·':'Fixed character ·',
'第':'No.','页 · State Patch':'Page · State Patch','这一页结束时的事实':'Facts at the end of this page','图片提示词':'Illustration prompt','程序校验补丁前置值与角色 ID；自然语言及图片的语义一致性仍需人工检查。':'The program validates patch preconditions and character IDs. Text and image consistency still needs human review.',
'记录实际服务耗时；离线样例耗时仅用于展示流程。':'Actual service durations are recorded. Offline sample timing only demonstrates the workflow.','轮':'Round','文字 + 校验':'Text + validation','整轮':'Whole round','状态修复':'State repair','触发一次':'Triggered once','未触发':'Not triggered','插画':'Illustration','模型':'Models',
'正在打开今晚的故事…':'Opening tonight’s story…','这一章已经准备好了。':'This chapter is ready.','生成失败':'Generation failed','浏览器不支持流式响应':'This browser does not support streaming responses.','已恢复服务器保存的进度。':'Saved progress restored.','服务仍在生成，请稍后再次恢复。':'Generation is still running. Restore progress again shortly.',
'上次生成仍在进行，稍后点击恢复最新进度。':'The last generation is still running. Restore progress shortly.','暂时无法恢复，请检查本地服务是否运行。':'Could not restore progress. Check that the local server is running.',
'连接提前结束。已保存的页面可通过“恢复进度”找回。':'The connection ended early. Use Restore progress to retrieve saved pages.','已停止等待。已完成的页面仍会保留，可恢复进度或重试插画。':'Stopped waiting. Completed pages are saved; restore progress or retry illustrations.','生成失败，请重试。':'Generation failed. Please try again.','插画已更新。':'Illustration updated.','插画重试失败。':'Could not retry the illustration.','当前浏览器不支持朗读。':'This browser does not support read-aloud.',
'图片链接加载失败。服务商 URL 可能已过期；本地 base64 图片不会受此影响。':'The illustration could not load. The provider’s image link may have expired.',
'正在规划三页故事，并核对角色与已有事实…':'Planning three pages and checking characters and existing facts…','发现状态冲突，正在修复本轮内容…':'A state conflict was found. Repairing this chapter…',
'正在翻译绘本…':'Translating your picture book…','翻译失败，请重试。':'Translation failed. Please try again.','重试翻译':'Retry translation',
'一艘金色帆船在星海中驶向发光的月亮':'A golden sailboat sails across a sea of stars toward a glowing moon',
'一只怕黑的小狐狸，戴着蓝色围巾，和一只温柔的猫头鹰一起寻找藏起来的月亮。':'A little fox afraid of the dark, wearing a blue scarf, searches for the hidden moon with a gentle owl.',
'一只迷路的小鲸鱼，游进了天空中的云海，寻找回家的星星。':'A lost little whale swims through a sea of clouds, searching for the star that will guide it home.',
'小兔子在花园里捡到一颗星星种子，决定陪它慢慢长大。':'A little rabbit finds a star seed in the garden and decides to help it grow.',
};
export function translateUI(text:string, language:Language):string {
 if(language==='zh') {
  const labels:Record<string,string>={'BEYOND THE DREAM':'梦之彼岸','DESTINATION · THE STARS':'目的地 · 璀璨群星','A VOYAGE BEYOND THE DREAM':'驶向梦之彼岸','MADE FOR LITTLE DREAMERS':'献给每一个小小梦想家','THE STORY GOES ON':'故事仍在继续','BEHIND THE PAGES':'绘本背后的秘密','CHAPTER':'章节','PAGE':'页码'};
  const key=text.trim();return labels[key]?text.replace(key,labels[key]):text;
 }
 const key=text.trim();
 if(english[key]) return text.replace(key,english[key]);
 if(!/[\u3400-\u9fff]/.test(text)) return text;
 let m=key.match(/^第 (\d+) 页$/); if(m)return `Page ${m[1]}`;
 m=key.match(/^正在重新绘制第 (\d+) 页…$/);if(m)return `Redrawing page ${m[1]}…`;
 m=key.match(/^文字已就绪，正在绘制第 (\d+) 页插画…$/);if(m)return `The text is ready. Illustrating page ${m[1]}…`;
 if(key.startsWith('故事 ')&&key.includes('OPENAI_API_KEY') || key.startsWith('故事 ')&&key.includes('每轮 3 页')) return key.replace('故事 ','Story ').replaceAll('已配置','Ready').replace('待配置 OPENAI_API_KEY','Set OPENAI_API_KEY').replace('待配置 OPENOX_API_KEY','Set OPENOX_API_KEY').replace('插画 ','Illustrations ').replace('每轮 3 页，将调用付费模型。','3 pages per round. Uses paid models.');
 return text;
}
// Translate native text and accessibility labels without changing form values or handlers.
export function localizeTree(node:ReactNode, language:Language):ReactNode {
 if(typeof node==='string') return translateUI(node,language);
 if(Array.isArray(node)) return Children.map(node,n=>localizeTree(n,language));
 if(!isValidElement(node)) return node;
 const element=node as ReactElement<Record<string,unknown>>;
 const props:Record<string,unknown>={};
 for(const key of ['aria-label','title','placeholder','alt']) if(typeof element.props[key]==='string')props[key]=translateUI(element.props[key] as string,language);
 if(element.props.children!==undefined)props.children=localizeTree(element.props.children as ReactNode,language);
 return cloneElement(element,props);
}
