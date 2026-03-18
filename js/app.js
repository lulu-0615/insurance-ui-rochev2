/**
 * @typedef {Object} InsuranceBranchDrug
 * @property {string} drug_name
 * @property {string} [condition]
 * @property {string} [validity]
 */

/**
 * @typedef {Object} InsuranceBranch
 * @property {string} title
 * @property {string} [description]
 * @property {string} [content]
 * @property {Array<string>} [links]
 * @property {Record<string, any>} [content_detail]
 */

/**
 * @typedef {Object} InsuranceModule
 * @property {string} insurance_type
 * @property {Record<string, string>} [summary]
 * @property {Array<InsuranceBranch>} sub_branches
 */

/**
 * @typedef {Object} InsuranceConfigRoot
 * @property {string} main_title
 * @property {Array<InsuranceModule>} insurance_data
 */

/**
 * 安全转义 HTML
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * 生成稳定 DOM id（用于滚动定位）
 * @param {string} input
 * @returns {string}
 */
function slugify(input) {
  return String(input || "")
    .trim()
    .toLowerCase()
    .replace(/[\s/]+/g, "-")
    .replace(/[^\u4e00-\u9fa5a-z0-9\-]+/g, "")
    .slice(0, 80) || "section";
}

/**
 * 平滑滚动到元素
 * @param {string} elementId
 * @returns {void}
 */
function scrollToId(elementId) {
  var el = document.getElementById(elementId);
  if (!el) {
    return;
  }
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}

/**
 * 初始化主题切换（并持久化到 localStorage）
 * @returns {void}
 */
function initThemeToggle() {
  var btn = document.getElementById("theme-toggle");
  if (!btn) {
    return;
  }

  var stored = null;
  try {
    stored = window.localStorage.getItem("insurance-ui-theme");
  } catch (_) {
    stored = null;
  }

  if (stored === "dark") {
    document.body.classList.add("theme-dark");
  }

  btn.addEventListener("click", function () {
    var isDark = document.body.classList.toggle("theme-dark");
    try {
      window.localStorage.setItem("insurance-ui-theme", isDark ? "dark" : "light");
    } catch (_) {
      // ignore
    }
  });
}

/**
 * 初始化 Hero CTA
 * @returns {void}
 */
function initHeroCta() {
  var btn = document.getElementById("hero-cta");
  if (!btn) {
    return;
  }
  btn.addEventListener("click", function () {
    pendingShowModules = true;
    if (cachedConfig) {
      renderModules(cachedConfig.insurance_data || []);
    }
    scrollToId("features");
  });
}

/**
 * 初始化页脚年份
 * @returns {void}
 */
function initFooterYear() {
  var el = document.getElementById("year");
  if (!el) {
    return;
  }
  el.textContent = String(new Date().getFullYear());
}

/**
 * 渲染顶部标题
 * @param {InsuranceConfigRoot} cfg
 * @returns {void}
 */
function renderHero(cfg) {
  var titleEl = document.getElementById("tool-title");
  var subtitleEl = document.getElementById("tool-subtitle");
  if (titleEl) {
    titleEl.textContent = cfg.main_title || "多层次保障科普小工具";
  }
  if (subtitleEl) {
    // Hero 下的解释文案：保持克制（可后续做成 JSON 字段）
    subtitleEl.textContent = subtitleEl.textContent || "";
  }
}

/**
 * 渲染所有二级模块 sections（3 大模块）
 * @param {Array<InsuranceModule>} modules
 * @returns {void}
 */
function renderModules(modules) {
  var root = document.getElementById("content-root");
  if (!root) {
    return;
  }
  root.innerHTML = "";

  modules.forEach(function (mod) {
    root.appendChild(renderModuleCard(mod));
  });
}

/**
 * 二级模块配图占位（你后续可替换 assets 或扩展 JSON 字段）
 * @param {string} insuranceType
 * @returns {string}
 */
function getModuleImage(insuranceType) {
  if (insuranceType.indexOf("居民") !== -1) {
    return "./assets/basic-medical.svg";
  }
  if (insuranceType.indexOf("惠民") !== -1) {
    return "./assets/hui-min-bao.svg";
  }
  return "./assets/commercial-insurance.svg";
}

