// Состояние настроек (будет импортировано из основного файла или передано как глобальная переменная)
const appState = window.appState || {
    settings: {
        general: {
            backgroundColorStart: '#f5f5f5',
            backgroundColorEnd: '#add8e6',
            backgroundAnimation: true,
            defaultFontSize: 16,
            containerMaxWidth: 1400,
            containerBorderRadius: 15,
            containerShadow: true,
            headerColor: '#0066cc',
            introTextColor: '#333',
            introBgOpacity: 0.9
        },
        buttons: {
            buttonSize: 16,
            buttonColor: '#ffffff',
            buttonBgColor: '#0066cc',
            buttonHoverScale: 1.02,
            buttonAnimation: 'pulse',
            buttonBorderRadius: 5,
            buttonShadow: true,
            showButtonLabels: true,
            buttonPaddingX: 15,
            buttonPaddingY: 8,
            buttonBorderWidth: 0,
            buttonBorderColor: '#0066cc',
            buttonHoverColor: '#00ff99',
            buttonHoverBgColor: '#0066cc',
            buttonFontWeight: 400,
            buttonTransitionSpeed: 0.3,
            buttonPulseSpeed: 2,
            buttonSpinSpeed: 2,
            buttonIconSize: 14,
            buttonGap: 8,
            buttonIcon: 'fas fa-cog'
        },
        table: {
            tableBorderWidth: 3,
            tableShadow: true,
            rowHoverEffect: true,
            columnWidthDistribution: 'auto',
            tableBgColor: '#f9f9f9',
            tableBorderColor: '#0066cc',
            headerBgColorStart: '#3333ff',
            headerBgColorEnd: '#00ff99',
            cellPaddingX: 15,
            cellPaddingY: 12,
            cellBorderWidth: 2,
            cellBorderColor: '#e0e0e0',
            oddRowBgColor: 'rgba(240, 248, 255, 0.85)',
            evenRowBgColor: 'rgba(255, 255, 255, 0.95)',
            tableRadius: 15,
            tableShadowSpread: 25,
            rowHoverScale: 1.05,
            rowHoverColor: 'rgba(173, 216, 230, 0.95)',
            headerFontSize: 16,
            cellFontSize: 14
        },
        filters: {
            filterColumns: 2,
            filterAnimation: true,
            filterHighlightColor: '#00ff99',
            filterBgColorStart: '#ffffff',
            filterBgColorEnd: '#d8bfd8',
            filterTextColor: '#444',
            filterPadding: 4,
            filterRadius: 8,
            filterShadow: true,
            filterToggleColor: '#0066cc',
            filterCountBgStart: '#00ff99',
            filterCountBgEnd: '#0066cc',
            filterHoverBg: 'rgba(0, 255, 153, 0.2)',
            filterFontSize: 14,
            filterGap: 5
        },
        animations: {
            enableBackgroundShift: true,
            enablePulseEffects: true,
            animationSpeedMultiplier: 1,
            backgroundShiftSpeed: 20,
            pulseSpeed: 5,
            bounceSpeed: 6,
            glowSpeed: 4,
            spinSpeed: 15,
            fadeSpeed: 1,
            shakeSpeed: 2,
            scaleSpeed: 3,
            rotateSpeed: 4,
            headerPulseSpeed: 3,
            cellBounceSpeed: 4,
            filterPulseSpeed: 3
        },
        text: {
            textColor: '#333',
            textShadow: true,
            textShadowColor: 'rgba(0, 0, 0, 0.3)',
            textShadowX: 2,
            textShadowY: 2,
            textShadowBlur: 4,
            headerFontSize: 32,
            introFontSize: 16,
            tableFontFamily: 'Roboto',
            filterFontFamily: 'Roboto'
        },
        pagination: {
            paginationBgOpacity: 0.1,
            paginationRadius: 8,
            paginationShadow: true,
            paginationGap: 10,
            paginationButtonSize: 12,
            paginationTextColor: '#333',
            paginationHoverScale: 1.1,
            paginationPulseSpeed: 2,
            paginationFontSize: 14,
            paginationPadding: 10
        },
        customButtonIcons: {
            themeToggle: 'fas fa-moon',
            viewToggle: 'fas fa-table',
            fontSizeIncrease: 'fas fa-plus',
            fontSizeDecrease: 'fas fa-minus',
            prevPage: 'fas fa-angle-left',
            nextPage: 'fas fa-angle-right',
            settings: 'fas fa-cog',
            resetFilters: 'fas fa-undo',
            pageFirst: 'fas fa-angle-double-left'
        },
        performanceLevels: {
            0: { animationsEnabled: false, effectsEnabled: false, transitionsEnabled: false, shadowsEnabled: false, gradientsEnabled: false },
            1: { animationsEnabled: true, effectsEnabled: false, transitionsEnabled: true, shadowsEnabled: true, gradientsEnabled: false },
            2: { animationsEnabled: true, effectsEnabled: true, transitionsEnabled: true, shadowsEnabled: true, gradientsEnabled: true },
            3: { animationsEnabled: true, effectsEnabled: true, transitionsEnabled: true, shadowsEnabled: true, gradientsEnabled: true },
            4: { animationsEnabled: true, effectsEnabled: true, transitionsEnabled: true, shadowsEnabled: true, gradientsEnabled: true }
        }
    }
};

