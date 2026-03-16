/**
 * @typedef {Object} InsuranceDrug
 * @property {string} name
 * @property {string} [condition]
 * @property {string} [valid_from]
 * @property {string} [valid_to]
 */

/**
 * @typedef {Object} InsuranceRule
 * @property {string} category
 * @property {Array<InsuranceDrug>} [drugs]
 * @property {Array<string>} [tips]
 */

/**
 * @typedef {Object} PolicySection
 * @property {string} header
 * @property {string} [text]
 * @property {Array<string>} [tips]
 */

/**
 * @typedef {Object} InsuranceTopic
 * @property {string} id
 * @property {string} title
 * @property {string} content_type
 * @property {string} [introduction]
 * @property {Array<InsuranceRule>} [rules]
 * @property {Array<PolicySection>} [sections]
 * @property {Array<{name: string, url: string}>} [links]
 * @property {string} [text]
 * @property {string} [insurance_name]
 * @property {string} [condition]
 * @property {string} [next_step]
 * @property {string} [url]
 * @property {string} [highlights]
 * @property {Array<{name: string, drug: string}>} [products]
 */

/**
 * @typedef {Object} InsuranceCategory
 * @property {string} id
 * @property {string} insurance_type
 * @property {string} description
 * @property {string} image
 * @property {Array<InsuranceTopic>} sub_topics
 */

/**
 * @typedef {Object} InsuranceTool
 * @property {string} id
 * @property {string} title
 * @property {string} [subtitle]
 * @property {Array<InsuranceCategory>} categories
 */

/**
 * @typedef {Object} InsuranceConfigRoot
 * @property {InsuranceTool} insurance_tool
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
 * @param {InsuranceTool} tool
 * @returns {void}
 */
function renderHero(tool) {
  var titleEl = document.getElementById("tool-title");
  var subtitleEl = document.getElementById("tool-subtitle");
  if (titleEl) {
    titleEl.textContent = tool.title || "多层次保障科普小工具";
  }
  if (subtitleEl) {
    subtitleEl.textContent = tool.subtitle || "";
  }
}

/**
 * 渲染二级模块导航（chips）
 * @param {Array<InsuranceCategory>} categories
 * @returns {void}
 */
function renderCategoryToc(categories) {
  var container = document.getElementById("category-toc");
  if (!container) {
    return;
  }
  container.innerHTML = "";

  categories.forEach(function (cat) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "chip";
    btn.textContent = cat.insurance_type;
    btn.addEventListener("click", function () {
      scrollToId("cat-" + cat.id);
    });
    container.appendChild(btn);
  });
}

/**
 * 渲染所有二级模块 sections
 * @param {Array<InsuranceCategory>} categories
 * @returns {void}
 */
function renderCategories(categories) {
  var root = document.getElementById("content-root");
  if (!root) {
    return;
  }
  root.innerHTML = "";

  categories.forEach(function (cat) {
    root.appendChild(renderCategorySection(cat));
  });
}

/**
 * 渲染单个二级模块 section
 * @param {InsuranceCategory} category
 * @returns {HTMLElement}
 */