/**
 * 获取模块风格 class（用于不同渐变/强调色）
 * @param {string} insuranceType
 * @returns {string}
 */
function getModuleClass(insuranceType) {
  if (insuranceType.indexOf("居民") !== -1) {
    return "module--basic";
  }
  if (insuranceType.indexOf("惠民") !== -1) {
    return "module--hmb";
  }
  return "module--commercial";
}

/**
 * 将 summary 对象格式化为“少量要点”，便于扫读
 * @param {Record<string, string> | undefined} summary
 * @returns {Array<{label: string, text: string}>}
 */
function formatSummary(summary) {
  if (!summary) {
    return [];
  }
  var preferred = ["作用", "亮点", "局限"];
  /** @type {Array<{label: string, text: string}>} */
  var pairs = [];

  preferred.forEach(function (k) {
    if (summary[k]) {
      pairs.push({ label: k, text: String(summary[k]) });
    }
  });

  // 补齐其它字段（最多 3 条）
  Object.keys(summary).forEach(function (k) {
    if (preferred.indexOf(k) !== -1) {
      return;
    }
    if (pairs.length >= 3) {
      return;
    }
    if (summary[k]) {
      pairs.push({ label: k, text: String(summary[k]) });
    }
  });

  return pairs.slice(0, 3);
}

/**
 * 渲染 summary 为两到三行要点（带行数截断）
 * @param {Array<{label: string, text: string}>} pairs
 * @returns {HTMLElement}
 */
function renderSummaryBlock(pairs) {
  var wrap = document.createElement("div");
  wrap.className = "module-summary";

  if (!pairs.length) {
    return wrap;
  }

  pairs.forEach(function (p) {
    var row = document.createElement("div");
    row.className = "summary-row";

    var label = document.createElement("span");
    label.className = "summary-label";
    label.textContent = p.label;

    var text = document.createElement("span");
    text.className = "summary-text";
    text.textContent = p.text;

    row.appendChild(label);
    row.appendChild(text);
    wrap.appendChild(row);
  });

  return wrap;
}

/**
 * 渲染单个二级模块 section
 * @param {InsuranceModule} mod
 * @returns {HTMLElement}
 */
function renderModuleCard(mod) {
  var card = document.createElement("section");
  card.className = "card module " + getModuleClass(mod.insurance_type);

  var actions = document.createElement("div");
  actions.className = "module-actions";

  var header = document.createElement("div");
  header.className = "module-header";

  var title = document.createElement("h2");
  title.className = "module-title";
  title.textContent = mod.insurance_type;

  var summary = renderSummaryBlock(formatSummary(mod.summary));

  header.appendChild(title);
  header.appendChild(summary);

  // 子分支按钮（sub_branches.title）
  (mod.sub_branches || []).forEach(function (branch) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "linkish";

    var left = document.createElement("span");
    left.textContent = branch.title;

    var right = document.createElement("small");
    right.textContent = "点击查看";

    btn.appendChild(left);
    btn.appendChild(right);

    btn.addEventListener("click", function () {
      var panel = card.querySelector("[data-branch-panel='1']");
      var all = actions.querySelectorAll(".linkish");

      var isActive = btn.classList.contains("active");
      if (isActive && panel) {
        all.forEach(function (x) {
          x.classList.remove("active");
        });
        panel.hidden = true;
        panel.innerHTML = "";
        panel.removeAttribute("data-current-branch");
        return;
      }

      all.forEach(function (x) {
        x.classList.remove("active");
      });
      btn.classList.add("active");
      renderBranchPanel(card, mod, branch);
    });

    actions.appendChild(btn);
  });

  card.appendChild(header);
  card.appendChild(actions);

  var bottomLink = document.createElement("a");
  bottomLink.className = "module-link";
  bottomLink.href = "javascript:void(0)";
  bottomLink.textContent = "查看该模块内容 →";
  bottomLink.addEventListener("click", function (e) {
    e.preventDefault();
    var first = actions.querySelector(".linkish");
    if (first) {
      first.click();
    }
  });
  card.appendChild(bottomLink);

  var panel = document.createElement("div");
  panel.className = "branch-panel";
  panel.hidden = true;
  panel.setAttribute("data-branch-panel", "1");
  card.appendChild(panel);

  return card;
}

