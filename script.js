// Константы для конфигурации приложения
const DEFAULT_PROTOCOL = 'https://'; // Базовый протокол для ссылок, если он не указан в URL
const COLUMN_KEYS = [ // Массив ключей столбцов таблицы, соответствует заголовкам
    'Название сайта', 'Дата создания', 'Минимальная сумма вывода',
    'Реферальная система', 'Сложность регистрации', 'Платежные системы',
    'Тип работы', 'Отзывы'
];
const DIFFICULTY_ORDER = { Легкая: 1, Средняя: 2, Сложная: 3 }; // Порядок сортировки по сложности регистрации
const TABLE_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQGnixVAvnj2eKui4co3sdcSCLSXJDIUIGW9GblUhrUJLzIyDRQWyZISHnuNnCMAXTkV2wJfXmao0qP/pub?gid=1897875028&single=true&output=csv'; // URL для загрузки данных таблицы в формате CSV
const FILTERS_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQGnixVAvnj2eKui4co3sdcSCLSXJDIUIGW9GblUhrUJLzIyDRQWyZISHnuNnCMAXTkV2wJfXmao0qP/pub?gid=2048557735&single=true&output=csv'; // URL для загрузки данных фильтров в формате CSV
const SUPPORTED_LOCALES = ['ru-RU', 'en-US', 'fr-FR']; // Поддерживаемые локали для форматирования даты и чисел
const RETRY_DELAYS = [1000, 2000, 4000]; // Задержки в миллисекундах для повторных попыток загрузки данных

// Объект состояния приложения
const appState = {
    tableData: [], // Текущие данные таблицы после фильтрации и сортировки
    originalTableData: [], // Исходные данные таблицы без изменений
    sort: { column: -1, direction: 1 }, // Состояние сортировки: индекс столбца и направление (1 - по возрастанию, -1 - по убыванию)
    filters: { payments: [], work: [] }, // Выбранные фильтры для платежных систем и типов работы
    locale: 'ru-RU', // Текущая локаль для форматирования
    theme: 'light', // Текущая тема (light или dark)
    user: null, // Информация о пользователе (не используется в текущем коде)
    page: 1, // Текущая страница пагинации
    rowsPerPage: 10, // Количество строк на странице
    logs: [], // Журнал ошибок
    lastUpdated: null, // Дата последнего обновления данных
    latestUpdateFromH: null, // Самая поздняя дата из столбца отзывов
    filterStates: { paymentFilters: true, workFilters: true }, // Состояние сворачивания/разворачивания фильтров
    fontSize: 1 // Текущий масштаб шрифта в rem
};

// Экранирование HTML для предотвращения XSS
function escapeHTML(text) {
    const tempDiv = document.createElement('div'); // Создает временный div для преобразования текста
    tempDiv.textContent = text ?? ''; // Устанавливает текст, заменяя null/undefined на пустую строку
    return tempDiv.innerHTML; // Возвращает экранированный HTML (например, < становится &lt;)
}

// Нормализация текста для единообразного отображения
function normalizeText(text) {
    if (typeof text !== 'string' || !text.trim()) return ''; // Если не строка или пустая, возвращает пустую строку
    const trimmed = text.trim(); // Убирает лишние пробелы
    if (/^\d{4}$/.test(trimmed)) { // Проверка на год (четыре цифры)
        const year = parseInt(trimmed, 10);
        if (year >= 1900 && year <= 2099) return trimmed; // Возвращает год, если он в допустимом диапазоне
    }
    const datePattern = /^(\d{2}\.\d{2}\.\d{4}|\d{4}-\d{2}-\d{2})$/; // Шаблон для даты (дд.мм.гггг или гггг-мм-дд)
    if (datePattern.test(trimmed)) {
        const date = new Date(trimmed.split('.').reverse().join('-') || trimmed); // Преобразует строку в объект Date
        if (!isNaN(date.getTime())) return date.toLocaleString(appState.locale, { dateStyle: 'short' }); // Форматирует дату в коротком стиле
    }
    if (/^\d+(\.\d+)?$/.test(trimmed)) return new Intl.NumberFormat(appState.locale).format(parseFloat(trimmed)); // Форматирует числа с учетом локали
    const urlPattern = /^(https?:\/\/[^\s]+|www\.[^\s]+|[^\s]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?)$/i; // Шаблон для URL
    if (urlPattern.test(trimmed)) return trimmed; // Возвращает URL без изменений
    const normalized = trimmed.replace(/\s+/g, ' '); // Заменяет множественные пробелы на один
    return normalized.length > 0 ? normalized.charAt(0).toUpperCase() + normalized.slice(1) : ''; // Делает первую букву заглавной
}

