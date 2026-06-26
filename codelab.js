/* =========================================================
   Acharya Coding School — codelab.js
   Real, in-browser practice tools:
     - UI Studio  : live HTML/CSS/JS preview (iframe)
     - Java       : compiled & executed via the Piston API
     - Python     : executed via the Piston API
     - SQL        : a real SQLite database running in the browser (sql.js)
   ========================================================= */
document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Footer year / sticky header / mobile nav (shared) ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const header = document.getElementById('siteHeader');
  const backToTop = document.getElementById('backToTop');
  const onScroll = () => {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 10);
    if (backToTop) backToTop.classList.toggle('is-visible', window.scrollY > 500);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const navToggle = document.getElementById('navToggle');
  const primaryNav = document.getElementById('primaryNav');
  const navBackdrop = document.getElementById('navBackdrop');
  const openNav = () => { primaryNav.classList.add('is-open'); navToggle.classList.add('is-open'); navToggle.setAttribute('aria-expanded', true); document.body.classList.add('nav-open'); };
  const closeNav = () => { primaryNav.classList.remove('is-open'); navToggle.classList.remove('is-open'); navToggle.setAttribute('aria-expanded', false); document.body.classList.remove('nav-open'); };
  if (navToggle) navToggle.addEventListener('click', () => primaryNav.classList.contains('is-open') ? closeNav() : openNav());
  if (navBackdrop) navBackdrop.addEventListener('click', closeNav);
  primaryNav?.querySelectorAll('.nav__link').forEach(l => l.addEventListener('click', closeNav));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && primaryNav?.classList.contains('is-open')) closeNav(); });
  backToTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ---------- Register modal (shared) ---------- */
  const modal = document.getElementById('registerModal');
  const openTriggers = document.querySelectorAll('[data-open-modal]');
  const closeTriggers = document.querySelectorAll('[data-close-modal]');
  const formView = document.getElementById('modalFormView');
  const successView = document.getElementById('modalSuccessView');
  const form = document.getElementById('registerForm');
  let lastFocused = null;
  const openModal = () => {
    lastFocused = document.activeElement;
    modal.classList.add('is-open'); modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (formView) formView.hidden = false;
    if (successView) successView.hidden = true;
    form?.reset();
    setTimeout(() => modal.querySelector('input,button')?.focus(), 50);
  };
  const closeModal = () => { modal.classList.remove('is-open'); modal.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; lastFocused?.focus(); };
  openTriggers.forEach(btn => btn.addEventListener('click', openModal));
  closeTriggers.forEach(btn => btn.addEventListener('click', closeModal));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && modal?.classList.contains('is-open')) closeModal(); });
  form?.addEventListener('submit', e => {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    if (formView) formView.hidden = true;
    if (successView) successView.hidden = false;
  });

  /* =========================================================
     TOOL PICKER — switches the active workspace panel
     ========================================================= */
  const cards = document.querySelectorAll('.lab-card');
  const panels = document.querySelectorAll('.lab-panel');
  const workspaceHead = document.getElementById('labWorkspaceHead');

  const toolMeta = {
    ui: { title: 'What you can build here', desc: 'Edit HTML, CSS and JavaScript and watch the preview update instantly — exactly like building a real webpage.' },
    java: { title: 'Java Console', desc: 'Write Java, hit Run, and your code compiles and executes on a real Java runtime — actual output, not a simulation.' },
    python: { title: 'Python Sandbox', desc: 'Run real Python — loops, functions, data logic — and see the exact console output a Python interpreter would print.' },
    sql: { title: 'SQL Playground', desc: 'A real SQLite database lives right in this page. Query the sample student data or write your own schema.' },
  };

  function activateTool(tool) {
    cards.forEach(c => c.classList.toggle('is-active', c.dataset.tool === tool));
    panels.forEach(p => p.classList.toggle('is-active', p.dataset.tool === tool));
    if (workspaceHead && toolMeta[tool]) {
      workspaceHead.querySelector('h2').textContent = toolMeta[tool].title;
      workspaceHead.querySelector('p').textContent = toolMeta[tool].desc;
    }
    // Lazily init the editor for whichever panel is now visible
    initToolEditors(tool);
  }

  cards.forEach(card => {
    card.addEventListener('click', () => {
      activateTool(card.dataset.tool);
      document.getElementById('labWorkspace')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  /* =========================================================
     CODEMIRROR HELPERS
     ========================================================= */
  const editors = {}; // tool -> { [fileKey]: CodeMirror instance }
  const initialized = { ui: false, java: false, python: false, sql: false };

  function makeEditor(textareaEl, mode) {
    return CodeMirror.fromTextArea(textareaEl, {
      mode, theme: 'default', lineNumbers: true, indentUnit: 2, tabSize: 2,
      lineWrapping: false, viewportMargin: Infinity,
    });
  }

  function initToolEditors(tool) {
    if (initialized[tool]) { Object.values(editors[tool] || {}).forEach(ed => ed.refresh()); return; }
    initialized[tool] = true;

    if (tool === 'ui') {
      editors.ui = {
        html: makeEditor(document.getElementById('uiHtml'), 'htmlmixed'),
        css: makeEditor(document.getElementById('uiCss'), 'css'),
        js: makeEditor(document.getElementById('uiJs'), 'javascript'),
      };
      Object.values(editors.ui).forEach(ed => ed.on('changes', debounce(runUiPreview, 400)));
      setupFileTabs('ui');
      runUiPreview();
    }

    if (tool === 'java') {
      editors.java = { main: makeEditor(document.getElementById('javaMain'), 'text/x-java') };
    }

    if (tool === 'python') {
      editors.python = { main: makeEditor(document.getElementById('pyMain'), 'python') };
    }

    if (tool === 'sql') {
      editors.sql = { main: makeEditor(document.getElementById('sqlMain'), 'text/x-sql') };
      initSqlEngine();
    }
  }

  function debounce(fn, ms) {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
  }

  /* File tabs (only UI Studio has multiple files) */
  function setupFileTabs(tool) {
    const tabs = document.querySelectorAll(`[data-tabgroup="${tool}"] .lab-tab`);
    // Hide every editor whose tab isn't the active one, right after creation
    tabs.forEach(tab => {
      const fileKey = tab.dataset.file;
      if (!tab.classList.contains('is-active') && editors[tool][fileKey]) {
        editors[tool][fileKey].getWrapperElement().style.display = 'none';
      }
    });
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('is-active'));
        tab.classList.add('is-active');
        const fileKey = tab.dataset.file;
        Object.entries(editors[tool]).forEach(([key, ed]) => {
          ed.getWrapperElement().style.display = key === fileKey ? '' : 'none';
        });
        editors[tool][fileKey].refresh();
      });
    });
  }

  /* =========================================================
     UI STUDIO — live HTML/CSS/JS preview
     ========================================================= */
  function runUiPreview() {
    const iframe = document.getElementById('uiPreviewFrame');
    if (!iframe || !editors.ui) return;
    const html = editors.ui.html.getValue();
    const css = editors.ui.css.getValue();
    const js = editors.ui.js.getValue();
    const doc = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${css}</style></head><body>${html}<script>${js}<\/script></body></html>`;
    iframe.srcdoc = doc;
    setStatus('uiStatus', 'ok', 'Live');
  }
  document.getElementById('uiRunBtn')?.addEventListener('click', () => { runUiPreview(); flashStatus('uiStatus'); });
  document.getElementById('uiResetBtn')?.addEventListener('click', () => {
    if (!confirm('Reset UI Studio back to the starter template?')) return;
    editors.ui.html.setValue(UI_DEFAULT.html);
    editors.ui.css.setValue(UI_DEFAULT.css);
    editors.ui.js.setValue(UI_DEFAULT.js);
    runUiPreview();
  });

  /* Preview / code-only toggle on small screens */
  document.querySelectorAll('.lab-output__seg').forEach(seg => {
    seg.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        seg.querySelectorAll('button').forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        const targetSel = btn.dataset.show;
        const pane = seg.closest('.lab-window');
        pane.querySelectorAll('[data-view]').forEach(el => {
          el.style.display = el.dataset.view === targetSel ? '' : 'none';
        });
      });
    });
  });

  function setStatus(id, state, label) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('is-running', 'is-ok', 'is-error');
    el.classList.add(`is-${state}`);
    el.querySelector('.label').textContent = label;
  }
  function flashStatus(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.add('is-running');
    setTimeout(() => el.classList.remove('is-running'), 250);
  }

  /* =========================================================
     PISTON API — real Java & Python execution
     https://github.com/engineer-man/piston (public, free, CORS-enabled)
     ========================================================= */
  const PISTON_BASE = 'https://emkc.org/api/v2/piston';
  const runtimeVersions = {}; // language -> version

  fetch(`${PISTON_BASE}/runtimes`)
    .then(r => r.json())
    .then(list => {
      list.forEach(rt => {
        runtimeVersions[rt.language] = rt.version;
        (rt.aliases || []).forEach(a => { if (!runtimeVersions[a]) runtimeVersions[a] = rt.version; });
      });
    })
    .catch(() => { /* version lookup failed — execute() will fall back to a default version string */ });

  async function executeCode(language, filename, content, consoleId, runBtnId) {
    const consoleEl = document.getElementById(consoleId);
    const runBtn = document.getElementById(runBtnId);
    if (runBtn) runBtn.disabled = true;
    consoleEl.innerHTML = '';
    appendLine(consoleEl, `$ running ${filename}…`, 'muted');
    setStatus(consoleId + 'Status', 'running', 'Running');

    const started = performance.now();
    try {
      const version = runtimeVersions[language] || '*';
      const res = await fetch(`${PISTON_BASE}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language, version, files: [{ name: filename, content }] }),
      });
      if (!res.ok) throw new Error(`Compiler service responded with ${res.status}`);
      const data = await res.json();
      const ms = Math.round(performance.now() - started);

      consoleEl.innerHTML = '';
      if (data.compile && data.compile.stderr) {
        appendLine(consoleEl, data.compile.stderr, 'err');
      }
      const out = (data.run?.stdout || '') + (data.run?.stderr ? data.run.stderr : '');
      if (out.trim()) {
        out.split('\n').forEach(line => appendLine(consoleEl, line, data.run?.code ? 'err' : ''));
      } else if (!(data.compile && data.compile.stderr)) {
        appendLine(consoleEl, '(no output)', 'muted');
      }

      const exitCode = data.run?.code ?? 0;
      appendLine(consoleEl, `\nexit code ${exitCode} · ${ms} ms round-trip`, 'muted');
      setStatus(consoleId + 'Status', exitCode === 0 ? 'ok' : 'error', exitCode === 0 ? `Done · ${ms} ms` : 'Error');
    } catch (err) {
      consoleEl.innerHTML = '';
      appendLine(consoleEl, `Could not reach the compiler service: ${err.message}`, 'err');
      appendLine(consoleEl, 'Check your internet connection and try again.', 'muted');
      setStatus(consoleId + 'Status', 'error', 'Connection error');
    } finally {
      if (runBtn) runBtn.disabled = false;
    }
  }

  function appendLine(consoleEl, text, cls) {
    const div = document.createElement('div');
    div.className = 'lab-console__line' + (cls ? ' ' + cls : '');
    div.textContent = text;
    consoleEl.appendChild(div);
  }

  document.getElementById('javaRunBtn')?.addEventListener('click', () => {
    const code = editors.java.main.getValue();
    executeCode('java', 'Main.java', code, 'javaConsole', 'javaRunBtn');
  });
  document.getElementById('javaResetBtn')?.addEventListener('click', () => {
    if (!confirm('Reset the Java editor back to the starter snippet?')) return;
    editors.java.main.setValue(JAVA_DEFAULT);
  });

  document.getElementById('pyRunBtn')?.addEventListener('click', () => {
    const code = editors.python.main.getValue();
    executeCode('python', 'main.py', code, 'pyConsole', 'pyRunBtn');
  });
  document.getElementById('pyResetBtn')?.addEventListener('click', () => {
    if (!confirm('Reset the Python editor back to the starter snippet?')) return;
    editors.python.main.setValue(PY_DEFAULT);
  });

  /* =========================================================
     SQL.JS — a real SQLite engine running in the browser
     ========================================================= */
  let sqlDb = null;
  let sqlReady = null;

  function initSqlEngine() {
    const consoleEl = document.getElementById('sqlResults');
    setStatus('sqlResultsStatus', 'running', 'Loading engine');
    sqlReady = initSqlJs({ locateFile: f => `https://cdn.jsdelivr.net/npm/sql.js@1.10.3/dist/${f}` })
      .then(SQL => {
        sqlDb = new SQL.Database();
        sqlDb.run(SQL_SEED);
        setStatus('sqlResultsStatus', 'ok', 'Ready');
        renderSqlEmpty('Sample tables loaded. Click Run to try the query on the left →');
      })
      .catch(err => {
        setStatus('sqlResultsStatus', 'error', 'Engine failed to load');
        if (consoleEl) consoleEl.innerHTML = `<p class="lab-sql-empty">Could not load the SQL engine (${err.message}). Check your internet connection and reload the page.</p>`;
      });
  }

  function renderSqlEmpty(msg) {
    const el = document.getElementById('sqlResults');
    if (el) el.innerHTML = `<p class="lab-sql-empty">${msg}</p>`;
  }

  async function runSqlQuery() {
    const resultsEl = document.getElementById('sqlResults');
    if (!sqlDb) { await sqlReady; }
    if (!sqlDb) return;
    const sql = editors.sql.main.getValue();
    setStatus('sqlResultsStatus', 'running', 'Running');
    resultsEl.innerHTML = '';
    try {
      const results = sqlDb.exec(sql);
      if (!results.length) {
        renderSqlEmpty('Query ran successfully with no rows to display (e.g. CREATE / INSERT / UPDATE).');
      } else {
        results.forEach((res, i) => {
          const table = document.createElement('table');
          table.className = 'lab-sql-table';
          table.innerHTML = `<caption>Result ${i + 1} · ${res.values.length} row${res.values.length === 1 ? '' : 's'}</caption>
            <thead><tr>${res.columns.map(c => `<th>${escapeHtml(c)}</th>`).join('')}</tr></thead>
            <tbody>${res.values.map(row => `<tr>${row.map(v => `<td>${v === null ? '<em>null</em>' : escapeHtml(String(v))}</td>`).join('')}</tr>`).join('')}</tbody>`;
          resultsEl.appendChild(table);
        });
      }
      setStatus('sqlResultsStatus', 'ok', 'Done');
    } catch (err) {
      resultsEl.innerHTML = `<p class="lab-sql-empty" style="color:#C0392B">SQL error: ${escapeHtml(err.message)}</p>`;
      setStatus('sqlResultsStatus', 'error', 'Error');
    }
  }
  function escapeHtml(s) { return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

  document.getElementById('sqlRunBtn')?.addEventListener('click', runSqlQuery);
  document.getElementById('sqlResetBtn')?.addEventListener('click', async () => {
    if (!confirm('Reset the sample database and query?')) return;
    editors.sql.main.setValue(SQL_DEFAULT_QUERY);
    if (sqlDb) { sqlDb.close(); }
    initSqlEngine();
  });

  /* ---------- Snippet quick-start chips ---------- */
  document.querySelectorAll('.lab-snippet-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tool = btn.dataset.tool;
      const snippet = SNIPPETS[tool]?.[btn.dataset.snippet];
      if (!snippet || !editors[tool]) return;
      if (tool === 'ui') {
        editors.ui.html.setValue(snippet.html);
        editors.ui.css.setValue(snippet.css);
        editors.ui.js.setValue(snippet.js);
        runUiPreview();
      } else if (tool === 'sql') {
        editors.sql.main.setValue(snippet);
      } else {
        editors[tool].main.setValue(snippet);
      }
    });
  });

  /* ---------- Activate the first tool on load ---------- */
  activateTool('ui');
});

