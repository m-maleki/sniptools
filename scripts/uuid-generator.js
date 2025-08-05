(function(App) {
    if (!App) {
        console.error("App object is not initialized.");
        return;
    }
    App.initUuid = function() {
        const view = document.getElementById('view-uuid');
        if (!view || view.innerHTML.trim() !== '') return;

        view.innerHTML = `
            <div class="grid md:grid-cols-2 gap-8">
                <!-- Left Column: Controls -->
                <div class="space-y-6">
                     <div class="bg-gray-800/50 p-6 rounded-xl">
                         <h3 class="text-xl font-semibold mb-4 text-purple-400">Settings & Actions</h3>
                         <div class="flex items-center justify-between flex-wrap gap-4">
                             <!-- Settings -->
                             <div class="flex items-center gap-2">
                                 <label for="num-uuids" class="text-gray-300 whitespace-nowrap">Amount:</label>
                                 <input type="number" id="num-uuids" value="10" min="1" max="100" class="w-24 modern-input text-center direction-ltr p-2">
                             </div>
                             <!-- Other Actions -->
                             <div class="flex items-center gap-2">
                                 <button id="copy-uuid-btn" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-all">Copy All</button>
                                 <button id="clear-uuid-btn" class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-all">Clear</button>
                             </div>
                         </div>
                         <button id="generate-uuid-btn" class="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-all text-lg">Generate</button>
                       </div>
                </div>
                <!-- Right Column: Output -->
                <div class="bg-gray-800/50 p-6 rounded-xl flex flex-col">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-xl font-semibold text-purple-400">Generated UUIDs</h3>
                        <span id="uuid-count" class="text-sm text-gray-400">Count: 0</span>
                    </div>
                    <div id="uuid-output-list-container" class="flex-grow">
                        <ol id="uuid-output-list" class="space-y-2">
                            <li class="placeholder">UUIDs will appear here...</li>
                        </ol>
                    </div>
                </div>
            </div>
        `;
        
        // Get references to the newly created elements
        const generateUuidBtn = document.getElementById('generate-uuid-btn');
        const uuidOutputList = document.getElementById('uuid-output-list');
        const copyUuidBtn = document.getElementById('copy-uuid-btn');
        const clearUuidBtn = document.getElementById('clear-uuid-btn');
        const numUuidsInput = document.getElementById('num-uuids');
        const uuidCountSpan = document.getElementById('uuid-count');

        // Function to generate a single UUID v4
        const generateUUID = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
            const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });

        const updateCount = () => {
            const count = uuidOutputList.querySelectorAll('li:not(.placeholder)').length;
            if (uuidCountSpan) uuidCountSpan.textContent = `Count: ${count}`;
        };

        const generateAndDisplayUuids = () => {
            if(!uuidOutputList || !numUuidsInput) return;
            uuidOutputList.innerHTML = '';
            const num = parseInt(numUuidsInput.value);

            if (isNaN(num) || num < 1 || num > 100) {
                uuidOutputList.innerHTML = '<li class="placeholder text-red-400">Invalid amount (1-100).</li>';
                updateCount();
                return;
            }

            for(let i = 0; i < num; i++) {
                const newUuid = generateUUID();
                const li = document.createElement('li');
                li.innerHTML = `
                    <span class="uuid-text-content">${newUuid}</span>
                    <button class="copy-single-uuid-btn" title="Copy this UUID">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                    </button>
                `;
                li.querySelector('.copy-single-uuid-btn').addEventListener('click', e => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(newUuid).then(() => {
                        const btn = e.currentTarget;
                        btn.innerHTML = `<svg class="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>`;
                        setTimeout(() => {
                            btn.innerHTML = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>`;
                        }, 1500);
                    });
                });
                uuidOutputList.appendChild(li);
            }
            updateCount();
        };

        if(generateUuidBtn) generateUuidBtn.addEventListener('click', generateAndDisplayUuids);
        if(copyUuidBtn) copyUuidBtn.addEventListener('click', function() {
            const uuidElements = uuidOutputList.querySelectorAll('li > span.uuid-text-content');
            if (!uuidElements.length) return;
            const allUuids = Array.from(uuidElements).map(el => el.textContent).join('\n');
            navigator.clipboard.writeText(allUuids).then(() => {
                this.textContent = 'Copied!';
                setTimeout(() => { this.textContent = 'Copy All'; }, 2000);
            });
        });
        if(clearUuidBtn) clearUuidBtn.addEventListener('click', () => {
            if(uuidOutputList) uuidOutputList.innerHTML = '<li class="placeholder">UUIDs will appear here...</li>';
            updateCount();
        });

        generateAndDisplayUuids();
    };
})(window.App);
