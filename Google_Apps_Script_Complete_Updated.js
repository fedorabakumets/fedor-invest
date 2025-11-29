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
        // Проверка корректности данных перед отправкой
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
        console.log(`doGet: Поля в первом сайте: ${response.sites && response.sites.length > 0 ? JSON.stringify(Object.keys(response.sites[0])) : 'Нет данных'}`);
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
    const sheet = ss.getSheetById(1897875028); // Лист "Список сайтов"
    if (!sheet) {
        console.error("getMainData: Лист с gid=1897875028 не найден.");
        return [];
    }
    const lastRow = Math.max(sheet.getLastRow(), 1);
    const lastColumn = Math.max(sheet.getLastColumn(), 7); // Обновлено: 7 столбцов вместо 8
    console.log(`getMainData: Последняя строка: ${lastRow}, последний столбец: ${lastColumn}`);

    const headers = sheet.getRange(1, 1, 1, lastColumn).getValues()[0];
    console.log(`Реальные заголовки в листе 'Список сайтов': ${headers.join(', ')}`);

    if (lastRow < 2) {
        console.log("getMainData: Нет данных ниже заголовков, возвращаем пустой массив");
        return [];
    }

    const data = sheet.getRange(2, 1, lastRow - 1, lastColumn).getValues();
    const result = [];

    data.forEach((row, index) => {
        console.log(`getMainData: Обработка строки ${index + 2}`);
        const payments = escapeValue(row[4]).split(',').map(p => p.trim()).filter(p => p); // Сдвиг: было row[5]
        const workTypes = escapeValue(row[5]).split(',').map(w => w.trim()).filter(w => w); // Сдвиг: было row[6]
        const difficulty = escapeValue(row[3]); // Сдвиг: было row[4]
        if (!difficulty) console.warn(`getMainData: Поле 'Сложность' пустое в строке ${index + 2}`);

        const dateCreatedRaw = escapeValue(row[1]);
        const dateCreated = isValidDateFormat(dateCreatedRaw) ? reformatDate(dateCreatedRaw) : dateCreatedRaw;

        const entry = {
            site: escapeValue(row[0]),
            dateCreated: dateCreated,
            minAmount: formatNumber(escapeValue(row[2])),
            difficulty: difficulty,
            payments: payments,
            workTypes: workTypes,
            reviewSites: escapeValue(row[6]) // Сдвиг: было row[7]
        };
        // Проверка, что запись содержит хотя бы site
        if (entry.site) {
            console.log(`getMainData: Результат строки ${index + 2}: ${JSON.stringify(entry)}`);
            result.push(entry);
        } else {
            console.warn(`getMainData: Пропущена строка ${index + 2}, отсутствует 'site'`);
        }
    });

    console.log(`getMainData: Обработано строк: ${result.length}`);
    return result;
}

