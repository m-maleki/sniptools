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
                    <div class="flex justify-between items-center mb-2">
                        <label for="crypto-input" class="text-xl font-semibold text-purple-400">Input Text</label>
                        <button id="crypto-clear-btn" class="text-sm text-gray-400 hover:text-white transition-colors">Clear</button>
                    </div>
                    <textarea id="crypto-input" class="w-full p-4 bg-gray-900 border-2 border-gray-700 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500 transition-colors font-mono text-base min-h-[10rem]" placeholder="Enter your text here..."></textarea>
                </div>

                <!-- Actions Section -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <!-- Hashing Card -->
                    <div class="bg-gray-800/50 p-6 rounded-xl">
                        <h3 class="text-lg font-semibold mb-4 text-purple-300 border-b border-gray-700 pb-2">Hashing Algorithms</h3>
                        <div class="grid grid-cols-2 gap-3">
                            <button id="crypto-md5-btn" class="crypto-action-btn">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                <span>MD5</span>
                            </button>
                            <button id="crypto-sha1-btn" class="crypto-action-btn">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                <span>SHA-1</span>
                            </button>
                            <button id="crypto-sha256-btn" class="crypto-action-btn">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                <span>SHA-256</span>
                            </button>
                            <button id="crypto-sha512-btn" class="crypto-action-btn">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                <span>SHA-512</span>
                            </button>
                        </div>
                    </div>
                    <!-- Encoding Card -->
                    <div class="bg-gray-800/50 p-6 rounded-xl">
                        <h3 class="text-lg font-semibold mb-4 text-purple-300 border-b border-gray-700 pb-2">Encoding / Decoding</h3>
                        <div class="grid grid-cols-2 gap-3">
                            <button id="crypto-base64-encode-btn" class="crypto-action-btn">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                <span>Base64 Encode</span>
                            </button>
                            <button id="crypto-base64-decode-btn" class="crypto-action-btn">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" /></svg>
                                <span>Base64 Decode</span>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Output Section -->
                <div class="bg-gray-800/50 p-6 rounded-xl">
                    <div class="flex justify-between items-center mb-2">
                        <label class="text-xl font-semibold text-purple-400">Result</label>
                        <button id="crypto-copy-btn" class="text-sm text-gray-400 hover:text-white transition-colors">Copy</button>
                    </div>
                    <textarea id="crypto-output" class="w-full p-4 bg-gray-900 border-2 border-gray-700 rounded-lg text-gray-300 font-mono text-base min-h-[10rem] cursor-not-allowed" readonly></textarea>
                </div>
            </div>
        `;
        
        // Add styles for the new buttons
        const style = document.createElement('style');
        style.innerHTML = `
            .crypto-action-btn {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 0.5rem;
                background-color: #374151; /* gray-700 */
                color: #d1d5db; /* gray-300 */
                font-weight: 500;
                padding: 0.75rem;
                border-radius: 0.5rem;
                border: 1px solid #4b5563; /* gray-600 */
                transition: all 0.2s ease-in-out;
            }
            .crypto-action-btn:hover {
                background-color: #4b5563; /* gray-600 */
                color: #fff;
                border-color: #8b5cf6; /* purple-500 */
                transform: translateY(-2px);
            }
        `;
        document.head.appendChild(style);

        const input = document.getElementById('crypto-input');
        const output = document.getElementById('crypto-output');
        const clearBtn = document.getElementById('crypto-clear-btn');
        const copyBtn = document.getElementById('crypto-copy-btn');

        document.getElementById('crypto-md5-btn').addEventListener('click', () => { output.value = CryptoJS.MD5(input.value).toString(); });
        document.getElementById('crypto-sha1-btn').addEventListener('click', () => { output.value = CryptoJS.SHA1(input.value).toString(); });
        document.getElementById('crypto-sha256-btn').addEventListener('click', () => { output.value = CryptoJS.SHA256(input.value).toString(); });
        document.getElementById('crypto-sha512-btn').addEventListener('click', () => { output.value = CryptoJS.SHA512(input.value).toString(); });
        document.getElementById('crypto-base64-encode-btn').addEventListener('click', () => { output.value = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(input.value)); });
        document.getElementById('crypto-base64-decode-btn').addEventListener('click', () => { 
            try { 
                output.value = CryptoJS.enc.Base64.parse(input.value).toString(CryptoJS.enc.Utf8); 
            } catch(e) { 
                output.value = 'Error: Invalid Base64 string'; 
            } 
        });
        
        if(clearBtn) clearBtn.addEventListener('click', () => { 
            input.value = ''; 
            output.value = ''; 
        });

        if(copyBtn) copyBtn.addEventListener('click', function() {
            if (!output.value) return;
            navigator.clipboard.writeText(output.value).then(() => {
                this.textContent = 'Copied!';
                setTimeout(() => { this.textContent = 'Copy'; }, 2000); 
            });
        });
    };
})(window.App);
