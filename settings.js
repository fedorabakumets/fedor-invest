const appState = {
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
};

function applySettings() {
    const { settings } = appState;
    const root = document.documentElement;

    // Тема
    document.body.setAttribute('data-theme', settings.theme === 'auto' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : settings.theme);

    // Шрифты
    root.style.fontSize = `${settings.fontSize}px`;
    root.style.fontFamily = settings.fontFamily;

    // Цвета
    root.style.setProperty('--background-color', settings.backgroundColor);
    root.style.setProperty('--accent-color', settings.accentColor);
    root.style.setProperty('--text-color', settings.textColor);

    // Эффекты
    root.className = `performance-${settings.animationLevel}`;
    root.style.setProperty('--background-opacity', settings.backgroundOpacity);
    root.style.setProperty('--shadow-intensity', `${settings.shadowIntensity}px`);

    // Обновление предпросмотра
    const preview = document.getElementById('settingsPreview');
    if (preview) {
        preview.style.fontSize = `${settings.fontSize}px`;
        preview.style.fontFamily = settings.fontFamily;
        preview.style.color = settings.textColor;
        preview.style.backgroundColor = `${settings.backgroundColor}${Math.round(settings.backgroundOpacity * 255).toString(16).padStart(2, '0')}`;
        preview.style.boxShadow = `0 2px ${settings.shadowIntensity}px rgba(0, 0, 0, 0.1)`;
    }
}

function initSettingsPanel() {
    const panel = document.getElementById('settingsPanel');
    const closeBtn = document.getElementById('closeSettings');
    const saveBtn = document.getElementById('saveSettings');
    const settingsBtn = document.getElementById('settingsBtn');

    settingsBtn.addEventListener('click', () => panel.classList.remove('hidden'));
    closeBtn.addEventListener('click', () => panel.classList.add('hidden'));
    saveBtn.addEventListener('click', () => {
        panel.classList.add('hidden');
        applySettings();
    });

    // Привязка событий к элементам настроек
    const inputs = {
        themeSelect: 'theme',
        fontSize: 'fontSize',
        fontFamily: 'fontFamily',
        backgroundColor: 'backgroundColor',
        accentColor: 'accentColor',
        textColor: 'textColor',
        animationLevel: 'animationLevel',
        backgroundOpacity: 'backgroundOpacity',
        shadowIntensity: 'shadowIntensity'
    };

    Object.entries(inputs).forEach(([id, key]) => {
        const input = document.getElementById(id);
        if (input) {
            input.value = appState.settings[key];
            input.addEventListener('input', () => {
                appState.settings[key] = input.type === 'number' ? parseFloat(input.value) : input.value;
                applySettings();
                if (input.type === 'range') {
                    input.nextElementSibling.textContent = input.value;
                }
            });
        }
    });

    applySettings();
}

document.addEventListener('DOMContentLoaded', initSettingsPanel);
