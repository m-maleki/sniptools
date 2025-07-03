(function(App) {
    if (!App) { console.error("App object not initialized."); return; }
    App.initDiff = function() {
        const view = document.getElementById('view-diff');
        if (!view || view.innerHTML.trim() !== '') return;
        view.innerHTML = `
            <div class="flex flex-col gap-6">
                <div class="flex justify-center items-center mb-4">
                    <div class="flex items-center bg-gray-700 rounded-full p-1">
                            <button id="diff-lang-fa" class="diff-lang-btn px-6 py-1.5 text-sm font-semibold rounded-full transition-colors duration-300">فارسی</button>
                            <button id="diff-lang-en" class="diff-lang-btn px-6 py-1.5 text-sm font-semibold rounded-full transition-colors duration-300">English</button>
                    </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label class="block text-lg font-medium text-gray-300 mb-2">متن اصلی</label>
                        <textarea id="diff-input1" class="w-full p-4 bg-gray-900 border-2 border-gray-700 rounded-lg focus:border-purple-500 focus:ring-purple-500 transition-colors text-base min-h-[40rem]"></textarea> <div class="text-xs text-gray-400 mt-2 flex justify-start gap-4 px-2">
                            <span id="diff-counter1-chars">حروف: 0</span>
                            <span id="diff-counter1-words">کلمات: 0</span>
                        </div>
                    </div>
                    <div>
                        <label class="block text-lg font-medium text-gray-300 mb-2">متن تغییر یافته</label>
                        <textarea id="diff-input2" class="w-full p-4 bg-gray-900 border-2 border-gray-700 rounded-lg focus:border-purple-500 focus:ring-purple-500 transition-colors text-base min-h-[40rem]"></textarea> <div class="text-xs text-gray-400 mt-2 flex justify-start gap-4 px-2">
                            <span id="diff-counter2-chars">حروف: 0</span>
                            <span id="diff-counter2-words">کلمات: 0</span>
                        </div>
                    </div>
                </div>
                <div class="text-center">
                    <button id="diff-compare-btn" class="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-full transition-all text-lg">مقایسه کن</button>
                </div>
                <div id="diff-output-container" class="hidden bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-5">
                    <h2 class="text-2xl font-semibold mb-4 text-purple-400">نتیجه مقایسه</h2>
                    <div id="diff-output" class="p-4 bg-gray-900 rounded-lg whitespace-pre-wrap break-words"></div>
                    <div class="text-xs text-gray-400 mt-2 flex justify-start gap-4 px-2">
                        <span id="diff-counter-output-chars">حروف: 0</span>
                        <span id="diff-counter-output-words">کلمات: 0</span>
                    </div>
                </div>
            </div>`;
        
        const input1 = document.getElementById('diff-input1');
        const input2 = document.getElementById('diff-input2');
        const compareBtn = document.getElementById('diff-compare-btn');
        const outputContainer = document.getElementById('diff-output-container');
        const output = document.getElementById('diff-output');
        const langFaBtn = document.getElementById('diff-lang-fa');
        const langEnBtn = document.getElementById('diff-lang-en');
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
            charCounter.textContent = `حروف: ${charCount}`;
            wordCounter.textContent = `کلمات: ${wordCount}`; 
        };

        if(input1) input1.addEventListener('input', () => updateCounters(input1, counters.c1.chars, counters.c1.words));
        if(input2) input2.addEventListener('input', () => updateCounters(input2, counters.c2.chars, counters.c2.words));

        const setDirection = (lang) => {
            const textareas = [input1, input2];
            if (lang === 'fa') {
                langFaBtn.classList.add('bg-purple-600', 'text-white');
                langFaBtn.classList.remove('text-gray-400');
                langEnBtn.classList.remove('bg-purple-600', 'text-white');
                langEnBtn.classList.add('text-gray-400');
                textareas.forEach(t => { if(t) {t.classList.remove('direction-ltr', 'font-mono'); t.classList.add('direction-rtl'); t.placeholder = 'متن خود را اینجا وارد کنید...';} });
                if(output) {
                    output.classList.remove('direction-ltr', 'font-mono');
                    output.classList.add('direction-rtl');
                }
            } else {
                langEnBtn.classList.add('bg-purple-600', 'text-white');
                langEnBtn.classList.remove('text-gray-400');
                langFaBtn.classList.remove('bg-purple-600', 'text-white');
                langFaBtn.classList.add('text-gray-400');
                textareas.forEach(t => { if(t) {t.classList.remove('direction-rtl'); t.classList.add('direction-ltr', 'font-mono'); t.placeholder = 'Enter your text here...';} });
                if(output) {
                    output.classList.remove('direction-rtl');
                    output.classList.add('direction-ltr', 'font-mono');
                }
            }
        };
        
        if(langFaBtn) langFaBtn.addEventListener('click', () => setDirection('fa'));
        if(langEnBtn) langEnBtn.addEventListener('click', () => setDirection('en'));

        if(compareBtn) compareBtn.addEventListener('click', () => {
            const dmp = new diff_match_patch();
            const diffs = dmp.diff_main(input1.value, input2.value);
            dmp.diff_cleanupSemantic(diffs);
            output.innerHTML = dmp.diff_prettyHtml(diffs);
            outputContainer.classList.remove('hidden');
            updateCounters(output, counters.out.chars, counters.out.words);
        });
        
        setDirection('fa');
        updateCounters(input1, counters.c1.chars, counters.c1.words);
        updateCounters(input2, counters.c2.chars, counters.c2.words);
    };
})(window.App);
