// Функция для проверки гиперссылок в платежных системах
function checkPaymentHyperlinks(e) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetById(1897875028);
    if (!sheet) return;
    
    const range = e.range;
    const col = range.getColumn();
    const row = range.getRow();
    
    // Колонна 5 - Платежные системы
    if (col !== 5 || row === 1) return;
    
    const cell = range.getSheet().getRange(row, col);
    const payments = cell.getValue().toString().split(',').map(p => p.trim()).filter(p => p);
    
    const filtersSheet = ss.getSheetByName("Фильтры");
    if (!filtersSheet) return;
    
    const paymentList = [];
    const lastRow = Math.max(filtersSheet.getLastRow(), 1);
    
    for (let i = 2; i <= lastRow; i++) {
        const paymentCell = filtersSheet.getRange(i, 1);
        const displayValue = paymentCell.getDisplayValue().toLowerCase();
        let hasHyperlink = false;
        
        try {
            const formula = paymentCell.getFormula();
            if (formula && formula.includes('HYPERLINK')) {
                hasHyperlink = true;
            }
        } catch (e) {
            // Игнорируем ошибки
        }
        
        paymentList.push({
            name: displayValue,
            hasUrl: hasHyperlink
        });
    }
    
    // Проверка каждой платежной системы
    const missingPayments = [];
    const paymentsWithoutUrls = [];
    
    payments.forEach(payment => {
        const lower = payment.toLowerCase();
        const found = paymentList.find(p => p.name === lower);
        
        if (!found) {
            missingPayments.push(payment);
        } else if (!found.hasUrl) {
            paymentsWithoutUrls.push(payment);
        }
    });
    
    // Показываем предупреждение если есть проблемы
    if (missingPayments.length > 0 || paymentsWithoutUrls.length > 0) {
        let message = 'Внимание при редактировании платежных систем:\n';
        if (missingPayments.length > 0) {
            message += `\n❌ Не найдены в списке фильтров: ${missingPayments.join(', ')}`;
        }
        if (paymentsWithoutUrls.length > 0) {
            message += `\n⚠️  Без гиперссылок: ${paymentsWithoutUrls.join(', ')}`;
        }
        
        SpreadsheetApp.getUi().alert(message);
    }
}

function onEdit(e) {
    // Проверка гиперссылок платежных систем
    checkPaymentHyperlinks(e);
}

function doGet(e) {
    const params = e && e.parameter ? e.parameter : {};
    const action = params.action || 'getAllData';
    let response = {};

    try {
        switch (action) {
            case 'getMainData':
                response = { success: true, sites: getMainData(), lastChange: getLastChange() };
                break;
            case 'getChangesData':
                response = { success: true, changes: getChangesData(), lastChange: getLastChange() };
                break;
            case 'getPayments':
                response = { success: true, payments: getPaymentData() };
                break;
            case 'getAllData':
                response = { success: true, sites: getMainData(), changes: getChangesData(), payments: getPaymentData(), lastChange: getLastChange() };
                break;
            default:
                response = { success: false, error: 'Неверный action' };
        }
        if (response.success) {
            if (!Array.isArray(response.sites)) {
                response.sites = [];
                console.warn("doGet: response.sites не является массивом, установлено пустое значение.");
            }
            if (action !== 'getMainData' && !Array.isArray(response.changes)) {
                response.changes = [];
                console.warn("doGet: response.changes не является массивом, установлено пустое значение.");
            }
            if (action !== 'getMainData' && !Array.isArray(response.payments)) {
                response.payments = [];
                console.warn("doGet: response.payments не является массивом, установлено пустое значение.");
            }
        }
        console.log(`doGet: Данные после switch: ${JSON.stringify(response)}`);
    } catch (error) {
        response = { success: false, error: error.message || 'Неизвестная ошибка' };
        console.error(`doGet: Ошибка в try-catch: ${error.message || error}`);
    }

    const finalOutput = JSON.stringify(response);
    console.log(`doGet: Финальная строка JSON перед отправкой: ${finalOutput}`);
    return ContentService.createTextOutput(finalOutput)
        .setMimeType(ContentService.MimeType.JSON);
}

