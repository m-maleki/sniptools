(function (App) {
    if (!App) return;

    App.initUrl = function () {
        const view = document.getElementById('view-url');
        if (!view || view.innerHTML.trim() !== '') return;

        view.innerHTML = `
<div class="gap-row">
    <div class="tool-header">
        <div>
            <h2 class="tool-title">URL Tools</h2>
            <p class="tool-desc">Encode or decode URLs, parse query parameters, and inspect URL components.</p>
        </div>
    </div>

    <!-- Input -->
    <div class="card">
        <div class="card-header">
            <span class="card-title">Input</span>
            <button id="url-clear-btn" class="btn btn-ghost btn-sm">Clear</button>
        </div>
        <div class="card-body">
            <textarea id="url-input" class="field-textarea dir-ltr" rows="5" placeholder="Paste a URL or text to encode/decode…" aria-label="URL input"></textarea>
        </div>
    </div>

    <!-- Actions -->
    <div class="row" style="justify-content:center;flex-wrap:wrap;gap:.625rem">
        <button id="url-encode-btn" class="btn btn-primary">URL Encode</button>
        <button id="url-decode-btn" class="btn btn-secondary">URL Decode</button>
        <button id="url-parse-btn"  class="btn btn-secondary">Parse URL</button>
        <button id="url-build-btn"  class="btn btn-secondary">Build URL</button>
    </div>

    <!-- Output -->
    <div class="card">
        <div class="card-header">
            <span class="card-title" id="url-result-label">Result</span>
            <button class="btn-icon" id="url-copy-btn" aria-label="Copy result">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"/></svg>
            </button>
        </div>
        <div class="card-body">
            <textarea id="url-output" class="field-textarea dir-ltr" rows="5" readonly aria-label="URL result" style="cursor:default"></textarea>
        </div>
    </div>

    <!-- Parsed breakdown -->
    <div id="url-parsed-card" class="card hidden">
        <div class="card-header"><span class="card-title">URL Components</span></div>
        <div class="card-body gap-row-sm" id="url-parsed-body"></div>
    </div>

    <!-- Query params builder -->
    <div id="url-builder-card" class="card hidden">
        <div class="card-header">
            <span class="card-title">Query Param Builder</span>
            <button id="url-add-param-btn" class="btn btn-ghost btn-sm">+ Add Param</button>
        </div>
        <div class="card-body gap-row-sm" id="url-params-list"></div>
        <div class="card-body" style="border-top:1px solid var(--border-default)">
            <div class="row-between">
                <span class="text-xs text-muted">Base URL (optional)</span>
            </div>
            <input id="url-base" type="text" class="field-input field-mono" style="margin-top:.375rem" placeholder="https://example.com/path" aria-label="Base URL">
            <button id="url-build-result-btn" class="btn btn-primary btn-full" style="margin-top:.75rem">Build URL</button>
        </div>
    </div>
</div>`;

        const inputEl   = document.getElementById('url-input');
        const outputEl  = document.getElementById('url-output');
        const label     = document.getElementById('url-result-label');
        const clearBtn  = document.getElementById('url-clear-btn');
        const copyBtn   = document.getElementById('url-copy-btn');
        const encBtn    = document.getElementById('url-encode-btn');
        const decBtn    = document.getElementById('url-decode-btn');
        const parseBtn  = document.getElementById('url-parse-btn');
        const buildBtn  = document.getElementById('url-build-btn');
        const parsedCard= document.getElementById('url-parsed-card');
        const parsedBody= document.getElementById('url-parsed-body');
        const builderCard = document.getElementById('url-builder-card');
        const paramsList  = document.getElementById('url-params-list');
        const addParamBtn = document.getElementById('url-add-param-btn');
        const baseInput   = document.getElementById('url-base');
        const buildResBtn = document.getElementById('url-build-result-btn');

        function setResult(text, lbl = 'Result') {
            outputEl.value = text;
            label.textContent = lbl;
        }

        encBtn.addEventListener('click', () => {
            try { setResult(encodeURIComponent(inputEl.value), 'URL Encoded'); }
            catch (e) { App.toast(e.message, 'error'); }
        });

        decBtn.addEventListener('click', () => {
            try { setResult(decodeURIComponent(inputEl.value), 'URL Decoded'); }
            catch (e) { App.toast('Invalid URL encoding: ' + e.message, 'error'); }
        });

        parseBtn.addEventListener('click', () => {
            const raw = inputEl.value.trim();
            let url;
            try { url = new URL(raw.startsWith('http') ? raw : 'https://' + raw); }
            catch { App.toast('Could not parse as URL. Try including http:// or https://', 'error'); return; }

            parsedCard.classList.remove('hidden');
            builderCard.classList.add('hidden');

            const params = [...url.searchParams.entries()];
            const fields = [
                ['Protocol', url.protocol],
                ['Host',     url.host],
                ['Pathname', url.pathname],
                ['Search',   url.search || '(none)'],
                ['Hash',     url.hash   || '(none)'],
                ['Origin',   url.origin],
            ];

            parsedBody.innerHTML = fields.map(([k, v]) => `
                <div style="display:flex;align-items:flex-start;gap:.75rem;font-size:.82rem">
                    <span style="width:80px;flex-shrink:0;color:var(--text-muted);font-weight:500">${k}</span>
                    <span class="dir-ltr text-mono" style="flex:1;color:var(--text-secondary);word-break:break-all">${v}</span>
                </div>`).join('<hr class="divider" style="margin:.5rem 0">') +
            (params.length ? `
                <hr class="divider">
                <div style="font-size:.78rem;font-weight:600;color:var(--text-muted);margin-bottom:.375rem">Query Parameters</div>
                ${params.map(([k,v]) => `<div style="display:flex;gap:.5rem;font-size:.82rem"><span class="badge badge-indigo" style="font-size:.7rem">${k}</span><span class="dir-ltr text-mono" style="color:var(--text-secondary);word-break:break-all">${v}</span></div>`).join('')}` : '');

            setResult(url.href, 'Parsed URL');
        });

        /* Builder */
        let paramCount = 0;

        function addParamRow(key = '', val = '') {
            paramCount++;
            const row = document.createElement('div');
            row.className = 'row';
            row.dataset.paramId = paramCount;
            row.innerHTML = `
                <input type="text" class="field-input" placeholder="Key" value="${key}" style="flex:1" aria-label="Param key">
                <input type="text" class="field-input dir-ltr" placeholder="Value" value="${val}" style="flex:2" aria-label="Param value">
                <button class="btn-icon btn-danger" title="Remove param" aria-label="Remove param">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>`;
            row.querySelector('.btn-danger').addEventListener('click', () => row.remove());
            paramsList.appendChild(row);
        }

        buildBtn.addEventListener('click', () => {
            parsedCard.classList.add('hidden');
            builderCard.classList.remove('hidden');
            if (!paramsList.children.length) addParamRow();
        });

        addParamBtn.addEventListener('click', () => addParamRow());

        buildResBtn.addEventListener('click', () => {
            const base = baseInput.value.trim() || 'https://example.com';
            const rows = paramsList.querySelectorAll('[data-param-id]');
            const params = [];
            rows.forEach(row => {
                const [k, v] = row.querySelectorAll('input');
                if (k.value.trim()) params.push([k.value.trim(), v.value]);
            });

            let result = base;
            if (params.length) {
                const qs = params.map(([k,v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');
                result += (base.includes('?') ? '&' : '?') + qs;
            }
            setResult(result, 'Built URL');
        });

        clearBtn.addEventListener('click', () => {
            inputEl.value = ''; outputEl.value = '';
            parsedCard.classList.add('hidden');
            builderCard.classList.add('hidden');
        });

        App.initCopyBtn(copyBtn, () => outputEl.value);
    };
})(window.App);
