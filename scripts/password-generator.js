(function(App) {
    if (!App) { console.error("App object is not initialized."); return; }
    App.initPassword = function() {
        const view = document.getElementById('view-password');
        if (!view || view.innerHTML.trim() !== '') return;
        view.innerHTML = `
            <div class="flex flex-col gap-8">
                <!-- Output Section -->
                <div class="bg-gray-800/50 p-6 rounded-xl">
                    <div class="flex justify-between items-center mb-2">
                         <h3 class="text-xl font-semibold text-teal-400">رمز عبور تولید شده</h3>
                         <button id="copy-password-btn" class="text-sm text-gray-400 hover:text-white transition-colors">کپی کردن</button>
                    </div>
                    <input type="text" id="password-output" class="w-full modern-input password-input-display" readonly placeholder="رمز عبور شما">
                    <div class="mt-4">
                        <div class="strength-bar-container w-full">
                            <div id="strength-bar" class="strength-bar"></div>
                        </div>
                        <span id="strength-text" class="block text-center text-sm font-medium text-gray-400 mt-2"></span>
                    </div>
                </div>

                <!-- Settings Section -->
                <div class="bg-gray-800/50 p-6 rounded-xl">
                <div class="password-settings-card">
                    <h3 class="text-xl font-semibold mb-6 text-teal-400">تنظیمات</h3>
                    <div class="grid md:grid-cols-2 gap-x-12 gap-y-6">
                        <!-- Right Column: Password Length (First in code to appear on the right in RTL) -->
                        <div class="space-y-4">
                            <label for="password-length" class="block text-gray-300">طول رمز عبور</label>
                            <div class="flex items-center gap-4">
                                <input type="range" id="password-length" min="8" max="128" value="12" class="w-full">
                                <span id="length-value" class="font-bold text-teal-400 text-2xl w-16 text-center modern-input p-2">12</span>
                            </div>
                        </div>
                        <!-- Left Column: Character Options (Second in code to appear on the left in RTL) -->
                        <div class="space-y-4">
                            <label class="option-toggle-label">
                                <span>حروف بزرگ (A-Z)</span>
                                <div class="relative">
                                    <input type="checkbox" id="include-uppercase" class="option-checkbox" checked>
                                    <div class="option-toggle-switch"></div>
                                </div>
                            </label>
                            <label class="option-toggle-label">
                                <span>حروف کوچک (a-z)</span>
                                <div class="relative">
                                    <input type="checkbox" id="include-lowercase" class="option-checkbox" checked>
                                    <div class="option-toggle-switch"></div>
                                </div>
                            </label>
                            <label class="option-toggle-label">
                                <span>اعداد (0-9)</span>
                                <div class="relative">
                                    <input type="checkbox" id="include-numbers" class="option-checkbox" checked>
                                    <div class="option-toggle-switch"></div>
                                </div>
                            </label>
                            <label class="option-toggle-label">
                                <span>کاراکترهای ویژه (!@#$)</span>
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
                    <button id="generate-password-btn" class="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-8 rounded-full transition-all text-lg">تولید رمز جدید</button>
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
        const strengthBar = document.getElementById('strength-bar');
        const strengthText = document.getElementById('strength-text');

        const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
        const numberChars = '0123456789';
        const symbolChars = '!@#$%^&*()_+{}[]:;<>,.?/\\-'; 
        
        const updateStrength = (password) => {
            if(!strengthBar || !strengthText) return;
            let score = 0;
            if (!password) {
                score = -1;
            } else {
                if (password.length >= 12) score += 1;
                if (/[a-z]/.test(password)) score += 1;
                if (/[A-Z]/.test(password)) score += 1;
                if (/[0-9]/.test(password)) score += 1;
                if (/[^A-Za-z0-9]/.test(password)) score += 1;
            }
            
            let strength = '';
            let barColorClass = '';
            let barWidth = '0%';

            switch (score) {
                case -1:
                case 0:
                case 1:
                    strength = 'خیلی ضعیف';
                    barColorClass = 'strength-weak';
                    barWidth = '20%';
                    break;
                case 2:
                    strength = 'ضعیف';
                    barColorClass = 'strength-medium';
                    barWidth = '40%';
                    break;
                case 3:
                    strength = 'متوسط';
                    barColorClass = 'strength-strong';
                    barWidth = '60%';
                    break;
                case 4:
                    strength = 'قوی';
                    barColorClass = 'strength-strong';
                    barWidth = '80%';
                    break;
                case 5:
                    strength = 'بسیار قوی';
                    barColorClass = 'strength-very-strong';
                    barWidth = '100%';
                    break;
            }

            strengthBar.style.width = barWidth;
            strengthBar.className = 'strength-bar ' + barColorClass;
            strengthText.textContent = strength;
        };
        
        const generatePassword = () => {
            if(!passwordOutput || !passwordLengthInput) return;
            let availableChars = '';
            if (includeUppercaseCheckbox.checked) availableChars += uppercaseChars;
            if (includeLowercaseCheckbox.checked) availableChars += lowercaseChars;
            if (includeNumbersCheckbox.checked) availableChars += numberChars;
            if (includeSymbolsCheckbox.checked) availableChars += symbolChars;

            if (!availableChars) {
                passwordOutput.value = 'حداقل یک گزینه را انتخاب کنید';
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
                this.textContent = 'کپی شد!';
                setTimeout(() => { this.textContent = 'کپی کردن'; }, 2000);
            });
        });

        generatePassword();
    };
})(window.App);