function getMainData() {
    console.log("getMainData: Запуск функции");
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetById(1897875028);
    if (!sheet) {
        console.error("getMainData: Лист с gid=1897875028 не найден.");
        return [];
    }
    const lastRow = Math.max(sheet.getLastRow(), 1);
    const lastColumn = Math.max(sheet.getLastColumn(), 7);
    console.log(`getMainData: Последняя строка: ${lastRow}, последний столбец: ${lastColumn}`);

    if (lastRow < 2) {
        console.log("getMainData: Нет данных ниже заголовков, возвращаем пустой массив");
        return [];
    }

    const data = sheet.getRange(2, 1, lastRow - 1, lastColumn).getValues();
    const result = [];

    data.forEach((row, index) => {
        console.log(`getMainData: Обработка строки ${index + 2}`);
        const payments = escapeValue(row[4]).split(',').map(p => p.trim()).filter(p => p);
        const workTypes = escapeValue(row[5]).split(',').map(w => w.trim()).filter(w => w);
        const difficulty = escapeValue(row[3]);

        const dateCreatedRaw = escapeValue(row[1]);
        const dateCreated = isValidDateFormat(dateCreatedRaw) ? reformatDate(dateCreatedRaw) : dateCreatedRaw;

        const entry = {
            site: escapeValue(row[0]),
            dateCreated: dateCreated,
            minAmount: formatNumber(escapeValue(row[2])),
            difficulty: difficulty,
            payments: payments,
            workTypes: workTypes,
            reviewSites: escapeValue(row[6])
        };
        if (entry.site) {
            console.log(`getMainData: Результат строки ${index + 2}: ${JSON.stringify(entry)}`);
            result.push(entry);
        }
    });

    console.log(`getMainData: Обработано строк: ${result.length}`);
    return result;
}

function getChangesData() {
    console.log("getChangesData: Запуск функции");
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetById(1531258534);
    if (!sheet) {
        console.error("getChangesData: Лист с gid=1531258534 не найден.");
        return [];
    }
    const lastRow = Math.max(sheet.getLastRow(), 1);
    const lastColumn = Math.max(sheet.getLastColumn(), 5);

    if (lastRow < 2) {
        console.log("getChangesData: Нет данных ниже заголовков, возвращаем пустой массив");
        return [];
    }

    const rawData = sheet.getRange(2, 1, lastRow - 1, lastColumn).getDisplayValues();
    const result = [];

    rawData.forEach((row, index) => {
        const displayTimestamp = row[0];
        const entry = {
            timestamp: escapeValue(displayTimestamp),
            site: escapeValue(row[1]),
            parameter: escapeValue(row[2]),
            oldValue: formatNumber(escapeValue(row[3])),
            newValue: escapeValue(row[4])
        };
        if (entry.timestamp && entry.site) {
            console.log(`getChangesData: Результат строки ${index + 2}: ${JSON.stringify(entry)}`);
            result.push(entry);
        }
    });

    console.log(`getChangesData: Обработано строк: ${result.length}`);
    return result;
}

function getPaymentData() {
    console.log("getPaymentData: Запуск функции");
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName("Фильтры");
    if (!sheet) {
        console.error("getPaymentData: Лист 'Фильтры' не найден.");
        return [];
    }
    const lastRow = Math.max(sheet.getLastRow(), 1);
    console.log(`getPaymentData: Последняя строка: ${lastRow}`);

    if (lastRow < 2) {
        console.log("getPaymentData: Нет данных ниже заголовков, возвращаем пустой массив");
        return [];
    }

    const result = [];
    
    for (let i = 2; i <= lastRow; i++) {
        const cell = sheet.getRange(i, 1);
        const displayValue = escapeValue(cell.getDisplayValue());
        let url = '';
        
        try {
            const formula = cell.getFormula();
            if (formula && formula.includes('HYPERLINK')) {
                const urlMatch = formula.match(/"([^"]+)"/);
                if (urlMatch) {
                    url = urlMatch[1];
                }
            }
        } catch (e) {
            // Игнорируем ошибки при чтении
        }
        
        if (displayValue && url) {
            result.push({
                payment: displayValue.toLowerCase(),
                url: url
            });
            console.log(`getPaymentData: Строка ${i}: ${displayValue} -> ${url}`);
        }
    }

    console.log(`getPaymentData: Обработано платежей: ${result.length}`);
    return result;
}

