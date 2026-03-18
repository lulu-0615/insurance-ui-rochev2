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
    subtitleEl.textContent = "选择一个模块，按需展开三级/四级内容，快速定位你要的信息。";
  }
}

/**
 * 渲染二级模块导航（chips）
 * @param {Array<InsuranceModule>} modules
 * @returns {void}
 */
function renderCategoryToc(modules) {
  var container = document.getElementById("category-toc");
  if (!container) {
    return;
  }
  container.innerHTML = "";

  modules.forEach(function (mod) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "chip";
    btn.textContent = mod.insurance_type;
    var modId = "mod-" + slugify(mod.insurance_type);
    btn.addEventListener("click", function () {
      scrollToId(modId);
    });
    container.appendChild(btn);
  });
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
    root.appendChild(renderModuleSection(mod));
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
 * 将 summary 对象格式化成一段简介文字
 * @param {Record<string, string> | undefined} summary
 * @returns {string}
 */
function formatSummary(summary) {
  if (!summary) {
    return "";
  }
  var keys = Object.keys(summary);
  if (!keys.length) {
    return "";
  }
  return keys.map(function (k) {
    return k + "：" + (summary[k] || "");
  }).join(" ");
}

/**
 * 渲染单个二级模块 section
 * @param {InsuranceModule} mod
 * @returns {HTMLElement}
 */
function renderModuleSection(mod) {
  var wrapper = document.createElement("section");
  wrapper.className = "card module " + getModuleClass(mod.insurance_type);
  wrapper.id = "mod-" + slugify(mod.insurance_type);

  var grid = document.createElement("div");
  grid.className = "section";

  var left = document.createElement("div");
  left.className = "section-copy";

  var title = document.createElement("h2");
  title.className = "h2";
  title.textContent = mod.insurance_type;

  var desc = document.createElement("p");
  desc.className = "h2-desc";
  desc.textContent = formatSummary(mod.summary) || "";

  var tools = document.createElement("div");
  tools.className = "section-tools";

  var select = document.createElement("select");
  select.className = "select";
  select.setAttribute("aria-label", "三级标题索引");

  var defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "跳转到三级标题…";
  select.appendChild(defaultOption);

  (mod.sub_branches || []).forEach(function (branch) {
    var opt = document.createElement("option");
    opt.value = "branch-" + slugify(mod.insurance_type) + "-" + slugify(branch.title);
    opt.textContent = branch.title;
    select.appendChild(opt);
  });

  select.addEventListener("change", function () {
    if (!select.value) {
      return;
    }
    scrollToId(select.value);
    select.value = "";
  });

  tools.appendChild(select);

  left.appendChild(title);
  left.appendChild(desc);
  left.appendChild(tools);

  var right = document.createElement("div");
  right.className = "card image-card";

  var img = document.createElement("img");
  img.alt = mod.insurance_type + " 模块配图";
  img.loading = "lazy";
  img.src = getModuleImage(mod.insurance_type);

  right.appendChild(img);

  grid.appendChild(left);
  grid.appendChild(right);

  wrapper.appendChild(grid);

  // 三级标题：点击展开内容（默认全部折叠）
  wrapper.appendChild(renderBranchAccordion(mod));

  return wrapper;
}

/**
 * 渲染三级标题手风琴（sub_branches）
 * @param {InsuranceModule} mod
 * @returns {HTMLElement}
 */
function renderBranchAccordion(mod) {
  var container = document.createElement("div");
  container.className = "accordion accordion-level-3";

  (mod.sub_branches || []).forEach(function (branch) {
    container.appendChild(renderBranchItem(mod, branch));
  });

  return container;
}

/**
 * 渲染单个三级标题条目（details/summary）
 * @param {InsuranceModule} mod
 * @param {InsuranceBranch} branch
 * @returns {HTMLElement}
 */
function renderBranchItem(mod, branch) {
  var details = document.createElement("details");
  details.className = "acc-item";
  details.id = "branch-" + slugify(mod.insurance_type) + "-" + slugify(branch.title);

  var summary = document.createElement("summary");
  summary.className = "acc-summary";

  var title = document.createElement("div");
  title.className = "acc-title h3";
  title.textContent = branch.title;

  summary.appendChild(title);

  details.appendChild(summary);

  var body = document.createElement("div");
  body.className = "acc-body";

  if (branch.description) {
    var p = document.createElement("p");
    p.className = "topic-intro";
    p.textContent = branch.description;
    body.appendChild(p);
  }

  if (branch.content) {
    var p2 = document.createElement("p");
    p2.className = "text";
    p2.textContent = branch.content;
    body.appendChild(p2);
  }

  if (branch.links && branch.links.length) {
    var list = document.createElement("ul");
    list.className = "list";
    branch.links.forEach(function (l) {
      var li = document.createElement("li");
      li.textContent = l;
      list.appendChild(li);
    });
    body.appendChild(list);
  }

  if (branch.content_detail) {
    body.appendChild(renderContentDetailAccordion(branch.content_detail));
  }

  details.appendChild(body);
  return details;
}

/**
 * 渲染四级标题手风琴（content_detail 的第一层 key）
 * @param {Record<string, any>} detail
 * @returns {HTMLElement}
 */
function renderContentDetailAccordion(detail) {
  var container = document.createElement("div");
  container.className = "accordion accordion-level-4";

  Object.keys(detail).forEach(function (key) {
    container.appendChild(renderDetailItem(key, detail[key]));
  });

  return container;
}

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
    var p = document.createElement("p");
    p.className = "text";
    p.textContent = value;
    return p;
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
    tr.innerHTML =
      "<td>" + escapeHtml(d.drug_name || "") + "</td>" +
      "<td>" + escapeHtml(d.condition || "") + "</td>" +
      "<td>" + escapeHtml(d.validity || "") + "</td>";
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
    var ul = document.createElement("ul");
    ul.className = "list";
    obj.strategies.forEach(function (s) {
      var li = document.createElement("li");
      li.textContent = s;
      ul.appendChild(li);
    });
    wrap.appendChild(ul);
  }

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

  renderHero(root);
  renderCategoryToc(root.insurance_data || []);
  renderModules(root.insurance_data || []);
}

document.addEventListener("DOMContentLoaded", function () {
  initThemeToggle();
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

