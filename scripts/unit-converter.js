(function (App) {
    if (!App) return;

    App.initUnits = function () {
        const view = document.getElementById('view-units');
        if (!view || view.innerHTML.trim() !== '') return;

        const UNITS = {
            length: {
                label: 'Length',
                units: { 'Meter': 1, 'Kilometer': 1e3, 'Centimeter': 1e-2, 'Millimeter': 1e-3, 'Micrometer': 1e-6, 'Nanometer': 1e-9, 'Mile': 1609.344, 'Yard': 0.9144, 'Foot': 0.3048, 'Inch': 0.0254, 'Nautical Mile': 1852 }
            },
            data: {
                label: 'Data Size',
                units: { 'Bit': 1, 'Byte': 8, 'Kilobit': 1e3, 'Kilobyte': 8e3, 'Megabit': 1e6, 'Megabyte': 8e6, 'Gigabit': 1e9, 'Gigabyte': 8e9, 'Terabit': 1e12, 'Terabyte': 8e12, 'Petabyte': 8e15 }
            },
            time: {
                label: 'Time',
                units: { 'Nanosecond': 1e-9, 'Microsecond': 1e-6, 'Millisecond': 1e-3, 'Second': 1, 'Minute': 60, 'Hour': 3600, 'Day': 86400, 'Week': 604800, 'Month': 2629800, 'Year': 31557600 }
            },
            temperature: {
                label: 'Temperature',
                special: true,
                units: {
                    'Celsius':    { toK: c => c + 273.15,          fromK: k => k - 273.15 },
                    'Fahrenheit': { toK: f => (f-32)*5/9 + 273.15, fromK: k => (k-273.15)*9/5 + 32 },
                    'Kelvin':     { toK: k => k,                   fromK: k => k },
                    'Rankine':    { toK: r => r * 5/9,             fromK: k => k * 9/5 }
                }
            },
            weight: {
                label: 'Weight',
                units: { 'Kilogram': 1, 'Gram': 1e-3, 'Milligram': 1e-6, 'Metric Ton': 1e3, 'Pound': 0.453592, 'Ounce': 0.0283495, 'Stone': 6.35029, 'Short Ton': 907.185 }
            },
            area: {
                label: 'Area',
                units: { 'Square Meter': 1, 'Square Kilometer': 1e6, 'Square Centimeter': 1e-4, 'Square Millimeter': 1e-6, 'Square Mile': 2589988.11, 'Square Yard': 0.836127, 'Square Foot': 0.092903, 'Square Inch': 6.4516e-4, 'Hectare': 1e4, 'Acre': 4046.86 }
            },
            volume: {
                label: 'Volume',
                units: { 'Cubic Meter': 1, 'Liter': 1e-3, 'Milliliter': 1e-6, 'Cubic Centimeter': 1e-6, 'US Gallon': 3.78541e-3, 'Imperial Gallon': 4.54609e-3, 'US Fluid Ounce': 2.95735e-5, 'US Cup': 2.36588e-4, 'Cubic Foot': 0.0283168, 'Cubic Inch': 1.63871e-5 }
            },
            speed: {
                label: 'Speed',
                units: { 'Meter/second': 1, 'Kilometer/hour': 1/3.6, 'Miles/hour': 0.44704, 'Knot': 0.514444, 'Foot/second': 0.3048 }
            }
        };

        view.innerHTML = `
<div class="gap-row">
    <div class="tool-header">
        <div>
            <h2 class="tool-title">Unit Converter</h2>
            <p class="tool-desc">Convert between length, weight, temperature, data, time and more.</p>
        </div>
    </div>

    <!-- Category tabs -->
    <div style="display:flex;flex-wrap:wrap;gap:.375rem" id="unit-cats"></div>

    <div class="grid-2">
        <!-- From -->
        <div class="card">
            <div class="card-header"><span class="card-title">From</span></div>
            <div class="card-body gap-row-sm">
                <input id="unit-value" type="number" class="field-input field-mono" placeholder="Enter value…" aria-label="Value to convert">
                <select id="unit-from" class="field-select" aria-label="Convert from unit"></select>
            </div>
        </div>

        <!-- Swap + To -->
        <div class="card">
            <div class="card-header">
                <span class="card-title">To</span>
                <button id="unit-swap-btn" class="btn btn-ghost btn-sm" title="Swap units" aria-label="Swap from and to units">⇄ Swap</button>
            </div>
            <div class="card-body gap-row-sm">
                <div class="unit-result" id="unit-result">
                    <span class="placeholder">Enter a value and select units</span>
                </div>
                <select id="unit-to" class="field-select" aria-label="Convert to unit"></select>
            </div>
        </div>
    </div>

    <!-- All conversions -->
    <div id="unit-all-card" class="card hidden">
        <div class="card-header">
            <span class="card-title" id="unit-all-title">All conversions</span>
        </div>
        <div class="card-body gap-row-sm" id="unit-all-rows"></div>
    </div>
</div>`;

        const valueEl  = document.getElementById('unit-value');
        const fromSel  = document.getElementById('unit-from');
        const toSel    = document.getElementById('unit-to');
        const resultEl = document.getElementById('unit-result');
        const swapBtn  = document.getElementById('unit-swap-btn');
        const catsEl   = document.getElementById('unit-cats');
        const allCard  = document.getElementById('unit-all-card');
        const allRows  = document.getElementById('unit-all-rows');
        const allTitle = document.getElementById('unit-all-title');

        let currentCat = 'length';

        function buildCategoryTabs() {
            catsEl.innerHTML = Object.entries(UNITS).map(([id, def]) => `
                <button class="btn btn-secondary btn-sm cat-tab" data-cat="${id}">${def.label}</button>
            `).join('');

            catsEl.querySelectorAll('.cat-tab').forEach(btn => {
                btn.addEventListener('click', () => {
                    currentCat = btn.dataset.cat;
                    catsEl.querySelectorAll('.cat-tab').forEach(b => b.classList.remove('btn-primary'));
                    btn.classList.add('btn-primary');
                    btn.classList.remove('btn-secondary');
                    populateSelects();
                    convert();
                });
            });

            const first = catsEl.querySelector('.cat-tab');
            if (first) { first.classList.add('btn-primary'); first.classList.remove('btn-secondary'); }
        }

        function populateSelects() {
            const cat = UNITS[currentCat];
            const unitKeys = Object.keys(cat.special ? cat.units : cat.units);
            const makeOptions = sel => {
                sel.innerHTML = unitKeys.map(k => `<option value="${k}">${k}</option>`).join('');
            };
            makeOptions(fromSel);
            makeOptions(toSel);
            if (unitKeys.length > 1) toSel.selectedIndex = 1;
        }

        function fmtNum(n) {
            if (n === 0) return '0';
            const abs = Math.abs(n);
            if (abs >= 1e12 || abs <= 1e-9) return n.toExponential(6);
            if (abs >= 1) return parseFloat(n.toPrecision(10)).toString();
            return parseFloat(n.toPrecision(6)).toString();
        }

        function convert() {
            const raw = parseFloat(valueEl.value);
            const from = fromSel.value;
            const to   = toSel.value;
            const cat  = UNITS[currentCat];

            if (isNaN(raw)) {
                resultEl.innerHTML = '<span class="placeholder">Enter a value and select units</span>';
                allCard.classList.add('hidden');
                return;
            }

            let result;
            if (cat.special) {
                const valK = cat.units[from].toK(raw);
                result = cat.units[to].fromK(valK);
            } else {
                result = raw * cat.units[from] / cat.units[to];
            }

            resultEl.innerHTML = `
                <span class="val">${fmtNum(raw)}</span>
                <span class="uname">${from}</span>
                <span class="eq">=</span>
                <span class="val">${fmtNum(result)}</span>
                <span class="uname">${to}</span>`;

            /* all conversions */
            const unitKeys = Object.keys(cat.special ? cat.units : cat.units);
            allCard.classList.remove('hidden');
            allTitle.textContent = `All ${cat.label} conversions from ${fmtNum(raw)} ${from}`;
            allRows.innerHTML = unitKeys.filter(k => k !== from).map(k => {
                let res;
                if (cat.special) {
                    const valK = cat.units[from].toK(raw);
                    res = cat.units[k].fromK(valK);
                } else {
                    res = raw * cat.units[from] / cat.units[k];
                }
                return `<div style="display:flex;align-items:center;gap:.75rem;padding:.45rem .75rem;background:var(--code-bg);border:1px solid var(--border-default);border-radius:8px;font-size:.82rem">
                    <span style="flex:1;color:var(--text-muted)">${k}</span>
                    <span class="text-mono" style="color:var(--accent-3)">${fmtNum(res)}</span>
                    <button class="btn-icon" onclick="App.copyText('${fmtNum(res)}','${k} value copied')" title="Copy" style="opacity:.6;margin-left:.25rem">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"/></svg>
                    </button>
                </div>`;
            }).join('');
        }

        valueEl.addEventListener('input', convert);
        fromSel.addEventListener('change', convert);
        toSel.addEventListener('change', convert);

        swapBtn.addEventListener('click', () => {
            const tmp = fromSel.value;
            fromSel.value = toSel.value;
            toSel.value = tmp;
            convert();
        });

        buildCategoryTabs();
        populateSelects();
    };
})(window.App);