// Создание элемента ссылки из текста
function createLinkElement(text) {
    if (!text || !text.trim()) return document.createTextNode(''); // Если текст пустой, возвращает пустой текстовый узел
    const urlPattern = /(https?:\/\/[^\s]+|www\.[^\s]+|[^\s]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?)/gi; // Шаблон для поиска URL
    const match = text.match(urlPattern); // Ищет URL в тексте
    if (match) {
        let url = match[0];
        try {
            url = url.match(/^[a-zA-Z]+:\/\//) ? url : `${DEFAULT_PROTOCOL}${url}`; // Добавляет протокол, если его нет
            new URL(url); // Проверяет валидность URL
            const domainMatch = url.match(/^(?:https?:\/\/)?(?:www\.)?([^\/]+)/i); // Извлекает домен
            const displayText = shortenSiteName(domainMatch ? domainMatch[1] : url); // Укорачивает имя сайта
            const link = document.createElement('a'); // Создает элемент ссылки
            link.href = url; // Устанавливает адрес ссылки
            link.target = '_blank'; // Открывает ссылку в новой вкладке
            link.rel = 'noopener noreferrer nofollow'; // Безопасность и запрет передачи реферера
            link.textContent = escapeHTML(displayText); // Устанавливает текст ссылки
            link.setAttribute('aria-label', `Visit ${displayText}`); // Описание для доступности
            link.dataset.tooltip = url; // Хранит полный URL для всплывающей подсказки
            return link;
        } catch {
            return document.createTextNode(escapeHTML(text)); // Если URL некорректен, возвращает текст
        }
    }
    return document.createTextNode(escapeHTML(text)); // Возвращает текст, если нет URL
}

// Укорачивание имени сайта для отображения
function shortenSiteName(site) {
    const match = site?.match(/^(?:.*\.)?([^.]+)\.[a-zA-Z]{2,}(?:\/|$)/); // Извлекает основное имя домена
    return match ? match[1] : site || ''; // Возвращает имя или исходную строку
}

// Асинхронная загрузка данных с повторными попытками
async function fetchWithRetry(url, retries = 3) {
    for (let i = 0; i < retries; i++) { // Цикл повторных попыток
        try {
            const response = await fetch(url, { cache: 'force-cache' }); // Запрос с принудительным кэшированием
            if (!response.ok) throw new Error(`HTTP ${response.status}`); // Ошибка, если статус не 200
            const text = await response.text(); // Получение текстового ответа
            if (navigator.serviceWorker) caches.open('table-cache').then(cache => cache.put(url, new Response(text))); // Сохранение в кэш
            appState.lastUpdated = new Date(); // Обновление времени последнего запроса
            updateLastUpdated(); // Обновление отображения времени
            return text; // Возвращает полученный текст
        } catch (error) {
            if (i === retries - 1) { // Если последняя попытка
                const cached = await caches.match(url); // Проверка кэша
                if (cached) return cached.text(); // Возвращает кэшированные данные
                logError(`Не удалось загрузить данные: ${error.message}`); // Логирование ошибки
                throw error; // Выбрасывает ошибку
            }
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAYS[i])); // Задержка перед следующей попыткой
        }
    }
}