/* =========================================================
   DEFAULT / STARTER CODE
   ========================================================= */
const UI_DEFAULT = {
  html: `<h1 class="title">Hello, Acharya! 👋</h1>
<p>Edit the HTML, CSS or JS tabs — this preview updates live.</p>
<button id="cheerBtn">Click me</button>
<p id="count"></p>`,
  css: `body{font-family:'Plus Jakarta Sans',sans-serif;padding:32px;color:#0A1128;}
.title{color:#2EC4B6;font-family:'Space Grotesk',sans-serif;}
button{background:#F2B705;border:none;padding:10px 18px;border-radius:999px;font-weight:700;cursor:pointer;}
button:hover{background:#FFD24C;}`,
  js: `let clicks = 0;
document.getElementById('cheerBtn').addEventListener('click', () => {
  clicks++;
  document.getElementById('count').textContent = 'Clicked ' + clicks + ' time(s)';
});`,
};

const JAVA_DEFAULT = `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello from Acharya Code Lab!");
        int sum = 0;
        for (int i = 1; i <= 5; i++) {
            sum += i;
        }
        System.out.println("Sum of 1 to 5 is: " + sum);
    }
}`;

const PY_DEFAULT = `print("Hello from Acharya Code Lab!")

def factorial(n):
    return 1 if n == 0 else n * factorial(n - 1)

for i in range(1, 6):
    print(f"{i}! = {factorial(i)}")`;

