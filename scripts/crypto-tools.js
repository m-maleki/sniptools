(function(App) {
    if (!App) {
        console.error("App object is not initialized.");
        return;
    }
    App.initCrypto = function() {
        const view = document.getElementById('view-crypto');
        if (!view || view.innerHTML.trim() !== '') return;

        view.innerHTML = `
            <div class="flex flex-col gap-6">
                <!-- Input Section -->
                <div class="bg-gray-800/50 p-6 rounded-xl">
                    <div class="flex justify-between items-center mb-2" style="direction: ltr;">
                        <label for="crypto-input" class="text-xl font-semibold text-pink-400">Input Text</label>
                        <button id="crypto-clear-btn" class="text-sm text-gray-400 hover:text-white transition-colors">پاک کردن</button>
                    </div>
                    <textarea id="crypto-input" class="w-full p-4 bg-gray-900 border-2 border-gray-700 rounded-lg focus:border-pink-500 focus:ring-2 focus:ring-pink-500 transition-colors font-mono text-base min-h-[10rem]" style="direction: ltr; text-align: left;"></textarea>
                </div>

                <!-- Actions Section -->
                <div class="text-center flex flex-wrap justify-center gap-2">
                    <button id="crypto-md5-btn" class="bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-4 rounded-full transition-all text-sm">MD5 Hash</button>
                    <button id="crypto-sha1-btn" class="bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-4 rounded-full transition-all text-sm">SHA-1 Hash</button>
                    <button id="crypto-sha256-btn" class="bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-4 rounded-full transition-all text-sm">SHA-256 Hash</button>
                    <button id="crypto-sha512-btn" class="bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-4 rounded-full transition-all text-sm">SHA-512</button>
                    <button id="crypto-base64-encode-btn" class="bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-4 rounded-full transition-all text-sm">Base64 Encode</button>
                    <button id="crypto-base64-decode-btn" class="bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-4 rounded-full transition-all text-sm">Base64 Decode</button>
                </div>

                <!-- Output Section -->
                <div class="bg-gray-800/50 p-6 rounded-xl">
                    <div class="flex justify-between items-center mb-2" style="direction: ltr;">
                        <label class="text-xl font-semibold text-pink-400">Result</label>
                        <button id="crypto-copy-btn" class="text-sm text-gray-400 hover:text-white transition-colors">کپی کردن</button>
                    </div>
                    <textarea id="crypto-output" class="w-full p-4 bg-gray-900 border-2 border-gray-700 rounded-lg text-gray-300 font-mono text-base min-h-[10rem] cursor-not-allowed" readonly style="direction: ltr; text-align: left;"></textarea>
                </div>
            </div>
        `;
        
        const input = document.getElementById('crypto-input');
        const output = document.getElementById('crypto-output');
        const clearBtn = document.getElementById('crypto-clear-btn');
        const copyBtn = document.getElementById('crypto-copy-btn');

        document.getElementById('crypto-md5-btn').addEventListener('click', () => { output.value = CryptoJS.MD5(input.value).toString(); });
        document.getElementById('crypto-sha1-btn').addEventListener('click', () => { output.value = CryptoJS.SHA1(input.value).toString(); });
        document.getElementById('crypto-sha256-btn').addEventListener('click', () => { output.value = CryptoJS.SHA256(input.value).toString(); });
        document.getElementById('crypto-sha512-btn').addEventListener('click', () => { output.value = CryptoJS.SHA512(input.value).toString(); });
        document.getElementById('crypto-base64-encode-btn').addEventListener('click', () => { output.value = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(input.value)); });
        document.getElementById('crypto-base64-decode-btn').addEventListener('click', () => { try { output.value = CryptoJS.enc.Base64.parse(input.value).toString(CryptoJS.enc.Utf8); } catch(e) { output.value = 'Error: Invalid Base64'; } });
        
        if(clearBtn) clearBtn.addEventListener('click', () => { input.value = ''; output.value = ''; });
        if(copyBtn) copyBtn.addEventListener('click', function() {
            if (!output.value) return;
            navigator.clipboard.writeText(output.value).then(() => {
                this.textContent = 'کپی شد!';
                setTimeout(() => { this.textContent = 'کپی کردن'; }, 2000); 
            });
        });
    };
})(window.App);