/**
 * 在模块卡片内渲染“子分支详情面板”（三级标题点开后显示）
 * @param {HTMLElement} card
 * @param {InsuranceModule} mod
 * @param {InsuranceBranch} branch
 * @returns {void}
 */
function renderBranchPanel(card, mod, branch) {
  var panel = card.querySelector("[data-branch-panel='1']");
  if (!panel) {
    return;
  }
  panel.setAttribute("data-current-branch", slugify(branch.title));
  panel.innerHTML = "";
  panel.hidden = false;

  var h = document.createElement("h3");
  h.className = "branch-title";
  h.textContent = branch.title;
  panel.appendChild(h);

  if (branch.description) {
    var p = document.createElement("p");
    p.className = "text";
    p.textContent = branch.description;
    panel.appendChild(p);
  }

  if (branch.content) {
    panel.appendChild(renderTextWithCtas(branch.content));
  }

  if (branch.links && branch.links.length) {
    panel.appendChild(renderBranchLinks(branch.links));
  }

  if (branch.content_detail && typeof branch.content_detail === "object") {
    var keys = Object.keys(branch.content_detail);
    if (keys.length) {
      /** @type {Array<{key: string, label: string}>} */
      var items = keys.map(function (k) {
        var v = branch.content_detail[k];
        var label = k;
        if (v && typeof v === "object" && "header" in v && v.header) {
          label = String(v.header);
        } else if (/^part\d+$/i.test(k)) {
          label = "内容";
        }
        return { key: k, label: label };
      });

      var row = document.createElement("div");
      row.className = "pill-row";

      var content = document.createElement("div");
      content.className = "block";
      content.setAttribute("data-detail-content", "1");

      items.forEach(function (it, idx) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "pill-btn" + (idx === 0 ? " active" : "");
        b.textContent = it.label;
        b.addEventListener("click", function () {
          var all = row.querySelectorAll(".pill-btn");
          all.forEach(function (x) {
            x.classList.remove("active");
          });
          b.classList.add("active");
          content.innerHTML = "";
          content.appendChild(renderValue(branch.content_detail[it.key]));
        });
        row.appendChild(b);
      });

      // 默认展示第一个
      content.appendChild(renderValue(branch.content_detail[items[0].key]));

      panel.appendChild(row);
      panel.appendChild(content);
    }
  }
}

/**
 * 将 links 渲染成“按钮跳转/复制”，避免直接露出网址
 * @param {Array<string>} links
 * @returns {HTMLElement}
 */
function renderBranchLinks(links) {
  var wrap = document.createElement("div");
  wrap.className = "link-grid";

  links.forEach(function (raw) {
    var parsed = parseLinkLine(raw);
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "link-btn";

    var left = document.createElement("span");
    left.className = "link-btn-title";
    left.textContent = parsed.label || "跳转";

    var right = document.createElement("small");
    right.className = "link-btn-meta";
    right.textContent = parsed.kind === "open" ? "打开" : parsed.kind === "copy" ? "复制" : "待补充";

    btn.appendChild(left);
    btn.appendChild(right);

    if (parsed.kind === "open" && parsed.target) {
      btn.addEventListener("click", function () {
        window.open(parsed.target, "_blank", "noopener,noreferrer");
      });
    } else if (parsed.kind === "copy" && parsed.target) {
      btn.addEventListener("click", function () {
        copyToClipboard(parsed.target).then(function () {
          right.textContent = "已复制";
          window.setTimeout(function () {
            right.textContent = "复制";
          }, 1200);
        });
      });
    } else {
      btn.disabled = true;
      btn.classList.add("is-disabled");
    }

    wrap.appendChild(btn);
  });

  return wrap;
}

/**
 * 解析类似 “[1]. 上海：#小程序://xxx” 或 “杭州：https://...” 的行
 * @param {string} line
 * @returns {{label: string, kind: "open"|"copy"|"none", target: string}}
 */
