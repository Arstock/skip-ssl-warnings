document.title = chrome.i18n.getMessage('extension_name');

// Verificación inicial de permisos
chrome.extension.isAllowedFileSchemeAccess().then(isAllowed => {
    document.body.setAttribute('data-file-scheme-access-allowed', isAllowed);
});

// Manejo de internacionalización
{
    const userLang = chrome.i18n.getMessage('@@ui_locale');
    const supportedLangs = ['en', 'ja', 'es']; // Agrega los idiomas que tengas
    const lang = supportedLangs.includes(userLang) ? userLang : 'en';
    
    document.querySelectorAll('[lang]').forEach(el => {
        el.style.display = el.getAttribute('lang') === lang ? 'block' : 'none';
    });
}

// Enlace a la página de extensiones
document.querySelectorAll('a[data-id="extension-page-link"]').forEach(a => {
    const url = `chrome://extensions/?id=${chrome.runtime.id}`;
    a.innerText = url;
    a.href = url;
    a.addEventListener('click', event => {
        event.preventDefault();
        chrome.tabs.update({ url });
    });
});

// Prueba de acceso a archivos locales (mejorado)
{
    const testButton = document.getElementById('test');
    testButton.addEventListener('click', () => {
        testButton.setAttribute('disabled', '');
        const resultElement = document.getElementById('test-result');
        
        chrome.extension.isAllowedFileSchemeAccess().then(isAllowed => {
            document.body.setAttribute('data-file-scheme-access-allowed', isAllowed);
            
            if (isAllowed) {
                // Prueba con un archivo simple (ajusta la ruta según tu proyecto)
                const testFile = chrome.runtime.getURL('README.md') || 'file:///README.md';
                chrome.windows.create({
                    url: testFile,
                }, created => {
                    resultElement.innerText = created ? '✅ OK' : '⚠️ No se pudo abrir (verifica la ruta)';
                });
            } else {
                resultElement.innerText = '❌ Permiso denegado - Habilita "Allow access to file URLs" en chrome://extensions/';
            }
        }).finally(() => {
            testButton.removeAttribute('disabled');
        });
    });
}
