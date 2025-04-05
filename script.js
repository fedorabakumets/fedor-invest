// Constants and State
const DEFAULT_PROTOCOL = 'https://';
const COLUMN_KEYS = [
    'Название сайта', 'Дата создания', 'Минимальная сумма вывода',
    'Реферальная система', 'Сложность регистрации', 'Платежные системы',
    'Тип работы', 'Отзывы'
];
const DIFFICULTY_ORDER = { Легкая: 1, Средняя: 2, Сложная: 3 };
const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbyHMz4-puevbpsWh2HVbGj4Ps35QBMP6XSchsyzTiDEwD4PNLF6cZ7IacIKpgOPuzd9/exec';
const SUPPORTED_LOCALES = ['ru-RU', 'en-US', 'fr-FR'];
const RETRY_DELAYS = [1000, 2000, 4000];

const appState = {
    tableData: [],
    originalTableData: [],
    sort: { column: -1, direction: 1 },
    filters: { payments: [], work: [] },
    locale: 'ru-RU',
    theme: 'light',
    user: null,
    page: 1,
    rowsPerPage: 10,
    logs: [],
    lastUpdated: null,
    filterStates: { paymentFilters: true, workFilters: true },
    fontSize: 1
};

// Utility Functions
function escapeHTML(text) {
    const tempDiv = document.createElement('div');
    tempDiv.textContent = text ?? '';
    return tempDiv.innerHTML;
}

function normalizeText(text) {
    if (typeof text !== 'string' || !text.trim()) return '';
    const trimmed = text.trim();
    if (/^\d{4}$/.test(trimmed)) {
        const year = parseInt(trimmed, 10);
        if (year >= 1900 && year <= 2099) return trimmed;
    }
    const datePattern = /^(\d{2}\.\d{2}\.\d{4}|\d{4}-\d{2}-\d{2})$/;
    if (datePattern.test(trimmed)) {
        const date = new Date(trimmed.split('.').reverse().join('-') || trimmed);
        if (!isNaN(date.getTime())) return date.toLocaleString(appState.locale, { dateStyle: 'short' });
    }
    if (/^\d+(\.\d+)?$/.test(trimmed)) return new Intl.NumberFormat(appState.locale).format(parseFloat(trimmed));
    const urlPattern = /^(https?:\/\/[^\s]+|www\.[^\s]+|[^\s]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?)$/i;
    if (urlPattern.test(trimmed)) return trimmed;
    const normalized = trimmed.replace(/\s+/g, ' ');
    return normalized.length > 0 ? normalized.charAt(0).toUpperCase() + normalized.slice(1) : '';
}

function createLinkElement(text) {
    if (!text || !text.trim()) return document.createTextNode('');
    const urlPattern = /(https?:\/\/[^\s]+|www\.[^\s]+|[^\s]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?)/gi;
    const match = text.match(urlPattern);
    if (match) {
        let url = match[0];
        try {
            url = url.match(/^[a-zA-Z]+:\/\//) ? url : `${DEFAULT_PROTOCOL}${url}`;
            new URL(url);
            const domainMatch = url.match(/^(?:https?:\/\/)?(?:www\.)?([^\/]+)/i);
            const displayText = shortenSiteName(domainMatch ? domainMatch[1] : url);
            const link = document.createElement('a');
            link.href = url;
            link.target = '_blank';
            link.rel = 'noopener noreferrer nofollow';
            link.textContent = escapeHTML(displayText);
            link.setAttribute('aria-label', `Visit ${displayText}`);
            link.dataset.tooltip = url;
            return link;
        } catch {
            return document.createTextNode(escapeHTML(text));
        }
    }
    return document.createTextNode(escapeHTML(text));
}

function shortenSiteName(site) {
    const match = site?.match(/^(?:.*\.)?([^.]+)\.[a-zA-Z]{2,}(?:\/|$)/);
    return match ? match[1] : site || '';
}

// Data Fetching
async function fetchWithRetry(url, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, { 
                headers: { 'Origin': window.location.origin }
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const json = await response.json();
            if (json.error) throw new Error(json.error);
            if (navigator.serviceWorker) caches.open('table-cache').then(cache => cache.put(url, new Response(JSON.stringify(json))));
            appState.lastUpdated = new Date(json.lastUpdate);
            return json;
        } catch (error) {
            if (i === retries - 1) {
                const cached = await caches.match(url);
                if (cached) return cached.json();
                logError(`Не удалось загрузить данные: ${error.message}`);
                throw error;
            }
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAYS[i]));
        }
    }
}

