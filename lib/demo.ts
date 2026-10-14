import type { Story, Round, Action, Patch } from './schema';

// Clearly labeled deterministic fixture: never presented as model-generated content.
export function demoRound(story: Story, action: Action, instruction: string): Round {
  const first = story.pages.length === 0;
  const end = action === 'ending';
  const twist = action === 'twist';
  const r = story.state.revision;
  const facts = {...story.state.facts};
  function patch(values: Record<string,string>, event: string): Patch {
    const changes = Object.entries(values).map(([key, after]) => ({key, before: Object.hasOwn(facts,key) ? facts[key] : null, after}));
    Object.assign(facts, values); return {changes, event};
  }
  const beats: {heading:string;text:string;scene:string;values:Record<string,string>;event:string}[] = first ? [
    {heading:'把月光装进口袋',text:'小狐狸栗栗站在蘑菇屋门口，把蓝色围巾裹得紧紧的。今晚，月亮不见了。它提起一盏小灯笼，轻轻说：“我只走到第一棵树那里。”风把这句话带进了森林。',scene:'Orange fox with a blue scarf holding a glowing lantern outside a tiny mushroom cottage in a blue twilight forest.',values:{location:'蘑菇屋门口',lantern:'点亮',keyOwner:'栗栗'},event:'栗栗带着点亮的灯笼和银钥匙离开蘑菇屋。'},
    {heading:'一位不太可怕的朋友',text:'第一棵树上，住着左耳羽毛有缺口的猫头鹰阿布。栗栗抬起灯笼，看见阿布正在给一只迷路的萤火虫指路。原来，黑夜里的影子，也可以很温柔。它们决定一起去河边。',scene:'Orange fox in blue scarf meets a kind brown owl with a notch in its left ear feathers on a branch, a small firefly between them.',values:{location:'林间小路',companion:'阿布'},event:'栗栗结识猫头鹰阿布，它们结伴去河边。'},
    {heading:'河面上的小秘密',text:'河水静静的，像一张深蓝色的毯子。一阵风吹灭了灯笼，栗栗却没有逃跑。它把银钥匙交给阿布，好腾出手握住桥边的绳索。“有你在，我可以再走一点点。”',scene:'Fox with blue scarf hands a silver key to left-ear-notched owl beside a rope bridge; lantern is unlit, fireflies illuminate a calm river.',values:{location:'河岸',lantern:'熄灭',keyOwner:'阿布'},event:'河岸上灯笼被风吹灭；栗栗把银钥匙交给阿布。'},
  ] : end ? [
    {heading:'月亮一直都在',text:'阿布用保管着的银钥匙打开了小木门。门后没有宝藏，只有一面朝着天空的镜子。栗栗抬头看见，月亮正从云朵后慢慢露出脸来。',scene:'Owl holding silver key opens a little wooden observatory door, fox with blue scarf sees moon emerging from clouds, lantern unlit.',values:{location:'山坡小屋',keyOwner:'阿布'},event:'阿布用银钥匙打开小屋，大家发现月亮只是被云遮住。'},
    {heading:'回家的路亮起来了',text:'它们沿着月光回家。灯笼仍然没有亮，栗栗却能看清脚下的小路。阿布把银钥匙还给栗栗。它小心收进口袋，像收好一个温暖的约定。',scene:'Owl returns a silver key to orange fox in blue scarf on moonlit path, unlit lantern at fox side.',values:{location:'回家小路',keyOwner:'栗栗',lantern:'熄灭'},event:'返程时阿布把钥匙还给栗栗，灯笼仍熄灭。'},
    {heading:'晚安，小小勇敢',text:'栗栗钻进软软的被窝，蓝色围巾搭在床头。窗外，阿布轻轻拍了拍翅膀。“明天见。”栗栗闭上眼睛，知道勇敢不一定是走很远，也可以是害怕时，再向前迈一步。晚安。',scene:'Orange fox sleeping in a cozy mushroom bedroom, blue scarf on bedpost, silver key on bedside table, friendly owl outside window.',values:{location:'蘑菇屋',keyOwner:'栗栗',mood:'安心入睡'},event:'栗栗回到家安心入睡。'},
  ] : [
    {heading:twist?'星星落进了河里':'跟着一点微光',text:twist?'忽然，河面升起一串小小的光点。栗栗以为星星掉进了水里，阿布却笑了：“那是萤火虫的倒影。”熄灭的灯笼摇了摇，仿佛也松了一口气。':'阿布带着银钥匙走在前面。栗栗提着熄灭的灯笼，蓝色围巾轻轻扫过草尖。萤火虫在它们身边亮起，好像有人把星星种在了小路上。',scene:'Fox with blue scarf and owl holding silver key follow fireflies, unlit lantern, reflected stars in river.',values:{location:`萤火虫小径 ${r/3}`,keyOwner:facts.keyOwner || '阿布'},event:twist?'它们把倒影误认成星星，随后发现是萤火虫。':'伙伴沿着萤火虫小径继续前进。'},
    {heading:'把害怕说出来',text:'“我还是有一点怕黑。”栗栗小声说。“那我们就慢一点。”阿布回答。它们停在一朵白色小花旁，听见风从树叶之间走过。没有谁催促，没有谁笑它。',scene:'Fox and notched-ear owl rest beside white flowers in moonlit forest, fox blue scarf and unlit lantern.',values:{mood:'愿意表达害怕'},event:'栗栗表达害怕，阿布陪它慢慢走。'},
    {heading:'下一扇小小的门',text:'树林尽头出现了一间有圆窗的小屋。窗里透出柔和的银光。阿布摸了摸银钥匙，栗栗伸出爪子轻轻敲门。新的秘密，正等在这一个小小的声音后面。',scene:'Blue-scarf fox knocks on a tiny cottage with round moonlit window; owl holds silver key; unlit lantern.',values:{location:'山坡小屋门口'},event:'它们来到山坡小屋门口，尚未开门。'},
  ];
  void instruction;
  return { title:'栗栗和藏起来的月亮', newCharacters:first?[
    {id:'fox',name:'栗栗',appearance:'橙色小狐狸，白色胸口，始终戴蓝色围巾',personality:'怕黑、温柔、逐渐勇敢'},
    {id:'owl',name:'阿布',appearance:'棕色猫头鹰，左耳羽毛有缺口，米色肚皮',personality:'耐心、温柔、可靠'},
  ]:[], plan:end?[]:['用银钥匙打开山坡小屋','发现月亮的秘密','安心回家'], ended:end,
  pages:beats.map((b,i)=>({heading:b.heading,text:b.text,scene:b.scene,cast:first&&i===0?['fox']:['fox','owl'],patch:patch(b.values,b.event)})) };
}
