(function(App) {
    if (!App) {
        console.error("App object is not initialized.");
        return;
    }

    let jsonEditorInstance = null;

    App.initJson = function() {
        const view = document.getElementById('view-json');
        if (!view || view.innerHTML.trim() !== '') return;

        view.innerHTML = `
            <div class="flex flex-col gap-4">
                <div class="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-5 h-[60vh] flex flex-col">
                    <div class="flex justify-between items-center mb-2">
                        <label class="block text-lg font-medium text-gray-300">ویرایشگر JSON</label>
                        <div class="flex gap-2">
                            <button id="json-copy-btn" class="text-sm text-gray-400 hover:text-white transition-colors py-2 px-4 rounded-lg flex items-center gap-2">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                                کپی
                            </button>
                            <button id="json-format-btn" class="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-5 rounded-lg transition-all">مرتب‌سازی</button>
                            <button id="json-clear-btn-editor" class="text-sm text-gray-400 hover:text-white transition-colors">پاک کردن</button>
                        </div>
                    </div>
                    <div id="jsoneditor" class="w-full flex-grow rounded-lg"></div>
                </div>
            </div>
        `;

        const container = document.getElementById('jsoneditor');
        const clearButton = document.getElementById('json-clear-btn-editor');
        const copyButton = document.getElementById('json-copy-btn');
        const formatButton = document.getElementById('json-format-btn');

        const options = {
            mode: 'code',
            modes: ['code', 'tree', 'form', 'text', 'view'],
            ace: window.ace, 
        };

        jsonEditorInstance = new JSONEditor(container, options);

        const defaultJson = {
          "project": "Developer Tools",
          "version": 1.2,
          "isReleased": true,
          "owner": {
            "name": "Community",
            "contact": null
          },
          "tools": [
            {
              "id": "jwt-decoder",
              "name": "JWT Decoder",
              "enabled": true
            },
            {
              "id": "json-editor",
              "name": "JSON Editor",
              "enabled": true
            },
            {
              "id": "crypto-tools",
              "name": "Cryptography Tools",
              "enabled": true
            }
          ],
          "description": "A sample JSON to demonstrate the editor's capabilities."
        };
        jsonEditorInstance.set(defaultJson);
        
        if(clearButton) clearButton.addEventListener('click', () => jsonEditorInstance.set({}));
        if(copyButton) copyButton.addEventListener('click', async () => {
            try {
                const json = jsonEditorInstance.get();
                await navigator.clipboard.writeText(JSON.stringify(json, null, 2));
                copyButton.textContent = 'کپی شد!';
                setTimeout(() => { copyButton.innerHTML = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg> کپی`; }, 2000);
            } catch (err) { console.error('Failed to copy JSON: ', err); }
        });
        if(formatButton) formatButton.addEventListener('click', () => jsonEditorInstance.format());
    };
})(window.App);
