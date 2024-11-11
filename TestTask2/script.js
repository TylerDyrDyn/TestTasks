
// Обработчик локального хранилища
class FormStorage {
    static save(id, value) {
        localStorage.setItem(id, value);
    }

    static load(id) {
        return localStorage.getItem(id);
    }

    static clear() {
        localStorage.clear();
    }
}

// Обработчик вводимых данных
class FormValidator {
    static validateNumber(number) {
        return number && number.length === 6;
    }

    static validatePassportSeries(series) {
        return series && series.length === 4;
    }

    static validatePassportNumber(number) {
        return number && number.length === 6;
    }

    static validateRequired(value) {
        return value && value.trim().length > 0;
    }

    static getErrorMessages(formData) {
        const errors = [];
        
        if (!this.validateNumber(formData.number)) {
            errors.push("Гос-номер должен состоять из 6 символов.");
        }
        
        if (!this.validatePassportSeries(formData.passportSeries)) {
            errors.push("Серия паспорта должна состоять из 4 цифр.");
        }
        
        if (!this.validatePassportNumber(formData.passportNumber)) {
            errors.push("Номер паспорта должен состоять из 6 цифр.");
        }
        
        if (!this.validateRequired(formData.arrival)) {
            errors.push("Укажите ориентировочную дату прибытия.");
        }
        
        if (!this.validateRequired(formData.driverName)) {
            errors.push("Введите ФИО водителя.");
        }

        if (!this.validateRequired(formData.vehicle)) {
            errors.push("Введите название транспортного средства.");
        }
        
        if (!this.validateRequired(formData.givenBy)) {
            errors.push("Укажите, кем был выдан паспорт.");
        }
        
        if (!this.validateRequired(formData.givenDate)) {
            errors.push("Укажите дату выдачи паспорта.");
        }

        return errors;
    }
}
// Форматировщик вводимых данных
class InputFormatter {
    static formatVehicleNumber(input) {
        let value = input.toUpperCase();
        let formatted = "";
        const validLetters = "АВЕКМНОРСТУХ";

        for (let i = 0; i < value.length; i++) {
            if (i === 0) {
                if (validLetters.includes(value[i])) {
                    formatted += value[i];
                }
            } else if (i >= 1 && i <= 3) {
                if (/\d/.test(value[i])) {
                    formatted += value[i];
                }
            } else if (i >= 4 && i <= 5) {
                if (validLetters.includes(value[i])) {
                    formatted += value[i];
                }
            }
        }
        return formatted;
    }

    static formatNumbers(input, maxLength) {
        return input.replace(/\D/g, '').substring(0, maxLength);
    }
}
// Основной класс работы с формой
class TransportForm {
    constructor(formId) {
        this.form = document.getElementById(formId);
        this.errorContainer = document.getElementById("error-messages");
        this.setupEventListeners();
        this.loadSavedData();
    }

    setupEventListeners() {
        this.form.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', () => this.handleInput(input));
        });

        const numberInput = this.form.querySelector("#number");
        numberInput.addEventListener("input", (e) => {
            e.target.value = InputFormatter.formatVehicleNumber(e.target.value);
            FormStorage.save(e.target.id, e.target.value);
        });

        const seriesInput = this.form.querySelector("#passport-series");
        seriesInput.addEventListener("input", (e) => {
            e.target.value = InputFormatter.formatNumbers(e.target.value, 4);
            FormStorage.save(e.target.id, e.target.value);
        });

        const numberPassportInput = this.form.querySelector("#passport-number");
        numberPassportInput.addEventListener("input", (e) => {
            e.target.value = InputFormatter.formatNumbers(e.target.value, 6);
            FormStorage.save(e.target.id, e.target.value);
        });

        this.form.addEventListener("submit", (e) => this.handleSubmit(e));

        document.querySelector('.cancel-button').addEventListener('click', () => this.handleCancel());
    }

    handleInput(input) {
        FormStorage.save(input.id, input.value);
    }

    loadSavedData() {
        this.form.querySelectorAll('input').forEach(input => {
            const savedValue = FormStorage.load(input.id);
            if (savedValue) {
                input.value = savedValue;
            }
        });
    }

    async handleSubmit(event) {
        event.preventDefault();
        
        const formData = {
            number: this.form.querySelector("#number").value,
            vehicle: this.form.querySelector("#vehicle").value,
            arrival: this.form.querySelector("#arrival").value,
            driverName: this.form.querySelector("#driverName").value,
            passportSeries: this.form.querySelector("#passport-series").value,
            passportNumber: this.form.querySelector("#passport-number").value,
            givenBy: this.form.querySelector("#givenBy").value,
            givenDate: this.form.querySelector("#givenDate").value
        };

        const errors = FormValidator.getErrorMessages(formData);

        if (errors.length > 0) {
            this.showErrors(errors);
            return;
        }

        try {
            const response = await fetch('process.php', {
                method: 'POST',
                body: new FormData(this.form)
            });
            
            const data = await response.json();
            
            if (data.success) {
                FormStorage.clear();
                this.form.reset();
                this.showSuccess("Данные успешно сохранены");
            } else {
                this.showErrors(data.errors);
            }
        } catch (error) {
            this.showErrors(["Произошла ошибка при отправке данных"]);
        }
    }

    handleCancel() {
        FormStorage.clear();
        this.form.reset();
        this.clearErrors();
    }

    showErrors(errors) {
        this.errorContainer.innerHTML = errors.join("<br>");
    }

    showSuccess(message) {
        this.errorContainer.innerHTML = `<span style="color: green;">${message}</span>`;
    }

    clearErrors() {
        this.errorContainer.innerHTML = '';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const transportForm = new TransportForm('transportForm');
});