// Parsing
function parseData(json) {
    const sites = json.sites || [];
    appState.lastUpdated = new Date(json.lastUpdate);
    return sites.map(site => ({
        [COLUMN_KEYS[0]]: site.site || '',
        [COLUMN_KEYS[1]]: normalizeText(site.dateCreated || ''),
        [COLUMN_KEYS[2]]: normalizeText(site.minAmount || ''),
        [COLUMN_KEYS[3]]: normalizeText(site.referral || ''),
        [COLUMN_KEYS[4]]: normalizeText(site.difficulty || ''),
        [COLUMN_KEYS[5]]: site.payments ? site.payments.join('\n') : '',
        [COLUMN_KEYS[6]]: site.workTypes ? site.workTypes.join('\n') : '',
        [COLUMN_KEYS[7]]: normalizeText(site.lastModified || '')
    })).filter(row => row[COLUMN_KEYS[0]]);
}

// Rendering
function renderTable() {
    const tbody = document.getElementById('tableBody');
    if (!tbody) {
        logError('Элемент таблицы не найден');
        return;
    }
    tbody.innerHTML = '';
    const start = (appState.page - 1) * appState.rowsPerPage;
    const end = start + appState.rowsPerPage;
    const paginatedData = appState.tableData.slice(start, end);
    paginatedData.forEach(row => {
        const tr = document.createElement('tr');
        for (let i = 0; i < COLUMN_KEYS.length; i++) {
            tr.appendChild(createTableCell(row[COLUMN_KEYS[i]], i === 0 ? createLinkElement : undefined));
        }
        tbody.appendChild(tr);
    });
    animateRows(tbody);
    updatePaginationControls();
    updateLastUpdated();
}

function createTableCell(value, creator = (val => document.createTextNode(escapeHTML(val || 'Не указано')))) {
    const td = document.createElement('td');
    td.appendChild(creator(value));
    if (value && /\d+(\.\d+)?/.test(value)) td.classList.add('numeric');
    return td;
}

function renderFilters() {
    const containers = {
        payment: document.getElementById('paymentContainer'),
        work: document.getElementById('workContainer')
    };
    const filterData = {
        payments: [...new Set(appState.originalTableData.flatMap(row => row[COLUMN_KEYS[5]].split('\n').filter(Boolean)))].sort(),
        work: [...new Set(appState.originalTableData.flatMap(row => row[COLUMN_KEYS[6]].split('\n').filter(Boolean)))].sort()
    };
    Object.entries(containers).forEach(([type, container]) => {
        if (!container) {
            logError(`Контейнер фильтров для ${type} не найден`);
            return;
        }
        container.innerHTML = '';
        const items = filterData[type === 'payment' ? 'payments' : 'work'];
        items.forEach((item, index) => {
            const id = `${type}-${index}`;
            const label = document.createElement('label');
            label.setAttribute('for', id);
            label.innerHTML = `<input type="checkbox" id="${id}" name="${type}" value="${item}" aria-label="${item}"><span>${escapeHTML(item)}</span>`;
            container.appendChild(label);
        });
    });
    document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        cb.addEventListener('change', () => {
            applyFilters();
            updateFilterCounts();
        });
    });
    updateFilterCounts();
}

// Sorting
function sortTable(columnIndex) {
    if (appState.sort.column === columnIndex) appState.sort.direction *= -1;
    else appState.sort.direction = 1;
    appState.sort.column = columnIndex;
    appState.tableData.sort((a, b) => {
        let aValue = a[COLUMN_KEYS[columnIndex]] || '';
        let bValue = b[COLUMN_KEYS[columnIndex]] || '';
        if (columnIndex === 0) return appState.sort.direction * aValue.localeCompare(bValue);
        if (columnIndex === 1 || columnIndex === 7) {
            const aTime = Date.parse(aValue) || 0;
            const bTime = Date.parse(bValue) || 0;
            return appState.sort.direction * (aTime - bTime);
        }
        if (columnIndex === 2) return appState.sort.direction * (parseFloat(aValue) || 0 - parseFloat(bValue) || 0);
        if (columnIndex === 4) return appState.sort.direction * ((DIFFICULTY_ORDER[aValue] || 0) - (DIFFICULTY_ORDER[bValue] || 0));
        return appState.sort.direction * (aValue.split('\n').length - bValue.split('\n').length);
    });
    updateArrow(columnIndex);
    renderTable();
}

