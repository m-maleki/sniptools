(function (App) {
    if (!App) return;

    App.initUuid = function () {
        const view = document.getElementById('view-uuid');
        if (!view || view.innerHTML.trim() !== '') return;

        view.innerHTML = `
<div class="gap-row">
    <div class="tool-header">
        <div>
            <h2 class="tool-title">UUID / GUID Generator</h2>
            <p class="tool-desc">Generate v4 (random) or v7 (time-ordered) UUIDs in bulk. Export as plain text file.</p>
        </div>
    </div>

    <div class="grid-2">
        <!-- Controls -->
        <div class="card">
            <div class="card-header"><span class="card-title">Settings</span></div>
            <div class="card-body gap-row-sm">
                <!-- Version -->
                <div>
                    <label class="text-sm text-secondary" style="display:block;margin-bottom:.375rem">UUID Version</label>
                    <div class="row" style="flex-wrap:wrap;gap:.375rem" id="uuid-version-btns">
                        <button class="btn btn-primary btn-sm uuid-ver-btn" data-ver="4">v4 Random</button>
                        <button class="btn btn-secondary btn-sm uuid-ver-btn" data-ver="7">v7 Time-ordered</button>
                        <button class="btn btn-secondary btn-sm uuid-ver-btn" data-ver="nil">NIL UUID</button>
                    </div>
                </div>

                <!-- Amount -->
                <div class="row-between">
                    <label for="uuid-count-input" class="text-sm text-secondary">Amount</label>
                    <input type="number" id="uuid-count-input" min="1" max="1000" value="10"
                        class="field-input field-mono" style="width:90px;text-align:center" aria-label="Number of UUIDs">
                </div>

                <!-- Format -->
                <div>
                    <label class="text-sm text-secondary" style="display:block;margin-bottom:.375rem">Format</label>
                    <select id="uuid-format" class="field-select" aria-label="UUID format">
                        <option value="standard">Standard (lowercase)</option>
                        <option value="upper">Uppercase</option>
                        <option value="braces">With braces {}</option>
                        <option value="urn">URN format</option>
                        <option value="nodashes">No dashes</option>
                    </select>
                </div>

                <hr class="divider">

                <!-- Actions -->
                <button id="uuid-generate-btn" class="btn btn-primary btn-full btn-lg">Generate</button>
                <div class="row" style="flex-wrap:wrap;gap:.375rem">
                    <button id="uuid-copy-all-btn" class="btn btn-secondary" style="flex:1">Copy All</button>
                    <button id="uuid-export-btn"   class="btn btn-secondary" style="flex:1">Export .txt</button>
                    <button id="uuid-clear-btn"    class="btn btn-ghost btn-sm">Clear</button>
                </div>
            </div>
        </div>

        <!-- Output -->
        <div class="card" style="display:flex;flex-direction:column">
            <div class="card-header">
                <span class="card-title">Generated UUIDs</span>
                <span id="uuid-count-badge" class="badge badge-indigo">0</span>
            </div>
            <div class="card-body" style="flex:1;padding-top:.75rem">
                <div id="uuid-list" class="uuid-list">
                    <div class="empty-state">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5l-3.9 19.5m-2.1-19.5l-3.9 19.5"/></svg>
                        <p>Click Generate to create UUIDs</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>`;

        const versionBtns  = document.querySelectorAll('.uuid-ver-btn');
        const countInput   = document.getElementById('uuid-count-input');
        const formatSel    = document.getElementById('uuid-format');
        const generateBtn  = document.getElementById('uuid-generate-btn');
        const copyAllBtn   = document.getElementById('uuid-copy-all-btn');
        const exportBtn    = document.getElementById('uuid-export-btn');
        const clearBtn     = document.getElementById('uuid-clear-btn');
        const listEl       = document.getElementById('uuid-list');
        const countBadge   = document.getElementById('uuid-count-badge');

        let selectedVersion = '4';
        let generatedUuids = [];

        versionBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                selectedVersion = btn.dataset.ver;
                versionBtns.forEach(b => {
                    b.classList.toggle('btn-primary', b === btn);
                    b.classList.toggle('btn-secondary', b !== btn);
                });
            });
        });

        function uuidV4() {
            if (crypto.randomUUID) return crypto.randomUUID();
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
                const r = crypto.getRandomValues(new Uint8Array(1))[0] & 15;
                return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
            });
        }

        function uuidV7() {
            const ts = BigInt(Date.now());
            const tsHex = ts.toString(16).padStart(12, '0');
            const rand  = Array.from(crypto.getRandomValues(new Uint8Array(10)))
                .map(b => b.toString(16).padStart(2,'0')).join('');
            const ver  = '7';
            const var_ = ((parseInt(rand[2], 16) & 0x3) | 0x8).toString(16);
            return `${tsHex.slice(0,8)}-${tsHex.slice(8,12)}-${ver}${rand.slice(0,3)}-${var_}${rand.slice(3,7)}-${rand.slice(7)}`;
        }

        function nilUUID() { return '00000000-0000-0000-0000-000000000000'; }

        function applyFormat(uuid) {
            switch (formatSel.value) {
                case 'upper':    return uuid.toUpperCase();
                case 'braces':   return `{${uuid}}`;
                case 'urn':      return `urn:uuid:${uuid}`;
                case 'nodashes': return uuid.replace(/-/g, '');
                default:         return uuid;
            }
        }

        function generate() {
            const count = Math.min(1000, Math.max(1, parseInt(countInput.value) || 10));
            generatedUuids = [];

            for (let i = 0; i < count; i++) {
                let raw;
                if (selectedVersion === '7') raw = uuidV7();
                else if (selectedVersion === 'nil') raw = nilUUID();
                else raw = uuidV4();
                generatedUuids.push(applyFormat(raw));
            }

            renderList();
        }

        function renderList() {
            countBadge.textContent = generatedUuids.length;
            if (!generatedUuids.length) {
                listEl.innerHTML = `<div class="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5l-3.9 19.5m-2.1-19.5l-3.9 19.5"/></svg><p>Click Generate to create UUIDs</p></div>`;
                return;
            }

            const frag = document.createDocumentFragment();
            generatedUuids.forEach((uuid, i) => {
                const item = document.createElement('div');
                item.className = 'uuid-item';
                item.innerHTML = `
                    <span class="uuid-index">${i + 1}</span>
                    <span class="uuid-text">${uuid}</span>
                    <button class="btn-icon" title="Copy" aria-label="Copy UUID ${i+1}">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"/></svg>
                    </button>`;
                App.initCopyBtn(item.querySelector('.btn-icon'), uuid);
                frag.appendChild(item);
            });
            listEl.innerHTML = '';
            listEl.appendChild(frag);
        }

        generateBtn.addEventListener('click', generate);

        copyAllBtn.addEventListener('click', () => {
            if (!generatedUuids.length) return;
            App.copyText(generatedUuids.join('\n'), `${generatedUuids.length} UUIDs copied!`);
        });

        exportBtn.addEventListener('click', () => {
            if (!generatedUuids.length) { App.toast('Generate some UUIDs first', 'error'); return; }
            const blob = new Blob([generatedUuids.join('\n')], { type: 'text/plain' });
            const url  = URL.createObjectURL(blob);
            const a    = document.createElement('a');
            a.href = url;
            a.download = `uuids-${Date.now()}.txt`;
            a.click();
            URL.revokeObjectURL(url);
            App.toast('File downloaded');
        });

        clearBtn.addEventListener('click', () => {
            generatedUuids = [];
            renderList();
        });

        generate();
    };
})(window.App);
