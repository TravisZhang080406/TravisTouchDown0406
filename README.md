# 梦之彼岸 · Beyond the Dream

一个支持持续创作、中英文切换和朗读的 AI 睡前绘本 Web 应用。使用 Next.js、React、TypeScript 和 Tailwind CSS；面向本地运行和比赛演示，不需要数据库或登录系统。

**第一次使用请先阅读 [操作须知](操作须知.md)。本仓库不提供 API 密钥，也不包含生成的故事和图片。**

## 快速启动：不填密钥也能体验

安装 Node.js 22 或更新版本，在项目根目录打开终端：

```sh
npm install
cp .env.example .env.local
npm run dev
```

Windows 使用 `copy .env.example .env.local` 替代复制命令。也可以用 pnpm 安装锁定版本：`pnpm install --frozen-lockfile`。

打开终端显示的本地网址，选择「离线样例」。它使用固定故事和三张 SVG 示意图，不调用付费 API；输入主题、自定义画风和自由改写不会改变这套固定样例。

正式演示建议先关闭开发服务，然后运行：

```sh
npm run build
node scripts/start-local.mjs
```

启动器从 3000–3010 选择空闲端口，请使用它实际显示的网址。Mac 可在 Finder 中双击 `启动绘本.command`；如果没有执行权限，在终端运行 `chmod +x 启动绘本.command`。

**服务窗口必须保持打开。`127.0.0.1` 是本机地址，上传 GitHub 不会自动把应用部署为在线网站。**

## 配置真实 API

在 `.env.local` 中填写，修改后重启服务。不要编辑 `.env.example` 放入真实密钥。

| 配置项 | 用途 |
|---|---|
| `OPENAI_API_KEY` | 文字服务密钥，用于生成故事和真实绘本翻译 |
| `OPENAI_BASE_URL` | 文字服务地址，须与密钥所属服务匹配 |
| `OPENAI_API_MODE` | `responses` 或 `chat`，取决于供应商支持的接口 |
| `OPENAI_MODEL` | 你的账号可用且支持结构化 JSON 输出的文字模型名称 |
| `OPENOX_API_KEY` | 生图服务密钥，与文字服务分开配置 |
| `OPENOX_BASE_URL` | 生图服务地址 |
| `OPENOX_IMAGE_MODEL` | 生图模型，本项目默认 `gpt-image-2` |
| `OPENOX_IMAGE_SIZE` | 图片尺寸，默认 `1024x1024`，需供应商支持 |
| `STORY_DATA_DIR` | 本机故事与图片存储目录，默认 `./data` |

文字服务支持两种调用方式，二选一：

**OpenAI 官方 API**

```dotenv
OPENAI_API_KEY=填写自己的官方API密钥
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_API_MODE=responses
OPENAI_MODEL=填写账号可用的模型名称
```

**OpenAI-compatible 中转服务（以项目曾使用的 OpenOX 配置为例）**

```dotenv
OPENAI_API_KEY=填写对应中转服务的文字密钥
OPENAI_BASE_URL=https://openox.tech/v1
OPENAI_API_MODE=chat
OPENAI_MODEL=填写该平台当前支持的模型名称
```

不要混用官方密钥与中转站地址。变量名 `OPENAI_API_KEY` 代表本项目的文字服务配置，并不强制使用官方服务。ChatGPT 网页登录或订阅不能代替 API 配置。

生图配置：

```dotenv
OPENOX_API_KEY=填写自己的生图密钥
OPENOX_BASE_URL=https://api.openox.net/v1
OPENOX_IMAGE_MODEL=gpt-image-2
OPENOX_IMAGE_SIZE=1024x1024
STORY_DATA_DIR=./data
```

上面是项目已有的接口配置示例，不保证供应商地址、模型权限或价格长期不变，请以供应商控制台为准。配置完成后在网页选择「真实 AI」。配置状态只检查配置项是否存在，不验证密钥有效性和余额。

## 操作与费用须知