// UI Enhancements
function animateRows(container) {
    container.querySelectorAll('tr').forEach((row, idx) => {
        row.style.opacity = '0';
        row.style.transform = 'translateY(1rem)';
        setTimeout(() => {
            row.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            row.style.opacity = '1';
            row.style.transform = 'translateY(0)';
        }, idx * 50);
    });
}

function updateArrow(columnIndex) {
    document.querySelectorAll('thead th .sort-icon').forEach((arrow, idx) => {
        arrow.classList.toggle('active', idx === columnIndex);
        arrow.innerHTML = idx === columnIndex
            ? (appState.sort.direction === 1 ? '<i class="fas fa-sort-up"></i>' : '<i class="fas fa-sort-down"></i>')
            : '<i class="fas fa-sort"></i>';
    });
}

function updatePaginationControls() {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;
    const totalPages = Math.ceil(appState.tableData.length / appState.rowsPerPage);
    if (appState.tableData.length <= appState.rowsPerPage) {
        pagination.style.display = 'none';
        return;
    }
    pagination.style.display = 'flex';
    pagination.innerHTML = `
        ${appState.page > 3 ? '<button aria-label="Вернуться на первую страницу" onclick="changePageTo(1)">В начало</button>' : ''}
        <button aria-label="Предыдущая страница" ${appState.page === 1 ? 'disabled' : ''} onclick="changePage(-1)">Назад</button>
        <span>Страница ${appState.page} из ${totalPages}</span>
        <button aria-label="Следующая страница" ${appState.page === totalPages ? 'disabled' : ''} onclick="changePage(1)">Вперед</button>
        <select onchange="changeRowsPerPage(this.value)" aria-label="Строк на странице">
            ${[10, 25, 50, 100].map(n => `<option value="${n}" ${n === appState.rowsPerPage ? 'selected' : ''}>${n}</option>`).join('')}
        </select>
    `;
    addSwipeListeners();
}

function updateLastUpdated() {
    const timestampElement = document.getElementById('updateTimestamp');
    if (timestampElement && appState.lastUpdated) {
        timestampElement.textContent = appState.lastUpdated.toLocaleString(appState.locale, { dateStyle: 'medium', timeStyle: 'short' });
    } else if (timestampElement) {
        timestampElement.textContent = 'Дата неизвестна';
    }
}

function updateFilterCounts() {
    const paymentCount = appState.filters.payments.length;
    const workCount = appState.filters.work.length;
    document.querySelector('#paymentFilters .filter-count').textContent = paymentCount;
    document.querySelector('#workFilters .filter-count').textContent = workCount;
}

// Filters
function applyFilters() {
    const selectedPayments = Array.from(document.querySelectorAll('input[name="payment"]:checked')).map(cb => cb.value);
    const selectedWork = Array.from(document.querySelectorAll('input[name="work"]:checked')).map(cb => cb.value);
    appState.filters.payments = selectedPayments;
    appState.filters.work = selectedWork;
    let filteredData = [...appState.originalTableData];
    if (selectedPayments.length > 0) {
        filteredData = filteredData.filter(row => {
            const payments = row[COLUMN_KEYS[5]].split('\n').map(item => item.trim());
            return selectedPayments.some(p => payments.includes(p));
        });
    }
    if (selectedWork.length > 0) {
        filteredData = filteredData.filter(row => {
            const work = row[COLUMN_KEYS[6]].split('\n').map(item => item.trim());
            return selectedWork.some(w => work.includes(w));
        });
    }
    appState.tableData = filteredData;
    appState.page = 1;
    renderTable();
    updateFilterCounts();
}

// Event Handlers
function changePage(delta) {
    appState.page = Math.max(1, Math.min(appState.page + delta, Math.ceil(appState.tableData.length / appState.rowsPerPage)));
    renderTable();
}

function changePageTo(page) {
    appState.page = page;
    renderTable();
}