function parseLinkLine(line) {
  var text = String(line || "").trim();
  text = text.replace(/^\[\d+\]\.\s*/, "").replace(/^\(\d+\)\s*/, "");

  var label = text;
  var target = "";

  // 优先按中文冒号切分
  var parts = text.split("：");
  if (parts.length >= 2) {
    label = parts[0].trim();
    target = parts.slice(1).join("：").trim();
  }

  var http = (target || text).match(/https?:\/\/[^\s)]+/);
  if (http && http[0]) {
    return { label: label, kind: "open", target: http[0] };
  }

  // 小程序 schema（浏览器无法直接打开，改为复制）
  var mini = (target || text).match(/#小程序:\/\/[^\s)]+/);
  if (mini && mini[0]) {
    return { label: label, kind: "copy", target: mini[0] };
  }

  // 没有可用链接
  return { label: label, kind: "none", target: "" };
}

/**
 * 复制到剪贴板（兼容性降级）
 * @param {string} text
 * @returns {Promise<void>}
 */
function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text);
  }
  return new Promise(function (resolve, reject) {
    try {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      resolve();
    } catch (e) {
      reject(e);
    }
  });
}

/**
 * 把包含 URL 的文本渲染为 “文本 + CTA 按钮”
 * @param {string} text
 * @returns {HTMLElement}
 */
function renderTextWithCtas(text) {
  var wrap = document.createElement("div");

  var urls = extractUrls(text);
  var clean = text;
  urls.forEach(function (u) {
    clean = clean.replace(u, "").replace(/\s{2,}/g, " ").trim();
  });

  if (clean) {
    var p = document.createElement("p");
    p.className = "text";
    p.textContent = clean;
    wrap.appendChild(p);
  }

  urls.forEach(function (u) {
    var a = document.createElement("a");
    a.className = "cta";
    a.href = u;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.textContent = guessCtaLabel(clean) || "打开链接";
    wrap.appendChild(a);
  });

  if (!clean && !urls.length) {
    var p2 = document.createElement("p");
    p2.className = "text";
    p2.textContent = text;
    wrap.appendChild(p2);
  }

  return wrap;
}

/**
 * 猜测 CTA 按钮文案（尽量贴近医疗/咨询语境）
 * @param {string} context
 * @returns {string}
 */
function guessCtaLabel(context) {
  var t = String(context || "");
  if (t.indexOf("咨询") !== -1 || t.indexOf("入口") !== -1) {
    return "咨询入口";
  }
  if (t.indexOf("下载") !== -1) {
    return "下载";
  }
  if (t.indexOf("官网") !== -1) {
    return "打开官网";
  }
  return "打开链接";
}

/**
 * 从字符串中提取 URL（http/https）
 * @param {string} text
 * @returns {Array<string>}
 */
function extractUrls(text) {
  var m = String(text || "").match(/https?:\/\/[^\s)]+/g);
  return m ? Array.from(new Set(m)) : [];
}

/** @type {InsuranceConfigRoot | null} */
var cachedConfig = null;
/** @type {boolean} */
var pendingShowModules = false;

/**
 * 渲染三级标题手风琴（sub_branches）
 * @param {InsuranceModule} mod
 * @returns {HTMLElement}
 */
// 已由“卡片 + 子分支按钮 + 类型 pills”取代旧的手风琴渲染

/**
 * 渲染单个四级条目（details/summary）
 * @param {string} title
 * @param {any} value
 * @returns {HTMLElement}
 */
function renderDetailItem(title, value) {
  var details = document.createElement("details");
  details.className = "acc-item acc-item-4";

  var summary = document.createElement("summary");
  summary.className = "acc-summary acc-summary-4";

  var h4 = document.createElement("div");
  h4.className = "acc-title h4";
  h4.textContent = title;

  summary.appendChild(h4);
  details.appendChild(summary);

  var body = document.createElement("div");
  body.className = "acc-body acc-body-4";
  body.appendChild(renderValue(value));

  details.appendChild(body);
  return details;
}

/**
 * 根据 value 类型渲染内容（DOM）
 * @param {any} value
 * @returns {HTMLElement}
 */
