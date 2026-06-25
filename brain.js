let MAX_SIZE_BYTES = 25 * 1024 * 1024; // Empieza en 25MB para usuarios gratuitos (Simulación)
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'text/plain'];
let intervaloTemporizador = null;
let archivoCargado = null;
let currentLang = 'es';

const DB_NAME = "GirafileDB"; 
const DB_VERSION = 1;
const STORE_NAME = "archivos";

// CLAVE FICTICIA PARA SIMULACIÓN DE PRUEBAS
const CLAVE_TEST_VALIDA = "GIRA-TEST-2026";

const i18n = {
    es: {
        themeDark: "Modo Oscuro 🌙",
        themeLight: "Modo Claro ☀️",
        langBtn: "English 🌐",
        title: "Giraffile",
        pageTitle: "Giraffile - La jirafa que protege tus archivos",
        hook: "¿Te preocupa dejar tus archivos rondando por internet?",
        desc1: "Olvídate de subir fotos o documentos a servidores donde pierdes el control. Con <strong>Giraffile</strong>, tú eres el dueño de tus datos de principio a fin.",
        desc2: "Esta herramienta te permite compartir archivos de manera privada mediante un enlace corto sin subirlos a internet. Todo el contenido se almacena de forma temporal en tu propio dispositivo de manera 100% segura.",
        useTitle: "¿Para qué puedes usar Giraffile?",
        use1: "<strong>Información sensible:</strong> Credenciales, datos financieros o documentos personales.",
        use2: "<strong>Colaboración rápida:</strong> Capturas de pantalla o notas técnicas temporales.",
        use3: "<strong>Privacidad total:</strong> Envío de archivos sin dejar rastro en servidores externos.",
        prepare: "Prepara tu archivo para enviar",
        dropLabel: "Arrastra tu archivo o haz clic abajo (Máx 25MB):",
        dropLabelPremium: "Arrastra tu archivo o haz clic abajo (Máx 500MB):",
        dropPrompt: "Arrastra un archivo aquí o haz clic para buscar",
        dropSelected: "Archivo seleccionado:",
        expiryLabel: "Tiempo de Caducidad:",
        opt15: "15 Minutos",
        opt30: "30 Minutos",
        opt1: "1 Minuto (Para Pruebas)",
        btnGenerate: "Generar enlace seguro",
        btnCopy: "Copiar Enlace 📋",
        btnCopied: "¡Enlace Copiado! ✓",
        btnDownload: "Descargar Completo 📥",
        textPreviewNotice: "📋 Mostrando una vista previa del archivo de texto. Para ver todo el contenido:",
        errNoFile: "Por favor, selecciona o arrastra un archivo primero.",
        errNotAllowed: "Archivo no permitido o excede el tamaño máximo de tu plan. Debe ser una imagen, PDF o texto plano.",
        successLink: "¡Enlace creado con éxito!",
        previewTitle: "Echa un vistazo a tu archivo",
        timeRemaining: "Tiempo restante de visualización:",
        fileLabel: "Archivo:",
        errNoExist: "El archivo no existe o ya ha sido eliminado por seguridad.",
        errExpired: "¡Este enlace ha caducado y el contenido fue destruido permanentemente!",
        errTimeOut: "¡El tiempo se ha agotado! El archivo ha sido completamente borrado de la memoria de forma segura.",
        footer: "Giraffile v0.4.2 | © 2026 jahp. Todos los derechos reservados."
    },
    en: {
        themeDark: "Dark Mode 🌙",
        themeLight: "Light Mode ☀️",
        langBtn: "Español 🌐",
        title: "Giraffile",
        pageTitle: "Giraffile - The giraffe that protects your files",
        hook: "Worried about leaving your files floating around the internet?",
        desc1: "Forget about uploading photos or documents to servers where you lose control. With <strong>Giraffile</strong>, you own your data from start to finish.",
        desc2: "This tool allows you to share files privately using a short link without uploading them to the internet. All content is temporarily stored on your own device in a 100% secure way.",
        useTitle: "What can you use Giraffile for?",
        use1: "<strong>Sensitive Information:</strong> Credentials, financial data, or personal documents.",
        use2: "<strong>Quick Collaboration:</strong> Screenshots or temporary technical notes.",
        use3: "<strong>Total Privacy:</strong> Send files without leaving a trace on external servers.",
        prepare: "Prepare your file to send",
        dropLabel: "Drag your file or click below (Max 25MB):",
        dropLabelPremium: "Drag your file or click below (Max 500MB):",
        dropPrompt: "Drag a file here or click to browse",
        dropSelected: "Selected file:",
        expiryLabel: "Expiration Time:",
        opt15: "15 Minutes",
        opt30: "30 Minutes",
        opt1: "1 Minute (For Testing)",
        btnGenerate: "Generate secure link",
        btnCopy: "Copy Link 📋",
        btnCopied: "Link Copied! ✓",
        btnDownload: "Download Full File 📥",
        textPreviewNotice: "📋 Showing a preview of the text file. To see the full content:",
        errNoFile: "Please select or drag a file first.",
        errNotAllowed: "File not allowed or exceeds plan limit. It must be an image, PDF, or plain text.",
        successLink: "Link created successfully!",
        previewTitle: "Take a look at your file",
        timeRemaining: "Remaining viewing time:",
        fileLabel: "File:",
        errNoExist: "The file does not exist or has already been deleted for security.",
        errExpired: "This link has expired and the content was permanently destroyed!",
        errTimeOut: "Time's up! The file has been completely and securely erased from memory.",
        footer: "Giraffile v0.4.2 | © 2026 jahp. All rights reserved."
    }
};

