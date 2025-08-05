(function(App) {
    if (!App) {
        console.error("App object is not initialized.");
        return;
    }

    let monacoEditorInstance = null;

    App.initJson = function() {
        const view = document.getElementById('view-json');
        if (!view || view.innerHTML.trim() !== '') return;

        view.innerHTML = `
            <div class="flex flex-col gap-4">
                <div class="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-5 h-[60vh] flex flex-col">
                    <div class="flex justify-between items-center mb-2">
                        <label class="block text-lg font-medium text-gray-300">JSON Editor</label>
                        <div class="flex gap-4 items-center">
                            <button id="json-copy-btn" class="text-sm text-gray-400 hover:text-white transition-colors py-2 px-4 rounded-lg flex items-center gap-2">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                                Copy
                            </button>
                            <button id="json-clear-btn-editor" class="text-sm text-gray-400 hover:text-white transition-colors">Clear</button>
                            <button id="json-format-btn" class="text-sm text-emerald-400 hover:text-emerald-300 transition-colors font-semibold">Format</button>
                        </div>
                    </div>
                    <div id="monaco-container" class="w-full flex-grow rounded-lg overflow-hidden border border-gray-700"></div>
                </div>
            </div>
        `;

        const container = document.getElementById('monaco-container');
        const clearButton = document.getElementById('json-clear-btn-editor');
        const copyButton = document.getElementById('json-copy-btn');
        const formatButton = document.getElementById('json-format-btn');

        const defaultJson = {
          "project": "Developer Tools",
          "version": 1.2,
          "isReleased": true,
          "owner": { "name": "Community", "contact": null },
          "tools": [
            { "id": "jwt-decoder", "name": "JWT Decoder", "enabled": true },
            { "id": "json-editor", "name": "JSON Editor", "enabled": true },
            { "id": "crypto-tools", "name": "Cryptography Tools", "enabled": true }
          ],
          "description": "A sample JSON to demonstrate the editor's capabilities."
        };

        // Check for data passed from another tool (like JWT decoder)
        const initialJsonText = App.sharedData.jsonToLoad || JSON.stringify(defaultJson, null, 4);
        if (App.sharedData.jsonToLoad) {
            delete App.sharedData.jsonToLoad; // Clear it after use to prevent reloading
        }

        // Monaco Loader
        require.config({ paths: { 'vs': 'https://cdn.jsdelivr.net/npm/monaco-editor@0.34.1/min/vs' }});
        require(['vs/editor/editor.main'], function () {
            
            // Define a custom theme that matches your app's style
            monaco.editor.defineTheme('sniptools-dark', {
                base: 'vs-dark',
                inherit: true,
                rules: [
                    { token: 'string.key.json', foreground: '#63b3ed' }, // Blue for keys
                    { token: 'string.value.json', foreground: '#ce9178' }, // Orange for string values
                    { token: 'number.json', foreground: '#b5cea8' }, // Green for numbers
                    { token: 'keyword.json', foreground: '#569cd6' } // Blue for true/false/null
                ],
                colors: {
                    'editor.background': '#1f2937', // Your --bg-secondary
                    'editor.foreground': '#e2e8f0', // Your --text-primary
                    'editorLineNumber.foreground': '#6b7280', // Your --text-placeholder
                    'editorCursor.foreground': '#63b3ed',
                    'editor.selectionBackground': '#374151', // Your --bg-tertiary
                    'editorWidget.background': '#111827', // Your --bg-primary
                    'editorWidget.border': '#4b5563', // Your --border-color
                }
            });

            monacoEditorInstance = monaco.editor.create(container, {
                value: initialJsonText,
                language: 'json',
                theme: 'sniptools-dark', // Use the custom theme
                automaticLayout: true,
                minimap: { enabled: false },
                scrollbar: {
                    verticalScrollbarSize: 10,
                    horizontalScrollbarSize: 10
                }
            });

            // Re-wire buttons to the new editor instance
            if(clearButton) clearButton.addEventListener('click', () => monacoEditorInstance.setValue('{}'));
            
            if(formatButton) formatButton.addEventListener('click', () => {
                monacoEditorInstance.getAction('editor.action.formatDocument').run();
            });

            if(copyButton) copyButton.addEventListener('click', async () => {
                try {
                    await navigator.clipboard.writeText(monacoEditorInstance.getValue());
                    const originalText = copyButton.innerHTML;
                    copyButton.innerHTML = 'Copied!';
                    setTimeout(() => { copyButton.innerHTML = originalText; }, 2000);
                } catch (err) { console.error('Failed to copy JSON: ', err); }
            });
        });
    };
})(window.App);