function renderValue(value) {
  if (value == null) {
    var empty = document.createElement("p");
    empty.className = "text";
    empty.textContent = "暂无内容。";
    return empty;
  }

  if (typeof value === "string") {
    return renderNumberedText(value);
  }

  if (Array.isArray(value)) {
    // 数组：可能是药品对象数组，或字符串数组
    if (value.length && typeof value[0] === "object" && value[0]) {
      // 试图识别药品列表结构
      if ("drug_name" in value[0]) {
        return renderDrugTable(/** @type {Array<InsuranceBranchDrug>} */ (value));
      }
      // 识别条件列表（name/text）
      if ("name" in value[0] && "text" in value[0]) {
        return renderNestedAccordionFromNamedText(value);
      }
    }

    // 普通字符串数组
    var allStrings = value.every(function (item) {
      return typeof item === "string";
    });

    if (allStrings && shouldRenderAsProductCards(/** @type {Array<string>} */ (value))) {
      return renderProductCardsFromStrings(/** @type {Array<string>} */ (value));
    }

    var ul = document.createElement("ul");
    ul.className = "list";
    value.forEach(function (item) {
      var li = document.createElement("li");
      li.textContent = typeof item === "string" ? item : JSON.stringify(item);
      ul.appendChild(li);
    });
    return ul;
  }

  if (typeof value === "object") {
    // 对象：可能是 {header,text}, {header,conditions/strategies}, 或任意分段 part1/part2
    if ("header" in value) {
      return renderHeaderObject(value);
    }
    // 多段 partX：用更深一层手风琴（仍然点击展开）
    return renderContentDetailAccordion(value);
  }

  var fallback = document.createElement("p");
  fallback.className = "text";
  fallback.textContent = String(value);
  return fallback;
}

/**
 * 渲染药品表格
 * @param {Array<InsuranceBranchDrug>} drugs
 * @returns {HTMLElement}
 */
function renderDrugTable(drugs) {
  var table = document.createElement("table");
  table.innerHTML =
    "<thead><tr><th>药品</th><th>适用/条件</th><th>有效期</th></tr></thead><tbody></tbody>";
  var tbody = table.querySelector("tbody");
  if (!tbody) {
    return table;
  }

  drugs.forEach(function (d) {
    var tr = document.createElement("tr");
    var td1 = document.createElement("td");
    td1.textContent = d.drug_name || "";

    var td2 = document.createElement("td");
    td2.innerHTML = formatConditionHtml(d.condition);

    var td3 = document.createElement("td");
    td3.textContent = d.validity || "";

    tr.appendChild(td1);
    tr.appendChild(td2);
    tr.appendChild(td3);
    tbody.appendChild(tr);
  });

  return table;
}

/**
 * 渲染 {header,text/conditions/strategies} 这类对象
 * @param {any} obj
 * @returns {HTMLElement}
 */
function renderHeaderObject(obj) {
  var wrap = document.createElement("div");

  var title = document.createElement("div");
  title.className = "block-title";
  title.textContent = obj.header || "";
  wrap.appendChild(title);

  if (obj.text) {
    var p = document.createElement("p");
    p.className = "text";
    p.textContent = obj.text;
    wrap.appendChild(p);
  }

  if (obj.conditions && Array.isArray(obj.conditions)) {
    wrap.appendChild(renderNestedAccordionFromNamedText(obj.conditions));
  }

  if (obj.strategies && Array.isArray(obj.strategies)) {
    wrap.appendChild(renderStrategiesCompact(obj.strategies));
  }

  return wrap;
}

/**
 * 将 strategies 渲染为“要点标题 + 点击展开详情”，减少首屏字数
 * @param {Array<string>} strategies
 * @returns {HTMLElement}
 */