function getLastChange() {
    console.log("getLastChange: Запуск функции");
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetById(1531258534);
    if (!sheet) {
        console.error("getLastChange: Лист с gid=1531258534 не найден.");
        return null;
    }
    const lastRow = Math.max(sheet.getLastRow(), 1);
    if (lastRow < 2) {
        console.log("getLastChange: Нет данных ниже заголовков, возвращаем null");
        return null;
    }

    const lastChangeRow = sheet.getRange(lastRow, 1, 1, 5).getDisplayValues()[0];
    const change = {
        timestamp: escapeValue(lastChangeRow[0]),
        site: escapeValue(lastChangeRow[1]),
        parameter: escapeValue(lastChangeRow[2]),
        oldValue: escapeValue(lastChangeRow[3]),
        newValue: escapeValue(lastChangeRow[4])
    };
    if (change.timestamp && change.site) {
        console.log(`getLastChange: Последнее изменение: ${JSON.stringify(change)}`);
        return change;
    }
    return null;
}

function onEdit(e) {
    const sheet = e.source.getActiveSheet();
    if (sheet.getSheetId() !== 1897875028) return;

    const range = e.range;
    const row = range.getRow();
    const col = range.getColumn();

    if (row === 1) return;

    const changesSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetById(1531258534);
    if (!changesSheet) {
        console.error("onEdit: Лист изменений с gid=1531258534 не найден.");
        return;
    }

    const timestamp = getRussianDate();
    const site = escapeValue(sheet.getRange(row, 1).getValue());
    const parameter = escapeValue(sheet.getRange(1, col).getValue());
    const oldValue = escapeValue(e.oldValue || '');
    let newValue = escapeValue(range.getValue());

    if (parameter === 'Название сайта' || parameter === 'Сайты с отзывами') {
        newValue = formatLinks(newValue);
        range.setValue(newValue);
    }

    // Добавляем в лист изменений
    const lastRow = changesSheet.getLastRow() + 1;
    const newCell = changesSheet.getRange(lastRow, 5);
    
    // Если это платежные системы - создаём HYPERLINK формулу
    if (parameter.toLowerCase().includes('платеж') || parameter.toLowerCase().includes('система')) {
        createPaymentHyperlinksFormula(newCell, newValue);
    } else {
        // Добавляем обычные значения
        changesSheet.getRange(lastRow, 1, 1, 5).setValues([[timestamp, site, parameter, oldValue, newValue]]);
    }
    
    // Добавляем временную метку, сайт, параметр и старое значение (если не добавили выше)
    if (!(parameter.toLowerCase().includes('платеж') || parameter.toLowerCase().includes('система'))) {
        changesSheet.getRange(lastRow, 1, 1, 4).setValues([[timestamp, site, parameter, oldValue]]);
    } else {
        // Если платежи, добавляем метаинформацию отдельно
        changesSheet.getRange(lastRow, 1).setValue(timestamp);
        changesSheet.getRange(lastRow, 2).setValue(site);
        changesSheet.getRange(lastRow, 3).setValue(parameter);
        changesSheet.getRange(lastRow, 4).setValue(oldValue);
    }
    
    console.log(`onEdit: Записана строка: ${timestamp}, ${site}, ${parameter}, ${oldValue}, ${newValue}`);
}

