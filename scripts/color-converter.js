(function (App) {
    if (!App) return;

    App.initColor = function () {
        const view = document.getElementById('view-color');
        if (!view || view.innerHTML.trim() !== '') return;

        view.innerHTML = `
<div class="gap-row">
    <div class="tool-header">
        <div>
            <h2 class="tool-title">Color Converter</h2>
            <p class="tool-desc">Convert colors between HEX, RGB, HSL, HSB/HSV, CMYK and CSS color names.</p>
        </div>
    </div>

    <!-- Picker + Preview -->
    <div class="card">
        <div class="card-header"><span class="card-title">Color Picker</span></div>
        <div class="card-body">
            <div class="row" style="gap:1.25rem;flex-wrap:wrap;align-items:center">
                <label style="position:relative;cursor:pointer">
                    <div id="color-swatch" style="width:80px;height:80px;border-radius:var(--radius-lg);border:2px solid var(--border-strong);box-shadow:var(--shadow-md);overflow:hidden">
                        <input id="color-picker" type="color" value="#6366f1"
                            style="opacity:0;position:absolute;inset:0;width:100%;height:100%;cursor:pointer;border:none" aria-label="Color picker">
                    </div>
                </label>
                <div class="row" style="gap:.5rem;flex:1;flex-wrap:wrap">
                    <input id="color-hex-input" type="text" class="field-input field-mono" style="flex:1;min-width:120px"
                        placeholder="#6366f1" aria-label="HEX value" spellcheck="false" autocomplete="off">
                    <button id="color-random-btn" class="btn btn-secondary">Random</button>
                    <button id="color-clear-btn" class="btn btn-ghost">Reset</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Formats grid -->
    <div class="grid-2" id="color-formats"></div>

    <!-- Color harmonies -->
    <div class="card">
        <div class="card-header"><span class="card-title">Color Harmonies</span></div>
        <div class="card-body">
            <div style="display:flex;flex-wrap:wrap;gap:.5rem;margin-bottom:.75rem" id="color-harmony-tabs">
                <button class="btn btn-secondary btn-sm color-harmony-tab active" data-harmony="complementary">Complementary</button>
                <button class="btn btn-secondary btn-sm color-harmony-tab" data-harmony="triadic">Triadic</button>
                <button class="btn btn-secondary btn-sm color-harmony-tab" data-harmony="analogous">Analogous</button>
                <button class="btn btn-secondary btn-sm color-harmony-tab" data-harmony="split">Split Complementary</button>
                <button class="btn btn-secondary btn-sm color-harmony-tab" data-harmony="tetradic">Tetradic</button>
            </div>
            <div id="color-harmonies" style="display:flex;gap:.75rem;flex-wrap:wrap"></div>
        </div>
    </div>

    <!-- Shades -->
    <div class="card">
        <div class="card-header"><span class="card-title">Tints & Shades</span></div>
        <div class="card-body">
            <div id="color-shades" style="display:flex;gap:.375rem;flex-wrap:wrap"></div>
        </div>
    </div>
</div>

<style>
.color-format-card { padding:.875rem 1rem;background:var(--code-bg);border:1px solid var(--border-default);border-radius:var(--radius-md);display:flex;flex-direction:column;gap:.5rem }
.color-format-label { font-size:.7rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:.07em;font-weight:600 }
.color-format-value { font-family:'JetBrains Mono',monospace;font-size:.9rem;color:var(--text-primary);word-break:break-all }
.color-format-copy { margin-left:auto;flex-shrink:0 }
.color-harmony-swatch { flex:1;min-width:60px;border-radius:var(--radius-md);height:64px;cursor:pointer;position:relative;transition:transform var(--transition-fast);border:2px solid transparent }
.color-harmony-swatch:hover { transform:scale(1.04);border-color:var(--border-strong) }
.color-harmony-swatch .swatch-hex { position:absolute;bottom:0;left:0;right:0;text-align:center;font-size:.65rem;font-family:'JetBrains Mono',monospace;background:rgba(0,0,0,.4);color:#fff;padding:.15rem .25rem;border-radius:0 0 var(--radius-md) var(--radius-md);opacity:0;transition:opacity var(--transition-fast) }
.color-harmony-swatch:hover .swatch-hex { opacity:1 }
.color-harmony-tab.active { background:var(--nav-item-active-bg);color:var(--nav-item-active-text);border-color:var(--accent-1) }
.color-shade-swatch { width:40px;height:40px;border-radius:var(--radius-sm);cursor:pointer;transition:transform var(--transition-fast);border:2px solid transparent;flex-shrink:0 }
.color-shade-swatch:hover { transform:scale(1.12);border-color:var(--border-strong) }
</style>`;

        const pickerEl  = document.getElementById('color-picker');
        const hexInput  = document.getElementById('color-hex-input');
        const swatchEl  = document.getElementById('color-swatch');
        const formatsEl = document.getElementById('color-formats');
        const harmoniesEl = document.getElementById('color-harmonies');
        const shadesEl  = document.getElementById('color-shades');
        const harmonyTabs = document.querySelectorAll('.color-harmony-tab');
        const randomBtn = document.getElementById('color-random-btn');
        const clearBtn  = document.getElementById('color-clear-btn');

        let currentHex = '#6366f1';
        let activeHarmony = 'complementary';

        /* ── Color math ── */
        function hexToRgb(hex) {
            hex = hex.replace(/^#/, '');
            if (hex.length === 3) hex = hex.split('').map(c=>c+c).join('');
            const n = parseInt(hex, 16);
            return { r: (n>>16)&255, g: (n>>8)&255, b: n&255 };
        }
        function rgbToHex({r,g,b}) {
            return '#' + [r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('');
        }
        function rgbToHsl({r,g,b}) {
            r/=255; g/=255; b/=255;
            const max=Math.max(r,g,b),min=Math.min(r,g,b);
            let h,s,l=(max+min)/2;
            if(max===min){h=s=0}else{
                const d=max-min;
                s=l>.5?d/(2-max-min):d/(max+min);
                switch(max){case r:h=(g-b)/d+(g<b?6:0);break;case g:h=(b-r)/d+2;break;case b:h=(r-g)/d+4;}
                h/=6;
            }
            return {h:Math.round(h*360),s:Math.round(s*100),l:Math.round(l*100)};
        }
        function hslToRgb(h,s,l) {
            s/=100;l/=100;
            const a=s*Math.min(l,1-l);
            const f=n=>{const k=(n+h/30)%12;return l-a*Math.max(Math.min(k-3,9-k,1),-1);};
            return {r:Math.round(f(0)*255),g:Math.round(f(8)*255),b:Math.round(f(4)*255)};
        }
        function rgbToHsb({r,g,b}) {
            r/=255;g/=255;b/=255;
            const max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min;
            let h=0,s=max===0?0:d/max,v=max;
            if(d!==0){switch(max){case r:h=(g-b)/d+(g<b?6:0);break;case g:h=(b-r)/d+2;break;case b:h=(r-g)/d+4;}h/=6;}
            return {h:Math.round(h*360),s:Math.round(s*100),b:Math.round(v*100)};
        }
        function rgbToCmyk({r,g,b}) {
            r/=255;g/=255;b/=255;
            const k=1-Math.max(r,g,b);
            if(k===1) return {c:0,m:0,y:0,k:100};
            return {c:Math.round((1-r-k)/(1-k)*100),m:Math.round((1-g-k)/(1-k)*100),y:Math.round((1-b-k)/(1-k)*100),k:Math.round(k*100)};
        }
        function rotateHue(hex,deg) {
            const rgb=hexToRgb(hex);
            const hsl=rgbToHsl(rgb);
            return rgbToHex(hslToRgb((hsl.h+deg+360)%360,hsl.s,hsl.l));
        }
        function getLuminance({r,g,b}) {
            const [rs,gs,bs]=[r,g,b].map(v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4);});
            return .2126*rs+.7152*gs+.0722*bs;
        }
        function contrastColor(hex) {
            const lum = getLuminance(hexToRgb(hex));
            return lum > 0.35 ? '#000000' : '#ffffff';
        }

        function getHarmony(hex, type) {
            switch(type) {
                case 'complementary': return [hex, rotateHue(hex,180)];
                case 'triadic':       return [hex, rotateHue(hex,120), rotateHue(hex,240)];
                case 'analogous':     return [rotateHue(hex,-30),hex,rotateHue(hex,30)];
                case 'split':         return [hex, rotateHue(hex,150), rotateHue(hex,210)];
                case 'tetradic':      return [hex,rotateHue(hex,90),rotateHue(hex,180),rotateHue(hex,270)];
                default:              return [hex];
            }
        }

        function getShades(hex) {
            const rgb = hexToRgb(hex);
            const hsl = rgbToHsl(rgb);
            const shades = [];
            for(let l=5;l<=95;l+=10) shades.push(rgbToHex(hslToRgb(hsl.h,hsl.s,l)));
            return shades;
        }

        function formatHex(hex) { return hex.toUpperCase(); }

        function render(hex) {
            if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return;
            currentHex = hex.toLowerCase();
            pickerEl.value = currentHex;
            hexInput.value = hex.toUpperCase();
            swatchEl.style.background = hex;

            const rgb  = hexToRgb(hex);
            const hsl  = rgbToHsl(rgb);
            const hsb  = rgbToHsb(rgb);
            const cmyk = rgbToCmyk(rgb);

            const formats = [
                { label:'HEX',  value: formatHex(hex), copy: formatHex(hex) },
                { label:'RGB',  value: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`, copy: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` },
                { label:'HSL',  value: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`, copy: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` },
                { label:'HSB/HSV', value:`hsb(${hsb.h}, ${hsb.s}%, ${hsb.b}%)`, copy:`hsb(${hsb.h}, ${hsb.s}%, ${hsb.b}%)` },
                { label:'CMYK', value:`cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`, copy:`cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)` },
                { label:'CSS HEX', value:formatHex(hex), copy:formatHex(hex) },
                { label:'RGB %', value:`rgb(${(rgb.r/255*100).toFixed(1)}%, ${(rgb.g/255*100).toFixed(1)}%, ${(rgb.b/255*100).toFixed(1)}%)`, copy:`rgb(${(rgb.r/255*100).toFixed(1)}%, ${(rgb.g/255*100).toFixed(1)}%, ${(rgb.b/255*100).toFixed(1)}%)` },
                { label:'Integer', value:`${(rgb.r<<16)|(rgb.g<<8)|rgb.b}`, copy:`${(rgb.r<<16)|(rgb.g<<8)|rgb.b}` },
            ];

            formatsEl.innerHTML = formats.map(f => `
                <div class="color-format-card">
                    <div style="display:flex;align-items:center;gap:.5rem">
                        <span class="color-format-label">${f.label}</span>
                        <button class="btn-icon color-format-copy" data-copy="${f.copy}" aria-label="Copy ${f.label}">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"/></svg>
                        </button>
                    </div>
                    <div class="color-format-value">${f.value}</div>
                </div>`).join('');

            formatsEl.querySelectorAll('.color-format-copy').forEach(btn => {
                App.initCopyBtn(btn, () => btn.dataset.copy);
            });

            renderHarmonies(hex);
            renderShades(hex);
        }

        function renderHarmonies(hex) {
            const colors = getHarmony(hex, activeHarmony);
            harmoniesEl.innerHTML = colors.map(c => `
                <div class="color-harmony-swatch" style="background:${c};color:${contrastColor(c)}" data-hex="${c}" title="${c.toUpperCase()}">
                    <div class="swatch-hex">${c.toUpperCase()}</div>
                </div>`).join('');
            harmoniesEl.querySelectorAll('.color-harmony-swatch').forEach(s => {
                s.addEventListener('click', () => {
                    render(s.dataset.hex);
                    hexInput.value = s.dataset.hex.toUpperCase();
                });
            });
        }

        function renderShades(hex) {
            const shades = getShades(hex);
            shadesEl.innerHTML = shades.map(c => `
                <div class="color-shade-swatch" style="background:${c}" data-hex="${c}" title="${c.toUpperCase()}"></div>`).join('');
            shadesEl.querySelectorAll('.color-shade-swatch').forEach(s => {
                s.addEventListener('click', () => { render(s.dataset.hex); });
            });
        }

        pickerEl.addEventListener('input', () => render(pickerEl.value));

        hexInput.addEventListener('input', () => {
            let v = hexInput.value.trim();
            if (!v.startsWith('#')) v = '#' + v;
            if (/^#[0-9a-fA-F]{6}$/.test(v)) render(v);
        });
        hexInput.addEventListener('keydown', e => {
            if (e.key === 'Enter') {
                let v = hexInput.value.trim();
                if (!v.startsWith('#')) v = '#' + v;
                if (/^#[0-9a-fA-F]{6}$/.test(v)) render(v);
            }
        });

        randomBtn.addEventListener('click', () => {
            const r = '#' + Math.floor(Math.random()*0xFFFFFF).toString(16).padStart(6,'0');
            render(r);
        });
        clearBtn.addEventListener('click', () => render('#6366f1'));

        harmonyTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                harmonyTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                activeHarmony = tab.dataset.harmony;
                renderHarmonies(currentHex);
            });
        });

        render('#6366f1');
    };
})(window.App);