// Парсинг CSV для данных таблицы
function parseCSV(csv) {
    const rows = csv.trim().split('\n').map(row => // Разделяет CSV на строки и обрабатывает каждую
        row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(cell => cell.trim().replace(/^"|"$/g, '')) // Разделяет строку на ячейки, убирает кавычки
    );
    if (rows.length < 2) return []; // Возвращает пустой массив, если данных нет
    const datesInH = rows.slice(1).map(row => { // Извлекает даты из столбца отзывов
        const dateStr = row[7] ? row[7].trim() : '';
        const date = new Date(dateStr.split('.').reverse().join('-') || dateStr);
        return isNaN(date.getTime()) ? null : date; // Возвращает null, если дата некорректна
    }).filter(date => date !== null);
    appState.latestUpdateFromH = datesInH.length > 0 ? new Date(Math.max(...datesInH)) : null; // Самая поздняя дата
    return rows.slice(1).map(row => ({ // Преобразует строки в объекты с ключами COLUMN_KEYS
        [COLUMN_KEYS[0]]: row[0] || '', // Название сайта
        [COLUMN_KEYS[1]]: normalizeText(row[1] || ''), // Дата создания
        [COLUMN_KEYS[2]]: normalizeText(row[2] || ''), // Минимальная сумма вывода
        [COLUMN_KEYS[3]]: normalizeText(row[3] || ''), // Реферальная система
        [COLUMN_KEYS[4]]: normalizeText(row[4] || ''), // Сложность регистрации
        [COLUMN_KEYS[5]]: row[5] ? row[5].split(/,\s*/).map(normalizeText).join('\n') : '', // Платежные системы (разделены переносами строки)
        [COLUMN_KEYS[6]]: row[6] ? row[6].split(/,\s*/).map(normalizeText).join('\n') : '', // Тип работы (разделены переносами строки)
        [COLUMN_KEYS[7]]: row[8] || '' // Отзывы
    })).filter(row => row[COLUMN_KEYS[0]]); // Фильтрует строки с непустым названием сайта
}

// Парсинг CSV для данных фильтров
function parseFilterCSV(csv) {
    const rows = csv.trim().split('\n').map(row => // Разделяет CSV на строки
        row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(cell => cell.trim().replace(/^"|"$/g, '')) // Разделяет на ячейки
    );
    if (rows.length < 2) return { payments: [], work: [] }; // Возвращает пустые массивы, если данных нет
    return {
        payments: [...new Set(rows.slice(1).map(row => normalizeText(row[1])).filter(Boolean))].sort(), // Уникальные платежные системы
        work: [...new Set(rows.slice(1).map(row => normalizeText(row[2])).filter(Boolean))].sort() // Уникальные типы работы
    };
}

// Отрисовка таблицы
function renderTable() {
    const tbody = document.getElementById('tableBody'); // Находит тело таблицы
    if (!tbody) {
        logError('Элемент таблицы не найден'); // Логирует ошибку, если элемент отсутствует
        return;
    }
    tbody.innerHTML = ''; // Очищает содержимое таблицы
    const start = (appState.page - 1) * appState.rowsPerPage; // Начальный индекс для пагинации
    const end = start + appState.rowsPerPage; // Конечный индекс
    const paginatedData = appState.tableData.slice(start, end); // Выборка данных для текущей страницы
    paginatedData.forEach(row => { // Проходит по данным
        const tr = document.createElement('tr'); // Создает строку таблицы
        for (let i = 0; i < COLUMN_KEYS.length - 1; i++) { // Добавляет ячейки, кроме последней
            tr.appendChild(createTableCell(row[COLUMN_KEYS[i]], i === 0 ? createLinkElement : undefined)); // Первая колонка как ссылка
        }
        const reviews = row[COLUMN_KEYS[7]]; // Получает отзывы
        const displayText = reviews || ''; // Текст для отображения
        tr.appendChild(createTableCell(displayText, createLinkElement)); // Добавляет ячейку с отзывами как ссылку
        tbody.appendChild(tr); // Добавляет строку в таблицу
    });
    animateRows(tbody); // Анимирует строки
    updatePaginationControls(); // Обновляет элементы пагинации
}

