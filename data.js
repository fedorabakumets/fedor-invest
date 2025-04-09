// data.js
// Констаdddddddddddddddddddнты
const COLUMN_KEYS = [
    'Название сайта',
    'Дата создания',
    'Минимальная сумма для вывода средств',
    'Реферальная система',
    'Сложность',
    'Платежные системы',
    'Типы работы',
    'Сайты с отзывами'
];
const DIFFICULTY_ORDER = { Легкая: 1, Средняя: 2, Сложная: 3 };
const DEFAULT_PROTOCOL = 'https://';
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxNttG89h44eLI84rD7xgH3kgToreZDS_g1gXItL89cVNQgquxZ90fhapdbG-U0USjC/exec?action=getAllData';
const MAX_CHANGES_TO_SHOW = 5;

// Утилиты для работы с текстом
function decodeHTMLEntities(text) {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text ?? '';
    return textarea.value;
}

function escapeHTML(text) {
    const tempDiv = document.createElement('div');
    tempDiv.textContent = text ?? '';
    return tempDiv.innerHTML;
}

function normalizeText(text, columnIndex) {
    if (typeof text !== 'string' || !text.trim()) return '';
    const decodedText = decodeHTMLEntities(text).trim();
    if (columnIndex === 1) {
        if (/^\d{4}$/.test(decodedText)) return decodedText;
        return decodedText;
    }
    if (columnIndex === 2) {
        return /^\d+(\.\d+)?$/.test(decodedText) ? parseFloat(decodedText) : decodedText;
    }
    return decodedText.charAt(0).toUpperCase() + decodedText.slice(1);
}

function createLinkElement(text) {
    if (!text || !text.trim()) return document.createTextNode('');
    const decodedText = decodeHTMLEntities(text);
    const parts = decodedText.split(/\s+/).filter(part => part);
    const container = document.createElement('span');
    parts.forEach((part, index) => {
        const urlPattern = /^(https?:\/\/[^\s]+|www\.[^\s]+|[^\s]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?)$/i;
        if (urlPattern.test(part)) {
            let url = part;
            url = url.match(/^[a-zA-Z]+:\/\//) ? url : `${DEFAULT_PROTOCOL}${url}`;
            try {
                new URL(url);
                const link = document.createElement('a');
                link.href = url;
                link.target = '_blank';
                link.rel = 'noopener noreferrer nofollow';
                link.textContent = escapeHTML(part);
                container.appendChild(link);
            } catch {
                container.appendChild(document.createTextNode(escapeHTML(part)));
            }
        } else {
            container.appendChild(document.createTextNode(escapeHTML(part)));
        }
        if (index < parts.length - 1) container.appendChild(document.createTextNode(' '));
    });
    return container;
}

// Парсинг данных для таблицы
function parseTableJSON(json) {
    if (!json || !Array.isArray(json.sites)) return [];
    return json.sites.map(row => ({
        [COLUMN_KEYS[0]]: row.site || '',
        [COLUMN_KEYS[1]]: normalizeText(row.dateCreated || '', 1),
        [COLUMN_KEYS[2]]: normalizeText(row.minAmount || '', 2),
        [COLUMN_KEYS[3]]: normalizeText(row.referral || '', 3),
        [COLUMN_KEYS[4]]: normalizeText(row.difficulty || '', 4),
        [COLUMN_KEYS[5]]: Array.isArray(row.payments) ? row.payments.map(item => normalizeText(item, 5)).join('\n') : '',
        [COLUMN_KEYS[6]]: Array.isArray(row.workTypes) ? row.workTypes.map(item => normalizeText(item, 6)).join('\n') : '',
        [COLUMN_KEYS[7]]: row.reviewSites || ''
    })).filter(row => row[COLUMN_KEYS[0]]);
}

// Парсинг данных для фильтров
function parseFilterJSON(json) {
    if (!json || !Array.isArray(json.sites)) return { payments: [], work: [] };
    const payments = [...new Set(json.sites.flatMap(row => Array.isArray(row.payments) ? row.payments : []).map(item => normalizeText(item, 5)).filter(Boolean))].sort();
    const work = [...new Set(json.sites.flatMap(row => Array.isArray(row.workTypes) ? row.workTypes : []).map(item => normalizeText(item, 6)).filter(Boolean))].sort();
    return { payments, work };
}

// Экспорт
window.dataModule = {
    COLUMN_KEYS,
    DIFFICULTY_ORDER,
    DEFAULT_PROTOCOL,
    GOOGLE_APPS_SCRIPT_URL,
    MAX_CHANGES_TO_SHOW,
    decodeHTMLEntities,
    escapeHTML,
    normalizeText,
    createLinkElement,
    parseTableJSON,
    parseFilterJSON
};
