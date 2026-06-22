(function (App) {
    if (!App) return;

    App.initTimestamp = function () {
        const view = document.getElementById('view-timestamp');
        if (!view || view.innerHTML.trim() !== '') return;

        view.innerHTML = `
<div class="gap-row">
    <div class="tool-header">
        <div>
            <h2 class="tool-title">Timestamp Converter</h2>
            <p class="tool-desc">Convert Unix timestamps to human-readable dates and vice versa.</p>
        </div>
    </div>

    <!-- Live clock -->
    <div class="card">
        <div class="card-header">
            <span class="card-title">Current Time</span>
            <button id="ts-use-now-btn" class="btn btn-primary btn-sm">Use Now</button>
        </div>
        <div class="card-body">
            <div class="row" style="flex-wrap:wrap;gap:1rem">
                <div>
                    <div class="field-label">Unix (seconds)</div>
                    <div id="ts-clock-unix" class="text-mono" style="font-size:1.3rem;font-weight:700;color:var(--accent-1)"></div>
                </div>
                <div>
                    <div class="field-label">Unix (ms)</div>
                    <div id="ts-clock-ms" class="text-mono" style="font-size:1.1rem;color:var(--text-secondary)"></div>
                </div>
                <div>
                    <div class="field-label">ISO 8601</div>
                    <div id="ts-clock-iso" class="text-mono" style="font-size:.95rem;color:var(--text-secondary)"></div>
                </div>
            </div>
        </div>
    </div>

    <div class="grid-2">
        <!-- Unix → Human -->
        <div class="card">
            <div class="card-header"><span class="card-title">Unix → Human</span></div>
            <div class="card-body gap-row-sm">
                <div>
                    <label class="field-label">Unix Timestamp</label>
                    <div class="row" style="gap:.5rem">
                        <input id="ts-unix-input" type="number" class="field-input field-mono"
                            placeholder="1700000000" aria-label="Unix timestamp">
                        <select id="ts-unit" class="field-select" style="width:100px">
                            <option value="s" selected>Seconds</option>
                            <option value="ms">Milliseconds</option>
                        </select>
                    </div>
                </div>
                <div id="ts-unix-results" class="gap-row-sm"></div>
            </div>
        </div>

        <!-- Human → Unix -->
        <div class="card">
            <div class="card-header"><span class="card-title">Human → Unix</span></div>
            <div class="card-body gap-row-sm">
                <div>
                    <label class="field-label">Date & Time (local)</label>
                    <input id="ts-dt-input" type="datetime-local" class="field-input" step="1" aria-label="Date and time">
                </div>
                <div id="ts-dt-results" class="gap-row-sm"></div>
            </div>
        </div>
    </div>

    <!-- Duration calculator -->
    <div class="card">
        <div class="card-header"><span class="card-title">Duration Between Two Timestamps</span></div>
        <div class="card-body gap-row-sm">
            <div class="row" style="gap:.75rem;flex-wrap:wrap">
                <div style="flex:1;min-width:140px">
                    <label class="field-label">Start (Unix s)</label>
                    <input id="ts-dur-start" type="number" class="field-input field-mono" placeholder="start" aria-label="Start timestamp">
                </div>
                <div style="flex:1;min-width:140px">
                    <label class="field-label">End (Unix s)</label>
                    <input id="ts-dur-end" type="number" class="field-input field-mono" placeholder="end" aria-label="End timestamp">
                </div>
            </div>
            <div id="ts-dur-result" class="code-block" style="min-height:2.5rem;font-size:.88rem"></div>
        </div>
    </div>
</div>

<style>
.ts-result-row {
    display:flex;align-items:center;gap:.625rem;padding:.45rem .75rem;
    background:var(--code-bg);border:1px solid var(--border-default);
    border-radius:var(--radius-md);font-size:.82rem;
}
.ts-result-label { color:var(--text-muted);flex-shrink:0;width:100px }
.ts-result-value { color:var(--text-primary);font-family:'JetBrains Mono',monospace;flex:1;word-break:break-all }
</style>`;

        const clockUnix = document.getElementById('ts-clock-unix');
        const clockMs   = document.getElementById('ts-clock-ms');
        const clockIso  = document.getElementById('ts-clock-iso');
        const unixInput = document.getElementById('ts-unix-input');
        const unitSel   = document.getElementById('ts-unit');
        const unixRes   = document.getElementById('ts-unix-results');
        const dtInput   = document.getElementById('ts-dt-input');
        const dtRes     = document.getElementById('ts-dt-results');
        const useNowBtn = document.getElementById('ts-use-now-btn');
        const durStart  = document.getElementById('ts-dur-start');
        const durEnd    = document.getElementById('ts-dur-end');
        const durResult = document.getElementById('ts-dur-result');

        /* Live clock */
        function tickClock() {
            const now = new Date();
            clockUnix.textContent = Math.floor(now.getTime() / 1000);
            clockMs.textContent   = now.getTime();
            clockIso.textContent  = now.toISOString();
        }
        tickClock();
        const clockTimer = setInterval(tickClock, 1000);

        /* Clean up timer on view switch */
        view.addEventListener('remove', () => clearInterval(clockTimer));

        function formatDate(d) {
            const pad = n => String(n).padStart(2,'0');
            return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
        }

        function makeRow(label, value, copyVal) {
            return `<div class="ts-result-row">
                <span class="ts-result-label">${label}</span>
                <span class="ts-result-value">${value}</span>
                <button class="btn-icon" data-copy="${copyVal||value}" aria-label="Copy">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"/></svg>
                </button>
            </div>`;
        }

        function wirecopies(container) {
            container.querySelectorAll('[data-copy]').forEach(btn => {
                App.initCopyBtn(btn, () => btn.dataset.copy);
            });
        }

        function renderFromUnix() {
            const raw = unixInput.value.trim();
            if (!raw) { unixRes.innerHTML = ''; return; }
            let ms = parseFloat(raw);
            if (isNaN(ms)) { unixRes.innerHTML = ''; return; }
            if (unitSel.value === 's') ms *= 1000;
            const d = new Date(ms);
            if (isNaN(d.getTime())) { unixRes.innerHTML = '<span style="color:var(--accent-danger);font-size:.82rem">Invalid timestamp</span>'; return; }

            const relMs = Date.now() - ms;
            const absS  = Math.abs(relMs / 1000);
            const rel   = absS < 60 ? 'just now'
                        : absS < 3600 ? `${Math.floor(absS/60)}m ago`
                        : absS < 86400 ? `${Math.floor(absS/3600)}h ago`
                        : `${Math.floor(absS/86400)}d ago`;

            unixRes.innerHTML = [
                makeRow('Local',    formatDate(d)),
                makeRow('UTC',      d.toUTCString()),
                makeRow('ISO 8601', d.toISOString()),
                makeRow('Relative', relMs < 0 ? 'in ' + rel.replace(' ago','') : rel),
                makeRow('Day of week', d.toLocaleDateString('en-US',{weekday:'long'})),
                makeRow('Week #',   `Week ${Math.ceil((((d-new Date(d.getFullYear(),0,1))/86400000)+1)/7)}`),
            ].join('');
            wirecopies(unixRes);
        }

        function renderFromDate() {
            const raw = dtInput.value;
            if (!raw) { dtRes.innerHTML = ''; return; }
            const d = new Date(raw);
            if (isNaN(d.getTime())) { dtRes.innerHTML = ''; return; }
            const s  = Math.floor(d.getTime() / 1000);
            const ms = d.getTime();
            dtRes.innerHTML = [
                makeRow('Unix (s)',  s),
                makeRow('Unix (ms)', ms),
                makeRow('ISO 8601',  d.toISOString()),
                makeRow('UTC',       d.toUTCString()),
            ].join('');
            wirecopies(dtRes);
        }

        function renderDuration() {
            const s = parseFloat(durStart.value), e = parseFloat(durEnd.value);
            if (isNaN(s) || isNaN(e)) { durResult.textContent = ''; return; }
            const diff = Math.abs(e - s);
            const days = Math.floor(diff / 86400);
            const hrs  = Math.floor((diff % 86400) / 3600);
            const mins = Math.floor((diff % 3600) / 60);
            const secs = diff % 60;
            durResult.textContent = `${days}d ${hrs}h ${mins}m ${secs}s  (${diff.toLocaleString()} seconds)`;
        }

        unixInput.addEventListener('input', renderFromUnix);
        unitSel.addEventListener('change', renderFromUnix);
        dtInput.addEventListener('input', renderFromDate);
        durStart.addEventListener('input', renderDuration);
        durEnd.addEventListener('input', renderDuration);

        useNowBtn.addEventListener('click', () => {
            const now = Math.floor(Date.now() / 1000);
            unixInput.value = now;
            unitSel.value = 's';
            renderFromUnix();
        });

        /* Seed with now */
        unixInput.value = Math.floor(Date.now() / 1000);
        renderFromUnix();
        const nd = new Date();
        const pad = n => String(n).padStart(2,'0');
        dtInput.value = `${nd.getFullYear()}-${pad(nd.getMonth()+1)}-${pad(nd.getDate())}T${pad(nd.getHours())}:${pad(nd.getMinutes())}:${pad(nd.getSeconds())}`;
        renderFromDate();
    };
})(window.App);
