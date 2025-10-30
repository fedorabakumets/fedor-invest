// ui.js
// Отрисовка таблицы
function renderTable() {
    const tbody = document.getElementById('tableBody');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const table = document.getElementById('sitesTable');
    if (!tbody || !loadingIndicator || !table) return;

    loadingIndicator.style.display = window.appState.isLoading ? 'block' : 'none';
    tbody.innerHTML = '';

    if (window.appState.isLoading) return;

    const start = (window.appState.page - 1) * window.appState.rowsPerPage;
    const end = start + window.appState.rowsPerPage;
    const paginatedData = window.appState.tableData.slice(start, end);

    if (window.appState.view === 'cards') {
        table.style.setProperty('--cols', window.appState.colsPerRow);
        const columns = Array.from({ length: window.appState.colsPerRow }, () => []);
        paginatedData.forEach((row, index) => {
            columns[index % window.appState.colsPerRow].push(row);
        });

        columns.forEach((columnData) => {
            const colDiv = document.createElement('div');
            colDiv.className = 'card-column';
            columnData.forEach(row => {
                const tr = document.createElement('tr');
                for (let i = 0; i < window.dataModule.COLUMN_KEYS.length; i++) {
                    let displayValue = row[window.dataModule.COLUMN_KEYS[i]];
                    if (i === 2 && typeof displayValue === 'number') {
                        displayValue = new Intl.NumberFormat('ru-RU').format(displayValue);
                    }
                    tr.appendChild(createTableCell(displayValue, i, i === 0 || i === 7 ? window.dataModule.createLinkElement : undefined));
                }
                colDiv.appendChild(tr);
            });
            tbody.appendChild(colDiv);
        });
    } else {
        paginatedData.forEach(row => {
            const tr = document.createElement('tr');
            for (let i = 0; i < window.dataModule.COLUMN_KEYS.length; i++) {
                let displayValue = row[window.dataModule.COLUMN_KEYS[i]];
                if (i === 2 && typeof displayValue === 'number') {
                    displayValue = new Intl.NumberFormat('ru-RU').format(displayValue);
                }
                tr.appendChild(createTableCell(displayValue, i, i === 0 || i === 7 ? window.dataModule.createLinkElement : undefined));
            }
            tbody.appendChild(tr);
        });
    }
    updatePaginationControls();
    window.settingsModule.applySettings();
}

// Создание ячейки таблицы
function createTableCell(value, columnIndex, creator) {
    const td = document.createElement('td');
    if (creator) {
        td.appendChild(creator(value));
    } else {
        td.textContent = value || 'Не указано';
    }
    td.setAttribute('data-label', window.dataModule.COLUMN_KEYS[columnIndex]);
    return td;
}

// Отрисовка фильтров
function renderFilters(filterData) {
    const containers = {
        payment: {
            left: document.querySelector('#paymentContainer .filter-column-left'),
            right: document.querySelector('#paymentContainer .filter-column-right')
        },
        work: {
            left: document.querySelector('#workContainer .filter-column-left'),
            right: document.querySelector('#workContainer .filter-column-right')
        }
    };
    Object.entries(containers).forEach(([type, cols]) => {
        if (!cols.left || !cols.right) return;
        cols.left.innerHTML = '';
        cols.right.innerHTML = '';
        const items = filterData[type === 'payment' ? 'payments' : 'work'];
        if (items) {
            const half = Math.ceil(items.length / 2);
            const leftItems = items.slice(0, half);
            const rightItems = items.slice(half);
            leftItems.forEach((item, index) => {
                const id = `${type}-left-${index}`;
                const label = document.createElement('label');
                label.setAttribute('for', id);
                label.innerHTML = `<input aria-label="${item}" id="${id}" name="${type}" type="checkbox" value="${item}"/>${window.dataModule.escapeHTML(item)}`;
                cols.left.appendChild(label);
            });
            rightItems.forEach((item, index) => {
                const id = `${type}-right-${index}`;
                const label = document.createElement('label');
                label.setAttribute('for', id);
                label.innerHTML = `<input aria-label="${item}" id="${id}" name="${type}" type="checkbox" value="${item}"/>${window.dataModule.escapeHTML(item)}`;
                cols.right.appendChild(label);
            });
        }
    });
    document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.addEventListener('change', window.logicModule.applyFilters));
    updateFilterCounts();
}

// Обновление пагинации
function updatePaginationControls() {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;
    const totalPages = Math.ceil(window.appState.tableData.length / window.appState.rowsPerPage);
    const pageInfo = document.getElementById('pageInfo');
    const pageFirst = document.getElementById('pageFirst');
    const pagePrev = document.getElementById('pagePrev');
    const pageNext = document.getElementById('pageNext');

    if (window.appState.tableData.length <= window.appState.rowsPerPage || window.appState.isLoading) {
        pagination.style.display = 'none';
        return;
    }
    pagination.style.display = 'flex';
    pageInfo.textContent = `Страница ${window.appState.page} из ${totalPages}`;
    pageFirst.disabled = window.appState.page === 1;
    pagePrev.disabled = window.appState.page === 1;
    pageNext.disabled = window.appState.page === totalPages;

    document.querySelectorAll('.rows-btn').forEach(btn => {
        btn.classList.toggle('active', parseInt(btn.dataset.rows) === window.appState.rowsPerPage);
    });
    document.querySelectorAll('.cols-btn').forEach(btn => {
        btn.classList.toggle('active', parseInt(btn.dataset.cols) === window.appState.colsPerRow);
    });
}

// Обновление списка последних изменений
function updateLastChanges() {
    const changesList = document.getElementById('changesList');
    if (!changesList) return;
    changesList.innerHTML = '';
    if (!window.appState.lastChanges.length) {
        const li = document.createElement('li');
        li.textContent = 'Изменений пока нет';
        changesList.appendChild(li);
        return;
    }
    const changesToShow = window.appState.lastChanges.slice(-window.dataModule.MAX_CHANGES_TO_SHOW).reverse();
    changesToShow.forEach(change => {
        const li = document.createElement('li');
        const date = new Date(change.timestamp.replace(' ', 'T'));
        const formattedTime = date.toLocaleString('ru-RU', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }).replace(',', '');
        const siteLink = window.dataModule.createLinkElement(change.site || 'неизвестный сайт');
        li.appendChild(document.createTextNode(`Сайт `));
        li.appendChild(siteLink);
        li.appendChild(document.createTextNode(` обновлен ${formattedTime}`));
        changesList.appendChild(li);
    });
}

// Обновление счётчиков фильтров
function updateFilterCounts() {
    document.querySelectorAll('.filter-toggle .filter-count').forEach(count => {
        const type = count.closest('.filter-section').id === 'paymentFilters' ? 'payments' : 'work';
        count.textContent = window.appState.filters[type].length;
    });
}

// Экспорт
window.uiModule = {
    renderTable,
    createTableCell,
    renderFilters,
    updatePaginationControls,
    updateLastChanges,
    updateFilterCounts
};
