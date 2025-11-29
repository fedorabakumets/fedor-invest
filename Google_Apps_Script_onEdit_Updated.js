// Обновленная функция onEdit для создания гиперссылок на платежи

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
        const paymentCell = changesSheet.getRange(lastRow, 5);
        createPaymentHyperlinks(paymentCell, newValue);
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
        let richTextBuilder = cell.getRichTextValue();
        
        if (!richTextBuilder) {
            // Создаём новый Rich Text с гиперссылками
            richTextBuilder = SpreadsheetApp.newRichTextValue().setText(paymentText);
        }
        
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
    return (value === undefined || value === null) ? '' : String(value).trim();
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