// Применение настроек
function applySettings() {
    const { settings } = appState;
    const root = document.documentElement;

    // Общие настройки
    root.style.setProperty('--background-start', settings.general.backgroundColorStart);
    root.style.setProperty('--background-end', settings.general.backgroundColorEnd);
    root.style.setProperty('--default-font-size', `${settings.general.defaultFontSize}px`);
    root.style.setProperty('--container-max-width', `${settings.general.containerMaxWidth}px`);
    root.style.setProperty('--container-border-radius', `${settings.general.containerBorderRadius}px`);
    root.style.setProperty('--header-color', settings.general.headerColor);
    root.style.setProperty('--intro-text-color', settings.general.introTextColor);
    root.style.setProperty('--intro-bg-opacity', settings.general.introBgOpacity);
    document.querySelector('.container').style.boxShadow = settings.general.containerShadow ? '0 0 20px rgba(0, 0, 0, 0.2)' : 'none';

    // Настройки кнопок
    const buttons = document.querySelectorAll('button:not(.perf-btn):not(.rows-btn):not(.cols-btn):not(.cols-add-btn)');
    buttons.forEach(btn => {
        btn.style.fontSize = `${settings.buttons.buttonSize}px`;
        btn.style.color = settings.buttons.buttonColor;
        btn.style.background = `linear-gradient(90deg, ${settings.buttons.buttonBgColor}, ${settings.buttons.buttonHoverBgColor})`;
        btn.style.borderRadius = `${settings.buttons.buttonBorderRadius}px`;
        btn.style.boxShadow = settings.buttons.buttonShadow ? '0 2px 5px rgba(0, 0, 0, 0.2)' : 'none';
        btn.style.padding = `${settings.buttons.buttonPaddingY}px ${settings.buttons.buttonPaddingX}px`;
        btn.style.border = `${settings.buttons.buttonBorderWidth}px solid ${settings.buttons.buttonBorderColor}`;
        btn.style.fontWeight = settings.buttons.buttonFontWeight;
        btn.style.transition = `all ${settings.buttons.buttonTransitionSpeed}s ease`;
        btn.style.gap = `${settings.buttons.buttonGap}px`;

        const icon = btn.querySelector('i');
        const label = btn.querySelector('span:not(.range-value)') || btn.childNodes[btn.childNodes.length - 1];
        if (icon) {
            icon.style.fontSize = `${settings.buttons.buttonIconSize}px`;
            if (settings.customButtonIcons[btn.id]) {
                icon.className = settings.customButtonIcons[btn.id];
            }
        }
        if (label && label.nodeType === Node.TEXT_NODE) {
            const span = document.createElement('span');
            span.textContent = label.textContent;
            btn.replaceChild(span, label);
        }
        if (!settings.buttons.showButtonLabels && label && label.tagName === 'SPAN') {
            label.style.display = 'none';
        } else if (label && label.tagName === 'SPAN') {
            label.style.display = 'inline';
        }

        btn.onmouseover = () => {
            btn.style.transform = `scale(${settings.buttons.buttonHoverScale})`;
            btn.style.color = settings.buttons.buttonHoverColor;
        };
        btn.onmouseout = () => {
            btn.style.transform = 'scale(1)';
            btn.style.color = settings.buttons.buttonColor;
        };
    });

    // Настройки таблицы
    const table = document.getElementById('sitesTable');
    if (table) {
        table.style.border = `${settings.table.tableBorderWidth}px solid ${settings.table.tableBorderColor}`;
        table.style.boxShadow = settings.table.tableShadow ? `0 8px ${settings.table.tableShadowSpread}px rgba(0, 0, 0, 0.25)` : 'none';
        table.style.background = settings.table.tableBgColor;
        table.style.borderRadius = `${settings.table.tableRadius}px`;
        table.querySelectorAll('th').forEach(th => {
            th.style.background = `linear-gradient(90deg, ${settings.table.headerBgColorStart}, ${settings.table.headerBgColorEnd})`;
            th.style.fontSize = `${settings.table.headerFontSize}px`;
        });
        table.querySelectorAll('td').forEach(td => {
            td.style.padding = `${settings.table.cellPaddingY}px ${settings.table.cellPaddingX}px`;
            td.style.border = `${settings.table.cellBorderWidth}px solid ${settings.table.cellBorderColor}`;
            td.style.fontSize = `${settings.table.cellFontSize}px`;
            td.style.fontFamily = settings.text.tableFontFamily;
        });
        table.querySelectorAll('tbody tr:nth-child(odd)').forEach(tr => tr.style.background = settings.table.oddRowBgColor);
        table.querySelectorAll('tbody tr:nth-child(even)').forEach(tr => tr.style.background = settings.table.evenRowBgColor);
        if (settings.table.columnWidthDistribution === 'equal') {
            table.querySelectorAll('th, td').forEach(cell => cell.style.width = `${100 / COLUMN_KEYS.length}%`);
        }
    }

    // Настройки фильтров
    const filters = document.querySelector('.filters');
    if (filters) {
        filters.style.background = `linear-gradient(135deg, ${settings.filters.filterBgColorStart}, ${settings.filters.filterBgColorEnd})`;
        filters.style.padding = `${settings.filters.filterPadding}px`;
        filters.style.borderRadius = `${settings.filters.filterRadius}px`;
        filters.style.boxShadow = settings.filters.filterShadow ? '0 4px 10px rgba(0, 0, 0, 0.15)' : 'none';
        document.querySelectorAll('.filter-toggle').forEach(toggle => {
            toggle.style.color = settings.filters.filterToggleColor;
            toggle.querySelector('.filter-count').style.background = `linear-gradient(90deg, ${settings.filters.filterCountBgStart}, ${settings.filters.filterCountBgEnd})`;
        });
        document.querySelectorAll('.filter-section label').forEach(label => {
            label.style.color = settings.filters.filterTextColor;
            label.style.fontSize = `${settings.filters.filterFontSize}px`;
            label.style.fontFamily = settings.text.filterFontFamily;
            label.style.gap = `${settings.filters.filterGap}px`;
        });
    }

    // Настройки пагинации
    const pagination = document.getElementById('pagination');
    if (pagination) {
        pagination.style.background = `rgba(255, 255, 255, ${settings.pagination.paginationBgOpacity})`;
        pagination.style.borderRadius = `${settings.pagination.paginationRadius}px`;
        pagination.style.boxShadow = settings.pagination.paginationShadow ? '0 3px 10px rgba(0, 0, 0, 0.2)' : 'none';
        pagination.style.gap = `${settings.pagination.paginationGap}px`;
        pagination.style.padding = `${settings.pagination.paginationPadding}px`;
        pagination.querySelectorAll('button').forEach(btn => {
            btn.style.padding = `${settings.pagination.paginationButtonSize}px`;
        });
        pagination.querySelector('#pageInfo').style.color = settings.pagination.paginationTextColor;
        pagination.querySelector('#pageInfo').style.fontSize = `${settings.pagination.paginationFontSize}px`;
    }

    // Настройки текста
    document.body.style.color = settings.text.textColor;
    document.querySelector('h1').style.fontSize = `${settings.text.headerFontSize}px`;
    document.querySelector('.intro p').style.fontSize = `${settings.text.introFontSize}px`;
    document.body.style.textShadow = settings.text.textShadow ? `${settings.text.textShadowX}px ${settings.text.textShadowY}px ${settings.text.textShadowBlur}px ${settings.text.textShadowColor}` : 'none';

    // Динамическое обновление стилей анимации
    const styleSheet = document.createElement('style');
    styleSheet.innerHTML = `
        body {
            animation: ${settings.animations.enableBackgroundShift ? `backgroundShift ${settings.animations.backgroundShiftSpeed * settings.animations.animationSpeedMultiplier}s infinite alternate` : 'none'},
                       ${settings.animations.enablePulseEffects ? `backgroundPulse ${settings.animations.pulseSpeed * settings.animations.animationSpeedMultiplier}s infinite` : 'none'};
        }
        button:not(.perf-btn):not(.rows-btn):not(.cols-btn):not(.cols-add-btn) {
            animation: ${settings.buttons.buttonAnimation === 'pulse' ? `buttonPulse ${settings.buttons.buttonPulseSpeed * settings.animations.animationSpeedMultiplier}s infinite` : 
                       settings.buttons.buttonAnimation === 'spin' ? `buttonSpin ${settings.buttons.buttonSpinSpeed * settings.animations.animationSpeedMultiplier}s infinite` : 'none'};
        }
        @keyframes buttonPulse {
            0% { transform: scale(1); }
            50% { transform: scale(${settings.buttons.buttonHoverScale}); }
            100% { transform: scale(1); }
        }
        @keyframes buttonSpin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        @keyframes backgroundShift {
            0% { background: linear-gradient(135deg, ${settings.general.backgroundColorStart}, ${settings.general.backgroundColorEnd}); }
            50% { background: linear-gradient(135deg, ${settings.general.backgroundColorEnd}, ${settings.general.backgroundColorStart}); }
            100% { background: linear-gradient(135deg, ${settings.general.backgroundColorStart}, ${settings.general.backgroundColorEnd}); }
        }
        @keyframes backgroundPulse {
            0% { filter: brightness(1); }
            50% { filter: brightness(1.05); }
            100% { filter: brightness(1); }
        }
    `;
    document.head.appendChild(styleSheet);
}

