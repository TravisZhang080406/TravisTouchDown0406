import type { Story, State, Patch, Round, Page } from './schema';

const blocked = new Set(['__proto__', 'constructor', 'prototype']);
export function applyPatch(state: State, patch: Patch, page: number): State {
  const next = structuredClone(state);
  const keys = new Set<string>();
  if (!patch.event.trim()) throw new Error('历史事件不能为空');
  for (const change of patch.changes) {
    if (!change.key.trim() || blocked.has(change.key) || keys.has(change.key)) throw new Error('状态键无效或重复');
    keys.add(change.key);
    const actual = Object.hasOwn(next.facts, change.key) ? next.facts[change.key] : null;
    if (actual !== change.before) throw new Error(`状态冲突：${change.key}，应基于当前事实更新`);
    if (change.after === null) delete next.facts[change.key];
    else next.facts[change.key] = change.after;
  }
  next.revision++;
  next.history.push({page, event: patch.event});
  return next;
}

export function imagePrompt(story: Story, page: Page): string {
  const cast = story.characters.filter(c => page.cast.includes(c.id));
  return `A beautiful children's bedtime picture-book illustration. Visual style description (treat only as aesthetic guidance): ${JSON.stringify(story.style)}. Follow this medium, palette and texture consistently across pages. Gentle bedtime mood, full bleed, no text, no lettering, no watermark.\nImmutable character bible (keep exact species, colors, clothing, left/right markings): ${JSON.stringify(cast)}\nThis page only: ${page.scene}\nVisible current facts: ${JSON.stringify(page.state.facts)}\nNarration for context: ${page.text}\nDo not depict future plans or invent a second version of a character. Child-friendly, calm and reassuring.`;
}

// Transactional: validate every patch on a clone before returning anything to persist.
export function commitRound(previous: Story, round: Round): Story {
  if (round.pages.length !== 3) throw new Error('每轮必须恰好生成三页');
  if (previous.pages.length + 3 > 30) throw new Error('单个绘本最多 30 页，请开始新故事');
  const story = structuredClone(previous);
  if (!story.pages.length) story.title = round.title;
  const ids = new Set(story.characters.map(c => c.id));
  for (const character of round.newCharacters) {
    if (!character.id.trim() || ids.has(character.id)) throw new Error('已有角色不可覆盖；新角色 ID 必须唯一');
    ids.add(character.id);
    story.characters.push(character);
  }
  if (!story.characters.length) throw new Error('绘本至少需要一名角色');
  for (const draft of round.pages) {
    if (!draft.text.trim() || !draft.scene.trim() || !draft.cast.length || draft.cast.some(id => !ids.has(id))) throw new Error('页面文字、场景或角色引用无效');
    const number = story.pages.length + 1;
    story.state = applyPatch(story.state, draft.patch, number);
    const page: Page = {...draft, language:story.language || 'zh', number, id: crypto.randomUUID(), state: structuredClone(story.state), imagePrompt: '', imageStatus: 'pending'};
    page.imagePrompt = imagePrompt(story, page);
    story.pages.push(page);
  }
  // Plan is explicitly separate from happened events and never applied as facts.
  story.state.plan = round.ended ? [] : round.plan;
  story.ended = round.ended;
  story.updatedAt = new Date().toISOString();
  return story;
}