// Создание ячейки таблицы
function createTableCell(value, creator = (val => document.createTextNode(escapeHTML(val || 'Не указано')))) {
    const td = document.createElement('td'); // Создает ячейку таблицы
    td.appendChild(creator(value)); // Добавляет содержимое (по умолчанию текст, если не указана функция)
    if (value && /\d+(\.\d+)?/.test(value)) td.classList.add('numeric'); // Добавляет класс для чисел
    return td;
}

// Отрисовка фильтров
function renderFilters(filterData) {
    const containers = { // Объекты контейнеров для фильтров
        payment: document.getElementById('paymentContainer'),
        work: document.getElementById('workContainer')
    };
    Object.entries(containers).forEach(([type, container]) => { // Проходит по контейнерам
        if (!container) {
            logError(`Контейнер фильтров для ${type} не найден`); // Логирует ошибку
            return;
        }
        container.innerHTML = ''; // Очищает контейнер
        const items = filterData[type === 'payment' ? 'payments' : 'work']; // Выбирает данные фильтров
        if (items) {
            items.forEach((item, index) => { // Создает элементы для каждого фильтра
                const id = `${type}-${index}`; // Уникальный ID
                const label = document.createElement('label'); // Создает метку
                label.setAttribute('for', id); // Связывает метку с чекбоксом
                label.innerHTML = `<input type="checkbox" id="${id}" name="${type}" value="${item}" aria-label="${item}"><span>${escapeHTML(item)}</span>`; // Чекбокс и текст
                container.appendChild(label); // Добавляет метку в контейнер
            });
        }
    });
    document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.addEventListener('change', applyFilters)); // Добавляет слушатель для фильтров
    updateFilterCounts(); // Обновляет счетчики фильтров
}

// Сортировка таблицы
function sortTable(columnIndex) {
    if (appState.sort.column === columnIndex) appState.sort.direction *= -1; // Меняет направление, если тот же столбец
    else appState.sort.direction = 1; // Устанавливает по возрастанию для нового столбца
    appState.sort.column = columnIndex; // Сохраняет индекс столбца
    appState.tableData.sort((a, b) => { // Сортирует данные
        let aValue = a[COLUMN_KEYS[columnIndex]] || ''; // Значение первой строки
        let bValue = b[COLUMN_KEYS[columnIndex]] || ''; // Значение второй строки
        if (columnIndex === 7) { // Для отзывов берет первую строку
            aValue = aValue.split('\n')[0];
            bValue = bValue.split('\n')[0];
        }
        if ([0, 3, 7].includes(columnIndex)) return appState.sort.direction * aValue.localeCompare(bValue); // Сравнение строк
        if (columnIndex === 1) { // Сортировка по дате
            const aTime = Date.parse(aValue) || 0;
            const bTime = Date.parse(bValue) || 0;
            return appState.sort.direction * (aTime - bTime);
        }
        if (columnIndex === 2) return appState.sort.direction * (parseFloat(aValue) || 0 - parseFloat(bValue) || 0); // Сортировка по числам
        if (columnIndex === 4) return appState.sort.direction * ((DIFFICULTY_ORDER[aValue] || 0) - (DIFFICULTY_ORDER[bValue] || 0)); // Сортировка по сложности
        return appState.sort.direction * (aValue.split('\n').length - bValue.split('\n').length); // Сортировка по количеству элементов
    });
    updateArrow(columnIndex); // Обновляет стрелки сортировки
    renderTable(); // Перерисовывает таблицу
}

