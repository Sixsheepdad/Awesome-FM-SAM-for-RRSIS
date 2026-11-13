# 论文筛选规则（FM-SAM / RRSIS 周检索唯一口径）

> 版本 **v1.0** · 生效日期 **2026-11-13** · 适用仓库 `Awesome-FM-SAM-for-RRSIS`

本文件是本项目**每周一自动检索**以及任何新增论文收录的**唯一判定依据**。每次检索开始前必须完整读取本文件；条款冲突时以本文件为准，不得凭标题、二手摘要或模型印象放宽。宁可报告「本次 0 篇通过」，也不凑数。

## 0. 适用范围与判定顺序

- **适用**：所有新增候选论文（周检自动检索 + 人工推荐）。
- **不适用**：当前已收录的 5 篇为存量条目，不因本规则回溯删除或降级；仅在维护者明确要求时复核。存量中存在 arXiv / 非顶会条目，属历史收录，**不得**作为放宽本规则的先例。
- **判定顺序**：R1 任务域 → R2 VLM → R3 SAM → R4 结构耦合 → R5 发表门槛 → R6 证据核验 → R7 去重与时间窗。
- **一票否决**：任一硬性条款不通过即排除，不因其它条款表现优秀而补偿。无法核实的信息一律不视为通过。

## R1 任务域（必须）

- 必须是**遥感影像上的指代 / 引用式分割**：RRSIS、Referring Remote Sensing Image Segmentation、遥感开放词汇 / 文本引导目标分割（用文本指代具体目标并输出掩膜）。
- 须在遥感数据集或遥感影像上做主实验并给出分割指标（RefSegRS、RRSIS-D、RefSegRS+ 等）。
- **排除**：通用自然图像 RIS、变化检测、目标检测/分类、地物分类、无文本指代的纯分割、纯数据集/基准、遥感视觉基础模型预训练（非指代分割任务）、纯 SAM 遥感迁移、遥感图像描述/检索/VQA。

## R2 视觉语言基础模型 VLM（必须）

- 必须是**经图文联合预训练的跨模态模型**，并在方法流程中实际参与：CLIP / OpenCLIP / SigLIP / SigLIP 2 / BEiT-3 / Qwen-VL / LLaVA / BLIP / ALIGN / Florence / Grounding DINO 等。
- **实际参与** = 承担文本-视觉对齐、语义过滤、稀疏/稠密提示生成、蒸馏或对齐监督等，且在架构图、方法或消融实验中有明确位置。
- **不计入**：纯文本编码器（BERT / RoBERTa / 纯文本 T5）、纯视觉骨干（ResNet / Swin / ViT / 遥感 VFM）、文生图扩散模型；仅在引言、相关工作或对比基线中提及；仅用 CLIP 做后处理打分而无方法级耦合（默认不通过，可列「待人工确认」）。

## R3 SAM 分割骨干（必须）

- SAM / SAM 2（含官方变体如 EfficientSAM、SAM-HQ，需在报告中注明具体版本）必须作为**分割骨干或掩膜解码器**实际参与，输出最终掩膜或直接参与掩膜生成。
- **排除**：仅作对比基线、仅在引言提及、仅用 SAM 离线生成伪标签或做数据预处理而推理链路无 SAM、只借「SAM 式提示」概念却使用其它解码器。

## R4 结构耦合（必须）

- 须形成可描述的链路：**VLM 的文本/视觉语义 → 生成或调制提示 → SAM 解码 → 掩膜**；或 VLM 与 SAM 双向蒸馏 / 几何对齐且二者确实互相作用。
- 报告中必须用一句话写清耦合方式（即新增条目 `comment` 字段的内容）。
- **排除**：VLM 与 SAM 并列、彼此无信息流（两个独立分支简单拼接/投票）。

## R5 发表门槛（必须 · 顶刊 / 顶会白名单）

**期刊**（正刊卷期，IF ≥ 8 或领域公认顶刊）：

| 允许 | 规范简称 |
| --- | --- |
| IEEE Transactions on Geoscience and Remote Sensing | IEEE TGRS |
| IEEE Transactions on Image Processing | IEEE TIP |
| IEEE Transactions on Pattern Analysis and Machine Intelligence | TPAMI |
| ISPRS Journal of Photogrammetry and Remote Sensing | ISPRS JPRS |

