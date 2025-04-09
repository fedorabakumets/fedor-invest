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
        panel.classList.toggle('hidden');
    },
    saveSettings: function() {
        localStorage.setItem('settings', JSON.stringify(window.settingsModule.appState.settings));
        applySettings();
    }
};

function applySettings() {
    const { settings } = window.settingsModule.appState;
    const root = document.documentElement;

    document.body.setAttribute('data-theme', settings.theme === 'auto' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : settings.theme);
    root.style.fontSize = `${settings.fontSize}px`;
    root.style.fontFamily = settings.fontFamily;
    root.style.setProperty('--background-color', settings.backgroundColor);
    root.style.setProperty('--accent-color', settings.accentColor);
    root.style.setProperty('--text-color', settings.textColor);
    root.className = `performance-${settings.animationLevel}`;
    root.style.setProperty('--background-opacity', settings.backgroundOpacity);
    root.style.setProperty('--shadow-intensity', `${settings.shadowIntensity}px`);
}

function initSettingsPanel() {
    const panel = document.getElementById('settingsPanel');
    const closeBtn = document.getElementById('closeSettings');
    const saveBtn = document.getElementById('saveSettings');
    const settingsBtn = document.getElementById('settingsBtn');

    if (settingsBtn) settingsBtn.addEventListener('click', window.settingsModule.toggleSettingsPanel);
    if (closeBtn) closeBtn.addEventListener('click', window.settingsModule.toggleSettingsPanel);
    if (saveBtn) saveBtn.addEventListener('click', window.settingsModule.saveSettings);

    // Привязка событий к элементам настроек (если есть элементы управления)
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
            input.value = window.settingsModule.appState.settings[key];
            input.addEventListener('input', () => {
                window.settingsModule.appState.settings[key] = input.type === 'number' ? parseFloat(input.value) : input.value;
                applySettings();
                if (input.type === 'range' && input.nextElementSibling) {
                    input.nextElementSibling.textContent = input.value;
                }
            });
        }
    });

    applySettings();
}

document.addEventListener('DOMContentLoaded', initSettingsPanel);