function getChangesData() {
    console.log("getChangesData: Запуск функции");
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetById(1531258534); // Лист изменений
    if (!sheet) {
        console.error("getChangesData: Лист с gid=1531258534 не найден.");
        return [];
    }
    const lastRow = Math.max(sheet.getLastRow(), 1);
    const lastColumn = Math.max(sheet.getLastColumn(), 5);
    console.log(`getChangesData: Последняя строка: ${lastRow}, последний столбец: ${lastColumn}`);

    const headers = sheet.getRange(1, 1, 1, lastColumn).getValues()[0];
    console.log(`Реальные заголовки в листе изменений: ${headers.join(', ')}`);

    if (lastRow < 2) {
        console.log("getChangesData: Нет данных ниже заголовков, возвращаем пустой массив");
        return [];
    }

    const rawData = sheet.getRange(2, 1, lastRow - 1, lastColumn).getDisplayValues();
    const result = [];

    rawData.forEach((row, index) => {
        const displayTimestamp = row[0];
        console.log(`getChangesData: Отображаемый timestamp, строка ${index + 2}: "${displayTimestamp}"`);
        const entry = {
            timestamp: escapeValue(displayTimestamp),
            site: escapeValue(row[1]),
            parameter: escapeValue(row[2]),
            oldValue: formatNumber(escapeValue(row[3])),
            newValue: escapeValue(row[4])
        };
        // Проверка, что запись содержит timestamp и site
        if (entry.timestamp && entry.site) {
            console.log(`getChangesData: Результат строки ${index + 2}: ${JSON.stringify(entry)}`);
            result.push(entry);
        } else {
            console.warn(`getChangesData: Пропущена строка ${index + 2}, отсутствует 'timestamp' или 'site'`);
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
    const lastColumn = 1; // Только один столбец с гиперссылками
    console.log(`getPaymentData: Последняя строка: ${lastRow}`);

    if (lastRow < 2) {
        console.log("getPaymentData: Нет данных ниже заголовков, возвращаем пустой массив");
        return [];
    }

    const result = [];
    
    // Читаем ячейки с богатым текстом (Rich Text) чтобы получить гиперссылки
    for (let i = 2; i <= lastRow; i++) {
        const cell = sheet.getRange(i, 1);
        const displayValue = escapeValue(cell.getDisplayValue());
        let url = '';
        
        try {
            // Пытаемся получить URL из гиперссылки используя формулу
            const formula = cell.getFormula();
            if (formula.includes('HYPERLINK')) {
                // Извлекаем URL из HYPERLINK формулы
                const urlMatch = formula.match(/"([^"]+)"/);
                if (urlMatch) {
                    url = urlMatch[1];
                }
            } else {
                // Пытаемся получить гиперссылку через Rich Text
                const richText = cell.getRichTextValue();
                const link = richText ? richText.getLinkUrl(0) : null;
                url = link || '';
            }
        } catch (e) {
            console.log(`getPaymentData: Ошибка при чтении гиперссылки из строки ${i}: ${e}`);
        }
        
        if (displayValue && url) {
            result.push({
                payment: displayValue.toLowerCase(),
                url: url
            });
            console.log(`getPaymentData: Строка ${i}: ${displayValue} -> ${url}`);
        } else if (displayValue) {
            console.warn(`getPaymentData: Строка ${i}: '${displayValue}' не имеет гиперссылки`);
        }
    }

    console.log(`getPaymentData: Обработано платежей: ${result.length}`);
    return result;
}

function getLastChange() {
    console.log("getLastChange: Запуск функции");
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetById(1531258534); // Лист изменений
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
    // Проверка, что запись корректна
    if (change.timestamp && change.site) {
        console.log(`getLastChange: Последнее изменение: ${JSON.stringify(change)}`);
        return change;
    } else {
        console.warn("getLastChange: Последнее изменение некорректно, возвращаем null");
        return null;
    }
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
    changesSheet.getRange(lastRow, 1, 1, 5).setValues([[timestamp, site, parameter, oldValue, newValue]]);
    
    // Если это платежные системы - создаём гиперссылки
    if (parameter.toLowerCase().includes('платеж') || parameter.toLowerCase().includes('система')) {
        createPaymentHyperlinks(changesSheet.getRange(lastRow, 5), newValue);
    }
    
    console.log(`onEdit: Записана строка: ${timestamp}, ${site}, ${parameter}, ${oldValue}, ${newValue}`);
}

function createPaymentHyperlinks(cell, paymentText) {
    try {
        // Загружаем данные платежей из листа "Фильтры"
        const ss = SpreadsheetApp.getActiveSpreadsheet();
        const filtersSheet = ss.getSheetByName("Фильтры");
        if (!filtersSheet) return;
        
        const lastRow = filtersSheet.getLastRow();
        const payments = [];
        
        // Читаем платежи и их ссылки
        for (let i = 2; i <= lastRow; i++) {
            const paymentCell = filtersSheet.getRange(i, 1);
            const displayValue = escapeValue(paymentCell.getDisplayValue());
            let url = '';
            
            try {
                const formula = paymentCell.getFormula();
                if (formula.includes('HYPERLINK')) {
                    const urlMatch = formula.match(/"([^"]+)"/);
                    if (urlMatch) {
                        url = urlMatch[1];
                    }
                } else {
                    const richText = paymentCell.getRichTextValue();
                    const link = richText ? richText.getLinkUrl(0) : null;
                    url = link || '';
                }
            } catch (e) {
                console.log(`createPaymentHyperlinks: Ошибка при чтении платежа: ${e}`);
            }
            
            if (displayValue && url) {
                payments.push({ name: displayValue.toLowerCase(), url: url, display: displayValue });
            }
        }
        
        // Теперь парсим текст платежей и создаём Rich Text с гиперссылками
        const paymentList = paymentText.split(',').map(p => p.trim()).filter(p => p);
        let richTextBuilder = SpreadsheetApp.newRichTextValue().setText(paymentText);
        
        let currentIndex = 0;
        paymentList.forEach(paymentName => {
            const paymentLower = paymentName.toLowerCase();
            const paymentData = payments.find(p => p.name === paymentLower);
            
            if (paymentData && paymentData.url) {
                const startIndex = paymentText.indexOf(paymentName, currentIndex);
                const endIndex = startIndex + paymentName.length;
                richTextBuilder = richTextBuilder.setLinkUrl(startIndex, endIndex, paymentData.url);
                currentIndex = endIndex;
            }
        });
        
        cell.setRichTextValue(richTextBuilder.build());
    } catch (error) {
        console.error(`createPaymentHyperlinks: Ошибка: ${error}`);
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
    console.log(`escapeValue: Входное значение: ${value} (тип: ${typeof value})`);
    const result = (value === undefined || value === null) ? '' : String(value).trim();
    console.log(`escapeValue: Преобразовано в строку: ${result}`);
    return result;
}

function formatNumber(value) {
    console.log(`formatNumber: Входное значение: ${value} (тип: ${typeof value})`);
    if (!value) {
        console.log("formatNumber: Пустое значение, возвращаем пустую строку");
        return '';
    }
    const num = Number(value);
    if (isNaN(num)) {
        console.log("formatNumber: Не число, возвращаем исходное значение");
        return value;
    }
    const result = num.toLocaleString('ru-RU', { maximumFractionDigits: 2 });
    console.log(`formatNumber: Результат: "${result}"`);
    return result;
}

function reformatDate(dateInput) {
    console.log(`reformatDate: Входное значение: ${dateInput} (тип: ${typeof dateInput})`);
    let date;
    if (typeof dateInput === 'string' && dateInput) {
        // Попробуем разобрать дату в формате DD.MM.YYYY
        const parts = dateInput.split('.');
        if (parts.length === 3) {
            date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
        } else {
            date = new Date(dateInput);
        }
        if (isNaN(date.getTime())) {
            console.error(`reformatDate: Неверный формат строки даты: ${dateInput}`);
            return dateInput;
        }
    } else if (dateInput instanceof Date) {
        date = dateInput;
    } else {
        console.error(`reformatDate: Неверный тип данных: ${dateInput}`);
        return '';
    }
    const options = {
        timeZone: 'Europe/Moscow',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    };
    const formatted = date.toLocaleString('ru-RU', options).replace(/,/, '');
    console.log(`reformatDate: Результат: ${formatted}`);
    return formatted;
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

    const result = linkArray.join(', ');
    console.log(`formatLinks: Входное значение: ${value}, Результат: ${result}`);
    return result;
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
