// logic.js
// Сортировка таблицы
function sortTable(columnIndex) {
    if (window.appState.sort.column === columnIndex) window.appState.sort.direction *= -1;
    else window.appState.sort.direction = 1;
    window.appState.sort.column = columnIndex;

    window.appState.tableData.sort((a, b) => {
        let aValue = a[window.dataModule.COLUMN_KEYS[columnIndex]] || '';
        let bValue = b[window.dataModule.COLUMN_KEYS[columnIndex]] || '';
        if (columnIndex === 7) {
            aValue = aValue.split('\n')[0];
            bValue = bValue.split('\n')[0];
        }
        if ([0, 3, 7].includes(columnIndex)) {
            return window.appState.sort.direction * aValue.localeCompare(bValue);
        }
        if (columnIndex === 1) {
            const aTime = Date.parse(aValue) || 0;
            const bTime = Date.parse(bValue) || 0;
            return window.appState.sort.direction * (aTime - bTime);
        }
        if (columnIndex === 2) {
            const aNum = typeof aValue === 'number' ? aValue : 0;
            const bNum = typeof bValue === 'number' ? bValue : 0;
            return window.appState.sort.direction * (aNum - bNum);
        }
        if (columnIndex === 4) {
            return window.appState.sort.direction * ((window.dataModule.DIFFICULTY_ORDER[aValue] || 0) - (window.dataModule.DIFFICULTY_ORDER[bValue] || 0));
        }
        return window.appState.sort.direction * (aValue.split('\n').length - bValue.split('\n').length);
    });

    updateArrow(columnIndex);
    window.uiModule.renderTable();
}

// Обновление стрелок сортировки
function updateArrow(columnIndex) {
    const arrows = document.querySelectorAll('thead th .sort-icon');
    arrows.forEach((arrow, idx) => {
        arrow.classList.toggle('active', idx === columnIndex);
        arrow.innerHTML = idx === columnIndex
            ? (window.appState.sort.direction === 1 ? '<i class="fas fa-sort-up"></i>' : '<i class="fas fa-sort-down"></i>')
            : '<i class="fas fa-sort"></i>';
    });
}

// Применение фильтров
function applyFilters() {
    const selectedPayments = Array.from(document.querySelectorAll('input[name="payment"]:checked')).map(cb => cb.value);
    const selectedWork = Array.from(document.querySelectorAll('input[name="work"]:checked')).map(cb => cb.value);
    window.appState.filters.payments = selectedPayments;
    window.appState.filters.work = selectedWork;
    let filteredData = [...window.appState.originalTableData];
    if (selectedPayments.length > 0) {
        filteredData = filteredData.filter(row => selectedPayments.some(p => row[window.dataModule.COLUMN_KEYS[5]].split('\n').includes(p)));
    }
    if (selectedWork.length > 0) {
        filteredData = filteredData.filter(row => selectedWork.some(w => row[window.dataModule.COLUMN_KEYS[6]].split('\n').includes(w)));
    }
    window.appState.tableData = filteredData;
    window.appState.page = 1;
    window.uiModule.renderTable();
    window.uiModule.updateFilterCounts();
}

// Навигация по страницам
function changePage(delta) {
    const totalPages = Math.ceil(window.appState.tableData.length / window.appState.rowsPerPage);
    window.appState.page = Math.max(1, Math.min(window.appState.page + delta, totalPages));
    window.uiModule.renderTable();
}

function changePageTo(page) {
    window.appState.page = page;
    window.uiModule.renderTable();
}

// Изменение количества строк на странице
function changeRowsPerPage(value) {
    window.appState.rowsPerPage = parseInt(value, 10);
    window.appState.page = 1;
    window.uiModule.renderTable();
}

// Изменение количества колонок в карточном режиме
function changeColsPerRow(value) {
    window.appState.colsPerRow = parseInt(value, 10);
    window.uiModule.renderTable();
}

// Добавление новой колонки в карточный режим
function addColumn() {
    const colsToggle = document.querySelector('.cols-toggle');
    if (!colsToggle) return;
    const currentCols = document.querySelectorAll('.cols-btn:not(.cols-add-btn)').length;
    const newCols = currentCols + 1;
    const newBtn = document.createElement('button');
    newBtn.className = 'cols-btn';
    newBtn.dataset.cols = newCols;
    newBtn.innerHTML = `<span>${newCols}</span>`;
    newBtn.addEventListener('click', () => changeColsPerRow(newBtn.dataset.cols));
    colsToggle.insertBefore(newBtn, document.querySelector('.cols-add-btn'));
    changeColsPerRow(newCols);
}

