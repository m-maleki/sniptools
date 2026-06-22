(function (App) {
    if (!App) return;

    App.initDiff = function () {
        const view = document.getElementById('view-diff');
        if (!view || view.innerHTML.trim() !== '') return;

        view.innerHTML = `
<div class="gap-row">
    <div class="tool-header">
        <div>
            <h2 class="tool-title">Text Differ</h2>
            <p class="tool-desc">Compare two texts and highlight character-level or word-level differences.</p>
        </div>
        <div class="row" style="flex-wrap:wrap;gap:.5rem">
            <select id="diff-mode" class="field-select" style="width:auto;padding:.45rem 2rem .45rem .75rem;font-size:.8rem" aria-label="Diff mode">
                <option value="char">Char-level</option>
                <option value="word">Word-level</option>
                <option value="line">Line-level</option>
            </select>
            <label class="toggle-wrap" for="diff-live" style="gap:.5rem;white-space:nowrap">
                <span class="text-sm text-secondary">Live</span>
                <input type="checkbox" id="diff-live" class="toggle-input" checked>
                <div class="toggle-track"><div class="toggle-thumb"></div></div>
            </label>
        </div>
    </div>

    <!-- Stats bar -->
    <div id="diff-stats" class="hidden" style="
        display:flex;align-items:center;flex-wrap:wrap;gap:.75rem;
        padding:.625rem 1rem;
        background:var(--card-bg);border:1px solid var(--border-default);
        border-radius:var(--radius-md);font-size:.8rem;">
        <span id="diff-stat-add" style="color:var(--accent-4)"></span>
        <span id="diff-stat-del" style="color:var(--accent-danger)"></span>
        <span id="diff-stat-eq"  style="color:var(--text-muted)"></span>
    </div>

    <!-- Editors -->
    <div class="grid-2">
        <div class="card">
            <div class="card-header">
                <span class="card-title">Original</span>
                <span id="diff-count1" class="text-xs text-muted"></span>
            </div>
            <div class="card-body" style="padding-top:.75rem">
                <textarea id="diff-input1" class="field-textarea dir-ltr" rows="20" placeholder="Enter original text…" aria-label="Original text"></textarea>
            </div>
        </div>
        <div class="card">
            <div class="card-header">
                <span class="card-title">Changed</span>
                <span id="diff-count2" class="text-xs text-muted"></span>
            </div>
            <div class="card-body" style="padding-top:.75rem">
                <textarea id="diff-input2" class="field-textarea dir-ltr" rows="20" placeholder="Enter changed text…" aria-label="Changed text"></textarea>
            </div>
        </div>
    </div>

    <!-- Compare button (when live is off) -->
    <div id="diff-compare-row" class="hidden" style="text-align:center">
        <button id="diff-compare-btn" class="btn btn-primary btn-lg">Compare</button>
    </div>

    <!-- Result -->
    <div id="diff-result-card" class="card hidden">
        <div class="card-header">
            <span class="card-title">Comparison Result</span>
            <button id="diff-copy-btn" class="btn-icon" aria-label="Copy diff text">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"/></svg>
            </button>
        </div>
        <div class="card-body">
            <div id="diff-output" class="code-block dir-ltr" style="white-space:pre-wrap;word-break:break-word;min-height:4rem"></div>
        </div>
    </div>
</div>`;

        const input1      = document.getElementById('diff-input1');
        const input2      = document.getElementById('diff-input2');
        const output      = document.getElementById('diff-output');
        const resultCard  = document.getElementById('diff-result-card');
        const statsBar    = document.getElementById('diff-stats');
        const statAdd     = document.getElementById('diff-stat-add');
        const statDel     = document.getElementById('diff-stat-del');
        const statEq      = document.getElementById('diff-stat-eq');
        const count1      = document.getElementById('diff-count1');
        const count2      = document.getElementById('diff-count2');
        const modeSelect  = document.getElementById('diff-mode');
        const liveToggle  = document.getElementById('diff-live');
        const compareBtn  = document.getElementById('diff-compare-btn');
        const compareRow  = document.getElementById('diff-compare-row');
        const copyBtn     = document.getElementById('diff-copy-btn');

        const countStr = text => {
            const chars = text.length;
            const words = text.trim() ? text.trim().split(/\s+/).length : 0;
            const lines = text.split('\n').length;
            return `${chars} chars · ${words} words · ${lines} lines`;
        };

        input1.addEventListener('input', () => { count1.textContent = countStr(input1.value); if (liveToggle.checked) runDiff(); });
        input2.addEventListener('input', () => { count2.textContent = countStr(input2.value); if (liveToggle.checked) runDiff(); });

        liveToggle.addEventListener('change', () => {
            compareRow.classList.toggle('hidden', liveToggle.checked);
            if (liveToggle.checked) runDiff();
        });

        modeSelect.addEventListener('change', () => { if (liveToggle.checked || !resultCard.classList.contains('hidden')) runDiff(); });
        compareBtn.addEventListener('click', runDiff);

        function runDiff() {
            const t1 = input1.value;
            const t2 = input2.value;
            if (!t1 && !t2) { resultCard.classList.add('hidden'); statsBar.classList.add('hidden'); return; }

            if (typeof diff_match_patch === 'undefined') { App.toast('Diff library not loaded', 'error'); return; }
            const dmp = new diff_match_patch();

            const mode = modeSelect.value;
            let diffs;
            if (mode === 'word') {
                const lineObj = dmp.diff_linesToChars_(t1, t2);
                diffs = dmp.diff_main(lineObj.chars1, lineObj.chars2, false);
                dmp.diff_charsToLines_(diffs, lineObj.lineArray);
            } else if (mode === 'line') {
                const lineObj = dmp.diff_linesToChars_(t1, t2);
                diffs = dmp.diff_main(lineObj.chars1, lineObj.chars2, false);
                dmp.diff_charsToLines_(diffs, lineObj.lineArray);
                dmp.diff_cleanupEfficiency(diffs);
            } else {
                diffs = dmp.diff_main(t1, t2);
                dmp.diff_cleanupSemantic(diffs);
            }

            let addCount = 0, delCount = 0, eqCount = 0;
            let html = '';
            diffs.forEach(([op, text]) => {
                const escaped = text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'↵\n');
                if (op === 1)       { html += `<ins>${escaped}</ins>`; addCount += text.length; }
                else if (op === -1) { html += `<del>${escaped}</del>`; delCount += text.length; }
                else                { html += escaped; eqCount += text.length; }
            });

            output.innerHTML = html;
            resultCard.classList.remove('hidden');
            statsBar.style.display = 'flex';
            statsBar.classList.remove('hidden');
            statAdd.textContent = `+${addCount} added`;
            statDel.textContent = `−${delCount} removed`;
            statEq.textContent  = `${eqCount} unchanged`;
        }

        App.initCopyBtn(copyBtn, () => output.innerText);
    };
})(window.App);
