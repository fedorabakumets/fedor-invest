// Google Apps Script для автоматического отслеживания изменений в Google Sheets
// Используется для заполнения листа "Изменения" при редактировании основной таблицы

function onEdit(e) {
    const sheet = e.source.getActiveSheet();
    if (sheet.getSheetId() !== 1897875028) return;

    const range = e.range;
    const row = range.getRow();
    const col = range.getColumn();

    if (row === 1) return;

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
