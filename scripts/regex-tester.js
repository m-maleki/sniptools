(function (App) {
    if (!App) return;

    App.initRegex = function () {
        const view = document.getElementById('view-regex');
        if (!view || view.innerHTML.trim() !== '') return;

        view.innerHTML = `
<div class="gap-row">
    <div class="tool-header">
        <div>
            <h2 class="tool-title">Regex Tester</h2>
            <p class="tool-desc">Test regular expressions in real-time with match highlighting, groups, and replace.</p>
        </div>
    </div>

    <!-- Pattern row -->
    <div class="card">
        <div class="card-header">
            <span class="card-title">Pattern</span>
            <div class="row" style="gap:.5rem">
                <span id="regex-match-count" class="badge badge-indigo" style="display:none"></span>
                <button id="regex-clear-btn" class="btn btn-ghost btn-sm">Clear</button>
            </div>
        </div>
        <div class="card-body gap-row-sm">
            <div class="row" style="gap:.5rem">
                <span style="font-size:1.3rem;color:var(--text-muted);flex-shrink:0;font-family:'JetBrains Mono',monospace">/</span>
                <input id="regex-pattern" type="text" class="field-input field-mono"
                    placeholder="e.g. \\b\\w+@\\w+\\.\\w+\\b" autocomplete="off" spellcheck="false" aria-label="Regex pattern">
                <span style="font-size:1.3rem;color:var(--text-muted);flex-shrink:0;font-family:'JetBrains Mono',monospace">/</span>
                <input id="regex-flags" type="text" class="field-input field-mono"
                    style="width:80px" placeholder="gim" maxlength="8" autocomplete="off" spellcheck="false" aria-label="Regex flags">
            </div>
            <!-- Flag toggles -->
            <div class="row" style="flex-wrap:wrap;gap:.375rem" id="regex-flag-btns">
                <button class="regex-flag-btn btn btn-secondary btn-sm" data-flag="g" title="Global — find all matches">g global</button>
                <button class="regex-flag-btn btn btn-secondary btn-sm" data-flag="i" title="Case insensitive">i case</button>
                <button class="regex-flag-btn btn btn-secondary btn-sm" data-flag="m" title="Multiline">m multi</button>
                <button class="regex-flag-btn btn btn-secondary btn-sm" data-flag="s" title="Dot matches newline">s dotAll</button>
                <button class="regex-flag-btn btn btn-secondary btn-sm active" style="display:none" data-flag="">active</button>
            </div>
            <!-- Error -->
            <div id="regex-error" class="hidden" style="font-size:.8rem;color:var(--accent-danger);padding:.4rem .75rem;background:rgba(239,68,68,.08);border-radius:var(--radius-md);border:1px solid rgba(239,68,68,.2)"></div>
        </div>
    </div>

    <div class="grid-2">
        <!-- Test string -->
        <div class="card">
            <div class="card-header"><span class="card-title">Test String</span></div>
            <div class="card-body" style="padding-top:.75rem">
                <div id="regex-highlight-layer" class="code-block dir-ltr" style="min-height:14rem;position:relative;white-space:pre-wrap;word-break:break-word;pointer-events:none;line-height:1.65;font-size:.85rem;position:absolute;top:0;left:0;width:100%;height:100%;padding:1rem 1.25rem;border-color:transparent;background:transparent;margin:0"></div>
                <div style="position:relative">
                    <textarea id="regex-input" class="field-textarea dir-ltr" rows="10"
                        placeholder="Enter test string here…"
                        style="position:relative;z-index:1;background:var(--input-bg);resize:vertical"
                        aria-label="Test string" spellcheck="false"></textarea>
                </div>
            </div>
        </div>

        <!-- Results panel -->
        <div class="card">
            <div class="card-header">
                <span class="card-title">Matches</span>
                <div class="row" style="gap:.375rem">
                    <button id="regex-copy-matches-btn" class="btn btn-ghost btn-sm">Copy</button>
                </div>
            </div>
            <div class="card-body" style="padding-top:.75rem">
                <div id="regex-matches-list" style="max-height:260px;overflow-y:auto;display:flex;flex-direction:column;gap:.375rem">
                    <div class="empty-state" style="padding:2rem">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803a7.5 7.5 0 0010.607 0z"/></svg>
                        <p>Matches will appear here</p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Replace section -->
    <div class="card">
        <div class="card-header">
            <span class="card-title">Replace</span>
            <button id="regex-apply-replace-btn" class="btn btn-primary btn-sm">Apply Replace</button>
        </div>
        <div class="card-body gap-row-sm">
            <input id="regex-replace" type="text" class="field-input field-mono"
                placeholder="Replacement (use $1, $2 for groups)…" aria-label="Replacement string">
            <div id="regex-replace-preview" class="code-block dir-ltr hidden" style="min-height:3rem;font-size:.83rem;white-space:pre-wrap;word-break:break-word"></div>
        </div>
    </div>
</div>

<style>
.regex-flag-btn.active { background: rgba(99,102,241,.15); border-color: var(--accent-1); color: var(--nav-item-active-text); }
.regex-highlight mark {
    background: rgba(251,191,36,.35);
    color: inherit;
    border-radius: 2px;
    outline: 1.5px solid rgba(251,191,36,.6);
}
.regex-highlight mark.group { background: rgba(99,102,241,.2); outline-color: rgba(99,102,241,.5); }
.regex-match-item {
    padding: .45rem .75rem;
    background: var(--code-bg);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-md);
    font-family: 'JetBrains Mono', monospace;
    font-size: .8rem;
    color: var(--text-primary);
    cursor: pointer;
    transition: border-color var(--transition-fast);
}
.regex-match-item:hover { border-color: var(--border-strong); }
.regex-match-index { color: var(--text-muted); font-size: .7rem; margin-right: .5rem; }
.regex-match-value { color: var(--accent-3); }
.regex-match-pos   { color: var(--text-muted); font-size: .7rem; margin-left: auto; padding-left: .5rem; }
.regex-group-tag   { display:inline-flex;align-items:center;gap:.2rem;background:rgba(99,102,241,.12);color:var(--tag-text);border-radius:3px;padding:.05rem .3rem;font-size:.68rem;margin-left:.35rem; }
</style>`;

        const patternEl   = document.getElementById('regex-pattern');
        const flagsEl     = document.getElementById('regex-flags');
        const inputEl     = document.getElementById('regex-input');
        const matchesList = document.getElementById('regex-matches-list');
        const matchCount  = document.getElementById('regex-match-count');
        const errorEl     = document.getElementById('regex-error');
        const replaceEl   = document.getElementById('regex-replace');
        const replacePreview = document.getElementById('regex-replace-preview');
        const applyReplaceBtn= document.getElementById('regex-apply-replace-btn');
        const clearBtn    = document.getElementById('regex-clear-btn');
        const copyBtn     = document.getElementById('regex-copy-matches-btn');
        const flagBtns    = document.querySelectorAll('.regex-flag-btn[data-flag]');

        /* Flag toggle buttons */
        flagBtns.forEach(btn => {
            const f = btn.dataset.flag;
            if (!f) { btn.style.display = 'none'; return; }
            btn.addEventListener('click', () => {
                let flags = flagsEl.value;
                if (flags.includes(f)) {
                    flags = flags.replace(f, '');
                    btn.classList.remove('active');
                } else {
                    flags += f;
                    btn.classList.add('active');
                }
                flagsEl.value = flags;
                run();
            });
        });

        /* Sync flag input → buttons */
        flagsEl.addEventListener('input', () => {
            flagBtns.forEach(btn => {
                if (!btn.dataset.flag) return;
                btn.classList.toggle('active', flagsEl.value.includes(btn.dataset.flag));
            });
            run();
        });

        /* Init flags display */
        flagsEl.value = 'g';
        flagBtns.forEach(btn => {
            if (btn.dataset.flag === 'g') btn.classList.add('active');
        });

        let lastMatches = [];

        function escapeHtml(s) {
            return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
        }

        function buildHighlight(text, matches, regex) {
            if (!matches.length) return escapeHtml(text);
            let html = '', last = 0;
            matches.forEach(m => {
                if (m.index < last) return;
                html += escapeHtml(text.slice(last, m.index));
                html += `<mark>${escapeHtml(m[0])}</mark>`;
                last = m.index + m[0].length;
            });
            html += escapeHtml(text.slice(last));
            return html;
        }

        function run() {
            const pattern = patternEl.value;
            const flags   = flagsEl.value.replace(/[^gimsuy]/g, '');
            const text    = inputEl.value;
            errorEl.classList.add('hidden');

            if (!pattern) {
                matchesList.innerHTML = `<div class="empty-state" style="padding:2rem"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803a7.5 7.5 0 0010.607 0z"/></svg><p>Enter a pattern above</p></div>`;
                matchCount.style.display = 'none';
                replacePreview.classList.add('hidden');
                lastMatches = [];
                return;
            }

            let regex;
            try {
                regex = new RegExp(pattern, flags);
            } catch (e) {
                errorEl.textContent = e.message;
                errorEl.classList.remove('hidden');
                matchCount.style.display = 'none';
                lastMatches = [];
                return;
            }

            /* Collect matches */
            const matches = [];
            if (flags.includes('g')) {
                let m;
                regex.lastIndex = 0;
                while ((m = regex.exec(text)) !== null) {
                    matches.push({ index: m.index, value: m[0], groups: [...m].slice(1) });
                    if (m[0].length === 0) { regex.lastIndex++; }
                    if (matches.length > 500) break;
                }
            } else {
                const m = regex.exec(text);
                if (m) matches.push({ index: m.index, value: m[0], groups: [...m].slice(1) });
            }
            lastMatches = matches;

            /* Match count badge */
            if (matches.length) {
                matchCount.textContent = `${matches.length} match${matches.length > 1 ? 'es' : ''}`;
                matchCount.style.display = '';
            } else {
                matchCount.textContent = '0 matches';
                matchCount.style.display = '';
            }

            /* Render match list */
            if (!matches.length) {
                matchesList.innerHTML = `<div class="empty-state" style="padding:1.5rem"><p>No matches found</p></div>`;
            } else {
                matchesList.innerHTML = matches.map((m, i) => {
                    const groups = m.groups.filter(g => g !== undefined)
                        .map((g,gi) => `<span class="regex-group-tag">$${gi+1}: ${escapeHtml(String(g))}</span>`).join('');
                    return `<div class="regex-match-item" style="display:flex;align-items:center;flex-wrap:wrap;gap:.25rem">
                        <span class="regex-match-index">#${i+1}</span>
                        <span class="regex-match-value">${escapeHtml(m.value)}</span>
                        ${groups}
                        <span class="regex-match-pos">@${m.index}</span>
                    </div>`;
                }).join('');
            }

            /* Replace preview */
            const replStr = replaceEl.value;
            if (replStr !== '' || replaceEl === document.activeElement) {
                try {
                    const replaced = text.replace(regex, replStr);
                    replacePreview.textContent = replaced;
                    replacePreview.classList.remove('hidden');
                } catch(e) { replacePreview.classList.add('hidden'); }
            }
        }

        patternEl.addEventListener('input', run);
        inputEl.addEventListener('input', run);
        replaceEl.addEventListener('input', run);

        applyReplaceBtn.addEventListener('click', () => {
            if (replacePreview.classList.contains('hidden')) return;
            inputEl.value = replacePreview.textContent;
            run();
            App.toast('Replace applied');
        });

        clearBtn.addEventListener('click', () => {
            patternEl.value = '';
            inputEl.value = '';
            replaceEl.value = '';
            replacePreview.classList.add('hidden');
            run();
        });

        copyBtn.addEventListener('click', () => {
            if (!lastMatches.length) return;
            App.copyText(lastMatches.map(m => m.value).join('\n'), `${lastMatches.length} matches copied`);
        });

        /* Preset examples */
        const presets = [
            { label: 'Email',    pattern: '[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}', flags: 'g' },
            { label: 'URL',      pattern: 'https?:\\/\\/[^\\s/$.?#].[^\\s]*', flags: 'gi' },
            { label: 'IPv4',     pattern: '\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b', flags: 'g' },
            { label: 'Hex color',pattern: '#(?:[0-9a-fA-F]{3}){1,2}\\b', flags: 'g' },
            { label: 'Date',     pattern: '\\d{4}[-/]\\d{2}[-/]\\d{2}', flags: 'g' },
        ];

        const presetsRow = document.createElement('div');
        presetsRow.style.cssText = 'display:flex;flex-wrap:wrap;gap:.375rem;margin-top:.25rem';
        presetsRow.innerHTML = `<span class="text-xs text-muted" style="width:100%;margin-bottom:.1rem">Quick presets:</span>` +
            presets.map(p => `<button class="btn btn-ghost btn-sm regex-preset" data-pattern="${p.pattern}" data-flags="${p.flags}">${p.label}</button>`).join('');

        document.querySelector('#view-regex .card .card-body').appendChild(presetsRow);

        presetsRow.querySelectorAll('.regex-preset').forEach(btn => {
            btn.addEventListener('click', () => {
                patternEl.value = btn.dataset.pattern;
                flagsEl.value   = btn.dataset.flags;
                flagBtns.forEach(fb => {
                    if (!fb.dataset.flag) return;
                    fb.classList.toggle('active', flagsEl.value.includes(fb.dataset.flag));
                });
                run();
                patternEl.focus();
            });
        });
    };
})(window.App);