function renderStrategiesCompact(strategies) {
  var container = document.createElement("div");
  container.className = "compact-list";

  strategies.forEach(function (raw) {
    var parsed = splitTitleAndDetail(raw);

    var d = document.createElement("details");
    d.className = "compact-item";

    var s = document.createElement("summary");
    s.className = "compact-summary";

    var t = document.createElement("div");
    t.className = "compact-title";
    t.textContent = parsed.title;
    s.appendChild(t);
    d.appendChild(s);

    var body = document.createElement("div");
    body.className = "compact-body";

    var p = document.createElement("p");
    p.className = "text";
    p.textContent = parsed.detail;
    body.appendChild(p);

    d.appendChild(body);
    container.appendChild(d);
  });

  return container;
}

/**
 * 从“1.xxx：yyy”中拆分标题与详情
 * @param {string} text
 * @returns {{title: string, detail: string}}
 */
function splitTitleAndDetail(text) {
  var t = String(text || "").trim();
  // 去掉前缀编号（1. / 1、 / 1)）
  t = t.replace(/^\s*\d+[\.\、\)]\s*/, "");
  var parts = t.split("：");
  if (parts.length >= 2) {
    var title = parts[0].trim();
    var detail = parts.slice(1).join("：").trim();
    return { title: title || "要点", detail: detail || "" };
  }
  // 无冒号：标题取前 18 字，全文做详情
  var shortTitle = t.slice(0, 18) + (t.length > 18 ? "…" : "");
  return { title: shortTitle || "要点", detail: t };
}

/**
 * 将 1）2）3） 这种条件分点渲染为列表
 * @param {string | undefined} condition
 * @returns {string}
 */
function formatConditionHtml(condition) {
  var text = String(condition || "").trim();
  if (!text) {
    return "";
  }
  if (text.match(/\d）/)) {
    var parts = text.split(/\s*\d）/).filter(Boolean);
    var items = parts.map(function (part, idx) {
      return "<li>" + (idx + 1) + "）" + escapeHtml(part.trim()) + "</li>";
    }).join("");
    return "<ul class=\"list\">" + items + "</ul>";
  }
  return escapeHtml(text);
}

/**
 * 按编号拆成段落或列表（用于长字符串，如“专家建议”等）
 * @param {string} text
 * @returns {HTMLElement}
 */
function renderNumberedText(text) {
  var t = String(text || "").trim();

  // 处理 PS 提示
  var psIndex = t.indexOf("PS：");
  var psText = "";
  if (psIndex === -1) {
    psIndex = t.indexOf("Ps：");
  }
  if (psIndex !== -1) {
    psText = t.slice(psIndex).trim();
    t = t.slice(0, psIndex).trim();
  }

  // 特殊处理包含 WHY？ / What？ 的说明
  if (t.indexOf("WHY？") !== -1 || t.indexOf("What？") !== -1) {
    var wrapWhy = document.createElement("div");

    var before = t.split("WHY？")[0];
    if (before.trim()) {
      var pb = document.createElement("p");
      pb.className = "text";
      pb.textContent = before.trim();
      wrapWhy.appendChild(pb);
    }

    var rest = t.slice(t.indexOf("WHY？"));
    var segs = rest.split(/(WHY？|What？)/).filter(Boolean);
    for (var i = 0; i < segs.length; i += 2) {
      var label = segs[i];
      var content = segs[i + 1] || "";
      var pLabel = document.createElement("p");
      pLabel.className = "tip-heading";
      pLabel.textContent = label;
      wrapWhy.appendChild(pLabel);

      if (content.trim()) {
        var pContent = document.createElement("p");
        pContent.className = "text";
        pContent.textContent = content.trim();
        wrapWhy.appendChild(pContent);
      }
    }

    if (psText) {
      var psP = document.createElement("p");
      psP.className = "tip-text";
      psP.textContent = psText;
      wrapWhy.appendChild(psP);
    }

    return wrapWhy;
  }

  // 检测是否存在多个编号 1. / 1、 / 1)
  var numbered = t.match(/\d[\.、\)]/g);
  if (numbered && numbered.length >= 2) {
    var intro = "";
    var body = t;
    var introSplit = t.split(/：/);
    if (introSplit.length > 1) {
      intro = introSplit[0] + "：";
      body = introSplit.slice(1).join("：");
    }

    var parts = body.split(/\s*\d[\.、\)]\s*/).filter(Boolean);
    var ul = document.createElement("ul");
    ul.className = "list";
    parts.forEach(function (part) {
      var li = document.createElement("li");
      li.textContent = part.trim();
      ul.appendChild(li);
    });

    var wrap = document.createElement("div");
    if (intro) {
      var p = document.createElement("p");
      p.className = "text";
      p.textContent = intro;
      wrap.appendChild(p);
    }
    wrap.appendChild(ul);

    if (psText) {
      var psNode = document.createElement("p");
      psNode.className = "tip-text";
      psNode.textContent = psText;
      wrap.appendChild(psNode);
    }

    return wrap;
  }

  var p2 = document.createElement("p");
  p2.className = "text";
  p2.textContent = psText ? t : t;
  // 如果有 PS，仅在后面追加小贴士
  if (psText) {
    var wrapSingle = document.createElement("div");
    wrapSingle.appendChild(p2);
    var psNode2 = document.createElement("p");
    psNode2.className = "tip-text";
    psNode2.textContent = psText;
    wrapSingle.appendChild(psNode2);
    return wrapSingle;
  }
  return p2;
}