// Анимация строк таблицы
function animateRows(container) {
    container.querySelectorAll('tr').forEach((row, idx) => { // Проходит по всем строкам
        row.style.opacity = '0'; // Начальная прозрачность
        row.style.transform = 'translateY(1rem)'; // Начальное смещение вниз
        setTimeout(() => { // Задержка для анимации
            row.style.transition = 'opacity 0.3s ease, transform 0.3s ease'; // Плавный переход
            row.style.opacity = '1'; // Полная видимость
            row.style.transform = 'translateY(0)'; // Возврат в исходное положение
        }, idx * 50); // Задержка увеличивается для каждой строки
    });
}

// Обновление стрелок сортировки
function updateArrow(columnIndex) {
    document.querySelectorAll('thead th .sort-icon').forEach((arrow, idx) => { // Проходит по всем стрелкам
        arrow.classList.toggle('active', idx === columnIndex); // Активирует текущую стрелку
        arrow.innerHTML = idx === columnIndex // Устанавливает иконку в зависимости от направления
            ? (appState.sort.direction === 1 ? '<i class="fas fa-sort-up"></i>' : '<i class="fas fa-sort-down"></i>')
            : '<i class="fas fa-sort"></i>';
    });
}

// Обновление элементов управления пагинацией
function updatePaginationControls() {
    const pagination = document.getElementById('pagination'); // Находит контейнер пагинации
    if (!pagination) {
        logError('Элемент пагинации не найден');
        return;
    }
    const totalPages = Math.ceil(appState.tableData.length / appState.rowsPerPage); // Общее количество страниц
    if (appState.tableData.length <= appState.rowsPerPage) { // Скрывает пагинацию, если данных мало
        pagination.style.display = 'none';
        return;
    }
    pagination.style.display = 'flex'; // Показывает пагинацию
    pagination.innerHTML = ` // Устанавливает HTML для пагинации
        ${appState.page > 3 ? '<button aria-label="Вернуться на первую страницу" onclick="changePageTo(1)">В начало</button>' : ''} // Кнопка "В начало", если страница > 3
        <button aria-label="Предыдущая страница" ${appState.page === 1 ? 'disabled' : ''} onclick="changePage(-1)">Назад</button> // Кнопка "Назад"
        <span>Страница ${appState.page} из ${totalPages}</span> // Текущая страница и общее количество
        <button aria-label="Следующая страница" ${appState.page === totalPages ? 'disabled' : ''} onclick="changePage(1)">Вперед</button> // Кнопка "Вперед"
        <select onchange="changeRowsPerPage(this.value)" aria-label="Строк на странице"> // Выбор количества строк
            ${[10, 25, 50, 100].map(n => `<option value="${n}" ${n === appState.rowsPerPage ? 'selected' : ''}>${n}</option>`).join('')} // Варианты строк
        </select>
    `;
    addSwipeListeners(); // Добавляет слушатели для свайпов
}

// Обновление времени последнего обновления
function updateLastUpdated() {
    const timestampElement = document.getElementById('updateTimestamp'); // Находит элемент времени
    if (timestampElement && appState.lastUpdated) {
        timestampElement.textContent = appState.lastUpdated.toLocaleString(appState.locale, { dateStyle: 'medium', timeStyle: 'short' }); // Форматирует и отображает время
    }
}

// Обновление счетчиков фильтров
function updateFilterCounts() {
    document.querySelectorAll('.filter-toggle .filter-count').forEach(count => { // Проходит по всем счетчикам
        const type = count.closest('.filter-section').id === 'paymentFilters' ? 'payments' : 'work'; // Определяет тип фильтра
        count.textContent = appState.filters[type].length; // Устанавливает количество выбранных фильтров
    });
}