// Configuración de Drag and Drop
document.addEventListener("DOMContentLoaded", () => {
    const dropZone = document.getElementById('dropZone');
    if (dropZone) {
        ['dragover', 'dragleave', 'drop'].forEach(evtName => {
            dropZone.addEventListener(evtName, e => e.preventDefault());
        });
        dropZone.addEventListener('dragover', () => dropZone.classList.add('drop-zone--over'));
        dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drop-zone--over'));
        dropZone.addEventListener('drop', (e) => {
            dropZone.classList.remove('drop-zone--over');
            if(e.dataTransfer.files.length) manejarSeleccionArchivo(e.dataTransfer);
        });
    }
});

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const targetTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', targetTheme);
    localStorage.setItem('girafile-theme', targetTheme);
    document.getElementById('themeBtn').innerText = targetTheme === 'dark' ? i18n[currentLang].themeLight : i18n[currentLang].themeDark;
}

function toggleLanguage() {
    currentLang = currentLang === 'es' ? 'en' : 'es';
    localStorage.setItem('girafile-lang', currentLang);
    document.documentElement.lang = currentLang;
    aplicarTraduccion();
}

function aplicarTraduccion() {
    const t = i18n[currentLang];
    document.title = t.pageTitle; 
    document.getElementById('langBtn').innerText = t.langBtn;
    const currentTheme = document.documentElement.getAttribute('data-theme');
    document.getElementById('themeBtn').innerText = currentTheme === 'dark' ? t.themeLight : t.themeDark;

    document.getElementById('infoBoxContainer').innerHTML = `
        <div class="brand-container">
            <h2>${t.title}</h2>
            <img src="giraffe.png" alt="Mascota" class="mascot-img">
        </div>
        <p class="highlight-yellow"><strong>${t.hook}</strong></p>
        <p>${t.desc1}</p>
        <p>${t.desc2}</p>
        <p><strong>${t.useTitle}</strong></p>
        <ul style="padding-left: 20px;">
            <li>${t.use1}</li>
            <li>${t.use2}</li>
            <li>${t.use3}</li>
        </ul>
    `;

    document.getElementById('lblPrepare').innerText = t.prepare;
    
    // Cambiar la etiqueta de tamaño según el estado de la suscripción
    const esPremium = localStorage.getItem('giraffile_premium') === 'true';
    document.getElementById('lblDropZone').innerText = esPremium ? t.dropLabelPremium : t.dropLabel;
    
    document.getElementById('lblExpiry').innerText = t.expiryLabel;
    document.getElementById('opt15m').innerText = t.opt15;
    document.getElementById('opt30m').innerText = t.opt30;
    document.getElementById('opt1m').innerText = t.opt1;
    document.getElementById('btnGenerar').innerText = t.btnGenerate;
    document.getElementById('lblPreviewTitle').innerText = t.previewTitle;
    document.getElementById('lblTimeRemaining').innerText = t.timeRemaining;
    document.getElementById('footerText').innerText = t.footer;

    if (!archivoCargado) {
        document.getElementById('dropZonePrompt').innerText = t.dropPrompt;
    } else {
        const tamanoMB = (archivoCargado.size / (1024 * 1024)).toFixed(2);
        document.getElementById('dropZonePrompt').innerHTML = `<strong>${t.dropSelected}</strong> ${archivoCargado.name} (${tamanoMB} MB)`;
    }
}

function abrirDB(callback) {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = function(e) {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME, { keyPath: "id" });
    };
    request.onsuccess = function(e) { callback(e.target.result); };
}