function changeRowsPerPage(value) {
    appState.rowsPerPage = parseInt(value, 10);
    appState.page = 1;
    renderTable();
}

// Error Handling
function showError(message, isCritical = false) {
    const errorContainer = document.getElementById('errorContainer');
    const errorText = errorContainer?.querySelector('.error-text');
    if (errorContainer && errorText) {
        errorText.textContent = message;
        errorContainer.classList.remove('hide');
        errorContainer.classList.add('show', isCritical ? 'critical' : 'warning');
        setTimeout(() => hideError(), window.innerWidth <= 480 ? 7000 : 5000);
    }
}

function hideError() {
    const errorContainer = document.getElementById('errorContainer');
    if (errorContainer) {
        errorContainer.classList.add('hide');
        errorContainer.addEventListener('animationend', () => {
            errorContainer.classList.remove('show', 'critical', 'warning');
        }, { once: true });
    }
}

function logError(message) {
    appState.logs.push({ timestamp: new Date().toISOString(), message });
    showError(message);
}

// Theme Switching
function setTheme(theme) {
    appState.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    document.getElementById('themeToggleMobile').textContent = theme === 'light' ? '🌙' : '☀';
}

// Font Size Control
function adjustFontSize(delta) {
    appState.fontSize = Math.max(0.8, Math.min(1.5, appState.fontSize + delta));
    document.documentElement.style.fontSize = `${appState.fontSize}rem`;
    localStorage.setItem('fontSize', appState.fontSize);
}

// Swipe Support
function addSwipeListeners() {
    const tableSection = document.querySelector('.table-section');
    let touchStartX = 0;
    let touchEndX = 0;
    tableSection.addEventListener('touchstart', e => touchStartX = e.changedTouches[0].screenX);
    tableSection.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        if (touchStartX - touchEndX > 50) changePage(1);
        if (touchEndX - touchStartX > 50) changePage(-1);
    });
}

// Initialization
async function init() {
    try {
        const json = await fetchWithRetry(WEB_APP_URL);
        appState.originalTableData = parseData(json);
        appState.tableData = [...appState.originalTableData];
        renderTable();
        renderFilters();
        setTheme(localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
        appState.fontSize = parseFloat(localStorage.getItem('fontSize')) || 1;
        document.documentElement.style.fontSize = `${appState.fontSize}rem`;

        // Периодическое обновление данных
        setInterval(async () => {
            const json = await fetchWithRetry(WEB_APP_URL);
            const newLastUpdate = new Date(json.lastUpdate);
            if (newLastUpdate > appState.lastUpdated) {
                appState.originalTableData = parseData(json);
                appState.tableData = [...appState.originalTableData];
                applyFilters();
                showError("Данные обновлены!", false);
            }
            appState.lastUpdated = newLastUpdate;
        }, 30000);

        document.getElementById('resetFilters').addEventListener('click', () => {
            document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
            appState.filters.payments = [];
            appState.filters.work = [];
            appState.tableData = [...appState.originalTableData];
            appState.page = 1;
            renderTable();
            updateFilterCounts();
        });

        document.getElementById('themeSwitch').addEventListener('change', e => setTheme(e.target.value));
        document.getElementById('fontSizeIncrease').addEventListener('click', () => adjustFontSize(0.1));
        document.getElementById('fontSizeDecrease').addEventListener('click', () => adjustFontSize(-0.1));
        document.getElementById('themeToggleMobile').addEventListener('click', () => setTheme(appState.theme === 'light' ? 'dark' : 'light'));
        document.querySelectorAll('.filter-toggle').forEach(toggle => {
            toggle.addEventListener('click', () => {
                const filterSection = toggle.closest('.filter-section');
                const sectionId = filterSection.id;
                filterSection.classList.toggle('collapsed');
                appState.filterStates[sectionId] = !filterSection.classList.contains('collapsed');
                toggle.setAttribute('aria-expanded', appState.filterStates[sectionId]);
            });
        });
        document.querySelector('.error-close').addEventListener('click', hideError);

        window.addEventListener('resize', () => {
            appState.rowsPerPage = Math.max(10, Math.min(100, Math.floor(window.innerHeight / 50)));
            renderTable();
        });
    } catch (error) {
        logError(`Ошибка инициализации: ${error.message}`);
    }
}

document.addEventListener('DOMContentLoaded', init);
