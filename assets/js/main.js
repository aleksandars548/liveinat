(function () {
  var root = document.documentElement;
  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function pathPrefix() {
    return window.location.pathname.indexOf("/articles/") !== -1 ? "../" : "";
  }

  function localPath(url) {
    var prefix = pathPrefix();
    if (url.charAt(0) === "/") {
      return prefix + url.slice(1);
    }
    return url;
  }

  function currentPage() {
    var path = window.location.pathname.split("/").pop() || "index.html";
    return path;
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (character) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[character];
    });
  }

  function safeJsonObject(key) {
    try {
      var parsed = JSON.parse(localStorage.getItem(key) || "{}");
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
    } catch (error) {
      return {};
    }
  }

  function safeGetItem(key) {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      return null;
    }
  }

  function safeSetItem(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      return false;
    }
    return true;
  }

  function safeRemoveItem(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      return false;
    }
    return true;
  }

  function renderHeader() {
    var host = document.querySelector("[data-include='header']");
    if (!host) return;
    var prefix = pathPrefix();
    var navItems = [
      ["start-here.html", "Start Here"],
      ["austria-moving-checklist.html", "Checklist"],
      ["tools.html", "Tools"],
      ["blog.html?category=Moving", "Moving"],
      ["blog.html?category=Documents", "Documents"],
      ["blog.html?category=Housing", "Housing"],
      ["blog.html?category=Work", "Work"],
      ["blog.html?category=Money", "Money"],
      ["blog.html?category=Health", "Health"],
      ["blog.html?category=German%20Courses", "German Courses"],
      ["blog.html", "Blog"]
    ];
    var page = currentPage();
    host.innerHTML =
      '<header class="site-header">' +
      '<div class="container nav-wrap">' +
      '<a class="brand" href="' + prefix + 'index.html" aria-label="Live in Austria home"><span class="brand-mark" aria-hidden="true">AT</span><span>Live in Austria</span></a>' +
      '<button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav" aria-label="Open menu"><span aria-hidden="true"></span></button>' +
      '<nav class="site-nav" id="site-nav" aria-label="Main navigation"><ul>' +
      navItems.map(function (item) {
        var href = prefix + item[0];
        var active = page === item[0].split("?")[0] ? ' aria-current="page"' : "";
        return '<li><a href="' + href + '"' + active + '>' + item[1] + '</a></li>';
      }).join("") +
      '</ul></nav></div></header>';
  }

  function renderFooter() {
    var host = document.querySelector("[data-include='footer']");
    if (!host) return;
    var prefix = pathPrefix();
    host.innerHTML =
      '<footer class="site-footer"><div class="container footer-grid">' +
      '<div><a class="brand" href="' + prefix + 'index.html"><span class="brand-mark" aria-hidden="true">AT</span><span>Live in Austria</span></a>' +
      '<p class="footer-summary">Austria made simple for newcomers. Practical English-language guides for moving, working and settling in Austria.</p>' +
      '<p><small>Information is general and may change. Always verify legal, tax, visa and government topics with official Austrian sources.</small></p></div>' +
      '<ul class="footer-links">' +
      '<li><a href="' + prefix + 'about.html">About</a></li>' +
      '<li><a href="' + prefix + 'contact.html">Contact</a></li>' +
      '<li><a href="' + prefix + 'privacy-policy.html">Privacy Policy</a></li>' +
      '<li><a href="' + prefix + 'affiliate-disclosure.html">Affiliate Disclosure</a></li>' +
      '<li><a href="' + prefix + 'disclaimer.html">Disclaimer</a></li>' +
      '<li><a href="' + prefix + 'editorial-policy.html">Editorial Policy</a></li>' +
      '</ul></div></footer>';
  }

  function setupNav() {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".site-nav");
    if (!toggle || !nav) return;
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      toggle.setAttribute("aria-label", open ? "Open menu" : "Close menu");
      nav.classList.toggle("is-open", !open);
      document.body.classList.toggle("nav-open", !open);
    });
    nav.addEventListener("click", function (event) {
      if (event.target.tagName === "A") {
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Open menu");
        nav.classList.remove("is-open");
        document.body.classList.remove("nav-open");
      }
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && nav.classList.contains("is-open")) {
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Open menu");
        nav.classList.remove("is-open");
        document.body.classList.remove("nav-open");
        toggle.focus();
      }
    });
  }

  function articleCard(article) {
    return '<a class="card-link" href="' + localPath(article.url) + '">' +
      '<article class="card"><span class="tag">' + escapeHtml(article.category) + '</span>' +
      '<h3>' + escapeHtml(article.title) + '</h3><p>' + escapeHtml(article.description) + '</p>' +
      '<div class="meta"><span>' + escapeHtml(article.readingTime) + '</span><span>Updated ' + escapeHtml(article.updated) + '</span></div>' +
      '</article></a>';
  }

  function renderArticleLists() {
    var articles = window.LIA_ARTICLES || [];
    document.querySelectorAll("[data-article-list]").forEach(function (host) {
      var count = parseInt(host.getAttribute("data-count") || articles.length, 10);
      var category = host.getAttribute("data-category");
      var currentSlug = document.body.getAttribute("data-article-slug");
      var currentArticle = articles.find(function (article) {
        return article.slug === currentSlug;
      });
      var list = articles.filter(function (article) {
        return (!category || article.category === category) && article.slug !== currentSlug;
      }).sort(function (a, b) {
        if (!currentArticle) return 0;
        return Number(b.category === currentArticle.category) - Number(a.category === currentArticle.category);
      }).slice(0, count);
      host.innerHTML = list.map(articleCard).join("");
    });
  }

  function setupBlog() {
    var grid = document.querySelector("[data-blog-grid]");
    if (!grid || !window.LIA_ARTICLES) return;
    var search = document.querySelector("[data-blog-search]");
    var buttons = Array.from(document.querySelectorAll("[data-category-filter]"));
    var params = new URLSearchParams(window.location.search);
    var activeCategory = params.get("category") || "All";
    if (params.get("search")) search.value = params.get("search");
    function render() {
      var query = (search.value || "").trim().toLowerCase();
      buttons.forEach(function (button) {
        button.classList.toggle("is-active", button.dataset.categoryFilter === activeCategory);
        button.setAttribute("aria-pressed", String(button.dataset.categoryFilter === activeCategory));
      });
      var filtered = window.LIA_ARTICLES.filter(function (article) {
        var matchesCategory = activeCategory === "All" || article.category === activeCategory;
        var haystack = (article.title + " " + article.description + " " + article.category).toLowerCase();
        return matchesCategory && (!query || haystack.indexOf(query) !== -1);
      });
      grid.innerHTML = filtered.length ? filtered.map(articleCard).join("") : '<div class="empty-state">No guides match that search yet.</div>';
    }
    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        activeCategory = button.dataset.categoryFilter;
        render();
      });
    });
    search.addEventListener("input", render);
    render();
  }

  function setupForms() {
    document.querySelectorAll("[data-email-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var data = new FormData(form);
        var signup = {
          name: String(data.get("name") || "").trim(),
          email: String(data.get("email") || "").trim(),
          createdAt: new Date().toISOString()
        };
        var message = form.querySelector(".form-message");
        if (!signup.email || signup.email.indexOf("@") === -1) {
          message.textContent = "Please enter a valid email address.";
          return;
        }
        try {
          var signups;
          try {
            signups = JSON.parse(localStorage.getItem("lia_checklist_signups") || "[]");
          } catch (parseError) {
            signups = [];
          }
          if (!Array.isArray(signups)) signups = [];
          var existingIndex = signups.findIndex(function (item) {
            return String(item.email || "").toLowerCase() === signup.email.toLowerCase();
          });
          if (existingIndex >= 0) signups[existingIndex] = signup;
          else signups.push(signup);
          var savedSignup = safeSetItem("lia_checklist_signups", JSON.stringify(signups));
          form.reset();
          message.textContent = savedSignup ? "Thank you. Your checklist is ready on this page. You can print it or save it." : "Your checklist is ready on this page. Your browser did not allow local saving.";
        } catch (error) {
          message.textContent = "Your browser blocked local saving. You can still open and print the checklist on this page.";
        }
      });
    });

    document.querySelectorAll("[data-contact-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var message = form.querySelector(".form-message");
        message.textContent = "Please use the email link on this page to contact Live in Austria.";
      });
    });
  }

  function setupBackToTop() {
    var button = document.createElement("button");
    button.className = "back-to-top";
    button.type = "button";
    button.setAttribute("aria-label", "Back to top");
    button.textContent = "Top";
    document.body.appendChild(button);
    window.addEventListener("scroll", function () {
      button.classList.toggle("is-visible", window.scrollY > 500);
    }, { passive: true });
    button.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
    });
  }

  function setupToc() {
    var toc = document.querySelector("[data-toc]");
    var content = document.querySelector(".article-content");
    if (!toc || !content) return;
    var headings = Array.from(content.querySelectorAll("h2[id]"));
    if (!headings.length) return;
    toc.innerHTML = '<strong>On this page</strong>' + headings.map(function (heading) {
      return '<a href="#' + heading.id + '">' + heading.textContent + '</a>';
    }).join("");
    var links = Array.from(toc.querySelectorAll("a"));
    if ("IntersectionObserver" in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            links.forEach(function (link) {
              link.classList.toggle("is-active", link.getAttribute("href") === "#" + entry.target.id);
            });
          }
        });
      }, { rootMargin: "-20% 0px -70% 0px" });
      headings.forEach(function (heading) { observer.observe(heading); });
    }
  }

  var checklistData = {
    "first-week": [
      "Confirm address registration steps",
      "Save phone, address and emergency details",
      "Prepare bank account documents",
      "Clarify health insurance path",
      "Choose local transport ticket or pass",
      "Ask employer or university for onboarding documents"
    ],
    documents: [
      "Passport or national ID",
      "Rental contract or accommodation confirmation",
      "Employment, study or income documents",
      "Health insurance confirmation",
      "Civil status documents if relevant",
      "Translations or certified copies if officially required"
    ],
    apartment: [
      "Check total monthly cost",
      "Ask whether registration is possible",
      "Inspect heating, windows and water pressure",
      "Check transport and local shops",
      "Review deposit and contract terms",
      "Verify landlord or agency before paying"
    ]
  };

  var movingChecklist = {
    "Before arriving": [
      "Verify your legal path with official sources",
      "Prepare digital and paper document folders",
      "Book suitable initial accommodation",
      "Check whether your address can support registration"
    ],
    "First 3 days": [
      "Activate phone access",
      "Save your address and emergency information",
      "Learn local transport options",
      "Confirm address paperwork with your accommodation provider"
    ],
    "First week": [
      "Handle address registration if required",
      "Prepare bank account documents",
      "Clarify health insurance",
      "Ask employer or university for onboarding steps"
    ],
    "First month": [
      "Move toward stable housing",
      "Track real monthly costs",
      "Create a routine for official mail",
      "Start regular German learning"
    ],
    Documents: [
      "ID or passport",
      "Rental or accommodation documents",
      "Work or study documents",
      "Insurance confirmations",
      "Copies and translations where officially required"
    ],
    Housing: [
      "Review rental costs and deposit",
      "Ask about Meldezettel support",
      "Keep handover records",
      "Store payment confirmations"
    ],
    Banking: [
      "Compare account fees",
      "Check salary and rent compatibility",
      "Use official bank channels",
      "Store IBAN and account documents securely"
    ],
    "Health insurance": [
      "Identify your insurance path",
      "Ask what proof is needed",
      "Store confirmations",
      "Check doctor coverage before treatment if unsure"
    ],
    "Work/study": [
      "Verify work or study requirements",
      "Prepare certificates and references",
      "Confirm onboarding documents",
      "Keep official letters"
    ],
    "German course": [
      "Define your learning goal",
      "Choose online, classroom or hybrid",
      "Check AMS, WAFF or OEIF support if relevant",
      "Practice weekly outside class"
    ],
    "Emergency numbers": [
      "Save Austrian emergency contacts",
      "Know your nearest pharmacy and hospital",
      "Keep insurance details accessible",
      "Share your address with trusted contacts"
    ]
  };

  function renderChecklist(host, key, items) {
    var saved = safeJsonObject("lia_tool_" + key);
    host.innerHTML = '<ul class="tool-checklist">' + items.map(function (item, index) {
      var id = key + "-" + index;
      return '<li><label><input type="checkbox" data-tool-key="' + key + '" data-tool-index="' + index + '"' + (saved[index] ? " checked" : "") + '> <span>' + escapeHtml(item) + '</span></label></li>';
    }).join("") + '</ul>';
  }

  function setupTools() {
    document.querySelectorAll("[data-tool-checklist]").forEach(function (host) {
      var key = host.getAttribute("data-tool-checklist");
      renderChecklist(host, key, checklistData[key] || []);
    });

    document.addEventListener("change", function (event) {
      var input = event.target;
      if (!input.matches("[data-tool-key]")) return;
      var key = input.getAttribute("data-tool-key");
      var index = input.getAttribute("data-tool-index");
      var saved = safeJsonObject("lia_tool_" + key);
      saved[index] = input.checked;
      safeSetItem("lia_tool_" + key, JSON.stringify(saved));
    });

    document.querySelectorAll("[data-reset-tool]").forEach(function (button) {
      button.addEventListener("click", function () {
        var key = button.getAttribute("data-reset-tool");
        safeRemoveItem("lia_tool_" + key);
        var host = document.querySelector('[data-tool-checklist="' + key + '"]');
        if (host) renderChecklist(host, key, checklistData[key] || []);
      });
    });

    var costForm = document.querySelector("[data-cost-estimator]");
    if (costForm) {
      var inputs = Array.from(costForm.querySelectorAll("input"));
      var monthly = costForm.querySelector("[data-monthly-total]");
      var yearly = costForm.querySelector("[data-yearly-total]");
      function updateCosts() {
        var total = inputs.reduce(function (sum, input) {
          safeSetItem("lia_cost_" + input.id, input.value);
          return sum + (parseFloat(input.value) || 0);
        }, 0);
        monthly.textContent = total.toLocaleString(undefined, { maximumFractionDigits: 2 });
        yearly.textContent = (total * 12).toLocaleString(undefined, { maximumFractionDigits: 2 });
      }
      inputs.forEach(function (input) {
        input.value = safeGetItem("lia_cost_" + input.id) || "";
        input.addEventListener("input", updateCosts);
      });
      var resetCosts = document.querySelector("[data-reset-costs]");
      if (resetCosts) resetCosts.addEventListener("click", function () {
        inputs.forEach(function (input) {
          input.value = "";
          safeRemoveItem("lia_cost_" + input.id);
        });
        updateCosts();
      });
      updateCosts();
    }

    var courseForm = document.querySelector("[data-course-chooser]");
    if (courseForm) {
      var result = courseForm.querySelector("[data-course-result]");
      var fields = Array.from(courseForm.querySelectorAll("input, select"));
      function updateCourse() {
        var hours = parseFloat(courseForm.elements.hours.value) || 0;
        var purpose = courseForm.elements.purpose.value;
        var format = courseForm.elements.format.value;
        var intensity = hours >= 10 ? "intensive course" : hours >= 5 ? "regular part-time course" : "light weekly course plus self-study";
        result.innerHTML = '<strong>Suggested intensity:</strong> ' + intensity + '<br><strong>Suggested format:</strong> ' + escapeHtml(format) + '<p>Next steps: take a placement test, compare class size and schedule, ask about certificates if needed, and check AMS, WAFF or OEIF options if relevant for ' + escapeHtml(purpose) + '.</p>';
        fields.forEach(function (field) {
          safeSetItem("lia_course_" + field.name, field.value);
        });
      }
      fields.forEach(function (field) {
        field.value = safeGetItem("lia_course_" + field.name) || field.value;
        field.addEventListener("input", updateCourse);
        field.addEventListener("change", updateCourse);
      });
      var resetCourse = document.querySelector("[data-reset-course]");
      if (resetCourse) resetCourse.addEventListener("click", function () {
        fields.forEach(function (field) {
          safeRemoveItem("lia_course_" + field.name);
        });
        courseForm.reset();
        updateCourse();
      });
      updateCourse();
    }
  }

  function setupMovingChecklist() {
    var host = document.querySelector("[data-moving-checklist]");
    if (!host) return;
    function render() {
      var saved = safeJsonObject("lia_moving_checklist");
      host.innerHTML = Object.keys(movingChecklist).map(function (group) {
        return '<article class="card"><h2>' + escapeHtml(group) + '</h2><ul class="tool-checklist">' + movingChecklist[group].map(function (item, index) {
          var key = group + "-" + index;
          return '<li><label><input type="checkbox" data-moving-key="' + escapeHtml(key) + '"' + (saved[key] ? " checked" : "") + '> <span>' + escapeHtml(item) + '</span></label></li>';
        }).join("") + '</ul></article>';
      }).join("");
    }
    render();
    host.addEventListener("change", function (event) {
      if (!event.target.matches("[data-moving-key]")) return;
      var saved = safeJsonObject("lia_moving_checklist");
      saved[event.target.getAttribute("data-moving-key")] = event.target.checked;
      safeSetItem("lia_moving_checklist", JSON.stringify(saved));
    });
    var reset = document.querySelector("[data-reset-moving]");
    if (reset) reset.addEventListener("click", function () {
      safeRemoveItem("lia_moving_checklist");
      render();
    });
    var print = document.querySelector("[data-print-checklist]");
    if (print) print.addEventListener("click", function () {
      window.print();
    });
  }

  if (prefersReducedMotion) {
    root.style.scrollBehavior = "auto";
  }

  renderHeader();
  renderFooter();
  setupNav();
  renderArticleLists();
  setupBlog();
  setupForms();
  setupTools();
  setupMovingChecklist();
  setupBackToTop();
  setupToc();
})();