- 每轮生成三页；继续、转折、结局、自定义推进都会新增一轮。最多 30 页。
- 文字先生成并校验，再生成插画。每轮最多两张插画并行，完成即保存、推送；不是逐字生成正文。
- 进度条按当前任务成功出图的张数更新，不是供应商内部渲染进度。未出图时可以先阅读正文。
- 「停止等待」中止客户端等待并向后台传递取消信号，保留已完成内容。供应商已接收的任务不保证撤销或免收费。
- 「恢复进度」读取本机已保存的最新结果，不自动重启生成。「重试插画」处理尚未成功的页面，可能再次产生费用。
- 自定义画风支持 1–200 字，保存到绘本并沿用到续写；离线示意图不会随画风改变。
- 中英文切换会翻译已有绘本的显示内容，保留原始存档及图片。真实绘本首次翻译可能调用文字 API；翻译缓存不是永久云端存储。
- 朗读使用浏览器提供的语音合成，不调用独立付费语音模型；声音可用性取决于系统和浏览器。
- 故事内容和画风会发送给配置的供应商。请勿输入不希望交给供应商处理的私人内容。
- 若供应商返回图片编码，图片保存在本机；若返回外部图片 URL，链接可能过期。

## 已实现与边界

- Storyworld State：当前事实、已发生历史、未来计划分开保存。
- State Patch：验证 `key / before / after`，每轮在副本上校验，通过后提交；状态冲突自动尝试修复一次。
- Character Bible：已有角色不能被新角色记录覆盖，每页引用的角色 ID 必须存在。
- 画风、人物设定、当页场景与状态共同用于插画提示词。
- Debug 面板展示状态、人物、补丁、提示词与耗时。
- 本地 JSON 原子保存、恢复最近故事、导出故事 JSON。

**一致性属于结构化校验与提示词约束。当前没有生成后的自动视觉审核，不能保证图片、正文和状态在语义上完全一致。**本项目是单进程、本机演示应用，没有用户隔离和生产级认证，不应直接暴露到公网供多人共用。

## 目录结构

```text
app/                  页面入口、样式与后台 API
  api/story/          创建、推进、恢复故事；NDJSON 事件流
  api/image/          单页插画重试
  api/translate/      已有绘本翻译
  api/config/         配置状态（不返回密钥）
  api/media/          读取本地图片
components/           绘本界面、首页 SVG 帆船
lib/
  schema.ts           数据结构与输入校验
  state.ts            状态补丁、整轮校验、插画提示词
  providers.ts        文字和生图服务调用
  image-batch.ts      两路并行生图、串行保存
  image-progress.ts   成功出图进度统计
  store.ts            本地存档与单故事互斥
  i18n.tsx            界面中英文转换
  translation.ts      绘本翻译
  demo*.ts            固定离线样例与英文文本
  http.ts             请求来源与体积检查
public/               离线样例与静态插画
scripts/              启动、离线检查、可选真实接口检查
tests/                自动化测试
docs/                 路演计划与历史验证记录
.env.example          空白配置模板
.env.local            本机配置，不上传
```

## 检查与开发

```sh
npm run typecheck
npm test
npm run build
```

启动服务后检查离线流程：

```sh
npm run smoke
```

默认检查 `http://127.0.0.1:3000`；其他端口通过 `SMOKE_URL` 指定。`scripts/check-story.ts` 和 `scripts/check-image.ts` 是可选真实接口检查，**会调用供应商并可能产生费用**，不属于普通测试的默认步骤。

源码修改后，开发模式自动刷新；正式运行模式需要停止服务、重新 `npm run build` 再启动。不要同时在同一目录运行开发服务与构建。

## 密钥与提交

`.gitignore` 排除 `.env.local`、其他环境文件、`data/`、`node_modules/`、`.next/`、`.pnpm-store/` 和构建缓存，只保留空白 `.env.example`。不要把密钥写进 README、示例、截图或前端代码，不要给服务端密钥加 `NEXT_PUBLIC_` 前缀。若密钥曾被公开，请在供应商平台撤销并重新生成。
