// constants.js
const CONSTANTS = {
    VALID_PLATE_CHARS: 'АВЕКМНОРСТУХ',
    PLATE_LENGTH: 6,
    PASSPORT_SERIES_LENGTH: 4,
    PASSPORT_NUMBER_LENGTH: 6,
    PLATE_REGEX: /^[АВЕКМНОРСТУХ]\d{3}[АВЕКМНОРСТУХ]{2}$/u,
};

// validators.js
class FormValidator {
    static validatePlateNumber(number) {
        return CONSTANTS.PLATE_REGEX.test(number);
    }

    static validatePassportSeries(series) {
        return /^\d{4}$/.test(series);
    }

    static validatePassportNumber(number) {
        return /^\d{6}$/.test(number);
    }

    static validateRequiredField(value) {
        return value.trim().length > 0;
    }
}

// form-handler.js
class TransportFormHandler {
    constructor(formId) {
        this.form = document.getElementById(formId);
        this.errorContainer = document.getElementById('error-messages');
        this.setupEventListeners();
        this.restoreFromStorage();
    }

    setupEventListeners() {
        // Input formatting
        this.setupPlateNumberFormatting();
        this.setupPassportFormatting();
        
        // Form events
        this.form.addEventListener('submit', this.handleSubmit.bind(this));
        document.querySelector('.cancel-button')
            .addEventListener('click', this.handleCancel.bind(this));
            
        // Auto-save
        this.form.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', () => this.saveToStorage(input.id));
        });
    }

    setupPlateNumberFormatting() {
        const plateInput = document.getElementById('number');
        plateInput.addEventListener('input', (event) => {
            let input = event.target.value.toUpperCase();
            let formatted = '';

            for (let i = 0; i < input.length && i < CONSTANTS.PLATE_LENGTH; i++) {
                if ([0, 4, 5].includes(i)) {
                    if (CONSTANTS.VALID_PLATE_CHARS.includes(input[i])) {
                        formatted += input[i];
                    }
                } else if (i >= 1 && i <= 3) {
                    if (/\d/.test(input[i])) {
                        formatted += input[i];
                    }
                }
            }
            event.target.value = formatted;
            this.saveToStorage('number');
        });
    }

    setupPassportFormatting() {
        const seriesInput = document.getElementById('passport-series');
        const numberInput = document.getElementById('passport-number');

        seriesInput.addEventListener('input', (event) => {
            event.target.value = event.target.value
                .replace(/\D/g, '')
                .substring(0, CONSTANTS.PASSPORT_SERIES_LENGTH);
            this.saveToStorage('passport-series');
        });

        numberInput.addEventListener('input', (event) => {
            event.target.value = event.target.value
                .replace(/\D/g, '')
                .substring(0, CONSTANTS.PASSPORT_NUMBER_LENGTH);
            this.saveToStorage('passport-number');
        });
    }

    async handleSubmit(event) {
        event.preventDefault();
        const errors = this.validateForm();
        
        if (errors.length > 0) {
            this.showErrors(errors);
            return;
        }

        try {
            const response = await this.submitForm();
            if (response.success) {
                this.handleSuccess();
            } else {
                this.showErrors(response.errors);
            }
        } catch (error) {
            this.showErrors(['Произошла ошибка при отправке данных']);
            console.error('Form submission error:', error);
        }
    }

    validateForm() {
        const errors = [];
        const formData = new FormData(this.form);
        
        if (!FormValidator.validatePlateNumber(formData.get('number_'))) {
            errors.push('Гос-номер должен состоять из 6 символов в формате А000АА');
        }

        if (!FormValidator.validatePassportSeries(formData.get('passport_series'))) {
            errors.push('Серия паспорта должна состоять из 4 цифр');
        }

        // Добавляем остальные проверки
        const requiredFields = {
            'arrival': 'дату прибытия',
            'driverName': 'ФИО водителя',
            'givenBy': 'кем выдан паспорт',
            'givenDate': 'дату выдачи паспорта'
        };

        for (const [field, description] of Object.entries(requiredFields)) {
            if (!FormValidator.validateRequiredField(formData.get(field))) {
                errors.push(`Укажите ${description}`);
            }
        }

        return errors;
    }

    async submitForm() {
        const response = await fetch('process.php', {
            method: 'POST',
            body: new FormData(this.form),
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    }

    handleSuccess() {
        localStorage.clear();
        this.form.reset();
        this.showMessage('Данные успешно сохранены', 'success');
    }

    handleCancel() {
        localStorage.clear();
        this.form.reset();
        this.errorContainer.innerHTML = '';
    }

    showErrors(errors) {
        this.errorContainer.innerHTML = errors
            .map(error => `<div class="error-message">${error}</div>`)
            .join('');
    }

    showMessage(message, type = 'error') {
        const className = type === 'success' ? 'success-message' : 'error-message';
        this.errorContainer.innerHTML = `<div class="${className}">${message}</div>`;
    }

    saveToStorage(id) {
        const element = document.getElementById(id);
        if (element) {
            localStorage.setItem(id, element.value);
        }
    }

    restoreFromStorage() {
        this.form.querySelectorAll('input').forEach(input => {
            const savedValue = localStorage.getItem(input.id);
            if (savedValue) {
                input.value = savedValue;
            }
        });
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    new TransportFormHandler('transportForm');
});