/**
 * 判断是否适合用“小卡片”展示的产品数组
 * @param {Array<string>} items
 * @returns {boolean}
 */
function shouldRenderAsProductCards(items) {
  if (!items.length || items.length > 6) {
    return false;
  }
  return items.every(function (s) {
    return typeof s === "string" && s.indexOf("：") !== -1;
  });
}

/**
 * 将 ["产品名：描述", ...] 渲染为小卡片
 * @param {Array<string>} items
 * @returns {HTMLElement}
 */
function renderProductCardsFromStrings(items) {
  var wrap = document.createElement("div");
  wrap.className = "product-cards";

  items.forEach(function (raw) {
    var text = String(raw || "");
    var parts = text.split("：");
    var title = parts[0].trim();
    var desc = parts.slice(1).join("：").trim();

    var card = document.createElement("div");
    card.className = "product-card";

    var h = document.createElement("div");
    h.className = "product-title";
    h.textContent = title;

    var p = document.createElement("div");
    p.className = "product-desc";
    p.textContent = desc;

    card.appendChild(h);
    card.appendChild(p);
    wrap.appendChild(card);
  });

  return wrap;
}

/**
 * 把 [{name,text}] 渲染为更深一层可点开的列表（增强美观与信息密度控制）
 * @param {Array<{name: string, text: string}>} items
 * @returns {HTMLElement}
 */
function renderNestedAccordionFromNamedText(items) {
  var container = document.createElement("div");
  container.className = "accordion accordion-level-5";

  items.forEach(function (it) {
    var d = document.createElement("details");
    d.className = "acc-item acc-item-5";

    var s = document.createElement("summary");
    s.className = "acc-summary acc-summary-5";

    var t = document.createElement("div");
    t.className = "acc-title h5";
    t.textContent = it.name || "";
    s.appendChild(t);

    d.appendChild(s);

    var b = document.createElement("div");
    b.className = "acc-body acc-body-5";
    var p = document.createElement("p");
    p.className = "text";
    p.textContent = it.text || "";
    b.appendChild(p);
    d.appendChild(b);

    container.appendChild(d);
  });

  return container;
}

/**
 * 加载配置并渲染页面
 * @returns {Promise<void>}
 */
async function initApp() {
  /** @type {InsuranceConfigRoot} */
  var root = await fetch("./insurance_config.json").then(function (r) {
    if (!r.ok) {
      throw new Error("无法加载 insurance_config.json: " + r.status);
    }
    return r.json();
  });

  cachedConfig = root;
  renderHero(root);

  if (pendingShowModules) {
    renderModules(root.insurance_data || []);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  initThemeToggle();
  initHeroCta();
  initFooterYear();
  initApp().catch(function (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    var content = document.getElementById("content-root");
    if (content) {
      content.innerHTML =
        "<div class=\"card\">" +
        "<div class=\"card-title\">加载失败</div>" +
        "<div class=\"card-desc\">请检查 <code>insurance_config.json</code> 是否存在，以及路径是否正确。</div>" +
        "</div>";
    }
  });
});


