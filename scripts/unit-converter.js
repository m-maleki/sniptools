(function(App) {
    if (!App) { console.error("App object not initialized."); return; }
    App.initUnits = function() {
        const view = document.getElementById('view-units');
        if (!view || view.innerHTML.trim() !== '') return;
        view.innerHTML = `
            <div class="flex flex-col gap-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-5">
                        <div class="flex justify-between items-center mb-2">
                            <label for="unit-input-value" class="block text-lg font-medium text-gray-300">مقدار ورودی</label>
                            <button id="unit-clear-btn" class="text-sm text-gray-400 hover:text-white transition-colors">پاک کردن</button>
                        </div>
                        <input type="number" id="unit-input-value" class="w-full modern-input direction-ltr" placeholder="مقدار را وارد کنید...">
                    </div>
                    <div class="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-5">
                        <label for="unit-type" class="block text-lg font-medium text-gray-300 mb-2">نوع واحد</label>
                        <select id="unit-type" class="w-full p-4 text-base custom-select">
                            <option value="length">طول</option>
                            <option value="data">حجم داده</option>
                            <option value="time">زمان</option>
                            <option value="temperature">دما</option>
                            <option value="weight">وزن</option>
                            <option value="area">مساحت</option>
                            <option value="volume">حجم</option>
                        </select>
                    </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <div class="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-5">
                        <label for="unit-from" class="block text-lg font-medium text-gray-300 mb-2">تبدیل از</label>
                        <select id="unit-from" class="w-full p-4 text-base custom-select"></select>
                    </div>
                    <div class="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-5">
                        <label for="unit-to" class="block text-lg font-medium text-gray-300 mb-2">تبدیل به</label>
                        <select id="unit-to" class="w-full p-4 text-base custom-select"></select>
                    </div>
                </div>
                <div class="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-5 mt-4">
                    <div class="flex justify-between items-center mb-2">
                        <label class="block text-lg font-medium text-gray-300">نتیجه</label>
                        <button id="unit-copy-btn" class="text-sm text-gray-400 hover:text-white transition-colors">کپی کردن</button>
                    </div>
                    <div id="unit-result-display" class="unit-result-display">
                        <span class="placeholder">نتیجه تبدیل در اینجا نمایش داده می‌شود</span>
                    </div>
                </div>
            </div>`;
        
        const inputValue = document.getElementById('unit-input-value');
        const unitTypeSelect = document.getElementById('unit-type');
        const unitFromSelect = document.getElementById('unit-from');
        const unitToSelect = document.getElementById('unit-to');
        const resultDisplay = document.getElementById('unit-result-display');
        const clearBtn = document.getElementById('unit-clear-btn');
        const copyBtn = document.getElementById('unit-copy-btn');

        const units = {
            length: { 'متر': 1, 'کیلومتر': 1000, 'سانتی‌متر': 0.01, 'میلی‌متر': 0.001, 'میکرومتر': 1e-6, 'نانومتر': 1e-9, 'مایل': 1609.34, 'یارد': 0.9144, 'فوت': 0.3048, 'اینچ': 0.0254, 'مایل دریایی': 1852 },
            data: { 'بیت': 1, 'بایت': 8, 'کیلوبیت': 1000, 'کیلوبایت': 8000, 'مگابیت': 1e6, 'مگابایت': 8e6, 'گیگابیت': 1e9, 'گیگابایت': 8e9, 'ترابیت': 1e12, 'ترابایت': 8e12 },
            time: { 'ثانیه': 1, 'میلی‌ثانیه': 0.001, 'میکروثانیه': 1e-6, 'نانوثانیه': 1e-9, 'دقیقه': 60, 'ساعت': 3600, 'روز': 86400, 'هفته': 604800, 'ماه': 2629800, 'سال': 31557600 },
            temperature: { 'سلسیوس': { toKelvin: c => c + 273.15, fromKelvin: k => k - 273.15 }, 'فارنهایت': { toKelvin: f => (f - 32) * 5/9 + 273.15, fromKelvin: k => (k - 273.15) * 9/5 + 32 }, 'کلوین': { toKelvin: k => k, fromKelvin: k => k } },
            weight: { 'کیلوگرم': 1, 'گرم': 0.001, 'میلی‌گرم': 1e-6, 'پوند': 0.453592, 'اونس': 0.0283495, 'تن متریک': 1000 },
            area: { 'متر مربع': 1, 'کیلومتر مربع': 1e6, 'سانتی‌متر مربع': 1e-4, 'میلی‌متر مربع': 1e-6, 'مایل مربع': 2589988.11, 'یارد مربع': 0.836127, 'فوت مربع': 0.092903, 'اینچ مربع': 0.00064516, 'هکتار': 10000, 'جریب': 4046.86 },
            volume: { 'متر مکعب': 1, 'کیلومتر مکعب': 1e9, 'سانتی‌متر مکعب': 1e-6, 'لیتر': 0.001, 'میلی‌لیتر': 1e-6, 'گالن آمریکایی': 0.00378541, 'گالن امپریال': 0.00454609, 'فوت مکعب': 0.0283168, 'اینچ مکعب': 1.63871e-5 }
        };

        const populateUnitOptions = (selectElement, unitCategory) => {
            if(!selectElement) return;
            selectElement.innerHTML = '';
            for (const unitKey in unitCategory) {
                const option = document.createElement('option');
                option.value = unitKey;
                option.textContent = unitKey;
                selectElement.appendChild(option);
            }
        };

        const convertUnits = () => {
            if(!inputValue || !unitFromSelect || !unitToSelect || !unitTypeSelect || !resultDisplay) return;
            const value = parseFloat(inputValue.value);
            const fromUnitKey = unitFromSelect.value;
            const toUnitKey = unitToSelect.value;
            const type = unitTypeSelect.value;

            if (isNaN(value) || !fromUnitKey || !toUnitKey) {
                resultDisplay.innerHTML = `<span class="placeholder">نتیجه تبدیل در اینجا نمایش داده می‌شود</span>`;
                return;
            }

            let result;
            if (type === 'temperature') {
                const valInKelvin = units.temperature[fromUnitKey].toKelvin(value);
                result = units.temperature[toUnitKey].fromKelvin(valInKelvin);
            } else {
                const baseValue = value * units[type][fromUnitKey];
                result = baseValue / units[type][toUnitKey];
            }
            
            let formattedResult = result.toPrecision(10).replace(/\.?0+$/, "");

            resultDisplay.innerHTML = `
                <span class="value">${value}</span>
                <span class="unit">${fromUnitKey}</span>
                <span class="equals">=</span>
                <span class="value">${formattedResult}</span>
                <span class="unit">${toUnitKey}</span>
            `;
        };

        if(unitTypeSelect) unitTypeSelect.addEventListener('change', () => {
            const selectedType = unitTypeSelect.value;
            populateUnitOptions(unitFromSelect, units[selectedType]);
            populateUnitOptions(unitToSelect, units[selectedType]);
            convertUnits();
        });

        const allInputs = [inputValue, unitFromSelect, unitToSelect];
        allInputs.forEach(input => input && input.addEventListener('input', convertUnits));

        if(clearBtn) clearBtn.addEventListener('click', () => { if(inputValue) inputValue.value = ''; convertUnits(); });
        if(copyBtn) copyBtn.addEventListener('click', () => {
            if (!resultDisplay || resultDisplay.querySelector('.placeholder')) return;
            const textToCopy = resultDisplay.innerText.replace(/\s+/g, ' ').trim();
            navigator.clipboard.writeText(textToCopy).then(() => {
                copyBtn.textContent = 'کپی شد!';
                setTimeout(() => { copyBtn.textContent = 'کپی کردن'; }, 2000);
            });
        });

        if(unitTypeSelect) unitTypeSelect.dispatchEvent(new Event('change'));
    };
})(window.App);