**会议**（正会 main track，非 workshop / 非附属研讨会）：CVPR、ICCV、ECCV、AAAI。

**明确排除**：JSTARS、IEEE GRSL、JAG（International Journal of Applied Earth Observation and Geoinformation）、Remote Sensing (MDPI)、IGARSS、arXiv / 其它预印本、workshop / challenge 论文、IF < 8 的期刊、非正刊的增刊。

- 预印本即使内容完全符合也不收；若作者主页或官方录用清单明确标注已被上述顶刊/顶会接收 → 列入**「待人工确认」**，不自动通过。
- 白名单之外的顶会（NeurIPS / ICML / IJCAI / ACM MM 等）与高 IF 综合性期刊 → 一律「待人工确认」，不自动通过。
- 会议年份以**正式会议年份**为准，不用 arXiv 投稿年份。

## R6 证据核验（必须）

- 每篇候选必须**独立核验真实发表处与年份**：DBLP、OpenReview、会议官方 accepted papers 列表、期刊官网文章页、doi.org、作者主页、arXiv 的 `journal-ref` / `comments` 字段。报告中写出核验来源 URL。
- **禁止只凭**：IEEE Xplore 搜索结果片段（常把 JSTARS / GRSL 误标为 TGRS）、搜索引擎摘要、公众号/博客/知乎转载、其它论文列表仓库的二手标注。
- 必须拿到摘要或 PDF 全文核对 R2 / R3 / R4；只有标题、无法核实方法结构 → 「待人工确认」，不通过。

## R7 去重与时间窗（必须）

- **检索窗口**：上次周检之后新公开的论文；重点覆盖最近 12 个月内发表或录用的顶刊/顶会正刊论文。
- 对照 `data/papers.js` 的 `id` / `title` / `paperUrl`（含 arXiv id、DOI）去重，已收录条目不再上报。
- 同一工作的不同版本（arXiv v1/v2、会议版 vs 期刊扩展版）只报一次并注明版本关系。
- **检索式至少覆盖**（中英文都试）：`RRSIS` / `referring remote sensing image segmentation` / `remote sensing referring expression comprehension + segmentation` / `text-guided · open-vocabulary · remote sensing + SAM / SAM 2 + CLIP / VLM / foundation model`，并与白名单期刊/会议名及当年年份组合检索；另检索顶会官方录用列表与 TGRS / TIP / TPAMI / ISPRS JPRS 的近期目录。

## 输出格式（每次周检必须遵守）

1. 开头写明：`规则版本 v1.0 · 检索日期 · 检索窗口 · 使用的检索式关键词`。
2. **通过清单**：每条列 标题 / 作者 / 年份 / venue / 核验来源 URL / VLM 组件 / SAM 组件 / 耦合方式一句话 / 论文链接 / 代码链接 / R1–R7 逐条 ✅ 或 ❌（**全 ✅ 才能进入通过清单**）。
3. **排除清单**：每条列 标题 + 触发的条款编号 + 一句话理由（例：`R5 不通过：实为 IGARSS 2025 workshop，非顶会正会`）。
4. **待人工确认**：列明原因与信息缺口。
5. 结尾汇总：`通过 N / 排除 M / 待确认 K`，并说明本次是否改动了仓库文件。

## 落地约束

- 周检结果的处理程度以自动化任务配置为准；当前配置为**「自动入库并推送」**（每周一 09:30 的「FM-SAM 论文周检 · 自动入库」）。日后若改为「仅报告」，只需改自动化配置，本规则不变。
- 若配置为「自动入库」，新增条目须按 `docs/maintenance.md` 字段表填写齐全，并在报告中给出新增 `id`；模型整体图无法自动生成时留空 `figure`，不得伪造图片。
- 本规则任何修改须在下方变更记录登记版本、日期与原因；自动化任务无需改动，因为每次运行都会重新读取本文件。

## 变更记录

| 版本 | 日期 | 说明 |
| --- | --- | --- |
| v1.0 | 2026-11-13 | 初始版本：固化 VLM+SAM 结构判定、顶刊顶会白名单（TGRS/TIP/TPAMI/ISPRS JPRS + CVPR/ICCV/ECCV/AAAI）、证据核验与周检输出格式。存量 5 篇保留但不作为放宽先例。 |
