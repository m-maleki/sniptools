window.App = window.App || {};

(function () {
    const App = window.App;

    App.sharedData = {};

    /* ── Toast ──────────────────────────────── */
    App.toast = function (message, type = 'success', duration = 2800) {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const icons = {
            success: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
            error:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/></svg>`
        };

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `<span class="toast-icon">${icons[type] || icons.success}</span><span>${message}</span>`;
        container.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('toast-out');
            toast.addEventListener('animationend', () => toast.remove(), { once: true });
        }, duration);
    };

    /* ── Clipboard helper ────────────────────── */
    App.copyText = function (text, label = 'Copied!') {
        if (!text) return Promise.reject('empty');
        return navigator.clipboard.writeText(text)
            .then(() => App.toast(label))
            .catch(() => App.toast('Copy failed', 'error'));
    };

    /* ── Copy button helper ──────────────────── */
    App.initCopyBtn = function (btn, getText) {
        if (!btn) return;
        btn.addEventListener('click', function () {
            const text = typeof getText === 'function' ? getText() : getText;
            if (!text) return;
            navigator.clipboard.writeText(text).then(() => {
                const original = btn.innerHTML;
                btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:16px;height:16px"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>`;
                btn.classList.add('copied');
                setTimeout(() => {
                    btn.innerHTML = original;
                    btn.classList.remove('copied');
                }, 1800);
            }).catch(() => App.toast('Copy failed', 'error'));
        });
    };

    /* ── Theme ───────────────────────────────── */
    const THEME_KEY = 'sniptools-theme';

    function applyTheme(theme, instant) {
        if (instant) {
            document.body.classList.add('no-transition');
            document.documentElement.setAttribute('data-theme', theme);
            void document.body.offsetHeight;
            document.body.classList.remove('no-transition');
        } else {
            document.documentElement.setAttribute('data-theme', theme);
        }
        localStorage.setItem(THEME_KEY, theme);
    }

    function initTheme() {
        const saved = localStorage.getItem(THEME_KEY);
        const preferred = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
        applyTheme(saved || preferred, true);

        const btn  = document.getElementById('theme-toggle');
        const btn2 = document.getElementById('theme-toggle-mobile');
        const toggle = () => {
            const current = document.documentElement.getAttribute('data-theme');
            applyTheme(current === 'dark' ? 'light' : 'dark', false);
        };
        btn?.addEventListener('click', toggle);
        btn2?.addEventListener('click', toggle);
    }

    /* ── Tools registry ─────────────────────── */
    const TOOLS = [
        { id: 'jwt',        label: 'JWT Decoder',             desc: 'Decode and inspect JSON Web Tokens', icon: 'M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z' },
        { id: 'json',       label: 'JSON Editor',             desc: 'Format, validate and edit JSON data', icon: 'M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5' },
        { id: 'crypto',     label: 'Crypto / Hash',           desc: 'Hash functions and Base64 encoding', icon: 'M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z' },
        { id: 'password',   label: 'Password Generator',      desc: 'Create secure, customizable passwords', icon: 'M7.864 4.243A7.5 7.5 0 0119.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 004.5 10.5a7.464 7.464 0 01-1.15 3.993m1.989 3.559A11.209 11.209 0 008.25 10.5a3.75 3.75 0 117.5 0c0 .527-.021 1.049-.064 1.565M12 10.5a14.94 14.94 0 01-3.6 9.75m6.633-4.596a18.666 18.666 0 01-2.485 5.33' },
        { id: 'diff',       label: 'Text Differ',             desc: 'Compare two texts side by side', icon: 'M9 4.5v15m6-15v15m-10.875 0h15.75c.621 0 1.125-.504 1.125-1.125V5.625c0-.621-.504-1.125-1.125-1.125H4.125C3.504 4.5 3 5.004 3 5.625v12.75c0 .621.504 1.125 1.125 1.125z' },
        { id: 'url',        label: 'URL Tools',               desc: 'Encode, decode URLs and parse query strings', icon: 'M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244' },
        { id: 'units',      label: 'Unit Converter',          desc: 'Convert length, weight, temperature and more', icon: 'M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5' },
        { id: 'uuid',       label: 'UUID / GUID',             desc: 'Generate v4, v7 UUIDs in batch', icon: 'M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5l-3.9 19.5m-2.1-19.5l-3.9 19.5' },
        { id: 'regex',      label: 'Regex Tester',            desc: 'Test regular expressions with match highlighting and replace', icon: 'M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803a7.5 7.5 0 0010.607 0z' },
        { id: 'cron',       label: 'CRON Parser',             desc: 'Parse CRON expressions and preview next run times', icon: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z' },
        { id: 'color',      label: 'Color Converter',         desc: 'Convert colors between HEX, RGB, HSL, HSB and CMYK', icon: 'M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10' },
        { id: 'base',       label: 'Base Converter',          desc: 'Convert numbers between Decimal, Hex, Binary and Octal', icon: 'M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z' },
        { id: 'timestamp',  label: 'Timestamp Converter',     desc: 'Convert Unix timestamps to human-readable dates', icon: 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5' },
        { id: 'markdown',   label: 'Markdown Preview',        desc: 'Write and preview Markdown with live rendering', icon: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z' },
        { id: 'htmlentity', label: 'HTML Entity Encoder',     desc: 'Encode and decode HTML entities', icon: 'M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5' },
        { id: 'dummydata',  label: 'Dummy Data Generator',    desc: 'Generate fake names, emails, JSON, CSV, SQL and more', icon: 'M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375' }
    ];

    /* ── Search ──────────────────────────────── */
    function initSearch() {
        const trigger   = document.getElementById('search-trigger');
        const palette   = document.getElementById('search-dropdown');
        const backdrop  = document.getElementById('search-backdrop');
        const input     = document.getElementById('search-input');
        const results   = document.getElementById('search-results');
        if (!trigger || !palette || !input || !results) return;

        function openSearch() {
            palette.classList.remove('hidden');
            backdrop.classList.remove('hidden');
            input.focus();
            renderResults('');
        }

        function closeSearch() {
            palette.classList.add('hidden');
            backdrop.classList.add('hidden');
            input.value = '';
        }

        function renderResults(query) {
            const q = query.toLowerCase().trim();
            const filtered = q
                ? TOOLS.filter(t => t.label.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q))
                : TOOLS;

            results.innerHTML = filtered.map(t => `
                <div class="search-result-item" role="option" data-view="${t.id}" tabindex="0">
                    <div class="search-result-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
                            <path stroke-linecap="round" stroke-linejoin="round" d="${t.icon}"/>
                        </svg>
                    </div>
                    <div>
                        <div class="search-result-name">${t.label}</div>
                        <div class="search-result-desc">${t.desc}</div>
                    </div>
                </div>
            `).join('') || `<div class="empty-state" style="padding:1.5rem"><p>No tools match "${query}"</p></div>`;

            results.querySelectorAll('.search-result-item').forEach(el => {
                el.addEventListener('click', () => { switchView(el.dataset.view); closeSearch(); });
                el.addEventListener('keydown', e => {
                    if (e.key === 'Enter') { switchView(el.dataset.view); closeSearch(); }
                });
            });
        }

        trigger.addEventListener('click', e => { e.stopPropagation(); openSearch(); });
        input.addEventListener('input', () => renderResults(input.value));
        input.addEventListener('keydown', e => { if (e.key === 'Escape') closeSearch(); });
        backdrop.addEventListener('click', closeSearch);

        App._openSearch  = openSearch;
        App._closeSearch = closeSearch;
    }

    /* ── Navigation ──────────────────────────── */
    const LAST_VIEW_KEY = 'sniptools-last-view';

    function switchView(viewName) {
        const views    = document.querySelectorAll('.view-container');
        const navItems = document.querySelectorAll('.nav-item');

        views.forEach(v => v.classList.add('hidden'));
        navItems.forEach(b => b.classList.remove('active'));

        const target = document.getElementById(`view-${viewName}`);
        if (target) target.classList.remove('hidden');

        const navBtn = document.querySelector(`.nav-item[data-view="${viewName}"]`);
        if (navBtn) {
            navBtn.classList.add('active');
            navBtn.scrollIntoView({ block: 'nearest' });
        }

        const initFn = `init${viewName.charAt(0).toUpperCase() + viewName.slice(1)}`;
        if (typeof App[initFn] === 'function') App[initFn]();

        window.history.replaceState(null, '', `#${viewName}`);
        localStorage.setItem(LAST_VIEW_KEY, viewName);

        /* update mobile header tool name */
        const tool = TOOLS.find(t => t.id === viewName);
        const mobileLabel = document.getElementById('mobile-tool-name');
        if (mobileLabel && tool) mobileLabel.textContent = tool.label;

        /* close mobile sidebar on tool select */
        document.getElementById('sidebar')?.classList.remove('sidebar-open');
        document.getElementById('sidebar-overlay')?.classList.add('hidden');
    }

    function initNavigation() {
        document.querySelectorAll('.nav-item').forEach(btn => {
            btn.addEventListener('click', () => switchView(btn.dataset.view));
        });

        const hash     = window.location.hash.slice(1);
        const saved    = localStorage.getItem(LAST_VIEW_KEY);
        const fallback = 'jwt';
        const validIds = TOOLS.map(t => t.id);

        const initial = (hash && validIds.includes(hash)) ? hash
                      : (saved && validIds.includes(saved)) ? saved
                      : fallback;

        switchView(initial);

        window.addEventListener('hashchange', () => {
            const h = window.location.hash.slice(1);
            if (h && validIds.includes(h)) switchView(h);
        });
    }

    /* ── Keyboard shortcuts ──────────────────── */
    function initKeyboard() {
        const overlay  = document.getElementById('shortcuts-overlay');
        const closeBtn = document.getElementById('shortcuts-close');
        const validIds = TOOLS.map(t => t.id);

        document.addEventListener('keydown', e => {
            const tag = document.activeElement.tagName;
            const isEditing = ['INPUT','TEXTAREA'].includes(tag) || document.activeElement.isContentEditable;

            /* Ctrl+K */
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                App._openSearch?.();
                return;
            }

            /* Ctrl+Shift+T */
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'T') {
                e.preventDefault();
                document.getElementById('theme-toggle')?.click();
                return;
            }

            /* Escape */
            if (e.key === 'Escape') {
                if (overlay && !overlay.classList.contains('hidden')) overlay.classList.add('hidden');
                App._closeSearch?.();
                return;
            }

            if (isEditing) return;

            /* ? */
            if (e.key === '?') { overlay?.classList.toggle('hidden'); return; }

            /* Alt+1-8 */
            if (e.altKey && e.key >= '1' && e.key <= '8') {
                e.preventDefault();
                const idx = parseInt(e.key) - 1;
                if (validIds[idx]) switchView(validIds[idx]);
                return;
            }

            /* [ ] prev/next */
            if (e.key === '[' || e.key === ']') {
                const current = window.location.hash.slice(1) || localStorage.getItem(LAST_VIEW_KEY) || 'jwt';
                const idx = validIds.indexOf(current);
                if (idx === -1) return;
                const next = e.key === ']'
                    ? validIds[(idx + 1) % validIds.length]
                    : validIds[(idx - 1 + validIds.length) % validIds.length];
                switchView(next);
            }
        });

        closeBtn?.addEventListener('click', () => overlay?.classList.add('hidden'));
        overlay?.addEventListener('click', e => { if (e.target === overlay) overlay.classList.add('hidden'); });
    }

    /* ── Init ────────────────────────────────── */
    document.addEventListener('DOMContentLoaded', () => {
        initTheme();
        initNavigation();
        initSearch();
        initKeyboard();
    });

    App.switchView = switchView;

})();
