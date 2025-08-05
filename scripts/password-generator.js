(function(App) {
    if (!App) { console.error("App object is not initialized."); return; }
    App.initPassword = function() {
        const view = document.getElementById('view-password');
        if (!view || view.innerHTML.trim() !== '') return;

        // Add custom styles for the range slider and new strength meter
        const style = document.createElement('style');
        style.innerHTML = `
            input[type="range"].custom-slider {
                -webkit-appearance: none;
                appearance: none;
                width: 100%;
                height: 8px;
                background: #374151; /* gray-700 */
                border-radius: 5px;
                outline: none;
                opacity: 0.7;
                transition: opacity .2s;
            }
            input[type="range"].custom-slider:hover {
                opacity: 1;
            }
            input[type="range"].custom-slider::-webkit-slider-thumb {
                -webkit-appearance: none;
                appearance: none;
                width: 24px;
                height: 24px;
                background: #8b5cf6; /* purple-500 */
                cursor: pointer;
                border-radius: 50%;
                border: 3px solid #1f2937; /* gray-800 */
            }
            input[type="range"].custom-slider::-moz-range-thumb {
                width: 24px;
                height: 24px;
                background: #8b5cf6; /* purple-500 */
                cursor: pointer;
                border-radius: 50%;
                border: 3px solid #1f2937; /* gray-800 */
            }
            .strength-meter {
                display: flex;
                gap: 0.5rem;
                height: 8px;
            }
            .strength-meter-block {
                flex-grow: 1;
                background-color: #374151; /* gray-700 */
                border-radius: 3px;
                transition: background-color 0.3s ease;
            }
        `;
        document.head.appendChild(style);

        view.innerHTML = `
            <div class="flex flex-col gap-8">
                <!-- Output Section -->
                <div class="bg-gray-800/50 p-6 rounded-xl">
                    <div class="flex justify-between items-center mb-2">
                         <h3 class="text-xl font-semibold text-purple-400">Generated Password</h3>
                         <button id="copy-password-btn" class="text-sm text-gray-400 hover:text-white transition-colors">Copy</button>
                    </div>
                    <input type="text" id="password-output" class="w-full modern-input password-input-display" readonly placeholder="Your Password">
                    <div class="mt-4 flex items-center justify-between gap-4">
                        <div id="strength-meter" class="strength-meter w-full">
                            <div class="strength-meter-block"></div>
                            <div class="strength-meter-block"></div>
                            <div class="strength-meter-block"></div>
                            <div class="strength-meter-block"></div>
                        </div>
                        <span id="strength-text" class="text-sm font-medium text-gray-400 whitespace-nowrap"></span>
                    </div>
                </div>

                <!-- Settings Section -->
                <div class="bg-gray-800/50 p-6 rounded-xl">
                <div class="password-settings-card">
                    <h3 class="text-xl font-semibold mb-6 text-purple-400">Settings</h3>
                    <div class="grid md:grid-cols-2 gap-x-12 gap-y-6">
                        <!-- Right Column: Password Length -->
                        <div class="space-y-4">
                            <label for="password-length" class="block text-gray-300">Password Length</label>
                            <div class="flex items-center gap-4">
                                <input type="range" id="password-length" min="8" max="128" value="12" class="w-full custom-slider">
                                <span id="length-value" class="font-bold text-purple-400 text-2xl w-16 text-center modern-input p-2">12</span>
                            </div>
                        </div>
                        <!-- Left Column: Character Options -->
                        <div class="space-y-4">
                            <label class="option-toggle-label">
                                <span>Uppercase (A-Z)</span>
                                <div class="relative">
                                    <input type="checkbox" id="include-uppercase" class="option-checkbox" checked>
                                    <div class="option-toggle-switch"></div>
                                </div>
                            </label>
                            <label class="option-toggle-label">
                                <span>Lowercase (a-z)</span>
                                <div class="relative">
                                    <input type="checkbox" id="include-lowercase" class="option-checkbox" checked>
                                    <div class="option-toggle-switch"></div>
                                </div>
                            </label>
                            <label class="option-toggle-label">
                                <span>Numbers (0-9)</span>
                                <div class="relative">
                                    <input type="checkbox" id="include-numbers" class="option-checkbox" checked>
                                    <div class="option-toggle-switch"></div>
                                </div>
                            </label>
                            <label class="option-toggle-label">
                                <span>Symbols (!@#$)</span>
                                <div class="relative">
                                    <input type="checkbox" id="include-symbols" class="option-checkbox">
                                    <div class="option-toggle-switch"></div>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>
                </div>

                <!-- Actions -->
                <div class="flex justify-center gap-4">
                    <button id="generate-password-btn" class="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-full transition-all text-lg">Generate New Password</button>
                </div>
            </div>`;
        
        const passwordOutput = document.getElementById('password-output');
        const passwordLengthInput = document.getElementById('password-length');
        const lengthValueSpan = document.getElementById('length-value');
        const includeUppercaseCheckbox = document.getElementById('include-uppercase');
        const includeLowercaseCheckbox = document.getElementById('include-lowercase');
        const includeNumbersCheckbox = document.getElementById('include-numbers');
        const includeSymbolsCheckbox = document.getElementById('include-symbols');
        const generateButton = document.getElementById('generate-password-btn');
        const copyButton = document.getElementById('copy-password-btn');
        const strengthMeter = document.getElementById('strength-meter');
        const strengthText = document.getElementById('strength-text');

        const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
        const numberChars = '0123456789';
        const symbolChars = '!@#$%^&*()_+{}[]:;<>,.?/\\-'; 
        
        const updateStrength = (password) => {
            if(!strengthMeter || !strengthText) return;
            let score = 0;
            if (!password) {
                score = -1;
            } else {
                if (password.length >= 12) score++;
                if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
                if (/[0-9]/.test(password)) score++;
                if (/[^A-Za-z0-9]/.test(password)) score++;
            }
            
            const strengthLevels = [
                { text: '', colors: [] }, // Score 0
                { text: 'Weak', colors: ['#ef4444'] }, // Score 1
                { text: 'Medium', colors: ['#f97316', '#f97316'] }, // Score 2
                { text: 'Strong', colors: ['#eab308', '#eab308', '#22c55e'] }, // Score 3
                { text: 'Very Strong', colors: ['#22c55e', '#22c55e', '#22c55e', '#14b8a6'] } // Score 4
            ];
            
            const currentLevel = strengthLevels[score] || strengthLevels[0];
            const blocks = strengthMeter.children;

            strengthText.textContent = currentLevel.text;
            strengthText.style.color = currentLevel.colors[currentLevel.colors.length - 1] || '#6b7280';

            for (let i = 0; i < blocks.length; i++) {
                blocks[i].style.backgroundColor = currentLevel.colors[i] || '#374151';
            }
        };
        
        const generatePassword = () => {
            if(!passwordOutput || !passwordLengthInput) return;
            let availableChars = '';
            if (includeUppercaseCheckbox.checked) availableChars += uppercaseChars;
            if (includeLowercaseCheckbox.checked) availableChars += lowercaseChars;
            if (includeNumbersCheckbox.checked) availableChars += numberChars;
            if (includeSymbolsCheckbox.checked) availableChars += symbolChars;

            if (!availableChars) {
                passwordOutput.value = 'Select at least one option';
                updateStrength('');
                return;
            }

            let password = '';
            const passwordLength = parseInt(passwordLengthInput.value);
            for (let i = 0; i < passwordLength; i++) {
                const randomIndex = Math.floor(Math.random() * availableChars.length);
                password += availableChars[randomIndex];
            }
            passwordOutput.value = password;
            updateStrength(password);
        };

        if(passwordLengthInput) passwordLengthInput.addEventListener('input', () => {
            if(lengthValueSpan) lengthValueSpan.textContent = passwordLengthInput.value;
            generatePassword();
        });

        [includeUppercaseCheckbox, includeLowercaseCheckbox, includeNumbersCheckbox, includeSymbolsCheckbox].forEach(checkbox => {
            if(checkbox) checkbox.addEventListener('change', generatePassword);
        });

        if(generateButton) generateButton.addEventListener('click', generatePassword);

        if(copyButton) copyButton.addEventListener('click', function() {
            if(!passwordOutput || !passwordOutput.value) return;
            navigator.clipboard.writeText(passwordOutput.value).then(() => {
                this.textContent = 'Copied!';
                setTimeout(() => { this.textContent = 'Copy'; }, 2000);
            });
        });

        generatePassword();
    };
})(window.App);
