(function (App) {
    if (!App) return;

    let monacoInstance = null;

    App.initJson = function () {
        const view = document.getElementById('view-json');
        if (!view || view.innerHTML.trim() !== '') return;

        view.innerHTML = `
<div class="gap-row">
    <div class="tool-header">
        <div>
            <h2 class="tool-title">JSON Editor</h2>
            <p class="tool-desc">View, format, and validate JSON with full Monaco editor support.</p>
        </div>
        <div class="row" style="flex-wrap:wrap;gap:.375rem">
            <button id="json-format-btn" class="btn btn-secondary btn-sm">Format</button>
            <button id="json-minify-btn" class="btn btn-secondary btn-sm">Minify</button>
            <button id="json-validate-btn" class="btn btn-secondary btn-sm">Validate</button>
            <button id="json-copy-btn" class="btn btn-primary btn-sm">Copy</button>
            <button id="json-clear-btn" class="btn btn-ghost btn-sm">Clear</button>
        </div>
    </div>

    <!-- Validation banner -->
    <div id="json-validation-banner" class="hidden" style="
        padding:.625rem 1rem;border-radius:var(--radius-md);font-size:.82rem;
        display:flex;align-items:center;gap:.5rem"></div>

    <!-- Editor -->
    <div class="card" style="overflow:hidden">
        <div id="json-monaco-container" style="height:65vh;width:100%"></div>
    </div>
</div>`;

        const container     = document.getElementById('json-monaco-container');
        const formatBtn     = document.getElementById('json-format-btn');
        const minifyBtn     = document.getElementById('json-minify-btn');
        const validateBtn   = document.getElementById('json-validate-btn');
        const copyBtn       = document.getElementById('json-copy-btn');
        const clearBtn      = document.getElementById('json-clear-btn');
        const banner        = document.getElementById('json-validation-banner');

        const defaultJson = JSON.stringify({
            "project": "SnipTools",
            "version": "2.0",
            "tools": ["JWT Decoder", "JSON Editor", "Crypto Tools", "Password Generator"],
            "features": { "theme": "dark/light", "keyboard_shortcuts": true, "local_storage": true }
        }, null, 2);

        const initial = App.sharedData.jsonToLoad || defaultJson;
        if (App.sharedData.jsonToLoad) delete App.sharedData.jsonToLoad;

        function showBanner(msg, type) {
            banner.style.background = type === 'ok' ? 'rgba(16,185,129,.1)' : 'rgba(239,68,68,.1)';
            banner.style.border     = `1px solid ${type === 'ok' ? 'rgba(16,185,129,.3)' : 'rgba(239,68,68,.3)'}`;
            banner.style.color      = type === 'ok' ? 'var(--accent-4)' : 'var(--accent-danger)';
            banner.textContent      = msg;
            banner.classList.remove('hidden');
            banner.style.display    = 'flex';
            setTimeout(() => { banner.classList.add('hidden'); banner.style.display = 'none'; }, 4000);
        }

        /* Monaco theme adapts to current theme */
        function getMonacoTheme() {
            return document.documentElement.getAttribute('data-theme') === 'light' ? 'sniptools-light' : 'sniptools-dark';
        }

        if (typeof require === 'undefined') {
            container.innerHTML = `<div class="empty-state" style="height:100%"><p>Monaco editor failed to load. Please refresh the page.</p></div>`;
            return;
        }

        require.config({ paths: { 'vs': 'vendor/monaco/vs' } });
        require(['vs/editor/editor.main'], () => {

            monaco.editor.defineTheme('sniptools-dark', {
                base: 'vs-dark', inherit: true,
                rules: [
                    { token: 'string.key.json',   foreground: '93c5fd' },
                    { token: 'string.value.json',  foreground: 'fca5a5' },
                    { token: 'number.json',        foreground: '6ee7b7' },
                    { token: 'keyword.json',       foreground: '818cf8' }
                ],
                colors: {
                    'editor.background':            '#0f172a',
                    'editor.foreground':            '#f1f5f9',
                    'editorLineNumber.foreground':  '#475569',
                    'editorCursor.foreground':      '#6366f1',
                    'editor.selectionBackground':   '#1e40af55',
                    'editorWidget.background':      '#1e293b',
                    'editorWidget.border':          '#334155',
                    'editor.lineHighlightBackground':'#1e293b55',
                }
            });

            monaco.editor.defineTheme('sniptools-light', {
                base: 'vs', inherit: true,
                rules: [
                    { token: 'string.key.json',   foreground: '2563eb' },
                    { token: 'string.value.json',  foreground: 'dc2626' },
                    { token: 'number.json',        foreground: '059669' },
                    { token: 'keyword.json',       foreground: '7c3aed' }
                ],
                colors: {
                    'editor.background':            '#ffffff',
                    'editor.foreground':            '#0f172a',
                    'editorLineNumber.foreground':  '#94a3b8',
                    'editorCursor.foreground':      '#6366f1',
                    'editor.selectionBackground':   '#dbeafe',
                    'editorWidget.background':      '#f8fafc',
                    'editorWidget.border':          '#e2e8f0',
                }
            });

            monacoInstance = monaco.editor.create(container, {
                value: initial,
                language: 'json',
                theme: getMonacoTheme(),
                automaticLayout: true,
                minimap: { enabled: false },
                fontSize: 13,
                lineHeight: 21,
                fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                padding: { top: 16 },
                scrollbar: { verticalScrollbarSize: 6, horizontalScrollbarSize: 6 },
                smoothScrolling: true,
                cursorBlinking: 'smooth',
                renderLineHighlight: 'gutter',
            });

            /* Sync Monaco theme with app theme */
            const observer = new MutationObserver(() => {
                monaco.editor.setTheme(getMonacoTheme());
            });
            observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

            /* Buttons */
            formatBtn.addEventListener('click', () => {
                monacoInstance.getAction('editor.action.formatDocument').run();
            });

            minifyBtn.addEventListener('click', () => {
                try {
                    const minified = JSON.stringify(JSON.parse(monacoInstance.getValue()));
                    monacoInstance.setValue(minified);
                    showBanner('✓ JSON minified', 'ok');
                } catch (e) { showBanner('✕ Invalid JSON: ' + e.message, 'error'); }
            });

            validateBtn.addEventListener('click', () => {
                try {
                    JSON.parse(monacoInstance.getValue());
                    showBanner('✓ Valid JSON', 'ok');
                } catch (e) { showBanner('✕ Invalid JSON: ' + e.message, 'error'); }
            });

            copyBtn.addEventListener('click', () => {
                App.copyText(monacoInstance.getValue(), 'JSON copied!');
            });

            clearBtn.addEventListener('click', () => {
                monacoInstance.setValue('{}');
            });
        });
    };

    /* Re-init when switching back (to load sharedData) */
    const _orig = App.initJson;
    App.initJson = function () {
        if (App.sharedData.jsonToLoad) {
            const view = document.getElementById('view-json');
            if (view && monacoInstance) {
                monacoInstance.setValue(App.sharedData.jsonToLoad);
                delete App.sharedData.jsonToLoad;
                return;
            }
        }
        _orig.call(this);
    };
})(window.App);
