(function (App) {
    if (!App) return;

    App.initDummydata = function () {
        const view = document.getElementById('view-dummydata');
        if (!view || view.innerHTML.trim() !== '') return;

        view.innerHTML = `
<div class="gap-row">
    <div class="tool-header">
        <div>
            <h2 class="tool-title">Dummy Data Generator</h2>
            <p class="tool-desc">Generate realistic fake data — lorem ipsum, names, emails, addresses, JSON, SQL and more.</p>
        </div>
        <div class="row" style="gap:.5rem">
            <button id="dd-generate-btn" class="btn btn-primary">Generate</button>
            <button id="dd-copy-btn" class="btn btn-secondary">Copy</button>
        </div>
    </div>

    <div class="grid-2" style="align-items:start">
        <!-- Controls -->
        <div class="gap-row">
            <div class="card">
                <div class="card-header"><span class="card-title">Data Type</span></div>
                <div class="card-body gap-row-sm">
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:.375rem" id="dd-type-grid"></div>
                </div>
            </div>
            <div class="card">
                <div class="card-header"><span class="card-title">Options</span></div>
                <div class="card-body gap-row-sm" id="dd-options-panel"></div>
            </div>
        </div>

        <!-- Output -->
        <div class="card" style="display:flex;flex-direction:column">
            <div class="card-header">
                <span class="card-title">Output</span>
                <span id="dd-item-count" class="text-xs text-muted"></span>
            </div>
            <div class="card-body" style="flex:1">
                <textarea id="dd-output" class="field-textarea dir-ltr"
                    style="min-height:460px;resize:vertical;font-size:.82rem;line-height:1.65;background:var(--code-bg)"
                    readonly aria-label="Generated output"></textarea>
            </div>
        </div>
    </div>
</div>

<style>
.dd-type-btn { padding:.55rem .75rem;border:1px solid var(--border-default);border-radius:var(--radius-md);background:var(--code-bg);color:var(--text-secondary);font-size:.8rem;cursor:pointer;text-align:left;transition:all var(--transition-fast) }
.dd-type-btn:hover { border-color:var(--border-strong);color:var(--text-primary) }
.dd-type-btn.active { background:rgba(99,102,241,.12);border-color:var(--accent-1);color:var(--nav-item-active-text) }
</style>`;

        const typeGrid   = document.getElementById('dd-type-grid');
        const optPanel   = document.getElementById('dd-options-panel');
        const outputEl   = document.getElementById('dd-output');
        const genBtn     = document.getElementById('dd-generate-btn');
        const copyBtn    = document.getElementById('dd-copy-btn');
        const countEl    = document.getElementById('dd-item-count');

        let activeType = 'lorem';

        /* ── Data sources ── */
        const firstNames = ['Alice','Bob','Carol','Dave','Eva','Frank','Grace','Henry','Iris','Jack','Kate','Liam','Maya','Noah','Olivia','Paul','Quinn','Rose','Sam','Tina','Uma','Victor','Wendy','Xander','Yara','Zane'];
        const lastNames  = ['Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Wilson','Taylor','Anderson','Thomas','Jackson','White','Harris','Martin','Thompson','Young','Lee','Walker'];
        const domains    = ['gmail.com','outlook.com','yahoo.com','company.io','dev.co','mail.net','example.com'];
        const tlds       = ['com','net','org','io','dev','app'];
        const streets    = ['Main St','Oak Ave','Maple Dr','Cedar Ln','Park Blvd','River Rd','Lake View Dr','Summit Ave'];
        const cities     = ['New York','Los Angeles','Chicago','Houston','Phoenix','Philadelphia','San Antonio','San Diego','Dallas','San Jose'];
        const states     = ['CA','NY','TX','FL','IL','PA','OH','GA','NC','MI'];
        const countries  = ['United States','United Kingdom','Canada','Australia','Germany','France','Japan','Brazil'];
        const lorem      = 'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum'.split(' ');
        const companies  = ['TechCorp','DevSolutions','CodeFactory','WebWorks','DataSystems','CloudBase','InnoSoft','ByteCraft','NetLogic','AppDev'];
        const jobTitles  = ['Software Engineer','Product Manager','UX Designer','Data Analyst','DevOps Engineer','QA Engineer','Frontend Developer','Backend Developer','Fullstack Developer','CTO'];
        const colors     = ['red','green','blue','yellow','purple','orange','pink','teal','cyan','magenta'];
        const animals    = ['cat','dog','bird','fish','rabbit','hamster','turtle','snake','lizard','parrot'];

        function rand(arr) { return arr[Math.floor(Math.random()*arr.length)]; }
        function randInt(a,b) { return Math.floor(Math.random()*(b-a+1))+a; }
        function randFloat(a,b,dec=2) { return (Math.random()*(b-a)+a).toFixed(dec); }

        /* ── Generators ── */
        const GENERATORS = {
            lorem: {
                label: 'Lorem Ipsum',
                opts: () => `
                    <div><label class="field-label">Paragraphs</label>
                    <input id="dd-opt-para" type="number" min="1" max="20" value="3" class="field-input" style="width:100px"></div>
                    <div><label class="field-label">Sentences per paragraph</label>
                    <input id="dd-opt-sents" type="number" min="1" max="15" value="5" class="field-input" style="width:100px"></div>`,
                gen: () => {
                    const para  = parseInt(document.getElementById('dd-opt-para')?.value||3);
                    const sents = parseInt(document.getElementById('dd-opt-sents')?.value||5);
                    const paras = [];
                    for(let p=0;p<para;p++){
                        const sentences=[];
                        for(let s=0;s<sents;s++){
                            const len=randInt(8,20);
                            const words=[];
                            for(let w=0;w<len;w++) words.push(rand(lorem));
                            words[0]=words[0].charAt(0).toUpperCase()+words[0].slice(1);
                            sentences.push(words.join(' ')+'.');
                        }
                        paras.push(sentences.join(' '));
                    }
                    return {text:paras.join('\n\n'), count:`${para} paragraphs`};
                }
            },
            names: {
                label: 'Full Names',
                opts: () => `<div><label class="field-label">Count</label><input id="dd-opt-count" type="number" min="1" max="100" value="10" class="field-input" style="width:100px"></div>`,
                gen: () => {
                    const n = parseInt(document.getElementById('dd-opt-count')?.value||10);
                    const names = Array.from({length:n},()=>`${rand(firstNames)} ${rand(lastNames)}`);
                    return {text:names.join('\n'), count:`${n} names`};
                }
            },
            emails: {
                label: 'Email Addresses',
                opts: () => `<div><label class="field-label">Count</label><input id="dd-opt-count" type="number" min="1" max="100" value="10" class="field-input" style="width:100px"></div>`,
                gen: () => {
                    const n = parseInt(document.getElementById('dd-opt-count')?.value||10);
                    const emails = Array.from({length:n},()=>{
                        const fn=rand(firstNames).toLowerCase(), ln=rand(lastNames).toLowerCase();
                        const sep=rand(['.','+','_','']);
                        return `${fn}${sep}${ln}${randInt(1,99)}@${rand(domains)}`;
                    });
                    return {text:emails.join('\n'), count:`${n} emails`};
                }
            },
            phones: {
                label: 'Phone Numbers',
                opts: () => `
                    <div><label class="field-label">Count</label><input id="dd-opt-count" type="number" min="1" max="100" value="10" class="field-input" style="width:100px"></div>
                    <div><label class="field-label">Format</label>
                    <select id="dd-opt-fmt" class="field-select" style="width:180px">
                        <option>(XXX) XXX-XXXX</option><option>XXX-XXX-XXXX</option><option>+1XXXXXXXXXX</option>
                    </select></div>`,
                gen: () => {
                    const n = parseInt(document.getElementById('dd-opt-count')?.value||10);
                    const fmt = document.getElementById('dd-opt-fmt')?.value || '(XXX) XXX-XXXX';
                    const phones = Array.from({length:n},()=>{
                        const a=randInt(200,999),b=randInt(100,999),c=randInt(1000,9999);
                        if(fmt.includes('+1')) return `+1${a}${b}${c}`;
                        if(fmt.includes('-')) return `${a}-${b}-${c}`;
                        return `(${a}) ${b}-${c}`;
                    });
                    return {text:phones.join('\n'), count:`${n} phone numbers`};
                }
            },
            addresses: {
                label: 'Addresses',
                opts: () => `<div><label class="field-label">Count</label><input id="dd-opt-count" type="number" min="1" max="50" value="5" class="field-input" style="width:100px"></div>`,
                gen: () => {
                    const n = parseInt(document.getElementById('dd-opt-count')?.value||5);
                    const addrs = Array.from({length:n},()=>`${randInt(1,9999)} ${rand(streets)}\n${rand(cities)}, ${rand(states)} ${randInt(10000,99999)}\n${rand(countries)}`);
                    return {text:addrs.join('\n\n'), count:`${n} addresses`};
                }
            },
            json: {
                label: 'JSON Users',
                opts: () => `<div><label class="field-label">Records</label><input id="dd-opt-count" type="number" min="1" max="50" value="5" class="field-input" style="width:100px"></div>`,
                gen: () => {
                    const n = parseInt(document.getElementById('dd-opt-count')?.value||5);
                    const records = Array.from({length:n},(_,i)=>({
                        id:i+1,
                        name:`${rand(firstNames)} ${rand(lastNames)}`,
                        email:`${rand(firstNames).toLowerCase()}.${rand(lastNames).toLowerCase()}@${rand(domains)}`,
                        phone:`+1${randInt(200,999)}${randInt(100,999)}${randInt(1000,9999)}`,
                        company:rand(companies),
                        jobTitle:rand(jobTitles),
                        city:rand(cities),
                        country:rand(countries),
                        age:randInt(18,65),
                        createdAt: new Date(Date.now()-randInt(0,365)*86400000).toISOString()
                    }));
                    return {text:JSON.stringify(records,null,2), count:`${n} records`};
                }
            },
            csv: {
                label: 'CSV Table',
                opts: () => `<div><label class="field-label">Rows</label><input id="dd-opt-count" type="number" min="1" max="100" value="10" class="field-input" style="width:100px"></div>`,
                gen: () => {
                    const n = parseInt(document.getElementById('dd-opt-count')?.value||10);
                    const header = 'id,name,email,city,age,company';
                    const rows = Array.from({length:n},(_,i)=>{
                        const fn=rand(firstNames), ln=rand(lastNames);
                        return [i+1,`${fn} ${ln}`,`${fn.toLowerCase()}.${ln.toLowerCase()}@${rand(domains)}`,rand(cities),randInt(18,65),rand(companies)].join(',');
                    });
                    return {text:[header,...rows].join('\n'), count:`${n} rows`};
                }
            },
            sql: {
                label: 'SQL INSERT',
                opts: () => `
                    <div><label class="field-label">Table name</label><input id="dd-opt-table" type="text" value="users" class="field-input field-mono" style="width:140px"></div>
                    <div><label class="field-label">Rows</label><input id="dd-opt-count" type="number" min="1" max="50" value="5" class="field-input" style="width:100px"></div>`,
                gen: () => {
                    const n     = parseInt(document.getElementById('dd-opt-count')?.value||5);
                    const table = document.getElementById('dd-opt-table')?.value||'users';
                    const rows  = Array.from({length:n},(_,i)=>{
                        const fn=rand(firstNames), ln=rand(lastNames);
                        const email=`${fn.toLowerCase()}.${ln.toLowerCase()}@${rand(domains)}`;
                        return `(${i+1}, '${fn} ${ln}', '${email}', '${rand(cities)}', ${randInt(18,65)})`;
                    }).join(',\n');
                    return {text:`INSERT INTO ${table} (id, name, email, city, age) VALUES\n${rows};`, count:`${n} rows`};
                }
            },
            uuids: {
                label: 'UUIDs',
                opts: () => `<div><label class="field-label">Count</label><input id="dd-opt-count" type="number" min="1" max="100" value="10" class="field-input" style="width:100px"></div>`,
                gen: () => {
                    const n = parseInt(document.getElementById('dd-opt-count')?.value||10);
                    const ids = Array.from({length:n},()=>{
                        const a = crypto.getRandomValues(new Uint8Array(16));
                        a[6]=(a[6]&0x0f)|0x40; a[8]=(a[8]&0x3f)|0x80;
                        const h=[...a].map(b=>b.toString(16).padStart(2,'0'));
                        return `${h.slice(0,4).join('')}-${h.slice(4,6).join('')}-${h.slice(6,8).join('')}-${h.slice(8,10).join('')}-${h.slice(10).join('')}`;
                    });
                    return {text:ids.join('\n'), count:`${n} UUIDs`};
                }
            },
            colors: {
                label: 'Colors',
                opts: () => `
                    <div><label class="field-label">Count</label><input id="dd-opt-count" type="number" min="1" max="100" value="10" class="field-input" style="width:100px"></div>
                    <div><label class="field-label">Format</label>
                    <select id="dd-opt-fmt" class="field-select" style="width:120px">
                        <option>HEX</option><option>RGB</option><option>HSL</option>
                    </select></div>`,
                gen: () => {
                    const n   = parseInt(document.getElementById('dd-opt-count')?.value||10);
                    const fmt = document.getElementById('dd-opt-fmt')?.value||'HEX';
                    const cols = Array.from({length:n},()=>{
                        const r=randInt(0,255),g=randInt(0,255),b=randInt(0,255);
                        const h=Math.round(Math.atan2(Math.sqrt(3)*(g-b),2*r-g-b)*180/Math.PI+360)%360;
                        if(fmt==='RGB') return `rgb(${r}, ${g}, ${b})`;
                        if(fmt==='HSL') return `hsl(${h}, ${randInt(30,100)}%, ${randInt(20,80)}%)`;
                        return '#'+[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('').toUpperCase();
                    });
                    return {text:cols.join('\n'), count:`${n} colors`};
                }
            },
        };

        /* Build type buttons */
        typeGrid.innerHTML = Object.entries(GENERATORS).map(([key,{label}])=>
            `<button class="dd-type-btn${key===activeType?' active':''}" data-type="${key}">${label}</button>`
        ).join('');

        function switchType(type) {
            activeType = type;
            typeGrid.querySelectorAll('.dd-type-btn').forEach(b=>{
                b.classList.toggle('active', b.dataset.type===type);
            });
            optPanel.innerHTML = GENERATORS[type].opts();
            generate();
        }

        typeGrid.querySelectorAll('.dd-type-btn').forEach(btn=>{
            btn.addEventListener('click',()=>switchType(btn.dataset.type));
        });

        function generate() {
            try {
                const {text, count} = GENERATORS[activeType].gen();
                outputEl.value = text;
                countEl.textContent = count;
            } catch(e) {
                outputEl.value = 'Error: ' + e.message;
            }
        }

        genBtn.addEventListener('click', generate);
        copyBtn.addEventListener('click', () => App.copyText(outputEl.value, 'Copied!'));

        optPanel.addEventListener('change', generate);
        optPanel.addEventListener('input', generate);

        switchType('lorem');
    };
})(window.App);