window.onload = function() {
    currentLang = localStorage.getItem('girafile-lang') || 'es';
    document.documentElement.lang = currentLang;
    const savedTheme = localStorage.getItem('girafile-theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Inicializar límites simulados basados en almacenamiento local de pruebas
    ajustarInterfazPremium();
    aplicarTraduccion();
    verificarLinkCompartido();
};

function manejarSeleccionArchivo(inputOrData) {
    const file = inputOrData.files[0];
    const errorMsg = document.getElementById('errorMsg');
    const prompt = document.getElementById('dropZonePrompt');
    const t = i18n[currentLang];
    
    if (file && (!ALLOWED_TYPES.includes(file.type) || file.size > MAX_SIZE_BYTES)) {
        if(document.getElementById('fileInput')) document.getElementById('fileInput').value = "";
        archivoCargado = null;
        prompt.innerText = t.dropPrompt + " 🦒";
        errorMsg.innerText = t.errNotAllowed;
        return;
    }
    errorMsg.innerText = "";
    if(file) {
        archivoCargado = file;
        const tamanoMB = (file.size / (1024 * 1024)).toFixed(2);
        prompt.innerHTML = `<strong>${t.dropSelected}</strong> ${file.name} (${tamanoMB} MB)`;
    }
}

function generarLink() {
    const t = i18n[currentLang];
    if (!archivoCargado) {
        document.getElementById('errorMsg').innerText = t.errNoFile;
        return;
    }

    const idUnico = "file_" + Math.random().toString(36).substring(2, 11);
    const duracion = parseInt(document.getElementById('expiry').value);
    
    // Bloqueo simulado si intentan usar los 30 minutos sin ser Premium
    const esPremium = localStorage.getItem('giraffile_premium') === 'true';
    if (duracion === 1800 && !esPremium) {
        alert("La caducidad de 30 minutos es una función Premium en pruebas. Usa la clave GIRA-TEST-2026.");
        return;
    }
    
    const payload = {
        id: idUnico,
        t: Math.floor(Date.now() / 1000),
        d: duracion,
        name: archivoCargado.name,
        type: archivoCargado.type,
        size: archivoCargado.size,
        blob: archivoCargado 
    };
    
    abrirDB(function(db) {
        const transaction = db.transaction([STORE_NAME], "readwrite");
        transaction.objectStore(STORE_NAME).put(payload);
        
        transaction.oncomplete = function() {
            const origen = window.location.origin === "null" ? "file://" : window.location.origin;
            const link = origen + window.location.pathname + "#" + idUnico;
            
            document.getElementById('output').innerHTML = `
                <p style="color: green; font-weight: bold;">${t.successLink}</p>
                <textarea id="copyTarget" readonly onclick="this.select()">${link}</textarea>
                <button class="btn" id="btnCopiar" onclick="copiarAlPortapapeles()">${t.btnCopy}</button>
            `;
        };
    });
}

function copiarAlPortapapeles() {
    const t = i18n[currentLang];
    const copyText = document.getElementById("copyTarget");
    copyText.select();
    navigator.clipboard.writeText(copyText.value);
    
    const btn = document.getElementById("btnCopiar");
    btn.innerText = t.btnCopied;
    btn.style.background = "#28a745";
    btn.style.color = "#fff";
    setTimeout(() => {
        btn.innerText = t.btnCopy;
        btn.style.background = "var(--box-bg)";
        btn.style.color = "var(--text-color)";
    }, 2000);
}

function verificarLinkCompartido() {
    const hash = window.location.hash.substring(1);
    if (!hash || !hash.startsWith("file_")) return;

    const mainWrapper = document.getElementById('main-wrapper');
    const previewDiv = document.getElementById('preview');
    const contentDiv = document.getElementById('fileContent');
    const metaDiv = document.getElementById('fileMeta');
    const t = i18n[currentLang];

    // CORRECCIÓN DE ORDEN DE RENDERIZADO: Movemos el div al inicio físicamente
    if (mainWrapper && previewDiv) {
        mainWrapper.prepend(previewDiv);
    }

    abrirDB(function(db) {
        const transaction = db.transaction([STORE_NAME], "readonly");
        const request = transaction.objectStore(STORE_NAME).get(hash);

        request.onsuccess = function(e) {
            const data = e.target.result;

            if (!data) {
                previewDiv.style.display = "block";
                contentDiv.innerHTML = `<p class='error'>${t.errNoExist}</p>`;
                return;
            }

            const ahoraInicial = Math.floor(Date.now() / 1000);
            if (ahoraInicial > (data.t + data.d)) {
                eliminarArchivoDB(hash);
                previewDiv.style.display = "block";
                contentDiv.innerHTML = `<p class='error'>${t.errExpired}</p>`;
                return;
            }

            previewDiv.style.display = "block";
            metaDiv.innerHTML = `<strong>${t.fileLabel}</strong> ${data.name} (${(data.size / (1024*1024)).toFixed(2)} MB)`;
            
            const timerGroup = document.getElementById('timerGroup');
            const lifeBar = document.getElementById('lifeBar');
            const timeString = document.getElementById('timeString');
            timerGroup.style.display = "block";

            if (intervaloTemporizador) clearInterval(intervaloTemporizador);
            
            intervaloTemporizador = setInterval(function() {
                const ahora = Math.floor(Date.now() / 1000);
                const tiempoRestante = data.d - (ahora - data.t);

                if (tiempoRestante <= 0) {
                    clearInterval(intervaloTemporizador);
                    eliminarArchivoDB(hash);
                    timerGroup.style.display = "none";
                    metaDiv.style.display = "none";
                    contentDiv.innerHTML = `<p class='error'>${t.errTimeOut}</p>`;
                    return;
                }

                lifeBar.value = (tiempoRestante / data.d) * 100;
                const minutes = Math.floor(tiempoRestante / 60);
                const segundos = tiempoRestante % 60;
                timeString.innerText = `${minutes.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
            }, 1000);

            const urlObjeto = URL.createObjectURL(data.blob);

            if (data.type.startsWith("image/")) {
                contentDiv.innerHTML = `<img src="${urlObjeto}" style="max-width:100%; height:auto; border-radius: 4px;">`;
            } else if (data.type === "application/pdf") {
                contentDiv.innerHTML = `
                    <embed src="${urlObjeto}" type="application/pdf" width="100%" height="450px" style="border-radius: 4px; margin-bottom:10px;">
                    <a href="${urlObjeto}" download="${data.name}" class="btn btn-primary" style="text-decoration:none; text-align:center; display:block;">${t.btnDownload}</a>
                `;
            } else {
                const bytesVistaPrevia = 50 * 1024;
                const fragmentoSeguro = data.blob.slice(0, bytesVistaPrevia);
                const lectorTexto = new FileReader();
                
                lectorTexto.onload = function(evt) {
                    let textoFormateado = evt.target.result;
                    let descargaAdicional = '';
                    
                    if (data.size > bytesVistaPrevia) {
                        textoFormateado += "\n\n[... Archivo truncado por rendimiento ...]";
                        descargaAdicional = `<p style="font-size:0.9em; margin: 15px 0 5px 0; color:var(--footer-color); text-align:center;">${t.textPreviewNotice}</p>`;
                    }
                    
                    contentDiv.innerHTML = `
                        <pre style="white-space: pre-wrap; background: var(--timer-bg); padding: 10px; border-radius: 4px; max-height: 300px; overflow-y: auto; font-family: monospace; font-size: 0.9em; text-align:left;">${textoFormateado}</pre>
                        ${descargaAdicional}
                        <a href="${urlObjeto}" download="${data.name}" class="btn btn-primary" style="text-decoration: none; text-align:center; display:block; margin-top:5px;">${t.btnDownload}</a>
                    `;
                };
                lectorTexto.readAsText(fragmentoSeguro);
            }
        };
    });
}

function eliminarArchivoDB(id) {
    abrirDB(function(db) {
        db.transaction([STORE_NAME], "readwrite").objectStore(STORE_NAME).delete(id);
    });
}

// ==========================================
// FUNCIONES SIMULADAS DE LICENCIA PREMIUM
// ==========================================

function activarLicenciaGumroad() {
    const key = document.getElementById('licenseKeyInput').value.trim();
    const btn = document.getElementById('btnActivar');
    
    if (!key) {
        alert("Por favor, introduce tu clave de suscripción.");
        return;
    }

    btn.innerText = "Verificando...";
    btn.disabled = true;

    // Simulación de respuesta de red de 1 segundo
    setTimeout(() => {
        if (key === CLAVE_TEST_VALIDA) {
            localStorage.setItem('giraffile_premium', 'true');
            localStorage.setItem('giraffile_license', key);
            alert("¡Suscripción de prueba verificada con éxito! Límites extendidos a 500MB.");
            ajustarInterfazPremium();
            aplicarTraduccion(); // Recarga las etiquetas de texto
        } else {
            alert("Clave inválida. Para pruebas locales usa: GIRA-TEST-2026");
            btn.innerText = "Activar Premium";
            btn.disabled = false;
        }
    }, 1000);
}

function ajustarInterfazPremium() {
    const esPremium = localStorage.getItem('giraffile_premium') === 'true';
    if (esPremium) {
        MAX_SIZE_BYTES = 500 * 1024 * 1024; // Desbloquea 500MB
        const panel = document.getElementById('premium-panel');
        if (panel) {
            panel.innerHTML = "<span style='color: #2ecc71; font-weight: bold;'>Suscripción Premium Activa 🦒✨</span>";
        }
    } else {
        MAX_SIZE_BYTES = 25 * 1024 * 1024; // Mantiene el candado de 25MB
    }
}