// Переключение видимости последних изменений
function toggleLastChanges() {
    window.appState.isChangesVisible = !window.appState.isChangesVisible;
    const content = document.getElementById('lastChangesContent');
    if (content) {
        content.classList.toggle('hidden', !window.appState.isChangesVisible);
        const toggleBtn = document.getElementById('toggleLastChanges');
        const icon = toggleBtn?.querySelector('i');
        if (icon) {
            icon.className = window.appState.isChangesVisible ? 'fas fa-eye' : 'fas fa-eye-slash';
        }
    }
}

// Отображение ошибки
function showError(message) {
    const errorContainer = document.getElementById('errorContainer');
    const errorText = errorContainer?.querySelector('.error-text');
    if (errorText && errorContainer) {
        errorText.textContent = message;
        errorContainer.classList.add('show');
        setTimeout(hideError, 5000);
    }
}

// Скрытие ошибки
function hideError() {
    const errorContainer = document.getElementById('errorContainer');
    if (errorContainer) {
        errorContainer.classList.remove('show');
    }
}

// Переключение темы
function setTheme(theme) {
    window.appState.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    const icon = document.getElementById('themeToggle')?.querySelector('i');
    if (icon) {
        icon.className = theme === 'light' ? window.appState.settings.customButtonIcons.themeToggle : 'fas fa-sun';
    }
}

// Переключение вида (таблица/карточки)
function setView() {
    window.appState.view = window.appState.view === 'table' ? 'cards' : 'table';
    const tableSection = document.querySelector('.table-section');
    if (tableSection) {
        tableSection.style.opacity = '0';
        setTimeout(() => {
            tableSection.classList.toggle('cards-view', window.appState.view === 'cards');
            tableSection.style.opacity = '1';
            localStorage.setItem('view', window.appState.view);
            window.uiModule.renderTable();
            const icon = document.getElementById('viewToggle')?.querySelector('i');
            if (icon) {
                icon.className = window.appState.view === 'table' ? window.appState.settings.customButtonIcons.viewToggle : 'fas fa-th';
            }
        }, 300);
    }
}

// Изменение размера шрифта
function adjustFontSize(delta) {
    window.appState.fontSize = Math.max(0.8, Math.min(1.5, window.appState.fontSize + delta));
    document.documentElement.style.fontSize = `${window.appState.fontSize}rem`;
    localStorage.setItem('fontSize', window.appState.fontSize);
}

// Применение уровня производительности
function applyPerformanceLevel(level) {
    window.appState.performanceLevel = parseInt(level);
    const htmlRoot = document.getElementById('htmlRoot');
    if (htmlRoot) {
        htmlRoot.className = '';
        htmlRoot.classList.add(`performance-${level}`);
        document.querySelectorAll('.perf-btn').forEach(btn => {
            btn.classList.toggle('active', parseInt(btn.dataset.level) === window.appState.performanceLevel);
        });
        localStorage.setItem('performanceLevel', level);
        window.uiModule.renderTable();
    }
}

// Загрузка данных
async function fetchData() {
    const mockData = {
        success: true,
        lastChange: {
            timestamp: "2025-04-06 12:00:00",
            site: "example.com",
            parameter: "Название сайта",
            oldValue: "old.example.com",
            newValue: "example.com"
        },
        sites: [
            {
                site: "http://site.com",
                dateCreated: "2020",
                minAmount: "4",
                referral: "Да",
                difficulty: "Легкая",
                payments: ["Advacash", "WebMoney"],
                workTypes: ["Тесты"],
                reviewSites: "site.com, vk.ru"
            },
            {
                site: "http://example.com",
                dateCreated: "2021",
                minAmount: "5",
                referral: "Нет",
                difficulty: "Средняя",
                payments: ["Advacash", "Perfect Money"],
                workTypes: ["Серфинг"],
                reviewSites: "vk.com"
            }
        ],
        changes: [
            {
                timestamp: "2025-04-06 12:00:00",
                site: "example.com",
                parameter: "Название сайта",
                oldValue: "old.example.com",
                newValue: "example.com"
            }
        ]
    };
    try {
        const response = await fetch(window.dataModule.GOOGLE_APPS_SCRIPT_URL);
        if (!response.ok) throw new Error('Ошибка загрузки данных');
        const data = await response.json();
        return data.success ? data : mockData;
    } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
        showError('Не удалось загрузить данные. Используется локальная копия.');
        return mockData;
    }
}

