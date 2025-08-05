(function(App) {
    if (!App) { console.error("App object is not initialized."); return; }
    App.initUnits = function() {
        const view = document.getElementById('view-units');
        if (!view || view.innerHTML.trim() !== '') return;
        view.innerHTML = `
            <div class="flex flex-col gap-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-5">
                        <div class="flex justify-between items-center mb-2">
                            <label for="unit-input-value" class="block text-lg font-medium text-gray-300">Input Value</label>
                            <button id="unit-clear-btn" class="text-sm text-gray-400 hover:text-white transition-colors">Clear</button>
                        </div>
                        <input type="number" id="unit-input-value" class="w-full modern-input direction-ltr" placeholder="Enter value...">
                    </div>
                    <div class="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-5">
                        <label for="unit-type" class="block text-lg font-medium text-gray-300 mb-2">Unit Type</label>
                        <select id="unit-type" class="w-full p-4 text-base bg-gray-900 border-2 border-gray-700 rounded-lg appearance-none">
                            <option value="length">Length</option>
                            <option value="data">Data Size</option>
                            <option value="time">Time</option>
                            <option value="temperature">Temperature</option>
                            <option value="weight">Weight</option>
                            <option value="area">Area</option>
                            <option value="volume">Volume</option>
                        </select>
                    </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <div class="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-5">
                        <label for="unit-from" class="block text-lg font-medium text-gray-300 mb-2">Convert From</label>
                        <select id="unit-from" class="w-full p-4 text-base bg-gray-900 border-2 border-gray-700 rounded-lg appearance-none"></select>
                    </div>
                    <div class="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-5">
                        <label for="unit-to" class="block text-lg font-medium text-gray-300 mb-2">Convert To</label>
                        <select id="unit-to" class="w-full p-4 text-base bg-gray-900 border-2 border-gray-700 rounded-lg appearance-none"></select>
                    </div>
                </div>
                <div class="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-5 mt-4">
                    <div class="flex justify-between items-center mb-2">
                        <label class="block text-lg font-medium text-gray-300">Result</label>
                        <button id="unit-copy-btn" class="text-sm text-gray-400 hover:text-white transition-colors">Copy</button>
                    </div>
                    <div id="unit-result-display" class="unit-result-display">
                        <span class="placeholder">Conversion result will be shown here</span>
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
            length: { 'Meter': 1, 'Kilometer': 1000, 'Centimeter': 0.01, 'Millimeter': 0.001, 'Micrometer': 1e-6, 'Nanometer': 1e-9, 'Mile': 1609.34, 'Yard': 0.9144, 'Foot': 0.3048, 'Inch': 0.0254, 'Nautical Mile': 1852 },
            data: { 'Bit': 1, 'Byte': 8, 'Kilobit': 1000, 'Kilobyte': 8000, 'Megabit': 1e6, 'Megabyte': 8e6, 'Gigabit': 1e9, 'Gigabyte': 8e9, 'Terabit': 1e12, 'Terabyte': 8e12 },
            time: { 'Second': 1, 'Millisecond': 0.001, 'Microsecond': 1e-6, 'Nanosecond': 1e-9, 'Minute': 60, 'Hour': 3600, 'Day': 86400, 'Week': 604800, 'Month': 2629800, 'Year': 31557600 },
            temperature: { 'Celsius': { toKelvin: c => c + 273.15, fromKelvin: k => k - 273.15 }, 'Fahrenheit': { toKelvin: f => (f - 32) * 5/9 + 273.15, fromKelvin: k => (k - 273.15) * 9/5 + 32 }, 'Kelvin': { toKelvin: k => k, fromKelvin: k => k } },
            weight: { 'Kilogram': 1, 'Gram': 0.001, 'Milligram': 1e-6, 'Pound': 0.453592, 'Ounce': 0.0283495, 'Metric Ton': 1000 },
            area: { 'Square Meter': 1, 'Square Kilometer': 1e6, 'Square Centimeter': 1e-4, 'Square Millimeter': 1e-6, 'Square Mile': 2589988.11, 'Square Yard': 0.836127, 'Square Foot': 0.092903, 'Square Inch': 0.00064516, 'Hectare': 10000, 'Acre': 4046.86 },
            volume: { 'Cubic Meter': 1, 'Cubic Kilometer': 1e9, 'Cubic Centimeter': 1e-6, 'Liter': 0.001, 'Milliliter': 1e-6, 'US Gallon': 0.00378541, 'Imperial Gallon': 0.00454609, 'Cubic Foot': 0.0283168, 'Cubic Inch': 1.63871e-5 }
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
                resultDisplay.innerHTML = `<span class="placeholder">Conversion result will be shown here</span>`;
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
            
            let formattedResult = parseFloat(result.toPrecision(10));

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
                copyBtn.textContent = 'Copied!';
                setTimeout(() => { copyBtn.textContent = 'Copy'; }, 2000);
            });
        });

        if(unitTypeSelect) unitTypeSelect.dispatchEvent(new Event('change'));
    };
})(window.App);