function renderCategorySection(category) {
  var wrapper = document.createElement("section");
  wrapper.className = "card";
  wrapper.id = "cat-" + category.id;

  var grid = document.createElement("div");
  grid.className = "section";

  var left = document.createElement("div");
  left.className = "section-copy";

  var title = document.createElement("h2");
  title.className = "h2";
  title.textContent = category.insurance_type;

  var desc = document.createElement("p");
  desc.className = "h2-desc";
  desc.textContent = category.description || "";

  var tools = document.createElement("div");
  tools.className = "section-tools";

  var select = document.createElement("select");
  select.className = "select";
  select.setAttribute("aria-label", "三级标题索引");

  var defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "跳转到三级标题…";
  select.appendChild(defaultOption);

  (category.sub_topics || []).forEach(function (topic) {
    var opt = document.createElement("option");
    opt.value = "topic-" + category.id + "-" + topic.id;
    opt.textContent = topic.title;
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
  img.alt = category.insurance_type + " 模块配图";
  img.loading = "lazy";
  img.src = category.image || "./assets/placeholder.svg";

  right.appendChild(img);

  grid.appendChild(left);
  grid.appendChild(right);

  wrapper.appendChild(grid);

  // topics
  (category.sub_topics || []).forEach(function (topic) {
    wrapper.appendChild(renderTopicBlock(category, topic));
  });

  return wrapper;
}

/**
 * 渲染三级标题（topic）块
 * @param {InsuranceCategory} category
 * @param {InsuranceTopic} topic
 * @returns {HTMLElement}
 */
function renderTopicBlock(category, topic) {
  var block = document.createElement("div");
  block.className = "topic";
  block.id = "topic-" + category.id + "-" + topic.id;

  var h3 = document.createElement("h3");
  h3.className = "h3";
  h3.textContent = topic.title;
  block.appendChild(h3);

  if (topic.introduction) {
    var intro = document.createElement("p");
    intro.className = "topic-intro";
    intro.textContent = topic.introduction;
    block.appendChild(intro);
  } else if (topic.content_type === "text" && topic.text) {
    var intro2 = document.createElement("p");
    intro2.className = "topic-intro";
    intro2.textContent = topic.text;
    block.appendChild(intro2);
  }

  var content = document.createElement("div");
  content.className = "block";
  content.innerHTML = renderTopicContent(topic);
  block.appendChild(content);

  return block;
}

/**
 * 根据 content_type 渲染 topic 内容（返回 HTML 字符串）
 * @param {InsuranceTopic} topic
 * @returns {string}
 */
function renderTopicContent(topic) {
  switch (topic.content_type) {
    case "drug_list":
      return renderDrugList(topic);
    case "policy_guide":
      return renderPolicyGuide(topic);
    case "links":
      return renderLinks(topic);
    case "link_card":
      return renderLinkCard(topic);
    case "product_list":
      return renderProductList(topic);
    case "text":
    default:
      return topic.text ? "<p class=\"text\">" + escapeHtml(topic.text) + "</p>" : "";
  }
}

/**
 * 渲染 drug_list
 * @param {InsuranceTopic} topic
 * @returns {string}
 */
function renderDrugList(topic) {
  var rules = topic.rules || [];
  return rules.map(function (rule) {
    var rows = (rule.drugs || []).map(function (drug) {
      var period = "";
      if (drug.valid_from && drug.valid_to) {
        period = drug.valid_from + " ~ " + drug.valid_to;
      }
      return (
        "<tr>" +
        "<td>" + escapeHtml(drug.name) + "</td>" +
        "<td>" + escapeHtml(drug.condition || "") + "</td>" +
        "<td>" + escapeHtml(period) + "</td>" +
        "</tr>"
      );
    }).join("");

    var tipsHtml = "";
    if (rule.tips && rule.tips.length) {
      tipsHtml =
        "<ul class=\"list\">" +
        rule.tips.map(function (tip) {
          return "<li>" + escapeHtml(tip) + "</li>";
        }).join("") +
        "</ul>";
    }

    return (
      "<div class=\"block\">" +
      "<h4 class=\"block-title\">" + escapeHtml(rule.category) + "</h4>" +
      "<table>" +
      "<thead><tr><th>药品名称</th><th>适用人群/条件</th><th>有效期</th></tr></thead>" +
      "<tbody>" + rows + "</tbody>" +
      "</table>" +
      tipsHtml +
      "</div>"
    );
  }).join("");
}

/**
 * 渲染 policy_guide
 * @param {InsuranceTopic} topic
 * @returns {string}
 */
function renderPolicyGuide(topic) {
  var sections = topic.sections || [];
  return sections.map(function (sec) {
    var body = "";
    if (sec.text) {
      body += "<p class=\"text\">" + escapeHtml(sec.text) + "</p>";
    }
    if (sec.tips && sec.tips.length) {
      body +=
        "<ul class=\"list\">" +
        sec.tips.map(function (tip) {
          return "<li>" + escapeHtml(tip) + "</li>";
        }).join("") +
        "</ul>";
    }
    return (
      "<div class=\"block\">" +
      "<h4 class=\"block-title\">" + escapeHtml(sec.header) + "</h4>" +
      body +
      "</div>"
    );
  }).join("");
}

/**
 * 渲染 links
 * @param {InsuranceTopic} topic
 * @returns {string}
 */
function renderLinks(topic) {
  var links = topic.links || [];
  if (!links.length) {
    return "<p class=\"text\">暂无链接。</p>";
  }
  return (
    "<ul class=\"list\">" +
    links.map(function (l) {
      return "<li><strong>" + escapeHtml(l.name) + "</strong>：" + escapeHtml(l.url || "") + "</li>";
    }).join("") +
    "</ul>"
  );
}

/**
 * 渲染 link_card
 * @param {InsuranceTopic} topic
 * @returns {string}
 */
function renderLinkCard(topic) {
  var html = "";
  if (topic.insurance_name) {
    html += "<p class=\"text\"><strong>险种名称：</strong>" + escapeHtml(topic.insurance_name) + "</p>";
  }
  if (topic.condition) {
    html += "<p class=\"text\"><strong>适用人群：</strong>" + escapeHtml(topic.condition) + "</p>";
  }
  if (topic.url) {
    html += "<p class=\"text\"><a href=\"" + encodeURI(topic.url) + "\" target=\"_blank\" rel=\"noopener noreferrer\">" +
      escapeHtml(topic.next_step || "查看详情") + "</a></p>";
  }
  return html;
}

/**
 * 渲染 product_list
 * @param {InsuranceTopic} topic
 * @returns {string}
 */
function renderProductList(topic) {
  var html = "";
  if (topic.highlights) {
    html += "<p class=\"text\">" + escapeHtml(topic.highlights) + "</p>";
  }
  var products = topic.products || [];
  if (products.length) {
    html +=
      "<ul class=\"list\">" +
      products.map(function (p) {
        return "<li><strong>" + escapeHtml(p.name) + "</strong>：" + escapeHtml(p.drug || "") + "</li>";
      }).join("") +
      "</ul>";
  }
  return html;
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

  var tool = root.insurance_tool;
  renderHero(tool);
  renderCategoryToc(tool.categories || []);
  renderCategories(tool.categories || []);
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

