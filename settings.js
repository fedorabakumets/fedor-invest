window.settingsModule = {
    appState: {
        settings: {
            theme: 'light',
            fontSize: 16,
            fontFamily: "'Roboto', sans-serif",
            backgroundColor: '#f5f7fa',
            accentColor: '#1e90ff',
            textColor: '#2c3e50',
            animationLevel: 2,
            backgroundOpacity: 0.15,
            shadowIntensity: 20
        }
    },
    applySettings,
    initSettingsPanel,
    toggleSettingsPanel: function() {
        const panel = document.getElementById('settingsPanel');
        if (panel) {
            const isHidden = panel.classList.contains('hidden');
            panel.classList.toggle('hidden');
            panel.style.display = isHidden ? 'block' : 'none';
            console.log('Панель настроек:', isHidden ? 'показана' : 'скрыта');
        } else {
            console.error('Элемент #settingsPanel не найден в DOM');
        }
    },
    saveSettings: function() {
        localStorage.setItem('settings', JSON.stringify(window.settingsModule.appState.settings));
        applySettings();
        console.log('Настройки сохранены:', window.settingsModule.appState.settings);
    }
};

function applySettings() {
    const { settings } = window.settingsModule.appState;
    const root = document.documentElement;

    document.body.setAttribute('data-theme', settings.theme === 'auto' 
        ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') 
        : settings.theme);
    
    root.style.fontSize = `${settings.fontSize}px`;
    root.style.fontFamily = settings.fontFamily;
    root.style.setProperty('--background-color', settings.backgroundColor);
    root.style.setProperty('--accent-color', settings.accentColor);
    root.style.setProperty('--text-color', settings.textColor);
    root.style.setProperty('--background-opacity', settings.backgroundOpacity);
    root.style.setProperty('--shadow-intensity', `${settings.shadowIntensity}px`);
    
    console.log('Применены настройки:', settings);
}

function initSettingsPanel() {
    const panel = document.getElementById('settingsPanel');
    const closeBtn = document.getElementById('closeSettings');
    const saveBtn = document.getElementById('saveSettings');
    const settingsBtn = document.getElementById('settingsBtn');

    console.log('Инициализация настроек. Элементы:', { panel, closeBtn, saveBtn, settingsBtn });

    if (settingsBtn) {
        settingsBtn.addEventListener('click', window.settingsModule.toggleSettingsPanel);
    } else {
        console.error('Кнопка #settingsBtn не найдена в DOM');
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', window.settingsModule.toggleSettingsPanel);
    } else {
        console.error('Кнопка #closeSettings не найдена в DOM');
    }

    if (saveBtn) {
        saveBtn.addEventListener('click', window.settingsModule.saveSettings);
    } else {
        console.error('Кнопка #saveSettings не найдена в DOM');
    }

    if (!panel) {
        console.error('Панель #settingsPanel не найдена в DOM');
    }

    applySettings();
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM полностью загружен, запускаем initSettingsPanel');
    initSettingsPanel();
});