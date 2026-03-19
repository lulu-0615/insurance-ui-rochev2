/**
 * @typedef {Object} AppListItem
 * @property {string} id
 * @property {string} title
 * @property {string} [subtitle]
 * @property {Array<string>} [bullets]
 * @property {Array<string>} [tips]
 * @property {string} [right]
 * @property {string} [link]
 * @property {"open"|"copy"} [link_kind]
 */

/**
 * @typedef {Object} AppTab
 * @property {string} id
 * @property {string} title
 * @property {Array<AppListItem>} items
 */

/**
 * @typedef {Object} AppAccordionItem
 * @property {string} id
 * @property {string} title
 * @property {string} [subtitle]
 * @property {Array<AppTab>} tabs
 */

/**
 * @typedef {Object} AppModule
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {Array<AppAccordionItem>} accordion
 */

/**
 * @typedef {Object} InsuranceConfigRoot
 * @property {string} main_title
 * @property {Array<AppModule>} modules
 */

/** @type {InsuranceConfigRoot | null} */
var cachedConfig = null;
/** @type {boolean} */
var pendingShowModules = false;

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
 * 初始化 Hero CTA：点击后才渲染卡片
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
      renderModules(cachedConfig.modules || []);
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
 * 渲染 Hero 标题
 * @param {InsuranceConfigRoot} cfg
 * @returns {void}
 */
function renderHero(cfg) {
  var titleEl = document.getElementById("tool-title");
  if (titleEl) {
    titleEl.textContent = cfg.main_title || "多层次保障科普小工具";
  }
}

/**
 * 渲染所有一级模块卡片
 * @param {Array<AppModule>} modules
 * @returns {void}
 */
function renderModules(modules) {
  var root = document.getElementById("content-root");
  if (!root) {
    return;
  }
  root.innerHTML = "";

  modules.forEach(function (mod) {
    root.appendChild(renderAppModuleCard(mod));
  });
}

/**
 * 一级：模块卡片
 * @param {AppModule} mod
 * @returns {HTMLElement}
 */
function renderAppModuleCard(mod) {
  var card = document.createElement("section");
  card.className = "card module";

  var header = document.createElement("div");
  header.className = "module-header module-header-centered";

  var title = document.createElement("h2");
  title.className = "module-title module-title-centered";
  title.textContent = mod.title;

  var desc = renderL1Description(mod.description || "");

  header.appendChild(title);
  header.appendChild(desc);
  card.appendChild(header);

  var acc = document.createElement("div");
  acc.className = "module-accordion";

  (mod.accordion || []).forEach(function (a) {
    acc.appendChild(renderAccordionItem(a));
  });

  card.appendChild(acc);
  return card;
}

/**
 * 一级说明：把“作用：xxx\\n局限：yyy”渲染成左标签右内容的轻量表格
 * @param {string} text
 * @returns {HTMLElement}
 */
function renderL1Description(text) {
  var wrap = document.createElement("div");
  wrap.className = "module-l1-desc";

  var t = String(text || "").trim();
  if (!t) {
    return wrap;
  }

  var lines = t.split(/\n+/).map(function (x) { return x.trim(); }).filter(Boolean);
  if (!lines.length) {
    return wrap;
  }

  var table = document.createElement("div");
  table.className = "desc-table";

  lines.forEach(function (line) {
    var parts = line.split("：");
    var label = parts[0] ? parts[0].trim() : "";
    var value = parts.slice(1).join("：").trim();

    var row = document.createElement("div");
    row.className = "desc-row";

    var l = document.createElement("div");
    l.className = "desc-label";
    l.textContent = label || "说明";

    var v = document.createElement("div");
    v.className = "desc-value";
    v.textContent = value || line;

    row.appendChild(l);
    row.appendChild(v);
    table.appendChild(row);
  });

  wrap.appendChild(table);
  return wrap;
}

/**
 * 二级：手风琴条目（details）
 * @param {AppAccordionItem} item
 * @returns {HTMLElement}
 */
function renderAccordionItem(item) {
  var d = document.createElement("details");
  d.className = "acc2";

  var s = document.createElement("summary");
  s.className = "acc2-summary";

  var left = document.createElement("div");
  left.className = "acc2-left";

  var t = document.createElement("div");
  t.className = "acc2-title";
  t.textContent = item.title;
  left.appendChild(t);

  if (item.subtitle) {
    var sub = document.createElement("div");
    sub.className = "acc2-subtitle";
    sub.textContent = item.subtitle;
    left.appendChild(sub);
  }

  s.appendChild(left);
  d.appendChild(s);

  var body = document.createElement("div");
  body.className = "acc2-body";
  body.appendChild(renderMobileServiceCard(item));
  d.appendChild(body);

  return d;
}

/**
 * 三级：移动端服务组件卡片（segmented + swiper + dots）
 * @param {AppAccordionItem} item
 * @returns {HTMLElement}
 */