// Применение фильтров
function applyFilters() {
    const selectedPayments = Array.from(document.querySelectorAll('input[name="payment"]:checked')).map(cb => cb.value); // Выбранные платежные системы
    const selectedWork = Array.from(document.querySelectorAll('input[name="work"]:checked')).map(cb => cb.value); // Выбранные типы работы
    appState.filters.payments = selectedPayments; // Сохраняет выбранные фильтры
    appState.filters.work = selectedWork;
    let filteredData = [...appState.originalTableData]; // Копия исходных данных
    if (selectedPayments.length > 0) { // Фильтрация по платежным системам
        filteredData = filteredData.filter(row => {
            const payments = row[COLUMN_KEYS[5]].split('\n').map(item => item.trim());
            return selectedPayments.some(p => payments.includes(p));
        });
    }
    if (selectedWork.length > 0) { // Фильтрация по типам работы
        filteredData = filteredData.filter(row => {
            const work = row[COLUMN_KEYS[6]].split('\n').map(item => item.trim());
            return selectedWork.some(w => work.includes(w));
        });
    }
    appState.tableData = filteredData; // Обновляет данные таблицы
    appState.page = 1; // Сбрасывает страницу
    renderTable(); // Перерисовывает таблицу
    updateFilterCounts(); // Обновляет счетчики
}

// Смена страницы
function changePage(delta) {
    appState.page = Math.max(1, Math.min(appState.page + delta, Math.ceil(appState.tableData.length / appState.rowsPerPage))); // Изменяет страницу в пределах допустимого
    renderTable(); // Перерисовывает таблицу
}

// Переход на конкретную страницу
function changePageTo(page) {
    appState.page = page; // Устанавливает страницу
    renderTable(); // Перерисовывает таблицу
}

// Изменение количества строк на странице
function changeRowsPerPage(value) {
    appState.rowsPerPage = parseInt(value, 10); // Устанавливает новое количество строк
    appState.page = 1; // Сбрасывает страницу
    renderTable(); // Перерисовывает таблицу
}

// Показ сообщения об ошибке
function showError(message, isCritical = false) {
    const errorContainer = document.getElementById('errorContainer'); // Находит контейнер ошибки
    const errorText = errorContainer.querySelector('.error-text'); // Находит текст ошибки
    if (errorContainer && errorText) {
        errorText.textContent = message; // Устанавливает текст
        errorContainer.classList.remove('hide'); // Убирает класс скрытия
        errorContainer.classList.add('show', isCritical ? 'critical' : 'warning'); // Показывает с нужным классом
        setTimeout(() => hideError(), window.innerWidth <= 480 ? 7000 : 5000); // Скрывает через 5-7 секунд
    }
}

// Скрытие сообщения об ошибке
function hideError() {
    const errorContainer = document.getElementById('errorContainer');
    if (errorContainer) {
        errorContainer.classList.add('hide'); // Добавляет класс скрытия
        errorContainer.addEventListener('animationend', () => { // Ждет конца анимации
            errorContainer.classList.remove('show', 'critical', 'warning'); // Убирает классы отображения
        }, { once: true }); // Слушатель одноразовый
    }
}

// Логирование ошибок
function logError(message) {
    appState.logs.push({ timestamp: new Date().toISOString(), message }); // Добавляет ошибку в журнал
    showError(message); // Показывает сообщение
}

// Установка темы
function setTheme(theme) {
    appState.theme = theme; // Сохраняет тему
    document.documentElement.setAttribute('data-theme', theme); // Устанавливает атрибут темы
    localStorage.setItem('theme', theme); // Сохраняет в локальное хранилище
    document.getElementById('themeToggleMobile').textContent = theme === 'light' ? '🌙' : '☀'; // Обновляет иконку кнопки
}

// Изменение размера шрифта
function adjustFontSize(delta) {
    appState.fontSize = Math.max(0.8, Math.min(1.5, appState.fontSize + delta)); // Изменяет размер в пределах 0.8-1.5
    document.documentElement.style.fontSize = `${appState.fontSize}rem`; // Устанавливает размер шрифта
    localStorage.setItem('fontSize', appState.fontSize); // Сохраняет в локальное хранилище
}

