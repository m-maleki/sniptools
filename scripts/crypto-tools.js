(function (App) {
    if (!App) return;

    App.initCrypto = function () {
        const view = document.getElementById('view-crypto');
        if (!view || view.innerHTML.trim() !== '') return;

        view.innerHTML = `
<div class="gap-row">
    <div class="tool-header">
        <div>
            <h2 class="tool-title">Crypto Tools</h2>
            <p class="tool-desc">Hash text with MD5/SHA algorithms, encode or decode Base64, compute HMAC signatures.</p>
        </div>
    </div>

    <!-- Input -->
    <div class="card">
        <div class="card-header">
            <span class="card-title">Input</span>
            <button id="crypto-clear-btn" class="btn btn-ghost btn-sm">Clear</button>
        </div>
        <div class="card-body">
            <textarea id="crypto-input" class="field-textarea" rows="5" placeholder="Enter text to hash or encode…" aria-label="Crypto input"></textarea>
        </div>
    </div>

    <!-- Actions -->
    <div class="grid-2">
        <!-- Hashing -->
        <div class="card">
            <div class="card-header">
                <span class="card-title">Hashing</span>
                <button id="crypto-hash-all-btn" class="btn btn-ghost btn-sm">Hash All</button>
            </div>
            <div class="card-body gap-row-sm">
                <div class="grid-2" style="grid-template-columns:repeat(2,1fr)">
                    <button class="crypto-btn" data-algo="MD5">MD5</button>
                    <button class="crypto-btn" data-algo="SHA1">SHA-1</button>
                    <button class="crypto-btn" data-algo="SHA256">SHA-256</button>
                    <button class="crypto-btn" data-algo="SHA512">SHA-512</button>
                    <button class="crypto-btn" data-algo="SHA3">SHA-3</button>
                    <button class="crypto-btn" data-algo="RIPEMD160">RIPEMD-160</button>
                </div>
            </div>
        </div>

        <!-- Encoding + HMAC -->
        <div class="gap-row">
            <div class="card">
                <div class="card-header"><span class="card-title">Encoding</span></div>
                <div class="card-body gap-row-sm">
                    <div class="grid-2" style="grid-template-columns:repeat(2,1fr)">
                        <button class="crypto-btn" data-algo="B64Enc">Base64 Encode</button>
                        <button class="crypto-btn" data-algo="B64Dec">Base64 Decode</button>
                        <button class="crypto-btn" data-algo="HexEnc">→ Hex</button>
                        <button class="crypto-btn" data-algo="HexDec">Hex →</button>
                    </div>
                </div>
            </div>
            <div class="card">
                <div class="card-header"><span class="card-title">HMAC</span></div>
                <div class="card-body gap-row-sm">
                    <input id="crypto-hmac-key" class="field-input" placeholder="Secret key…" aria-label="HMAC secret key">
                    <div class="grid-2" style="grid-template-columns:repeat(2,1fr)">
                        <button class="crypto-btn" data-algo="HMAC256">HMAC-SHA256</button>
                        <button class="crypto-btn" data-algo="HMAC512">HMAC-SHA512</button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Output -->
    <div class="card">
        <div class="card-header">
            <span class="card-title" id="crypto-result-label">Result</span>
            <button class="btn-icon" id="crypto-copy-btn" aria-label="Copy result">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"/></svg>
            </button>
        </div>
        <div class="card-body">
            <textarea id="crypto-output" class="field-textarea dir-ltr" rows="4" readonly aria-label="Crypto result" style="resize:none;cursor:default;color:var(--accent-3)"></textarea>
        </div>
    </div>

    <!-- Hash All output -->
    <div id="crypto-all-container" class="card hidden">
        <div class="card-header">
            <span class="card-title">All Hashes</span>
            <button id="crypto-all-copy-btn" class="btn btn-ghost btn-sm">Copy All</button>
        </div>
        <div class="card-body gap-row-sm" id="crypto-all-rows"></div>
    </div>
</div>`;

        const input      = document.getElementById('crypto-input');
        const output     = document.getElementById('crypto-output');
        const resultLabel= document.getElementById('crypto-result-label');
        const clearBtn   = document.getElementById('crypto-clear-btn');
        const copyBtn    = document.getElementById('crypto-copy-btn');
        const hashAllBtn = document.getElementById('crypto-hash-all-btn');
        const allContainer = document.getElementById('crypto-all-container');
        const allRows    = document.getElementById('crypto-all-rows');
        const hmacKey    = document.getElementById('crypto-hmac-key');

        const CJ = window.CryptoJS;

        const algos = {
            MD5:       v => CJ.MD5(v).toString(),
            SHA1:      v => CJ.SHA1(v).toString(),
            SHA256:    v => CJ.SHA256(v).toString(),
            SHA512:    v => CJ.SHA512(v).toString(),
            SHA3:      v => CJ.SHA3(v).toString(),
            RIPEMD160: v => CJ.RIPEMD160(v).toString(),
            B64Enc:    v => CJ.enc.Base64.stringify(CJ.enc.Utf8.parse(v)),
            B64Dec:    v => { try { return CJ.enc.Base64.parse(v).toString(CJ.enc.Utf8); } catch { throw new Error('Invalid Base64 string'); } },
            HexEnc:    v => Array.from(new TextEncoder().encode(v)).map(b => b.toString(16).padStart(2,'0')).join(''),
            HexDec:    v => { try { return decodeURIComponent(v.replace(/\s/g,'').match(/.{1,2}/g).map(b => '%'+b).join('')); } catch { throw new Error('Invalid hex string'); } },
            HMAC256:   (v, key) => { if(!key) throw new Error('Enter a secret key for HMAC'); return CJ.HmacSHA256(v, key).toString(); },
            HMAC512:   (v, key) => { if(!key) throw new Error('Enter a secret key for HMAC'); return CJ.HmacSHA512(v, key).toString(); },
        };

        const ALGO_LABELS = {
            MD5:'MD5', SHA1:'SHA-1', SHA256:'SHA-256', SHA512:'SHA-512', SHA3:'SHA-3', RIPEMD160:'RIPEMD-160',
            B64Enc:'Base64 Encode', B64Dec:'Base64 Decode', HexEnc:'→ Hex', HexDec:'Hex →',
            HMAC256:'HMAC-SHA256', HMAC512:'HMAC-SHA512'
        };

        function run(algo) {
            const val = input.value;
            const key = hmacKey.value;
            if (!val.trim() && !['HexDec','B64Dec'].includes(algo)) {
                App.toast('Enter some input text first', 'error'); return;
            }
            try {
                const result = algos[algo](val, key);
                output.value = result;
                resultLabel.textContent = ALGO_LABELS[algo] || 'Result';
                allContainer.classList.add('hidden');
                output.focus();
            } catch (e) {
                output.value = '';
                App.toast(e.message, 'error');
            }
        }

        view.querySelectorAll('.crypto-btn').forEach(btn => {
            btn.addEventListener('click', () => run(btn.dataset.algo));
        });

        hashAllBtn.addEventListener('click', () => {
            const val = input.value;
            if (!val.trim()) { App.toast('Enter some input text first', 'error'); return; }
            allContainer.classList.remove('hidden');
            allRows.innerHTML = ['MD5','SHA1','SHA256','SHA512','SHA3','RIPEMD160'].map(a => {
                const hash = algos[a](val);
                return `<div style="display:flex;align-items:center;gap:.75rem;padding:.5rem .75rem;background:var(--code-bg);border:1px solid var(--border-default);border-radius:8px">
                    <span style="font-size:.7rem;font-weight:600;color:var(--text-muted);width:80px;flex-shrink:0">${ALGO_LABELS[a]}</span>
                    <span class="text-mono dir-ltr" style="flex:1;word-break:break-all;color:var(--accent-3)">${hash}</span>
                    <button class="btn-icon" onclick="App.copyText('${hash}','${ALGO_LABELS[a]} copied')" title="Copy ${ALGO_LABELS[a]}">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"/></svg>
                    </button>
                </div>`;
            }).join('');

            document.getElementById('crypto-all-copy-btn').onclick = () => {
                const text = ['MD5','SHA1','SHA256','SHA512','SHA3','RIPEMD160']
                    .map(a => `${ALGO_LABELS[a]}: ${algos[a](val)}`).join('\n');
                App.copyText(text, 'All hashes copied');
            };
        });

        clearBtn.addEventListener('click', () => {
            input.value = ''; output.value = '';
            allContainer.classList.add('hidden');
            resultLabel.textContent = 'Result';
        });

        App.initCopyBtn(copyBtn, () => output.value);
    };
})(window.App);