function renderMobileServiceCard(item) {
  var wrap = document.createElement("div");
  wrap.className = "svc-card";

  var header = document.createElement("div");
  header.className = "svc-header";

  var seg = document.createElement("div");
  seg.className = "segmented";

  var indicator = document.createElement("div");
  indicator.className = "seg-indicator";
  seg.appendChild(indicator);

  var track = document.createElement("div");
  track.className = "carousel";
  track.setAttribute("role", "region");
  track.setAttribute("aria-label", "内容分页");

  var dots = document.createElement("div");
  dots.className = "dots";

  var tabs = item.tabs || [];
  var tabButtons = [];
  var dotEls = [];

  tabs.forEach(function (tab, idx) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "seg-btn" + (idx === 0 ? " active" : "");
    b.textContent = tab.title;
    b.addEventListener("click", function () {
      scrollCarouselTo(track, idx);
      setActiveIndex(idx);
    });
    tabButtons.push(b);
    seg.appendChild(b);

    var page = document.createElement("div");
    page.className = "carousel-page";
    page.appendChild(renderListView(tab.items || []));
    track.appendChild(page);

    var dot = document.createElement("button");
    dot.type = "button";
    dot.className = "dot" + (idx === 0 ? " active" : "");
    dot.addEventListener("click", function () {
      scrollCarouselTo(track, idx);
      setActiveIndex(idx);
    });
    dotEls.push(dot);
    dots.appendChild(dot);
  });

  function setActiveIndex(idx) {
    tabButtons.forEach(function (x, i) {
      x.classList.toggle("active", i === idx);
    });
    dotEls.forEach(function (x, i) {
      x.classList.toggle("active", i === idx);
    });
    if (tabButtons[idx]) {
      positionIndicator(indicator, tabButtons[idx]);
    }
  }

  track.addEventListener("scroll", function () {
    var idx = Math.round(track.scrollLeft / Math.max(1, track.clientWidth));
    idx = Math.min(Math.max(idx, 0), tabs.length - 1);
    setActiveIndex(idx);
  }, { passive: true });

  window.setTimeout(function () {
    if (tabButtons[0]) {
      positionIndicator(indicator, tabButtons[0]);
    }
  }, 0);

  header.appendChild(seg);
  wrap.appendChild(header);
  wrap.appendChild(track);
  wrap.appendChild(dots);
  return wrap;
}

/**
 * 四级：list view（圆形图标 + 主标题 + 副标题 + 右侧文本）
 * @param {Array<AppListItem>} items
 * @returns {HTMLElement}
 */
function renderListView(items) {
  var ul = document.createElement("div");
  ul.className = "listview";

  items.forEach(function (it) {
    var row = document.createElement("div");
    row.className = "lv-row";

    var main = document.createElement("div");
    main.className = "lv-main";

    var top = document.createElement("div");
    top.className = "lv-top";

    var title = document.createElement("div");
    title.className = "lv-title";
    title.textContent = it.title;
    top.appendChild(title);

    if (it.right) {
      var right = document.createElement("div");
      right.className = "lv-right";
      right.textContent = it.right;
      top.appendChild(right);
    }

    main.appendChild(top);

    if (it.subtitle) {
      var sub = document.createElement("div");
      sub.className = "lv-subtitle";
      sub.textContent = it.subtitle;
      main.appendChild(sub);
    }

    if (it.bullets && it.bullets.length) {
      var bl = document.createElement("ul");
      bl.className = "lv-bullets";
      it.bullets.forEach(function (b) {
        var li = document.createElement("li");
        li.textContent = b;
        bl.appendChild(li);
      });
      main.appendChild(bl);
    }

    if (it.tips && it.tips.length) {
      var tips = document.createElement("div");
      tips.className = "lv-tips";
      it.tips.forEach(function (t) {
        var p = document.createElement("div");
        p.className = "lv-tip";
        p.textContent = t;
        tips.appendChild(p);
      });
      main.appendChild(tips);
    }

    if (it.link) {
      var actions = document.createElement("div");
      actions.className = "lv-actions";
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "lv-link";
      btn.textContent = it.link_kind === "copy" ? "复制链接" : "打开链接";
      btn.addEventListener("click", function () {
        if (it.link_kind === "copy") {
          copyToClipboard(it.link || "");
        } else {
          window.open(it.link, "_blank", "noopener,noreferrer");
        }
      });
      actions.appendChild(btn);
      main.appendChild(actions);
    }

    row.appendChild(main);
    ul.appendChild(row);
  });

  return ul;
}

/**
 * carousel 滚动到指定页
 * @param {HTMLElement} track
 * @param {number} idx
 * @returns {void}
 */
function scrollCarouselTo(track, idx) {
  track.scrollTo({ left: idx * track.clientWidth, behavior: "smooth" });
}

/**
 * indicator 对齐到当前 segmented 按钮
 * @param {HTMLElement} indicator
 * @param {HTMLElement} btn
 * @returns {void}
 */
function positionIndicator(indicator, btn) {
  var rect = btn.getBoundingClientRect();
  var parentRect = btn.parentElement ? btn.parentElement.getBoundingClientRect() : rect;
  indicator.style.width = rect.width + "px";
  indicator.style.transform = "translateX(" + (rect.left - parentRect.left) + "px)";
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
    renderModules(root.modules || []);
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

