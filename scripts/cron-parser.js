(function (App) {
    if (!App) return;

    App.initCron = function () {
        const view = document.getElementById('view-cron');
        if (!view || view.innerHTML.trim() !== '') return;

        view.innerHTML = `
<div class="gap-row">
    <div class="tool-header">
        <div>
            <h2 class="tool-title">CRON Expression Parser</h2>
            <p class="tool-desc">Parse and generate CRON expressions. See plain English description and next run times.</p>
        </div>
    </div>

    <!-- Input -->
    <div class="card">
        <div class="card-header">
            <span class="card-title">Expression</span>
            <button id="cron-clear-btn" class="btn btn-ghost btn-sm">Clear</button>
        </div>
        <div class="card-body gap-row-sm">
            <input id="cron-input" type="text" class="field-input field-mono"
                placeholder="e.g.  0 9 * * 1-5" autocomplete="off" spellcheck="false" aria-label="CRON expression">
            <div id="cron-error" class="hidden" style="font-size:.8rem;color:var(--accent-danger);padding:.4rem .75rem;background:rgba(239,68,68,.08);border-radius:var(--radius-md);border:1px solid rgba(239,68,68,.2)"></div>
            <!-- field labels -->
            <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:.375rem;font-size:.68rem;text-align:center;color:var(--text-muted);font-family:'JetBrains Mono',monospace;padding:0 .25rem">
                <span>minute</span><span>hour</span><span>day</span><span>month</span><span>weekday</span>
            </div>
        </div>
    </div>

    <!-- Presets -->
    <div class="card">
        <div class="card-header"><span class="card-title">Common Presets</span></div>
        <div class="card-body" style="display:flex;flex-wrap:wrap;gap:.5rem" id="cron-presets"></div>
    </div>

    <!-- Description + Builder -->
    <div class="grid-2">
        <div class="card">
            <div class="card-header">
                <span class="card-title">Description</span>
                <button id="cron-copy-btn" class="btn-icon" aria-label="Copy description">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"/></svg>
                </button>
            </div>
            <div class="card-body gap-row-sm">
                <div id="cron-description" style="font-size:1.05rem;font-weight:600;color:var(--text-primary);min-height:2rem"></div>
                <div id="cron-fields-breakdown" style="display:flex;flex-direction:column;gap:.375rem"></div>
            </div>
        </div>

        <div class="card">
            <div class="card-header"><span class="card-title">Next 8 Run Times</span></div>
            <div class="card-body">
                <div id="cron-next-runs" style="display:flex;flex-direction:column;gap:.375rem"></div>
            </div>
        </div>
    </div>

    <!-- Visual Builder -->
    <div class="card">
        <div class="card-header"><span class="card-title">Visual Builder</span></div>
        <div class="card-body gap-row-sm" id="cron-builder"></div>
    </div>
</div>`;

        const input    = document.getElementById('cron-input');
        const errorEl  = document.getElementById('cron-error');
        const descEl   = document.getElementById('cron-description');
        const fieldsEl = document.getElementById('cron-fields-breakdown');
        const nextEl   = document.getElementById('cron-next-runs');
        const presetsEl= document.getElementById('cron-presets');
        const clearBtn = document.getElementById('cron-clear-btn');
        const copyBtn  = document.getElementById('cron-copy-btn');
        const builder  = document.getElementById('cron-builder');

        const PRESETS = [
            { label: 'Every minute',      expr: '* * * * *' },
            { label: 'Every hour',        expr: '0 * * * *' },
            { label: 'Every day at 9am',  expr: '0 9 * * *' },
            { label: 'Weekdays at 9am',   expr: '0 9 * * 1-5' },
            { label: 'Every Sunday',      expr: '0 0 * * 0' },
            { label: 'Every month 1st',   expr: '0 0 1 * *' },
            { label: 'Every 15 minutes',  expr: '*/15 * * * *' },
            { label: 'Every 6 hours',     expr: '0 */6 * * *' },
            { label: 'Weekdays at noon',  expr: '0 12 * * 1-5' },
            { label: 'Midnight daily',    expr: '0 0 * * *' },
        ];

        const MONTHS  = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        const DAYS    = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

        presetsEl.innerHTML = PRESETS.map(p =>
            `<button class="btn btn-secondary btn-sm cron-preset-btn" data-expr="${p.expr}">${p.label}</button>`
        ).join('');

        presetsEl.querySelectorAll('.cron-preset-btn').forEach(btn => {
            btn.addEventListener('click', () => { input.value = btn.dataset.expr; parse(); });
        });

        /* ── Builder ── */
        const BUILDER_FIELDS = [
            { id: 'min',  label: 'Minute',  min: 0, max: 59 },
            { id: 'hr',   label: 'Hour',    min: 0, max: 23 },
            { id: 'dom',  label: 'Day',     min: 1, max: 31 },
            { id: 'mon',  label: 'Month',   min: 1, max: 12 },
            { id: 'dow',  label: 'Weekday', min: 0, max: 6  },
        ];

        builder.innerHTML = BUILDER_FIELDS.map(f => `
            <div class="row-between">
                <span class="text-sm text-secondary" style="width:70px;flex-shrink:0">${f.label}</span>
                <div class="row" style="gap:.375rem;flex:1">
                    <label class="toggle-wrap" style="flex:0;gap:.375rem;white-space:nowrap;font-size:.78rem">
                        <input type="radio" name="cron-${f.id}-type" class="toggle-input" value="any" checked style="display:inline;width:auto;height:auto;opacity:1;position:static;appearance:auto"> Any
                    </label>
                    <label class="toggle-wrap" style="flex:0;gap:.375rem;white-space:nowrap;font-size:.78rem">
                        <input type="radio" name="cron-${f.id}-type" class="toggle-input" value="val" style="display:inline;width:auto;height:auto;opacity:1;position:static;appearance:auto"> Value
                    </label>
                    <label class="toggle-wrap" style="flex:0;gap:.375rem;white-space:nowrap;font-size:.78rem">
                        <input type="radio" name="cron-${f.id}-type" class="toggle-input" value="step" style="display:inline;width:auto;height:auto;opacity:1;position:static;appearance:auto"> Every N
                    </label>
                    <input type="number" id="cron-b-${f.id}" class="field-input field-mono" min="${f.min}" max="${f.max}" placeholder="${f.min}-${f.max}" style="width:90px" disabled>
                </div>
            </div>`).join('');

        BUILDER_FIELDS.forEach(f => {
            const radios   = builder.querySelectorAll(`[name="cron-${f.id}-type"]`);
            const numInput = builder.querySelector(`#cron-b-${f.id}`);
            radios.forEach(r => r.addEventListener('change', () => {
                numInput.disabled = r.value === 'any';
                buildFromUI();
            }));
            numInput.addEventListener('input', buildFromUI);
        });

        function buildFromUI() {
            const parts = BUILDER_FIELDS.map(f => {
                const type = builder.querySelector(`[name="cron-${f.id}-type"]:checked`)?.value || 'any';
                const val  = builder.querySelector(`#cron-b-${f.id}`).value;
                if (type === 'any')  return '*';
                if (type === 'step') return `*/${val || 1}`;
                return val || '*';
            });
            input.value = parts.join(' ');
            parse();
        }

        /* ── Parser ── */
        function parseField(s, min, max) {
            if (s === '*') return null; // any
            const vals = new Set();
            for (const part of s.split(',')) {
                if (part.startsWith('*/')) {
                    const step = parseInt(part.slice(2));
                    for (let i = min; i <= max; i += step) vals.add(i);
                } else if (part.includes('-')) {
                    const [a, b] = part.split('-').map(Number);
                    for (let i = a; i <= b; i++) vals.add(i);
                } else if (part.includes('/')) {
                    const [range, step] = part.split('/');
                    const [a, b] = range.includes('-') ? range.split('-').map(Number) : [min, max];
                    for (let i = a; i <= b; i += parseInt(step)) vals.add(i);
                } else {
                    vals.add(parseInt(part));
                }
            }
            return [...vals].sort((a,b)=>a-b);
        }

        function describeField(raw, min, max, names) {
            if (raw === '*') return 'every';
            const vals = parseField(raw, min, max);
            if (!vals) return 'every';
            if (raw.startsWith('*/')) return `every ${raw.slice(2)}`;
            if (raw.includes('-') && !raw.includes(',')) {
                const [a, b] = raw.split('-').map(Number);
                const na = names ? names[a] : a, nb = names ? names[b] : b;
                return `${na}–${nb}`;
            }
            return vals.map(v => names ? names[v] : v).join(', ');
        }

        function humanize(fields) {
            const [m, h, dom, mon, dow] = fields;
            let parts = [];
            if (m === '*' && h === '*') parts.push('every minute');
            else if (m === '*') parts.push(`every minute of hour ${describeField(h,0,23)}`);
            else if (m.startsWith('*/')) parts.push(`every ${m.slice(2)} minutes`);
            else {
                const hd = h === '*' ? 'every hour' : `${describeField(h,0,23).padStart(2,'0')}:${String(describeField(m,0,59)).padStart(2,'0')}`;
                parts.push(`at ${hd}`);
            }
            if (dow !== '*') parts.push(`on ${describeField(dow,0,6,DAYS)}`);
            else if (dom !== '*') parts.push(`on day ${describeField(dom,1,31)}`);
            if (mon !== '*') parts.push(`in ${describeField(mon,1,12,MONTHS)}`);
            return parts.join(', ');
        }

        function nextRuns(expr, count) {
            const fields = expr.trim().split(/\s+/);
            if (fields.length !== 5) return [];
            const [mF, hF, domF, monF, dowF] = fields;
            const results = [];
            const d = new Date();
            d.setSeconds(0, 0);
            d.setMinutes(d.getMinutes() + 1);

            const mVals   = parseField(mF, 0, 59);
            const hVals   = parseField(hF, 0, 23);
            const domVals = parseField(domF, 1, 31);
            const monVals = parseField(monF, 1, 12);
            const dowVals = parseField(dowF, 0, 6);

            const matches = (arr, v) => arr === null || arr.includes(v);

            let safety = 0;
            while (results.length < count && safety++ < 50000) {
                if (
                    matches(monVals, d.getMonth() + 1) &&
                    matches(domVals, d.getDate()) &&
                    matches(dowVals, d.getDay()) &&
                    matches(hVals,   d.getHours()) &&
                    matches(mVals,   d.getMinutes())
                ) results.push(new Date(d));
                d.setMinutes(d.getMinutes() + 1);
            }
            return results;
        }

        function parse() {
            const raw = input.value.trim();
            errorEl.classList.add('hidden');
            descEl.textContent = '';
            fieldsEl.innerHTML = '';
            nextEl.innerHTML = '';

            if (!raw) return;

            const parts = raw.split(/\s+/);
            if (parts.length !== 5) {
                errorEl.textContent = `Expected 5 fields (minute hour day month weekday), got ${parts.length}.`;
                errorEl.classList.remove('hidden');
                return;
            }

            try {
                const desc = humanize(parts);
                descEl.textContent = desc.charAt(0).toUpperCase() + desc.slice(1);

                const labels = ['Minute','Hour','Day of Month','Month','Day of Week'];
                const mins   = [0,0,1,1,0], maxs = [59,23,31,12,6];
                const names  = [null,null,null,MONTHS,DAYS];
                fieldsEl.innerHTML = parts.map((p,i) => `
                    <div style="display:flex;align-items:center;gap:.625rem;font-size:.82rem">
                        <span style="width:110px;color:var(--text-muted);flex-shrink:0">${labels[i]}</span>
                        <span class="text-mono" style="color:var(--accent-1)">${p}</span>
                        <span style="color:var(--text-secondary)">→ ${describeField(p, mins[i], maxs[i], names[i])}</span>
                    </div>`).join('');

                const runs = nextRuns(raw, 8);
                nextEl.innerHTML = runs.map((d, i) => `
                    <div style="display:flex;align-items:center;gap:.75rem;padding:.45rem .75rem;background:var(--code-bg);border:1px solid var(--border-default);border-radius:var(--radius-md);font-size:.82rem">
                        <span style="color:var(--text-muted);flex-shrink:0">#${i+1}</span>
                        <span class="text-mono" style="color:var(--text-primary)">${d.toLocaleString()}</span>
                    </div>`).join('') || `<div class="empty-state" style="padding:1.5rem"><p>Could not compute next runs</p></div>`;

            } catch(e) {
                errorEl.textContent = 'Could not parse expression: ' + e.message;
                errorEl.classList.remove('hidden');
            }
        }

        input.addEventListener('input', parse);

        clearBtn.addEventListener('click', () => { input.value = ''; parse(); });
        App.initCopyBtn(copyBtn, () => descEl.textContent);

        input.value = '0 9 * * 1-5';
        parse();
    };
})(window.App);