const SQL_SEED = `
CREATE TABLE students (
  id INTEGER PRIMARY KEY,
  name TEXT,
  course TEXT,
  package_lpa REAL,
  city TEXT
);
INSERT INTO students (name, course, package_lpa, city) VALUES
 ('Aarav Sharma','Full Stack Development',18,'Hyderabad'),
 ('Sneha Patil','Data Science with Python',6,'Bangalore'),
 ('Rohit Nair','DevOps & Cloud',12,'Hyderabad'),
 ('Divya Menon','Software Testing',9,'Bangalore'),
 ('Karan Mehta','Full Stack with DSA',15,'Hyderabad');
`;
const SQL_DEFAULT_QUERY = `SELECT name, course, package_lpa
FROM students
ORDER BY package_lpa DESC;`;

const SNIPPETS = {
  ui: {
    card: {
      html: `<div class="card">
  <h2>Acharya Coding School</h2>
  <p>Placement-oriented IT training.</p>
  <span class="badge">100+ Hiring Partners</span>
</div>`,
      css: `body{display:grid;place-items:center;min-height:100vh;margin:0;font-family:sans-serif;background:#0A1128;}
.card{background:#fff;border-radius:18px;padding:28px;max-width:280px;text-align:center;box-shadow:0 20px 40px rgba(0,0,0,.3);}
.badge{display:inline-block;margin-top:10px;background:#2EC4B6;color:#fff;padding:6px 12px;border-radius:999px;font-size:.75rem;font-weight:700;}`,
      js: `console.log('Card rendered');`,
    },
    counter: {
      html: `<div class="counter">
  <button id="dec">-</button>
  <span id="val">0</span>
  <button id="inc">+</button>
</div>`,
      css: `body{display:grid;place-items:center;min-height:100vh;margin:0;font-family:sans-serif;}
.counter{display:flex;gap:14px;align-items:center;font-size:1.4rem;}
button{width:42px;height:42px;border-radius:50%;border:none;background:#F2B705;font-size:1.2rem;cursor:pointer;}`,
      js: `let n = 0;
const val = document.getElementById('val');
document.getElementById('inc').onclick = () => val.textContent = ++n;
document.getElementById('dec').onclick = () => val.textContent = --n;`,
    },
  },
  java: {
    loop: JAVA_DEFAULT,
    array: `public class Main {
    public static void main(String[] args) {
        int[] marks = {78, 92, 65, 88, 74};
        int total = 0;
        for (int m : marks) total += m;
        System.out.println("Average marks: " + (total / marks.length));
    }
}`,
  },
  python: {
    loop: PY_DEFAULT,
    list: `students = ["Aarav", "Sneha", "Rohit", "Divya"]
for index, name in enumerate(students, start=1):
    print(f"{index}. {name}")

print("Total students:", len(students))`,
  },
  sql: {
    basic: SQL_DEFAULT_QUERY,
    group: `SELECT city, COUNT(*) AS students, ROUND(AVG(package_lpa),1) AS avg_package
FROM students
GROUP BY city;`,
  },
};