// Отрисовка панели настроек
function renderSettingsPanel() {
    const panel = document.getElementById('settingsPanel');
    const content = panel?.querySelector('.settings-content');
    if (!content) return;

    content.innerHTML = '';

    const sections = [
        {
            title: 'Общие настройки',
            settings: [
                { label: 'Начальный цвет фона', type: 'color', value: appState.settings.general.backgroundColorStart, key: 'general.backgroundColorStart', description: 'Начальный цвет градиента фона страницы' },
                { label: 'Конечный цвет фона', type: 'color', value: appState.settings.general.backgroundColorEnd, key: 'general.backgroundColorEnd', description: 'Конечный цвет градиента фона страницы' },
                { label: 'Анимация фона', type: 'checkbox', value: appState.settings.general.backgroundAnimation, key: 'general.backgroundAnimation', description: 'Включает анимацию смены фона' },
                { label: 'Базовый размер шрифта (px)', type: 'range', min: 12, max: 20, step: 1, value: appState.settings.general.defaultFontSize, key: 'general.defaultFontSize', description: 'Размер шрифта по умолчанию' },
                { label: 'Максимальная ширина контейнера (px)', type: 'number', min: 800, max: 2000, step: 10, value: appState.settings.general.containerMaxWidth, key: 'general.containerMaxWidth', description: 'Ширина основного контейнера' },
                { label: 'Радиус углов контейнера (px)', type: 'number', min: 0, max: 30, step: 1, value: appState.settings.general.containerBorderRadius, key: 'general.containerBorderRadius', description: 'Скругление углов контейнера' },
                { label: 'Тень контейнера', type: 'checkbox', value: appState.settings.general.containerShadow, key: 'general.containerShadow', description: 'Добавляет тень вокруг контейнера' },
                { label: 'Цвет заголовка', type: 'color', value: appState.settings.general.headerColor, key: 'general.headerColor', description: 'Цвет основного заголовка' },
                { label: 'Цвет текста введения', type: 'color', value: appState.settings.general.introTextColor, key: 'general.introTextColor', description: 'Цвет текста введения' },
                { label: 'Прозрачность фона введения', type: 'range', min: 0, max: 1, step: 0.1, value: appState.settings.general.introBgOpacity, key: 'general.introBgOpacity', description: 'Прозрачность фона текста введения' }
            ]
        },
        {
            title: 'Настройки кнопок',
            settings: [
                { label: 'Размер шрифта кнопок (px)', type: 'range', min: 10, max: 30, step: 1, value: appState.settings.buttons.buttonSize, key: 'buttons.buttonSize', description: 'Размер текста на кнопках' },
                { label: 'Цвет текста кнопок', type: 'color', value: appState.settings.buttons.buttonColor, key: 'buttons.buttonColor', description: 'Цвет текста кнопок' },
                { label: 'Цвет фона кнопок', type: 'color', value: appState.settings.buttons.buttonBgColor, key: 'buttons.buttonBgColor', description: 'Начальный цвет фона кнопок' },
                { label: 'Масштаб при наведении', type: 'number', min: 1, max: 1.5, step: 0.01, value: appState.settings.buttons.buttonHoverScale, key: 'buttons.buttonHoverScale', description: 'Увеличение кнопки при наведении' },
                { label: 'Тип анимации кнопок', type: 'select', options: ['none', 'pulse', 'spin'], value: appState.settings.buttons.buttonAnimation, key: 'buttons.buttonAnimation', description: 'Анимация кнопок' },
                { label: 'Радиус углов кнопок (px)', type: 'number', min: 0, max: 20, step: 1, value: appState.settings.buttons.buttonBorderRadius, key: 'buttons.buttonBorderRadius', description: 'Скругление углов кнопок' },
                { label: 'Тень кнопок', type: 'checkbox', value: appState.settings.buttons.buttonShadow, key: 'buttons.buttonShadow', description: 'Добавляет тень кнопкам' },
                { label: 'Показывать подписи кнопок', type: 'checkbox', value: appState.settings.buttons.showButtonLabels, key: 'buttons.showButtonLabels', description: 'Отображение текста на кнопках' },
                { label: 'Отступ по горизонтали (px)', type: 'number', min: 5, max: 30, step: 1, value: appState.settings.buttons.buttonPaddingX, key: 'buttons.buttonPaddingX', description: 'Отступ внутри кнопок по X' },
                { label: 'Отступ по вертикали (px)', type: 'number', min: 5, max: 20, step: 1, value: appState.settings.buttons.buttonPaddingY, key: 'buttons.buttonPaddingY', description: 'Отступ внутри кнопок по Y' },
                { label: 'Толщина границы (px)', type: 'number', min: 0, max: 5, step: 1, value: appState.settings.buttons.buttonBorderWidth, key: 'buttons.buttonBorderWidth', description: 'Толщина границы кнопок' },
                { label: 'Цвет границы', type: 'color', value: appState.settings.buttons.buttonBorderColor, key: 'buttons.buttonBorderColor', description: 'Цвет границы кнопок' },
                { label: 'Цвет текста при наведении', type: 'color', value: appState.settings.buttons.buttonHoverColor, key: 'buttons.buttonHoverColor', description: 'Цвет текста кнопок при наведении' },
                { label: 'Цвет фона при наведении', type: 'color', value: appState.settings.buttons.buttonHoverBgColor, key: 'buttons.buttonHoverBgColor', description: 'Цвет фона кнопок при наведении' },
                { label: 'Толщина шрифта', type: 'number', min: 100, max: 900, step: 100, value: appState.settings.buttons.buttonFontWeight, key: 'buttons.buttonFontWeight', description: 'Толщина шрифта кнопок' },
                { label: 'Скорость перехода (сек)', type: 'number', min: 0.1, max: 1, step: 0.1, value: appState.settings.buttons.buttonTransitionSpeed, key: 'buttons.buttonTransitionSpeed', description: 'Скорость изменения кнопок' },
                { label: 'Скорость пульсации (сек)', type: 'number', min: 1, max: 5, step: 0.5, value: appState.settings.buttons.buttonPulseSpeed, key: 'buttons.buttonPulseSpeed', description: 'Скорость анимации пульсации' },
                { label: 'Скорость вращения (сек)', type: 'number', min: 1, max: 5, step: 0.5, value: appState.settings.buttons.buttonSpinSpeed, key: 'buttons.buttonSpinSpeed', description: 'Скорость анимации вращения' },
                { label: 'Размер иконок (px)', type: 'range', min: 10, max: 20, step: 1, value: appState.settings.buttons.buttonIconSize, key: 'buttons.buttonIconSize', description: 'Размер иконок в кнопках' },
                { label: 'Расстояние до текста (px)', type: 'number', min: 5, max: 15, step: 1, value: appState.settings.buttons.buttonGap, key: 'buttons.buttonGap', description: 'Расстояние между иконкой и текстом' }
            ]
        },
        {
            title: 'Настройки таблицы',
            settings: [
                { label: 'Толщина границы таблицы (px)', type: 'number', min: 0, max: 5, step: 1, value: appState.settings.table.tableBorderWidth, key: 'table.tableBorderWidth', description: 'Толщина внешней границы таблицы' },
                { label: 'Тень таблицы', type: 'checkbox', value: appState.settings.table.tableShadow, key: 'table.tableShadow', description: 'Добавляет тень вокруг таблицы' },
                { label: 'Эффект при наведении на строки', type: 'checkbox', value: appState.settings.table.rowHoverEffect, key: 'table.rowHoverEffect', description: 'Включает эффекты при наведении на строки' },
                { label: 'Распределение ширины колонок', type: 'select', options: ['auto', 'equal'], value: appState.settings.table.columnWidthDistribution, key: 'table.columnWidthDistribution', description: 'Как распределяется ширина колонок' },
                { label: 'Цвет фона таблицы', type: 'color', value: appState.settings.table.tableBgColor, key: 'table.tableBgColor', description: 'Основной цвет фона таблицы' },
                { label: 'Цвет границы таблицы', type: 'color', value: appState.settings.table.tableBorderColor, key: 'table.tableBorderColor', description: 'Цвет внешней границы таблицы' },
                { label: 'Начальный цвет заголовков', type: 'color', value: appState.settings.table.headerBgColorStart, key: 'table.headerBgColorStart', description: 'Начальный цвет фона заголовков' },
                { label: 'Конечный цвет заголовков', type: 'color', value: appState.settings.table.headerBgColorEnd, key: 'table.headerBgColorEnd', description: 'Конечный цвет фона заголовков' },
                { label: 'Отступ ячеек по X (px)', type: 'number', min: 5, max: 30, step: 1, value: appState.settings.table.cellPaddingX, key: 'table.cellPaddingX', description: 'Горизонтальный отступ в ячейках' },
                { label: 'Отступ ячеек по Y (px)', type: 'number', min: 5, max: 20, step: 1, value: appState.settings.table.cellPaddingY, key: 'table.cellPaddingY', description: 'Вертикальный отступ в ячейках' },
                { label: 'Толщина границы ячеек (px)', type: 'number', min: 0, max: 5, step: 1, value: appState.settings.table.cellBorderWidth, key: 'table.cellBorderWidth', description: 'Толщина границ ячеек' },
                { label: 'Цвет границы ячеек', type: 'color', value: appState.settings.table.cellBorderColor, key: 'table.cellBorderColor', description: 'Цвет границ внутри таблицы' },
                { label: 'Цвет нечетных строк', type: 'color', value: appState.settings.table.oddRowBgColor, key: 'table.oddRowBgColor', description: 'Цвет фона нечетных строк' },
                { label: 'Цвет четных строк', type: 'color', value: appState.settings.table.evenRowBgColor, key: 'table.evenRowBgColor', description: 'Цвет фона четных строк' },
                { label: 'Радиус углов таблицы (px)', type: 'number', min: 0, max: 30, step: 1, value: appState.settings.table.tableRadius, key: 'table.tableRadius', description: 'Скругление углов таблицы' },
                { label: 'Размах тени таблицы (px)', type: 'number', min: 10, max: 50, step: 5, value: appState.settings.table.tableShadowSpread, key: 'table.tableShadowSpread', description: 'Размер тени таблицы' },
                { label: 'Масштаб строки при наведении', type: 'number', min: 1, max: 1.2, step: 0.01, value: appState.settings.table.rowHoverScale, key: 'table.rowHoverScale', description: 'Увеличение строки при наведении' },
                { label: 'Цвет строки при наведении', type: 'color', value: appState.settings.table.rowHoverColor, key: 'table.rowHoverColor', description: 'Цвет фона строки при наведении' },
                { label: 'Размер шрифта заголовков (px)', type: 'range', min: 12, max: 20, step: 1, value: appState.settings.table.headerFontSize, key: 'table.headerFontSize', description: 'Размер текста в заголовках таблицы' },
                { label: 'Размер шрифта ячеек (px)', type: 'range', min: 10, max: 18, step: 1, value: appState.settings.table.cellFontSize, key: 'table.cellFontSize', description: 'Размер текста в ячейках таблицы' }
            ]
        },
        {
            title: 'Настройки фильтров',
            settings: [
                { label: 'Количество колонок фильтров', type: 'number', min: 1, max: 4, step: 1, value: appState.settings.filters.filterColumns, key: 'filters.filterColumns', description: 'Число колонок в фильтрах' },
                { label: 'Анимация фильтров', type: 'checkbox', value: appState.settings.filters.filterAnimation, key: 'filters.filterAnimation', description: 'Включает анимацию фильтров' },
                { label: 'Цвет выделения', type: 'color', value: appState.settings.filters.filterHighlightColor, key: 'filters.filterHighlightColor', description: 'Цвет выделения активных фильтров' },
                { label: 'Начальный цвет фона', type: 'color', value: appState.settings.filters.filterBgColorStart, key: 'filters.filterBgColorStart', description: 'Начальный цвет фона фильтров' },
                { label: 'Конечный цвет фона', type: 'color', value: appState.settings.filters.filterBgColorEnd, key: 'filters.filterBgColorEnd', description: 'Конечный цвет фона фильтров' },
                { label: 'Цвет текста', type: 'color', value: appState.settings.filters.filterTextColor, key: 'filters.filterTextColor', description: 'Цвет текста фильтров' },
                { label: 'Отступ фильтров (px)', type: 'number', min: 0, max: 10, step: 1, value: appState.settings.filters.filterPadding, key: 'filters.filterPadding', description: 'Внутренний отступ фильтров' },
                { label: 'Радиус углов (px)', type: 'number', min: 0, max: 20, step: 1, value: appState.settings.filters.filterRadius, key: 'filters.filterRadius', description: 'Скругление углов фильтров' },
                { label: 'Тень фильтров', type: 'checkbox', value: appState.settings.filters.filterShadow, key: 'filters.filterShadow', description: 'Добавляет тень фильтрам' },
                { label: 'Цвет заголовков', type: 'color', value: appState.settings.filters.filterToggleColor, key: 'filters.filterToggleColor', description: 'Цвет заголовков фильтров' },
                { label: 'Начальный цвет счетчика', type: 'color', value: appState.settings.filters.filterCountBgStart, key: 'filters.filterCountBgStart', description: 'Начальный цвет фона счетчика' },
                { label: 'Конечный цвет счетчика', type: 'color', value: appState.settings.filters.filterCountBgEnd, key: 'filters.filterCountBgEnd', description: 'Конечный цвет фона счетчика' },
                { label: 'Цвет фона при наведении', type: 'color', value: appState.settings.filters.filterHoverBg, key: 'filters.filterHoverBg', description: 'Цвет фона фильтров при наведении' },
                { label: 'Размер шрифта (px)', type: 'range', min: 10, max: 18, step: 1, value: appState.settings.filters.filterFontSize, key: 'filters.filterFontSize', description: 'Размер текста фильтров' },
                { label: 'Расстояние между элементами (px)', type: 'number', min: 0, max: 10, step: 1, value: appState.settings.filters.filterGap, key: 'filters.filterGap', description: 'Расстояние между чекбоксом и текстом' }
            ]
        },
        {
            title: 'Настройки анимаций',
            settings: [
                { label: 'Сдвиг фона', type: 'checkbox', value: appState.settings.animations.enableBackgroundShift, key: 'animations.enableBackgroundShift', description: 'Включает анимацию сдвига фона' },
                { label: 'Эффекты пульсации', type: 'checkbox', value: appState.settings.animations.enablePulseEffects, key: 'animations.enablePulseEffects', description: 'Включает эффекты пульсации' },
                { label: 'Множитель скорости', type: 'number', min: 0.5, max: 2, step: 0.1, value: appState.settings.animations.animationSpeedMultiplier, key: 'animations.animationSpeedMultiplier', description: 'Ускоряет или замедляет анимации' },
                { label: 'Скорость сдвига фона (сек)', type: 'number', min: 5, max: 30, step: 1, value: appState.settings.animations.backgroundShiftSpeed, key: 'animations.backgroundShiftSpeed', description: 'Скорость анимации фона' },
                { label: 'Скорость пульсации (сек)', type: 'number', min: 1, max: 10, step: 1, value: appState.settings.animations.pulseSpeed, key: 'animations.pulseSpeed', description: 'Скорость пульсации фона' },
                { label: 'Скорость отскока (сек)', type: 'number', min: 1, max: 10, step: 1, value: appState.settings.animations.bounceSpeed, key: 'animations.bounceSpeed', description: 'Скорость эффекта отскока' },
                { label: 'Скорость свечения (сек)', type: 'number', min: 1, max: 10, step: 1, value: appState.settings.animations.glowSpeed, key: 'animations.glowSpeed', description: 'Скорость эффекта свечения' },
                { label: 'Скорость вращения (сек)', type: 'number', min: 5, max: 20, step: 1, value: appState.settings.animations.spinSpeed, key: 'animations.spinSpeed', description: 'Скорость вращения фона' },
                { label: 'Скорость затухания (сек)', type: 'number', min: 0.5, max: 3, step: 0.1, value: appState.settings.animations.fadeSpeed, key: 'animations.fadeSpeed', description: 'Скорость эффекта затухания' },
                { label: 'Скорость дрожания (сек)', type: 'number', min: 1, max: 5, step: 0.5, value: appState.settings.animations.shakeSpeed, key: 'animations.shakeSpeed', description: 'Скорость эффекта дрожания' },
                { label: 'Скорость масштабирования (сек)', type: 'number', min: 1, max: 5, step: 0.5, value: appState.settings.animations.scaleSpeed, key: 'animations.scaleSpeed', description: 'Скорость эффекта масштабирования' },
                { label: 'Скорость поворота (сек)', type: 'number', min: 1, max: 5, step: 0.5, value: appState.settings.animations.rotateSpeed, key: 'animations.rotateSpeed', description: 'Скорость эффекта поворота' },
                { label: 'Скорость пульсации заголовков (сек)', type: 'number', min: 1, max: 5, step: 0.5, value: appState.settings.animations.headerPulseSpeed, key: 'animations.headerPulseSpeed', description: 'Скорость пульсации заголовков таблицы' },
                { label: 'Скорость отскока ячеек (сек)', type: 'number', min: 1, max: 5, step: 0.5, value: appState.settings.animations.cellBounceSpeed, key: 'animations.cellBounceSpeed', description: 'Скорость отскока ячеек таблицы' },
                { label: 'Скорость пульсации фильтров (сек)', type: 'number', min: 1, max: 5, step: 0.5, value: appState.settings.animations.filterPulseSpeed, key: 'animations.filterPulseSpeed', description: 'Скорость пульсации фильтров' }
            ]
        },
        {
            title: 'Настройки текста',
            settings: [
                { label: 'Основной цвет текста', type: 'color', value: appState.settings.text.textColor, key: 'text.textColor', description: 'Цвет текста на странице' },
                { label: 'Тень текста', type: 'checkbox', value: appState.settings.text.textShadow, key: 'text.textShadow', description: 'Добавляет тень тексту' },
                { label: 'Цвет тени текста', type: 'color', value: appState.settings.text.textShadowColor, key: 'text.textShadowColor', description: 'Цвет тени текста' },
                { label: 'Смещение тени по X (px)', type: 'number', min: 0, max: 10, step: 1, value: appState.settings.text.textShadowX, key: 'text.textShadowX', description: 'Смещение тени по горизонтали' },
                { label: 'Смещение тени по Y (px)', type: 'number', min: 0, max: 10, step: 1, value: appState.settings.text.textShadowY, key: 'text.textShadowY', description: 'Смещение тени по вертикали' },
                { label: 'Размытие тени (px)', type: 'number', min: 0, max: 10, step: 1, value: appState.settings.text.textShadowBlur, key: 'text.textShadowBlur', description: 'Размытие тени текста' },
                { label: 'Размер шрифта заголовка (px)', type: 'range', min: 20, max: 40, step: 1, value: appState.settings.text.headerFontSize, key: 'text.headerFontSize', description: 'Размер шрифта заголовка H1' },
                { label: 'Размер шрифта введения (px)', type: 'range', min: 12, max: 20, step: 1, value: appState.settings.text.introFontSize, key: 'text.introFontSize', description: 'Размер текста введения' },
                { label: 'Шрифт таблицы', type: 'select', options: ['Roboto', 'Arial', 'Times New Roman'], value: appState.settings.text.tableFontFamily, key: 'text.tableFontFamily', description: 'Шрифт текста в таблице' },
                { label: 'Шрифт фильтров', type: 'select', options: ['Roboto', 'Arial', 'Times New Roman'], value: appState.settings.text.filterFontFamily, key: 'text.filterFontFamily', description: 'Шрифт текста в фильтрах' }
            ]
        },
        {
            title: 'Настройки пагинации',
            settings: [
                { label: 'Прозрачность фона', type: 'range', min: 0, max: 1, step: 0.1, value: appState.settings.pagination.paginationBgOpacity, key: 'pagination.paginationBgOpacity', description: 'Прозрачность фона пагинации' },
                { label: 'Радиус углов (px)', type: 'number', min: 0, max: 20, step: 1, value: appState.settings.pagination.paginationRadius, key: 'pagination.paginationRadius', description: 'Скругление углов пагинации' },
                { label: 'Тень пагинации', type: 'checkbox', value: appState.settings.pagination.paginationShadow, key: 'pagination.paginationShadow', description: 'Добавляет тень пагинации' },
                { label: 'Расстояние между кнопками (px)', type: 'number', min: 5, max: 20, step: 1, value: appState.settings.pagination.paginationGap, key: 'pagination.paginationGap', description: 'Расстояние между элементами' },
                { label: 'Размер кнопок (px)', type: 'number', min: 5, max: 20, step: 1, value: appState.settings.pagination.paginationButtonSize, key: 'pagination.paginationButtonSize', description: 'Размер кнопок пагинации' },
                { label: 'Цвет текста', type: 'color', value: appState.settings.pagination.paginationTextColor, key: 'pagination.paginationTextColor', description: 'Цвет текста пагинации' },
                { label: 'Масштаб при наведении', type: 'number', min: 1, max: 1.5, step: 0.1, value: appState.settings.pagination.paginationHoverScale, key: 'pagination.paginationHoverScale', description: 'Увеличение кнопок при наведении' },
                { label: 'Скорость пульсации (сек)', type: 'number', min: 1, max: 5, step: 0.5, value: appState.settings.pagination.paginationPulseSpeed, key: 'pagination.paginationPulseSpeed', description: 'Скорость анимации пульсации' },
                { label: 'Размер шрифта (px)', type: 'range', min: 10, max: 18, step: 1, value: appState.settings.pagination.paginationFontSize, key: 'pagination.paginationFontSize', description: 'Размер текста пагинации' },
                { label: 'Отступ пагинации (px)', type: 'number', min: 5, max: 20, step: 1, value: appState.settings.pagination.paginationPadding, key: 'pagination.paginationPadding', description: 'Внешний отступ пагинации' }
            ]
        },
        {
            title: 'Иконки кнопок',
            settings: Object.entries(appState.settings.customButtonIcons).map(([key, value]) => ({
                label: key.replace(/([A-Z])/g, ' $1').toLowerCase().replace(/^./, str => str.toUpperCase()),
                type: 'text',
                value,
                key: `customButtonIcons.${key}`,
                description: `Иконка для кнопки ${key}`
            }))
        }
    ];

    sections.forEach(section => {
        const sectionDiv = document.createElement('div');
        sectionDiv.className = 'settings-section';
        const h3 = document.createElement('h3');
        h3.textContent = section.title;
        sectionDiv.appendChild(h3);

        section.settings.forEach(setting => {
            const label = document.createElement('label');
            label.textContent = `${setting.label}: `;
            const desc = document.createElement('span');
            desc.textContent = setting.description;
            desc.style.fontSize = '0.8em';
            desc.style.color = '#666';
            label.appendChild(desc);
            let input;

            switch (setting.type) {
                case 'range':
                    input = document.createElement('input');
                    input.type = 'range';
                    input.min = setting.min;
                    input.max = setting.max;
                    input.step = setting.step;
                    input.value = setting.value;
                    const rangeValue = document.createElement('span');
                    rangeValue.className = 'range-value';
                    rangeValue.textContent = setting.value;
                    input.addEventListener('input', () => {
                        rangeValue.textContent = input.value;
                        const keys = setting.key.split('.');
                        let obj = appState.settings;
                        for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
                        obj[keys[keys.length - 1]] = parseFloat(input.value);
                        applySettings();
                    });
                    label.appendChild(input);
                    label.appendChild(rangeValue);
                    break;
                case 'color':
                    input = document.createElement('input');
                    input.type = 'color';
                    input.value = setting.value;
                    input.addEventListener('change', () => {
                        const keys = setting.key.split('.');
                        let obj = appState.settings;
                        for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
                        obj[keys[keys.length - 1]] = input.value;
                        applySettings();
                    });
                    label.appendChild(input);
                    break;
                case 'number':
                    input = document.createElement('input');
                    input.type = 'number';
                    input.min = setting.min;
                    input.max = setting.max;
                    input.step = setting.step;
                    input.value = setting.value;
                    input.addEventListener('input', () => {
                        const keys = setting.key.split('.');
                        let obj = appState.settings;
                        for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
                        obj[keys[keys.length - 1]] = parseFloat(input.value);
                        applySettings();
                    });
                    label.appendChild(input);
                    break;
                case 'select':
                    input = document.createElement('select');
                    setting.options.forEach(option => {
                        const opt = document.createElement('option');
                        opt.value = option;
                        opt.textContent = option;
                        if (option === setting.value) opt.selected = true;
                        input.appendChild(opt);
                    });
                    input.addEventListener('change', () => {
                        const keys = setting.key.split('.');
                        let obj = appState.settings;
                        for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
                        obj[keys[keys.length - 1]] = input.value;
                        applySettings();
                    });
                    label.appendChild(input);
                    break;
                case 'checkbox':
                    input = document.createElement('input');
                    input.type = 'checkbox';
                    input.checked = setting.value;
                    input.addEventListener('change', () => {
                        const keys = setting.key.split('.');
                        let obj = appState.settings;
                        for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
                        obj[keys[keys.length - 1]] = input.checked;
                        applySettings();
                    });
                    label.insertBefore(input, label.firstChild);
                    break;
                case 'text':
                    input = document.createElement('input');
                    input.type = 'text';
                    input.value = setting.value;
                    input.addEventListener('input', () => {
                        const keys = setting.key.split('.');
                        let obj = appState.settings;
                        for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
                        obj[keys[keys.length - 1]] = input.value;
                        applySettings();
                    });
                    label.appendChild(input);
                    break;
            }
            sectionDiv.appendChild(label);
        });
        content.appendChild(sectionDiv);
    });
}

// Открытие/закрытие панели настроек
function toggleSettingsPanel() {
    const panel = document.getElementById('settingsPanel');
    if (panel) {
        panel.classList.toggle('hidden');
        if (!panel.classList.contains('hidden')) {
            renderSettingsPanel();
        }
    }
}

// Сохранение настроек
function saveSettings() {
    localStorage.setItem('settings', JSON.stringify(appState.settings));
    toggleSettingsPanel();
}

// Экспорт функций для использования в основном файле
window.settingsModule = {
    applySettings,
    renderSettingsPanel,
    toggleSettingsPanel,
    saveSettings
};
const settings = {
    theme: "light",
    fontSize: 16
};