// Инициализация приложения
async function init() {
    if (!window.appState) {
        window.appState = {
            tableData: [],
            originalTableData: [],
            sort: { column: -1, direction: 1 },
            filters: { payments: [], work: [] },
            theme: 'light',
            view: 'table',
            page: 1,
            rowsPerPage: 10,
            colsPerRow: 2,
            lastChanges: [],
            fontSize: 1,
            isChangesVisible: true,
            isLoading: true,
            performanceLevel: 2,
            settings: {}
        };
    }

    const savedTheme = localStorage.getItem('theme') || 'light';
    const savedView = localStorage.getItem('view') || 'table';
    const savedFontSize = localStorage.getItem('fontSize') || '1';
    const savedPerformanceLevel = localStorage.getItem('performanceLevel') || '2';
    const savedSettings = localStorage.getItem('settings');
    if (savedSettings) {
        Object.assign(window.appState.settings, JSON.parse(savedSettings));
    }

    setTheme(savedTheme);
    window.appState.view = savedView;
    document.querySelector('.table-section')?.classList.toggle('cards-view', savedView === 'cards');
    window.appState.fontSize = parseFloat(savedFontSize);
    document.documentElement.style.fontSize = `${window.appState.fontSize}rem`;
    applyPerformanceLevel(savedPerformanceLevel);

    const data = await fetchData();
    window.appState.tableData = window.dataModule.parseTableJSON(data);
    window.appState.originalTableData = [...window.appState.tableData];
    window.uiModule.renderFilters(window.dataModule.parseFilterJSON(data));
    window.appState.lastChanges = Array.isArray(data.changes) ? data.changes : [];
    window.uiModule.updateLastChanges();
    window.appState.isLoading = false;
    window.uiModule.renderTable();

    document.getElementById('toggleLastChanges')?.addEventListener('click', toggleLastChanges);
    document.getElementById('fontSizeIncrease')?.addEventListener('click', () => adjustFontSize(0.1));
    document.getElementById('fontSizeDecrease')?.addEventListener('click', () => adjustFontSize(-0.1));
    document.getElementById('themeToggle')?.addEventListener('click', () => setTheme(window.appState.theme === 'light' ? 'dark' : 'light'));
    document.getElementById('viewToggle')?.addEventListener('click', setView);
    document.getElementById('resetFilters')?.addEventListener('click', () => {
        document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
        applyFilters();
    });
    document.getElementById('pageFirst')?.addEventListener('click', () => changePageTo(1));
    document.getElementById('pagePrev')?.addEventListener('click', () => changePage(-1));
    document.getElementById('pageNext')?.addEventListener('click', () => changePage(1));
    document.querySelectorAll('.rows-btn').forEach(btn => btn.addEventListener('click', () => changeRowsPerPage(btn.dataset.rows)));
    document.querySelectorAll('.cols-btn').forEach(btn => btn.addEventListener('click', () => changeColsPerRow(btn.dataset.cols)));
    document.querySelector('.cols-add-btn')?.addEventListener('click', addColumn);
    document.querySelector('.error-close')?.addEventListener('click', hideError);
    document.querySelectorAll('.perf-btn').forEach(btn => btn.addEventListener('click', () => applyPerformanceLevel(btn.dataset.level)));
    document.getElementById('settingsBtn')?.addEventListener('click', window.settingsModule.toggleSettingsPanel);
    document.getElementById('closeSettings')?.addEventListener('click', window.settingsModule.toggleSettingsPanel);
    document.getElementById('saveSettings')?.addEventListener('click', window.settingsModule.saveSettings);

    document.querySelectorAll('thead th').forEach((th, index) => {
        th.addEventListener('click', () => sortTable(index));
    });
    document.querySelectorAll('.filter-toggle').forEach(toggle => {
        toggle.addEventListener('click', () => {
            const section = toggle.closest('.filter-section');
            section.classList.toggle('collapsed');
            const icon = toggle.querySelector('i');
            if (icon) {
                icon.className = section.classList.contains('collapsed') ? 'fas fa-chevron-down' : 'fas fa-chevron-up';
            }
        });
    });

    window.settingsModule.applySettings();
}

// Запуск приложения
document.addEventListener('DOMContentLoaded', init);

// Экспорт
window.logicModule = {
    sortTable,
    updateArrow,
    applyFilters,
    changePage,
    changePageTo,
    changeRowsPerPage,
    changeColsPerRow,
    addColumn,
    toggleLastChanges,
    showError,
    hideError,
    setTheme,
    setView,
    adjustFontSize,
    applyPerformanceLevel,
    fetchData,
    init
};
