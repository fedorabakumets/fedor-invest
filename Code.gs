// Google Apps Script для автоматического отслеживания изменений в Google Sheets
// Используется для заполнения листа "Изменения" при редактировании основной таблицы

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
    const sheet = e.source.getActiveSheet();
    if (sheet.getSheetId() !== 1897875028) return;

    const range = e.range;
    const row = range.getRow();
    const col = range.getColumn();

    if (row === 1) return;
    
    // Проверка гиперссылок платежных систем (если редактируется колонна платежных систем)
    if (col === 5) {
        checkPaymentHyperlinks(e);
    }

    const ss = e.source;
    const changesSheet = ss.getSheetById(1531258534);
    if (!changesSheet) {
        console.error("onEdit: Лист изменений с gid=1531258534 не найден.");
        return;
    }

    const timestamp = getRussianDate();
    const site = escapeValue(sheet.getRange(row, 1).getValue());
    const parameter = escapeValue(sheet.getRange(1, col).getValue());
    const oldValue = escapeValue(e.oldValue || '');
    const newValue = escapeValue(range.getValue());

    // Добавляем в лист изменений
    const lastRow = changesSheet.getLastRow() + 1;
    changesSheet.getRange(lastRow, 1, 1, 5).setValues([[timestamp, site, parameter, oldValue, newValue]]);
}

function getRussianDate() {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`;
}

function escapeValue(value) {
    if (value === null || value === undefined) return '';
    return String(value).trim();
}
