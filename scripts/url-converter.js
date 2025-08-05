(function(App) {
    if (!App) {
        console.error("App object is not initialized.");
        return;
    }
    App.initUrl = function() {
        const view = document.getElementById('view-url');
        if (!view || view.innerHTML.trim() !== '') return;

        view.innerHTML = `
            <div class="flex flex-col gap-6">
                <div class="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-5 w-full">
                    <div class="flex justify-between items-center mb-2">
                        <label for="url-input" class="block text-lg font-medium text-gray-300">Input Text or URL</label>
                        <button id="url-clear-btn" class="text-sm text-gray-400 hover:text-white transition-colors">Clear</button>
                    </div>
                    <textarea id="url-input" class="w-full p-4 bg-gray-900 border-2 border-gray-700 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500 transition-colors font-mono text-base min-h-[10rem]" placeholder="Enter text or URL..."></textarea>
                </div>
                <div class="text-center flex justify-center gap-4 w-full">
                    <button id="url-encode-btn" class="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-full transition-all text-lg">URL Encode</button>
                    <button id="url-decode-btn" class="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-full transition-all text-lg">URL Decode</button>
                </div>
                <div class="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-5 w-full">
                    <div class="flex justify-between items-center mb-2">
                        <label class="block text-lg font-medium text-gray-300">Result</label>
                        <button id="url-copy-btn" class="text-sm text-gray-400 hover:text-white transition-colors">Copy</button>
                    </div>
                    <textarea id="url-output" class="w-full p-4 bg-gray-900 border-2 border-gray-700 rounded-lg text-gray-300 font-mono text-base min-h-[10rem] cursor-not-allowed" readonly></textarea>
                </div>
            </div>
        `;
        
        const input = document.getElementById('url-input');
        const output = document.getElementById('url-output');
        const encodeBtn = document.getElementById('url-encode-btn');
        const decodeBtn = document.getElementById('url-decode-btn');
        const clearBtn = document.getElementById('url-clear-btn');
        const copyBtn = document.getElementById('url-copy-btn');

        if(encodeBtn) encodeBtn.addEventListener('click', () => {
            try {
                output.value = encodeURIComponent(input.value);
            } catch (e) {
                output.value = 'Error in URL Encode: ' + e.message;
            }
        });

        if(decodeBtn) decodeBtn.addEventListener('click', () => {
            try {
                output.value = decodeURIComponent(input.value);
            } catch (e) {
                output.value = 'Error in URL Decode: ' + e.message;
            }
        });

        if(clearBtn) clearBtn.addEventListener('click', () => {
            if(input) input.value = '';
            if(output) output.value = '';
        });

        if(copyBtn) copyBtn.addEventListener('click', function() {
            if (!output.value) return;
            navigator.clipboard.writeText(output.value).then(() => {
                this.innerHTML = 'Copied!';
                setTimeout(() => { this.innerHTML = 'Copy'; }, 2000); 
            }).catch(err => console.error('Failed to copy: ', err));
        });
    };
})(window.App);
