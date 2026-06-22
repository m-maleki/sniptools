(function (App) {
    if (!App) return;

    App.initJwt = function () {
        const view = document.getElementById('view-jwt');
        if (!view || view.innerHTML.trim() !== '') return;

        view.innerHTML = `
<div class="gap-row">
    <div class="tool-header">
        <div>
            <h2 class="tool-title">JWT Decoder</h2>
            <p class="tool-desc">Paste a JSON Web Token to decode its header, payload and inspect expiry.</p>
        </div>
    </div>

    <!-- Input -->
    <div class="card">
        <div class="card-header">
            <span class="card-title">Encoded Token</span>
            <button id="jwt-clear-btn" class="btn btn-ghost btn-sm">Clear</button>
        </div>
        <div class="card-body">
            <div id="jwt-input"
                contenteditable="true"
                role="textbox"
                spellcheck="false"
                class="code-block dir-ltr"
                style="min-height:7rem;outline:none;cursor:text;"
                data-placeholder="Paste your JWT token here…"
                aria-label="JWT token input"
                aria-multiline="true"></div>
        </div>
    </div>

    <!-- Error -->
    <div id="jwt-error" class="hidden" role="alert" style="
        padding:.75rem 1rem;
        background:rgba(239,68,68,.1);
        border:1px solid rgba(239,68,68,.3);
        border-radius:var(--radius-md);
        color:var(--accent-danger);
        font-size:.85rem;
        display:flex;
        align-items:center;
        gap:.5rem;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/></svg>
        <span id="jwt-error-text"></span>
    </div>

    <!-- Expiry info bar -->
    <div id="jwt-expiry-bar" class="hidden" style="
        display:flex;
        align-items:center;
        gap:.75rem;
        padding:.75rem 1.25rem;
        background:var(--card-bg);
        border:1px solid var(--border-default);
        border-radius:10px;
        font-size:.82rem;
        flex-wrap:wrap;">
        <span id="jwt-expiry-badge"></span>
        <span id="jwt-expiry-text" style="color:var(--text-secondary)"></span>
        <span id="jwt-issued-text"  style="color:var(--text-muted);margin-left:auto"></span>
    </div>

    <!-- Decoded sections -->
    <div class="grid-3">
        <!-- Header -->
        <div class="card" style="border-top:3px solid #60a5fa">
            <div class="card-header">
                <span class="card-title jwt-header-color">Header</span>
                <button class="btn-icon" id="copy-jwt-header" title="Copy header" aria-label="Copy header">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"/></svg>
                </button>
            </div>
            <pre id="jwt-header-out" class="code-block dir-ltr jwt-header-color" style="border:none;border-radius:0 0 10px 10px;min-height:12rem;background:var(--code-bg)"></pre>
        </div>
        <!-- Payload -->
        <div class="card" style="border-top:3px solid #c084fc">
            <div class="card-header">
                <span class="card-title jwt-payload-color">Payload</span>
                <div class="row" style="gap:.375rem">
                    <button class="btn btn-ghost btn-sm" id="jwt-open-json-btn" style="display:none" title="Open in JSON editor">JSON</button>
                    <button class="btn-icon" id="copy-jwt-payload" title="Copy payload" aria-label="Copy payload">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"/></svg>
                    </button>
                </div>
            </div>
            <pre id="jwt-payload-out" class="code-block dir-ltr jwt-payload-color" style="border:none;border-radius:0 0 10px 10px;min-height:12rem;background:var(--code-bg)"></pre>
        </div>
        <!-- Signature -->
        <div class="card" style="border-top:3px solid #2dd4bf">
            <div class="card-header">
                <span class="card-title jwt-sig-color">Signature</span>
                <button class="btn-icon" id="copy-jwt-sig" title="Copy signature" aria-label="Copy signature">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"/></svg>
                </button>
            </div>
            <pre id="jwt-sig-out" class="code-block dir-ltr jwt-sig-color" style="border:none;border-radius:0 0 10px 10px;min-height:12rem;background:var(--code-bg)"></pre>
        </div>
    </div>
</div>`;

        const inputEl     = document.getElementById('jwt-input');
        const headerOut   = document.getElementById('jwt-header-out');
        const payloadOut  = document.getElementById('jwt-payload-out');
        const sigOut      = document.getElementById('jwt-sig-out');
        const errorEl     = document.getElementById('jwt-error');
        const errorText   = document.getElementById('jwt-error-text');
        const expiryBar   = document.getElementById('jwt-expiry-bar');
        const expiryBadge = document.getElementById('jwt-expiry-badge');
        const expiryText  = document.getElementById('jwt-expiry-text');
        const issuedText  = document.getElementById('jwt-issued-text');
        const clearBtn    = document.getElementById('jwt-clear-btn');
        const openJsonBtn = document.getElementById('jwt-open-json-btn');

        const b64urlDecode = str => {
            let b = str.replace(/-/g, '+').replace(/_/g, '/');
            const pad = b.length % 4;
            if (pad === 2) b += '=='; else if (pad === 3) b += '=';
            try { return decodeURIComponent(atob(b).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')); }
            catch { return null; }
        };

        const fmtDate = ts => {
            if (!ts) return null;
            const d = new Date(ts * 1000);
            return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
        };

        const relTime = ts => {
            if (!ts) return '';
            const diff = ts - Math.floor(Date.now() / 1000);
            const abs  = Math.abs(diff);
            if (abs < 60)     return `${diff > 0 ? 'in' : ''} ${abs}s${diff < 0 ? ' ago' : ''}`;
            if (abs < 3600)   return `${diff > 0 ? 'in ' : ''}${Math.floor(abs/60)}m${diff < 0 ? ' ago' : ''}`;
            if (abs < 86400)  return `${diff > 0 ? 'in ' : ''}${Math.floor(abs/3600)}h${diff < 0 ? ' ago' : ''}`;
            return `${diff > 0 ? 'in ' : ''}${Math.floor(abs/86400)}d${diff < 0 ? ' ago' : ''}`;
        };

        const showError = msg => { errorText.textContent = msg; errorEl.classList.remove('hidden'); };
        const hideError = ()  => errorEl.classList.add('hidden');

        const clearOutputs = () => {
            headerOut.textContent = '';
            payloadOut.textContent = '';
            sigOut.textContent = '';
            expiryBar.style.display = 'none';
            expiryBar.classList.add('hidden');
            openJsonBtn.style.display = 'none';
            hideError();
        };

        let lastPayloadJson = '';

        const decode = () => {
            const token = inputEl.innerText.trim();
            clearOutputs();
            if (!token) { inputEl.innerHTML = ''; return; }

            const parts = token.split('.');
            if (parts.length !== 3) { showError('A JWT must have exactly 3 parts separated by dots.'); return; }

            const [h64, p64, sig] = parts;
            let headerObj = null, payloadObj = null, hasError = false;

            const hRaw = b64urlDecode(h64);
            try { headerObj = JSON.parse(hRaw); headerOut.textContent = JSON.stringify(headerObj, null, 2); }
            catch { headerOut.textContent = hRaw || '(invalid)'; hasError = true; }

            const pRaw = b64urlDecode(p64);
            try { payloadObj = JSON.parse(pRaw); payloadOut.textContent = JSON.stringify(payloadObj, null, 2); lastPayloadJson = payloadOut.textContent; openJsonBtn.style.display = ''; }
            catch { payloadOut.textContent = pRaw || '(invalid)'; hasError = true; }

            sigOut.textContent = sig;

            if (hasError) { showError('Some token parts could not be parsed.'); }

            /* Expiry */
            if (payloadObj) {
                const exp = payloadObj.exp;
                const iat = payloadObj.iat;
                const now = Math.floor(Date.now() / 1000);

                if (exp !== undefined) {
                    expiryBar.style.display = 'flex';
                    expiryBar.classList.remove('hidden');
                    const expired = now > exp;
                    const soonThreshold = 300; // 5 min
                    const soon = !expired && (exp - now) < soonThreshold;

                    const cls = expired ? 'expiry-expired' : soon ? 'expiry-soon' : 'expiry-valid';
                    const label = expired ? '✕ Expired' : soon ? '⚠ Expires soon' : '✓ Valid';
                    expiryBadge.innerHTML = `<span class="expiry-badge ${cls}">${label}</span>`;
                    expiryText.textContent = `Expires: ${fmtDate(exp)} (${relTime(exp)})`;
                }
                if (iat !== undefined) {
                    issuedText.textContent = `Issued: ${fmtDate(iat)}`;
                }
            }

            /* Highlight token input */
            const dot = `<span style="color:var(--text-muted)">.</span>`;
            inputEl.innerHTML =
                `<span class="jwt-header-color">${h64}</span>${dot}` +
                `<span class="jwt-payload-color">${p64}</span>${dot}` +
                `<span class="jwt-sig-color">${sig}</span>`;

            /* keep cursor at end */
            const sel = window.getSelection();
            const range = document.createRange();
            range.selectNodeContents(inputEl);
            range.collapse(false);
            sel.removeAllRanges();
            sel.addRange(range);
        };

        inputEl.addEventListener('input', decode);

        clearBtn.addEventListener('click', () => { inputEl.innerHTML = ''; clearOutputs(); });

        openJsonBtn.addEventListener('click', () => {
            if (!lastPayloadJson) return;
            App.sharedData.jsonToLoad = lastPayloadJson;
            App.switchView('json');
        });

        App.initCopyBtn(document.getElementById('copy-jwt-header'), () => headerOut.textContent);
        App.initCopyBtn(document.getElementById('copy-jwt-payload'), () => payloadOut.textContent);
        App.initCopyBtn(document.getElementById('copy-jwt-sig'), () => sigOut.textContent);

        /* placeholder styling */
        const style = document.createElement('style');
        style.textContent = `
            #jwt-input:empty::before {
                content: attr(data-placeholder);
                color: var(--text-muted);
                pointer-events: none;
            }
        `;
        document.head.appendChild(style);
    };
})(window.App);
