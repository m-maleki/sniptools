(function (App) {
    if (!App) return;

    App.initHtmlentity = function () {
        const view = document.getElementById('view-htmlentity');
        if (!view || view.innerHTML.trim() !== '') return;

        view.innerHTML = `
<div class="gap-row">
    <div class="tool-header">
        <div>
            <h2 class="tool-title">HTML Entity Encoder / Decoder</h2>
            <p class="tool-desc">Encode special characters to HTML entities and decode them back.</p>
        </div>
    </div>

    <!-- Mode + Options -->
    <div class="card">
        <div class="card-header"><span class="card-title">Options</span></div>
        <div class="card-body">
            <div class="row" style="flex-wrap:wrap;gap:1rem">
                <div class="row" style="gap:.5rem">
                    <button id="he-mode-encode" class="btn btn-primary btn-sm">Encode</button>
                    <button id="he-mode-decode" class="btn btn-secondary btn-sm">Decode</button>
                </div>
                <label class="row" style="gap:.5rem;font-size:.85rem;align-items:center;cursor:pointer">
                    <input type="checkbox" id="he-named" checked style="width:auto;height:auto;opacity:1;position:static;appearance:auto"> Named entities (&amp;amp;)
                </label>
                <label class="row" style="gap:.5rem;font-size:.85rem;align-items:center;cursor:pointer">
                    <input type="checkbox" id="he-decimal" style="width:auto;height:auto;opacity:1;position:static;appearance:auto"> Decimal (&#38;)
                </label>
                <label class="row" style="gap:.5rem;font-size:.85rem;align-items:center;cursor:pointer">
                    <input type="checkbox" id="he-hex" style="width:auto;height:auto;opacity:1;position:static;appearance:auto"> Hex (&#x26;)
                </label>
                <label class="row" style="gap:.5rem;font-size:.85rem;align-items:center;cursor:pointer">
                    <input type="checkbox" id="he-all" style="width:auto;height:auto;opacity:1;position:static;appearance:auto"> All chars
                </label>
            </div>
        </div>
    </div>

    <div class="grid-2" style="align-items:stretch">
        <!-- Input -->
        <div class="card" style="display:flex;flex-direction:column">
            <div class="card-header">
                <span class="card-title" id="he-input-label">Input (plain text)</span>
                <button id="he-swap-btn" class="btn btn-ghost btn-sm" title="Swap input/output">⇅ Swap</button>
            </div>
            <div class="card-body" style="flex:1">
                <textarea id="he-input" class="field-textarea dir-ltr"
                    style="min-height:320px;resize:vertical;font-size:.85rem"
                    placeholder="Enter text to encode…" spellcheck="false" aria-label="Input"></textarea>
            </div>
        </div>

        <!-- Output -->
        <div class="card" style="display:flex;flex-direction:column">
            <div class="card-header">
                <span class="card-title" id="he-output-label">Output (encoded)</span>
                <div class="row" style="gap:.375rem">
                    <span id="he-entity-count" class="badge badge-indigo" style="display:none"></span>
                    <button id="he-copy-btn" class="btn-icon" aria-label="Copy output">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"/></svg>
                    </button>
                </div>
            </div>
            <div class="card-body" style="flex:1">
                <textarea id="he-output" class="field-textarea dir-ltr"
                    style="min-height:320px;resize:vertical;font-size:.85rem;background:var(--code-bg)"
                    readonly aria-label="Output"></textarea>
            </div>
        </div>
    </div>

    <!-- Entity reference table -->
    <div class="card">
        <div class="card-header"><span class="card-title">Common HTML Entities</span></div>
        <div class="card-body">
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:.375rem" id="he-ref-table"></div>
        </div>
    </div>
</div>`;

        const inputEl   = document.getElementById('he-input');
        const outputEl  = document.getElementById('he-output');
        const modeEnc   = document.getElementById('he-mode-encode');
        const modeDec   = document.getElementById('he-mode-decode');
        const namedCb   = document.getElementById('he-named');
        const decCb     = document.getElementById('he-decimal');
        const hexCb     = document.getElementById('he-hex');
        const allCb     = document.getElementById('he-all');
        const swapBtn   = document.getElementById('he-swap-btn');
        const copyBtn   = document.getElementById('he-copy-btn');
        const countBadge= document.getElementById('he-entity-count');
        const inputLbl  = document.getElementById('he-input-label');
        const outputLbl = document.getElementById('he-output-label');
        const refTable  = document.getElementById('he-ref-table');

        let mode = 'encode';

        const NAMED_MAP = {
            '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;',
            '©':'&copy;','®':'&reg;','™':'&trade;','€':'&euro;','£':'&pound;',
            '¥':'&yen;','¢':'&cent;','§':'&sect;','°':'&deg;','±':'&plusmn;',
            '×':'&times;','÷':'&divide;','·':'&middot;','…':'&hellip;',
            '–':'&ndash;','—':'&mdash;','←':'&larr;','→':'&rarr;','↑':'&uarr;',
            '↓':'&darr;','↔':'&harr;','♠':'&spades;','♣':'&clubs;','♥':'&hearts;',
            '♦':'&diams;','∞':'&infin;','√':'&radic;','∑':'&sum;','∏':'&prod;',
        };
        const NAMED_REVERSE = Object.fromEntries(Object.entries(NAMED_MAP).map(([k,v])=>[v,k]));

        function encodeChar(ch) {
            const named = NAMED_MAP[ch];
            if (named && namedCb.checked && !allCb.checked) return named;
            const code = ch.codePointAt(0);
            const needsEsc = NAMED_MAP[ch] || allCb.checked;
            if (!needsEsc && code < 128) return ch;
            if (hexCb.checked) return `&#x${code.toString(16).toUpperCase()};`;
            if (decCb.checked) return `&#${code};`;
            if (namedCb.checked && named) return named;
            return allCb.checked ? `&#x${code.toString(16).toUpperCase()};` : ch;
        }

        function encode(text) {
            return [...text].map(encodeChar).join('');
        }

        function decode(text) {
            return text
                .replace(/&([a-zA-Z]+);/g, (m, name) => NAMED_REVERSE['&'+name+';'] || m)
                .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h,16)))
                .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d)));
        }

        function run() {
            const input = inputEl.value;
            if (!input) { outputEl.value = ''; countBadge.style.display='none'; return; }
            const result = mode === 'encode' ? encode(input) : decode(input);
            outputEl.value = result;

            if (mode === 'encode') {
                const matches = result.match(/&[^;]+;/g);
                const cnt = matches ? matches.length : 0;
                countBadge.textContent = `${cnt} entities`;
                countBadge.style.display = cnt > 0 ? '' : 'none';
            } else {
                countBadge.style.display = 'none';
            }
        }

        function setMode(m) {
            mode = m;
            if (m === 'encode') {
                modeEnc.className = 'btn btn-primary btn-sm';
                modeDec.className = 'btn btn-secondary btn-sm';
                inputLbl.textContent  = 'Input (plain text)';
                outputLbl.textContent = 'Output (encoded)';
                inputEl.placeholder   = 'Enter text to encode…';
            } else {
                modeEnc.className = 'btn btn-secondary btn-sm';
                modeDec.className = 'btn btn-primary btn-sm';
                inputLbl.textContent  = 'Input (encoded HTML)';
                outputLbl.textContent = 'Output (decoded text)';
                inputEl.placeholder   = 'Enter encoded HTML to decode…';
            }
            run();
        }

        modeEnc.addEventListener('click', () => setMode('encode'));
        modeDec.addEventListener('click', () => setMode('decode'));
        [namedCb, decCb, hexCb, allCb].forEach(cb => cb.addEventListener('change', run));
        inputEl.addEventListener('input', run);

        swapBtn.addEventListener('click', () => {
            inputEl.value = outputEl.value;
            setMode(mode === 'encode' ? 'decode' : 'encode');
        });

        App.initCopyBtn(copyBtn, () => outputEl.value);

        /* Reference table */
        const REF = [
            ['&','&amp;','Ampersand'],['<','&lt;','Less than'],['>','&gt;','Greater than'],
            ['"','&quot;','Quotation mark'],["'",'&apos;','Apostrophe'],
            ['©','&copy;','Copyright'],['®','&reg;','Registered'],['™','&trade;','Trademark'],
            ['€','&euro;','Euro'],['£','&pound;','Pound'],['¥','&yen;','Yen'],
            ['°','&deg;','Degree'],['×','&times;','Multiply'],['÷','&divide;','Divide'],
            ['…','&hellip;','Ellipsis'],['—','&mdash;','Em dash'],['–','&ndash;','En dash'],
            ['∞','&infin;','Infinity'],['←','&larr;','Left arrow'],['→','&rarr;','Right arrow'],
        ];
        refTable.innerHTML = REF.map(([ch, entity, name]) =>
            `<div style="display:flex;align-items:center;gap:.5rem;padding:.35rem .625rem;background:var(--code-bg);border:1px solid var(--border-default);border-radius:var(--radius-md);cursor:pointer;transition:border-color var(--transition-fast)"
                 class="he-ref-row" data-entity="${entity}" title="Click to insert '${entity}'">
                <span style="font-size:1.1rem;width:22px;text-align:center">${ch}</span>
                <span class="text-mono" style="color:var(--accent-1);font-size:.78rem;flex:1">${entity}</span>
                <span style="color:var(--text-muted);font-size:.72rem">${name}</span>
            </div>`
        ).join('');

        refTable.querySelectorAll('.he-ref-row').forEach(row => {
            row.addEventListener('mouseenter', () => row.style.borderColor = 'var(--accent-1)');
            row.addEventListener('mouseleave', () => row.style.borderColor = 'var(--border-default)');
            row.addEventListener('click', () => {
                const entity = row.dataset.entity;
                const s = inputEl.selectionStart, e = inputEl.selectionEnd;
                inputEl.setRangeText(entity, s, e, 'end');
                run();
            });
        });

        /* Default demo */
        inputEl.value = '<div class="hero">\n  <h1>Hello & "World"</h1>\n  <p>Copyright © 2024 — All rights reserved™</p>\n</div>';
        run();
    };
})(window.App);
