# 维护说明

本文件承接仓库首页 README 精简前的维护文档，供维护者查阅。首页 `README.md` 只保留「在线阅读入口」与「项目简介」；在线入口为 <https://sixsheepdad.github.io/Awesome-FM-SAM-for-RRSIS/>。

## 界面预览

| 桌面端 | 移动端 |
| --- | --- |
| <img src="screenshots/ui-desktop.png" width="420" alt="桌面端界面"> | <img src="screenshots/ui-mobile.png" width="180" alt="移动端界面"> |

## 定位与收录范围

只收录**遥感 / RRSIS（Referring Remote Sensing Image Segmentation）方向、且采用「视觉语言基础模型（VLM）+ SAM / SAM2」结构**的高质量论文。通用视觉工作、与遥感无关、或未使用 VLM+SAM 结构的工作一律不收。

判定口径：**VLM 指经图文联合预训练的跨模态模型**（CLIP、BEiT-3、SigLIP 2、Qwen-VL、LLaVA、Grounding DINO 等）；纯文本编码器（BERT / RoBERTa）、纯视觉骨干（ResNet / RS-VFM）、文生图扩散模型均不计入。SAM 须作为分割骨干实际参与，仅在引言中提及不算。数据集/通用地球观测基础模型若非专门解决 RRSIS，也不收。

新增候选（含每周一自动检索）的完整判定依据见 **[论文筛选规则](screening-rules.md)**：R1 任务域 / R2 VLM / R3 SAM / R4 结构耦合 / R5 期刊 IF > 6 或顶会正会 / R6 证据核验（含 IF 数值核验）/ R7 去重，以及周检输出格式。规则文件是唯一口径，收录前须逐条核对。

## 本地打开

双击 `index.html` 即可查看：纯静态 HTML + CSS + 原生 JS，无构建、无 npm 依赖、不访问外网、无需服务器。

数据以 `<script src="data/papers.js">` 定义 `window.PAPERS`，因此 `file://` 下也能直接读取；**不能用 fetch / XHR 读 JSON**，会被 CORS 拦。同一套文件也直接用于 GitHub Pages，无需构建。

## 数据与展示分离

- `index.html`、`assets/style.css`、`assets/app.js`：展示层，不含任何论文数据。
- `data/papers.js`：数据层，`window.PAPERS.papers` 是唯一数据源，渲染只读这一个数组。

### 字段表

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `id` | 是 | 唯一稳定字符串 |
| `title` | 是 | 英文论文标题 |
| `authors` | 是 | 字符串数组；超过 6 位显示前 6 + `等` |
| `year` | 是 | 整数 |
| `venue` | 是 | 不含年份的规范简称（CVPR / IEEE TGRS / TPAMI / arXiv），按官方拼写原样输出 |
| `venueType` | 是 | `conference` / `journal` / `preprint`，内部字段，不渲染成可见文本 |
| `tags` | 是 | 字符串数组，**必须全部取自 `tagWhitelist`** |
| `comment` | 是 | 中文一句话点评，≤38 个中文字，讲清如何用 VLM+SAM 结构 |
| `paperUrl` | 是 | `https://` 论文链接；**点击论文标题**或条目底部「论文」均在新标签页打开此地址 |
| `codeUrl` | 否 | `https://` 或 `null`；为 `null` 时显示「代码未公开」 |
| `note` | 否 | 短备注，渲染成 `注 · ` 标签 |
| `figure` | 否 | 对象 `{ src, alt, w, h }`：`src` 为站内相对路径 `assets/figures/<id>.png`，`alt` 为中文结构描述，`w`/`h` 为原始像素宽高（防布局跳动）；渲染成条目右侧的模型整体图，点击可在新标签页查看大图。缺失或非法时该条目不渲染图 |
| `demo` | 否 | 仅记录级；示意条目为 `true` |

不设机构（affiliation）字段；作者行只写作者，不写机构、venue 或类型。

## 新增论文

1. 打开 `data/papers.js`。
2. 往 `papers` 数组**最前面**加一条对象即可置顶（按年份倒序分组，组内保持数组原顺序）。
3. 按字段表填齐必填字段；`tags` 只能用 `tagWhitelist` 里已有的标签，确需新标签时先加进 `tagWhitelist`。
4. 配图（可选）：从论文 PDF 裁出模型整体架构图，存为 `assets/figures/<id>.png`，保留原始比例、不要裁进页眉或正文；在记录里填 `figure` 的 `src`/`alt`/`w`/`h`（`w`/`h` 为图片原始像素宽高）。不填或填错则该条目不渲染图，不影响其它内容。
5. 保存并刷新 `index.html`。

## 每周一自动检索

- **唯一口径**：[论文筛选规则](screening-rules.md)（v1.1），R1 任务域 / R2 VLM / R3 SAM / R4 结构耦合 / R5 期刊 **IF > 6**（不设期刊名单、不点名排除）或顶会正会 / R6 证据核验（含 IF 数值与年份来源）/ R7 去重与时间窗；每次检索开始前必须完整读取。
- **自动化任务**：「FM-SAM 论文周检 · 自动入库」，每周一 09:30，工作目录为本仓库，任务 ID `adfcd9b5-de53-4f19-ada6-6118e0e2ca67`。
- **行为**：R1–R7 全部通过的论文自动写入 `data/papers.js`，同步 README 与本文的篇数说明，提交并推送 `origin/main`；排除项与待确认项只在报告中给出理由；0 篇通过时不创建空提交。`figure` 由人工从 PDF 补裁，自动入库不会伪造图片。
- **注意**：另有一个每周一 09:00 的「RRSIS 文献周更」任务指向的是**另一个仓库**（综合 RRSIS 列表），与本任务互不影响，不要合并或覆盖。

## 当前收录状态

2026-11-09 已清除全部 `demo` 版式示意条目；2026-11-10 新增 ECCV 2026 的 CROSS，现有 **5 篇真实收录**（CROSS、RSRefSeg、RSRefSeg 2、RS2-SAM2、Training-Free Text-Based RS Segmentation），且 5 篇均已配模型整体图。演示 banner 由 `papers.some(p => p.demo)` 驱动，无 demo 记录时自动隐藏。

若日后需要临时预览版式，可给条目加 `demo: true`（并填 `note` 说明非真实收录），删掉即恢复；不要为示意条目虚构会议收录或方法结论。

## 发布方式

仓库为 **public**，站点由 GitHub Pages 从 `main` 分支**根目录**发布：<https://sixsheepdad.github.io/Awesome-FM-SAM-for-RRSIS/>。该地址同时填在仓库 **About → Website**，项目页右侧可直接点击进入。

- 仓库文件即站点文件，没有构建步骤；推送到 `main` 后 Pages 自动重建，通常 1–2 分钟生效。
- 首页 `README.md` 只保留「在线阅读入口」与「项目简介」；界面截图放在 `docs/screenshots/`，预览表格在本文件。版式调整后若重新截图，需同步更新本文件的预览表格。
- 站点不访问外网、不加载 CDN，离线双击 `index.html` 与线上 Pages 看到的是同一套内容。
