/*
 * 字段清单（data/papers.js）
 * 根结构为「对象」（不是数组）；渲染读取 window.PAPERS.papers。
 *
 * 根级字段：
 *   schemaVersion  整数，数据结构版本
 *   updated        ISO 日期字符串，数据最后更新日期
 *   tagWhitelist   字符串数组，允许使用的标签白名单
 *   papers         论文条目数组，唯一数据源
 *
 * 每条论文字段：
 *   id        必填，唯一稳定字符串
 *   title     必填，英文论文标题
 *   authors   必填，字符串数组；>6 位显示前 6 + 空格 + 「等」（等用 --text-3，不加括号、不加 …）
 *   year      必填，整数
 *   venue     必填，不含年份的规范简称（CVPR / IEEE TGRS / TPAMI / arXiv）；按官方拼写原样输出
 *   venueType 必填，conference|journal|preprint；降为内部字段，不渲染成可见文本
 *   tags      必填，字符串数组；必须全部取自 tagWhitelist
 *   comment   必填，中文一句话点评，≤38 个中文字，讲清该工作如何用 VLM+SAM 结构
 *   paperUrl  必填，https URL
 *   codeUrl   选填，https URL 或 null；为 null 时渲染「代码未公开」纯文本（不隐藏该位置）
 *   note      选填，短备注，渲染成「注 · 」标签
 *   demo      选填，仅记录级；示意条目为 true
 *
 * 说明：不新增 affiliation（机构）字段；作者行只写作者、不写机构/venue/类型。
 *
 * 收录标准：仅限遥感 / RRSIS 方向，且采用「视觉语言基础模型 + SAM / SAM2」结构。
 *       「视觉语言基础模型」指经图文联合预训练的跨模态模型（CLIP / BEiT-3 / Qwen-VL 等），
 *       纯文本编码器（BERT / RoBERTa）或纯视觉骨干（ResNet / RS-VFM）不计入。
 *       2026-11-09 已清除 3 条 demo 版式示意条目；2026-11-10 收录 ECCV 2026 的 CROSS，
 *       当前 5 条均为真实收录。
 */
window.PAPERS = {
  schemaVersion: 1,
  updated: "2026-11-10",
  tagWhitelist: ["VLM", "SAM", "SAM 2", "适配器", "提示学习", "遥感", "RRSIS", "开放词汇", "文本条件", "指代分割", "CLIP", "BEiT-3", "SigLIP 2", "训练无关"],
  papers: [
    {
      id: "luo2026cross",
      title: "CROSS: Cascaded Distillation and Dual-Constraint Grounding for Remote Sensing Referring Segmentation",
      authors: ["Tingzhang Luo", "Ruizhong Liu", "Yichao Liu", "Cheng Fan", "Yu Liu", "Jianyuan Guo"],
      year: 2026,
      venue: "ECCV",
      venueType: "conference",
      tags: ["RRSIS", "SigLIP 2", "SAM 2"],
      comment: "SigLIP 2 生成稠密提示交由 SAM 2 解码，SAM 2 几何亲和再反蒸馏回 VLM 中间层。",
      paperUrl: "https://media.eventhosts.cc/Conferences/ECCV2026/pdfs/9662.pdf",
      codeUrl: "https://github.com/Clarence-CV/CROSS"
    },
    {
      id: "chen2025rsrefseg",
      title: "RSRefSeg: Referring Remote Sensing Image Segmentation with Foundation Models",
      authors: ["Keyan Chen", "Jiafan Zhang", "Chenyang Liu", "Zhengxia Zou", "Zhenwei Shi"],
      year: 2025,
      venue: "arXiv",
      venueType: "preprint",
      tags: ["RRSIS", "CLIP", "SAM"],
      comment: "CLIP 文本语义过滤视觉激活，经 AttnPrompter 转成 SAM 提示；两个骨干用 LoRA 微调。",
      paperUrl: "https://arxiv.org/abs/2501.06809",
      codeUrl: "https://github.com/KyanChen/RSRefSeg"
    },
    {
      id: "chen2026rsrefseg2",
      title: "RSRefSeg 2: Decoupling Referring Remote Sensing Image Segmentation With Foundation Models",
      authors: ["Keyan Chen", "Chenyang Liu", "Bowen Chen", "Jiafan Zhang", "Zhengxia Zou", "Zhenwei Shi"],
      year: 2026,
      venue: "IEEE TGRS",
      venueType: "journal",
      tags: ["RRSIS", "CLIP", "SAM"],
      comment: "解耦定位与分割：CLIP 文本嵌入经级联提示器生成精提示，引导 SAM 细化掩膜。",
      paperUrl: "https://doi.org/10.1109/TGRS.2025.3647535",
      codeUrl: "https://github.com/KyanChen/RSRefSeg2"
    },
    {
      id: "rong2026rs2sam2",
      title: "RS2-SAM2: Customized SAM2 for Referring Remote Sensing Image Segmentation",
      authors: ["Fu Rong", "Meng Lan", "Qian Zhang", "Lefei Zhang"],
      year: 2026,
      venue: "AAAI",
      venueType: "conference",
      tags: ["RRSIS", "BEiT-3", "SAM 2"],
      comment: "BEiT-3 联合编码图文，双向层次融合把文本注入 SAM2 编码器，伪掩码作密集提示。",
      paperUrl: "https://arxiv.org/abs/2503.07266",
      codeUrl: "https://github.com/rongfu-dsb/RS2-SAM2"
    },
    {
      id: "sosa2026trainfree",
      title: "Enabling Training-Free Text-Based Remote Sensing Segmentation",
      authors: ["Jose Sosa", "Danila Rukhovich", "Anis Kacem", "Djamila Aouada"],
      year: 2026,
      venue: "CVPRW",
      venueType: "conference",
      tags: ["RRSIS", "训练无关", "开放词汇"],
      comment: "CLIP 为 SAM 网格提案打分，Qwen-VL 生成点击提示，全程免训练或仅 LoRA 微调。",
      paperUrl: "https://arxiv.org/abs/2602.17799",
      codeUrl: null,
      note: "通用文本分割框架，亦在 RRSIS-D 上评测"
    }
  ]
};
