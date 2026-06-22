(function (App) {
    if (!App) return;

    App.initBase = function () {
        const view = document.getElementById('view-base');
        if (!view || view.innerHTML.trim() !== '') return;

        view.innerHTML = `
<div class="gap-row">
    <div class="tool-header">
        <div>
            <h2 class="tool-title">Number Base Converter</h2>
            <p class="tool-desc">Convert numbers between Decimal, Hexadecimal, Binary, Octal, and any custom base.</p>
        </div>
    </div>

    <!-- Input -->
    <div class="card">
        <div class="card-header">
            <span class="card-title">Input</span>
            <button id="base-clear-btn" class="btn btn-ghost btn-sm">Clear</button>
        </div>
        <div class="card-body">
            <div class="row" style="gap:.75rem;flex-wrap:wrap">
                <div style="flex:1;min-width:200px">
                    <label class="field-label">Value</label>
                    <input id="base-input" type="text" class="field-input field-mono"
                        placeholder="Enter number…" autocomplete="off" spellcheck="false" aria-label="Input number">
                </div>
                <div style="width:140px">
                    <label class="field-label">From Base</label>
                    <select id="base-from" class="field-select">
                        <option value="10" selected>10 — Decimal</option>
                        <option value="16">16 — Hex</option>
                        <option value="2">2 — Binary</option>
                        <option value="8">8 — Octal</option>
                        <option value="36">36 — Base36</option>
                        <option value="custom">Custom…</option>
                    </select>
                </div>
                <div id="base-custom-wrap" class="hidden" style="width:100px">
                    <label class="field-label">Custom Base</label>
                    <input id="base-custom" type="number" min="2" max="36" value="12" class="field-input field-mono" aria-label="Custom base">
                </div>
            </div>
            <div id="base-error" class="hidden" style="margin-top:.5rem;font-size:.8rem;color:var(--accent-danger);padding:.4rem .75rem;background:rgba(239,68,68,.08);border-radius:var(--radius-md);border:1px solid rgba(239,68,68,.2)"></div>
        </div>
    </div>

    <!-- Results -->
    <div class="grid-2" id="base-results"></div>

    <!-- Bit viewer -->
    <div class="card" id="base-bit-card" style="display:none">
        <div class="card-header"><span class="card-title">Bit Viewer (32-bit)</span></div>
        <div class="card-body">
            <div id="base-bit-viewer" style="display:flex;flex-wrap:wrap;gap:.2rem"></div>
        </div>
    </div>

    <!-- ASCII table helper -->
    <div class="card">
        <div class="card-header"><span class="card-title">Quick Reference</span></div>
        <div class="card-body">
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(80px,1fr));gap:.375rem" id="base-ascii-grid"></div>
        </div>
    </div>
</div>

<style>
.base-result-card {
    padding:.875rem 1rem;
    background:var(--code-bg);
    border:1px solid var(--border-default);
    border-radius:var(--radius-md);
    display:flex;flex-direction:column;gap:.375rem;
}
.base-result-label { font-size:.7rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:.07em;font-weight:600 }
.base-result-value { font-family:'JetBrains Mono',monospace;font-size:.9rem;color:var(--accent-3);word-break:break-all;flex:1 }
.base-bit { width:26px;height:26px;border-radius:4px;display:flex;align-items:center;justify-content:center;font-family:'JetBrains Mono',monospace;font-size:.75rem;cursor:pointer;transition:all var(--transition-fast);user-select:none }
.base-bit-1 { background:rgba(99,102,241,.25);color:var(--accent-1);border:1px solid rgba(99,102,241,.4) }
.base-bit-0 { background:var(--input-bg);color:var(--text-muted);border:1px solid var(--border-default) }
.base-bit:hover { transform:scale(1.1) }
.base-ascii-cell { padding:.3rem .4rem;background:var(--code-bg);border:1px solid var(--border-default);border-radius:4px;text-align:center;font-size:.7rem;cursor:pointer;transition:border-color var(--transition-fast) }
.base-ascii-cell:hover { border-color:var(--accent-1) }
.base-ascii-char { color:var(--accent-3);font-weight:600 }
.base-ascii-dec  { color:var(--text-muted);font-family:'JetBrains Mono',monospace }
</style>`;

        const inputEl  = document.getElementById('base-input');
        const fromSel  = document.getElementById('base-from');
        const customWrap = document.getElementById('base-custom-wrap');
        const customEl = document.getElementById('base-custom');
        const resultsEl= document.getElementById('base-results');
        const errorEl  = document.getElementById('base-error');
        const bitCard  = document.getElementById('base-bit-card');
        const bitViewer= document.getElementById('base-bit-viewer');
        const clearBtn = document.getElementById('base-clear-btn');
        const asciiGrid= document.getElementById('base-ascii-grid');

        const BASES = [
            { label: 'Decimal',  base: 10, prefix: '' },
            { label: 'Hexadecimal', base: 16, prefix: '0x' },
            { label: 'Binary',   base: 2,  prefix: '0b' },
            { label: 'Octal',    base: 8,  prefix: '0o' },
            { label: 'Base 36',  base: 36, prefix: '' },
            { label: 'Base 32',  base: 32, prefix: '' },
        ];

        fromSel.addEventListener('change', () => {
            customWrap.classList.toggle('hidden', fromSel.value !== 'custom');
            convert();
        });
        customEl.addEventListener('input', convert);
        inputEl.addEventListener('input', convert);
        clearBtn.addEventListener('click', () => { inputEl.value = ''; convert(); });

        function getFromBase() {
            return fromSel.value === 'custom' ? parseInt(customEl.value) : parseInt(fromSel.value);
        }

        function convert() {
            const raw = inputEl.value.trim();
            errorEl.classList.add('hidden');
            resultsEl.innerHTML = '';
            bitCard.style.display = 'none';

            if (!raw) return;

            const fromBase = getFromBase();
            let decimal;
            try {
                decimal = parseInt(raw, fromBase);
                if (isNaN(decimal)) throw new Error('Invalid number for base ' + fromBase);
            } catch(e) {
                errorEl.textContent = e.message;
                errorEl.classList.remove('hidden');
                return;
            }

            const allBases = [...BASES];

            resultsEl.innerHTML = allBases.map(b => {
                const val = decimal.toString(b.base).toUpperCase();
                return `<div class="base-result-card">
                    <div style="display:flex;align-items:center;justify-content:space-between">
                        <span class="base-result-label">${b.label} (base ${b.base})</span>
                        <button class="btn-icon" data-copy="${b.prefix}${val}" aria-label="Copy">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"/></svg>
                        </button>
                    </div>
                    <div class="base-result-value">${b.prefix}${val}</div>
                </div>`;
            }).join('');

            resultsEl.querySelectorAll('[data-copy]').forEach(btn => {
                App.initCopyBtn(btn, () => btn.dataset.copy);
            });

            /* Bit viewer — only for 32-bit range */
            if (decimal >= 0 && decimal <= 0xFFFFFFFF) {
                bitCard.style.display = '';
                const bin = (decimal >>> 0).toString(2).padStart(32, '0');
                bitViewer.innerHTML = bin.split('').map((bit, i) => {
                    const bytePos = Math.floor(i / 8);
                    const marginLeft = i > 0 && i % 8 === 0 ? 'margin-left:.5rem' : '';
                    return `<div class="base-bit base-bit-${bit}" style="${marginLeft}" title="Bit ${31-i}">${bit}</div>`;
                }).join('');
            }
        }

        /* ASCII quick reference */
        const printable = [];
        for (let i = 32; i <= 126; i++) {
            printable.push({ char: String.fromCharCode(i), dec: i });
        }
        asciiGrid.innerHTML = printable.map(c => `
            <div class="base-ascii-cell" data-dec="${c.dec}" title="Click to convert ${c.dec}">
                <div class="base-ascii-char">${c.char === '<' ? '&lt;' : c.char === '>' ? '&gt;' : c.char === '&' ? '&amp;' : c.char}</div>
                <div class="base-ascii-dec">${c.dec}</div>
            </div>`).join('');

        asciiGrid.querySelectorAll('.base-ascii-cell').forEach(cell => {
            cell.addEventListener('click', () => {
                inputEl.value = cell.dataset.dec;
                if (fromSel.value !== '10') { fromSel.value = '10'; customWrap.classList.add('hidden'); }
                convert();
            });
        });

        inputEl.value = '255';
        convert();
    };
})(window.App);
