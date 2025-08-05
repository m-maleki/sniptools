// scripts/jwt-decoder.js
(function(App) {
    if (!App) {
        console.error("App object is not initialized.");
        return;
    }
    // Initialize a shared space for passing data between tools
    App.sharedData = App.sharedData || {};

    App.initJwt = function() {
        const view = document.getElementById('view-jwt');
        if (!view || view.innerHTML.trim() !== '') return; // Already initialized

        view.innerHTML = `
            <div class="flex flex-col gap-6">
                <div class="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-5">
                    <div class="flex justify-between items-center mb-2">
                        <label for="jwt-input" class="block text-lg font-medium text-gray-300">Encoded Token</label>
                        <button id="jwt-clear-btn" class="text-sm text-gray-400 hover:text-white transition-colors">Clear</button>
                    </div>
                    <div id="jwt-input" contenteditable="true" role="textbox" class="w-full p-4 bg-gray-900 border-2 border-gray-700 rounded-lg direction-ltr focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-colors font-mono text-base min-h-[10rem] text-gray-300" data-placeholder="Paste your token here..."></div>
                </div>
                <div id="jwt-error-message" class="hidden bg-red-900/80 border border-red-600 text-red-200 px-4 py-3 rounded-lg" role="alert">
                    <strong class="font-bold">Error!</strong>
                    <span id="jwt-error-text" class="block sm:inline"></span>
                </div>
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div class="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl overflow-hidden border-t-4 border-blue-500">
                        <div class="flex justify-between items-center p-4 bg-gray-800"><h2 class="text-xl font-semibold text-blue-400">Header</h2><button class="copy-btn" data-target="jwt-header" title="Copy Header"><svg class="w-6 h-6 text-gray-400 hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg></button></div>
                        <pre id="jwt-header" class="p-4 direction-ltr text-blue-300 font-mono text-sm whitespace-pre-wrap break-all min-h-[18rem]" data-placeholder="Decoded header content will be displayed here."></pre>
                    </div>
                    <div class="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl overflow-hidden border-t-4 border-purple-500">
                        <div class="flex justify-between items-center p-4 bg-gray-800">
                            <h2 class="text-xl font-semibold text-purple-400">Payload</h2>
                            <div class="flex items-center gap-2">
                                <button class="copy-btn" data-target="jwt-payload" title="Copy Payload"><svg class="w-6 h-6 text-gray-400 hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg></button>
                            </div>
                        </div>
                        <pre id="jwt-payload" class="p-4 direction-ltr text-purple-300 font-mono text-sm whitespace-pre-wrap break-all min-h-[18rem]" data-placeholder="Decoded payload content will be displayed here."></pre>
                    </div>
                    <div class="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl overflow-hidden border-t-4 border-teal-500">
                        <div class="flex justify-between items-center p-4 bg-gray-800"><h2 class="text-xl font-semibold text-teal-400">Signature</h2><button class="copy-btn" data-target="jwt-signature" title="Copy Signature"><svg class="w-6 h-6 text-gray-400 hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg></button></div>
                        <pre id="jwt-signature" class="p-4 direction-ltr text-teal-300 font-mono text-sm whitespace-pre-wrap break-all min-h-[18rem]" data-placeholder="The signature part of the token will be displayed here."></pre>
                    </div>
                </div>
            </div>`;
        
        const jwtInputEl = document.getElementById('jwt-input');
        const headerOutput = document.getElementById('jwt-header');
        const payloadOutput = document.getElementById('jwt-payload');
        const signatureOutput = document.getElementById('jwt-signature');
        const errorMessageDiv = document.getElementById('jwt-error-message');
        const errorTextSpan = document.getElementById('jwt-error-text');
        const clearButton = document.getElementById('jwt-clear-btn');
        const copyButtons = view.querySelectorAll('.copy-btn');
        const editPayloadBtn = document.getElementById('jwt-edit-payload-btn');

        if(editPayloadBtn) {
            editPayloadBtn.addEventListener('click', () => {
                const payloadText = payloadOutput.textContent;
                if (!payloadText || payloadText.startsWith('...')) return;
                
                try {
                    // Check if it's valid JSON before switching
                    JSON.parse(payloadText); 
                    
                    // Store the payload and switch tabs
                    App.sharedData.jsonToLoad = payloadText;
                    document.getElementById('nav-json').click();

                } catch (e) {
                    showError("Payload is not valid JSON and cannot be opened in the editor.");
                }
            });
        }

        const base64UrlDecode = (str) => {
            let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
            const pad = base64.length % 4;
            if (pad) {
                if (pad === 2) base64 += '==';
                else if (pad === 3) base64 += '=';
            }
            try {
                return decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
            } catch (e) { return null; }
        };

        const showError = (message) => { if(errorMessageDiv) { errorTextSpan.textContent = message; errorMessageDiv.classList.remove('hidden'); }};
        const hideError = () => { if(errorMessageDiv) errorMessageDiv.classList.add('hidden'); };
        const clearOutputs = () => { 
            if(headerOutput) headerOutput.textContent = ''; 
            if(payloadOutput) payloadOutput.textContent = ''; 
            if(signatureOutput) signatureOutput.textContent = ''; 
            hideError(); 
        };

        const decodeJwt = () => {
            if(!jwtInputEl) return;
            const token = jwtInputEl.innerText.trim();
            clearOutputs();
            if (!token) { jwtInputEl.innerHTML = ''; return; }

            const parts = token.split('.');
            const [headerB64, payloadB64, signatureB64] = parts;
            let hasError = false;

            if (headerB64) { 
                const decoded = base64UrlDecode(headerB64);
                try { headerOutput.textContent = JSON.stringify(JSON.parse(decoded), null, 2); } catch (err) { headerOutput.textContent = '...Invalid content...'; hasError = true; } 
            }
            if (payloadB64) { 
                const decoded = base64UrlDecode(payloadB64);
                try { payloadOutput.textContent = JSON.stringify(JSON.parse(decoded), null, 2); } catch (err) { payloadOutput.textContent = '...Invalid content...'; hasError = true; } 
            }
            if (signatureB64) { signatureOutput.textContent = signatureB64; }

            const dot = `<span class="text-gray-500">.</span>`;
            let ht = `<span class="text-blue-400">${headerB64 || ''}</span>`;
            if (parts.length > 1) { ht += dot + `<span class="text-purple-400">${payloadB64 || ''}</span>`; }
            if (parts.length > 2) { ht += dot + `<span class="text-teal-400">${signatureB64 || ''}</span>`; }
            jwtInputEl.innerHTML = ht;

            if (parts.length !== 3 || hasError) { showError('Invalid token or incorrect format.'); }
        };

        if(jwtInputEl) jwtInputEl.addEventListener('input', decodeJwt);
        if(clearButton) clearButton.addEventListener('click', () => { jwtInputEl.innerHTML = ''; clearOutputs(); });
        
        copyButtons.forEach(button => { 
            button.addEventListener('click', function() { 
                const targetEl = document.getElementById(this.dataset.target); 
                if (!targetEl || !targetEl.textContent) return; 
                navigator.clipboard.writeText(targetEl.textContent).then(() => {
                    const originalTitle = this.title; 
                    this.title = 'Copied!'; 
                    setTimeout(() => { this.title = originalTitle; }, 2000); 
                }).catch(err => console.error('Failed to copy: ', err));
            }); 
        });
    };
})(window.App);