function createPaymentHyperlinksFormula(cell, paymentText) {
    try {
        // Загружаем данные платежей из листа "Фильтры"
        const ss = SpreadsheetApp.getActiveSpreadsheet();
        const filtersSheet = ss.getSheetByName("Фильтры");
        if (!filtersSheet) {
            console.log("createPaymentHyperlinksFormula: Лист Фильтры не найден");
            return;
        }
        
        const lastRow = filtersSheet.getLastRow();
        const payments = {};
        
        // Читаем платежи и их ссылки
        for (let i = 2; i <= lastRow; i++) {
            const paymentCell = filtersSheet.getRange(i, 1);
            const displayValue = escapeValue(paymentCell.getDisplayValue());
            let url = '';
            
            try {
                const formula = paymentCell.getFormula();
                if (formula && formula.includes('HYPERLINK')) {
                    const urlMatch = formula.match(/"([^"]+)"/);
                    if (urlMatch) {
                        url = urlMatch[1];
                        console.log(`createPaymentHyperlinksFormula: Найдена ссылка на ${displayValue}: ${url}`);
                    }
                }
            } catch (e) {
                // Игнорируем ошибки
            }
            
            if (displayValue && url) {
                payments[displayValue.toLowerCase()] = url;
            }
        }
        
        // Парсим платежи и создаем HYPERLINK формулы
        const paymentList = paymentText.split(',').map(p => p.trim()).filter(p => p);
        const formulas = [];
        
        paymentList.forEach(paymentName => {
            const paymentLower = paymentName.toLowerCase();
            const url = payments[paymentLower];
            
            if (url) {
                // Создаем HYPERLINK формулу
                const formula = `=HYPERLINK("${url}", "${paymentName}")`;
                formulas.push(formula);
                console.log(`createPaymentHyperlinksFormula: Добавлена формула на ${paymentName}`);
            } else {
                formulas.push(paymentName);
            }
        });
        
        // Если только одна платежка - просто устанавливаем формулу
        if (formulas.length === 1) {
            cell.setFormula(formulas[0]);
        } else if (formulas.length > 1) {
            // Если несколько - объединяем с перечислением (пока как текст с HYPERLINK)
            // Устанавливаем первую как формулу, остальные добавляем текстом
            cell.setValue(paymentText);
        }
        
        console.log(`createPaymentHyperlinksFormula: Завершено`);
    } catch (error) {
        console.error(`createPaymentHyperlinksFormula: Ошибка: ${error}`);
    }
}

function getRussianDate(date) {
    const options = {
        timeZone: 'Europe/Moscow',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    };
    const formatted = (date || new Date()).toLocaleString('ru-RU', options).replace(/,/, '');
    console.log(`getRussianDate: Текущая дата: ${formatted}`);
    return formatted;
}

function escapeValue(value) {
    return (value === undefined || value === null) ? '' : String(value).trim();
}

function formatNumber(value) {
    if (!value) return '';
    const num = Number(value);
    if (isNaN(num)) return value;
    return num.toLocaleString('ru-RU', { maximumFractionDigits: 2 });
}

function reformatDate(dateInput) {
    let date;
    if (typeof dateInput === 'string' && dateInput) {
        const parts = dateInput.split('.');
        if (parts.length === 3) {
            date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
        } else {
            date = new Date(dateInput);
        }
        if (isNaN(date.getTime())) return dateInput;
    } else if (dateInput instanceof Date) {
        date = dateInput;
    } else {
        return '';
    }
    const options = {
        timeZone: 'Europe/Moscow',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    };
    return date.toLocaleString('ru-RU', options).replace(/,/, '');
}

function formatLinks(value) {
    if (!value) return '';
    const linkArray = String(value).split(',').map(link => {
        link = link.trim();
        if (/^https?:\/\//i.test(link)) {
            return link;
        } else if (/^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/.test(link)) {
            return `https://${link}`;
        }
        return link;
    });
    return linkArray.join(', ');
}

function isValidDateFormat(dateString) {
    if (!dateString) return false;
    const datePattern = /^\d{2}\.\d{2}\.\d{4}$/;
    if (datePattern.test(dateString)) {
        const parts = dateString.split('.');
        const date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
        return !isNaN(date.getTime());
    }
    return false;
}