// Добавление слушателей свайпов
function addSwipeListeners() {
    const tableSection = document.querySelector('.table-section'); // Находит секцию таблицы
    let touchStartX = 0; // Начальная координата X
    let touchEndX = 0; // Конечная координата X
    tableSection.addEventListener('touchstart', e => touchStartX = e.changedTouches[0].screenX); // Записывает начало касания
    tableSection.addEventListener('touchend', e => { // Обрабатывает конец касания
        touchEndX = e.changedTouches[0].screenX;
        if (touchStartX - touchEndX > 50) changePage(1); // Свайп влево - следующая страница
        if (touchEndX - touchStartX > 50) changePage(-1); // Свайп вправо - предыдущая страница
    });
}

// Инициализация приложения
async function init() {
    try {
        const [tableCsv, filterCsv] = await Promise.all([ // Загружает данные таблицы и фильтров параллельно
            fetchWithRetry(TABLE_CSV_URL),
            fetchWithRetry(FILTERS_CSV_URL)
        ]);
        appState.originalTableData = parseCSV(tableCsv); // Парсит данные таблицы
        appState.tableData = [...appState.originalTableData]; // Копирует исходные данные
        const filterData = parseFilterCSV(filterCsv); // Парсит данные фильтров
        renderTable(); // Отрисовывает таблицу
        renderFilters(filterData); // Отрисовывает фильтры
        setTheme(localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')); // Устанавливает тему
        appState.fontSize = parseFloat(localStorage.getItem('fontSize')) || 1; // Загружает размер шрифта
        document.documentElement.style.fontSize = `${appState.fontSize}rem`; // Применяет размер шрифта

        setInterval(() => fetchWithRetry(TABLE_CSV_URL).then(csv => { // Обновляет данные каждые 30 секунд
            appState.originalTableData = parseCSV(csv);
            appState.tableData = [...appState.originalTableData];
            applyFilters(); // Применяет текущие фильтры
        }), 30000);

        // Добавление слушателей событий
        document.getElementById('resetFilters').addEventListener('click', () => { // Сброс фильтров
            document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false); // Снимает все галочки
            appState.filters.payments = [];
            appState.filters.work = [];
            appState.tableData = [...appState.originalTableData];
            appState.page = 1;
            updateFilterCounts(); // Обновляет счетчики
            renderTable();
        });

        document.getElementById('themeSwitch').addEventListener('change', e => setTheme(e.target.value)); // Смена темы через выбор
        document.getElementById('fontSizeIncrease').addEventListener('click', () => adjustFontSize(0.1)); // Увеличение шрифта
        document.getElementById('fontSizeDecrease').addEventListener('click', () => adjustFontSize(-0.1)); // Уменьшение шрифта
        document.getElementById('themeToggleMobile').addEventListener('click', () => setTheme(appState.theme === 'light' ? 'dark' : 'light')); // Переключение темы
        document.querySelectorAll('.filter-toggle').forEach(toggle => { // Сворачивание/разворачивание фильтров
            toggle.addEventListener('click', () => {
                const filterSection = toggle.closest('.filter-section');
                const sectionId = filterSection.id;
                filterSection.classList.toggle('collapsed');
                appState.filterStates[sectionId] = !filterSection.classList.contains('collapsed');
                toggle.setAttribute('aria-expanded', appState.filterStates[sectionId]);
            });
        });
        document.querySelector('.error-close').addEventListener('click', hideError); // Закрытие сообщения об ошибке

        window.addEventListener('resize', () => { // Адаптация количества строк при изменении размера окна
            appState.rowsPerPage = Math.max(10, Math.min(100, Math.floor(window.innerHeight / 50)));
            renderTable();
        });
    } catch (error) {
        logError(`Ошибка инициализации: ${error.message}`); // Логирует ошибку инициализации
    }
}

// Запуск приложения после загрузки DOM
document.addEventListener('DOMContentLoaded', init);
