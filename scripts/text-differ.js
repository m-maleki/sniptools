(function(App) {
    if (!App) { console.error("App object is not initialized."); return; }
    App.initDiff = function() {
        const view = document.getElementById('view-diff');
        if (!view || view.innerHTML.trim() !== '') return;

        // Inject custom styles for better diff visibility on dark theme
        const style = document.createElement('style');
        style.innerHTML = `
            /* استایل برای متن اضافه شده (سبز) */
            #diff-output ins {
                background-color: #b7e1cd; /* پس زمینه سبز روشن و خوانا */
                color: #000000;           /* متن مشکی */
                text-decoration: none;
                padding: 2px 3px;
                border-radius: 4px;
            }
            /* استایل برای متن حذف شده (قرمز) */
            #diff-output del {
                background-color: #f6caca; /* پس زمینه قرمز روشن و خوانا */
                color: #000000;           /* متن مشکی */
                text-decoration: none;
                padding: 2px 3px;
                border-radius: 4px;
            }
        `;
        document.head.appendChild(style);

        view.innerHTML = `
            <div class="flex flex-col gap-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label class="block text-lg font-medium text-gray-300 mb-2">Original Text</label>
                        <textarea id="diff-input1" class="w-full p-4 bg-gray-900 border-2 border-gray-700 rounded-lg focus:border-purple-500 focus:ring-purple-500 transition-colors text-base min-h-[40rem] font-mono direction-ltr" placeholder="Enter original text here..."></textarea>
                        <div class="text-xs text-gray-400 mt-2 flex justify-start gap-4 px-2">
                            <span id="diff-counter1-chars">Chars: 0</span>
                            <span id="diff-counter1-words">Words: 0</span>
                        </div>
                    </div>
                    <div>
                        <label class="block text-lg font-medium text-gray-300 mb-2">Changed Text</label>
                        <textarea id="diff-input2" class="w-full p-4 bg-gray-900 border-2 border-gray-700 rounded-lg focus:border-purple-500 focus:ring-purple-500 transition-colors text-base min-h-[40rem] font-mono direction-ltr" placeholder="Enter changed text here..."></textarea>
                        <div class="text-xs text-gray-400 mt-2 flex justify-start gap-4 px-2">
                            <span id="diff-counter2-chars">Chars: 0</span>
                            <span id="diff-counter2-words">Words: 0</span>
                        </div>
                    </div>
                </div>
                <div class="text-center">
                    <button id="diff-compare-btn" class="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-full transition-all text-lg">Compare</button>
                </div>
                <div id="diff-output-container" class="hidden bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-5">
                    <h2 class="text-2xl font-semibold mb-4 text-purple-400">Comparison Result</h2>
                    <div id="diff-output" class="p-4 bg-gray-900 rounded-lg whitespace-pre-wrap break-words font-mono direction-ltr"></div>
                    <div class="text-xs text-gray-400 mt-2 flex justify-start gap-4 px-2">
                        <span id="diff-counter-output-chars">Chars: 0</span>
                        <span id="diff-counter-output-words">Words: 0</span>
                    </div>
                </div>
            </div>`;
        
        const input1 = document.getElementById('diff-input1');
        const input2 = document.getElementById('diff-input2');
        const compareBtn = document.getElementById('diff-compare-btn');
        const outputContainer = document.getElementById('diff-output-container');
        const output = document.getElementById('diff-output');
        const counters = {
            c1: { chars: document.getElementById('diff-counter1-chars'), words: document.getElementById('diff-counter1-words') },
            c2: { chars: document.getElementById('diff-counter2-chars'), words: document.getElementById('diff-counter2-words') },
            out: { chars: document.getElementById('diff-counter-output-chars'), words: document.getElementById('diff-counter-output-words') }
        };

        const updateCounters = (el, charCounter, wordCounter) => {
            if(!el || !charCounter || !wordCounter) return;
            const text = (el.tagName === 'TEXTAREA') ? el.value : el.innerText;
            const charCount = text.length;
            const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).filter(Boolean).length; 
            charCounter.textContent = `Chars: ${charCount}`;
            wordCounter.textContent = `Words: ${wordCount}`; 
        };

        if(input1) input1.addEventListener('input', () => updateCounters(input1, counters.c1.chars, counters.c1.words));
        if(input2) input2.addEventListener('input', () => updateCounters(input2, counters.c2.chars, counters.c2.words));

        if(compareBtn) compareBtn.addEventListener('click', () => {
            const dmp = new diff_match_patch();
            const diffs = dmp.diff_main(input1.value, input2.value);
            dmp.diff_cleanupSemantic(diffs);
            output.innerHTML = dmp.diff_prettyHtml(diffs);
            outputContainer.classList.remove('hidden');
            updateCounters(output, counters.out.chars, counters.out.words);
        });
        
        updateCounters(input1, counters.c1.chars, counters.c1.words);
        updateCounters(input2, counters.c2.chars, counters.c2.words);
    };
})(window.App);
