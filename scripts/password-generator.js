(function (App) {
    if (!App) return;

    App.initPassword = function () {
        const view = document.getElementById('view-password');
        if (!view || view.innerHTML.trim() !== '') return;

        const CHARS = {
            upper:   'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
            lower:   'abcdefghijklmnopqrstuvwxyz',
            numbers: '0123456789',
            symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
        };

        const EXCLUDE_AMBIGUOUS = 'Il1O0o';

        view.innerHTML = `
<div class="gap-row">
    <div class="tool-header">
        <div>
            <h2 class="tool-title">Password Generator</h2>
            <p class="tool-desc">Generate cryptographically secure passwords with customizable options. History is saved locally.</p>
        </div>
    </div>

    <!-- Output -->
    <div class="card">
        <div class="card-header">
            <span class="card-title">Generated Password</span>
            <div class="row" style="gap:.375rem">
                <button id="pw-refresh-btn" class="btn-icon" title="Generate new password" aria-label="Generate new password">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"/></svg>
                </button>
                <button id="pw-copy-btn" class="btn btn-primary btn-sm" aria-label="Copy password">Copy</button>
            </div>
        </div>
        <div class="card-body gap-row-sm">
            <input id="pw-output" type="text" class="field-input field-mono" readonly placeholder="Click Generate" aria-label="Generated password" autocomplete="off">
            <div>
                <div class="strength-blocks" id="pw-strength-blocks">
                    <div class="strength-block"></div>
                    <div class="strength-block"></div>
                    <div class="strength-block"></div>
                    <div class="strength-block"></div>
                </div>
                <div class="row-between" style="margin-top:.375rem">
                    <span id="pw-strength-text" class="text-xs text-muted"></span>
                    <span id="pw-entropy" class="text-xs text-muted"></span>
                </div>
            </div>
        </div>
    </div>

    <!-- Settings -->
    <div class="grid-2">
        <div class="card">
            <div class="card-header"><span class="card-title">Options</span></div>
            <div class="card-body gap-row-sm">
                <!-- Length -->
                <div>
                    <div class="row-between" style="margin-bottom:.5rem">
                        <label for="pw-length" class="text-sm text-secondary">Length</label>
                        <span id="pw-length-val" class="text-sm" style="font-weight:700;color:var(--accent-1);font-family:'JetBrains Mono',monospace">16</span>
                    </div>
                    <input type="range" id="pw-length" min="6" max="128" value="16" class="range-slider" aria-label="Password length">
                </div>

                <hr class="divider">

                <!-- Char types -->
                <label class="toggle-wrap" for="pw-upper">
                    <span class="toggle-label">Uppercase (A–Z)</span>
                    <input type="checkbox" id="pw-upper" class="toggle-input" checked>
                    <div class="toggle-track"><div class="toggle-thumb"></div></div>
                </label>
                <label class="toggle-wrap" for="pw-lower">
                    <span class="toggle-label">Lowercase (a–z)</span>
                    <input type="checkbox" id="pw-lower" class="toggle-input" checked>
                    <div class="toggle-track"><div class="toggle-thumb"></div></div>
                </label>
                <label class="toggle-wrap" for="pw-numbers">
                    <span class="toggle-label">Numbers (0–9)</span>
                    <input type="checkbox" id="pw-numbers" class="toggle-input" checked>
                    <div class="toggle-track"><div class="toggle-thumb"></div></div>
                </label>
                <label class="toggle-wrap" for="pw-symbols">
                    <span class="toggle-label">Symbols (!@#$…)</span>
                    <input type="checkbox" id="pw-symbols" class="toggle-input">
                    <div class="toggle-track"><div class="toggle-thumb"></div></div>
                </label>
                <label class="toggle-wrap" for="pw-no-ambiguous">
                    <span class="toggle-label">Exclude ambiguous (Il1O0o)</span>
                    <input type="checkbox" id="pw-no-ambiguous" class="toggle-input">
                    <div class="toggle-track"><div class="toggle-thumb"></div></div>
                </label>
            </div>
        </div>

        <!-- History -->
        <div class="card">
            <div class="card-header">
                <span class="card-title">History</span>
                <button id="pw-clear-history-btn" class="btn btn-ghost btn-sm">Clear</button>
            </div>
            <div class="card-body">
                <div id="pw-history" class="gap-row-sm" style="max-height:320px;overflow-y:auto;scrollbar-width:thin">
                    <div class="empty-state" style="padding:2rem">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        <p>Generated passwords will appear here</p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <button id="pw-generate-btn" class="btn btn-primary btn-lg btn-full">Generate Password</button>
</div>`;

        const outputEl     = document.getElementById('pw-output');
        const lengthInput  = document.getElementById('pw-length');
        const lengthVal    = document.getElementById('pw-length-val');
        const strengthBlocks = document.getElementById('pw-strength-blocks');
        const strengthText = document.getElementById('pw-strength-text');
        const entropyEl    = document.getElementById('pw-entropy');
        const generateBtn  = document.getElementById('pw-generate-btn');
        const refreshBtn   = document.getElementById('pw-refresh-btn');
        const copyBtn      = document.getElementById('pw-copy-btn');
        const historyEl    = document.getElementById('pw-history');
        const clearHistBtn = document.getElementById('pw-clear-history-btn');

        const checks = {
            upper:   document.getElementById('pw-upper'),
            lower:   document.getElementById('pw-lower'),
            numbers: document.getElementById('pw-numbers'),
            symbols: document.getElementById('pw-symbols'),
            noAmb:   document.getElementById('pw-no-ambiguous')
        };

        const HIST_KEY = 'sniptools-pw-history';
        let history = (() => { try { return JSON.parse(localStorage.getItem(HIST_KEY)) || []; } catch { return []; } })();

        function saveHistory() {
            if (history.length > 20) history = history.slice(0, 20);
            localStorage.setItem(HIST_KEY, JSON.stringify(history));
        }

        function renderHistory() {
            if (!history.length) {
                historyEl.innerHTML = `<div class="empty-state" style="padding:2rem"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg><p>Generated passwords will appear here</p></div>`;
                return;
            }
            historyEl.innerHTML = history.map((pw, i) => `
                <div style="display:flex;align-items:center;gap:.5rem;padding:.5rem .75rem;background:var(--code-bg);border:1px solid var(--border-default);border-radius:8px">
                    <span class="text-mono dir-ltr" style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:.78rem;color:var(--text-secondary)">${pw}</span>
                    <button class="btn-icon" data-pw="${pw}" title="Copy password">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"/></svg>
                    </button>
                </div>`).join('');

            historyEl.querySelectorAll('[data-pw]').forEach(btn => {
                App.initCopyBtn(btn, () => btn.dataset.pw);
            });
        }

        function getCharset() {
            let chars = '';
            if (checks.upper.checked)   chars += CHARS.upper;
            if (checks.lower.checked)   chars += CHARS.lower;
            if (checks.numbers.checked) chars += CHARS.numbers;
            if (checks.symbols.checked) chars += CHARS.symbols;
            if (checks.noAmb.checked)   chars = chars.split('').filter(c => !EXCLUDE_AMBIGUOUS.includes(c)).join('');
            return chars;
        }

        function calcEntropy(length, charsetSize) {
            if (!charsetSize) return 0;
            return Math.round(length * Math.log2(charsetSize));
        }

        function updateStrength(pw, charsetSize) {
            if (!pw) { strengthText.textContent = ''; entropyEl.textContent = ''; return; }

            const bits = calcEntropy(pw.length, charsetSize);
            entropyEl.textContent = `~${bits} bits entropy`;

            const blocks = strengthBlocks.children;
            let score = 0;
            if (pw.length >= 8)  score++;
            if (pw.length >= 16) score++;
            if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
            if (/[0-9]/.test(pw)) score++;
            if (/[^A-Za-z0-9]/.test(pw)) score++;

            const levels = [
                { text: '',           color: 'var(--text-muted)' },
                { text: 'Very Weak',  color: 'var(--accent-danger)' },
                { text: 'Weak',       color: 'var(--accent-warning)' },
                { text: 'Fair',       color: '#eab308' },
                { text: 'Strong',     color: 'var(--accent-4)' },
                { text: 'Very Strong',color: 'var(--accent-3)' }
            ];

            const clamped = Math.min(score, 4);
            const lvl = levels[clamped + 1] || levels[levels.length - 1];
            strengthText.textContent = lvl.text;
            strengthText.style.color = lvl.color;

            const filled = clamped;
            for (let i = 0; i < blocks.length; i++) {
                blocks[i].style.background = i < filled ? lvl.color : 'var(--bg-elevated)';
            }
        }

        function generate() {
            const chars = getCharset();
            if (!chars) { App.toast('Select at least one character type', 'error'); return; }

            const len = parseInt(lengthInput.value);
            const arr = new Uint32Array(len);
            crypto.getRandomValues(arr);
            let pw = '';
            for (let i = 0; i < len; i++) pw += chars[arr[i] % chars.length];

            outputEl.value = pw;
            updateStrength(pw, chars.length);

            history.unshift(pw);
            saveHistory();
            renderHistory();
        }

        lengthInput.addEventListener('input', () => {
            lengthVal.textContent = lengthInput.value;
            generate();
        });

        Object.values(checks).forEach(el => el.addEventListener('change', generate));
        generateBtn.addEventListener('click', generate);
        refreshBtn.addEventListener('click', generate);

        copyBtn.addEventListener('click', () => {
            if (!outputEl.value) return;
            App.copyText(outputEl.value, 'Password copied!');
        });

        clearHistBtn.addEventListener('click', () => {
            history = [];
            saveHistory();
            renderHistory();
        });

        renderHistory();
        generate();
    };
})(window.App);
