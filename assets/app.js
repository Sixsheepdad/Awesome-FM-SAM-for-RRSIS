(function () {
  'use strict';

  var ROOT = window.PAPERS || {};
  var WHITELIST = Array.isArray(ROOT.tagWhitelist) ? ROOT.tagWhitelist.slice() : [];
  var RAW = Array.isArray(ROOT.papers) ? ROOT.papers : [];

  var elBanner = document.getElementById('demo-banner');
  var elBannerText = document.getElementById('demo-banner-text');
  var elStats = document.getElementById('stats');
  var elStatsGrid = document.getElementById('stats-grid');
  var elStatsInline = document.getElementById('stats-inline');
  var elToolbar = document.getElementById('toolbar');
  var elSearch = document.getElementById('search');
  var elChips = document.getElementById('chips');
  var elStatus = document.getElementById('status');
  var elResults = document.getElementById('paper-results');
  var elEmptyFilter = document.getElementById('empty-filter');
  var elEmptyLibrary = document.getElementById('empty-library');

  var PAPERS = [];
  var CHIPS = [];
  var activeChip = null;
  var debounceTimer = null;

  function warn(msg, p) {
    if (window.console && console.warn) {
      console.warn('[papers] ' + msg + (p && p.id ? '（id=' + p.id + '）' : ''), p || '');
    }
  }

  function isHttpsUrl(s) {
    if (typeof s !== 'string' || !s) return false;
    try {
      return new URL(s).protocol === 'https:';
    } catch (e) {
      return false;
    }
  }

  // 逐条校验；坏记录 console.warn 后跳过，保证页面不崩（S6）。
  function normalize(p, seen) {
    if (!p || typeof p !== 'object' || Array.isArray(p)) {
      warn('记录不是对象，跳过', p); return null;
    }
    if (typeof p.id !== 'string' || !p.id.trim()) {
      warn('缺少有效 id，跳过', p); return null;
    }
    if (seen[p.id]) { warn('id 重复，跳过：' + p.id, p); return null; }
    if (typeof p.title !== 'string' || !p.title.trim()) {
      warn('缺少有效 title，跳过', p); return null;
    }
    if (!Array.isArray(p.authors) || p.authors.length === 0 ||
        p.authors.some(function (a) { return typeof a !== 'string' || !a.trim(); })) {
      warn('authors 无效，跳过', p); return null;
    }
    if (!Number.isInteger(p.year)) { warn('year 非整数，跳过', p); return null; }
    if (typeof p.venue !== 'string' || !p.venue.trim()) {
      warn('缺少有效 venue，跳过', p); return null;
    }
    if (['conference', 'journal', 'preprint'].indexOf(p.venueType) === -1) {
      warn('venueType 无效，跳过', p); return null;
    }
    if (typeof p.comment !== 'string' || !p.comment.trim()) {
      warn('缺少有效 comment，跳过', p); return null;
    }
    if (!isHttpsUrl(p.paperUrl)) {
      warn('paperUrl 非 https，跳过：' + p.id, p); return null;
    }

    var tags = [];
    if (!Array.isArray(p.tags)) {
      warn('tags 非数组，按空处理', p);
    } else {
      p.tags.forEach(function (t) {
        if (typeof t === 'string' && WHITELIST.indexOf(t) !== -1) tags.push(t);
        else warn('忽略非白名单标签：' + String(t), p);
      });
    }

    var codeUrl = null;
    if (p.codeUrl !== undefined && p.codeUrl !== null) {
      if (isHttpsUrl(p.codeUrl)) codeUrl = p.codeUrl;
      else warn('codeUrl 非 https，按「代码未公开」处理：' + p.id, p);
    }
    var note = (typeof p.note === 'string' && p.note.trim()) ? p.note : null;
    var demo = p.demo === true;

    seen[p.id] = true;
    return {
      id: p.id, title: p.title, authors: p.authors.slice(), year: p.year,
      venue: p.venue, venueType: p.venueType, tags: tags, comment: p.comment,
      paperUrl: p.paperUrl, codeUrl: codeUrl, note: note, demo: demo
    };
  }

  function makeDot() {
    var s = document.createElement('span');
    s.className = 'dot';
    s.textContent = ' · ';
    return s;
  }

  function makeTextNode(t) { return document.createTextNode(t); }

  function appendLink(parent, text, url) {
    if (isHttpsUrl(url)) {
      var a = document.createElement('a');
      a.textContent = text;
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      parent.appendChild(a);
    } else {
      var s = document.createElement('span');
      s.className = 'link-plain';
      s.textContent = text;
      parent.appendChild(s);
    }
  }

  function makeNumSpan(value, cls) {
    var s = document.createElement('span');
    s.className = cls;
    s.textContent = String(value);
    return s;
  }

  // 「等」用 --text-3，不加括号、不加 …
  function appendAuthors(parent, authors) {
    if (authors.length > 6) {
      parent.appendChild(makeTextNode(authors.slice(0, 6).join(', ') + ' '));
      var more = document.createElement('span');
      more.className = 'authors-more';
      more.textContent = '等';
      parent.appendChild(more);
    } else {
      parent.appendChild(makeTextNode(authors.join(', ')));
    }
  }

  function pad2(n) { return n < 10 ? '0' + n : String(n); }

  function renderPaper(p, num) {
    var art = document.createElement('article');
    art.className = 'paper';

    var idxCol = document.createElement('div');
    idxCol.className = 'paper-index';
    var idx = document.createElement('span');
    idx.className = 'idx';
    idx.textContent = pad2(num);
    idxCol.appendChild(idx);

    var body = document.createElement('div');
    body.className = 'paper-body';

    // 标题行：标题（可点击跳原文）+ 示意标记（demo 驱动）+ 徽章（venue + 空格 + year，年份不切 mono）
    var head = document.createElement('div');
    head.className = 'paper-head';
    var h3 = document.createElement('h3');
    h3.className = 'paper-title';
    if (isHttpsUrl(p.paperUrl)) {
      var titleLink = document.createElement('a');
      titleLink.className = 'paper-title-link';
      titleLink.textContent = p.title;
      titleLink.href = p.paperUrl;
      titleLink.target = '_blank';
      titleLink.rel = 'noopener noreferrer';
      var linkHint = document.createElement('span');
      linkHint.className = 'sr-only';
      linkHint.textContent = '（在新标签页打开论文页面）';
      titleLink.appendChild(linkHint);
      h3.appendChild(titleLink);
    } else {
      h3.textContent = p.title;
    }
    head.appendChild(h3);
    if (p.demo) {
      var mark = document.createElement('span');
      mark.className = 'demo-mark';
      mark.textContent = '示意';
      head.appendChild(mark);
    }
    var badge = document.createElement('span');
    badge.className = 'badge';
    badge.textContent = p.venue + ' ' + p.year;
    head.appendChild(badge);
    body.appendChild(head);

    // 作者行：只写作者，禁用 ·，允许折行不截断
    var authorsEl = document.createElement('p');
    authorsEl.className = 'paper-authors';
    appendAuthors(authorsEl, p.authors);
    body.appendChild(authorsEl);

    // 正文点评：16px 任何断点不缩
    var commentEl = document.createElement('p');
    commentEl.className = 'paper-comment';
    commentEl.textContent = p.comment;
    body.appendChild(commentEl);

    // note -> 「注 · 」标签
    if (p.note) {
      var noteEl = document.createElement('p');
      noteEl.className = 'paper-note';
      noteEl.appendChild(makeTextNode('注'));
      noteEl.appendChild(makeDot());
      noteEl.appendChild(makeTextNode(p.note));
      body.appendChild(noteEl);
    }

    // 方法标签
    if (p.tags.length) {
      var tagsEl = document.createElement('div');
      tagsEl.className = 'paper-tags';
      p.tags.forEach(function (t) {
        var s = document.createElement('span');
        s.className = 'method-tag';
        s.textContent = t;
        tagsEl.appendChild(s);
      });
      body.appendChild(tagsEl);
    }

    // 链接行「论文 · 代码」；codeUrl 为 null 时保留位置渲染「代码未公开」纯文本
    var linksEl = document.createElement('p');
    linksEl.className = 'paper-links';
    appendLink(linksEl, '论文', p.paperUrl);
    linksEl.appendChild(makeDot());
    if (p.codeUrl) {
      appendLink(linksEl, '代码', p.codeUrl);
    } else {
      var nc = document.createElement('span');
      nc.className = 'no-code';
      nc.textContent = '代码未公开';
      linksEl.appendChild(nc);
    }
    body.appendChild(linksEl);

    art.appendChild(idxCol);
    art.appendChild(body);
    return art;
  }

  function makeHaystack(p) {
    return [p.title, p.authors.join(' '), p.venue, p.tags.join(' '),
      p.comment, String(p.year), p.note || ''].join(' ').toLowerCase();
  }

  function getTokens() {
    var q = elSearch.value.trim().toLowerCase();
    if (!q) return [];
    return q.split(/\s+/).filter(Boolean);
  }

  function matchesQuery(p, tokens) {
    if (!tokens.length) return true;
    var h = makeHaystack(p);
    return tokens.every(function (t) { return h.indexOf(t) !== -1; });
  }

  function matchesChip(p) {
    if (!activeChip || activeChip.key === 'all') return true;
    if (activeChip.key === '__code__') return p.codeUrl !== null;
    return p.tags.indexOf(activeChip.key) !== -1;
  }

  // ≤8 chips：全部(1) + 高频标签(至多 6) + 有代码(第 8 位)。
  // 按频次降序取 Top 7 后，受 ≤8 上限裁到 6 个，保留「全部」在首、「有代码」在末。
  function buildChips(papers) {
    var freq = {};
    WHITELIST.forEach(function (t) { freq[t] = 0; });
    papers.forEach(function (p) {
      p.tags.forEach(function (t) { if (freq[t] !== undefined) freq[t] += 1; });
    });
    var ranked = WHITELIST.filter(function (t) { return freq[t] > 0; })
      .sort(function (a, b) {
        if (freq[b] !== freq[a]) return freq[b] - freq[a];
        return WHITELIST.indexOf(a) - WHITELIST.indexOf(b);
      });
    var top7 = ranked.slice(0, 7);
    var tagChips = top7.slice(0, 6);

    var chips = [{ label: '全部', key: 'all', count: papers.length }];
    tagChips.forEach(function (t) {
      chips.push({
        label: t, key: t,
        count: papers.filter(function (p) { return p.tags.indexOf(t) !== -1; }).length
      });
    });
    chips.push({
      label: '有代码', key: '__code__',
      count: papers.filter(function (p) { return p.codeUrl !== null; }).length
    });
    return chips;
  }

  function renderChips() {
    elChips.textContent = '';
    CHIPS.forEach(function (chip) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'chip';
      b.setAttribute('aria-pressed', String(activeChip.key === chip.key));
      var lab = document.createElement('span');
      lab.className = 'chip-label';
      lab.textContent = chip.label;
      var cnt = makeNumSpan(chip.count, 'chip-count');
      b.appendChild(lab);
      b.appendChild(cnt);
      b.addEventListener('click', function () {
        activeChip = chip;
        renderChips();
        render();
      });
      elChips.appendChild(b);
    });
  }

  function renderStatus(n) {
    elStatus.textContent = '';
    elStatus.appendChild(makeTextNode('找到 '));
    elStatus.appendChild(makeNumSpan(n, 'status-count'));
    elStatus.appendChild(makeTextNode(' 篇'));
    if (activeChip.key !== 'all' || getTokens().length) {
      elStatus.appendChild(makeDot());
      elStatus.appendChild(makeTextNode('已筛选'));
    }
  }

  function renderResults(visible) {
    elResults.textContent = '';
    elEmptyFilter.hidden = visible.length !== 0;

    var groups = {};
    visible.forEach(function (p) {
      (groups[p.year] = groups[p.year] || []).push(p);
    });
    Object.keys(groups).map(Number).sort(function (a, b) { return b - a; })
      .forEach(function (y) {
        var sec = document.createElement('section');
        sec.className = 'year-group';
        sec.setAttribute('aria-label', y + ' 年论文');

        var h2 = document.createElement('h2');
        h2.className = 'group-title';
        var ys = document.createElement('span');
        ys.className = 'group-year';
        ys.textContent = String(y);
        h2.appendChild(ys);
        h2.appendChild(makeDot());
        var meta = document.createElement('span');
        meta.className = 'group-meta';
        meta.appendChild(makeTextNode('共 '));
        meta.appendChild(makeNumSpan(groups[y].length, 'group-count'));
        meta.appendChild(makeTextNode(' 篇'));
        h2.appendChild(meta);
        sec.appendChild(h2);

        groups[y].forEach(function (p, i) {
          sec.appendChild(renderPaper(p, i + 1));
        });
        elResults.appendChild(sec);
      });
  }

  function renderStats() {
    var n = PAPERS.length;
    var years = PAPERS.map(function (p) { return p.year; });
    var span;
    if (!years.length) {
      span = '—';
    } else {
      var mn = Math.min.apply(null, years);
      var mx = Math.max.apply(null, years);
      span = (mn === mx) ? String(mn) : mn + '–' + mx; // en dash
    }
    var venueMap = {};
    PAPERS.forEach(function (p) { venueMap[p.venue] = 1; });
    var venueCount = Object.keys(venueMap).length;

    elStats.classList.toggle('stats--empty', n === 0);

    // ≥480：3 列统计
    elStatsGrid.textContent = '';
    [['收录论文', String(n)], ['年份跨度', span], ['发表来源', String(venueCount)]]
      .forEach(function (pair) {
        var item = document.createElement('div');
        item.className = 'stat';
        item.appendChild(makeNumSpan(pair[1], 'stat-num'));
        var lab = document.createElement('span');
        lab.className = 'stat-label';
        lab.textContent = pair[0];
        item.appendChild(lab);
        elStatsGrid.appendChild(item);
      });

    // <480：单行文本串，数字同样上蓝，· 中性
    elStatsInline.textContent = '';
    elStatsInline.appendChild(makeTextNode('收录论文 '));
    elStatsInline.appendChild(makeNumSpan(n, 'inline-num'));
    elStatsInline.appendChild(makeDot());
    elStatsInline.appendChild(makeTextNode('年份跨度 '));
    elStatsInline.appendChild(makeNumSpan(span, 'inline-num'));
    elStatsInline.appendChild(makeDot());
    elStatsInline.appendChild(makeTextNode('发表来源 '));
    elStatsInline.appendChild(makeNumSpan(venueCount, 'inline-num'));
  }

  function render() {
    var tokens = getTokens();
    var visible = PAPERS.filter(function (p) {
      return matchesQuery(p, tokens) && matchesChip(p);
    });
    renderStatus(visible.length);
    renderResults(visible);
  }

  function renderBanner() {
    var demoCount = PAPERS.filter(function (p) { return p.demo; }).length;
    if (demoCount > 0) {
      elBannerText.textContent = '演示预览：当前含 ' + demoCount + ' 条示意条目，不计入真实收录';
      elBanner.hidden = false;
    } else {
      elBanner.hidden = true;
    }
  }

  function initEmptyLibrary() {
    elToolbar.hidden = true;
    elStatus.hidden = true;
    elResults.hidden = true;
    elEmptyFilter.hidden = true;
    elEmptyLibrary.hidden = false;
  }

  function bindEvents() {
    elSearch.addEventListener('input', function () {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(render, 120);
    });
    elSearch.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
      } else if (e.key === 'Escape') {
        elSearch.value = ''; // 清词但保留 chip
        if (debounceTimer) clearTimeout(debounceTimer);
        render();
      }
    });
    document.getElementById('clear-search').addEventListener('click', function () {
      elSearch.value = '';
      if (debounceTimer) clearTimeout(debounceTimer);
      render();
    });
    document.getElementById('reset-filter').addEventListener('click', function () {
      activeChip = CHIPS[0];
      renderChips();
      render();
    });
  }

  function init() {
    var seen = {};
    RAW.forEach(function (p) {
      var n = normalize(p, seen);
      if (n) PAPERS.push(n);
    });

    renderBanner();
    renderStats();

    if (PAPERS.length === 0) {
      initEmptyLibrary(); // S0 库空
      return;
    }

    CHIPS = buildChips(PAPERS);
    activeChip = CHIPS[0];
    renderChips();
    render();
    bindEvents();
  }

  try {
    init();
  } catch (e) {
    warn('初始化异常，已降级为空库态', null);
    initEmptyLibrary();
  }
})();
